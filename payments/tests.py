from decimal import Decimal
from urllib.parse import parse_qs, urlparse

from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from accounts.models import User
from events.models import Event, TicketClass
from orders.models import Order, OrderItem

from .models import Payment


class PaymentApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='buyer@example.test', password='SafeDemoPass123!')
        self.organizer = User.objects.create_user(email='organizer@example.test', password='SafeDemoPass123!')
        self.event = Event.objects.create(
            organizer=self.organizer,
            title='Payment smoke event',
            slug='payment-smoke-event',
            description='A test-only event.',
            date=timezone.now(),
            location='Test venue',
            address='100 Example Way',
        )
        self.ticket = TicketClass.objects.create(
            event=self.event,
            title='General admission',
            price=Decimal('45'),
            capacity=20,
        )

    def create_pending_order(self):
        order = Order.objects.create(user=self.user, total_price=Decimal('90'), status='pending')
        OrderItem.objects.create(order=order, ticket_class=self.ticket, quantity=2, price=Decimal('45'))
        return order

    def request_payment(self, order):
        self.client.force_authenticate(self.user)
        return self.client.post('/api/payments/request/', {'order_id': order.id}, format='json')

    @override_settings(
        PAYMENT_PUBLIC_BASE_URL='https://pay.example.test',
        FRONTEND_BASE_URL='https://app.example.test',
    )
    def test_payment_request_is_idempotent_and_uses_configured_urls(self):
        order = self.create_pending_order()

        first = self.request_payment(order)
        second = self.request_payment(order)

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertFalse(first.data['reused'])
        self.assertTrue(second.data['reused'])
        self.assertEqual(first.data['payment_id'], second.data['payment_id'])
        self.assertEqual(Payment.objects.filter(order=order, status='pending').count(), 1)
        self.assertTrue(first.data['payment_url'].startswith('https://pay.example.test/api/payments/mock-bank/'))
        self.assertTrue(first.data['return_url'].startswith('https://app.example.test/checkout?'))

        token = parse_qs(urlparse(first.data['payment_url']).query).get('demo_token', [''])[0]
        self.assertTrue(token)

    def test_payment_request_requires_authentication(self):
        order = self.create_pending_order()

        response = self.client.post('/api/payments/request/', {'order_id': order.id}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Payment.objects.count(), 0)

    def test_public_get_cannot_settle_a_payment(self):
        order = self.create_pending_order()
        request_response = self.request_payment(order)
        payment = Payment.objects.get(id=request_response.data['payment_id'])
        verify_url = reverse('payment-verify', kwargs={'authority_id': payment.authority_id})

        response = APIClient().get(f'{verify_url}?status=success')

        payment.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(payment.status, 'pending')
        self.assertEqual(order.status, 'pending')

    def test_mock_bank_requires_a_signed_demo_token(self):
        order = self.create_pending_order()
        request_response = self.request_payment(order)
        payment = Payment.objects.get(id=request_response.data['payment_id'])
        mock_bank_url = reverse('mock-bank', kwargs={'authority_id': payment.authority_id})

        missing_token = APIClient().get(mock_bank_url)
        authorized = APIClient().get(request_response.data['payment_url'])

        self.assertEqual(missing_token.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(authorized.status_code, status.HTTP_200_OK)
        self.assertContains(authorized, 'Complete demo payment')
        self.assertNotContains(authorized, '?status=success')

    def test_signed_demo_post_can_settle_once(self):
        order = self.create_pending_order()
        request_response = self.request_payment(order)
        payment = Payment.objects.get(id=request_response.data['payment_id'])
        verify_url = reverse('payment-verify', kwargs={'authority_id': payment.authority_id})
        demo_token = parse_qs(urlparse(request_response.data['payment_url']).query)['demo_token'][0]
        anonymous = APIClient()

        first = anonymous.post(verify_url, {'outcome': 'success', 'demo_token': demo_token}, format='json')
        repeated = anonymous.post(verify_url, {'outcome': 'success', 'demo_token': demo_token}, format='json')

        payment.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(first.data['status'], 'success')
        self.assertEqual(first.data['order_status'], 'paid')
        self.assertTrue(first.data['transaction_id'].startswith('DEMO-'))
        self.assertEqual(repeated.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(payment.status, 'success')
        self.assertEqual(order.status, 'paid')

    def test_demo_post_without_token_or_owner_is_rejected(self):
        order = self.create_pending_order()
        request_response = self.request_payment(order)
        payment = Payment.objects.get(id=request_response.data['payment_id'])
        verify_url = reverse('payment-verify', kwargs={'authority_id': payment.authority_id})

        response = APIClient().post(verify_url, {'outcome': 'success'}, format='json')

        payment.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(payment.status, 'pending')

    def test_owner_can_complete_payment_with_authenticated_post(self):
        order = self.create_pending_order()
        request_response = self.request_payment(order)
        payment = Payment.objects.get(id=request_response.data['payment_id'])
        verify_url = reverse('payment-verify', kwargs={'authority_id': payment.authority_id})

        response = self.client.post(verify_url, {'outcome': 'failed'}, format='json')

        payment.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'failed')
        self.assertEqual(response.data['order_status'], 'pending')
        self.assertEqual(payment.status, 'failed')
        self.assertEqual(order.status, 'pending')

    def test_owner_cannot_mark_a_payment_success_without_demo_authorization(self):
        order = self.create_pending_order()
        request_response = self.request_payment(order)
        payment = Payment.objects.get(id=request_response.data['payment_id'])
        verify_url = reverse('payment-verify', kwargs={'authority_id': payment.authority_id})

        response = self.client.post(verify_url, {'outcome': 'success'}, format='json')

        payment.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(payment.status, 'pending')
        self.assertEqual(order.status, 'pending')
