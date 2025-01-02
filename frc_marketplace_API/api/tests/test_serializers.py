from django.test import TestCase
from api.models import User, Part, PartManufacturer, PartCategory
from api.serializers import (
    UserSerializer,
    PartSerializer,
    PartManufacturerSerializer,
    MessageSerializer,
)
from rest_framework.test import APIRequestFactory


class UserSerializerTest(TestCase):
    def setUp(self):
        self.user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "team_number": 1234,
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }

    def test_serialize_user(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, self.user_data["email"])
        self.assertEqual(user.team_number, self.user_data["team_number"])


class PartSerializerTest(TestCase):
    def setUp(self):
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

    def test_serialize_part(self):
        serializer = PartSerializer(data=self.part_data)
        self.assertTrue(serializer.is_valid())
        part = serializer.save()
        self.assertEqual(part.name, self.part_data["name"])
        self.assertEqual(part.manufacturer, self.manufacturer)
