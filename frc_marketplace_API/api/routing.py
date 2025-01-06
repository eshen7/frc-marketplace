from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^wss/user/(?P<team_number>\d+)/$', consumers.UserConsumer.as_asgi()),
]