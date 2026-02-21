# Healthcare AI Assistant API Endpoints Documentation

## Overview

This document provides comprehensive documentation for all API endpoints available in the Healthcare AI Assistant module. All endpoints are prefixed with `/api/assistant/` and require authentication except where noted.

---

## Authentication

All endpoints (except `/status/`) require **Token-based Authentication**.

### Request Headers
```
Authorization: Token YOUR_AUTH_TOKEN
Content-Type: application/json
```

### Getting an Auth Token

1. Register a new user:
```bash
POST /api/auth/register/
Content-Type: application/json

{
  "username": "user@example.com",
  "email": "user@example.com",
  "password": "securepassword"
}
```

2. Login:
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "token": "abc123def456",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com"
  }
}
```

---

## Endpoints

### 1. Chat with AI Assistant
**URL:** `/chat/`  
**Method:** `POST`  
**Authentication:** Required  
**Name:** `chat`

#### Description
Main endpoint for chatting with the healthcare AI assistant. The assistant uses RAG (Retrieval-Augmented Generation) to retrieve user's health data and provide context-aware responses.

#### Request Body
```json
{
  "message": "string (required, 1-5000 characters)",
  "conversation_id": "integer (optional)",
  "use_rag": "boolean (optional, default: true)"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The user's message or question (1-5000 characters) |
| `conversation_id` | integer | No | ID of existing conversation. If omitted, creates new conversation |
| `use_rag` | boolean | No | Whether to use health data context retrieval (default: true). Set to false for general questions |

#### Response (200 OK)
```json
{
  "conversation_id": 1,
  "message_id": 42,
  "response": "Based on your recent vitals and fitness data...",
  "tools_used": ["BMICalculator", "CalorieNeedsCalculator"],
  "health_data_context": {
    "latest_vitals": "...",
    "fitness_summary": "..."
  },
  "timestamp": "2026-02-21T10:30:00Z"
}
```

#### Error Responses
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid message | Message is empty or exceeds 5000 characters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 503 | Service unavailable | Gemini API is unavailable |

#### Examples

**Basic Chat:**
```bash
curl -X POST http://localhost:8000/api/assistant/chat/ \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should my daily calorie intake be?"
  }'
```

**Continue Existing Conversation:**
```bash
curl -X POST http://localhost:8000/api/assistant/chat/ \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What about protein intake?",
    "conversation_id": 1
  }'
```

**General Question (No RAG):**
```bash
curl -X POST http://localhost:8000/api/assistant/chat/ \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the benefits of interval training?",
    "use_rag": false
  }'
```

---

### 2. Get Conversation List
**URL:** `/conversations/`  
**Method:** `GET`  
**Authentication:** Required  
**Name:** `conversation-list`

#### Description
Retrieves all conversations for the authenticated user, paginated and sortable.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `page_size` | integer | 10 | Number of conversations per page |
| `is_active` | boolean | - | Filter by active status (true/false) |
| `ordering` | string | `-updated_at` | Order by field. Use `-` for descending |

#### Response (200 OK)
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/assistant/conversations/?page=2",
  "previous": null,
  "results": [
    {
      "id": 5,
      "title": "Weight Loss Strategy Discussion",
      "is_active": true,
      "created_at": "2026-02-20T14:30:00Z",
      "updated_at": "2026-02-21T10:15:00Z",
      "message_count": 8
    },
    {
      "id": 4,
      "title": "Sleep Quality Improvement",
      "is_active": true,
      "created_at": "2026-02-19T09:00:00Z",
      "updated_at": "2026-02-20T16:45:00Z",
      "message_count": 5
    }
  ]
}
```

#### Examples

**Get First Page:**
```bash
curl -X GET "http://localhost:8000/api/assistant/conversations/" \
  -H "Authorization: Token abc123def456"
```

**Get Specific Page:**
```bash
curl -X GET "http://localhost:8000/api/assistant/conversations/?page=2&page_size=20" \
  -H "Authorization: Token abc123def456"
```

**Filter Active Conversations:**
```bash
curl -X GET "http://localhost:8000/api/assistant/conversations/?is_active=true" \
  -H "Authorization: Token abc123def456"
```

---

### 3. Get Conversation Detail
**URL:** `/conversations/<conversation_id>/`  
**Method:** `GET, PUT, DELETE`  
**Authentication:** Required  
**Name:** `conversation-detail`

#### Description
Retrieve, update, or delete a specific conversation with all its messages.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `conversation_id` | integer | ID of the conversation |

#### GET - Retrieve Conversation
**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Weight Loss Strategy Discussion",
  "is_active": true,
  "created_at": "2026-02-20T14:30:00Z",
  "updated_at": "2026-02-21T10:15:00Z",
  "user": 1,
  "messages": [
    {
      "id": 42,
      "role": "user",
      "content": "What should my daily calorie intake be?",
      "tools_used": [],
      "created_at": "2026-02-20T14:30:00Z"
    },
    {
      "id": 43,
      "role": "assistant",
      "content": "Based on your current metrics...",
      "tools_used": ["CalorieNeedsCalculator"],
      "created_at": "2026-02-20T14:31:00Z"
    }
  ]
}
```

#### PUT - Update Conversation
**Request Body:**
```json
{
  "title": "New Title",
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "New Title",
  "is_active": false,
  "updated_at": "2026-02-21T10:30:00Z"
}
```

#### DELETE - Delete Conversation
**Response (204 No Content)**

#### Examples

**Get Conversation:**
```bash
curl -X GET "http://localhost:8000/api/assistant/conversations/1/" \
  -H "Authorization: Token abc123def456"
```

**Update Conversation Title:**
```bash
curl -X PUT "http://localhost:8000/api/assistant/conversations/1/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Discussion Topic"
  }'
```

**Archive Conversation:**
```bash
curl -X PUT "http://localhost:8000/api/assistant/conversations/1/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

**Delete Conversation:**
```bash
curl -X DELETE "http://localhost:8000/api/assistant/conversations/1/" \
  -H "Authorization: Token abc123def456"
```

---

### 4. Generate Health Summary
**URL:** `/health-summary/`  
**Method:** `POST`  
**Authentication:** Required  
**Name:** `health-summary`

#### Description
Generates a personalized health summary using AI analysis of user's health data over a specified period.

#### Request Body
```json
{
  "days": "integer (optional, default: 30)",
  "conversation_id": "integer (optional)"
}
```

#### Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Number of days to analyze (1-365) |
| `conversation_id` | integer | - | Optional: attach summary to existing conversation |

#### Response (200 OK)
```json
{
  "summary": "Over the past 30 days, your health metrics show...",
  "conversation_id": 6,
  "health_data_overview": {
    "average_heart_rate": 72,
    "total_steps": 245000,
    "average_sleep_duration": 7.5,
    "average_calories_consumed": 2100
  },
  "key_insights": [
    "Your sleep quality has improved by 15%",
    "Weekly step count shows consistent activity",
    "Calorie intake is within healthy range"
  ],
  "generated_at": "2026-02-21T10:30:00Z"
}
```

#### Examples

**Generate Default 30-Day Summary:**
```bash
curl -X POST "http://localhost:8000/api/assistant/health-summary/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Generate 7-Day Summary:**
```bash
curl -X POST "http://localhost:8000/api/assistant/health-summary/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 7
  }'
```

**Generate and Add to Conversation:**
```bash
curl -X POST "http://localhost:8000/api/assistant/health-summary/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 14,
    "conversation_id": 1
  }'
```

---

### 5. Get Wellness Recommendations
**URL:** `/wellness-recommendations/`  
**Method:** `POST`  
**Authentication:** Required  
**Name:** `wellness-recommendations`

#### Description
Generates personalized wellness recommendations based on current health data and goals.

#### Request Body
```json
{
  "focus_areas": "array of strings (optional)",
  "conversation_id": "integer (optional)"
}
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `focus_areas` | array | Topics to focus on: `["nutrition", "fitness", "sleep", "stress"]` (optional) |
| `conversation_id` | integer | Optional: attach recommendations to existing conversation |

#### Response (200 OK)
```json
{
  "recommendations": [
    {
      "category": "nutrition",
      "recommendation": "Increase protein intake to 0.8g per pound of body weight...",
      "priority": "high",
      "timeframe": "Start this week"
    },
    {
      "category": "fitness",
      "recommendation": "Add 2 days of strength training to your routine...",
      "priority": "medium",
      "timeframe": "Gradually increase over 2 weeks"
    },
    {
      "category": "sleep",
      "recommendation": "Maintain consistent sleep schedule...",
      "priority": "medium",
      "timeframe": "Implement immediately"
    }
  ],
  "conversation_id": 7,
  "generated_at": "2026-02-21T10:35:00Z"
}
```

#### Examples

**Get General Recommendations:**
```bash
curl -X POST "http://localhost:8000/api/assistant/wellness-recommendations/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Focus on Specific Areas:**
```bash
curl -X POST "http://localhost:8000/api/assistant/wellness-recommendations/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "focus_areas": ["fitness", "nutrition"]
  }'
```

**Add to Existing Conversation:**
```bash
curl -X POST "http://localhost:8000/api/assistant/wellness-recommendations/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "focus_areas": ["sleep", "stress"],
    "conversation_id": 1
  }'
```

---

### 6. Get Health Insights
**URL:** `/insights/`  
**Method:** `GET`  
**Authentication:** Required  
**Name:** `health-insights`

#### Description
Retrieves all AI-generated health insights for the authenticated user, including summaries, recommendations, alerts, and detected patterns.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `page_size` | integer | 10 | Insights per page |
| `insight_type` | string | - | Filter by type: `summary`, `recommendation`, `alert`, `pattern`, `trend` |
| `is_read` | boolean | - | Filter by read status |
| `ordering` | string | `-created_at` | Order by field (use `-` for desc) |

#### Response (200 OK)
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/assistant/insights/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "insight_type": "alert",
      "title": "Unusual Sleep Pattern Detected",
      "content": "Your sleep duration has decreased by 20% this week...",
      "related_metrics": ["sleep_duration", "sleep_quality"],
      "is_read": false,
      "created_at": "2026-02-21T08:00:00Z"
    },
    {
      "id": 2,
      "insight_type": "recommendation",
      "title": "Hydration Improvement",
      "content": "Consider increasing daily water intake...",
      "related_metrics": ["hydration"],
      "is_read": true,
      "created_at": "2026-02-20T15:30:00Z"
    }
  ]
}
```

#### Examples

**Get All Insights:**
```bash
curl -X GET "http://localhost:8000/api/assistant/insights/" \
  -H "Authorization: Token abc123def456"
```

**Get Only Alerts:**
```bash
curl -X GET "http://localhost:8000/api/assistant/insights/?insight_type=alert" \
  -H "Authorization: Token abc123def456"
```

**Get Unread Insights:**
```bash
curl -X GET "http://localhost:8000/api/assistant/insights/?is_read=false" \
  -H "Authorization: Token abc123def456"
```

**Get Trends (Sorted by Newest):**
```bash
curl -X GET "http://localhost:8000/api/assistant/insights/?insight_type=trend&page_size=5" \
  -H "Authorization: Token abc123def456"
```

---

### 7. Get Available Tools
**URL:** `/tools/`  
**Method:** `GET`  
**Authentication:** Required  
**Name:** `available-tools`

#### Description
Lists all available tools (both built-in and custom) that the AI assistant can use for calculations and analysis.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter tools by category (e.g., `calculation`, `analysis`) |
| `is_active` | boolean | Filter by active status |

#### Response (200 OK)
```json
{
  "built_in_tools": [
    {
      "name": "BMICalculatorTool",
      "description": "Calculates Body Mass Index and health category",
      "category": "calculation",
      "parameters": [
        {
          "name": "weight",
          "type": "float",
          "description": "Body weight in kg",
          "required": true
        },
        {
          "name": "height",
          "type": "float",
          "description": "Height in meters",
          "required": true
        }
      ],
      "is_active": true
    },
    {
      "name": "CalorieNeedsCalculatorTool",
      "description": "Calculates daily calorie requirements using TDEE formula",
      "category": "calculation",
      "parameters": [
        {
          "name": "age",
          "type": "integer",
          "description": "Age in years",
          "required": true
        },
        {
          "name": "weight",
          "type": "float",
          "description": "Body weight in kg",
          "required": true
        },
        {
          "name": "height",
          "type": "float",
          "description": "Height in cm",
          "required": true
        },
        {
          "name": "gender",
          "type": "string",
          "description": "Male or Female",
          "required": true,
          "enum": ["male", "female"]
        },
        {
          "name": "activity_level",
          "type": "string",
          "description": "sedentary, lightly_active, moderately_active, very_active, extremely_active",
          "required": true
        }
      ],
      "is_active": true
    },
    {
      "name": "TargetHeartRateZonesTool",
      "description": "Calculates 5 heart rate training zones",
      "category": "calculation",
      "parameters": [
        {
          "name": "age",
          "type": "integer",
          "description": "Age in years",
          "required": true
        }
      ],
      "is_active": true
    },
    {
      "name": "HydrationCalculatorTool",
      "description": "Calculates daily hydration needs based on weight and activity",
      "category": "calculation",
      "parameters": [
        {
          "name": "weight",
          "type": "float",
          "description": "Body weight in kg",
          "required": true
        },
        {
          "name": "activity_level",
          "type": "string",
          "description": "sedentary, moderate, high",
          "required": true
        }
      ],
      "is_active": true
    },
    {
      "name": "MacroSplitCalculatorTool",
      "description": "Calculates macro nutrient distribution based on goal",
      "category": "calculation",
      "parameters": [
        {
          "name": "daily_calories",
          "type": "float",
          "description": "Daily calorie target",
          "required": true
        },
        {
          "name": "goal",
          "type": "string",
          "description": "weight_loss, maintenance, muscle_gain",
          "required": true
        }
      ],
      "is_active": true
    }
  ],
  "custom_tools": []
}
```

#### Examples

**Get All Tools:**
```bash
curl -X GET "http://localhost:8000/api/assistant/tools/" \
  -H "Authorization: Token abc123def456"
```

---

### 8. Get Assistant Status
**URL:** `/status/`  
**Method:** `GET`  
**Authentication:** Not Required  
**Name:** `assistant-status`

#### Description
Check the health and status of the AI assistant without authentication. Useful for monitoring and debugging.

#### Response (200 OK)
```json
{
  "status": "operational",
  "gemini_api": "connected",
  "database": "connected",
  "timestamp": "2026-02-21T10:40:00Z",
  "message": "Healthcare AI Assistant is running normally"
}
```

#### Response (503 Service Unavailable)
```json
{
  "status": "unavailable",
  "gemini_api": "disconnected",
  "database": "connected",
  "timestamp": "2026-02-21T10:40:00Z",
  "message": "Gemini API connection failed"
}
```

#### Examples

**Check Service Status:**
```bash
curl -X GET "http://localhost:8000/api/assistant/status/"
```

---

## Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid parameters or message format |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found (invalid conversation_id) |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Gemini API unavailable |

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": "Additional context if available"
}
```

### Example Errors

**Missing Authentication:**
```json
{
  "error": "authentication_required",
  "message": "Authentication credentials were not provided."
}
```

**Invalid Message:**
```json
{
  "error": "validation_error",
  "message": "Message must be between 1 and 5000 characters",
  "details": {
    "message": ["Ensure this field has no fewer than 1 characters."]
  }
}
```

**Service Unavailable:**
```json
{
  "error": "service_unavailable",
  "message": "Gemini API is currently unavailable. Please try again later."
}
```

---

## Request/Response Examples

### Example 1: Complete Chat Flow

**Step 1: Start New Conversation**
```bash
curl -X POST "http://localhost:8000/api/assistant/chat/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to lose weight. What should I do?"
  }'
```

Response:
```json
{
  "conversation_id": 1,
  "message_id": 1,
  "response": "Based on your current health data, here's a personalized weight loss plan...",
  "tools_used": ["BMICalculator", "CalorieNeedsCalculator"],
  "timestamp": "2026-02-21T10:30:00Z"
}
```

**Step 2: Continue Conversation**
```bash
curl -X POST "http://localhost:8000/api/assistant/chat/" \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What about protein intake?",
    "conversation_id": 1
  }'
```

**Step 3: View Conversation**
```bash
curl -X GET "http://localhost:8000/api/assistant/conversations/1/" \
  -H "Authorization: Token abc123def456"
```

---

## Rate Limiting

Currently, no rate limiting is enforced, but consider implementing:
- 100 requests per minute per user
- 1000 requests per hour per user
- 10000 requests per day per user

---

## Best Practices

1. **Use Conversations:** Continue related discussions in the same conversation for better context
2. **Enable RAG:** Leave `use_rag=true` for personalized responses using user's health data
3. **Check Status First:** Use `/status/` endpoint before making critical API calls
4. **Handle Errors:** Implement proper error handling for 503 (service unavailable) responses
5. **Pagination:** Use pagination parameters for large data sets
6. **Archive Old Conversations:** Use PUT to set `is_active=false` instead of deleting

---

## Integration Examples

### Python (using requests)
```python
import requests

BASE_URL = "http://localhost:8000/api"
TOKEN = "your_auth_token"

headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

# Chat with assistant
response = requests.post(
    f"{BASE_URL}/assistant/chat/",
    headers=headers,
    json={"message": "What's my BMI?"}
)
print(response.json())
```

### JavaScript (using fetch)
```javascript
const BASE_URL = "http://localhost:8000/api";
const TOKEN = "your_auth_token";

const headers = {
    "Authorization": `Token ${TOKEN}`,
    "Content-Type": "application/json"
};

// Chat with assistant
fetch(`${BASE_URL}/assistant/chat/`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
        message: "How much water should I drink daily?"
    })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### cURL
```bash
# Set token as variable
TOKEN="your_auth_token"

# Chat
curl -X POST "http://localhost:8000/api/assistant/chat/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Give me personalized fitness recommendations"
  }'
```

---

## Support & Troubleshooting

### Common Issues

**"Apps aren't loaded yet"**
- Ensure Django app is properly registered in `settings.py`
- Check that all imports use absolute paths from `healix_server`

**"Gemini API connection failed"**
- Verify `GEMINI_API_KEY` environment variable is set
- Check API key validity and quota

**"No health data found"**
- Ensure user has created health records (vitals, fitness, nutrition, etc.)
- RAG requires data to provide context

**Token authentication failing**
- Verify token is correct: `curl -H "Authorization: Token $TOKEN" http://localhost:8000/api/assistant/status/`
- Token may have expired; obtain new token through login endpoint

---

## API Version History

**v1.0** (Current)
- Initial release
- 8 endpoints
- 5 built-in tools
- RAG support
- Token authentication

---

## Contact & Support

For issues or feature requests, contact the development team or check the project documentation at `DJANGO_APP_STRUCTURE.md`.
