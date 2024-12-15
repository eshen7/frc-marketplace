from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        logger.info(f"Connecting to room: {self.room_name}")

        try:
            channel_layer = self.channel_layer
            if channel_layer:
                test_message = "Redis connectivity test"
                await channel_layer.send("test_channel", {"type": "test.message", "message": test_message})
                logger.info("Redis connection successful")
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"Added to Redis group: {self.room_group_name}")
            await self.accept()  # Accept the WebSocket connection
            logger.info(f"WebSocket connection established: {self.channel_name}")
        except Exception as e:
            logger.error(f"Error during WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Disconnecting from room: {self.room_name}")
        logger.info(f"close_code: {close_code}")
        try:
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"Removed from Redis group: {self.room_group_name}")
        except Exception as e:
            logger.error(f"Error during WebSocket disconnection: {e}")

    async def receive(self, text_data):
        logger.info(f"Received WebSocket message: {text_data}")
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            sender = data.get('sender_id', '')
            receiver = data.get('receiver_id', '')


            # Send message to the room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'receiver': receiver,
                    'sender': sender,
                }
            )
            logger.info(f"Sent message to Redis group: {self.room_group_name}")
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        receiver = event['receiver']
        logger.info(f"Processing group message: {message}\nsender: {sender}\n receiver: {receiver}")
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'receiver': receiver,
        }))