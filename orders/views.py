from django.db import transaction
from django.shortcuts import get_object_or_404
from events.models import TicketClass
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Coupon, Order
from .serializers import OrderSerializer, OrderCreateSerializer
from .tasks import expire_order_task


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """Expose immutable order records and explicit, inventory-safe actions."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.none()
        return Order.objects.filter(user=self.request.user).prefetch_related('items__ticket_class')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        with transaction.atomic():
            # Fetch and inspect state only after acquiring the lock. This keeps
            # cancellation safe against another cancel, expiry task, or payment.
            order = get_object_or_404(
                Order.objects.select_for_update(),
                pk=pk,
                user=request.user,
            )

            if order.status == 'canceled':
                return Response(
                    {"detail": "This order is already canceled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if order.status == 'paid':
                return Response(
                    {"detail": "Cannot cancel a paid order."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if order.status != 'pending':
                return Response(
                    {"detail": "Only pending orders can be canceled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            quantities_by_ticket = {}
            for item in order.items.select_related('ticket_class'):
                quantities_by_ticket[item.ticket_class_id] = (
                    quantities_by_ticket.get(item.ticket_class_id, 0) + item.quantity
                )

            tickets = {
                ticket.id: ticket
                for ticket in TicketClass.objects.select_for_update()
                .filter(id__in=sorted(quantities_by_ticket))
                .order_by('id')
            }
            if len(tickets) != len(quantities_by_ticket):
                raise ValidationError({"detail": "Order inventory is incomplete and cannot be released safely."})

            for ticket_id, quantity in quantities_by_ticket.items():
                if tickets[ticket_id].sold < quantity:
                    raise ValidationError({"detail": "Order inventory is inconsistent and cannot be released safely."})

            coupon = None
            if order.coupon_id:
                coupon = get_object_or_404(Coupon.objects.select_for_update(), pk=order.coupon_id)
                if coupon.used_count < 1:
                    raise ValidationError({"detail": "Coupon usage is inconsistent and cannot be released safely."})

            for ticket_id, quantity in quantities_by_ticket.items():
                ticket = tickets[ticket_id]
                ticket.sold -= quantity
                ticket.save(update_fields=['sold', 'updated_at'])

            if coupon:
                coupon.used_count -= 1
                coupon.save(update_fields=['used_count'])

            order.status = 'canceled'
            order.save(update_fields=['status', 'updated_at'])

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        order = serializer.save()
        transaction.on_commit(
            lambda order_id=order.id: expire_order_task.apply_async((order_id,), countdown=900)
        )
