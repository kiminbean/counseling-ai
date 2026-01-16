"""
B2B Endpoints
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v2/b2b", tags=["B2B API"])

@router.get("/clients")
async def get_clients():
    return []
