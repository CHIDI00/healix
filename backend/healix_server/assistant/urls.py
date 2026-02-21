"""
URL configuration for Healthcare AI Assistant API.
"""

from django.urls import path
from . import views

app_name = 'assistant'

urlpatterns = [
    # Chat endpoints
    path('chat/', views.ChatWithAssistantView.as_view(), name='chat'),
    
    # Conversation management
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    
    # Health insights and recommendations
    path('health-summary/', views.HealthSummaryView.as_view(), name='health-summary'),
    path('wellness-recommendations/', views.WellnessRecommendationsView.as_view(), name='wellness-recommendations'),
    path('insights/', views.HealthInsightsView.as_view(), name='health-insights'),
    
    # Tools and status
    path('tools/', views.AvailableToolsView.as_view(), name='available-tools'),
    path('status/', views.get_assistant_status, name='assistant-status'),
]
