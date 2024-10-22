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
        """protocol for creating users"""
        if not email:
            raise ValueError("Email is required!")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """user model"""
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    team_name = models.CharField()
    team_number = models.IntegerField(unique=True)
    phone = PhoneField(unique=True)
    address = AddressField()
    password = models.CharField(max_length=128)  # store hashed password
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["team_name", "team_number","phone"]

    def __str__(self):
        return self.UUID

    def set_password(self, raw_password):
        """hashes password and stores it"""
        super().set_password(raw_password=raw_password)
