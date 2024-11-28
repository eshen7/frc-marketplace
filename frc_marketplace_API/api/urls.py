from django.urls import path
from .views import user_views, part_views, part_request_views, login_view, logout_view

urlpatterns = [
    path("users/", user_views, name="user_views"),
    path("users/self/", user_views, name="get_logged_in_user_view"),
    path("parts/", part_views, name = "part_views"),
    path("requests/", part_request_views, name = "part_request_views"),
    path("login/", login_view, name="login_views"),
    path("logout/", logout_view, name="logout_views")
]
