from django.urls import path
from .views import PaymentRequestView, mock_bank_view, PaymentVerifyView

urlpatterns = [
    path('request/', PaymentRequestView.as_view(), name='payment-request'),
    path('mock-bank/<uuid:authority_id>/', mock_bank_view, name='mock-bank'),
    path('verify/<uuid:authority_id>/', PaymentVerifyView.as_view(), name='payment-verify'),
]