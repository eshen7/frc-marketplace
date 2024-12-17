from django.urls import path
from .views import user_views, part_views, part_request_views, login_view, logout_view, get_logged_in_user_view, change_password_view, delete_user_view, user_by_team_number_view, request_view, message_get_view, message_post_view

urlpatterns = [
    path("users/", user_views, name="user_views"),
    path("users/self/", get_logged_in_user_view, name="get_logged_in_user_view"),
    path("parts/", part_views, name = "part_views"),
    path("requests/", part_request_views, name = "part_request_views"),
    path("requests/<str:request_id>/", request_view, name = "request_view"),
    path("login/", login_view, name="login_views"),
    path("logout/", logout_view, name="logout_views"),
    path("change-password/", change_password_view, name="change_password"),
    path("users/self/delete/", delete_user_view, name="delete_user_view"),
    path("users/frc<str:team_number>/", user_by_team_number_view, name="user_detail"),
    path("message/<str:team_number>/", message_get_view, name="message_get_view"),
    path("message/", message_post_view, name="message_post_view"),
]
