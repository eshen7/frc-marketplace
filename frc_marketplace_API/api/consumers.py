from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import json
import logging

logger = logging.getLogger(__name__)

class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['team_number']
        self.user_group = f"user_{self.user_id}"

        logger.info(f"Connecting user to personal group: {self.user_group}")

        try:
            await self.channel_layer.group_add(
                self.user_group,
                self.channel_name
            )
            await self.accept()
            logger.info(f"WebSocket connection established for user: {self.user_id}")
        except Exception as e:
            logger.error(f"Error during WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Disconnecting user: {self.user_id}")
        try:
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )
        except Exception as e:
            logger.error(f"Error during WebSocket disconnection: {e}")

    @database_sync_to_async
    def save_message_to_db(self, sender_id, receiver_id, message_content, message_id):
        """Save message to database synchronously"""
        try:
            # Import models here to avoid circular imports
            from api.models import User, Message
            
            sender = User.objects.get(team_number=sender_id)
            receiver = User.objects.get(team_number=receiver_id)
            
            message = Message.objects.create(
                id=message_id,
                sender=sender,
                receiver=receiver,
                message=message_content,
                is_read=False
            )
            return message
        except Exception as e:
            logger.error(f"Error saving message to database: {e}")
            raise

    async def receive_json(self, content):
        logger.info(f"Received message from user {self.user_id}: {content}")
        try:
            message_type = content.get('type')
            
            if message_type == 'chat_message':
                sender = content.get('sender')
                receiver = content.get('receiver')
                message = content.get('message')
                message_id = content.get('id')

                # Save message to database first
                try:
                    saved_message = await self.save_message_to_db(
                        sender_id=sender,
                        receiver_id=receiver,
                        message_content=message,
                        message_id=message_id
                    )
                    # Add the timestamp to the message content
                    content['timestamp'] = saved_message.timestamp.isoformat()
                except Exception as e:
                    logger.error(f"Failed to save message: {e}")
                    return

                # Send to receiver's group
                receiver_group = f"user_{receiver}"
                await self.channel_layer.group_send(
                    receiver_group,
                    {
                        "type": "chat.message",
                        "message": content
                    }
                )

                # Send back to sender's group (for multiple tabs/devices)
                sender_group = f"user_{sender}"
                await self.channel_layer.group_send(
                    sender_group,
                    {
                        "type": "chat.message",
                        "message": content
                    }
                )

                logger.info(f"Message routed to receiver {receiver} and sender {sender}")
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def chat_message(self, event):
        """Send message to WebSocket"""
        try:
            message = event["message"]
            await self.send_json(message)
            logger.info(f"Message sent to client: {message}")
        except Exception as e:
            logger.error(f"Error sending message to client: {e}")