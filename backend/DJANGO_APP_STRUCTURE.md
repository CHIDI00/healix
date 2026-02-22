# Healthcare AI Assistant - Django App Structure

## App Structure

```
assistant/
├── __init__.py                 # App initialization with AppConfig
├── apps.py                     # AppConfig class for Django
├── admin.py                    # Django admin interface
├── models.py                   # Database models
├── serializers.py              # DRF serializers
├── views.py                    # API views (10 endpoints)
├── urls.py                     # URL routing
├── tests.py                    # Unit tests
├── gemini_client.py            # Gemini AI integration
├── tools.py                    # Tool registry system
├── rag.py                      # RAG (health data retrieval)
├── built_in_tools.py           # 5 pre-built tools
├── management/
│   └── commands/
│       └── test_assistant.py   # Management command
└── migrations/                 # Database migrations
```

## Installation & Setup

### 1. App Registration ✅
The app is automatically registered in `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'healix_server.assistant',
]
```

### 2. Create Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Run Diagnostic
```bash
python manage.py test_assistant
python manage.py test_assistant --full  # Include API connection test
```

## Django Admin Interface

Access the admin interface at `/admin/` with superuser credentials.

### Models in Admin

**1. Assistant Conversations**
- View all conversations
- Filter by user, date, status
- Search by title
- See message count and preview
- Real-time status badges

**2. Conversation Messages**
- View individual messages
- Filter by role (user/assistant)
- See full message content
- View tools used by AI
- Ordered by creation time

**3. Health Insights**
- View all generated insights
- Filter by type (summary, recommendation, alert, pattern, trend)
- Mark as read/unread (bulk action)
- Show related metrics
- Full content display

**4. Custom Tools**
- View registered custom tools
- Filter by status and category
- See tool parameters schema
- Track creation date and creator

## Models

### AssistantConversation
```python
user              # FK to User
title             # str - Conversation title
is_active         # bool - Active status
created_at        # datetime - Auto-set on creation
updated_at        # datetime - Auto-set on update
```

### ConversationMessage
```python
conversation      # FK to AssistantConversation
role              # str - 'user' or 'assistant'
content           # str - Message text
tools_used        # JSON - List of tool names
created_at        # datetime - Auto-set on creation
```

### HealthInsight
```python
user              # FK to User
insight_type      # str - summary/recommendation/alert/pattern/trend
title             # str - Insight title
content           # str - Detailed content
related_metrics   # JSON - Related health metrics
created_at        # datetime - Auto-set on creation
is_read           # bool - Read status
```

### CustomTool
```python
name              # str - Tool name (unique)
description       # str - Tool description
category          # str - Tool category
parameters        # JSON - Parameter schema
is_active         # bool - Active status
created_at        # datetime - Auto-set on creation
updated_at        # datetime - Auto-set on update
created_by        # FK to User - Tool creator
```

## API Endpoints

### Authentication
All endpoints require token authentication:
```
Authorization: Token <your-token>
```

### Endpoints (8 Major Routes)

```
POST   /api/assistant/chat/
GET    /api/assistant/conversations/
GET    /api/assistant/conversations/{id}/
PUT    /api/assistant/conversations/{id}/
DELETE /api/assistant/conversations/{id}/
POST   /api/assistant/health-summary/
POST   /api/assistant/wellness-recommendations/
GET    /api/assistant/insights/
GET    /api/assistant/tools/
GET    /api/assistant/status/
```

## Management Commands

### test_assistant

Test your Healthcare AI Assistant setup:

```bash
# Basic test
python manage.py test_assistant

# Full test (including API connection)
python manage.py test_assistant --full
```

**Output includes:**
- ✓ Environment variables check
- ✓ Package dependencies check
- ✓ Database models check
- ✓ Tool registry check
- ✓ Built-in tools check
- ✓ Gemini API connection (full mode)

## Unit Tests

Run tests with:
```bash
python manage.py test healix_server.assistant
```

**Test Coverage:**
- Tool Registry tests
- Model creation tests
- Model string representations
- API authentication tests
- Tool parameter tests

## Architecture

### Tool Registry System
```
BaseTool (Abstract)
├── name: str
├── description: str
├── parameters: List[ToolParameter]
└── execute(**kwargs) → str

ToolRegistry
├── register(tool) → BaseTool
├── execute(name, **kwargs) → str
├── get(name) → BaseTool
├── get_all_tools() → List[BaseTool]
├── list_tools() → Dict[str, str]
└── get_tool_definitions() → List[Dict]

Built-in Tools (5)
├── BMICalculatorTool
├── CalorieNeedsCalculatorTool
├── TargetHeartRateZonesTool
├── HydrationCalculatorTool
└── MacroSplitCalculatorTool
```

### RAG System
```
HealthDataRAG
├── get_latest_vitals(user, days) → str
├── get_latest_physical_data(user) → str
├── get_fitness_summary(user, days) → str
├── get_nutrition_summary(user, days) → str
├── get_sleep_summary(user, days) → str
├── get_reproductive_health_data(user, days) → str
├── get_comprehensive_health_context(user) → str
└── get_context_for_query(user, query) → str
```

### Gemini Integration
```
GeminiHealthAssistant
├── __init__(api_key)
├── register_custom_tool(tool)
├── register_custom_tool_func(name, desc, params, func)
├── chat(user, query, use_rag) → str
├── get_health_summary(user) → str
├── get_wellness_recommendations(user) → str
├── list_available_tools() → Dict[str, str]
└── clear_history() → None
```

## Configuration

### Using AppConfig

The `AssistantConfig` class in `apps.py` configures the Django app:

```python
class AssistantConfig(AppConfig):
    default_auto_field = 'django.db.BigAutoField'
    name = 'healix_server.assistant'
    verbose_name = 'Healthcare AI Assistant'
    
    def ready(self):
        # App initialization code
        pass
```

### Settings

Required environment variable:
```bash
GEMINI_API_KEY=your-api-key-here
```

No additional Django settings required - works with default configuration.

## Admin Interface Features

### Conversation Admin
- **Filtering**: Status, date range, user
- **Search**: Title, username, email
- **Display**: Truncated title, message count, status badge
- **Actions**: View conversation details
- **Preview**: Recent messages preview

### Message Admin
- **Filtering**: Role (user/assistant), date, user
- **Search**: Content, conversation title
- **Display**: Conversation, role badge, content preview
- **Read-only**: Creation timestamp
- **Actions**: View full content, tools used

### Insight Admin
- **Filtering**: Type, read status, date, user
- **Search**: Title, content, user
- **Display**: Type badge, read status badge
- **Display**: Related metrics list
- **Bulk Actions**: Mark as read/unread
- **Actions**: View full insight content

### Tool Admin
- **Filtering**: Status, category, date
- **Search**: Tool name, description
- **Display**: Status badge, creation info
- **Display**: Parameter schema in JSON format
- **Read-only**: Timestamps, creator

## Database Migrations

Generate migrations:
```bash
python manage.py makemigrations healix_server.assistant
```

Apply migrations:
```bash
python manage.py migrate healix_server.assistant
```

View migration status:
```bash
python manage.py showmigrations healix_server.assistant
```

## Extending the App

### Add Custom Tool

```python
# In your code or custom module
from healix_server.assistant.tools import BaseTool, ToolParameter
from healix_server.assistant.gemini_client import GeminiHealthAssistant

class MyCustomTool(BaseTool):
    name = "my_tool"
    description = "My custom tool"
    parameters = [
        ToolParameter("param1", "string", "Description")
    ]
    
    def execute(self, param1: str) -> str:
        return f"Result: {param1}"

# Register
assistant = GeminiHealthAssistant()
assistant.register_custom_tool(MyCustomTool())
```

### Add Custom Admin

Extend the admin interface:
```python
# In your app's admin.py
from healix_server.assistant.admin import AssistantConversationAdmin

class CustomConversationAdmin(AssistantConversationAdmin):
    # Customize here
    pass
```

### Add Custom Tests

```python
# In assistant/tests.py
class YourTestCase(TestCase):
    def setUp(self):
        # Setup code
        pass
    
    def test_something(self):
        # Your test
        pass
```

## Performance Optimization

### Query Optimization
```python
# Use select_related for FK
conversations = AssistantConversation.objects.select_related(
    'user'
).filter(user=user)

# Use only() to limit fields
messages = ConversationMessage.objects.only(
    'role', 'content', 'created_at'
)

# Pagination
from django.core.paginator import Paginator
page = Paginator(conversations, 20).get_page(1)
```

### Caching
```python
from django.views.decorators.cache import cache_page

@cache_page(60*60)  # 1 hour
def get_tools(request):
    pass
```

## Security

✅ **Token Authentication** - All endpoints require valid token  
✅ **User Isolation** - Users only access their own data  
✅ **API Key Security** - Stored in environment variables  
✅ **CSRF Protection** - Enabled by default  
✅ **SQL Injection Prevention** - ORM-based queries  

## Troubleshooting

### "No such table" error
```bash
python manage.py migrate
```

### API key not found
```bash
export GEMINI_API_KEY="your-key"
# or in Windows:
set GEMINI_API_KEY=your-key
```

### Import errors
```bash
pip install -r requirements.txt
```

### App not appearing in admin
```bash
# Check INSTALLED_APPS
python manage.py check
```

## Development Workflow

1. **Local Development**
   ```bash
   export GEMINI_API_KEY="test-key"
   python manage.py runserver
   ```

2. **Test Changes**
   ```bash
   python manage.py test healix_server.assistant
   ```

3. **Create Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Admin Testing**
   - Create superuser: `python manage.py createsuperuser`
   - Access: `http://localhost:8000/admin/`

## Production Deployment

Before deploying:

```bash
# Run full diagnostic
python manage.py test_assistant --full

# Run tests
python manage.py test healix_server.assistant

# Check for issues
python manage.py check --deploy

# Collect static files
python manage.py collectstatic --noinput

# Apply migrations
python manage.py migrate
```

## Statistics

- **Models**: 4 database models
- **Endpoints**: 10 API endpoints
- **Built-in Tools**: 5 pre-built calculation tools
- **Admin Pages**: 4 model admin pages
- **Management Commands**: 1 diagnostic command
- **Test Classes**: 6+ test suites

## Version

- **App Version**: 1.0
- **Django**: 3.2+
- **DRF**: 3.12+
- **Python**: 3.8+
- **Release Date**: February 21, 2026

---

## Quick Reference

```bash
# Setup
python manage.py migrate
python manage.py createsuperuser

# Test
python manage.py test healix_server.assistant
python manage.py test_assistant --full

# Run
python manage.py runserver

# Access
http://localhost:8000/admin/
http://localhost:8000/api/assistant/status/
```

This transforms the assistant folder into a fully functional Django app! 🚀
