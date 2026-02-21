"""
Tool Registry and Base Tool Classes for Healthcare Assistant.

Allows easy registration and management of custom tools for the AI assistant.
"""

from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, asdict


@dataclass
class ToolParameter:
    """Represents a parameter for a tool function."""
    name: str
    type: str
    description: str
    required: bool = True
    enum: Optional[List[str]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        data = asdict(self)
        if self.enum is None:
            del data['enum']
        return data


class BaseTool(ABC):
    """
    Base class for all healthcare assistant tools.
    
    Inherit from this class to create custom tools that can be used by the AI assistant.
    """
    
    name: str
    description: str
    parameters: List[ToolParameter] = []

    @abstractmethod
    def execute(self, **kwargs) -> str:
        """
        Execute the tool with given parameters.
        
        Args:
            **kwargs: Tool-specific parameters
            
        Returns:
            str: Result of tool execution
        """
        pass

    def to_tool_dict(self) -> Dict[str, Any]:
        """Convert tool to Gemini function schema."""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    param.name: {
                        "type": param.type,
                        "description": param.description,
                        **({"enum": param.enum} if param.enum else {})
                    }
                    for param in self.parameters
                },
                "required": [param.name for param in self.parameters if param.required]
            }
        }


class ToolRegistry:
    """
    Registry for managing healthcare assistant tools.
    
    Usage:
        # Create registry
        registry = ToolRegistry()
        
        # Register a custom tool
        @registry.register_tool
        class MyCustomTool(BaseTool):
            name = "my_custom_tool"
            description = "Description of my tool"
            parameters = [
                ToolParameter("param1", "string", "Description", required=True)
            ]
            
            def execute(self, param1: str) -> str:
                # Implementation
                return "result"
        
        # Or register directly
        registry.register(MyCustomTool())
    """

    def __init__(self):
        """Initialize the tool registry."""
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> BaseTool:
        """
        Register a tool instance.
        
        Args:
            tool: Tool instance to register
            
        Returns:
            BaseTool: The registered tool
            
        Raises:
            ValueError: If tool with same name already exists
        """
        if tool.name in self._tools:
            raise ValueError(f"Tool '{tool.name}' is already registered")
        
        self._tools[tool.name] = tool
        return tool

    def register_tool(self, tool_class: type) -> type:
        """
        Decorator to register a tool class.
        
        Args:
            tool_class: Tool class inheriting from BaseTool
            
        Returns:
            type: The tool class
        """
        instance = tool_class()
        self.register(instance)
        return tool_class

    def unregister(self, tool_name: str) -> None:
        """
        Unregister a tool.
        
        Args:
            tool_name: Name of the tool to unregister
            
        Raises:
            KeyError: If tool not found
        """
        del self._tools[tool_name]

    def get(self, tool_name: str) -> Optional[BaseTool]:
        """
        Get a tool by name.
        
        Args:
            tool_name: Name of the tool
            
        Returns:
            BaseTool or None: The tool if found
        """
        return self._tools.get(tool_name)

    def execute(self, tool_name: str, **kwargs) -> str:
        """
        Execute a tool by name.
        
        Args:
            tool_name: Name of the tool to execute
            **kwargs: Tool parameters
            
        Returns:
            str: Tool execution result
            
        Raises:
            KeyError: If tool not found
        """
        tool = self._tools[tool_name]
        return tool.execute(**kwargs)

    def get_all_tools(self) -> List[BaseTool]:
        """Get all registered tools."""
        return list(self._tools.values())

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Get tool definitions in Gemini function schema format."""
        return [tool.to_tool_dict() for tool in self._tools.values()]

    def list_tools(self) -> Dict[str, str]:
        """Get a mapping of tool names to descriptions."""
        return {name: tool.description for name, tool in self._tools.items()}
