"""
Gemini AI Client for Healthcare Assistant.

Integrates Google's Gemini API with RAG and tool support for healthcare professional responses.
"""

from __future__ import annotations

import json
import os
import logging
from typing import List, Dict, Any, Optional, TYPE_CHECKING
from .tools import send_emergency_email, generate_health_records
from .rag import HealthDataRAG
from dotenv import load_dotenv

load_dotenv()


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
        self.api_key = os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not provided and not found in environment variables")
        
        try:
            from google import genai
            
            # Initialize client with API key for Gemini 2.5
            self.client = genai.Client(api_key=self.api_key)
            self.model = 'gemini-2.5-pro'
            
        except ImportError:
            raise ImportError("google-genai package not installed. Install with: pip install google-genai")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            raise
        
        # Conversation history for context
        self.conversation_history: List[Dict[str, str]] = []

    def send_emergency_alert(self, recipient_email: str, user_name: str, health_concern: str) -> str:
        """
        Send an emergency health alert email.
        
        Args:
            recipient_email: Email address to send alert to
            user_name: Name of the user
            health_concern: Description of the health concern
            
        Returns:
            str: Status message
        """
        return send_emergency_email(recipient_email, user_name, health_concern)

    def generate_records(self, user_id: int) -> str:
        """
        Generate comprehensive health records for a user.
        
        Args:
            user_id: Django user ID
            
        Returns:
            str: Formatted health records
        """
        return generate_health_records(user_id)

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
            # Prepare messages for Gemini 2.5 API
            messages = []
            
            # Add system instruction as first message if starting new conversation
            if len(self.conversation_history) == 1:
                messages.append({
                    "role": "user",
                    "parts": [self.HEALTHCARE_SYSTEM_PROMPT]
                })
                messages.append({
                    "role": "model",
                    "parts": ["I understand. I'll act as an expert healthcare professional and provide evidence-based guidance based on your health data."]
                })
            
            # Add conversation history
            for msg in self.conversation_history:
                # Convert role: "assistant" -> "model" for google-genai
                role = "user" if msg["role"] == "user" else "model"
                messages.append({
                    "role": role,
                    "parts": [msg["content"]]
                })
            
            # Update the last user message to include context
            if messages and messages[-1]["role"] == "user":
                messages[-1]["parts"] = [full_message]
            
            # Generate response using Gemini 2.5 API
            response = self.client.models.generate_content(
                model=self.model,
                contents=messages,
            )
            
            # Process response
            assistant_message = ""
            
            if response.content and response.content.parts:
                for part in response.content.parts:
                    if hasattr(part, 'text') and part.text:
                        assistant_message += part.text
            
            # Add to conversation history
            self.conversation_history.append({
                "role": "model",
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
