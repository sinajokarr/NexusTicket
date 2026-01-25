from django.db import models
from django.conf import settings
from orders.models import Order
import uuid

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),    
        ('success', 'Success'),   
        ('failed', 'Failed'),     
    )  

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    authority_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.authority_id} - {self.status}"