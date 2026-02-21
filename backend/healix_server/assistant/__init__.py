"""
Healthcare AI Assistant with RAG and Gemini integration.

This module provides:
- RAG (Retrieval-Augmented Generation) for health data
- Gemini AI integration as a healthcare professional
- Extensible tool registry for custom functions
- Conversation management and history
"""

from .gemini_client import GeminiHealthAssistant
from .tools import ToolRegistry, BaseTool

__all__ = [
    'GeminiHealthAssistant',
    'ToolRegistry',
    'BaseTool',
]
