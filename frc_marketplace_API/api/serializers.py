from django.forms import ValidationError
from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    address = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'address', 'UUID', 'date_joined', 
                 'team_name', 'team_number', 'phone', 'is_active', 
                 'is_staff', 'is_superuser']
        read_only_fields = ["UUID", "date_joined"]

    def validate_address(self, value):
        try:
            addr, _ = Address.objects.get_or_create(raw=value)
            return addr
        except Exception as e:
            raise ValidationError(f"Invalid address: {str(e)}")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class PartSerializer(serializers.ModelSerializer):
    """Serializer for the Part model."""

    class Meta:
        model = Part
        fields = ["id", "name", "description", "picture"]


class PartRequestSerializer(serializers.ModelSerializer):
    """Serializer for the PartRequest model."""

    part = PartSerializer(read_only=True)
    part_id = serializers.PrimaryKeyRelatedField(
        queryset=Part.objects.all(), source="part", write_only=True
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )

    class Meta:
        model = PartRequest
        fields = ["id", "part", "part_id", "user_id", "quantity", "request_date"]
