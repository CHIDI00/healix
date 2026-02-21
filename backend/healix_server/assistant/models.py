from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    """Simple conversation storage"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assistant_conversations')
    title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title or 'Chat'}"

class Message(models.Model):
    """Simple message storage"""
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']

class HealthInsight(models.Model):
    """Simple health insights storage"""
    TYPE_CHOICES = [
        ('summary', 'Health Summary'),
        ('recommendation', 'Recommendation'),
        ('alert', 'Health Alert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assistant_insights')
    insight_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']

        