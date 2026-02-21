"""
Views for Healthcare AI Assistant API.
"""

import logging
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import AssistantConversation, ConversationMessage, HealthInsight, CustomTool
from .serializers import (
    AssistantConversationSerializer,
    AssistantConversationListSerializer,
    ConversationMessageSerializer,
    ChatMessageInputSerializer,
    HealthInsightSerializer,
    CustomToolSerializer,
    HealthSummaryRequestSerializer,
)
from .gemini_client import GeminiHealthAssistant

logger = logging.getLogger(__name__)


class ChatWithAssistantView(APIView):
    """
    API endpoint for chatting with the healthcare AI assistant.
    
    POST /api/assistant/chat/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Send a message to the healthcare AI assistant.
        
        Request body:
        {
            "message": "How should I improve my sleep?",
            "conversation_id": 1,  # Optional, for continuing existing conversation
            "use_rag": true
        }
        """
        serializer = ChatMessageInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Initialize assistant
            assistant = GeminiHealthAssistant()
            message = serializer.validated_data['message']
            conversation_id = serializer.validated_data.get('conversation_id')
            use_rag = serializer.validated_data.get('use_rag', True)
            
            # Get or create conversation
            if conversation_id:
                conversation = get_object_or_404(
                    AssistantConversation,
                    id=conversation_id,
                    user=request.user
                )
            else:
                # Create new conversation
                conversation = AssistantConversation.objects.create(
                    user=request.user,
                    title=message[:50] + '...' if len(message) > 50 else message
                )
            
            # Save user message
            user_msg = ConversationMessage.objects.create(
                conversation=conversation,
                role='user',
                content=message
            )
            
            # Get AI response
            response_text = assistant.chat(
                request.user,
                message,
                use_rag=use_rag
            )
            
            # Save assistant message
            assistant_msg = ConversationMessage.objects.create(
                conversation=conversation,
                role='assistant',
                content=response_text,
                tools_used=[]  # Could track tools used here
            )
            
            return Response({
                'conversation_id': conversation.id,
                'message': {
                    'id': assistant_msg.id,
                    'role': 'assistant',
                    'content': response_text,
                    'created_at': assistant_msg.created_at
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error(f"API Key issue: {e}")
            return Response(
                {'error': 'AI service not properly configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        # except Exception as e:
        #     logger.error(f"Error in chat: {e}")
        #     return Response(
        #         {'error': 'Error processing message'},
        #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
        #     )


class ConversationListView(APIView):
    """
    List all conversations for the authenticated user.
    
    GET /api/assistant/conversations/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get list of user's conversations."""
        conversations = AssistantConversation.objects.filter(
            user=request.user
        ).order_by('-updated_at')
        
        serializer = AssistantConversationListSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConversationDetailView(APIView):
    """
    Get, update, or delete a specific conversation.
    
    GET /api/assistant/conversations/{id}/
    PUT /api/assistant/conversations/{id}/
    DELETE /api/assistant/conversations/{id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get_conversation(self, request, conversation_id):
        """Get conversation if user owns it."""
        return get_object_or_404(
            AssistantConversation,
            id=conversation_id,
            user=request.user
        )
    
    def get(self, request, conversation_id):
        """Get conversation details with all messages."""
        conversation = self.get_conversation(request, conversation_id)
        serializer = AssistantConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, conversation_id):
        """Update conversation (e.g., title)."""
        conversation = self.get_conversation(request, conversation_id)
        
        if 'title' in request.data:
            conversation.title = request.data['title']
        if 'is_active' in request.data:
            conversation.is_active = request.data['is_active']
        
        conversation.save()
        
        serializer = AssistantConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, conversation_id):
        """Delete a conversation."""
        conversation = self.get_conversation(request, conversation_id)
        conversation.delete()
        return Response(
            {'message': 'Conversation deleted'},
            status=status.HTTP_204_NO_CONTENT
        )


class HealthSummaryView(APIView):
    """
    Get AI-generated health summary for user.
    
    POST /api/assistant/health-summary/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate health summary."""
        serializer = HealthSummaryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            assistant = GeminiHealthAssistant()
            summary = assistant.get_health_summary(request.user)
            
            # Save as insight
            insight = HealthInsight.objects.create(
                user=request.user,
                insight_type='summary',
                title='AI Health Summary',
                content=summary,
                related_metrics=[]
            )
            
            return Response({
                'insight_id': insight.id,
                'content': summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating health summary: {e}")
            return Response(
                {'error': 'Error generating health summary'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WellnessRecommendationsView(APIView):
    """
    Get personalized wellness recommendations.
    
    POST /api/assistant/wellness-recommendations/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate wellness recommendations."""
        try:
            assistant = GeminiHealthAssistant()
            recommendations = assistant.get_wellness_recommendations(request.user)
            
            # Save as insight
            insight = HealthInsight.objects.create(
                user=request.user,
                insight_type='recommendation',
                title='Personalized Wellness Recommendations',
                content=recommendations,
                related_metrics=[]
            )
            
            return Response({
                'insight_id': insight.id,
                'content': recommendations
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return Response(
                {'error': 'Error generating recommendations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthInsightsView(APIView):
    """
    Get AI-generated health insights for user.
    
    GET /api/assistant/insights/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's health insights."""
        insights = HealthInsight.objects.filter(user=request.user).order_by('-created_at')
        
        # Mark as read
        if request.query_params.get('mark_read') == 'true':
            insights.filter(is_read=False).update(is_read=True)
        
        serializer = HealthInsightSerializer(insights, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AvailableToolsView(APIView):
    """
    List all available tools for the assistant.
    
    GET /api/assistant/tools/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get list of available tools."""
        try:
            tools = {
                'send_emergency_email': 'Send emergency alert emails for critical health concerns',
                'generate_health_records': 'Generate comprehensive health records summary for a user'
            }
            
            return Response({
                'count': len(tools),
                'tools': tools
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting tools: {e}")
            return Response(
                {'error': 'Error retrieving tools'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assistant_status(request):
    """
    Check if AI assistant is properly configured.
    
    GET /api/assistant/status/
    """
    try:
        assistant = GeminiHealthAssistant()
        available_tools = 2  # send_emergency_email and generate_health_records
        
        return Response({
            'status': 'operational',
            'tools_available': available_tools,
            'message': 'Healthcare AI Assistant is ready'
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        logger.error(f"Error checking assistant status: {e}")
        return Response({
            'status': 'error',
            'message': 'Error checking assistant status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
