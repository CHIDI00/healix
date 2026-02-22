# Healthcare AI Assistant with RAG and Gemini

## Overview

The Healthcare AI Assistant is a powerful AI-driven system that acts as a personal healthcare professional. It combines:

- **RAG (Retrieval-Augmented Generation)**: Retrieves user's health data from database for context-aware responses
- **Gemini 1.5 Pro**: Google's advanced AI model fine-tuned for healthcare insights
- **Tool Registry**: Extensible system for adding custom calculation and analysis tools
- **Conversation Management**: Full conversation history tracking with message persistence

## Features

✅ Context-aware healthcare advice based on user's actual health data  
✅ Personalized wellness recommendations  
✅ Health summary generation  
✅ Easy custom tool creation and registration  
✅ Built-in healthcare calculation tools  
✅ Conversation history management  
✅ Multi-user support with full isolation  

## Setup

### 1. Install Required Package

```bash
pip install google-generativeai
```

### 2. Set Environment Variable

```bash
# Linux/Mac
export GEMINI_API_KEY="your-api-key-here"

# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"

# Windows Command Prompt
set GEMINI_API_KEY=your-api-key-here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Update Django Settings

Add to `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'healix_server.assistant',
]
```

### 4. Run Migrations

```bash
python manage.py migrate
```

## API Endpoints

### 1. Chat with Assistant

Send a message to the healthcare AI assistant.

**Endpoint:** `POST /api/assistant/chat/`

**Headers:**
```
Authorization: Token <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "How should I improve my sleep quality?",
  "conversation_id": 1,
  "use_rag": true
}
```

**Parameters:**
- `message` (string, required): Your question or message
- `conversation_id` (integer, optional): Continue existing conversation. Omit or set to null for new conversation
- `use_rag` (boolean, optional, default: true): Include retrieved health context

**Response (200 OK):**
```json
{
  "conversation_id": 1,
  "message": {
    "id": 5,
    "role": "assistant",
    "content": "Based on your sleep data, I notice...",
    "created_at": "2026-02-21T10:30:00Z"
  }
}
```

### 2. Get Conversations

List all conversations for the authenticated user.

**Endpoint:** `GET /api/assistant/conversations/`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "How should I improve my sleep quality?",
    "created_at": "2026-02-21T10:00:00Z",
    "updated_at": "2026-02-21T10:30:00Z",
    "is_active": true,
    "message_count": 5,
    "last_message": {
      "role": "assistant",
      "content": "Based on your data...",
      "created_at": "2026-02-21T10:30:00Z"
    }
  }
]
```

### 3. Get Conversation Details

Get full conversation with all messages.

**Endpoint:** `GET /api/assistant/conversations/{id}/`

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Sleep Quality Discussion",
  "created_at": "2026-02-21T10:00:00Z",
  "updated_at": "2026-02-21T10:30:00Z",
  "is_active": true,
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "How should I improve my sleep?",
      "created_at": "2026-02-21T10:00:00Z",
      "tools_used": []
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Based on your sleep data...",
      "created_at": "2026-02-21T10:01:00Z",
      "tools_used": []
    }
  ],
  "message_count": 2
}
```

### 4. Update Conversation

Update conversation title or status.

**Endpoint:** `PUT /api/assistant/conversations/{id}/`

**Request Body:**
```json
{
  "title": "Sleep Improvement Plan",
  "is_active": true
}
```

### 5. Delete Conversation

**Endpoint:** `DELETE /api/assistant/conversations/{id}/`

### 6. Generate Health Summary

Get AI-generated comprehensive health summary.

**Endpoint:** `POST /api/assistant/health-summary/`

**Request Body:**
```json
{
  "include_recommendations": true,
  "days": 30
}
```

**Response (200 OK):**
```json
{
  "insight_id": 1,
  "content": "Your comprehensive health summary...\n\nKey Metrics:\n- Heart Rate: Average 72 bpm\n- Sleep: 7.2 hours per night\n..."
}
```

### 7. Get Wellness Recommendations

Get personalized wellness recommendations.

**Endpoint:** `POST /api/assistant/wellness-recommendations/`

**Response (200 OK):**
```json
{
  "insight_id": 2,
  "content": "Based on your health data, here are my top 5 personalized wellness recommendations...\n\n1. Increase water intake...\n2. Add strength training...\n..."
}
```

### 8. Get Health Insights

Get all AI-generated insights for the user.

**Endpoint:** `GET /api/assistant/insights/`

**Query Parameters:**
- `mark_read=true`: Mark all insights as read

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "insight_type": "summary",
    "title": "AI Health Summary",
    "content": "Your comprehensive health analysis...",
    "created_at": "2026-02-21T10:00:00Z",
    "is_read": false,
    "related_metrics": []
  }
]
```

### 9. List Available Tools

Get all tools available to the assistant.

**Endpoint:** `GET /api/assistant/tools/`

**Response (200 OK):**
```json
{
  "count": 5,
  "tools": {
    "calculate_bmi": "Calculate Body Mass Index from weight and height",
    "calculate_daily_calorie_needs": "Calculate estimated daily calorie needs using Mifflin-St Jeor equation",
    "calculate_heart_rate_zones": "Calculate target heart rate zones for exercise training",
    "calculate_hydration_needs": "Calculate recommended daily water intake based on weight and activity",
    "calculate_macro_split": "Calculate recommended macronutrient split based on goals and calories"
  }
}
```

### 10. Check Assistant Status

Check if AI assistant is properly configured.

**Endpoint:** `GET /api/assistant/status/`

**Response (200 OK):**
```json
{
  "status": "operational",
  "tools_available": 5,
  "message": "Healthcare AI Assistant is ready"
}
```

## Built-in Tools

The assistant comes with 5 pre-built healthcare calculation tools:

### 1. Calculate BMI

Calculates Body Mass Index with category classification.

**Parameters:**
- `weight` (number): Weight in kilograms
- `height` (number): Height in centimeters

**Returns:** BMI value with category (Underweight, Normal, Overweight, Obese)

### 2. Calculate Daily Calorie Needs

Uses Mifflin-St Jeor equation for precise calorie calculation.

**Parameters:**
- `weight` (number): Weight in kg
- `height` (number): Height in cm
- `age` (integer): Age in years
- `gender` (string): "male" or "female"
- `activity_level` (string): sedentary, light, moderate, very_active, extremely_active

**Returns:** Estimated daily calorie needs (TDEE) and Basal Metabolic Rate (BMR)

### 3. Calculate Heart Rate Zones

Provides 5 training zones for exercise optimization.

**Parameters:**
- `max_heart_rate` (integer): Maximum heart rate in bpm

**Returns:** Heart rate ranges for 5 training zones

### 4. Calculate Hydration Needs

Based on weight and activity level.

**Parameters:**
- `weight` (number): Weight in kg
- `activity_level` (string): sedentary, light, moderate, very_active

**Returns:** Daily water intake recommendation in mL and cups

### 5. Calculate Macro Split

Recommendations for protein, carbs, and fat.

**Parameters:**
- `daily_calories` (number): Daily calorie target
- `goal` (string): weight_loss, muscle_gain, maintenance

**Returns:** Grams and percentages for each macronutrient

## Creating Custom Tools

### Method 1: Class-Based Tool

Create a custom tool by inheriting from `BaseTool`:

```python
from healix_server.assistant.tools import BaseTool, ToolParameter
from healix_server.assistant.gemini_client import GeminiHealthAssistant

class BloodPressureCategoryTool(BaseTool):
    """Categorize blood pressure readings."""
    
    name = "categorize_blood_pressure"
    description = "Categorize blood pressure readings as Normal, Elevated, High BP Stage 1, etc."
    parameters = [
        ToolParameter("systolic", "integer", "Systolic pressure in mmHg", required=True),
        ToolParameter("diastolic", "integer", "Diastolic pressure in mmHg", required=True),
    ]
    
    def execute(self, systolic: int, diastolic: int) -> str:
        """Categorize blood pressure."""
        if systolic < 120 and diastolic < 80:
            category = "Normal"
        elif systolic < 130 and diastolic < 80:
            category = "Elevated"
        elif systolic < 140 or diastolic < 90:
            category = "High Blood Pressure (Stage 1)"
        else:
            category = "High Blood Pressure (Stage 2)"
        
        return f"Blood Pressure Category: {category} ({systolic}/{diastolic} mmHg)"

# Register the tool
assistant = GeminiHealthAssistant()
assistant.register_custom_tool(BloodPressureCategoryTool())
```

### Method 2: Function-Based Tool

Register a simple function as a tool:

```python
def calculate_vo2_max(max_heart_rate: int, age: int) -> str:
    """Estimate VO2 Max."""
    # (220 - age - resting_hr) × 15.3 / max_hr - approximate formula
    vo2_estimate = max_heart_rate * 0.6  # Simplified
    return f"Estimated VO2 Max: {vo2_estimate:.1f} mL/(kg·min)"

assistant.register_custom_tool_func(
    name="estimate_vo2_max",
    description="Estimate VO2 Max from heart rate data",
    parameters=[
        ToolParameter("max_heart_rate", "integer", "Maximum heart rate in bpm"),
        ToolParameter("age", "integer", "Age in years"),
    ],
    func=calculate_vo2_max
)
```

### Method 3: Register via Decorator

```python
from healix_server.assistant.tools import ToolRegistry

registry = ToolRegistry()

@registry.register_tool
class StepGoalCalculatorTool(BaseTool):
    name = "calculate_step_goal"
    description = "Calculate daily step goal based on activity level"
    parameters = [
        ToolParameter("activity_level", "string", "Current activity level", 
                     required=True, enum=["sedentary", "light", "moderate", "active"]),
    ]
    
    def execute(self, activity_level: str) -> str:
        goals = {
            "sedentary": 5000,
            "light": 7500,
            "moderate": 10000,
            "active": 15000,
        }
        goal = goals.get(activity_level, 10000)
        return f"Recommended daily step goal: {goal} steps"
```

## Usage Examples

### Example 1: Basic Chat Session

```bash
# Start conversation
curl -X POST http://localhost:8000/api/assistant/chat/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel tired during the day. What can I do?"
  }'

# Response will include conversation_id

# Continue conversation
curl -X POST http://localhost:8000/api/assistant/chat/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What about my sleep schedule?",
    "conversation_id": 1
  }'
```

### Example 2: Get Health Summary

```bash
curl -X POST http://localhost:8000/api/assistant/health-summary/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "include_recommendations": true,
    "days": 30
  }'
```

### Example 3: Django Shell Usage

```python
from django.contrib.auth.models import User
from healix_server.assistant.gemini_client import GeminiHealthAssistant

user = User.objects.get(username='john_doe')
assistant = GeminiHealthAssistant()

# Chat
response = assistant.chat(user, "How can I improve my fitness?")
print(response)

# Get health summary
summary = assistant.get_health_summary(user)
print(summary)

# Get wellness recommendations
recommendations = assistant.get_wellness_recommendations(user)
print(recommendations)

# List tools
tools = assistant.list_available_tools()
for name, description in tools.items():
    print(f"{name}: {description}")
```

### Example 4: Adding Custom Tool in Django Shell

```python
from django.contrib.auth.models import User
from healix_server.assistant.gemini_client import GeminiHealthAssistant
from healix_server.assistant.tools import BaseTool, ToolParameter

class FitnessLevelTool(BaseTool):
    name = "assess_fitness_level"
    description = "Assess fitness level based on VO2 Max"
    parameters = [
        ToolParameter("vo2_max", "number", "VO2 Max value in mL/(kg·min)"),
        ToolParameter("age", "integer", "Age in years"),
    ]
    
    def execute(self, vo2_max: float, age: int) -> str:
        # Reference values (simplified)
        levels = {
            "Poor": vo2_max < 20,
            "Average": 20 <= vo2_max < 35,
            "Good": 35 <= vo2_max < 45,
            "Excellent": vo2_max >= 45,
        }
        level = [k for k, v in levels.items() if v][0]
        return f"Fitness Level: {level} (VO2 Max: {vo2_max})"

assistant = GeminiHealthAssistant()
assistant.register_custom_tool(FitnessLevelTool())

# Now use in chat
user = User.objects.get(username='john_doe')
response = assistant.chat(user, "What is my fitness level? I have VO2 max of 42.")
print(response)
```

## RAG (Retrieval-Augmented Generation)

The system automatically retrieves relevant health data when answering questions:

**Health Data Retrieved:**
- Last 7 days of vital signs
- Latest physical measurements
- Last week's fitness activity summary
- Nutrition tracking summary
- Sleep quality and duration
- Reproductive health data (if applicable)

**Smart Context Selection:**

The system intelligently selects relevant data based on query keywords:
- Query contains "vital/heart/blood pressure" → Retrieve vital signs
- Query contains "weight/height/body" → Retrieve physical data
- Query contains "exercise/fitness/workout" → Retrieve fitness data
- Query contains "nutrition/diet/food" → Retrieve nutrition data
- Query contains "sleep/rest/tired" → Retrieve sleep data
- Query contains "period/menstruation" → Retrieve reproductive health data

## Database Models

### AssistantConversation
Stores conversation sessions:
- `user`: FK to User
- `title`: Conversation title
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `is_active`: Whether conversation is active

### ConversationMessage
Individual messages in conversations:
- `conversation`: FK to AssistantConversation
- `role`: "user" or "assistant"
- `content`: Message text
- `tools_used`: List of tools used (for assistant messages)
- `created_at`: Timestamp

### HealthInsight
AI-generated insights:
- `user`: FK to User
- `insight_type`: summary, recommendation, alert, pattern, trend
- `title`: Insight title
- `content`: Insight content
- `related_metrics`: Relevant health metrics
- `created_at`: Timestamp
- `is_read`: Whether user has read it

### CustomTool
Registered custom tools:
- `name`: Tool name
- `description`: Tool description
- `category`: Tool category
- `parameters`: JSON schema for parameters
- `is_active`: Whether tool is active
- `created_by`: User who created it

## Error Handling

### API Key Not Configured

```json
{
  "error": "AI service not properly configured"
}
```

**Solution**: Set `GEMINI_API_KEY` environment variable

### Tool Execution Error

```json
{
  "error": "Error processing message"
}
```

Check server logs for specific error details

### Conversation Not Found

```json
{
  "detail": "Not found."
}
```

Ensure `conversation_id` belongs to authenticated user

## Best Practices

1. **Always use `use_rag=true`** for better context-aware responses
2. **Store important insights** generated by the assistant
3. **Regularly review recommendations** and track improvements
4. **Create custom tools** for domain-specific calculations
5. **Mark insights as read** to keep track of reviewed data
6. **Use descriptive conversation titles** for easy reference
7. **Clear old conversations** to maintain database performance

## Troubleshooting

**Q: "Assistant not responding"**
A: Check API key is set and credentials are valid

**Q: "Custom tool not working"**
A: Verify tool name matches function name, parameters are correct

**Q: "No health context included"**
A: Ensure user has health data logged, set `use_rag=true`

**Q: "Slow responses"**
A: May be due to network latency with Gemini API

## Performance Tips

- Cache tool definitions in production
- Implement rate limiting on chat endpoint
- Archive old conversations regularly
- Use pagination for insight retrieval
- Consider async processing for bulk recommendations

## Version

- **AI Assistant Version:** 1.0
- **Framework:** Django REST Framework + Google Gemini
- **Last Updated:** February 21, 2026
