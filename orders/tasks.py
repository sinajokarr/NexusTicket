from celery import shared_task
from django.db import transaction
from django.db.models import F
from .models import Order

@shared_task
def expire_order_task(order_id):
    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order_id, status='pending')
            
            order.status = 'canceled'
            order.save()
            
            for item in order.items.all():
                ticket = item.ticket_class
                ticket.sold = F('sold') - item.quantity
                ticket.save()
                
            if order.coupon:
                order.coupon.used_count = F('used_count') - 1
                order.coupon.save()
                
            return f"Order {order_id} expired and canceled."
            
    except Order.DoesNotExist:
        return f"Order {order_id} was already paid or canceled."