"""
Gemini AI Client for Healthcare Assistant.

Integrates Google's Gemini API with RAG and tool support for healthcare professional responses.
"""

from __future__ import annotations

import json
import logging
from typing import List, Dict, Any, Optional, TYPE_CHECKING
from .tools import ToolRegistry, BaseTool, ToolParameter
from .rag import HealthDataRAG
from .built_in_tools import register_built_in_tools

if TYPE_CHECKING:
    from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


class GeminiHealthAssistant:
    """
    Healthcare AI Assistant powered by Google Gemini.
    
    Features:
    - RAG-based health context retrieval
    - Custom tooling support
    - Conversation management
    - Healthcare professional responses
    
    Usage:
        assistant = GeminiHealthAssistant(api_key="your-api-key")
        response = assistant.chat(user, "How should I improve my sleep?")
    """

    HEALTHCARE_SYSTEM_PROMPT = """You are an expert healthcare professional and wellness coach with years of experience 
in preventive medicine and personalized health guidance. Your role is to:

1. Analyze user's health data and provide evidence-based recommendations
2. Identify patterns and trends in their health metrics
3. Offer actionable, personalized health insights
4. Educate users about health and wellness concepts
5. Provide compassionate and supportive guidance
6. Suggest when professional medical consultation is needed
7. Consider the user's complete health picture when answering questions

Important Guidelines:
- Always be empathetic and supportive
- Base recommendations on the user's actual health data when available
- Distinguish between general wellness advice and medical concerns
- Recommend consulting healthcare professionals for serious concerns
- Ask clarifying questions if needed to provide better guidance
- Consider contraindications and individual health conditions
- Provide specific, actionable recommendations when possible

When analyzing health data:
- Look for patterns and trends
- Compare values to normal ranges
- Consider the context of the user's activities and lifestyle
- Identify potential areas for improvement
- Celebrate positive health habits"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini Healthcare Assistant.
        
        Args:
            api_key: Google Gemini API key. If not provided, will attempt to use
                    GEMINI_API_KEY environment variable
        """
        import os
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not provided and not found in environment variables")
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel('gemini-1.5-pro')
        except ImportError:
            raise ImportError("google-generativeai package not installed. Install with: pip install google-generativeai")
        
        # Initialize tool registry with built-in tools
        self.tool_registry = ToolRegistry()
        register_built_in_tools(self.tool_registry)
        
        # Conversation history for context
        self.conversation_history: List[Dict[str, str]] = []

    def register_custom_tool(self, tool: BaseTool) -> None:
        """
        Register a custom tool for use by the assistant.
        
        Args:
            tool: Tool instance inheriting from BaseTool
            
        Example:
            class HeartRateZonesTool(BaseTool):
                name = "calculate_heart_rate_zones"
                description = "Calculate heart rate training zones"
                parameters = [
                    ToolParameter("max_heart_rate", "integer", "Maximum heart rate", required=True)
                ]
                
                def execute(self, max_heart_rate: int) -> str:
                    # Implementation
                    return "Zones calculated..."
            
            assistant.register_custom_tool(HeartRateZonesTool())
        """
        self.tool_registry.register(tool)

    def register_custom_tool_func(self, name: str, description: str, 
                                   parameters: List[ToolParameter], 
                                   func: callable) -> BaseTool:
        """
        Register a custom tool from a function.
        
        Args:
            name: Tool name
            description: Tool description
            parameters: List of ToolParameter objects
            func: Callable function that executes the tool
            
        Returns:
            BaseTool: The registered tool instance
            
        Example:
            def calculate_bmi(weight: float, height: float) -> str:
                bmi = weight / (height ** 2)
                return f"BMI: {bmi:.1f}"
            
            assistant.register_custom_tool_func(
                name="calculate_bmi",
                description="Calculate Body Mass Index",
                parameters=[
                    ToolParameter("weight", "number", "Weight in kg"),
                    ToolParameter("height", "number", "Height in cm")
                ],
                func=calculate_bmi
            )
        """
        class FunctionTool(BaseTool):
            pass
        
        FunctionTool.name = name
        FunctionTool.description = description
        FunctionTool.parameters = parameters
        FunctionTool.execute = lambda self, **kwargs: func(**kwargs)
        
        return self.register_custom_tool(FunctionTool())

    def _get_tools_for_api(self) -> List[Dict[str, Any]]:
        """Get tool definitions in Gemini API format."""
        return [{
            "type": "function",
            "function": tool_def
        } for tool_def in self.tool_registry.get_tool_definitions()]

    def _process_tool_call(self, tool_name: str, tool_input: Dict[str, Any]) -> str:
        """
        Process a tool call from the model.
        
        Args:
            tool_name: Name of the tool to execute
            tool_input: Tool parameters
            
        Returns:
            str: Tool execution result
        """
        try:
            result = self.tool_registry.execute(tool_name, **tool_input)
            return result
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return f"Error executing tool: {str(e)}"

    def chat(self, user: User, query: str, use_rag: bool = True) -> str:
        """
        Chat with the healthcare AI assistant.
        
        Args:
            user: User instance
            query: User's question or message
            use_rag: Whether to include RAG context (default: True)
            
        Returns:
            str: Assistant's response
        """
        # Get health context if RAG enabled
        health_context = ""
        if use_rag:
            health_context = HealthDataRAG.get_context_for_query(user, query)
            health_context = f"\n\nUser's Health Context:\n{health_context}"
        
        # Build the message with context
        full_message = f"{query}{health_context}"
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": query
        })
        
        try:
            # Prepare messages for API
            messages = [
                {"role": "user", "content": self.HEALTHCARE_SYSTEM_PROMPT}
            ]
            
            # Add conversation history
            for msg in self.conversation_history[:-1]:  # Exclude the current message
                messages.append(msg)
            
            # Add current message with context
            messages.append({
                "role": "user",
                "content": full_message
            })
            
            # Get response from Gemini
            response = self.client.generate_content(
                messages,
                tools=self._get_tools_for_api() if self.tool_registry.get_all_tools() else None,
                tool_config={"function_calling_config": "AUTO"} if self.tool_registry.get_all_tools() else None
            )
            
            # Process response
            assistant_message = ""
            
            if response.parts:
                for part in response.parts:
                    if hasattr(part, 'text'):
                        assistant_message += part.text
                    elif hasattr(part, 'function_call'):
                        # Handle function call
                        func_call = part.function_call
                        tool_result = self._process_tool_call(
                            func_call.name,
                            dict(func_call.args)
                        )
                        assistant_message += f"\n[Tool: {func_call.name}]\n{tool_result}\n"
            
            # Add to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            return assistant_message
            
        except Exception as e:
            logger.error(f"Error during chat: {e}")
            raise

    def clear_history(self) -> None:
        """Clear conversation history."""
        self.conversation_history = []

    def get_health_summary(self, user: User) -> str:
        """
        Get comprehensive health summary for a user.
        
        Args:
            user: User instance
            
        Returns:
            str: Comprehensive health summary from AI
        """
        summary_query = "Based on my health data, please provide a comprehensive health summary highlighting key metrics, areas of strength, and areas for improvement."
        return self.chat(user, summary_query, use_rag=True)

    def get_wellness_recommendations(self, user: User) -> str:
        """
        Get personalized wellness recommendations.
        
        Args:
            user: User instance
            
        Returns:
            str: Personalized wellness recommendations
        """
        recommendation_query = "Based on my health data and current lifestyle, what are your top 5 wellness recommendations I should prioritize?"
        return self.chat(user, recommendation_query, use_rag=True)

    def list_available_tools(self) -> Dict[str, str]:
        """
        Get list of available tools and their descriptions.
        
        Returns:
            Dict[str, str]: Mapping of tool names to descriptions
        """
        return self.tool_registry.list_tools()
