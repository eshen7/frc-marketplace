from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.db import models, connection
from .models import User
from .tasks import send_activation_email
import logging

logger = logging.getLogger(__name__)

# Explicitly connect the signal
def register_signals():
    logger.info("Registering user activation signal...")
    pre_save.connect(
        user_activation_handler,
        sender=User,
        dispatch_uid="user_activation_signal"
    )
    logger.info("User activation signal registered")

@receiver(pre_save, sender=User, dispatch_uid="user_activation_signal")
def user_activation_handler(sender, instance, raw=False, **kwargs):
    """
    Signal handler to send activation email when a user's is_active status changes from False to True.
    This handles both Django ORM updates and direct database changes via pgAdmin.
    """
    try:
        logger.info("----------------------------------------")
        logger.info("User Activation Signal Triggered")
        logger.info(f"Team Number: {instance.team_number}")
        logger.info(f"User ID: {instance.id}")
        logger.info(f"Current is_active state: {instance.is_active}")
        
        # Get the current state directly from the database
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT is_active FROM api_user WHERE id = %s",
                [instance.id]
            )
            result = cursor.fetchone()
            if result:
                previous_active = bool(result[0])
                logger.info(f"Previous is_active state (from DB): {previous_active}")
                logger.info(f"New is_active state: {instance.is_active}")
                
                # Check if is_active changed from False to True
                if instance.is_active and not previous_active:
                    logger.info(f"ACTIVATION DETECTED: User {instance.team_number} is being activated!")
                    logger.info("Queuing activation email...")
                    send_activation_email.delay(instance.id)
                    logger.info(f"Activation email queued successfully for team {instance.team_number}")
                else:
                    logger.info("No activation change detected")
            else:
                logger.info("New user being created - no activation email needed")
            
        logger.info("----------------------------------------")
            
    except Exception as e:
        logger.error("----------------------------------------")
        logger.error(f"ERROR in user_activation_handler")
        logger.error(f"Error details: {str(e)}")
        logger.error("Full traceback:", exc_info=True)
        logger.error("----------------------------------------")

# Register signals when the module is imported
register_signals() 