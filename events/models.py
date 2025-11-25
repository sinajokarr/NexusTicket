from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class Category(models.Model):
    name = models.CharField(_('Name'), max_length=100)
    slug = models.SlugField(_('Slug'), unique=True, allow_unicode=True)
    icon = models.ImageField(_('Icon'), upload_to='categories/', blank=True, null=True)

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')

    def __str__(self):
        return self.name


class Event(models.Model):
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='events'
    )
    categories = models.ManyToManyField(
        Category,
        related_name='events',
        blank=True
    )
    title = models.CharField(_('Title'), max_length=255)
    slug = models.SlugField(_('Slug'), unique=True, allow_unicode=True)
    description = models.TextField(_('Description'))
    
    cover_image = models.ImageField(
        _('Cover Image'), 
        upload_to='events/covers/', 
        blank=True, 
        null=True
    )
    
    date = models.DateTimeField(_('Date & Time'))
    location = models.CharField(_('Location Name'), max_length=255)
    address = models.TextField(_('Full Address'), blank=True)
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return self.title
    
    
class TicketClass(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='ticket_classes'
    )
    title = models.CharField(_('Title'), max_length=50) 
    description = models.CharField(_('Description'), max_length=255, blank=True)
    price = models.DecimalField(
        _('Price'), 
        max_digits=12, 
        decimal_places=0, 
        validators=[MinValueValidator(0)])
    capacity = models.PositiveIntegerField(_('Capacity')) 
    sold = models.PositiveIntegerField(_('Sold Count'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Ticket Class')
        verbose_name_plural = _('Ticket Classes')

    def __str__(self):
        return f"{self.event.title} - {self.title}"

    
    @property
    def is_sold_out(self):
        return self.sold >= self.capacity

    @property
    def remaining_capacity(self):
        return self.capacity - self.sold