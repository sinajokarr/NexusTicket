import django_filters
from .models import Event

class EventFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="ticket_classes__price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="ticket_classes__price", lookup_expr='lte')
    
    
    start_date =django_filters.DateTimeFilter(field_name="date",lookup_expr='gte')
    end__date =django_filters.DateTimeFilter(field_name="date",lookup_expr='lte')
    
    class Meta :
        model = Event
        fields = ['is_active','location']