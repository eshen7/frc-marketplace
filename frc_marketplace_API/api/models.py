import uuid
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from phone_field import PhoneField
from address.models import AddressField, Address, Locality


def default_address():
    """Create and return a default address."""
    # Create a default Address instance using the recommended structure
    addr_data = {
        'raw': '1001 Avenida De Las Americas, Houston, TX 77010'
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
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        # Set the default address if it's not provided
        extra_fields.setdefault('address', default_address())

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser is_staff field is required!')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser is_superuser field is required!')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """User model."""
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    team_name = models.CharField(max_length=255,null=True,blank=True)
    team_number = models.IntegerField(unique=True,null=True,blank=True)
    phone = PhoneField(unique=True,null=True,blank=True)
    address = AddressField(on_delete=models.SET_NULL, null=True, blank=True)
    password = models.CharField(max_length=128)  # Store hashed password
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Default user is not staff
    is_superuser = models.BooleanField(default=False)  # Default user is not superuser
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields other than email

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Hashes password and stores it."""
        super().set_password(raw_password=raw_password)
