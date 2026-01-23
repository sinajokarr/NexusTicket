from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from events.models import TicketClass

class Coupon(models.Model):
    TYPE_CHOICES = (
        ('percentage', _('Percentage')),
        ('fixed', _('Fixed Amount')),
    )

    code = models.CharField(_('Coupon Code'), max_length=50, unique=True)
    type = models.CharField(_('Type'), max_length=15, choices=TYPE_CHOICES, default='percentage')
    value = models.DecimalField(_('Value'), max_digits=12, decimal_places=0)
    
    max_discount_limit = models.DecimalField(_('Max Limit'), max_digits=12, decimal_places=0, null=True, blank=True)
    total_capacity = models.PositiveIntegerField(_('Total Capacity'), default=100)   
    used_count = models.PositiveIntegerField(_('Used Count'), default=0)  
    
    valid_ticket_class = models.ForeignKey(
        'events.TicketClass', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='coupons'
    )

    is_active = models.BooleanField(_('Is Active'), default=True)
    valid_from = models.DateTimeField(_('Valid From'))
    valid_to = models.DateTimeField(_('Valid To'))

    def __str__(self):
        return self.code

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
    
    coupon = models.ForeignKey(
        Coupon, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='orders'
    )

    total_price = models.DecimalField(
        _('Total Price'), 
        max_digits=12, 
        decimal_places=0, 
        default=0
    )

    discount_amount = models.DecimalField(
        _('Discount Amount'), 
        max_digits=12, 
        decimal_places=0, 
        default=0
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

    @property
    def final_payable_amount(self):
        if self.total_price == 0 and self.items.exists():
             calculated_total = sum(item.price * item.quantity for item in self.items.all())
             return max(0, calculated_total - self.discount_amount)
        return max(0, self.total_price - self.discount_amount)
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
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