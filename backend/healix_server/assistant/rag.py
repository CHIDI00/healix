"""
RAG (Retrieval-Augmented Generation) implementation for health data.

Retrieves relevant health information from the database to provide context
to the Gemini AI model.
"""

from __future__ import annotations

from typing import Dict, List, Any, TYPE_CHECKING
from datetime import datetime, timedelta
from healix_server.models import VitalSigns, PhysicalData, FitnessData, Nutrition, ReproductiveHealth, Sleep

if TYPE_CHECKING:
    from django.contrib.auth.models import User


class HealthDataRAG:
    """
    Retrieves health data from database for context-aware AI responses.
    """

    @staticmethod
    def get_latest_vitals(user: User, days: int = 7) -> str:
        """
        Get latest vital signs within specified days.
        
        Args:
            user: User instance
            days: Number of days to look back
            
        Returns:
            str: Formatted vital signs data or empty string if none found
        """
        since = datetime.now() - timedelta(days=days)
        vitals = VitalSigns.objects.filter(
            user=user,
            timestamp__gte=since
        ).order_by('-timestamp')[:10]
        
        if not vitals:
            return ""
        
        data = "Recent Vital Signs (past {} days):\n".format(days)
        for vital in vitals:
            readings = []
            if vital.heart_rate:
                readings.append(f"HR: {vital.heart_rate} bpm")
            if vital.body_temperature:
                readings.append(f"Temp: {vital.body_temperature}°C")
            if vital.blood_pressure_systolic and vital.blood_pressure_diastolic:
                readings.append(f"BP: {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg")
            if vital.oxygen_saturation:
                readings.append(f"SpO2: {vital.oxygen_saturation}%")
            if vital.blood_glucose:
                readings.append(f"Blood Glucose: {vital.blood_glucose} mg/dL")
            
            if readings:
                data += f"  {vital.timestamp.strftime('%Y-%m-%d %H:%M')}: {', '.join(readings)}\n"
        
        return data

    @staticmethod
    def get_latest_physical_data(user: User) -> str:
        """
        Get latest physical measurements.
        
        Args:
            user: User instance
            
        Returns:
            str: Formatted physical data or empty string if none found
        """
        physical = PhysicalData.objects.filter(user=user).order_by('-timestamp').first()
        
        if not physical:
            return ""
        
        data = f"Latest Physical Data ({physical.timestamp.strftime('%Y-%m-%d')}):\n"
        if physical.weight:
            data += f"  Weight: {physical.weight} kg\n"
        if physical.height:
            data += f"  Height: {physical.height} cm\n"
        if physical.body_fat_percentage:
            data += f"  Body Fat: {physical.body_fat_percentage}%\n"
        if physical.basal_metabolic_rate:
            data += f"  BMR: {physical.basal_metabolic_rate} kcal/day\n"
        if physical.lean_body_mass:
            data += f"  Lean Mass: {physical.lean_body_mass} kg\n"
        
        return data

    @staticmethod
    def get_fitness_summary(user: User, days: int = 7) -> str:
        """
        Get fitness activity summary.
        
        Args:
            user: User instance
            days: Number of days to summarize
            
        Returns:
            str: Formatted fitness data or empty string if none found
        """
        since = datetime.now() - timedelta(days=days)
        fitness_data = FitnessData.objects.filter(
            user=user,
            timestamp__gte=since
        ).order_by('-timestamp')
        
        if not fitness_data:
            return ""
        
        total_steps = sum(f.steps or 0 for f in fitness_data)
        total_calories = sum(f.total_calories_burned or 0 for f in fitness_data)
        total_distance = sum(f.distance or 0 for f in fitness_data)
        
        data = f"Fitness Activity (past {days} days):\n"
        data += f"  Total Steps: {total_steps}\n"
        data += f"  Total Calories Burned: {total_calories} kcal\n"
        data += f"  Total Distance: {total_distance} km\n"
        
        exercises = {}
        for f in fitness_data:
            if f.exercise_type:
                exercises[f.exercise_type] = exercises.get(f.exercise_type, 0) + 1
        
        if exercises:
            data += "  Exercises:\n"
            for exercise, count in exercises.items():
                data += f"    {exercise}: {count} times\n"
        
        return data

    @staticmethod
    def get_nutrition_summary(user: User, days: int = 7) -> str:
        """
        Get nutrition tracking summary.
        
        Args:
            user: User instance
            days: Number of days to summarize
            
        Returns:
            str: Formatted nutrition data or empty string if none found
        """
        since = datetime.now() - timedelta(days=days)
        nutrition_data = Nutrition.objects.filter(
            user=user,
            timestamp__gte=since
        ).order_by('-timestamp')
        
        if not nutrition_data:
            return ""
        
        avg_calories = sum(n.calories or 0 for n in nutrition_data) / len(nutrition_data)
        avg_protein = sum(n.protein or 0 for n in nutrition_data) / len(nutrition_data)
        avg_hydration = sum(n.hydration or 0 for n in nutrition_data) / len(nutrition_data)
        
        data = f"Nutrition Summary (past {days} days):\n"
        data += f"  Avg Daily Calories: {avg_calories:.0f} kcal\n"
        data += f"  Avg Daily Protein: {avg_protein:.0f}g\n"
        data += f"  Avg Daily Hydration: {avg_hydration:.0f} mL\n"
        
        return data

    @staticmethod
    def get_sleep_summary(user: User, days: int = 7) -> str:
        """
        Get sleep tracking summary.
        
        Args:
            user: User instance
            days: Number of days to summarize
            
        Returns:
            str: Formatted sleep data or empty string if none found
        """
        since = datetime.now() - timedelta(days=days)
        sleep_data = Sleep.objects.filter(
            user=user,
            timestamp__gte=since
        ).order_by('-timestamp')
        
        if not sleep_data:
            return ""
        
        avg_duration = sum(s.sleep_duration or 0 for s in sleep_data) / len(sleep_data)
        
        data = f"Sleep Summary (past {days} days):\n"
        data += f"  Average Sleep Duration: {avg_duration/60:.1f} hours\n"
        
        last_sleep = sleep_data.first()
        if last_sleep:
            data += f"  Last Night's Sleep: {last_sleep.date}\n"
            if last_sleep.sleep_duration:
                data += f"    Duration: {last_sleep.sleep_duration} minutes\n"
            if last_sleep.sleep_quality:
                data += f"    Quality: {last_sleep.sleep_quality}\n"
        
        return data

    @staticmethod
    def get_reproductive_health_data(user: User, days: int = 30) -> str:
        """
        Get reproductive health tracking data.
        
        Args:
            user: User instance
            days: Number of days to look back
            
        Returns:
            str: Formatted reproductive health data or empty string if none found
        """
        since = datetime.now() - timedelta(days=days)
        repro_data = ReproductiveHealth.objects.filter(
            user=user,
            timestamp__gte=since
        ).order_by('-date')[:10]
        
        if not repro_data:
            return ""
        
        data = f"Reproductive Health (past {days} days):\n"
        for record in repro_data:
            if record.menstruation_flow:
                data += f"  {record.date}: Menstruation ({record.menstruation_flow})\n"
            if record.ovulation_test:
                data += f"  {record.date}: Ovulation Test ({record.ovulation_test})\n"
        
        return data

    @staticmethod
    def get_comprehensive_health_context(user: User) -> str:
        """
        Get comprehensive health context from all data sources.
        
        Args:
            user: User instance
            
        Returns:
            str: Comprehensive health context for AI
        """
        context_parts = [
            HealthDataRAG.get_latest_vitals(user),
            HealthDataRAG.get_latest_physical_data(user),
            HealthDataRAG.get_fitness_summary(user),
            HealthDataRAG.get_nutrition_summary(user),
            HealthDataRAG.get_sleep_summary(user),
            HealthDataRAG.get_reproductive_health_data(user),
        ]
        
        # Filter out empty strings and join with newlines
        context = "\n".join(part for part in context_parts if part)
        return context if context else "No health data available for this user."

    @staticmethod
    def get_context_for_query(user: User, query: str) -> str:
        """
        Get relevant health context based on query keywords.
        
        Args:
            user: User instance
            query: User query
            
        Returns:
            str: Relevant health context
        """
        context_parts = []
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['vital', 'heart', 'blood pressure', 'temperature', 'oxygen']):
            context_parts.append(HealthDataRAG.get_latest_vitals(user))
        
        if any(word in query_lower for word in ['weight', 'height', 'fat', 'body', 'physical']):
            context_parts.append(HealthDataRAG.get_latest_physical_data(user))
        
        if any(word in query_lower for word in ['exercise', 'workout', 'fitness', 'steps', 'calories']):
            context_parts.append(HealthDataRAG.get_fitness_summary(user))
        
        if any(word in query_lower for word in ['nutrition', 'diet', 'food', 'protein', 'hydration']):
            context_parts.append(HealthDataRAG.get_nutrition_summary(user))
        
        if any(word in query_lower for word in ['sleep', 'rest', 'tired', 'insomnia']):
            context_parts.append(HealthDataRAG.get_sleep_summary(user))
        
        if any(word in query_lower for word in ['period', 'menstruation', 'ovulation', 'fertility']):
            context_parts.append(HealthDataRAG.get_reproductive_health_data(user))
        
        # If no specific context found, return comprehensive
        if not context_parts:
            return HealthDataRAG.get_comprehensive_health_context(user)
        
        return "\n".join(part for part in context_parts if part)
