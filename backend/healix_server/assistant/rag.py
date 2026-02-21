from datetime import datetime, timedelta
from healix_server.models import VitalSigns, PhysicalData, FitnessData, Nutrition, Sleep

def get_health_context(user):
    """Get basic health context for a user"""
    context = []
    
    # Latest vitals
    vitals = VitalSigns.objects.filter(user=user).order_by('-timestamp').first()
    if vitals:
        context.append(f"Vitals: HR={vitals.heart_rate}, BP={vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic}")
    
    # Latest physical data
    physical = PhysicalData.objects.filter(user=user).order_by('-timestamp').first()
    if physical:
        context.append(f"Body: Weight={physical.weight}kg, Height={physical.height}cm")
    
    # Today's fitness
    today = datetime.now().date()
    fitness = FitnessData.objects.filter(user=user, timestamp__date=today).first()
    if fitness:
        context.append(f"Today: Steps={fitness.steps}, Calories={fitness.total_calories_burned}")
    
    # Last sleep
    sleep = Sleep.objects.filter(user=user).order_by('-timestamp').first()
    if sleep:
        context.append(f"Last sleep: {sleep.sleep_duration}min")
    
    return "\n".join(context) if context else "No recent health data"