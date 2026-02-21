"""
Serializers for Healthcare AI Assistant API.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AssistantConversation, ConversationMessage, HealthInsight, CustomTool


class ConversationMessageSerializer(serializers.ModelSerializer):
    """Serializer for conversation messages."""
    
    class Meta:
        model = ConversationMessage
        fields = ('id', 'role', 'content', 'created_at', 'tools_used')
        read_only_fields = ('id', 'created_at')


class AssistantConversationSerializer(serializers.ModelSerializer):
    """Serializer for assistant conversations."""
    messages = ConversationMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AssistantConversation
        fields = ('id', 'user', 'title', 'created_at', 'updated_at', 'is_active', 'messages', 'message_count')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def get_message_count(self, obj):
        return obj.messages.count()


class AssistantConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for conversation lists."""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = AssistantConversation
        fields = ('id', 'title', 'created_at', 'updated_at', 'is_active', 'message_count', 'last_message')
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'role': last_msg.role,
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'created_at': last_msg.created_at
            }
        return None


class ChatMessageInputSerializer(serializers.Serializer):
    """Serializer for incoming chat messages."""
    message = serializers.CharField(
        required=True,
        min_length=1,
        max_length=5000,
        help_text="User's message"
    )
    conversation_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID of existing conversation, or null for new conversation"
    )
    use_rag = serializers.BooleanField(
        default=True,
        help_text="Whether to use RAG for health context"
    )


class HealthInsightSerializer(serializers.ModelSerializer):
    """Serializer for health insights."""
    
    class Meta:
        model = HealthInsight
        fields = ('id', 'user', 'insight_type', 'title', 'content', 'related_metrics', 'created_at', 'is_read')
        read_only_fields = ('id', 'user', 'created_at')


class CustomToolSerializer(serializers.ModelSerializer):
    """Serializer for custom tools."""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = CustomTool
        fields = ('id', 'name', 'description', 'category', 'parameters', 'is_active', 'created_at', 'updated_at', 'created_by_username')
        read_only_fields = ('id', 'created_at', 'updated_at')


class AssistantToolListSerializer(serializers.Serializer):
    """Serializer for list of available tools."""
    name = serializers.CharField()
    description = serializers.CharField()
    parameters = serializers.DictField(child=serializers.CharField())


class HealthSummaryRequestSerializer(serializers.Serializer):
    """Serializer for health summary request."""
    include_recommendations = serializers.BooleanField(
        default=True,
        help_text="Include wellness recommendations in summary"
    )
    days = serializers.IntegerField(
        default=7,
        min_value=1,
        max_value=365,
        help_text="Number of days to include in summary"
    )


class WellnessRecommendationSerializer(serializers.Serializer):
    """Serializer for wellness recommendations."""
    focus_area = serializers.CharField(
        required=False,
        help_text="Specific area to focus recommendations on (e.g., 'sleep', 'fitness', 'nutrition')"
    )
