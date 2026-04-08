"""
Django project settings with observability SDK integration
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-dev-key-change-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'api',
]

MIDDLEWARE = [
    'your_org_observability.middleware.ObservabilityMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Observability SDK configuration
OBSERVABILITY_SERVICE = os.getenv('SERVICE_NAME', 'django-example-service')
OBSERVABILITY_ENV = os.getenv('ENVIRONMENT', 'development')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
}
