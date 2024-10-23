# PART REQUESTS
# Title
# Photos
# Part name
# Model specs
# Need by
# Need it for what
# Extra info
# Condition of part
# Team requesting

import uuid

from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from phone_field import PhoneField
from address.models import AddressField


class UserManager(BaseUserManager):
    """user manager for each account"""

    def create_user(self, email, password=None, **extra_fields):
        """protocol to create regular users"""
        if not email:
            raise ValueError("Email is required!")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """protocol to create superusers (admin)"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser is_staff field is required!')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser is_superuser field is required!')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser,PermissionsMixin):
    """user model"""
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    team_name = models.CharField()
    team_number = models.IntegerField(unique=True)
    phone = PhoneField(unique=True)
    address = AddressField(null=True, blank=True)
    password = models.CharField(max_length=128)  # store hashed password
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) # base user is not staff by default
    is_superuser = models.BooleanField(default=False) # base user is not superuser by default
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["team_name", "team_number","phone","address"]

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """hashes password and stores it"""
        super().set_password(raw_password=raw_password)

