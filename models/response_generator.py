"""
응답 생성 모델 (Phase 1)
"""
from typing import Dict, Any

class ResponseGenerator:
    """
    상담 응답 생성기 (KoGPT2 기반 Mock)
    """
    def __init__(self, config: Dict = None):
        self.config = config or {}
        print("ResponseGenerator initialized.")

    def generate(self, user_text: str, emotion: str, context: Dict[str, Any] = None) -> str:
        """
        사용자 입력과 감정에 따른 공감적 응답 생성
        """
        # Mock responses based on emotion
        responses = {
            "sadness": "많이 힘드셨겠어요. 제가 이야기를 들어드릴게요.",
            "anger": "그런 일이 있으셨군요. 화가 나시는 게 당연해요.",
            "happiness": "정말 다행이에요! 저도 기분이 좋네요.",
            "anxiety": "마음이 불안하시군요. 심호흡을 한번 해볼까요?",
            "neutral": "네, 그렇군요. 더 자세히 말씀해 주시겠어요?"
        }
        
        return responses.get(emotion, "네, 말씀해 주세요.")
