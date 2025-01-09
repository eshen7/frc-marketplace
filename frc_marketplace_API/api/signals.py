from .models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .tasks import send_activation_email
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")

@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if not created and instance.is_active:
        send_activation_email.delay(str(instance.pk))
