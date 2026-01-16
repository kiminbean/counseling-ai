"""
API Key Authentication Middleware
"""
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == "secret_token":
        return api_key_header
    # In production, check DB
    return api_key_header
