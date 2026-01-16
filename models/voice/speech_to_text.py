"""
음성 인식 (STT) 모델
"""
class SpeechToText:
    def __init__(self):
        print("STT Model initialized")

    def transcribe(self, audio_data: bytes) -> str:
        # Mock transcription
        return "안녕하세요 상담 받고 싶어요"
