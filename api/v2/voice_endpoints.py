"""
Voice API Endpoints
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v2", tags=["Voice API"])

@router.post("/voice/chat")
async def voice_chat():
    return {"message": "Voice chat endpoint"}
