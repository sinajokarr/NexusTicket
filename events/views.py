from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Event,Category
from .serializers import CategorySerializer,EventSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Category.objects.all()
    serializer_class=CategorySerializer
    Permission_classes =[permissions.IsAuthenticatedOrReadOnly]
    
class EventViewSet(viewsets.ModelViewSet):
    queryset=Event.objects.all()
    serializer_class= EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)