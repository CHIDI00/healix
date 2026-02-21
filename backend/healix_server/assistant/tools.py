import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_health_alert(recipient_email, user_name, concern):
    """Simple email alert function"""
    try:
        subject = f"Health Alert - {user_name}"
        message = f"""
HEALTH ALERT
User: {user_name}
Concern: {concern}

Please check on the user.
"""
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        return f"Alert sent to {recipient_email}"
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return f"Failed to send alert: {str(e)}"