from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User

# Register your models here.


class UserAdmin(BaseUserAdmin):
    """display configuration for User object"""
    list_display = ('email', 'team_name', 'team_number', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'date_joined', 'team_name')
    search_fields = ('email', 'team_name', 'team_number')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('team_name', 'team_number', 'phone', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'team_name', 'team_number', 'is_active', 'is_staff'),
        }),
    )

admin.site.register(User, UserAdmin)

