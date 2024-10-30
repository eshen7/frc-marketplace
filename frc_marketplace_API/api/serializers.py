# serializers.py
from django.forms import ValidationError
from rest_framework import serializers
from .models import User, Part, PartRequest
from address.models import Address
import googlemaps
from address.models import State, Country, Locality
from decouple import config


class UserSerializer(serializers.ModelSerializer):
    address = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "address",
            "UUID",
            "date_joined",
            "team_name",
            "team_number",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = ["UUID", "date_joined"]

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

        # Create address (full or partial)
        address = Address.objects.create(
            street_number=get_component("street_number") or "",
            route=get_component("route") or "",
            locality=locality,
            raw=raw_address,
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
        return User.objects.create_user(**validated_data)

    def to_representation(self, instance):
        """Output representation"""
        representation = super().to_representation(instance)

        if instance.address:
            representation["formatted_address"] = {
                "street_number": instance.address.street_number,
                "street": instance.address.route,
                "city": instance.address.locality.name,
                "state": instance.address.locality.state.name,
                "postal_code": instance.address.locality.postal_code,
                "country": instance.address.locality.state.country.name,
                "raw": instance.address.raw,
            }

        # Remove the write-only address field from the output
        representation.pop("address", None)

        return representation


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