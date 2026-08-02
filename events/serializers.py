from rest_framework import serializers
from django.db import transaction
from django.utils.text import slugify
from orders.models import Order 
from .models import Category, Event, TicketClass, Artist, Review 
from accounts.models import User

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ["id", "name", "slug", "image", "bio"]
        read_only_fields = ['slug']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon"]
        read_only_fields = ['slug']

class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

class TicketClassValidationMixin:
    def validate(self, data):
        capacity = data.get('capacity')

        if self.instance and capacity is not None and capacity < self.instance.sold:
            raise serializers.ValidationError(
                {'capacity': f"Capacity cannot be less than tickets already sold ({self.instance.sold})."}
            )

        return data


class TicketClassSerializer(TicketClassValidationMixin, serializers.ModelSerializer):
    is_sold_out = serializers.ReadOnlyField()
    remaining_capacity = serializers.ReadOnlyField()
    sold = serializers.IntegerField(read_only=True)
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all(), required=False)

    class Meta:
        model = TicketClass
        fields = [
            'id', 'title', 'description', 'price', 'capacity',
            'sold', 'is_sold_out', 'remaining_capacity', 'event'
        ]


    def validate_event(self, event):
        if self.instance and event.pk != self.instance.event_id:
            raise serializers.ValidationError("Changing a ticket class event is not allowed.")
        return event


class NestedTicketClassSerializer(TicketClassValidationMixin, serializers.ModelSerializer):
    """Ticket input embedded in an event payload.

    IDs are writable here only so an event organizer can update an existing
    ticket class. Inventory remains server-managed in every code path.
    """

    id = serializers.IntegerField(required=False)
    sold = serializers.IntegerField(read_only=True)

    class Meta:
        model = TicketClass
        fields = ['id', 'title', 'description', 'price', 'capacity', 'sold']

class EventSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)
    ticket_classes = NestedTicketClassSerializer(many=True, required=False)
    organizer = serializers.ReadOnlyField(source='organizer.email')
    slug = serializers.SlugField(
        required=False,
        allow_unicode=True,
        max_length=Event._meta.get_field('slug').max_length,
    )

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'ticket_classes', 'description', 
            'cover_image', 'date', 'location', 'address', 
            'organizer', 'categories', 'artists', 'is_active', 'created_at'
        ]
        read_only_fields = ['organizer', 'is_active', 'created_at']

    def validate_slug(self, value):
        existing = Event.objects.filter(slug=value)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError("An event with this slug already exists.")
        return value

    def validate(self, attrs):
        if not self.instance:
            for ticket_data in attrs.get('ticket_classes', []):
                if 'id' in ticket_data:
                    raise serializers.ValidationError(
                        {'ticket_classes': 'New events cannot reference existing ticket classes.'}
                    )
        return attrs

    @staticmethod
    def _generated_slug(title):
        max_length = Event._meta.get_field('slug').max_length
        base = (slugify(title, allow_unicode=True) or 'event').strip('-')
        base = base[:max_length].rstrip('-') or 'event'
        candidate = base
        suffix = 2

        while Event.objects.filter(slug=candidate).exists():
            suffix_text = f'-{suffix}'
            candidate = f"{base[:max_length - len(suffix_text)].rstrip('-')}{suffix_text}"
            suffix += 1

        return candidate

    @transaction.atomic
    def create(self, validated_data):
        ticket_classes_data = validated_data.pop('ticket_classes', [])
        slug = validated_data.pop('slug', None) or self._generated_slug(validated_data['title'])
        event = Event.objects.create(slug=slug, **validated_data)

        for ticket_data in ticket_classes_data:
            TicketClass.objects.create(event=event, **ticket_data)

        return event  

    @transaction.atomic
    def update(self, instance, validated_data):
        ticket_classes_data = validated_data.pop('ticket_classes', None)
        instance = super().update(instance, validated_data)

        if ticket_classes_data is not None:
            seen_ticket_ids = set()
            for ticket_data in ticket_classes_data:
                ticket_id = ticket_data.pop('id', None)
                if ticket_id is not None:
                    if ticket_id in seen_ticket_ids:
                        raise serializers.ValidationError(
                            {'ticket_classes': 'Each ticket class can only appear once in an update.'}
                        )
                    seen_ticket_ids.add(ticket_id)

                    ticket_item = TicketClass.objects.filter(id=ticket_id, event=instance).first()
                    if not ticket_item:
                        raise serializers.ValidationError(
                            {'ticket_classes': f'Ticket class {ticket_id} does not belong to this event.'}
                        )

                    capacity = ticket_data.get('capacity')
                    if capacity is not None and capacity < ticket_item.sold:
                        raise serializers.ValidationError(
                            {'ticket_classes': f'Capacity cannot be less than tickets already sold ({ticket_item.sold}).'}
                        )

                    for attr, value in ticket_data.items():
                        setattr(ticket_item, attr, value)
                    ticket_item.save()
                else:
                    TicketClass.objects.create(event=instance, **ticket_data)

        return instance

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'event', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'is_approved']
        
    def validate(self, data):
        user = self.context["request"].user
        event = data.get("event")
        
        has_purchased = Order.objects.filter(
            user=user,
            status="paid",
            items__ticket_class__event=event
        ).exists() 
        
        if not has_purchased:
            raise serializers.ValidationError("First buy the ticket, then leave a review! 😊")
        
        already_reviewed = Review.objects.filter(
            user=user, 
            event=event,
        ).exists()
        
        if already_reviewed:
            raise serializers.ValidationError("You have already registered an approved review for this event.")
            
        return data

class ReviewDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    event_title = serializers.ReadOnlyField(source='event.title')

    class Meta:
        model = Review
        fields = ['id', 'user_email', 'event_title', 'rating', 'comment', 'created_at']
