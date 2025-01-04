from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import User, Part, PartManufacturer, PartCategory, Message, PartRequest, PartSale
import uuid
from datetime import datetime, timedelta

class UserViewsTest(TestCase):
    def setUp(self):
        # Create a test client and user data for testing
        self.client = APIClient()
        self.user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "team_number": 3647,
            "phone": "123-456-7890",
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_registration(self):
        """Test successful user registration with valid data"""
        new_user_data = {
            "email": "new@example.com",
            "password": "newpass123",
            "full_name": "New User",
            "team_number": 5678,
            "phone": "123-455-7890",
            "address": "1001 Avenida De Las Americas, Houston, TX 77010",
        }
        response = self.client.post("/api/users/", new_user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_duplicate_user_registration(self):
        """Test registration with duplicate email and team number"""
        response = self.client.post("/api/users/", self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_registration(self):
        """Test registration with invalid email format"""
        invalid_data = self.user_data.copy()
        invalid_data['email'] = "invalid-email"
        response = self.client.post("/api/users/", invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test successful user login"""
        login_data = {"email": "test@example.com", "password": "testpass123"}
        response = self.client.post("/api/login/", login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_login(self):
        """Test login with wrong credentials"""
        login_data = {"email": "test@example.com", "password": "wrongpass"}
        response = self.client.post("/api/login/", login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_change(self):
        """Test successful password change"""
        self.client.force_authenticate(user=self.user)
        password_data = {
            "current": "testpass123",
            "new": "newpass123",
            "confirmation": "newpass123"
        }
        response = self.client.put("/api/change-password/", password_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_password_change(self):
        """Test password change with wrong current password"""
        self.client.force_authenticate(user=self.user)
        password_data = {
            "current": "wrongpass",
            "new": "newpass123",
            "confirmation": "newpass123"
        }
        response = self.client.put("/api/change-password/", password_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    

class MessageViewsTest(TestCase):
    def setUp(self):
        # Create test users and authenticate user1
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email="user1@example.com", password="pass123", team_number=3647, phone="364756789"
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com", password="pass123", team_number=5678, phone="3647567890"
        )
        self.client.force_authenticate(user=self.user1)

    def test_send_message(self):
        """Test successful message sending"""
        message_data = {
            "id": str(uuid.uuid4()),
            "message": "Test message",
            "receiver": 5678,
        }
        response = self.client.post("/api/message/", message_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)

    def test_send_message_to_nonexistent_user(self):
        """Test sending message to non-existent user"""
        message_data = {
            "id": str(uuid.uuid4()),
            "message": "Test message",
            "receiver": 9999,
        }
        response = self.client.post("/api/message/", message_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_conversation(self):
        """Test retrieving conversation between two users"""
        Message.objects.create(
            id=uuid.uuid4(),
            sender=self.user1,
            receiver=self.user2,
            message="Test message"
        )
        response = self.client.get(f"/api/message/{self.user2.team_number}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
class PartViewsTest(TestCase):
    def setUp(self):
        # Create test data for parts
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
        """Test successful part creation"""
        response = self.client.post("/api/parts/", self.part_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), 1)

    def test_create_duplicate_part(self):
        """Test creating duplicate part"""
        self.client.post("/api/parts/", self.part_data, format="json")
        response = self.client.post("/api/parts/", self.part_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_manufacturer(self):
        """Test creating part with non-existent manufacturer"""
        invalid_data = self.part_data.copy()
        invalid_data['manufacturer_id'] = str(uuid.uuid4())
        response = self.client.post("/api/parts/", invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class RequestSaleViewsTest(TestCase):
    def setUp(self):
        # Create test users and parts for request/sale testing
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="pass123", team_number=3647
        )
        self.manufacturer = PartManufacturer.objects.create(name="Test Manufacturer")
        self.category = PartCategory.objects.create(name="Test Category")
        self.part = Part.objects.create(
            name="Test Part",
            manufacturer=self.manufacturer,
            category=self.category
        )
        self.client.force_authenticate(user=self.user)
        self.id = self.client.get("/api/users/self/").data["id"]
        self.request_headers = {"Content-Type": "application/json","X-User-ID":self.id}

    def test_create_request(self):
        """Test successful part request creation"""
        request_data = {
            "part_id": str(self.part.id),
            "quantity": 5,
            "needed_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "additional_info": "Test request"
        }
        response = self.client.post("/api/requests/", data=request_data, format="json", headers=self.request_headers)
        self.assertEqual(
        response.status_code,
        status.HTTP_201_CREATED,
        f"Expected status 201, got {response.status_code}. Response: {response.content}"
    )

    def test_create_sale(self):
        """Test successful part sale creation"""
        sale_data = {
            "part_id": str(self.part.id),
            "quantity": 5,
            "ask_price": "100.00",
            "condition": "new",
            "additional_info": "Test sale"
        }
        response = self.client.post("/api/sales/", data=sale_data, format="json",headers=self.request_headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)