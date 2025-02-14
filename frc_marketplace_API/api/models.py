import uuid
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from phone_field import PhoneField
from address.models import AddressField, Address, Locality
import logging
import os
from django.core.exceptions import ValidationError
from django.utils import timezone

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

        if "team_number" in extra_fields and extra_fields["team_number"] is not None:
            user.profile_photo = f"https://www.thebluealliance.com/avatar/2025/frc{extra_fields['team_number']}.png"

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """Protocol to create superusers (admins)."""

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        # Set default random phone number for superusers
        import random

        extra_fields.setdefault("phone", f"+1{random.randint(1000000000, 9999999999)}")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """User model."""

    full_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    team_name = models.CharField(max_length=255, null=True, blank=True)
    team_number = models.IntegerField(unique=True, null=True, blank=True)
    profile_photo = models.URLField(unique=True, null=True, blank=True)
    phone = PhoneField(unique=True, null=True, blank=True)
    address = AddressField(on_delete=models.SET_NULL, null=True, blank=True)
    password = models.CharField(max_length=128)  # Store hashed password

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_active = models.BooleanField(default=False)  # Manual user auth
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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    link = models.URLField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "manufacturer"],
                name="unique_part",
            )
        ]


class PartManufacturer(models.Model):
    """Part Manufacturer Model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    website = models.URLField(null=True, blank=True)


class PartCategory(models.Model):
    """Part Category Model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)


class PartRequest(models.Model):
    """Part Request Model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    part = models.ForeignKey(Part, on_delete=models.PROTECT, related_name="requests")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="requests")
    quantity = models.IntegerField(default=1)
    request_date = models.DateField(auto_now_add=True)
    needed_date = models.DateField(null=True, blank=True)
    needed_for = models.CharField(max_length=255, null=True, blank=True)
    additional_info = models.TextField(null=True, blank=True)
    bid_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )  # -1 if they are willing to trade, 0 for donation
    # is_open = models.BooleanField(default=True) ADD IN V2

    # New fields
    is_fulfilled = models.BooleanField(default=False)
    fulfilled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='fulfilled_requests'
    )
    fulfillment_date = models.DateTimeField(null=True, blank=True)
    requires_return = models.BooleanField(default=False)
    is_returned = models.BooleanField(default=False)
    return_date = models.DateTimeField(null=True, blank=True)
    event_key = models.CharField(max_length=20, null=True, blank=True)  # TBA event key

    def save(self, *args, **kwargs):
        # Auto-update fulfillment date when request is fulfilled
        if self.is_fulfilled and not self.fulfillment_date:
            self.fulfillment_date = timezone.now()
        # Auto-update return date when item is returned
        if self.is_returned and not self.return_date:
            self.return_date = timezone.now()
        super().save(*args, **kwargs)


class PartSale(models.Model):
    """Part Sale Model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    part = models.ForeignKey(Part, on_delete=models.PROTECT, related_name="sales")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sales")
    quantity = models.IntegerField(default=1)
    sale_creation_date = models.DateField(auto_now_add=True)
    ask_price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # -1 if trade, 0 for FREE
    additional_info = models.TextField(null=True, blank=True)
    condition = models.CharField(max_length=255, null=True, blank=True)
    # is_listed = models.BooleanField(default=True) ADD IN V2

    # New fields
    is_sold = models.BooleanField(default=False)
    sold_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='purchased_items'
    )
    sale_date = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-update sale date when item is marked as sold
        if self.is_sold and not self.sale_date:
            self.sale_date = timezone.now()
        super().save(*args, **kwargs)


class Message(models.Model):
    """Message Model."""

    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    sender = models.ForeignKey(
        User, related_name="sent_messages", on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User, related_name="received_messages", on_delete=models.CASCADE
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender} to {self.receiver}: {self.message}"
