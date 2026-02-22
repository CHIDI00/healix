from django.db import models
from django.contrib.auth.models import User


class VitalSigns(models.Model):
    """
    Stores vital signs measurements that indicate basic body functions
    and physiological status.
    """
    user = models.CharField(max_length=255)
    timestamp = models.CharField(max_length=255)
    
    # Vital Signs Fields
    basal_body_temperature = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Body temperature at complete rest (°C/°F)"
    )
    blood_glucose = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Blood sugar levels (mg/dL or mmol/L)"
    )
    blood_pressure_systolic = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Systolic blood pressure (mmHg)"
    )
    blood_pressure_diastolic = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Diastolic blood pressure (mmHg)"
    )
    body_temperature = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Current body temperature (°C/°F)"
    )
    heart_rate = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Current pulse rate (bpm)"
    )
    oxygen_saturation = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Blood oxygen level SpO2 (percentage)"
    )
    respiratory_rate = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Breathing rate per minute"
    )
    resting_heart_rate = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Heart rate when at complete rest (bpm)"
    )
    vo2_max = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Maximum oxygen consumption during exercise (mL/(kg·min))"
    )
    
    class Meta:
        verbose_name_plural = "Vital Signs"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - Vitals ({self.timestamp})"


class PhysicalData(models.Model):
    """
    Stores measurements of physical characteristics and body structure.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='physical_data')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Physical Data Fields
    basal_metabolic_rate = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Calories burned at rest (kcal/day)"
    )
    body_fat_percentage = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Body fat percentage (%)"
    )
    bone_mass = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Skeletal weight (kg/lb)"
    )
    height = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Body height measurement (cm/in)"
    )
    lean_body_mass = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Body weight minus fat mass (kg/lb)"
    )
    weight = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Body weight measurement (kg/lb)"
    )
    
    class Meta:
        verbose_name_plural = "Physical Data"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - Physical Data ({self.timestamp})"


class FitnessData(models.Model):
    """
    Stores exercise and movement tracking metrics.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fitness_data')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Fitness Data Fields
    active_calories_burned = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Calories burned during activity (kcal)"
    )
    distance = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Travel distance during activities (km/miles)"
    )
    elevation_gained = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Vertical distance climbed (m/ft)"
    )
    exercise_duration = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Duration of exercise session (minutes)"
    )
    exercise_type = models.CharField(
        max_length=100, 
        null=True, 
        blank=True, 
        help_text="Type of exercise (e.g., Running, Walking, Cycling)"
    )
    floors_climbed = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Number of floors/stories climbed"
    )
    power = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Exercise power output (watts)"
    )
    speed = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Movement velocity (km/h or mph)"
    )
    steps = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Step count"
    )
    steps_cadence = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Steps per minute rate (steps/min)"
    )
    total_calories_burned = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Complete calorie expenditure (kcal)"
    )
    wheelchair_pushes = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Push count for wheelchair users"
    )
    
    class Meta:
        verbose_name_plural = "Fitness Data"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - Fitness Data ({self.timestamp})"


class Nutrition(models.Model):
    """
    Stores dietary intake and consumption tracking data.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='nutrition_data')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Nutrition Fields
    hydration = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Water/fluid intake (mL/oz)"
    )
    protein = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Protein intake (grams)"
    )
    carbohydrates = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Carbohydrate intake (grams)"
    )
    fats = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Fat intake (grams)"
    )
    calories = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Total calorie intake (kcal)"
    )
    fiber = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Fiber intake (grams)"
    )
    sodium = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Sodium intake (mg)"
    )
    notes = models.TextField(
        null=True, 
        blank=True, 
        help_text="Additional notes about meals/nutrition"
    )
    
    class Meta:
        verbose_name_plural = "Nutrition Data"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - Nutrition ({self.timestamp})"


class ReproductiveHealth(models.Model):
    """
    Stores menstrual and fertility-related data.
    """
    
    FLOW_CHOICES = [
        ('light', 'Light'),
        ('medium', 'Medium'),
        ('heavy', 'Heavy'),
    ]
    
    CERVICAL_MUCUS_CHOICES = [
        ('dry', 'Dry'),
        ('sticky', 'Sticky'),
        ('creamy', 'Creamy'),
        ('watery', 'Watery'),
        ('egg_white', 'Egg White'),
    ]
    
    OVULATION_TEST_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
        ('indeterminate', 'Indeterminate'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reproductive_health')
    timestamp = models.DateTimeField(auto_now_add=True)
    date = models.DateField(
        null=True, 
        blank=True, 
        help_text="Date of the reproductive health data"
    )
    
    # Reproductive Health Fields
    cervical_mucus = models.CharField(
        max_length=20,
        choices=CERVICAL_MUCUS_CHOICES,
        null=True, 
        blank=True, 
        help_text="Cervical fluid characteristics"
    )
    menstruation_flow = models.CharField(
        max_length=20,
        choices=FLOW_CHOICES,
        null=True, 
        blank=True, 
        help_text="Period flow intensity"
    )
    menstruation_period_start = models.DateField(
        null=True, 
        blank=True, 
        help_text="Start date of menstrual cycle"
    )
    menstruation_period_end = models.DateField(
        null=True, 
        blank=True, 
        help_text="End date of menstrual cycle"
    )
    ovulation_test = models.CharField(
        max_length=20,
        choices=OVULATION_TEST_CHOICES,
        null=True, 
        blank=True, 
        help_text="Ovulation predictor test results"
    )
    notes = models.TextField(
        null=True, 
        blank=True, 
        help_text="Additional notes about reproductive health"
    )
    
    class Meta:
        verbose_name_plural = "Reproductive Health"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - Reproductive Health ({self.timestamp})"


class Sleep(models.Model):
    """
    Stores rest and recovery metrics.
    """
    SLEEP_QUALITY_CHOICES = [
        ('poor', 'Poor'),
        ('fair', 'Fair'),
        ('good', 'Good'),
        ('excellent', 'Excellent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sleep_data')
    timestamp = models.DateTimeField(auto_now_add=True)
    date = models.DateField(
        null=True, 
        blank=True, 
        help_text="Date of sleep session"
    )
    
    # Sleep Fields
    sleep_duration = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Duration of sleep (minutes)"
    )
    sleep_start_time = models.TimeField(
        null=True, 
        blank=True, 
        help_text="Time when sleep started"
    )
    sleep_end_time = models.TimeField(
        null=True, 
        blank=True, 
        help_text="Time when sleep ended"
    )
    sleep_quality = models.CharField(
        max_length=20,
        choices=SLEEP_QUALITY_CHOICES,
        null=True, 
        blank=True, 
        help_text="Subjective assessment of sleep quality"
    )
    deep_sleep_duration = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Duration of deep sleep (minutes)"
    )
    light_sleep_duration = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Duration of light sleep (minutes)"
    )
    rem_sleep_duration = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Duration of REM sleep (minutes)"
    )
    awake_duration = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Duration awake during sleep session (minutes)"
    )
    notes = models.TextField(
        null=True, 
        blank=True, 
        help_text="Additional notes about sleep (e.g., disturbances)"
    )
    
    class Meta:
        verbose_name_plural = "Sleep Data"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - Sleep ({self.timestamp})"


class EmergencyContact(models.Model):
    """Emergency contact information for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    
    def __str__(self):
        return self.name
