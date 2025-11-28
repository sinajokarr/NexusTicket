from django.shortcuts import render
from rest_framework import viewsets, permissions ,filters
from .models import Event,Category,TicketClass
from .serializers import CategorySerializer,EventSerializer,TicketClassSerializer
from .filters import EventFilter
from django_filters.rest_framework import DjangoFilterBackend



class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Category.objects.all()
    serializer_class=CategorySerializer
    permission_classes =[permissions.IsAuthenticatedOrReadOnly]
    
class EventViewSet(viewsets.ModelViewSet):
    queryset=Event.objects.all()
    serializer_class= EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = EventFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['date', 'created_at']
    
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
        
        
class TicketClassViewSet(viewsets.ModelViewSet):
    queryset = TicketClass.objects.all()
    serializer_class = TicketClassSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['event', 'price'] 
    search_fields = ['title']
    ordering_fields = ['price']
    