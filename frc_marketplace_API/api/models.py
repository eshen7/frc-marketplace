import uuid
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from phone_field import PhoneField
from address.models import AddressField, Address, Locality
import logging

logger = logging.getLogger(__name__)


def default_address():
    """Create and return a default address."""

    addr_data = {
        "raw": "1001 Avenida De Las Americas, Houston, TX 77010"  # George R. Brown Convention Center
    }
    addr, _ = Address.objects.get_or_create(**addr_data)
    return addr


class UserManager(BaseUserManager):
    """User manager for each account."""

    def create_user(self, email, password=None, **extra_fields):
        """Protocol to create regular users."""
        if not email:
            raise ValueError("Email is required!")
        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)

        user.save(using=self._db)
        return user
    
    
    def create_superuser(self, email, password, **extra_fields):
        """Protocol to create superusers (admins)."""

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        # Set the default address if it's not provided (superuser only)
        extra_fields.setdefault("address", default_address())

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """User model."""

    email = models.EmailField(unique=True)
    team_name = models.CharField(max_length=255, null=True, blank=True)
    team_number = models.IntegerField(unique=True, null=True, blank=True)
    phone = PhoneField(unique=True, null=True, blank=True)
    address = AddressField(on_delete=models.SET_NULL, null=True, blank=True)
    password = models.CharField(max_length=128)  # Store hashed password

    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Default user is not staff
    is_superuser = models.BooleanField(default=False)  # Default user is not superuser
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Hashes password and stores it."""
        super().set_password(raw_password=raw_password)

class Part(models.Model):
    """Part Model."""

    name = models.CharField(max_length=255)
    description = models.CharField(null=True, blank=True)
    picture = models.ImageField(upload_to='parts/', null=True, blank=True)


class PartRequest(models.Model):
    """Part Request Model."""

    part = models.ForeignKey(Part, on_delete=models.PROTECT, related_name='requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    quantity = models.IntegerField(default=1)
    request_date = models.DateField(auto_now_add=True)