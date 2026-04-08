"""
URL configuration for Django example service
"""

from django.urls import path
from your_org_observability.health_check import get_health_urls
from . import views

urlpatterns = [
    # Health checks
    *get_health_urls('django-example-service', lambda: True),
    
    # API endpoints
    path('api/users/', views.users_list, name='users_list'),
    path('api/users/<int:user_id>/', views.users_detail, name='users_detail'),
    path('api/users/create/', views.users_create, name='users_create'),
    path('api/error/', views.trigger_error, name='trigger_error'),
]
