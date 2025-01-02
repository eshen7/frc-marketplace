from django.test import TestCase
from django.core.exceptions import ValidationError
from api.models import User, Part, PartManufacturer, PartCategory, PartRequest, PartSale, Message
from django.core.files.uploadedfile import SimpleUploadedFile

class UserModelTest(TestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'full_name': 'Test User',
            'team_number': 1234,
        }

    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.team_number, self.user_data['team_number'])
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_create_superuser(self):
        admin = User.objects.create_superuser(**self.user_data)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

class PartModelTest(TestCase):
    def setUp(self):
        self.manufacturer = PartManufacturer.objects.create(
            name='Test Manufacturer',
            website='http://example.com'
        )
        self.category = PartCategory.objects.create(
            name='Test Category'
        )
        
    def test_create_part(self):
        part = Part.objects.create(
            name='Test Part',
            manufacturer=self.manufacturer,
            category=self.category,
            description='Test Description'
        )
        self.assertEqual(part.name, 'Test Part')
        self.assertEqual(part.manufacturer, self.manufacturer)
        
    def test_unique_part_constraint(self):
        Part.objects.create(
            name='Test Part',
            manufacturer=self.manufacturer,
            category=self.category
        )
        with self.assertRaises(Exception):
            Part.objects.create(
                name='Test Part',
                manufacturer=self.manufacturer,
                category=self.category
            )

class MessageModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='pass123',
            team_number=1234
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='pass123',
            team_number=5678
        )

    def test_create_message(self):
        message = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            message='Test message'
        )
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.message, 'Test message')
        self.assertFalse(message.is_read)
