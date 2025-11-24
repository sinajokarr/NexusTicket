from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

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