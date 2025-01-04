"""Test module for all models in the FRC Marketplace API."""

from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from api.models import (
    User,
    Part,
    PartManufacturer,
    PartCategory,
    PartRequest,
    PartSale,
    Message,
)
from django.core.files.uploadedfile import SimpleUploadedFile


class UserModelTest(TestCase):
    """Test cases for the User model.
    
    Tests user creation, validation, and edge cases for the User model including
    duplicate prevention and validation for required fields.
    """

    def setUp(self):
        """Set up test data for User model tests."""
        self.user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User 3647",
            "team_number": 3647,
            "phone": "123-456-7890",
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }

    def test_create_user(self):
        """Test successful creation of a regular user with valid data."""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data["email"])
        self.assertEqual(user.team_number, self.user_data["team_number"])
        self.assertTrue(user.check_password(self.user_data["password"]))

    def test_create_superuser(self):
        """Test successful creation of a superuser (admin)."""
        admin = User.objects.create_superuser(**self.user_data)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_duplicate_email(self):
        """Test prevention of duplicate email addresses."""
        User.objects.create_user(**self.user_data)
        duplicate_data = self.user_data.copy()
        duplicate_data['phone'] = '999-999-9999'
        duplicate_data['team_number'] = 9999
        with self.assertRaises(IntegrityError):
            User.objects.create_user(**duplicate_data)

    def test_duplicate_phone(self):
        """Test prevention of duplicate phone numbers."""
        User.objects.create_user(**self.user_data)
        duplicate_data = self.user_data.copy()
        duplicate_data['email'] = 'different@example.com'
        duplicate_data['team_number'] = 9999
        with self.assertRaises(IntegrityError):
            User.objects.create_user(**duplicate_data)
    
    def test_duplicate_team_number(self):
        """Test prevention of duplicate team numbers."""
        User.objects.create_user(**self.user_data)
        duplicate_data = self.user_data.copy()
        duplicate_data['email'] = 'different@example.com'
        duplicate_data['phone'] = '999-999-9999'
        with self.assertRaises(IntegrityError):
            User.objects.create_user(**duplicate_data)

    def test_invalid_email_format(self):
        """Test validation of email format before user creation."""
        invalid_data = self.user_data.copy()
        invalid_data['email'] = 'invalid-email'
        with self.assertRaises(ValidationError):
            user = User(**invalid_data)
            user.full_clean()
            
    def test_missing_required_fields(self):
        """Test handling of missing required fields during user creation."""
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='testpass123')


class PartModelTest(TestCase):
    """Test cases for the Part model.
    
    Tests part creation, uniqueness constraints, and validation of
    file uploads and field constraints.
    """

    def setUp(self):
        """Set up test data for Part model tests."""
        self.manufacturer = PartManufacturer.objects.create(
            name="Test Manufacturer", website="http://example.com"
        )
        self.category = PartCategory.objects.create(name="Test Category")

    def test_create_part(self):
        """Test successful creation of a part with valid data."""
        part = Part.objects.create(
            name="Test Part",
            manufacturer=self.manufacturer,
            category=self.category,
            description="Test Description",
        )
        self.assertEqual(part.name, "Test Part")
        self.assertEqual(part.manufacturer, self.manufacturer)

    def test_unique_part_constraint(self):
        """Test prevention of duplicate parts with same name and manufacturer."""
        Part.objects.create(
            name="Test Part", manufacturer=self.manufacturer, category=self.category
        )
        with self.assertRaises(Exception):
            Part.objects.create(
                name="Test Part", manufacturer=self.manufacturer, category=self.category
            )

    def test_invalid_image_file(self):
        """Test validation of image file uploads for parts."""
        part = Part(
            name="Test Part",
            manufacturer=self.manufacturer,
            category=self.category
        )
        part.image = SimpleUploadedFile(
            "test.txt",
            b"file_content",
            content_type="text/plain"
        )
        with self.assertRaises(ValidationError):
            part.full_clean()


class MessageModelTest(TestCase):
    """Test cases for the Message model.
    
    Tests message creation, validation, and various messaging scenarios
    including self-messaging and required field validation.
    """

    def setUp(self):
        """Set up test data for Message model tests."""
        self.user1 = User.objects.create_user(
            email="user1@example.com", password="pass123", team_number=3647,phone="123-456-7890"
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com", password="pass123", team_number=5678,phone="234-567-8901"
        )

    def test_create_message(self):
        """Test successful creation of a message between two users."""
        message = Message.objects.create(
            sender=self.user1, receiver=self.user2, message="Test message"
        )
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.message, "Test message")
        self.assertFalse(message.is_read)

    def test_empty_message(self):
        """Test prevention of empty message content."""
        with self.assertRaises(ValidationError):
            message = Message(
                sender=self.user1,
                receiver=self.user2,
                message=""
            )
            message.full_clean()

    def test_self_messaging(self):
        """Test handling of messages sent to self."""
        message = Message.objects.create(
            sender=self.user1,
            receiver=self.user1,  # Same user as sender
            message="Self message"
        )
        self.assertEqual(message.sender, message.receiver)

    def test_missing_sender_receiver(self):
        """Test handling of messages with missing sender or receiver."""
        with self.assertRaises(IntegrityError):
            Message.objects.create(
                message="Test message"
            )


class PartRequestModelTest(TestCase):
    """Test cases for the PartRequest model.
    
    Tests part request creation, validation of quantities and prices,
    and relationship constraints with parts and users.
    """

    def setUp(self):
        """Set up test data for PartRequest model tests."""
        self.user = User.objects.create_user(
            email="requester@example.com",
            password="testpass123",
            full_name="Test Requester",
            team_number=3647,
            phone="555-123-4567",
            address="123 Test St"
        )
        self.manufacturer = PartManufacturer.objects.create(
            name="Test Manufacturer",
            website="http://example.com"
        )
        self.category = PartCategory.objects.create(name="Test Category")
        self.part = Part.objects.create(
            name="Test Part",
            manufacturer=self.manufacturer,
            category=self.category
        )

    def test_create_part_request(self):
        """Test successful creation of a part request with valid data."""
        part_request = PartRequest.objects.create(
            part=self.part,
            user=self.user,
            quantity=2,
            needed_for="Competition",
            bid_price=50.00
        )
        self.assertEqual(part_request.quantity, 2)
        self.assertEqual(part_request.user, self.user)
        self.assertEqual(part_request.part, self.part)
        self.assertEqual(float(part_request.bid_price), 50.00)
        self.assertIsNotNone(part_request.request_date)


    def test_null_part_field(self):
        """Test handling of missing part reference in requests."""
        with self.assertRaises(IntegrityError):
            PartRequest.objects.create(
                part=None,
                user=self.user,
                quantity=1,
                needed_for="Testing",
                bid_price=10.00
            )


class PartSaleModelTest(TestCase):
    """Test cases for the PartSale model.
    
    Tests part sale creation, validation of prices and quantities,
    and relationship constraints with parts and users.
    """

    def setUp(self):
        """Set up test data for PartSale model tests."""
        self.user = User.objects.create_user(
            email="seller@example.com",
            password="testpass123",
            full_name="Test Seller",
            team_number=5678,
            phone="555-987-6543",
            address="456 Test Ave"
        )
        self.manufacturer = PartManufacturer.objects.create(
            name="Sale Manufacturer",
            website="http://example.com"
        )
        self.category = PartCategory.objects.create(name="Sale Category")
        self.part = Part.objects.create(
            name="Sale Part",
            manufacturer=self.manufacturer,
            category=self.category
        )

    def test_create_part_sale(self):
        """Test successful creation of a part sale with valid data."""
        part_sale = PartSale.objects.create(
            part=self.part,
            user=self.user,
            quantity=1,
            ask_price=75.50,
            condition="New",
            additional_info="Never used"
        )
        self.assertEqual(part_sale.quantity, 1)
        self.assertEqual(part_sale.user, self.user)
        self.assertEqual(part_sale.part, self.part)
        self.assertEqual(float(part_sale.ask_price), 75.50)
        self.assertEqual(part_sale.condition, "New")
        self.assertIsNotNone(part_sale.sale_creation_date)
        
    def test_missing_part_in_sale(self):
        """Test handling of missing part reference in sales."""
        with self.assertRaises(IntegrityError):
            PartSale.objects.create(
                part=None,
                user=self.user,
                quantity=1,
                ask_price=25.00,
                condition="Used"
            )
