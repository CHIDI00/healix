"""
Simple tool functions for healthcare assistant.

Provides email and health record generation capabilities.
"""

import logging
from django.core.mail import send_mail
from django.conf import settings
from healix_server.models import VitalSigns, PhysicalData, FitnessData, Nutrition, Sleep, ReproductiveHealth

logger = logging.getLogger(__name__)


def send_emergency_email(recipient_email: str, user_name: str, health_concern: str) -> str:
    """
    Send an emergency alert email.
    
    Args:
        recipient_email: Email address to send to
        user_name: Name of the user
        health_concern: Description of the health concern
        
    Returns:
        str: Status message
    """
    try:
        subject = f"Emergency Health Alert - {user_name}"
        message = f"""
EMERGENCY HEALTH ALERT

User: {user_name}
Contact Email: {recipient_email}

Health Concern:
{health_concern}

This is an automated alert from the Healix Healthcare System.
Please take appropriate action immediately.

If this is a medical emergency, please call 911 or your local emergency services.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        
        logger.info(f"Emergency email sent to {recipient_email} for user {user_name}")
        return f"Emergency email sent successfully to {recipient_email}"
        
    except Exception as e:
        logger.error(f"Failed to send emergency email: {e}")
        return f"Error sending emergency email: {str(e)}"


def generate_health_records(user_id: int) -> str:
    """
    Generate comprehensive health records for a user.
    
    Args:
        user_id: Django user ID
        
    Returns:
        str: Formatted health records summary
    """
    try:
        records = []
        
        # Vital Signs
        vitals = VitalSigns.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if vitals:
            records.append(f"VITAL SIGNS (Latest)\n" +
                          f"  Heart Rate: {vitals.heart_rate} bpm\n" +
                          f"  Blood Pressure: {vitals.systolic}/{vitals.diastolic} mmHg\n" +
                          f"  Temperature: {vitals.temperature}°C\n" +
                          f"  Oxygen Saturation: {vitals.oxygen_saturation}%\n" +
                          f"  Recorded: {vitals.timestamp}\n")
        
        # Physical Data
        physical = PhysicalData.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if physical:
            records.append(f"PHYSICAL DATA (Latest)\n" +
                          f"  Height: {physical.height} cm\n" +
                          f"  Weight: {physical.weight} kg\n" +
                          f"  BMI: {physical.bmi:.1f}\n" +
                          f"  Body Fat: {physical.body_fat_percentage}%\n" +
                          f"  Recorded: {physical.timestamp}\n")
        
        # Fitness Data
        fitness = FitnessData.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if fitness:
            records.append(f"FITNESS DATA (Latest)\n" +
                          f"  Steps: {fitness.steps}\n" +
                          f"  Active Minutes: {fitness.active_minutes}\n" +
                          f"  Calories Burned: {fitness.calories_burned}\n" +
                          f"  Recorded: {fitness.timestamp}\n")
        
        # Nutrition Data
        nutrition = Nutrition.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if nutrition:
            records.append(f"NUTRITION DATA (Latest)\n" +
                          f"  Calories: {nutrition.calories}\n" +
                          f"  Protein: {nutrition.protein}g\n" +
                          f"  Carbs: {nutrition.carbs}g\n" +
                          f"  Fat: {nutrition.fat}g\n" +
                          f"  Recorded: {nutrition.timestamp}\n")
        
        # Sleep Data
        sleep = Sleep.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if sleep:
            records.append(f"SLEEP DATA (Latest)\n" +
                          f"  Duration: {sleep.duration_hours} hours\n" +
                          f"  Quality: {sleep.quality_score}/100\n" +
                          f"  Deep Sleep: {sleep.deep_sleep_minutes} min\n" +
                          f"  REM Sleep: {sleep.rem_sleep_minutes} min\n" +
                          f"  Recorded: {sleep.timestamp}\n")
        
        # Reproductive Health
        repro = ReproductiveHealth.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if repro:
            records.append(f"REPRODUCTIVE HEALTH (Latest)\n" +
                          f"  Menstrual Cycle: {repro.menstrual_cycle_day}\n" +
                          f"  Symptoms: {repro.symptoms}\n" +
                          f"  Recorded: {repro.timestamp}\n")
        
        if not records:
            return "No health records found for this user."
        
        health_summary = "HEALTH RECORDS REPORT\n" + "="*50 + "\n\n"
        health_summary += "\n".join(records)
        
        logger.info(f"Health records generated for user {user_id}")
        return health_summary
        
    except Exception as e:
        logger.error(f"Error generating health records: {e}")
        return f"Error generating health records: {str(e)}"
