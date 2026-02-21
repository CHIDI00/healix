from django.urls import path
from . import views

app_name = 'assistant'

urlpatterns = [
    # Chat
    path('chat/', views.chat, name='chat'),
    
    # Conversations
    path('conversations/', views.conversations, name='conversations'),
    path('conversations/<int:conversation_id>/', views.conversation_detail, name='conversation-detail'),
    
    # Health insights
    path('summary/', views.health_summary, name='health-summary'),
    path('insights/', views.insights, name='insights'),
    path('insights/<int:insight_id>/read/', views.mark_insight_read, name='mark-insight-read'),
    
    # Email alert
    path('send-alert/', views.send_alert, name='send-alert'),
]