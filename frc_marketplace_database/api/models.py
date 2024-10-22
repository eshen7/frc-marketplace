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

from django.db import models
from phone_field import PhoneField
from address.models import AddressField

class PartRequest(models.Model):
    pass

class User(models.Model):
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    team_name = models.CharField()
    team_number = models.IntegerField(unique=True)
    phone = PhoneField(unique=True)
    address = AddressField()
    password = models.CharField(max_length=128) # store hashed password

    def set_password(self, raw_password):
        """Hashes password and stores it"""


# poop