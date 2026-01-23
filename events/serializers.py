from rest_framework import serializers
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

class TicketClassSerializer(serializers.ModelSerializer):
    is_sold_out = serializers.ReadOnlyField()
    remaining_capacity = serializers.ReadOnlyField()

    class Meta:
        model = TicketClass
        fields = [
            'id', 'title', 'price', 'capacity', 
            'sold', 'is_sold_out', 'remaining_capacity', 'event'
        ]
        extra_kwargs = {
            'event': {'read_only': True}
        }

    def validate(self, data):
        capacity = data.get('capacity')
        
        if self.instance:
            current_sold = self.instance.sold
            if capacity is not None and capacity < current_sold:
                raise serializers.ValidationError(
                    f"Capacity cannot be less than tickets already sold ({current_sold})."
                )
        
        if capacity is not None and capacity <= 0:
            raise serializers.ValidationError("Capacity must be at least 1.")
            
        return data

class EventSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)
    ticket_classes = TicketClassSerializer(many=True)  
    organizer = serializers.ReadOnlyField(source='organizer.email')

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'ticket_classes', 'description', 
            'cover_image', 'date', 'location', 'address', 
            'organizer', 'categories', 'artists', 'is_active', 'created_at'
        ]
        read_only_fields = ['organizer', 'is_active', 'created_at', 'slug']

    def create(self, validated_data):
        ticket_classes_data = validated_data.pop('ticket_classes', [])        
        event = Event.objects.create(**validated_data)
        
        for ticket_data in ticket_classes_data:
            TicketClass.objects.create(event=event, **ticket_data)
            
        return event  

    def update(self, instance, validated_data):
        ticket_classes_data = validated_data.pop('ticket_classes', None)
        instance = super().update(instance, validated_data)

        if ticket_classes_data is not None:
            for ticket_data in ticket_classes_data:
                ticket_id = ticket_data.get('id')
                if ticket_id:
                    ticket_item = TicketClass.objects.get(id=ticket_id, event=instance)
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