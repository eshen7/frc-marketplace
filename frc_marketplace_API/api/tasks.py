from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_email_task(subject, message, from_email, recipient_list):
    """
    Asynchronous task for sending email notifications.
    """
    send_mail(subject, message, from_email, recipient_list, fail_silently=True)