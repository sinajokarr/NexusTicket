from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.db.models import F
from .models import Order
from events.models import TicketClass
from .serializers import OrderSerializer, OrderCreateSerializer
from .tasks import expire_order_task


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status == 'canceled':
            return Response(
                {"detail": "This order is already canceled."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            for item in order.items.all():
                ticket = item.ticket_class
                ticket.quantity = F('quantity') + item.quantity
                ticket.save()

            if order.coupon:
                order.coupon.used_count = F('used_count') - 1
                order.coupon.save()

            order.status = 'canceled'
            order.save()

            order.refresh_from_db()
            
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
    
    def perform_create(self, serializer):
        with transaction.atomic():
            items_data = serializer.validated_data.get('items', [])
            
            for item in items_data:
                ticket_obj = item.get('ticket_class') or item.get('ticket')
                request_qty = item['quantity']
                
                locked_ticket = TicketClass.objects.select_for_update().get(id=ticket_obj.id)
                
                if locked_ticket.quantity < request_qty:
                    raise ValidationError(f"Sorry, ticket '{locked_ticket.title}' is currently out of stock.")
                
                locked_ticket.quantity -= request_qty
                locked_ticket.save()

            order = serializer.save(user=self.request.user)
            
            expire_order_task.apply_async((order.id,), countdown=900)