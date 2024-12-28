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
            sender = data.get('sender', '')
            receiver = data.get('receiver', '')
            id = data.get('id', '')


            # Send message to the room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': id,
                    'message': message,
                    'receiver': receiver,
                    'sender': sender,
                }
            )
            logger.info(f"Sent message to Redis group: {self.room_group_name}")

            await self.channel_layer.group_send(
                "all_chat_messages",
                {
                    'type': 'chat_message',
                    'id': id,
                    'message': message,
                    'receiver': receiver,
                    'sender': sender,
                }
            )
            logger.info("Sent message to global group: all_chat_messages")
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        receiver = event['receiver']
        id = event['id']
        logger.info(f"Processing group message: {message}\nsender: {sender}\n receiver: {receiver}\nid: {id}")
        await self.send(text_data=json.dumps({
            'id': id,
            'message': message,
            'sender': sender,
            'receiver': receiver,
        }))

class GlobalMessagesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1) Add this client to a group (everyone listening for all messages)
        await self.channel_layer.group_add("all_chat_messages", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # 2) Remove this client from that group
        await self.channel_layer.group_discard("all_chat_messages", self.channel_name)

    # We won’t handle direct receives here, just broadcast from server -> clients
    async def receive(self, text_data):
        pass

    # 3) This method is invoked when our server code does group_send(type="chat_message")
    async def chat_message(self, event):
        """
        event might look like:
        {
          'type': 'chat_message',
          'sender_team': 1234,
          'receiver_team': 9999,
          'timestamp': '2024-01-02T12:34:56.789Z',
          'message': 'Hello World',
        }
        """
        await self.send(text_data=json.dumps(event))