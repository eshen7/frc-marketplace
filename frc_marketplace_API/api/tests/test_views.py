from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import User, Part, PartManufacturer, PartCategory, Message
import uuid


class UserViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "team_number": 1234,
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_registration(self):
        new_user_data = {
            "email": "new@example.com",
            "password": "newpass123",
            "full_name": "New User",
            "team_number": 5678,
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }
        response = self.client.post("/api/users/", new_user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_user_login(self):
        login_data = {"email": "test@example.com", "password": "testpass123"}
        response = self.client.post("/api/login/", login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class MessageViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email="user1@example.com", password="pass123", team_number=1234
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com", password="pass123", team_number=5678
        )
        self.client.force_authenticate(user=self.user1)

    def test_send_message(self):
        message_data = {
            "id": str(uuid.uuid4()),
            "message": "Test message",
            "receiver": 5678,
        }
        response = self.client.post("/api/messages/", message_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)


class PartViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manufacturer = PartManufacturer.objects.create(
            name="Test Manufacturer", website="http://example.com"
        )
        self.category = PartCategory.objects.create(name="Test Category")
        self.part_data = {
            "name": "Test Part",
            "manufacturer_id": str(self.manufacturer.id),
            "category_id": str(self.category.id),
            "description": "Test Description",
        }

    def test_create_part(self):
        response = self.client.post("/api/parts/", self.part_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), 1)
