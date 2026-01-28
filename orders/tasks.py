from celery import shared_task
from .models import Order

@shared_task
def expire_order_task(order_id):
    try:
        order = Order.objects.get(id=order_id, status='pending')
        
        order.status = 'canceled'
        order.save()
        
        for item in order.items.all():
            ticket = item.ticket_class
            ticket.quantity += item.quantity
            ticket.save()
            
        return f"Order {order_id} expired and canceled."
        
    except Order.DoesNotExist:
        return f"Order {order_id} was already paid or canceled."