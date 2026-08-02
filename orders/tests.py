from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from events.models import Event, TicketClass
from orders.models import Coupon, Order, OrderItem


class OrderApiHardeningTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(email='customer@example.com', password='safe-password')
        self.organizer = User.objects.create_user(email='organizer@example.com', password='safe-password')
        self.client.force_authenticate(self.customer)

        self.event = Event.objects.create(
            organizer=self.organizer,
            title='Future event',
            slug='future-event',
            description='A future event.',
            date=timezone.now() + timedelta(days=7),
            location='Tehran',
        )
        self.standard = TicketClass.objects.create(
            event=self.event,
            title='Standard',
            price=Decimal('100000'),
            capacity=10,
        )
        self.vip = TicketClass.objects.create(
            event=self.event,
            title='VIP',
            price=Decimal('50000'),
            capacity=5,
        )
        self.coupon = Coupon.objects.create(
            code='STANDARD10',
            discount_type='percentage',
            value=Decimal('10'),
            total_capacity=3,
            valid_ticket_class=self.standard,
            valid_from=timezone.now() - timedelta(days=1),
            valid_to=timezone.now() + timedelta(days=1),
        )

    def post_order(self, payload):
        # Avoid executing the delayed expiry task during an isolated API test.
        with self.captureOnCommitCallbacks(execute=False) as callbacks:
            response = self.client.post('/api/orders/', payload, format='json')
        return response, callbacks

    def test_legacy_single_item_contract_remains_supported(self):
        response, callbacks = self.post_order(
            {'ticket_class_id': self.standard.id, 'quantity': 2}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(callbacks), 1)
        order = Order.objects.get(pk=response.data['id'])
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.total_price, Decimal('200000'))
        self.standard.refresh_from_db()
        self.assertEqual(self.standard.sold, 2)

    def test_multi_item_order_is_atomic_and_coupon_only_discounts_eligible_line(self):
        response, callbacks = self.post_order(
            {
                'items': [
                    {'ticket_class_id': self.standard.id, 'quantity': 2},
                    {'ticket_class_id': self.vip.id, 'quantity': 1},
                ],
                'coupon_code': self.coupon.code,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(callbacks), 1)
        order = Order.objects.get(pk=response.data['id'])
        self.assertEqual(order.items.count(), 2)
        self.assertEqual(order.total_price, Decimal('250000'))
        self.assertEqual(order.discount_amount, Decimal('20000'))
        self.assertEqual(order.final_payable_amount, Decimal('230000'))

        self.standard.refresh_from_db()
        self.vip.refresh_from_db()
        self.coupon.refresh_from_db()
        self.assertEqual(self.standard.sold, 2)
        self.assertEqual(self.vip.sold, 1)
        self.assertEqual(self.coupon.used_count, 1)

    def test_invalid_cart_line_does_not_reserve_any_inventory(self):
        response, _ = self.post_order(
            {
                'items': [
                    {'ticket_class_id': self.standard.id, 'quantity': 1},
                    {'ticket_class_id': self.vip.id, 'quantity': self.vip.capacity + 1},
                ]
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)
        self.standard.refresh_from_db()
        self.vip.refresh_from_db()
        self.assertEqual(self.standard.sold, 0)
        self.assertEqual(self.vip.sold, 0)

    def test_inactive_or_past_event_cannot_be_reserved(self):
        inactive_event = Event.objects.create(
            organizer=self.organizer,
            title='Inactive event',
            slug='inactive-event',
            description='Not for sale.',
            date=timezone.now() + timedelta(days=1),
            location='Tehran',
            is_active=False,
        )
        inactive_ticket = TicketClass.objects.create(
            event=inactive_event,
            title='Inactive ticket',
            price=Decimal('10000'),
            capacity=2,
        )
        past_event = Event.objects.create(
            organizer=self.organizer,
            title='Past event',
            slug='past-event',
            description='Already happened.',
            date=timezone.now() - timedelta(minutes=1),
            location='Tehran',
        )
        past_ticket = TicketClass.objects.create(
            event=past_event,
            title='Past ticket',
            price=Decimal('10000'),
            capacity=2,
        )

        for ticket in (inactive_ticket, past_ticket):
            with self.subTest(ticket=ticket.pk):
                response, _ = self.post_order({'ticket_class_id': ticket.id, 'quantity': 1})
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                ticket.refresh_from_db()
                self.assertEqual(ticket.sold, 0)

    def test_orders_are_immutable_and_cancel_releases_inventory_and_coupon_once(self):
        order = Order.objects.create(
            user=self.customer,
            coupon=self.coupon,
            total_price=Decimal('100000'),
            discount_amount=Decimal('10000'),
            status='pending',
        )
        OrderItem.objects.create(
            order=order,
            ticket_class=self.standard,
            quantity=1,
            price=self.standard.price,
        )
        self.standard.sold = 1
        self.standard.save(update_fields=['sold'])
        self.coupon.used_count = 1
        self.coupon.save(update_fields=['used_count'])

        detail_url = f'/api/orders/{order.id}/'
        self.assertEqual(
            self.client.patch(detail_url, {'status': 'paid'}, format='json').status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )
        self.assertEqual(
            self.client.delete(detail_url).status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        cancel_url = f'/api/orders/{order.id}/cancel/'
        canceled = self.client.post(cancel_url)
        self.assertEqual(canceled.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.standard.refresh_from_db()
        self.coupon.refresh_from_db()
        self.assertEqual(order.status, 'canceled')
        self.assertEqual(self.standard.sold, 0)
        self.assertEqual(self.coupon.used_count, 0)

        repeated_cancel = self.client.post(cancel_url)
        self.assertEqual(repeated_cancel.status_code, status.HTTP_400_BAD_REQUEST)
        self.standard.refresh_from_db()
        self.coupon.refresh_from_db()
        self.assertEqual(self.standard.sold, 0)
        self.assertEqual(self.coupon.used_count, 0)
