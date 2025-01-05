from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_email_task(subject, message, from_email, recipient_list):
    try:
        logger.info(f"Attempting to send email from {from_email} to {recipient_list}")
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Email sent successfully: {result}")
        return f"Email sent successfully to {recipient_list}"
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return f"Failed to send email: {str(e)}"