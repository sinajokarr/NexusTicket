from django.contrib import admin
from .models import Order, OrderItem, Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'type', 'value', 'is_active', 'valid_from', 'valid_to']
    search_fields = ['code']

admin.site.register(Order)
admin.site.register(OrderItem)