"""
상담 에이전트 서비스 (Phase 1)
"""
from typing import Dict, Any
from models.emotion_classifier import EmotionClassifier
from models.response_generator import ResponseGenerator

class CounselorAgent:
    """
    기본 상담 에이전트
    """
    def __init__(self):
        self.emotion_classifier = EmotionClassifier()
        self.response_generator = ResponseGenerator()
        
    async def process_message(self, user_id: str, message: str) -> Dict[str, Any]:
        # 1. 감정 분석
        emotion_result = self.emotion_classifier.predict(message)
        
        # 2. 응답 생성
        response_text = self.response_generator.generate(
            message, 
            emotion_result.emotion
        )
        
        return {
            "user_id": user_id,
            "response": response_text,
            "emotion": {
                "label": emotion_result.emotion,
                "confidence": emotion_result.confidence
            }
        }
