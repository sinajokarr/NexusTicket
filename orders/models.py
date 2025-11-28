from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from events.models import TicketClass

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('canceled', _('Canceled')),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    
    status = models.CharField(
        _('Status'),
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')

    def __str__(self):
        return f"Order #{self.id} - {self.user.email} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    ticket_class = models.ForeignKey(
        TicketClass,
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    
    quantity = models.PositiveIntegerField(_('Quantity'), default=1)
    
    price = models.DecimalField(_('Unit Price'), max_digits=12, decimal_places=0)

    class Meta:
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')

    def __str__(self):
        return f"{self.quantity}x {self.ticket_class.title} (Order {self.order.id})"