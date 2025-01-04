from django.test import TestCase
from api.models import User, Part, PartManufacturer, PartCategory, Message, PartRequest, PartSale
from api.serializers import (
    UserSerializer,
    PartSerializer,
    PartManufacturerSerializer,
    MessageSerializer,
    PartRequestSerializer,
    PartSaleSerializer,
    PublicUserSerializer
)
from rest_framework.test import APIRequestFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import datetime, timedelta
import uuid

class UserSerializerTest(TestCase):
    def setUp(self):
        """Set up test data for user serializer tests"""
        self.user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "team_number": 3647,
            "phone": "123-456-7890",
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }

    def test_serialize_user(self):
        """Test basic user serialization with valid data"""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, self.user_data["email"])
        self.assertEqual(user.team_number, self.user_data["team_number"])

    def test_invalid_email_format(self):
        """Test serializer validation with invalid email format"""
        invalid_data = self.user_data.copy()
        invalid_data['email'] = "invalid-email"
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_invalid_address(self):
        """Test serializer validation with invalid address"""
        invalid_data = self.user_data.copy()
        invalid_data['address'] = "Invalid Address 123!@#"
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('address', serializer.errors)

    def test_public_user_serializer(self):
        """Test public user serializer only shows allowed fields"""
        user = User.objects.create_user(**self.user_data)
        serializer = PublicUserSerializer(user)
        data = serializer.data
        
        # Check that sensitive fields are not included
        self.assertNotIn('email', data)
        self.assertNotIn('password', data)
        self.assertNotIn('phone', data)

        # Check that public fields are included
        self.assertIn('team_number', data)
        self.assertIn('team_name', data)

class PartSerializerTest(TestCase):
    def setUp(self):
        """Set up test data for part serializer tests"""
        self.manufacturer = PartManufacturer.objects.create(
            name="Test Manufacturer",
            website="http://example.com"
        )
        self.category = PartCategory.objects.create(name="Test Category")
        self.part_data = {
            "name": "Test Part",
            "manufacturer_id": str(self.manufacturer.id),
            "category_id": str(self.category.id),
            "description": "Test Description",
        }

    def test_serialize_part(self):
        """Test basic part serialization with valid data"""
        serializer = PartSerializer(data=self.part_data)
        self.assertTrue(serializer.is_valid())
        part = serializer.save()
        self.assertEqual(part.name, self.part_data["name"])
        self.assertEqual(part.manufacturer, self.manufacturer)

    def test_invalid_manufacturer_id(self):
        """Test serializer validation with non-existent manufacturer ID"""
        invalid_data = self.part_data.copy()
        invalid_data['manufacturer_id'] = str(uuid.uuid4())
        serializer = PartSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('manufacturer_id', serializer.errors)

    def test_large_image_validation(self):
        """Test image size validation in part serializer"""
        # Create a mock large image file
        large_image = SimpleUploadedFile(
            "large.jpg",
            b"large file content",
            content_type="image/jpeg"
        )
        invalid_data = self.part_data.copy()
        invalid_data['image'] = large_image
        serializer = PartSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('image', serializer.errors)

class PartRequestSerializerTest(TestCase):
    def setUp(self):
        """Set up test data for part request serializer tests"""
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            team_number=3647
        )
        self.manufacturer = PartManufacturer.objects.create(name="Test Manufacturer")
        self.category = PartCategory.objects.create(name="Test Category")
        self.part = Part.objects.create(
            name="Test Part",
            manufacturer=self.manufacturer,
            category=self.category
        )
        self.request_data = {
            "part_id": str(self.part.id),
            "quantity": 5,
            "needed_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "additional_info": "Test request"
        }
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/')
        self.request.user = self.user

    def test_serialize_request(self):
        """Test basic request serialization with valid data"""
        serializer = PartRequestSerializer(
            data=self.request_data,
            context={'request': self.request}
        )
        self.assertTrue(serializer.is_valid())
        request = serializer.save()
        self.assertEqual(request.part, self.part)
        self.assertEqual(request.user, self.user)


class MessageSerializerTest(TestCase):
    def setUp(self):
        """Set up test data for message serializer tests"""
        self.sender = User.objects.create_user(
            email="sender@example.com",
            password="pass123",
            team_number=3647,
            phone="123-456-7890"
        )
        self.receiver = User.objects.create_user(
            email="receiver@example.com",
            password="pass123",
            team_number=5678,
            phone="987-654-3210"
        )
        self.message_data = {
            "id": str(uuid.uuid4()), 
            "message": "Test message",
            "receiver": self.receiver.team_number  
        }
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/')
        self.request.user = self.sender

    def test_serialize_message(self):
        """Test basic message serialization with valid data"""
        message = Message.objects.create(
            id=self.message_data["id"],
            sender=self.sender,
            receiver=self.receiver,
            message=self.message_data["message"]
        )
        serializer = MessageSerializer(message)
        self.assertEqual(serializer.data['sender'], self.sender.team_number)
        self.assertEqual(serializer.data['receiver'], self.receiver.team_number)
        self.assertEqual(serializer.data['message'], self.message_data['message'])

    def test_empty_message(self):
        """Test serializer validation with empty message"""
        invalid_data = self.message_data.copy()
        invalid_data['message'] = ""
        serializer = MessageSerializer(
            data=invalid_data,
            context={'request': self.request}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn('message', serializer.errors)

    def test_receiver_representation(self):
        """Test that receiver is represented by team number in serialized data"""
        message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            message="Test message"
        )
        serializer = MessageSerializer(message)
        self.assertEqual(serializer.data['receiver'], self.receiver.team_number)
