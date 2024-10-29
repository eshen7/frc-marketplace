from django.urls import path
from .views import user_views, part_views, part_request_views, login_view

urlpatterns = [
    path("users/", user_views, name="user_views"),
    path("parts/", part_views, name = "part_views"),
    path("requests/", part_request_views, name = "part_request_views"),
    path("login/", login_view, name="login_views"),
]
