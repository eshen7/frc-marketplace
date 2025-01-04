# serializers.py
from django.forms import ValidationError
from rest_framework import serializers
from .models import (
    PartSale,
    User,
    Part,
    PartRequest,
    Message,
    PartManufacturer,
    PartCategory,
)
import googlemaps
from address.models import State, Country, Locality, Address
from decouple import config
from utils.geolocation import get_coordinates
from utils.blueAlliance import getTeamName
from django.core.files.images import get_image_dimensions


class UserSerializer(serializers.ModelSerializer):
    address = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "full_name",
            "address",
            "date_joined",
            "team_name",
            "team_number",
            "profile_photo",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = ["id", "date_joined"]

    def create_address_from_components(self, components, raw_address: str) -> Address:
        """Create storable Address object from Google Maps components"""

        def get_component(component_type):
            for component in components:
                if component_type in component["types"]:
                    return component["long_name"]
            return None

        # Handle optional components
        country_name = get_component("country") or "Unknown"
        country, _ = Country.objects.get_or_create(name=country_name)

        state_name = get_component("administrative_area_level_1") or "Unknown"
        state, _ = State.objects.get_or_create(name=state_name, country=country)

        locality_name = get_component("locality") or "Unknown"
        locality, _ = Locality.objects.get_or_create(
            name=locality_name,
            state=state,
            defaults={"postal_code": get_component("postal_code") or "N/A"},
        )

        lat, lon = get_coordinates(raw_address)

        # Create address (full or partial)
        address = Address.objects.create(
            street_number=get_component("street_number") or "",
            route=get_component("route") or "",
            locality=locality,
            raw=raw_address,
            latitude=lat,
            longitude=lon,
        )

        return address

    def validate_address(self, value) -> Address:
        try:
            gmaps = googlemaps.Client(key=config("GOOGLE_API_KEY"))

            # Geocode the address
            geocode_result = gmaps.geocode(value)

            if not geocode_result:
                raise ValidationError("Could not verify the provided address")

            formatted_address = geocode_result[0]["formatted_address"]

            existing_address = Address.objects.filter(raw=formatted_address).first()
            if existing_address:
                return existing_address

            # Create new address if it doesn't exist in the database
            return self.create_address_from_components(
                geocode_result[0]["address_components"], formatted_address
            )

        except Exception as e:
            raise ValidationError(f"Invalid address: {str(e)}")

    def create(self, validated_data):
        team_number = validated_data.get("team_number")

        # Use the getTeamName function to fetch the team name
        if team_number:
            team_name = getTeamName(team_number)
            validated_data["team_name"] = team_name

        return User.objects.create_user(**validated_data)

    def to_representation(self, instance):
        """Output representation"""
        representation = super().to_representation(instance)

        if instance.address:
            representation["formatted_address"] = {
                #         "street_number": instance.address.street_number,
                #         "street": instance.address.route,
                #         "city": instance.address.locality.name,
                #         "state": instance.address.locality.state.name,
                #         "postal_code": instance.address.locality.postal_code,
                #         "country": instance.address.locality.state.country.name,
                "raw": instance.address.raw,
                "latitude": instance.address.latitude,
                "longitude": instance.address.longitude,
            }

        representation.pop("password", None)
        representation.pop("is_active", None)
        representation.pop("is_staff", None)
        representation.pop("is_superuser", None)
        
        return representation


class PublicUserSerializer(serializers.ModelSerializer):
    """Public serializer for the User model."""

    class Meta:
        model = User
        fields = ["team_name", "team_number", "profile_photo", "address"]

    def to_representation(self, instance):
        """Output representation"""
        representation = super().to_representation(instance)

        if instance.address:
            representation["formatted_address"] = {
                "city": instance.address.locality.name,
                "state": instance.address.locality.state.name,
                "latitude": instance.address.latitude,
                "longitude": instance.address.longitude,
            }

        return representation


class PartSerializer(serializers.ModelSerializer):
    """Serializer for the Part model."""

    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=PartManufacturer.objects.all(), source="manufacturer"
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=PartCategory.objects.all(), source="category"
    )
    model_id = serializers.CharField(
        allow_blank=True, allow_null=True, required=False, default=None
    )

    class Meta:
        model = Part
        fields = [
            "id",
            "name",
            "manufacturer_id",
            "category_id",
            "model_id",
            "description",
            "image",
            "link",
        ]

    def validate_image(self, value):
        if value:
            # Check image dimensions
            width, height = get_image_dimensions(value)
            if width > 4096 or height > 4096:
                raise serializers.ValidationError(
                    "Image dimensions must be no greater than 4096x4096"
                )
        return value

    def create(self, validated_data):
        """Create a new Part instance."""
        manufacturer = validated_data.pop("manufacturer")
        category = validated_data.pop("category")
        image = validated_data.pop("image", None)
        part = Part.objects.create(
            manufacturer=manufacturer, category=category, image=image, **validated_data
        )
        return part

    def to_representation(self, instance):
        """Customize the serialized output."""
        data = super().to_representation(instance)
        data["manufacturer"] = PartManufacturerSerializer(instance.manufacturer).data
        data["category"] = PartCategorySerializer(instance.category).data
        data["image"] = instance.image.url if instance.image else None
        return data


class PartManufacturerSerializer(serializers.ModelSerializer):
    """Serializer for the PartManufacturer model."""

    class Meta:
        model = PartManufacturer
        fields = ["id", "name", "website"]


class PartCategorySerializer(serializers.ModelSerializer):
    """Serializer for the PartCategory model."""

    class Meta:
        model = PartCategory
        fields = ["id", "name"]


class PartRequestSerializer(serializers.ModelSerializer):
    """Serializer for the PartRequest model."""

    # Include part_id for write operations
    part_id = serializers.PrimaryKeyRelatedField(
        queryset=Part.objects.all(), source="part", write_only=True
    )

    class Meta:
        model = PartRequest
        fields = [
            "id",  # For referencing the request itself
            "part_id",  # For referencing the part by its ID
            "quantity",
            "request_date",
            "needed_date",
            "needed_for",
            "additional_info",
        ]
        read_only_fields = ["user", "request_date"]

    def create(self, validated_data):
        """Add the requesting user to the validated data."""
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)

    def to_representation(self, instance):
        """Customize the serialized output."""
        data = super().to_representation(instance)

        # Optionally include `user` or other computed fields here
        data["part"] = PartSerializer(instance.part).data  # Include part details
        data["user"] = PublicUserSerializer(instance.user).data  # Include user details
        return data


class PartSaleSerializer(serializers.ModelSerializer):
    """Serializer for the PartSale model."""

    part_id = serializers.PrimaryKeyRelatedField(
        queryset=Part.objects.all(), source="part", write_only=True
    )

    class Meta:
        model = PartSale
        fields = [
            "id",  # self reference
            "part_id",  # part reference
            "ask_price",
            "quantity",
            "sale_creation_date",
            "additional_info",
            "condition",
        ]
        read_only_fields = ["user", "sale_creation_date"]

    def create(self, validated_data):
        """Add the selling user to the validated data."""
        user = self.context["sale"].user
        validated_data["user"] = user
        return super().create(validated_data)

    def to_representation(self, instance):
        """Customize the serialized output."""
        data = super().to_representation(instance)

        data["part"] = PartSerializer(instance.part).data
        data["user"] = PublicUserSerializer(instance.user).data
        return data


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender", "receiver", "message", "timestamp"]

    def get_sender(self, obj):
        return obj.sender.team_number

    def get_receiver(self, obj):
        return obj.receiver.team_number

    def create(self, validated_data):
        # For POST requests, use ids for sender and receiver
        sender_id = self.context["request"].user.id
        receiver_id = validated_data.pop("receiver_id")
        receiver = User.objects.get(id=receiver_id)

        return Message.objects.create(
            sender_id=sender_id, receiver=receiver, **validated_data
        )
