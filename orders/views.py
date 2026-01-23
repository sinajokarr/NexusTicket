from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import F
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer

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
                item.ticket_class.sold = F('sold') - item.quantity
                item.ticket_class.save()

            if order.coupon:
                order.coupon.used_count = F('used_count') - 1
                order.coupon.save()

            order.status = 'canceled'
            order.save()

            order.refresh_from_db()
            
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)