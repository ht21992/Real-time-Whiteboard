from django.urls import path
from backend.consumers import WhiteboardConsumer

websocket_urlpatterns = [
    path("ws/whiteboard/", WhiteboardConsumer.as_asgi()),
]
