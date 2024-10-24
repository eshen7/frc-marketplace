from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['UUID', 'date_joined']

class PartSerializer(serializers.ModelSerializer):
    """Serializer for the Part model."""
    
    class Meta:
        model = Part
        fields = ['id', 'name', 'description', 'picture']
        
class PartRequestSerializer(serializers.ModelSerializer):
    """Serializer for the PartRequest model."""
    
    part = PartSerializer(read_only=True)
    part_id = serializers.PrimaryKeyRelatedField(
        queryset=Part.objects.all(), source='part', write_only=True
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    
    class Meta:
        model = PartRequest
        fields = ['id', 'part', 'part_id', 'user_id', 'quantity', 'request_date']