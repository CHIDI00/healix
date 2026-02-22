import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Conversation, Message, HealthInsight
from .gemini_client import SimpleHealthAssistant
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    """Chat with conversation storage"""
    message = request.data.get('message', '')
    conversation_id = request.data.get('conversation_id')
    
    if not message:
        return Response({'error': 'Message required'}, status=400)
    
    try:
        assistant = SimpleHealthAssistant()
        
        # Get or create conversation
        if conversation_id:
            conversation = get_object_or_404(Conversation, id=conversation_id, user=request.user)
        else:
            conversation = Conversation.objects.create(
                user=request.user,
                title=message[:50] + ('...' if len(message) > 50 else '')
            )
        
        # Save user message
        Message.objects.create(
            conversation=conversation,
            role='user',
            content=message
        )
        
        # Get AI response
        response = assistant.chat(request.user, message)
        
        # Save assistant message
        Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=response
        )
        
        return Response({
            'conversation_id': conversation.id,
            'response': response
        })
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return Response({'error': 'Service unavailable'}, status=503)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations(request):
    """List user conversations"""
    convos = Conversation.objects.filter(user=request.user).values('id', 'title', 'updated_at')
    return Response(list(convos))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, conversation_id):
    """Get conversation with messages"""
    conversation = get_object_or_404(Conversation, id=conversation_id, user=request.user)
    messages = conversation.messages.values('role', 'content', 'created_at')
    return Response({
        'id': conversation.id,
        'title': conversation.title,
        'messages': list(messages)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def health_summary(request):
    """Generate and store health summary"""
    try:
        assistant = SimpleHealthAssistant()
        summary = assistant.get_summary(request.user)
        
        insight = HealthInsight.objects.create(
            user=request.user,
            insight_type='summary',
            title='Health Summary',
            content=summary
        )
        
        return Response({
            'insight_id': insight.id,
            'summary': summary
        })
    except Exception as e:
        logger.error(f"Summary error: {e}")
        return Response({'error': 'Service unavailable'}, status=503)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def insights(request):
    """Get user insights"""
    insights = HealthInsight.objects.filter(user=request.user).values(
        'id', 'insight_type', 'title', 'content', 'created_at', 'is_read'
    )
    return Response(list(insights))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_insight_read(request, insight_id):
    """Mark insight as read"""
    insight = get_object_or_404(HealthInsight, id=insight_id, user=request.user)
    insight.is_read = True
    insight.save()
    return Response({'status': 'marked as read'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_alert(request):
    """Send health alert email"""
    email = request.data.get('email')
    concern = request.data.get('concern')
    
    if not email or not concern:
        return Response({'error': 'Email and concern required'}, status=400)
    
    try:
        assistant = SimpleHealthAssistant()
        result = assistant.send_alert(email, request.user.username, concern)
        
        # Save as alert insight
        HealthInsight.objects.create(
            user=request.user,
            insight_type='alert',
            title='Health Alert Sent',
            content=f"Alert sent to {email}: {concern}"
        )
        
        return Response({'message': result})
    except Exception as e:
        logger.error(f"Alert error: {e}")
        return Response({'error': 'Failed to send alert'}, status=500)