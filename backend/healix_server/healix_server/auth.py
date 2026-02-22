"""
Custom authentication backend that supports Bearer token format
"""

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class BearerTokenAuthentication(TokenAuthentication):
    """
    Custom token authentication that accepts both:
    - Bearer {token} (JWT style)
    - Token {token} (DRF default)
    """
    keyword = 'Bearer'
    
    def authenticate(self, request):
        """
        Authenticate the request using Bearer token or fall back to Token.
        """
        # First try Bearer token format
        auth = request.META.get('HTTP_AUTHORIZATION', '').split()
        
        if not auth:
            return None
        
        if len(auth) == 1:
            msg = 'Invalid token header. No credentials provided.'
            raise AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = 'Invalid token header. Token string should not contain spaces.'
            raise AuthenticationFailed(msg)
        
        token = auth[1]
        return self.authenticate_credentials(token)
