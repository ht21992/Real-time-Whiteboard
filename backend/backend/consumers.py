import json
from channels.generic.websocket import AsyncWebsocketConsumer


class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("whiteboard", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("whiteboard", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            "whiteboard", {"type": "update_whiteboard", "data": data}
        )

    async def update_whiteboard(self, event):
        await self.send(text_data=json.dumps(event["data"]))
