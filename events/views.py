from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, Category, TicketClass, Review
from .serializers import CategorySerializer, EventSerializer, TicketClassSerializer, ReviewSerializer, ReviewDetailSerializer
from .filters import EventFilter
from .permissions import IsEventOrganizerOrStaff, IsOrganizerOrReadOnly, IsReviewAuthorOrStaff

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOrganizerOrReadOnly]
    lookup_field = 'slug'

    filterset_class = EventFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        queryset = Event.objects.select_related('organizer').prefetch_related(
            'categories',
            'artists',
            'ticket_classes',
        )
        user = self.request.user

        if user.is_authenticated:
            if user.is_staff:
                return queryset
            return queryset.filter(Q(is_active=True) | Q(organizer=user)).distinct()

        return queryset.filter(is_active=True)

    def filter_queryset(self, queryset):
        # Price filters traverse ticket classes; distinct prevents one event from
        # appearing once for every matching class.
        return super().filter_queryset(queryset).distinct()

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class TicketClassViewSet(viewsets.ModelViewSet):
    # Kept for DRF's router basename inference; access is narrowed in
    # get_queryset for each request.
    queryset = TicketClass.objects.all()
    serializer_class = TicketClassSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsEventOrganizerOrStaff]
    filterset_fields = ['event', 'price']
    search_fields = ['title']
    ordering_fields = ['price'] 

    def get_queryset(self):
        queryset = TicketClass.objects.select_related('event__organizer')
        user = self.request.user

        if user.is_authenticated:
            if user.is_staff:
                return queryset
            return queryset.filter(Q(event__is_active=True) | Q(event__organizer=user)).distinct()

        return queryset.filter(event__is_active=True)

    def perform_create(self, serializer):
        event = serializer.validated_data.get('event')
        if event is None:
            raise ValidationError({'event': 'This field is required when creating a ticket class directly.'})

        self.check_object_permissions(self.request, event)
        serializer.save()


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsReviewAuthorOrStaff]
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
