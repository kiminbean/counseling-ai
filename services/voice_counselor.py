"""
음성 상담 서비스
"""
from services.counselor_agent import CounselorAgent
from models.voice.speech_to_text import SpeechToText
from models.voice.text_to_speech import TextToSpeech

class VoiceCounselor(CounselorAgent):
    def __init__(self):
        super().__init__()
        self.stt = SpeechToText()
        self.tts = TextToSpeech()

    async def process_audio(self, audio_data: bytes):
        text = self.stt.transcribe(audio_data)
        response = await self.process_message("user_voice", text)
        audio_response = self.tts.synthesize(response["response"])
        return audio_response
