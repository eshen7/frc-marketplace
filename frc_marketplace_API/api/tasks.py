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
        # Log all email-related settings
        logger.info(f"Attempting to send email from {from_email} to {recipient_list}")
        logger.info(f"Email settings: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}")
        logger.info(f"Using email account: {settings.EMAIL_HOST_USER}")
        
        # Ensure from_email is millenniummarket.team@gmail.com
        from_email_const = 'millenniummarket.team@gmail.com'
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email_const,  # Use the forced email
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
    ).order_by('needed_date')  # First sort by needed_date at database level

    for user in users:
        if not user.address:  # Check if user has an address
            continue

        # Filter requests within 50 miles and exclude user's own requests
        nearby_requests = []
        for request in recent_requests:
            # Skip if it's the user's own request or if request user has no address
            if request.user == user or not request.user.address:
                continue
                
            distance = haversine(
                user.address.latitude,
                user.address.longitude,
                request.user.address.latitude,
                request.user.address.longitude
            )
            
            if distance <= 50:  # 50 miles radius
                # Calculate days until needed
                days_until = None
                if request.needed_date:
                    days_until = (request.needed_date - timezone.now().date()).days
                
                nearby_requests.append({
                    'request': request,
                    'distance': round(distance, 1),
                    'days_until': days_until
                })

        if nearby_requests:
            # Sort requests by days_until (None values last)
            nearby_requests.sort(
                key=lambda x: (
                    x['days_until'] is None,  # None values last
                    x['days_until'] if x['days_until'] is not None else float('inf')
                )
            )

            # Create email content
            context = {
                'team_name': user.team_name,
                'team_number': user.team_number,
                'requests': nearby_requests,
                'frontend_url': settings.FRONTEND_URL
            }
            
            html_content = render_to_string('emails/daily_digest.html', context)
            text_content = render_to_string('emails/daily_digest.txt', context)

            # Force the from_email to be millenniummarket.team@gmail.com
            from_email = 'millenniummarket.team@gmail.com'

            # Send email
            send_email_task.delay(
                subject=f'Daily Part Requests Digest for FRC Team {user.team_number}',
                message=text_content,
                from_email=from_email,  # Use the forced email
                recipient_list=[user.email],
                html_message=html_content
            )

@shared_task
def send_dm_notification(sender_id, recipient_id, message_content):
    try:
        sender = User.objects.get(id=sender_id)
        recipient = User.objects.get(id=recipient_id)

        # Log the email that will be used
        logger.info(f"DEFAULT_FROM_EMAIL setting is: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"EMAIL_HOST_USER setting is: {settings.EMAIL_HOST_USER}")

        context = {
            'sender_team_name': sender.team_name,
            'sender_team_number': sender.team_number,
            'recipient_team_number': recipient.team_number,
            'message_content': message_content,
            'frontend_url': settings.FRONTEND_URL
        }

        html_content = render_to_string('emails/dm_notification.html', context)
        text_content = render_to_string('emails/dm_notification.txt', context)

        # Force the from_email to be millenniummarket.team@gmail.com
        from_email = 'millenniummarket.team@gmail.com'
        
        send_email_task.delay(
            subject=f'New Message from Team {sender.team_number}',
            message=text_content,
            from_email=from_email,  # Use the forced email
            recipient_list=[recipient.email],
            html_message=html_content
        )

    except User.DoesNotExist:
        logger.error("User not found when trying to send DM notification")
    except Exception as e:
        logger.error(f"Error sending DM notification: {str(e)}")