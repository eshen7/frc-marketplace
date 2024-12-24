from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "frc_marketplace_API.settings")

app = Celery("frc_marketplace_API")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# Namespace 'CELERY' means all celery-related configs should start with 'CELERY_'
app.config_from_object("django.conf:settings", namespace="CELERY")

# Discover task modules from all registered Django app configs.
app.autodiscover_tasks()