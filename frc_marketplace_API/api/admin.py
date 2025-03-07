from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Part, PartRequest, PartSale

# Register your models here.


class UserAdmin(BaseUserAdmin):
    """display configuration for User object"""

    list_display = (
        "id",
        "email",
        "team_name",
        "team_number",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = ("is_active", "is_staff", "date_joined", "team_name")
    list_editable = (
        "email",
        "team_name",
        "team_number",
        "is_active",
        "is_active",
        "is_staff",
    )
    search_fields = ("email", "team_name", "team_number")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("team_name", "team_number", "phone", "address")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "team_name",
                    "team_number",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Part)
admin.site.register(PartRequest)
admin.site.register(PartSale)
