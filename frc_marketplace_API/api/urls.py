from django.urls import path
from .views import user_views

urlpatterns = [
    path("users/", user_views, name="user_views"),
]
