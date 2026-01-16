import sys
import unittest
from unittest.mock import MagicMock

# 1. Mocking Heavy Libraries
# 시스템에 설치되지 않은 무거운 라이브러리들을 Mock 객체로 대체하여
# 오직 '코드 로직'과 '임포트 경로'만 검증합니다.
class MockModule(MagicMock):
    @classmethod
    def __getattr__(cls, name):
        return MagicMock()

MOCK_MODULES = [
    "tensorflow", "tensorflow.keras", "tensorflow.keras.layers", "tensorflow.keras.models",
    "torch", "transformers", "numpy", "scikit-learn", "scipy", "pandas",
    "fastapi", "fastapi.security", "pydantic", "uvicorn", "dotenv",
    "google.cloud", "cv2", "librosa", "konlpy", "konlpy.tag", "langdetect"
]

sys.modules.update((mod_name, MockModule()) for mod_name in MOCK_MODULES)

# 2. Add Project Root to Path
import os
sys.path.append(os.getcwd())

# 3. Test Loader
class TestSystemArchitecture(unittest.TestCase):
    def test_import_phase1_models(self):
        """Phase 1 모델 임포트 테스트"""
        try:
            from models.emotion_classifier import EmotionClassifier
            from models.response_generator import ResponseGenerator
            print("✅ Phase 1 Models Imported")
        except ImportError as e:
            self.fail(f"Phase 1 Import Failed: {e}")

    def test_import_phase2_models(self):
        """Phase 2 모델 임포트 테스트"""
        try:
            from models.voice.speech_to_text import SpeechToText
            from models.multimodal.multimodal_fusion import MultimodalFusion
            print("✅ Phase 2 Models Imported")
        except ImportError as e:
            self.fail(f"Phase 2 Import Failed: {e}")

    def test_import_phase3_models(self):
        """Phase 3 모델 임포트 테스트 (TensorFlow 의존성 Mocking 확인)"""
        try:
            from models.multilingual.language_detector import MultilingualLanguageDetector
            from models.supervisor.ai_supervisor import AISupervisor
            from models.personalization.adaptive_therapy import AdaptiveTherapyEngine
            print("✅ Phase 3 Models Imported")
        except ImportError as e:
            self.fail(f"Phase 3 Import Failed: {e}")

    def test_api_entry_point(self):
        """메인 API 엔트리포인트 로드 테스트"""
        try:
            from api.main import app
            print("✅ API Main Entry Point Loaded")
        except ImportError as e:
            self.fail(f"API Main Import Failed: {e}")

if __name__ == "__main__":
    unittest.main()
