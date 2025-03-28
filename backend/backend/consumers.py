import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

CACHE_KEY = "whiteboard_drawings"


class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("whiteboard", self.channel_name)
        await self.accept()

        # Retrieve stored drawings from cache and send to the new user
        drawings = cache.get(CACHE_KEY, [])

        if drawings:
            bg_color = cache.get("background_color", "#FAF9F6")  # Default color
            await self.send(
                text_data=json.dumps(
                    {"type": "state", "drawings": drawings, "background": bg_color}
                )
            )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("whiteboard", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data["type"] == "draw":
            # Append new drawing data to the cache
            drawings = cache.get(CACHE_KEY, [])
            drawings.append(data)
            cache.set(CACHE_KEY, drawings, timeout=60 * 60)  # Keep data for 1 hour

        elif data["type"] == "clear":
            cache.set(CACHE_KEY, [])  # Clear stored drawings

        elif data["type"] == "background":
            # Store background color in cache
            cache.set("background_color", data["color"], timeout=60 * 60)

        elif data["type"] == "request_state":
            drawings = cache.get(CACHE_KEY, [])
            bg_color = cache.get("background_color", "#FAF9F6")  # Default color
            await self.send(
                text_data=json.dumps(
                    {"type": "state", "drawings": drawings, "background": bg_color}
                )
            )

        # Broadcast the message to all connected clients
        await self.channel_layer.group_send(
            "whiteboard", {"type": "update_whiteboard", "data": data}
        )

    async def update_whiteboard(self, event):
        await self.send(text_data=json.dumps(event["data"]))
