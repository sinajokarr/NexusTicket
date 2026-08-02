from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from events.models import Event, Review, TicketClass


class EventApiHardeningTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organizer = User.objects.create_user(email='organizer@example.com', password='safe-password')
        self.other_user = User.objects.create_user(email='other@example.com', password='safe-password')
        self.reviewer = User.objects.create_user(email='reviewer@example.com', password='safe-password')
        self.staff = User.objects.create_user(
            email='staff@example.com', password='safe-password', is_staff=True
        )
        self.event = Event.objects.create(
            organizer=self.organizer,
            title='Future concert',
            slug='future-concert',
            description='A future event.',
            date=timezone.now() + timedelta(days=7),
            location='Tehran',
        )
        self.ticket = TicketClass.objects.create(
            event=self.event,
            title='Standard',
            description='General entry',
            price=100_000,
            capacity=20,
            sold=3,
        )

    def test_event_creation_generates_slug_and_detail_uses_slug(self):
        self.client.force_authenticate(self.organizer)
        payload = {
            'title': 'Summer Night',
            'description': 'An open-air summer performance.',
            'date': (timezone.now() + timedelta(days=10)).isoformat(),
            'location': 'Shiraz',
            'ticket_classes': [
                {
                    'title': 'Balcony',
                    'description': 'Reserved balcony seating',
                    'price': 180_000,
                    'capacity': 40,
                }
            ],
        }

        response = self.client.post('/api/events/list/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['slug'], 'summer-night')
        self.assertEqual(response.data['ticket_classes'][0]['title'], 'Balcony')

        detail = self.client.get(f"/api/events/list/{response.data['slug']}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data['id'], response.data['id'])

    def test_organizer_can_update_nested_ticket_without_creating_duplicate(self):
        self.client.force_authenticate(self.organizer)

        response = self.client.patch(
            f'/api/events/list/{self.event.slug}/',
            {
                'ticket_classes': [
                    {
                        'id': self.ticket.id,
                        'title': self.ticket.title,
                        'description': self.ticket.description,
                        'price': 125_000,
                        'capacity': self.ticket.capacity,
                    }
                ]
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.price, 125_000)
        self.assertEqual(self.event.ticket_classes.count(), 1)

    def test_ticket_mutations_require_event_organizer_or_staff_and_sold_is_read_only(self):
        ticket_url = f'/api/events/tickets/{self.ticket.id}/'

        self.client.force_authenticate(self.other_user)
        forbidden = self.client.patch(ticket_url, {'price': 1}, format='json')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.organizer)
        response = self.client.patch(ticket_url, {'sold': 19}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.sold, 3)

        staff_client = APIClient()
        staff_client.force_authenticate(self.staff)
        staff_response = staff_client.patch(ticket_url, {'price': 150_000}, format='json')
        self.assertEqual(staff_response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.price, 150_000)

    def test_direct_ticket_creation_requires_target_event_owner(self):
        payload = {
            'event': self.event.id,
            'title': 'VIP',
            'description': 'VIP entry',
            'price': 250_000,
            'capacity': 10,
        }

        self.client.force_authenticate(self.other_user)
        forbidden = self.client.post('/api/events/tickets/', payload, format='json')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.organizer)
        created = self.client.post('/api/events/tickets/', payload, format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data['event'], self.event.id)

    def test_review_can_only_be_edited_by_author_or_staff(self):
        review = Review.objects.create(
            event=self.event,
            user=self.reviewer,
            rating=4,
            comment='Great event.',
            is_approved=True,
        )
        review_url = f'/api/events/reviews/{review.id}/'

        self.client.force_authenticate(self.other_user)
        forbidden = self.client.patch(review_url, {'comment': 'Changed'}, format='json')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.reviewer)
        owner_update = self.client.patch(review_url, {'comment': 'Updated by author'}, format='json')
        self.assertEqual(owner_update.status_code, status.HTTP_200_OK)

        staff_client = APIClient()
        staff_client.force_authenticate(self.staff)
        staff_update = staff_client.patch(review_url, {'rating': 5}, format='json')
        self.assertEqual(staff_update.status_code, status.HTTP_200_OK)
