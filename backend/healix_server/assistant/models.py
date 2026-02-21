"""
Models for Healthcare AI Assistant conversation management.
"""

from django.db import models
from django.contrib.auth.models import User


class AssistantConversation(models.Model):
    """
    Stores conversation sessions between user and AI assistant.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Conversation title/topic"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether conversation is still active"
    )
    
    class Meta:
        verbose_name_plural = "Assistant Conversations"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title or 'Untitled'} ({self.created_at.strftime('%Y-%m-%d')})"


class ConversationMessage(models.Model):
    """
    Stores individual messages within a conversation.
    """
    MESSAGE_ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
    ]
    
    conversation = models.ForeignKey(
        AssistantConversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(
        max_length=20,
        choices=MESSAGE_ROLE_CHOICES,
        help_text="Message sender role"
    )
    content = models.TextField(
        help_text="Message content"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Metadata for assistant messages
    tools_used = models.JSONField(
        default=list,
        blank=True,
        help_text="List of tools used to generate this response"
    )
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role.capitalize()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class HealthInsight(models.Model):
    """
    Stores AI-generated health insights for users.
    """
    INSIGHT_TYPE_CHOICES = [
        ('summary', 'Health Summary'),
        ('recommendation', 'Wellness Recommendation'),
        ('alert', 'Health Alert'),
        ('pattern', 'Pattern Analysis'),
        ('trend', 'Trend Analysis'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_insights')
    insight_type = models.CharField(
        max_length=20,
        choices=INSIGHT_TYPE_CHOICES,
        help_text="Type of insight"
    )
    title = models.CharField(
        max_length=255,
        help_text="Insight title"
    )
    content = models.TextField(
        help_text="Detailed insight content"
    )
    related_metrics = models.JSONField(
        default=list,
        blank=True,
        help_text="Health metrics relevant to this insight"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(
        default=False,
        help_text="Whether user has read this insight"
    )
    
    class Meta:
        verbose_name_plural = "Health Insights"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class CustomTool(models.Model):
    """
    Stores information about custom tools registered in the assistant.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Tool name (must match Python function name)"
    )
    description = models.TextField(
        help_text="Tool description"
    )
    category = models.CharField(
        max_length=50,
        help_text="Tool category (e.g., 'calculation', 'analysis', 'recommendation')"
    )
    parameters = models.JSONField(
        default=dict,
        help_text="Tool parameters schema"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether tool is currently active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tools'
    )
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"
