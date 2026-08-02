from html import escape
from urllib.parse import urlencode
import uuid
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from django.utils.crypto import constant_time_compare
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema

from orders.models import Order

from .models import Payment
from .serializers import DemoPaymentCompletionSerializer, PaymentRequestSerializer


DEMO_TOKEN_SALT = 'nexusticket.payments.demo'
DEMO_TOKEN_MAX_AGE = 15 * 60


def _configured_base_url(setting_name):
    base_url = getattr(settings, setting_name, '')
    if not base_url:
        raise ImproperlyConfigured(f'{setting_name} must be configured for payments.')
    return str(base_url).rstrip('/')


def _demo_token_payload(payment):
    return f'{payment.authority_id}:{payment.user_id}'


def _make_demo_token(payment):
    return TimestampSigner(salt=DEMO_TOKEN_SALT).sign(_demo_token_payload(payment))


def _demo_token_valid(payment, token):
    if not token:
        return False, 'missing'

    try:
        payload = TimestampSigner(salt=DEMO_TOKEN_SALT).unsign(token, max_age=DEMO_TOKEN_MAX_AGE)
    except SignatureExpired:
        return False, 'expired'
    except BadSignature:
        return False, 'invalid'

    return constant_time_compare(payload, _demo_token_payload(payment)), 'valid'


def _frontend_return_url(payment, payment_status):
    query = urlencode({
        'payment': payment.authority_id,
        'status': payment_status,
    })
    return f'{_configured_base_url("FRONTEND_BASE_URL")}/checkout?{query}'


def _demo_payment_url(payment):
    path = reverse('mock-bank', kwargs={'authority_id': payment.authority_id})
    query = urlencode({'demo_token': _make_demo_token(payment)})
    return f'{_configured_base_url("PAYMENT_PUBLIC_BASE_URL")}{path}?{query}'


def _payment_request_payload(payment, reused):
    return {
        'payment_id': payment.id,
        'authority_id': str(payment.authority_id),
        'status': payment.status,
        'amount': str(payment.amount),
        'payment_url': _demo_payment_url(payment),
        'return_url': _frontend_return_url(payment, payment.status),
        'reused': reused,
    }


def _payment_completion_payload(payment, order):
    return {
        'payment_id': payment.id,
        'authority_id': str(payment.authority_id),
        'status': payment.status,
        'order_id': order.id,
        'order_status': order.status,
        'amount': str(payment.amount),
        'transaction_id': payment.transaction_id,
        'return_url': _frontend_return_url(payment, payment.status),
    }


class PaymentRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PaymentRequestSerializer,
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT},
    )
    def post(self, request):
        serializer = PaymentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            order = get_object_or_404(
                Order.objects.select_for_update(),
                id=serializer.validated_data['order_id'],
                user=request.user,
                status='pending',
            )
            payment = Payment.objects.select_for_update().filter(
                order=order,
                status='pending',
            ).order_by('-created_at').first()
            reused = payment is not None

            if payment is None:
                payment = Payment.objects.create(
                    user=request.user,
                    order=order,
                    amount=order.final_payable_amount,
                )

        return Response(
            _payment_request_payload(payment, reused),
            status=status.HTTP_200_OK if reused else status.HTTP_201_CREATED,
        )


class MockBankView(APIView):
    """A signed, one-time demo payment page; it never settles a payment on GET."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(responses={200: OpenApiTypes.STR, 403: OpenApiTypes.STR, 409: OpenApiTypes.STR})
    def get(self, request, authority_id):
        payment = get_object_or_404(Payment.objects.select_related('order'), authority_id=authority_id)
        token_valid, _ = _demo_token_valid(payment, request.query_params.get('demo_token'))

        if not token_valid:
            message = 'This demo payment session is invalid or has expired. Please start payment again.'
            return HttpResponse(message, status=status.HTTP_403_FORBIDDEN, content_type='text/plain; charset=utf-8')

        if payment.status != 'pending' or payment.order.status != 'pending':
            return HttpResponse(
                'This demo payment session has already been processed.',
                status=status.HTTP_409_CONFLICT,
                content_type='text/plain; charset=utf-8',
            )

        completion_url = reverse('payment-verify', kwargs={'authority_id': payment.authority_id})
        html_content = f"""
        <html>
            <head><title>Demo payment simulator</title></head>
            <body style="max-width:560px;margin:64px auto;padding:0 24px;font-family:system-ui,sans-serif;color:#10251f;">
                <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2e755a;">Demo only</p>
                <h1>Confirm your demo payment</h1>
                <p>Order #{payment.order_id} · Amount: {escape(str(payment.amount))}</p>
                <p>This page uses a short-lived, signed authorization and can be completed once.</p>
                <form method="post" action="{escape(completion_url, quote=True)}">
                    <input type="hidden" name="demo_token" value="{escape(request.query_params['demo_token'], quote=True)}" />
                    <button type="submit" name="outcome" value="success" style="padding:12px 18px;border:0;border-radius:8px;background:#10251f;color:white;cursor:pointer;">Complete demo payment</button>
                    <button type="submit" name="outcome" value="failed" style="padding:12px 18px;margin-left:8px;border:1px solid #b9473b;border-radius:8px;background:white;color:#b9473b;cursor:pointer;">Cancel</button>
                </form>
            </body>
        </html>
        """
        return HttpResponse(html_content, content_type='text/html; charset=utf-8')


class PaymentVerifyView(APIView):
    """Settles a demo payment only through an authenticated or signed POST request."""

    permission_classes = [AllowAny]

    @extend_schema(
        request=DemoPaymentCompletionSerializer,
        responses={200: OpenApiTypes.OBJECT, 403: OpenApiTypes.OBJECT, 409: OpenApiTypes.OBJECT},
    )
    def post(self, request, authority_id):
        serializer = DemoPaymentCompletionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            payment = get_object_or_404(
                Payment.objects.select_for_update().select_related('order'),
                authority_id=authority_id,
            )
            is_owner = request.user.is_authenticated and request.user.pk == payment.user_id
            token_valid, _ = _demo_token_valid(payment, serializer.validated_data.get('demo_token'))

            if not is_owner and not token_valid:
                raise PermissionDenied('A valid payment authorization is required.')

            # A customer may cancel their own pending attempt, but only the signed
            # demo-bank session may mark an order as paid. In production this
            # branch is where a provider-signed callback would be verified.
            
            if serializer.validated_data['outcome'] == 'success' and not token_valid:
                raise PermissionDenied('A signed demo payment authorization is required to complete payment.')

            order = Order.objects.select_for_update().get(id=payment.order_id)

            if payment.status != 'pending':
                return Response(
                    _payment_completion_payload(payment, order),
                    status=status.HTTP_409_CONFLICT,
                )

            if order.status != 'pending':
                payment.status = 'failed'
                payment.save(update_fields=['status', 'updated_at'])
                return Response(
                    _payment_completion_payload(payment, order),
                    status=status.HTTP_409_CONFLICT,
                )

            if serializer.validated_data['outcome'] == 'success':
                payment.status = 'success'
                payment.transaction_id = f'DEMO-{uuid.uuid4().hex[:12].upper()}'
                payment.save(update_fields=['status', 'transaction_id', 'updated_at'])

                order.status = 'paid'
                order.save(update_fields=['status', 'updated_at'])
                Payment.objects.filter(order=order, status='pending').exclude(pk=payment.pk).update(
                    status='failed',
                    updated_at=timezone.now(),
                )
            else:
                payment.status = 'failed'
                payment.save(update_fields=['status', 'updated_at'])

        return Response(_payment_completion_payload(payment, order), status=status.HTTP_200_OK)
