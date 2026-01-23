from rest_framework import serializers
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from .models import Order, OrderItem, Coupon
from events.models import TicketClass


class OrderItemSerializer(serializers.ModelSerializer):
    ticket_title = serializers.CharField(source='ticket_class.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'ticket_title', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    final_amount = serializers.DecimalField(source='final_payable_amount', max_digits=10, decimal_places=2, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user_email', 'items', 'status', 
            'total_price', 'final_amount', 'discount_amount', 
            'created_at'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    ticket_class_id = serializers.IntegerField(write_only=True)
    quantity = serializers.IntegerField(min_value=1, write_only=True)
    coupon_code = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = Order
        fields = ['ticket_class_id', 'quantity', 'coupon_code']
        
    def to_representation(self, instance):
        return OrderSerializer(instance).data

    def validate(self, data):
        try:
            ticket = TicketClass.objects.get(id=data['ticket_class_id'])
        except TicketClass.DoesNotExist:
            raise serializers.ValidationError({"ticket_class_id": "Ticket class not found."})

        if ticket.remaining_capacity < data['quantity']:
            raise serializers.ValidationError({"quantity": "Not enough tickets available."})

        coupon_code = data.get('coupon_code')
        
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                now = timezone.now()
                
                if now < coupon.valid_from or now > coupon.valid_to:
                    raise serializers.ValidationError({"coupon_code": "This coupon has expired."})
                
                if coupon.used_count >= coupon.total_capacity:
                    raise serializers.ValidationError({"coupon_code": "Coupon usage limit reached."})

                if coupon.valid_ticket_class and coupon.valid_ticket_class != ticket:
                    raise serializers.ValidationError({"coupon_code": "Coupon not valid for this ticket class."})
                    
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        ticket_id = validated_data['ticket_class_id']
        quantity = validated_data['quantity']
        coupon_code = validated_data.get('coupon_code')

        with transaction.atomic():
            try:
                ticket = TicketClass.objects.select_for_update().get(id=ticket_id)
            except TicketClass.DoesNotExist:
                raise serializers.ValidationError("Ticket not found.")

            if ticket.remaining_capacity < quantity:
                raise serializers.ValidationError("Tickets sold out just now! Please try again.")

            coupon = None
            discount_amount = 0
            original_price = ticket.price * quantity

            if coupon_code:
                try:
                    coupon = Coupon.objects.select_for_update().get(code=coupon_code, is_active=True)
                    
                    if coupon.used_count >= coupon.total_capacity:
                        raise serializers.ValidationError("Coupon usage limit reached just now.")

                    if coupon.type == 'percentage':
                        calculated = (original_price * coupon.value) / 100
                        if coupon.max_discount_limit:
                            discount_amount = min(calculated, coupon.max_discount_limit)
                        else:
                            discount_amount = calculated
                    elif coupon.type == 'fixed':
                        discount_amount = coupon.value
                    
                    discount_amount = min(discount_amount, original_price)

                    coupon.used_count = F('used_count') + 1
                    coupon.save()

                except Coupon.DoesNotExist:
                    pass     
            
            order = Order.objects.create(
                user=user, 
                status='pending',
                total_price=original_price,
                coupon=coupon,
                discount_amount=discount_amount
            )

            OrderItem.objects.create(
                order=order,
                ticket_class=ticket,
                quantity=quantity,
                price=ticket.price
            )

            ticket.sold = F('sold') + quantity
            ticket.save()
            
            ticket.refresh_from_db()
            
            return order