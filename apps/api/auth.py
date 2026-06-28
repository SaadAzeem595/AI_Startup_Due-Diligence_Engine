import time
import jwt
import aiohttp
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from apps.api.config import settings

security = HTTPBearer(auto_error=False)

# In-memory cache for Clerk JWKS keys to avoid requesting Clerk on every request
_jwks_cache = None
_jwks_last_fetched = 0
JWKS_CACHE_TTL = 3600  # 1 hour

async def get_clerk_jwks():
    """Fetches and caches Clerk's JSON Web Key Set (JWKS)."""
    global _jwks_cache, _jwks_last_fetched
    current_time = time.time()
    
    if _jwks_cache and (current_time - _jwks_last_fetched < JWKS_CACHE_TTL):
        return _jwks_cache
        
    # Clerk JWKS endpoint
    jwks_url = "https://api.clerk.com/v1/jwks"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(jwks_url, timeout=5) as response:
                if response.status == 200:
                    _jwks_cache = await response.json()
                    _jwks_last_fetched = current_time
                    return _jwks_cache
    except Exception as e:
        print(f"Failed to fetch Clerk JWKS: {e}")
        
    return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    FastAPI dependency to get the authenticated Clerk user ID.
    If Clerk keys are not set, it operates in Mock Mode and returns 'mock_user_123'.
    """
    # If no Clerk key is configured, or we are in mock mode, return a fallback user ID
    if settings.MOCK_MODE or not settings.CLERK_SECRET_KEY:
        return "mock_user_123"
        
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
        )
        
    token = credentials.credentials
    
    try:
        # 1. Unverified decode to get the 'kid' (Key ID) header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token headers (missing kid)",
            )
            
        # 2. Get the JWKS and find the matching key
        jwks = await get_clerk_jwks()
        if not jwks:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable",
            )
            
        public_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
                
        if not public_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Signing key not found",
            )
            
        # 3. Verify the token signature and claims
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        # 'sub' contains the Clerk user ID (e.g. user_2P...)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Subject claim missing from token",
            )
            
        return user_id
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )
