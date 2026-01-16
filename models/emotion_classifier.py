"""
감정 분류 모델 (Phase 1)
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class EmotionResult:
    emotion: str
    confidence: float
    probabilities: Dict[str, float]

class EmotionClassifier:
    """
    기본 감정 분류기 (KoBERT 기반 Mock)
    """
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.labels = ["happiness", "sadness", "anger", "fear", "anxiety", "neutral"]
        print("EmotionClassifier initialized.")

    def predict(self, text: str) -> EmotionResult:
        """
        텍스트의 감정을 예측합니다.
        (실제 모델 로딩 대신 규칙 기반 Mock핑)
        """
        # Mock logic
        if "힘들" in text or "우울" in text:
            emotion = "sadness"
            conf = 0.85
        elif "화나" in text or "짜증" in text:
            emotion = "anger"
            conf = 0.9
        elif "좋아" in text or "행복" in text:
            emotion = "happiness"
            conf = 0.8
        elif "불안" in text or "걱정" in text:
            emotion = "anxiety"
            conf = 0.75
        else:
            emotion = "neutral"
            conf = 0.5

        probs = {label: (conf if label == emotion else (1-conf)/(len(self.labels)-1)) for label in self.labels}
        
        return EmotionResult(emotion=emotion, confidence=conf, probabilities=probs)
