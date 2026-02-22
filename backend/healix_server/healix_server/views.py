from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.db import models
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken


from .models import VitalSigns, EmergencyContact
from .serializers import RegisterSerializer, UserSerializer, VitalSignsSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(ObtainAuthToken):
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by deleting their token"""
    try:
        request.user.auth_token.delete()
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
    except (AttributeError, Token.DoesNotExist):
        return Response({"error": "User not logged in"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """Get list of all users (admin only)"""
    if not request.user.is_staff:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vitals_push(request):
    """
    List all vitals or create a new vital sign entry
    """
    if request.method == 'GET':
        contacts = EmergencyContact.objects.filter(user=request.user)
        json_data = []
        for contact in contacts:
            json_data.append({
                'name': contact.name,
                'email': contact.email
            })
        return JsonResponse(json_data)
    if request.method == 'POST':
        serializer = VitalSignsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def vitals_pull(request):
    vital = VitalSigns.objects.last()
    return Response(VitalSignsSerializer(vital).data)


@api_view(['POST'])
def emergency_contacts(request):
    """List all contacts or add a new contact"""
    if request.method == 'POST':
        EmergencyContact.objects.create(
            name=request.data['name'],
            email=request.data['email']
        )
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def send_emergency_alert(request):
    """
    Send emergency email to loved ones via Gmail
    """
    name = request.POST['name']
    email = request.POST['email']
    reason = request.POST['reason']
    urgency_level = request.POST['urgency_level']
    
    contacts = EmergencyContact.objects.all()
    
    for contact in contacts:
        send_emergency_email(name, email, reason, urgency_level, contact)
    
    return Response({
        'message': f'Emergency alert sent to {len(contacts)} contact(s)'
    })

def send_emergency_email(name, email, reason, urgency_level, contact):
    """Send emergency email via Gmail"""
    try:
        # Context for email template
        context = {
            'contact_name': contact.name,
            'user_name': name,
            'user_email': email,
            'level': urgency_level,
            'reason': reason,
            'timestamp': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
        }
        
        # Render HTML email
        html_message = render_to_string('emergency_alert_email.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email via Gmail SMTP
        email = EmailMultiAlternatives(
            subject="HEALTH EMERGENCY!!",
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[contact.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        
        print(f"Emergency email sent to {contact.email}")
        return True
        
    except Exception as e:
        print(f"Email error: {e}")
        return False
