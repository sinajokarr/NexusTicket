from django.urls import path
from .views import MockBankView, PaymentRequestView, PaymentVerifyView

urlpatterns = [
    path('request/', PaymentRequestView.as_view(), name='payment-request'),
    path('mock-bank/<uuid:authority_id>/', MockBankView.as_view(), name='mock-bank'),
    path('verify/<uuid:authority_id>/', PaymentVerifyView.as_view(), name='payment-verify'),
]
