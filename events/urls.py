from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, EventViewSet, TicketClassViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"tickets", TicketClassViewSet)  
router.register(r"reviews", ReviewViewSet, basename='review') 
router.register(r"list", EventViewSet, basename='event')  

urlpatterns = [
    path("", include(router.urls))
]