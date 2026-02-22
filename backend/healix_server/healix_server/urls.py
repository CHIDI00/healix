"""
URL configuration for healix_server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # AUTH ENDPOINTS
    path('api-auth/', include('rest_framework.urls')),  # Browsable API login
    path('api/auth/register/', views.RegisterView.as_view(), name='register'),
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/auth/profile/', views.user_profile, name='profile'),
    path('api/auth/profile/update/', views.update_profile, name='update-profile'),
    path('api/auth/users/', views.user_list, name='user-list'),
    
    # AI ASSISTANT ENDPOINTS
    path('api/assistant/', include('assistant.urls')),

    # Vital Signs Endpoints
    path('api/vitals/push', views.vitals_push),
    path('api/vitals/pull', views.vitals_pull),
]
