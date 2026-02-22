# Custom Tools Development Guide for Healthcare AI Assistant

## Overview

The Healthcare AI Assistant provides an extensible tool registry system that allows developers to easily add custom calculation, analysis, and utility functions. Tools are automatically available to the AI model for use in generating responses.

## Architecture

```
┌─────────────────────────────────────┐
│   Gemini Healthcare Assistant       │
│  (acting as healthcare professional)│
└────────────┬────────────────────────┘
             │
             ├─────────────────────────────────┐
             │                                 │
     ┌───────▼────────────┐          ┌────────▼─────────┐
     │  Tool Registry     │          │  RAG System      │
     │                    │          │                  │
     │ • Built-in Tools   │          │ • Health Data    │
     │ • Custom Tools     │          │ • Context Mgmt   │
     └────────────────────┘          └──────────────────┘
```

## Tool Types

### 1. Calculation Tools
Perform mathematical calculations based on inputs.

Example: BMI Calculator, Calorie Needs, Heart Rate Zones

### 2. Analysis Tools
Analyze health data and provide insights.

Example: Fitness Level Assessment, Sleep Quality Analysis

### 3. Lookup Tools
Retrieve information from databases or external sources.

Example: Get medical guidelines, lookup normal ranges

### 4. Recommendation Tools
Generate personalized recommendations.

Example: Exercise recommendations, nutrition adjustments

## Creating Custom Tools

### Step 1: Import Required Classes

```python
from healix_server.assistant.tools import BaseTool, ToolParameter
```

### Step 2: Define Your Tool Class

```python
class YourCustomTool(BaseTool):
    # Required: unique tool name
    name = "your_tool_name"
    
    # Required: clear description of what the tool does
    description = "What this tool does and when to use it"
    
    # Required: list of parameters
    parameters = [
        ToolParameter("param1", "string", "Description of param1", required=True),
        ToolParameter("param2", "integer", "Description of param2", required=False),
    ]
    
    def execute(self, param1: str, param2: int = None) -> str:
        """
        Execute tool logic.
        
        Returns: String result that will be included in AI response
        """
        # Your implementation here
        result = f"Tool executed with {param1}"
        return result
```

### Step 3: Register the Tool

```python
from healix_server.assistant.gemini_client import GeminiHealthAssistant

assistant = GeminiHealthAssistant()
assistant.register_custom_tool(YourCustomTool())
```

## Common Patterns

### Pattern 1: Simple Calculation Tool

```python
class StressLevelCalculatorTool(BaseTool):
    """Calculate stress level based on vital signs."""
    
    name = "calculate_stress_level"
    description = "Estimate stress level from heart rate variability and blood pressure"
    parameters = [
        ToolParameter("resting_heart_rate", "integer", "Resting HR in bpm", required=True),
        ToolParameter("current_heart_rate", "integer", "Current HR in bpm", required=True),
        ToolParameter("blood_pressure_systolic", "integer", "Systolic BP in mmHg", required=True),
    ]
    
    def execute(self, resting_heart_rate: int, current_heart_rate: int, 
                blood_pressure_systolic: int) -> str:
        """Calculate stress level."""
        hr_increase = ((current_heart_rate - resting_heart_rate) / resting_heart_rate) * 100
        
        if hr_increase < 10 and blood_pressure_systolic < 130:
            level = "Low Stress"
            recommendations = "Maintain current habits"
        elif hr_increase < 20 and blood_pressure_systolic < 140:
            level = "Moderate Stress"
            recommendations = "Consider relaxation techniques"
        else:
            level = "High Stress"
            recommendations = "Practice stress management: meditation, breathing exercises"
        
        return f"Estimated Stress Level: {level}\nHR increase: {hr_increase:.1f}%\nRecommendations: {recommendations}"
```

### Pattern 2: Data Validation Tool

```python
class ValidateHealthMetricsTool(BaseTool):
    """Validate if health metrics are in normal ranges."""
    
    name = "validate_health_metrics"
    description = "Check if health metrics are within normal ranges"
    parameters = [
        ToolParameter("metric_type", "string", "Type of metric", required=True,
                     enum=["heart_rate", "blood_pressure", "blood_glucose", "temperature"]),
        ToolParameter("value", "number", "Metric value", required=True),
    ]
    
    def execute(self, metric_type: str, value: float) -> str:
        """Validate metric."""
        ranges = {
            "heart_rate": (60, 100),
            "blood_pressure": (90, 120),  # systolic
            "blood_glucose": (70, 100),   # fasting
            "temperature": (36.5, 37.5),
        }
        
        min_val, max_val = ranges.get(metric_type, (0, 1000))
        
        if value < min_val:
            status = "Low"
        elif value > max_val:
            status = "High"
        else:
            status = "Normal"
        
        return f"{metric_type}: {value} → {status} (Normal range: {min_val}-{max_val})"
```

### Pattern 3: Query Database Tool

```python
from django.contrib.auth.models import User
from healix_server.models import VitalSigns
from datetime import datetime, timedelta

class GetAverageVitalsTool(BaseTool):
    """Get average vital signs for a user over a period."""
    
    name = "get_average_vitals"
    description = "Calculate average vital signs for a user over past N days"
    parameters = [
        ToolParameter("user_id", "integer", "User ID", required=True),
        ToolParameter("days", "integer", "Number of past days to analyze", required=False),
    ]
    
    def execute(self, user_id: int, days: int = 7) -> str:
        """Get average vitals."""
        try:
            user = User.objects.get(id=user_id)
            since = datetime.now() - timedelta(days=days)
            
            vitals = VitalSigns.objects.filter(
                user=user,
                timestamp__gte=since
            )
            
            if not vitals.exists():
                return f"No vital signs data found for past {days} days"
            
            avg_hr = vitals.filter(heart_rate__isnull=False).aggregate(
                models.Avg('heart_rate'))['heart_rate__avg'] or 0
            avg_temp = vitals.filter(body_temperature__isnull=False).aggregate(
                models.Avg('body_temperature'))['body_temperature__avg'] or 0
            
            result = f"Average vitals for past {days} days:\n"
            result += f"  Heart Rate: {avg_hr:.0f} bpm\n"
            result += f"  Temperature: {avg_temp:.1f}°C\n"
            result += f"  Data points: {vitals.count()}"
            
            return result
        except User.DoesNotExist:
            return "User not found"
        except Exception as e:
            return f"Error retrieving vitals: {str(e)}"
```

### Pattern 4: External API Integration Tool

```python
import requests

class CheckWeatherTool(BaseTool):
    """Check weather for exercise planning."""
    
    name = "check_weather"
    description = "Check weather conditions for exercise planning"
    parameters = [
        ToolParameter("city", "string", "City name", required=True),
    ]
    
    def execute(self, city: str) -> str:
        """Check weather."""
        try:
            # Using a free weather API
            response = requests.get(
                f"https://api.open-meteo.com/v1/forecast",
                params={"latitude": 0, "longitude": 0, "current": "temperature_2m"}
            )
            # Simplified response
            return "Weather data would be fetched from API"
        except Exception as e:
            return f"Could not retrieve weather: {str(e)}"
```

## Function-Based Tools (Simple Alternative)

For simple tools, use the function-based registration:

```python
def convert_calories_to_macros(calories: float, protein_ratio: float = 0.3) -> str:
    """Convert calories to macro grams."""
    protein_cal = calories * protein_ratio
    protein_g = protein_cal / 4
    return f"Protein: {protein_g:.0f}g from {calories:.0f} calories"

assistant.register_custom_tool_func(
    name="convert_calories_macros",
    description="Convert calorie amount to macronutrient grams",
    parameters=[
        ToolParameter("calories", "number", "Total calories"),
        ToolParameter("protein_ratio", "number", "Protein ratio (0-1)"),
    ],
    func=convert_calories_to_macros
)
```

## Parameter Types

Supported parameter types for tools:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text | "Running", "John" |
| `integer` | Whole number | 72, 180 |
| `number` | Decimal number | 75.5, 3.14 |
| `boolean` | True/False | true, false |
| `object` | JSON object | {"key": "value"} |
| `array` | List | [1, 2, 3] |

## Best Practices

### 1. Clear Naming
```python
# Good
name = "calculate_calorie_deficit"

# Avoid
name = "calc_cd"
```

### 2. Comprehensive Description
```python
# Good
description = "Calculate daily calorie deficit based on TDEE and target weight loss rate"

# Avoid
description = "Calculate deficit"
```

### 3. Meaningful Parameters
```python
# Good
parameters = [
    ToolParameter("weight_kg", "number", "Current weight in kilograms", required=True),
    ToolParameter("height_cm", "number", "Height in centimeters", required=True),
]

# Avoid
parameters = [
    ToolParameter("w", "number", "Weight"),
    ToolParameter("h", "number", "Height"),
]
```

### 4. Informative Return Values
```python
# Good
return f"""
Sleep Score: 85/100

Summary: Excellent sleep quality
- Duration: 7.5 hours (Good)
- Deep Sleep: 120 minutes (Good)
- Interruptions: 2 (Normal)

Recommendations:
1. Maintain consistent sleep schedule
2. Continue dark room environment
"""

# Avoid
return "85"
```

### 5. Error Handling
```python
def execute(self, value: float) -> str:
    try:
        # Validate input
        if value < 0:
            return "Error: Value cannot be negative"
        
        result = perform_calculation(value)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"
```

## Integration with Django

### 1. Create a module for custom tools

**`custom_tools.py`**
```python
from healix_server.assistant.tools import BaseTool, ToolParameter

class MyOrganizationHealthTool(BaseTool):
    name = "my_organization_metric"
    description = "..."
    parameters = [...]
    
    def execute(self, **kwargs) -> str:
        # Implementation
        pass
```

### 2. Register in Django initialization

**`apps.py`**
```python
from django.apps import AppConfig

class HealixServerConfig(AppConfig):
    default_auto_field = 'django.db.BigAutoField'
    name = 'healix_server'
    
    def ready(self):
        # Register custom tools when Django starts
        from .custom_tools import MyOrganizationHealthTool
        # Register in a central assistant instance
```

### 3. Dynamic registration from database

```python
from .models import CustomTool

def register_custom_tools_from_db(assistant):
    """Register tools stored in database."""
    for tool_record in CustomTool.objects.filter(is_active=True):
        # Dynamically create tool from database
        # This allows admin UI for tool management
        pass
```

## Testing Your Tools

```python
# Manual test
tool = YourCustomTool()
result = tool.execute(param1="value1", param2=42)
print(result)

# Unit test
from django.test import TestCase

class CustomToolTests(TestCase):
    def test_tool_execution(self):
        tool = YourCustomTool()
        result = tool.execute(param1="test", param2=10)
        self.assertIn("expected", result)
    
    def test_tool_validation(self):
        tool_dict = YourCustomTool().to_tool_dict()
        self.assertEqual(tool_dict['name'], 'your_tool_name')
        self.assertEqual(len(tool_dict['parameters']['properties']), 2)
```

## Examples: Real-World Tools

### Tool: Activity Recommendation Based on Weather

```python
import requests
from datetime import datetime

class ActivityRecommendationTool(BaseTool):
    name = "recommend_activity"
    description = "Recommend physical activity based on time of day, weather, and user history"
    parameters = [
        ToolParameter("time_of_day", "string", "Morning, Afternoon, or Evening", 
                     required=True, enum=["morning", "afternoon", "evening"]),
        ToolParameter("weather", "string", "Current weather condition", 
                     required=True, enum=["sunny", "rainy", "cold", "hot"]),
        ToolParameter("fitness_level", "string", "User fitness level", 
                     required=True, enum=["beginner", "intermediate", "advanced"]),
    ]
    
    def execute(self, time_of_day: str, weather: str, fitness_level: str) -> str:
        recommendations = {
            "morning": {
                "sunny": {"beginner": "Light yoga or walking", "intermediate": "Running", "advanced": "HIIT training"},
                "rainy": {"beginner": "Indoor stretching", "intermediate": "Gym workout", "advanced": "Cross-training"},
            },
            "afternoon": {
                "sunny": {"beginner": "Outdoor walking", "intermediate": "Cycling", "advanced": "Trail running"},
                "rainy": {"beginner": "Swimming", "intermediate": "Weight training", "advanced": "Strength training"},
            },
            "evening": {
                "sunny": {"beginner": "Evening walk", "intermediate": "Moderate cardio", "advanced": "Recovery training"},
                "rainy": {"beginner": "Yoga", "intermediate": "Pilates", "advanced": "Functional training"},
            }
        }
        
        activity = recommendations.get(time_of_day, {}).get(weather, {}).get(fitness_level, "Walking")
        return f"Recommended activity: {activity}\nDuration: 30-60 minutes\nIntensity: Moderate"
```

### Tool: BMI Trend Analysis

```python
from django.db.models import Avg
from django.contrib.auth.models import User
from healix_server.models import PhysicalData
from datetime import datetime, timedelta

class BMITrendAnalysisTool(BaseTool):
    name = "analyze_bmi_trend"
    description = "Analyze BMI trend over time for a user"
    parameters = [
        ToolParameter("user_id", "integer", "User ID", required=True),
        ToolParameter("months", "integer", "Number of months to analyze", required=True),
    ]
    
    def execute(self, user_id: int, months: int) -> str:
        try:
            user = User.objects.get(id=user_id)
            since = datetime.now() - timedelta(days=months*30)
            
            data = PhysicalData.objects.filter(user=user, timestamp__gte=since)
            
            if not data.exists():
                return f"Insufficient data for {months} month analysis"
            
            # Calculate BMIs
            bmis = []
            for record in data:
                if record.weight and record.height:
                    height_m = record.height / 100
                    bmi = record.weight / (height_m ** 2)
                    bmis.append((record.timestamp, bmi))
            
            if len(bmis) < 2:
                return "Need at least 2 measurements for trend analysis"
            
            bmis.sort()
            start_bmi = bmis[0][1]
            current_bmi = bmis[-1][1]
            change = current_bmi - start_bmi
            
            trend = "Increasing" if change > 0.5 else ("Decreasing" if change < -0.5 else "Stable")
            
            return f"""
BMI Trend Analysis ({months} months):
- Starting BMI: {start_bmi:.1f}
- Current BMI: {current_bmi:.1f}
- Change: {change:+.1f}
- Trend: {trend}
- Measurements: {len(bmis)}

Assessment:
{f"Good progress! Continue current habits." if change < -1 else f"Maintain current trajectory." if abs(change) < 1 else f"Consider adjusting diet and exercise."}
"""
        except User.DoesNotExist:
            return "User not found"
        except Exception as e:
            return f"Error analyzing trend: {str(e)}"
```

## Deployment Checklist

- [ ] Tool name is unique and descriptive
- [ ] Description clearly explains tool purpose
- [ ] Parameters have accurate types and descriptions
- [ ] Error handling is implemented
- [ ] Tool has been tested with sample inputs
- [ ] Return value is formatted for readability
- [ ] Tool is registered with assistant
- [ ] Tool doesn't have external dependencies not in requirements.txt
- [ ] Tool respects user privacy (checks user ownership)
- [ ] Performance is acceptable for real-time use

## Documentation

Document your custom tools:

```python
"""
CustomFeatureTool - Analyzes user's custom feature data.

Tool Name: analyze_custom_feature
Description: Provides analysis and recommendations for custom health features

Parameters:
    - feature_id (integer): ID of the feature to analyze
    - days (integer): Days of historical data to analyze (default: 30)

Returns:
    - String containing analysis and recommendations

Usage:
    The AI assistant automatically uses this tool when discussing
    custom health features.

Examples:
    "How is my custom feature trending?"
    "Analyze my custom metrics for this month"
"""
```

## Version

- **Custom Tools Guide Version:** 1.0
- **Last Updated:** February 21, 2026
