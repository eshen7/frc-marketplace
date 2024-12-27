import uuid
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.conf import settings
from django.db import models
from phone_field import PhoneField
from address.models import AddressField, Address, Locality
import logging
import os
from django.core.exceptions import ValidationError

# Default address for superusers
DEFAULT_ADDRESS = {"raw": "1001 Avenida De Las Americas, Houston, TX 77010"}


def validate_image_file(value):
    # 5MB limit
    max_size = 5 * 1024 * 1024
    if value.size > max_size:
        raise ValidationError("File size must be no more than 5MB.")

    # Check file extension
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    if ext not in valid_extensions:
        raise ValidationError(
            "Unsupported file extension. Use jpg, jpeg, png, webp, or gif."
        )


def part_image_path(instance, filename):
    """Generate file path for part image."""
    return f"parts/{instance.manufacturer.name}/{instance.category.name}/{filename}"


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

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """User model."""

    full_name = models.CharField(max_length=255, null=True, blank=True)
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

    name = models.CharField(max_length=255, null=False, blank=False)
    model_id = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(null=True, blank=True)
    category = models.ForeignKey(
        "PartCategory", on_delete=models.PROTECT, related_name="parts", null=True
    )
    manufacturer = models.ForeignKey(
        "PartManufacturer", on_delete=models.PROTECT, related_name="parts", null=True
    )
    image = models.ImageField(
        upload_to=part_image_path,
        null=True,
        blank=True,
        validators=[validate_image_file],
    )


class PartManufacturer(models.Model):
    """Part Manufacturer Model."""

    name = models.CharField(max_length=255, unique=True)
    website = models.URLField(null=True, blank=True)


class PartCategory(models.Model):
    """Part Category Model."""

    name = models.CharField(max_length=255, unique=True)


class PartRequest(models.Model):
    """Part Request Model."""

    part = models.ForeignKey(Part, on_delete=models.PROTECT, related_name="requests")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="requests")
    quantity = models.IntegerField(default=1)
    request_date = models.DateField(auto_now_add=True)
    needed_date = models.DateField(null=True, blank=True)
    needed_for = models.CharField(max_length=255, null=True, blank=True)
    additional_info = models.TextField(null=True, blank=True)
    bid_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    ) # -1 if they are willing to trade, 0 for donation


class PartSale(models.Model):
    """Part Sale Model."""

    part = models.ForeignKey(Part, on_delete=models.PROTECT, related_name="sales")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sales")
    quantity = models.IntegerField(default=1)
    sale_creation_date = models.DateField(auto_now_add=True)
    ask_price = models.DecimalField(max_digits=10, decimal_places=2) # -1 if trade, 0 for FREE
    additional_info = models.TextField(null=True, blank=True)
    condition = models.CharField(max_length=255, null=True, blank=True)


class Message(models.Model):
    """Message Model."""

    id = models.UUIDField(primary_key=True, unique=True)
    sender = models.ForeignKey(
        User, related_name="sent_messages", on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User, related_name="received_messages", on_delete=models.CASCADE
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} to {self.receiver}: {self.message}"
