from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import RegisterView

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="NexusTicket API",
      default_version='v1',
      description="مستندات کامل API سامانه فروش بلیت",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="support@nexusticket.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/events/', include('events.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')), 

    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),

    
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]