"""
Built-in tools for healthcare assistant.

Provides common healthcare calculations and utilities.
"""

from .tools import BaseTool, ToolParameter, ToolRegistry


class BMICalculatorTool(BaseTool):
    """Calculate Body Mass Index."""
    name = "calculate_bmi"
    description = "Calculate Body Mass Index from weight and height"
    parameters = [
        ToolParameter("weight", "number", "Weight in kilograms", required=True),
        ToolParameter("height", "number", "Height in centimeters", required=True),
    ]

    def execute(self, weight: float, height: float) -> str:
        """Calculate BMI."""
        height_m = height / 100
        bmi = weight / (height_m ** 2)
        
        # Determine category
        if bmi < 18.5:
            category = "Underweight"
        elif 18.5 <= bmi < 25:
            category = "Normal weight"
        elif 25 <= bmi < 30:
            category = "Overweight"
        else:
            category = "Obese"
        
        return f"BMI: {bmi:.1f} ({category})"


class CalorieNeedsCalculatorTool(BaseTool):
    """Calculate daily calorie needs."""
    name = "calculate_daily_calorie_needs"
    description = "Calculate estimated daily calorie needs using Mifflin-St Jeor equation"
    parameters = [
        ToolParameter("weight", "number", "Weight in kilograms", required=True),
        ToolParameter("height", "number", "Height in centimeters", required=True),
        ToolParameter("age", "integer", "Age in years", required=True),
        ToolParameter("gender", "string", "Gender (male or female)", required=True, enum=["male", "female"]),
        ToolParameter("activity_level", "string", "Activity level", required=True, 
                     enum=["sedentary", "light", "moderate", "very_active", "extremely_active"]),
    ]

    def execute(self, weight: float, height: float, age: int, gender: str, activity_level: str) -> str:
        """Calculate daily calorie needs."""
        # Mifflin-St Jeor equation for BMR
        if gender.lower() == "male":
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161
        
        # Activity multipliers
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "very_active": 1.725,
            "extremely_active": 1.9,
        }
        
        multiplier = activity_multipliers.get(activity_level.lower(), 1.55)
        tdee = bmr * multiplier
        
        return f"Estimated daily calorie needs: {tdee:.0f} kcal/day (BMR: {bmr:.0f} kcal/day)"


class TargetHeartRateZonesTool(BaseTool):
    """Calculate target heart rate training zones."""
    name = "calculate_heart_rate_zones"
    description = "Calculate target heart rate zones for exercise training"
    parameters = [
        ToolParameter("max_heart_rate", "integer", "Maximum heart rate in bpm", required=True),
    ]

    def execute(self, max_heart_rate: int) -> str:
        """Calculate heart rate zones."""
        zones = {
            "Zone 1 - Recovery": (0.5, 0.6),
            "Zone 2 - Endurance": (0.6, 0.7),
            "Zone 3 - Tempo": (0.7, 0.8),
            "Zone 4 - Threshold": (0.8, 0.9),
            "Zone 5 - Maximum": (0.9, 1.0),
        }
        
        result = "Heart Rate Training Zones:\n"
        for zone_name, (lower, upper) in zones.items():
            lower_bpm = int(max_heart_rate * lower)
            upper_bpm = int(max_heart_rate * upper)
            result += f"  {zone_name}: {lower_bpm}-{upper_bpm} bpm\n"
        
        return result


class HydrationCalculatorTool(BaseTool):
    """Calculate daily water intake recommendation."""
    name = "calculate_hydration_needs"
    description = "Calculate recommended daily water intake based on weight and activity"
    parameters = [
        ToolParameter("weight", "number", "Weight in kilograms", required=True),
        ToolParameter("activity_level", "string", "Activity level", required=True,
                     enum=["sedentary", "light", "moderate", "very_active"]),
    ]

    def execute(self, weight: float, activity_level: str) -> str:
        """Calculate hydration needs."""
        # Base: 30 ml per kg of body weight
        base_water = weight * 30
        
        # Additional water for activity
        activity_multipliers = {
            "sedentary": 0,
            "light": 200,
            "moderate": 400,
            "very_active": 600,
        }
        
        additional = activity_multipliers.get(activity_level.lower(), 0)
        total_water = base_water + additional
        
        return (f"Daily water intake recommendation: {total_water:.0f} mL/day "
                f"(approximately {total_water/250:.1f} cups)")


class MacroSplitCalculatorTool(BaseTool):
    """Calculate macronutrient split."""
    name = "calculate_macro_split"
    description = "Calculate recommended macronutrient split based on goals and calories"
    parameters = [
        ToolParameter("daily_calories", "number", "Daily calorie target", required=True),
        ToolParameter("goal", "string", "Fitness goal", required=True,
                     enum=["weight_loss", "muscle_gain", "maintenance"]),
    ]

    def execute(self, daily_calories: float, goal: str) -> str:
        """Calculate macro split."""
        # Macro percentages by goal
        splits = {
            "weight_loss": {"protein": 0.35, "carbs": 0.40, "fat": 0.25},
            "muscle_gain": {"protein": 0.30, "carbs": 0.45, "fat": 0.25},
            "maintenance": {"protein": 0.25, "carbs": 0.50, "fat": 0.25},
        }
        
        split = splits.get(goal.lower(), splits["maintenance"])
        
        protein_cal = daily_calories * split["protein"]
        carbs_cal = daily_calories * split["carbs"]
        fat_cal = daily_calories * split["fat"]
        
        protein_g = protein_cal / 4
        carbs_g = carbs_cal / 4
        fat_g = fat_cal / 9
        
        result = f"Macronutrient Split for {goal.replace('_', ' ').title()}:\n"
        result += f"  Protein: {protein_g:.0f}g ({split['protein']*100:.0f}%)\n"
        result += f"  Carbs: {carbs_g:.0f}g ({split['carbs']*100:.0f}%)\n"
        result += f"  Fat: {fat_g:.0f}g ({split['fat']*100:.0f}%)\n"
        
        return result


def register_built_in_tools(registry: ToolRegistry) -> None:
    """
    Register all built-in tools.
    
    Args:
        registry: ToolRegistry instance
    """
    registry.register(BMICalculatorTool())
    registry.register(CalorieNeedsCalculatorTool())
    registry.register(TargetHeartRateZonesTool())
    registry.register(HydrationCalculatorTool())
    registry.register(MacroSplitCalculatorTool())
