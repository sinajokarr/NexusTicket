from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationApiTests(APITestCase):
    def test_registration_rejects_weak_password(self):
        response = self.client.post(
            '/api/auth/register/',
            {'email': 'weak@example.com', 'password': 'x'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertFalse(User.objects.filter(email='weak@example.com').exists())

    def test_registration_and_login_return_jwt_tokens(self):
        registration = self.client.post(
            '/api/auth/register/',
            {'email': 'member@example.com', 'password': 'SafeDemoPass123!'},
            format='json',
        )
        login = self.client.post(
            '/api/auth/login/',
            {'email': 'member@example.com', 'password': 'SafeDemoPass123!'},
            format='json',
        )

        self.assertEqual(registration.status_code, status.HTTP_201_CREATED)
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn('access', login.data)
        self.assertIn('refresh', login.data)
