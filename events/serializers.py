from rest_framework import serializers
from .models import Category, Event
from accounts.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta :
        model=Category
        fields =["name","slug","icon","id"]
        
        
class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']
        
        
class EventSerializer(serializers.ModelSerializer):
    categories =CategorySerializer(many=True,read_only=True)
    organizer = OrganizerSerializer(read_only=True)
    class  Meta:
        model = Event
        fields = ['id','title', 'slug', 'description', 'cover_image', 'date', 'location', 'address', 'organizer', 'categories','is_active','created_at']
        read_only_fields = ['organizer', 'is_active', 'created_at']
        