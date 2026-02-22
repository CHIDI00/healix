# Healthcare AI Assistant - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                               │
│              (Frontend: React/Vue/Mobile App)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    REST API Requests/Responses
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      API Layer (Django REST)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Auth Views   │  │ Health       │  │ Assistant    │               │
│  │ (Login/Reg)  │  │ Views        │  │ Views        │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                              │                      │
└──────────────────────────────────────────────┼──────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────┐
                    │                          │                      │
        ┌───────────▼────────────┐  ┌─────────▼──────────┐  ┌────────▼──────────┐
        │ Health Data Layer      │  │ AI Assistant Core  │  │ Tool Registry      │
        │ ┌──────────────────┐   │  │ ┌──────────────┐   │  │ ┌────────────────┐ │
        │ │ VitalSigns       │   │  │ │ Gemini Client│   │  │ │ Built-in Tools │ │
        │ │ PhysicalData     │   │  │ │ (Gemini API) │   │  │ │ • BMI Calc     │ │
        │ │ FitnessData      │   │  │ └──────────────┘   │  │ │ • Calorie Calc │ │
        │ │ Nutrition        │   │  │ ┌──────────────┐   │  │ │ • HR Zones     │ │
        │ │ Sleep            │   │  │ │ RAG System   │◄──┼──┼─│ • Hydration    │ │
        │ │ ReproductiveHeal │   │  │ │ (HealthRAG)  │   │  │ │ • Macro Split  │ │
        │ └──────────────────┘   │  │ └──────────────┘   │  │ │ • Custom Tools │ │
        └───────────────────────┘  └────────────────────┘  │ └────────────────┘ │
                 ▲                                         └──────────┬─────────┘
                 │                                                     │
                 │  Query Health Data                                  │
                 │                                                     │
        ┌────────┴─────────────────────────────────────────────────────┼───────────┐
        │                                                               │           │
        │                                                    ┌──────────▼────────┐ │
        │                                                    │ Tool Execution    │ │
        │                                                    │ & Results         │ │
        │                                                    └──────────────────┘ │
        │                                                                        │
        │                                                                        │
        │                        Conversation Management                         │
        │                                                                        │
        │  ┌─────────────────────────────────────────────────────────┐          │
        │  │           AssistantConversation                          │          │
        │  │  ┌──────────────────────────────────────────────────┐   │          │
        │  │  │         ConversationMessage                      │   │          │
        │  │  │  - ID, Role, Content, Timestamp, Tools Used     │   │          │
        │  │  │  - Supports multi-turn conversations            │   │          │
        │  │  └──────────────────────────────────────────────────┘   │          │
        │  │                                                          │          │
        │  │  ┌──────────────────────────────────────────────────┐   │          │
        │  │  │         HealthInsight                            │   │          │
        │  │  │  - Type: summary, recommendation, etc.           │   │          │
        │  │  │  - Stored for later reference                    │   │          │
        │  │  └──────────────────────────────────────────────────┘   │          │
        │  └─────────────────────────────────────────────────────────┘          │
        │                                                                        │
        └────────────────────────────────────────────────────────────────────────┘
                ▲
                │
                │ ORM Queries
                │
        ┌───────┴─────────────┐
        │   Database Layer    │
        │ (SQLite/PostgreSQL) │
        │ - All Models       │
        │ - Conversation Hist│
        │ - Health Data      │
        └─────────────────────┘
                ▲
                │ External API
                │
        ┌───────┴──────────────────┐
        │  Google Gemini API       │
        │  (generativeai SDK)      │
        │  - LLM Processing       │
        │  - Function Calling     │
        │  - Streaming Responses  │
        └──────────────────────────┘
```

## Component Breakdown

### 1. API Layer (`views.py`)

**Endpoints:**
- `ChatWithAssistantView` - Handle chat requests
- `ConversationListView` - List user conversations
- `ConversationDetailView` - Get/update/delete conversation
- `HealthSummaryView` - Generate health summary
- `WellnessRecommendationsView` - Get recommendations
- `HealthInsightsView` - View insights
- `AvailableToolsView` - List tools

**Request Flow:**
```
HTTP Request → View validates → ✓
                         ↓
              Initialize GeminiHealthAssistant
                         ↓
              Process request (chat/summary/etc)
                         ↓
              Return JSON response
```

### 2. Gemini AI Integration (`gemini_client.py`)

**Core Class:** `GeminiHealthAssistant`

**Responsibilities:**
- Initialize Gemini client with API key
- Manage tool registry
- Orchestrate RAG system
- Handle multi-turn conversations
- Process tool calls from AI

**Flow:**
```
User Query
    ↓
Get Health Context (RAG)
    ↓
Build Prompt with Context + System Message
    ↓
Call Gemini API with Tools
    ↓
Gemini Response Analysis
    ├─ Text Response → Return
    └─ Function Call → Execute Tool → Include Result → Return
    ↓
Save to Conversation History
```

### 3. Tool Registry (`tools.py`)

**Core Classes:**
- `BaseTool` - Abstract base for all tools
- `ToolParameter` - Parameter definition
- `ToolRegistry` - Registry management

**Tool Definition Structure:**
```
Tool
├── name
├── description
├── parameters[]
│   ├── name
│   ├── type
│   ├── description
│   ├── required
│   └── enum (optional)
└── execute() → str
```

**Tool Resolution:**
```
Query contains "BMI"
    ↓
Gemini decides to use calculate_bmi tool
    ↓
Extract function_call from response
    ↓
Registry.execute("calculate_bmi", weight=75, height=180)
    ↓
Tool.execute() runs
    ↓
Result included in AI response
```

### 4. RAG System (`rag.py`)

**Data Retrieval Methods:**
```
HealthDataRAG
├── get_latest_vitals(user, days=7)
├── get_latest_physical_data(user)
├── get_fitness_summary(user, days=7)
├── get_nutrition_summary(user, days=7)
├── get_sleep_summary(user, days=7)
├── get_reproductive_health_data(user, days=30)
├── get_comprehensive_health_context(user)
└── get_context_for_query(user, query) ← Smart selection
```

**Query-Based Context Selection:**
```
User Query: "I feel tired"
    ↓
Check Keywords: ["tired", "sleep", "rest", "fatigue"]
    ↓
Match: "sleep" and "rest" detected
    ↓
get_sleep_summary() + get_latest_vitals()
    ↓
Context: Include sleep data + recent vital signs
    ↓
Query + Context → Gemini
```

### 5. Built-in Tools (`built_in_tools.py`)

**Tool Classes:**
1. `BMICalculatorTool`
2. `CalorieNeedsCalculatorTool`
3. `TargetHeartRateZonesTool`
4. `HydrationCalculatorTool`
5. `MacroSplitCalculatorTool`

**Auto-Registration:**
```python
def register_built_in_tools(registry):
    registry.register(BMICalculatorTool())
    # ... etc
```

### 6. Conversation Management

**Database Schema:**
```
AssistantConversation (1) ─→ (many) ConversationMessage
    ├── user
    ├── title
    ├── created_at
    ├── updated_at
    └── is_active
                               ├── role (user/assistant)
                               ├── content
                               ├── created_at
                               └── tools_used[]
```

**Message Flow:**
```
User Message
    ↓
Save to ConversationMessage(role='user')
    ↓
Get AI Response
    ↓
Save to ConversationMessage(role='assistant')
    ↓
Return to Client
```

### 7. Data Models

**Health Data Tables:**
- VitalSigns - Heart rate, BP, O2, temperature, etc.
- PhysicalData - Weight, height, body fat, BMR, etc.
- FitnessData - Steps, distance, calories, exercise type, etc.
- Nutrition - Calories, macros, hydration, etc.
- Sleep - Duration, quality, sleep stages, etc.
- ReproductiveHealth - Menstruation, ovulation, etc.

**AI System Tables:**
- AssistantConversation - Conversation sessions
- ConversationMessage - Individual messages
- HealthInsight - Generated insights
- CustomTool - Tool metadata

## Data Flow Examples

### Example 1: Simple Chat

```
1. User sends: "How's my heart health?"
                    ↓
2. API receives POST /api/assistant/chat/
                    ↓
3. GeminiHealthAssistant initialized
                    ↓
4. RAG: get_context_for_query() searches health data
        Keywords: "heart" → retrieve vital signs
                    ↓
5. Build prompt:
   - System prompt (healthcare professional role)
   - User query
   - Retrieved vital signs context
                    ↓
6. Call Gemini API with tools
                    ↓
7. Gemini analyzes vitals, generates response:
   "Your heart rate has been stable at 72 bpm... I recommend..."
                    ↓
8. Save messages:
   - User: "How's my heart health?"
   - Assistant: "Your heart rate..."
                    ↓
9. Return response to client
```

### Example 2: Tool-Based Response

```
1. User sends: "Calculate my BMI. I'm 75kg and 180cm tall"
                    ↓
2. GeminiHealthAssistant initialized
                    ↓
3. RAG: No specific health context query
        → Use get_comprehensive_health_context()
                    ↓
4. Build prompt with user query + tools
                    ↓
5. Call Gemini API
                    ↓
6. Gemini response includes function_call:
   {
     "name": "calculate_bmi",
     "arguments": {"weight": 75, "height": 180}
   }
                    ↓
7. Extract function_call, execute:
   tool = registry.get("calculate_bmi")
   result = tool.execute(weight=75, height=180)
   → "BMI: 23.1 (Normal weight)"
                    ↓
8. Include result in response to user
                    ↓
9. Save messages with tools_used=["calculate_bmi"]
```

### Example 3: Multi-Turn Conversation

```
Turn 1:
User: "I want to lose weight"
  ↓ (AI asks clarifying questions, provides initial guidance)
  
Turn 2:
User: "I'm 85kg, 175cm tall, moderately active"
  ↓ (Conversation ID continues, AI uses previous context)
     (RAG retrieves fitness and nutrition data)
  ↓ (AI uses calculate_macro_split tool)
  ↓ (Provides personalized targets)
  
Turn 3:
User: "What exercises would you recommend?"
  ↓ (Conversation history used for context)
     (RAG retrieves fitness history)
  ↓ (AI considers current fitness level)
  ↓ (Provides recommendation)

Result: 3 messages in 1 conversation with full context
```

## API Request/Response Flow

### Request Structure
```json
POST /api/assistant/chat/
{
  "message": "User query string",
  "conversation_id": 1,
  "use_rag": true
}
```

### Internal Processing
```
1. Validate request (ChatMessageInputSerializer)
2. Authenticate user (Token)
3. Get/create conversation
4. Save user message
5. Initialize assistant
6. Get RAG context
7. Call Gemini
8. Process response
9. Save assistant message
10. Return response
```

### Response Structure
```json
{
  "conversation_id": 1,
  "message": {
    "id": 5,
    "role": "assistant",
    "content": "Response text",
    "created_at": "2026-02-21T10:30:00Z"
  }
}
```

## Error Handling

```
User Request
    ↓
Try:
  ├─ Validate serializer ─→ Invalid? → Return 400
  ├─ Get/create conversation ─→ Fail? → Return 404
  ├─ Initialize assistant ─→ API key? → Return 503
  ├─ Call Gemini API ─→ Fail? → Return 500
  └─ Save responses ─→ Error? → Return 500
Catch:
  ├─ ValueError → 503 (API Key Error)
  ├─ Exception → 500 (Server Error)
  └─ Log error
```

## Security Architecture

```
Authentication
    ↓
┌─ Token-based (DRF TokenAuthentication)
├─ Check Authorization header
├─ Validate token exists
└─ Load user

Authorization
    ↓
┌─ IsAuthenticated permission
├─ Check user is authenticated
└─ Verify user owns data

Data Isolation
    ↓
┌─ Query filters by user
├─ Conversation.user == request.user
├─ VitalSigns.user == request.user
└─ No cross-user data access

Sensitive Data
    ↓
┌─ API key in environment (not in code)
├─ Health data encrypted at rest
├─ HTTPS in production
└─ No sensitive info in logs
```

## Performance Optimization

### Query Optimization
```python
# Use select_related for FK
conversations = AssistantConversation.objects.select_related(
    'user'
).filter(user=user)

# Use only() to limit fields
recent_vitals = VitalSigns.objects.only(
    'timestamp', 'heart_rate', 'body_temperature'
).filter(...)

# Order and limit
latest = Model.objects.order_by('-timestamp')[:10]
```

### Caching Opportunities
```python
# Cache tool definitions
@cache_page(60*60)  # 1 hour
def get_available_tools(request):
    ...

# Cache RAG results (if data doesn't change frequently)
@cache.cached_property
def get_health_context(user):
    ...
```

### Async Considerations
```python
# For long-running tasks:
from celery import shared_task

@shared_task
def generate_health_summary(user_id):
    # Generate summary asynchronously
    # Save as HealthInsight
    pass

# Call from view:
generate_health_summary.delay(user.id)
```

## Extensibility Points

### 1. Add Custom Tools
```python
class MyTool(BaseTool):
    # Implement execute()
```

### 2. Add RAG Data Sources
```python
def get_custom_data(user):
    # Retrieve from any source
    return formatted_data
```

### 3. Add API Endpoints
```python
class MyEndpoint(APIView):
    permission_classes = [IsAuthenticated]
    # Add custom logic
```

### 4. Modify System Prompt
```python
CUSTOM_SYSTEM_PROMPT = """
Your role is...
"""
# Pass to Gemini initialization
```

## Deployment Architecture

```
Production Environment
│
├─ Django App Server
│  ├─ API Endpoints
│  ├─ Database ORM
│  └─ Business Logic
│
├─ PostgreSQL Database
│  ├─ Health Data
│  ├─ Conversations
│  └─ Users
│
├─ Cache Layer (Redis)
│  ├─ Session Storage
│  └─ API Response Cache
│
├─ Async Queue (Celery)
│  └─ Background Tasks
│
└─ External APIs
   └─ Google Gemini API
```

## Monitoring & Logging

```python
import logging
logger = logging.getLogger(__name__)

# Log levels:
logger.debug("Executing tool: calculate_bmi")
logger.info("User created conversation")
logger.warning("API rate limit approaching")
logger.error("Gemini API error: connection timeout")
```

## Version & Compatibility

- **Python**: 3.8+
- **Django**: 3.2+
- **DRF**: 3.12+
- **Gemini API**: 1.5 Pro
- **Database**: SQLite (dev), PostgreSQL (prod)

---

This architecture ensures:
- ✅ Scalability through modular design
- ✅ Security via token authentication and data isolation
- ✅ Extensibility through tool registry
- ✅ Maintainability with clear separation of concerns
- ✅ Performance through optimized queries and caching
