from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        try:
            # Import signals at startup
            from . import signals
            logger.info("=== API App Ready ===")
            logger.info("Signals module imported")
            logger.info("Signal handlers registered")
            
            # Log the number of receivers
            receiver_count = len(signals.pre_save.receivers)
            logger.info(f"Number of pre_save receivers: {receiver_count}")
            
            # Explicitly register signals
            signals.register_signals()
            
        except Exception as e:
            logger.error(f"Error loading signals: {str(e)}", exc_info=True)
