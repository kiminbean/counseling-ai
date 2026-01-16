"""
멀티모달 융합 로직
"""
from typing import Dict

class MultimodalFusion:
    def fuse(self, text_emotion: str, voice_emotion: str, face_emotion: str) -> Dict[str, float]:
        # Simple voting/averaging logic
        return {"dominant_emotion": text_emotion, "confidence": 0.8}
