from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem, Coupon
from events.models import Event, TicketClass

class OrderItemSerializer(serializers.ModelSerializer):
    ticket_title = serializers.CharField(source='ticket_class.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'ticket_title', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    final_amount = serializers.DecimalField(source='final_payable_amount', max_digits=12, decimal_places=0, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user_email', 'items', 'status', 
            'total_price', 'final_amount', 'discount_amount', 
            'created_at'
        ]
        read_only_fields = fields

class OrderLineInputSerializer(serializers.Serializer):
    ticket_class_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """Create a reservation from either a legacy line or a multi-line cart.

    The legacy ``ticket_class_id`` / ``quantity`` pair remains supported for
    existing clients. New clients should send ``items`` so all capacity is
    reserved atomically in one order.
    """

    ticket_class_id = serializers.IntegerField(write_only=True, required=False)
    quantity = serializers.IntegerField(min_value=1, write_only=True, required=False)
    items = OrderLineInputSerializer(many=True, write_only=True, required=False)
    coupon_code = serializers.CharField(required=False, write_only=True, allow_blank=True)

    def to_representation(self, instance):
        return OrderSerializer(instance).data

    def validate(self, data):
        line_items = self._normalise_items(data)
        ticket_map = self._get_ticket_map(line_items)

        for line_item in line_items:
            self._validate_ticket_for_sale(
                ticket_map[line_item['ticket_class_id']],
                line_item['quantity'],
            )

        coupon_code = data.get('coupon_code', '').strip()
        data['coupon_code'] = coupon_code
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})
            self._validate_coupon(coupon, ticket_map, line_items)

        data.pop('ticket_class_id', None)
        data.pop('quantity', None)
        data['items'] = line_items
        return data

    @staticmethod
    def _normalise_items(data):
        has_cart_items = 'items' in data
        has_legacy_values = 'ticket_class_id' in data or 'quantity' in data

        if has_cart_items and has_legacy_values:
            raise serializers.ValidationError(
                {'items': 'Send either items or ticket_class_id and quantity, not both.'}
            )

        if not has_cart_items:
            if 'ticket_class_id' not in data or 'quantity' not in data:
                raise serializers.ValidationError(
                    {'items': 'Provide items or both ticket_class_id and quantity.'}
                )
            line_items = [{
                'ticket_class_id': data['ticket_class_id'],
                'quantity': data['quantity'],
            }]
        else:
            line_items = data['items']
            if not line_items:
                raise serializers.ValidationError({'items': 'At least one ticket class is required.'})

        seen_ticket_ids = set()
        for line_item in line_items:
            ticket_id = line_item['ticket_class_id']
            if ticket_id in seen_ticket_ids:
                raise serializers.ValidationError(
                    {'items': 'Each ticket class can only appear once in an order.'}
                )
            seen_ticket_ids.add(ticket_id)

        return line_items

    @staticmethod
    def _get_ticket_map(line_items):
        ticket_ids = [line_item['ticket_class_id'] for line_item in line_items]
        tickets = TicketClass.objects.select_related('event').filter(id__in=ticket_ids)
        ticket_map = {ticket.id: ticket for ticket in tickets}
        if len(ticket_map) != len(ticket_ids):
            raise serializers.ValidationError({'items': 'One or more ticket classes were not found.'})
        return ticket_map

    @staticmethod
    def _validate_ticket_for_sale(ticket, quantity):
        event = ticket.event
        if not event.is_active:
            raise serializers.ValidationError(
                {"items": "Ticket sales are not available for this event."}
            )

        if event.date <= timezone.now():
            raise serializers.ValidationError(
                {"items": "Ticket sales have ended for this event."}
            )

        if ticket.remaining_capacity < quantity:
            raise serializers.ValidationError({"items": "Not enough tickets available."})

    @staticmethod
    def _eligible_subtotal(coupon, ticket_map, line_items):
        eligible_items = line_items
        if coupon.valid_ticket_class_id:
            eligible_items = [
                line_item
                for line_item in line_items
                if line_item['ticket_class_id'] == coupon.valid_ticket_class_id
            ]
            if not eligible_items:
                raise serializers.ValidationError(
                    {"coupon_code": "Coupon not valid for the selected ticket classes."}
                )

        return sum(
            ticket_map[line_item['ticket_class_id']].price * line_item['quantity']
            for line_item in eligible_items
        )

    @classmethod
    def _validate_coupon(cls, coupon, ticket_map, line_items):
        now = timezone.now()
        if not coupon.is_active or now < coupon.valid_from or now > coupon.valid_to:
            raise serializers.ValidationError({"coupon_code": "This coupon is not currently valid."})

        if coupon.value <= 0:
            raise serializers.ValidationError({"coupon_code": "This coupon is invalid."})

        if coupon.used_count >= coupon.total_capacity:
            raise serializers.ValidationError({"coupon_code": "Coupon usage limit reached."})

        cls._eligible_subtotal(coupon, ticket_map, line_items)

    @staticmethod
    def _discount_for_coupon(coupon, eligible_subtotal):
        if coupon.discount_type == 'percentage':
            discount = (eligible_subtotal * coupon.value) / 100
            if coupon.max_discount_limit is not None:
                discount = min(discount, coupon.max_discount_limit)
        elif coupon.discount_type == 'fixed':
            discount = coupon.value
        else:
            discount = 0

        return max(0, min(discount, eligible_subtotal))

    def create(self, validated_data):
        user = self.context['request'].user
        line_items = validated_data['items']
        coupon_code = validated_data.get('coupon_code')
        ticket_ids = sorted(line_item['ticket_class_id'] for line_item in line_items)

        with transaction.atomic():
            locked_tickets = list(
                TicketClass.objects.select_for_update()
                .select_related('event')
                .filter(id__in=ticket_ids)
                .order_by('id')
            )
            ticket_map = {ticket.id: ticket for ticket in locked_tickets}
            if len(ticket_map) != len(ticket_ids):
                raise serializers.ValidationError({'items': 'One or more ticket classes were not found.'})

            locked_events = {
                event.id: event
                for event in Event.objects.select_for_update()
                .filter(id__in=sorted({ticket.event_id for ticket in locked_tickets}))
                .order_by('id')
            }
            for ticket in locked_tickets:
                ticket.event = locked_events[ticket.event_id]

            for line_item in line_items:
                self._validate_ticket_for_sale(
                    ticket_map[line_item['ticket_class_id']],
                    line_item['quantity'],
                )

            total_price = sum(
                ticket_map[line_item['ticket_class_id']].price * line_item['quantity']
                for line_item in line_items
            )

            coupon = None
            discount_amount = 0
            if coupon_code:
                try:
                    coupon = Coupon.objects.select_for_update().get(code=coupon_code)
                except Coupon.DoesNotExist:
                    raise serializers.ValidationError({"coupon_code": "This coupon is no longer available."})

                self._validate_coupon(coupon, ticket_map, line_items)
                eligible_subtotal = self._eligible_subtotal(coupon, ticket_map, line_items)
                discount_amount = self._discount_for_coupon(coupon, eligible_subtotal)
                coupon.used_count += 1
                coupon.save(update_fields=['used_count'])

            order = Order.objects.create(
                user=user,
                status='pending',
                total_price=total_price,
                coupon=coupon,
                discount_amount=discount_amount,
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    ticket_class=ticket_map[line_item['ticket_class_id']],
                    quantity=line_item['quantity'],
                    price=ticket_map[line_item['ticket_class_id']].price,
                )
                for line_item in line_items
            ])

            for line_item in line_items:
                ticket = ticket_map[line_item['ticket_class_id']]
                ticket.sold += line_item['quantity']
                ticket.save(update_fields=['sold', 'updated_at'])

            return order
