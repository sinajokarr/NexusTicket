from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class Artist(models.Model):
    name = models.CharField(_('Artist Name'), max_length=255)
    slug = models.SlugField(_('Slug'), unique=True, allow_unicode=True)
    bio = models.TextField(_('Biography'), blank=True)
    image = models.ImageField(_('Artist Image'), upload_to='artists/', blank=True, null=True)
    
    class Meta:
        verbose_name = _('Artist')
        verbose_name_plural = _('Artists')
        indexes = [
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(_('Name'), max_length=100, db_index=True)
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
        on_delete=models.PROTECT,  
        related_name='organized_events'
    )
    categories = models.ManyToManyField(
        Category,
        related_name='events',
        blank=True
    )
    artists = models.ManyToManyField(
        Artist,
        related_name='events',
        blank=True
    )
    title = models.CharField(_('Title'), max_length=255, db_index=True)
    slug = models.SlugField(_('Slug'), unique=True, allow_unicode=True)
    description = models.TextField(_('Description'))
    
    cover_image = models.ImageField(
        _('Cover Image'), 
        upload_to='events/covers/', 
        blank=True, 
        null=True
    )
    
    date = models.DateTimeField(_('Date & Time'), db_index=True)
    location = models.CharField(_('Location Name'), max_length=255, db_index=True)
    address = models.TextField(_('Full Address'), blank=True)
    
    is_active = models.BooleanField(default=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TicketClass(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_classes')
    title = models.CharField(_('Title'), max_length=50) 
    description = models.CharField(_('Description'), max_length=255, blank=True)
    price = models.DecimalField(
        _('Price'), 
        max_digits=12, 
        decimal_places=0, 
        validators=[MinValueValidator(0)])
    capacity = models.PositiveIntegerField(_('Capacity'), validators=[MinValueValidator(1)]) 
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
        return max(0, self.capacity - self.sold)
    


class Review(models.Model):
    event = models.ForeignKey(
        'events.Event', 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    

    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    comment = models.TextField()
    
    is_approved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.event.title} - {self.rating}"