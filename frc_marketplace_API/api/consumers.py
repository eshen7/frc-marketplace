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
            from django.conf import settings
            
            sender = User.objects.get(team_number=sender_id)
            receiver = User.objects.get(team_number=receiver_id)
            
            message = Message.objects.create(
                id=message_id,
                sender=sender,
                receiver=receiver,
                message=message_content,
                is_read=False
            )

            # Import and call task here to avoid circular imports
            from .tasks import send_dm_notification
            # Send email notification
            if receiver.email:
                send_dm_notification.delay(
                    sender_id=sender.id,
                    recipient_id=receiver.id,
                    message_content=message.message
                )
                logger.info(f"Email notification queued for {receiver.email}")

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
            
            elif message_type == 'new_request':
                # Send to all connected clients (for multiple tabs/devices)
                sender_group = f"user_{self.user_id}"
                await self.channel_layer.group_send(
                    sender_group,
                    {
                        "type": "request.created",
                        "request": content.get('request')
                    }
                )
                logger.info(f"New request broadcast to user {self.user_id}")
                
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

    async def request_created(self, event):
        """Handle new request notifications"""
        try:
            # Only send if the request hasn't been sent before
            request_id = event["request"].get("id")
            if not hasattr(self, 'sent_requests'):
                self.sent_requests = set()
            
            if request_id not in self.sent_requests:
                await self.send_json({
                    "type": "new_request",
                    "request": event["request"]
                })
                self.sent_requests.add(request_id)
                logger.info("Request notification sent to client")
        except Exception as e:
            logger.error(f"Error sending request notification: {e}")

class CompetitionConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.event_key = self.scope['url_route']['kwargs']['event_key']
        self.event_group = f"event_{self.event_key}"

        logger.info(f"Connecting user to event group: {self.event_group}")

        try:
            await self.channel_layer.group_add(
                self.event_group,
                self.channel_name
            )
            await self.accept()
            logger.info(f"WebSocket connection established for event: {self.event_key}")
        except Exception as e:
            logger.error(f"Error during WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Disconnecting from event: {self.event_key}")
        try:
            await self.channel_layer.group_discard(
                self.event_group,
                self.channel_name
            )
        except Exception as e:
            logger.error(f"Error during WebSocket disconnection: {e}")

    async def receive_json(self, content):
        logger.info(f"Received message in event {self.event_key}: {content}")
        try:
            message_type = content.get('type')
            
            if message_type == 'event_update':
                # Broadcast to everyone in the event group
                await self.channel_layer.group_send(
                    self.event_group,
                    {
                        "type": "event.update",
                        "message": content
                    }
                )
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def event_update(self, event):
        """Send event update to WebSocket"""
        try:
            message = event["message"]
            # Only send if it's a new request we haven't sent before
            if message.get("type") == "new_request":
                request_id = message.get("request", {}).get("id")
                if not hasattr(self, 'sent_requests'):
                    self.sent_requests = set()
                
                if request_id not in self.sent_requests:
                    await self.send_json(message)
                    self.sent_requests.add(request_id)
                    logger.info(f"Event update sent to client: {message}")
            else:
                await self.send_json(message)
                logger.info(f"Event update sent to client: {message}")
        except Exception as e:
            logger.error(f"Error sending event update to client: {e}")