import logging
from .rag import get_health_context
from .tools import send_health_alert

logger = logging.getLogger(__name__)

class SimpleHealthAssistant:
    def __init__(self):
        self.api_key = "AIzaSyB869i9kx1ndeQGuMaXndLMKPo9DievwFs"
        
        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            self.model = 'gemini-2.5-flash'
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            raise
    
    def chat(self, user, message, use_context=True):
        """Chat with optional health context"""
        try:
            # Build prompt
            prompt = """You are a helpful health assistant. 
You can send health alerts using: send_health_alert(recipient_email, user_name, concern)
Only suggest this for genuine health concerns."""
            
            if use_context:
                context = get_health_context(user)
                prompt += f"\n\nUser health data:\n{context}"
            
            prompt += f"\n\nUser: {message}\nAssistant:"
            
            # Get response
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            
            return response.text if response.text else "Sorry, I couldn't process that."
            
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return "Sorry, I'm having trouble responding right now."
    
    def get_summary(self, user):
        """Get health summary"""
        prompt = "Provide a brief health summary (3-4 sentences) based on the user's data."
        return self.chat(user, prompt, use_context=True)
    
    def send_alert(self, email, user_name, concern):
        """Send health alert"""
        return send_health_alert(email, user_name, concern)