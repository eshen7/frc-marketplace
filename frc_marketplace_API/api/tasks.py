from celery import shared_task
from django.core.mail import send_mail
import logging
from django.conf import settings
from .models import User, PartRequest
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
from utils.utils import haversine

logger = logging.getLogger(__name__)

@shared_task
def send_email_task(subject, message, from_email, recipient_list, html_message=None):
    try:
        logger.info(f"Attempting to send email from {from_email} to {recipient_list}")
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
            html_message=html_message
        )
        logger.info(f"Email sent successfully: {result}")
        return f"Email sent successfully to {recipient_list}"
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return f"Failed to send email: {str(e)}"

@shared_task
def send_daily_requests_digest():
    # Get all active users
    users = User.objects.filter(is_active=True)
    
    # Get requests from the last 24 hours
    recent_requests = PartRequest.objects.filter(
        request_date__gte=timezone.now() - timedelta(days=1)
    )

    for user in users:
        if not user.address:  # Check if user has an address
            continue

        # Filter requests within 50 miles
        nearby_requests = []
        for request in recent_requests:
            if not request.user.address:  # Check if request user has an address
                continue
                
            distance = haversine(
                user.address.latitude,  # Access latitude directly from Address model
                user.address.longitude,  # Access longitude directly from Address model
                request.user.address.latitude,
                request.user.address.longitude
            )
            
            if distance <= 50:  # 50 miles radius
                nearby_requests.append({
                    'request': request,
                    'distance': round(distance, 1)
                })

        if nearby_requests:
            # Create email content
            context = {
                'team_name': user.team_name,
                'team_number': user.team_number,
                'requests': nearby_requests,
                'frontend_url': settings.FRONTEND_URL
            }
            
            html_content = render_to_string('emails/daily_digest.html', context)
            text_content = render_to_string('emails/daily_digest.txt', context)

            # Send email
            send_email_task.delay(
                subject=f'Daily Part Requests Digest for FRC Team {user.team_number}',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content
            )

@shared_task
def send_dm_notification(sender_id, recipient_id, message_content):
    try:
        sender = User.objects.get(id=sender_id)
        recipient = User.objects.get(id=recipient_id)

        context = {
            'sender_team_name': sender.team_name,
            'sender_team_number': sender.team_number,
            'recipient_team_number': recipient.team_number,
            'message_content': message_content,
            'frontend_url': settings.FRONTEND_URL
        }

        # Render both HTML and text versions
        html_content = render_to_string('emails/dm_notification.html', context)
        text_content = render_to_string('emails/dm_notification.txt', context)

        # Send email with both HTML and text versions
        send_email_task.delay(
            subject=f'New Message from Team {sender.team_number}',
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            html_message=html_content
        )

    except User.DoesNotExist:
        logger.error("User not found when trying to send DM notification")
    except Exception as e:
        logger.error(f"Error sending DM notification: {str(e)}")