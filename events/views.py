from django.shortcuts import render
from rest_framework import viewsets, permissions, filters 
from django.db.models import Q
from .models import Event,Category,TicketClass,Review
from .serializers import CategorySerializer,EventSerializer,TicketClassSerializer, ReviewSerializer , ReviewDetailSerializer
from .filters import EventFilter
from django_filters.rest_framework import DjangoFilterBackend



class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Category.objects.all()
    serializer_class=CategorySerializer
    permission_classes =[permissions.IsAuthenticatedOrReadOnly]
  
  
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related('organizer').prefetch_related(
        'categories', 
        'artists', 
        'ticket_classes'
        ).filter(is_active=True)
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
    
    
    
class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ["event", "user", "rating"]
    
    def get_queryset(self):
        user = self.request.user
        base_queryset = Review.objects.select_related('user', 'event')
        
        if user.is_staff:
            return base_queryset.all()
        
        if user.is_authenticated:
            return base_queryset.filter(
                Q(is_approved=True) | Q(user=user)
            )
            
        return base_queryset.filter(is_approved=True)

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewSerializer
        return ReviewDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)