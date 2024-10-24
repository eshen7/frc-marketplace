from django.urls import path
from .views import user_views, part_views, part_request_views

urlpatterns = [
    path("users/", user_views, name="user_views"),
    path("parts/", part_views, name = "part_views"),
    path("requests/", part_views, name = "part_request_views"),
]
