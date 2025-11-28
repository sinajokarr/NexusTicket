from rest_framework import serializers
from .models import Order,OrderItem
from events.models import TicketClass



class OrderItemSerializer(serializers.ModelSerializer):    
    ticket_title = serializers.CharField(source='ticket_class.title', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'ticket_title', 'quantity', 'price']
        
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)    
    class Meta:
        model = Order
        fields = ['id', 'status', 'total_price', 'created_at', 'items']
        

