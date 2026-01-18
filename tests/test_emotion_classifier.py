"""
감정 분류기 테스트
파일명: tests/test_emotion_classifier.py

테스트 원칙:
- 부정적 표현 → 부정적 감정 (sadness, anger, fear, anxiety)
- 긍정적 표현 → 긍정적 감정 (happiness, hope)
- 위기 표현 → is_crisis=True
"""
import pytest
from models.emotion_classifier import EmotionClassifier, EmotionResult


class TestEmotionClassifier:
    """감정 분류기 테스트 스위트"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """테스트 전 분류기 초기화"""
        self.classifier = EmotionClassifier()

    # =========================================================================
    # 부정적 표현 → 부정적 감정 테스트 (핵심)
    # =========================================================================

    @pytest.mark.parametrize("text,expected_emotions", [
        # 신체적 고통/통증
        ("머리가 아파요", ["sadness", "anxiety"]),
        ("몸이 너무 아프다", ["sadness"]),
        ("배가 아파서 힘들어요", ["sadness"]),

        # 정서적 고통
        ("너무 힘들어요", ["sadness"]),
        ("우울해요", ["sadness"]),
        ("슬퍼요", ["sadness"]),
        ("외로워요", ["sadness", "loneliness"]),

        # 분노
        ("정말 화가 나요", ["anger"]),
        ("짜증나", ["anger"]),
        ("너무 열받아", ["anger"]),

        # 불안/걱정
        ("불안해요", ["anxiety"]),
        ("걱정돼요", ["anxiety"]),
        ("초조해요", ["anxiety"]),

        # 두려움 (fear와 anxiety는 유사하므로 둘 다 허용)
        ("무서워요", ["fear", "anxiety"]),
        ("두려워요", ["fear", "anxiety"]),
    ])
    def test_negative_expressions_return_negative_emotions(self, text, expected_emotions):
        """부정적 표현은 반드시 부정적 감정으로 분류되어야 함"""
        result = self.classifier.predict(text, language="ko")

        assert result.emotion in expected_emotions, \
            f"'{text}' should be {expected_emotions}, but got '{result.emotion}'"

        # happiness로 분류되면 절대 안됨
        assert result.emotion != "happiness", \
            f"'{text}' should NEVER be classified as 'happiness', but got '{result.emotion}'"

    # =========================================================================
    # 긍정적 표현 → 긍정적 감정 테스트
    # =========================================================================

    @pytest.mark.parametrize("text,expected_emotions", [
        ("정말 행복해요", ["happiness"]),
        ("너무 좋아요", ["happiness"]),
        ("기뻐요", ["happiness"]),
        ("감사해요", ["happiness"]),
        ("신나요", ["happiness"]),
        ("희망이 생겨요", ["hope", "happiness"]),
    ])
    def test_positive_expressions_return_positive_emotions(self, text, expected_emotions):
        """긍정적 표현은 긍정적 감정으로 분류되어야 함"""
        result = self.classifier.predict(text, language="ko")

        assert result.emotion in expected_emotions, \
            f"'{text}' should be {expected_emotions}, but got '{result.emotion}'"

    # =========================================================================
    # 위기 감지 테스트
    # =========================================================================

    @pytest.mark.parametrize("text", [
        "죽고 싶어요",
        "자살하고 싶어",
        "더 이상 살고 싶지 않아",
        "모든 걸 끝내고 싶어",
    ])
    def test_crisis_detection(self, text):
        """위기 표현은 is_crisis=True로 감지되어야 함"""
        result = self.classifier.predict(text, language="ko")

        assert result.is_crisis is True, \
            f"'{text}' should trigger crisis detection"
        assert len(result.crisis_keywords_detected) > 0, \
            f"'{text}' should have detected crisis keywords"

    @pytest.mark.parametrize("text", [
        "오늘 날씨가 좋네요",
        "밥 먹었어요",
        "조금 피곤해요",
    ])
    def test_non_crisis_expressions(self, text):
        """일반 표현은 위기로 감지되지 않아야 함"""
        result = self.classifier.predict(text, language="ko")

        assert result.is_crisis is False, \
            f"'{text}' should NOT trigger crisis detection"

    # =========================================================================
    # KOTE 매핑 검증 테스트
    # =========================================================================

    def test_kote_mapping_completeness(self):
        """KOTE 매핑이 0-43 인덱스를 모두 포함하는지 확인"""
        mapping = EmotionClassifier.KOTE_MAPPING

        for i in range(44):
            assert i in mapping, f"KOTE index {i} is missing from mapping"

    def test_kote_mapping_valid_labels(self):
        """KOTE 매핑의 모든 값이 유효한 앱 라벨인지 확인"""
        mapping = EmotionClassifier.KOTE_MAPPING
        valid_labels = {
            "happiness", "sadness", "anger", "fear", "anxiety",
            "surprise", "disgust", "shame", "guilt", "loneliness",
            "hope", "neutral"
        }

        for idx, label in mapping.items():
            assert label in valid_labels, \
                f"KOTE index {idx} maps to invalid label '{label}'"

    def test_kote_critical_mappings(self):
        """핵심 KOTE 인덱스 매핑이 올바른지 확인"""
        mapping = EmotionClassifier.KOTE_MAPPING

        # 반드시 맞아야 하는 핵심 매핑
        critical_mappings = {
            5: "sadness",    # 슬픔
            6: "anger",      # 화남/분노
            18: "fear",      # 공포/무서움
            24: "neutral",   # 없음
            27: "sadness",   # 힘듦/지침
            40: "happiness", # 행복
            41: "anxiety",   # 불안/걱정
        }

        for idx, expected_label in critical_mappings.items():
            actual_label = mapping.get(idx)
            assert actual_label == expected_label, \
                f"KOTE index {idx} should map to '{expected_label}', but maps to '{actual_label}'"

    # =========================================================================
    # 결과 객체 검증
    # =========================================================================

    def test_result_structure(self):
        """EmotionResult 객체 구조 검증"""
        result = self.classifier.predict("테스트 문장입니다", language="ko")

        assert isinstance(result, EmotionResult)
        assert isinstance(result.emotion, str)
        assert isinstance(result.confidence, float)
        assert 0 <= result.confidence <= 1
        assert isinstance(result.probabilities, dict)
        assert isinstance(result.intensity, float)
        assert isinstance(result.secondary_emotions, list)
        assert isinstance(result.is_crisis, bool)
        assert isinstance(result.crisis_keywords_detected, list)

    def test_language_detection(self):
        """언어 감지 테스트"""
        assert self.classifier.detect_language("안녕하세요") == "ko"
        assert self.classifier.detect_language("Hello") == "en"
        assert self.classifier.detect_language("こんにちは") == "en"  # 일본어는 en으로 fallback


# =========================================================================
# 회귀 테스트: 과거 버그 재발 방지
# =========================================================================

class TestRegressions:
    """과거 발생한 버그의 재발 방지 테스트"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.classifier = EmotionClassifier()

    def test_regression_headache_not_happiness(self):
        """
        회귀 테스트: "머리가 아파요"가 happiness로 분류되는 버그
        - 발생일: 2025-01-18
        - 원인: KOTE_MAPPING에서 index 5(슬픔)가 happiness로 잘못 매핑됨
        """
        result = self.classifier.predict("머리가 아파요", language="ko")

        assert result.emotion != "happiness", \
            "REGRESSION: '머리가 아파요' should not be 'happiness'"
        assert result.emotion in ["sadness", "anxiety", "neutral"], \
            f"'머리가 아파요' should be negative emotion, got '{result.emotion}'"

    def test_regression_pain_expressions(self):
        """
        회귀 테스트: 통증/고통 표현이 긍정으로 분류되는 버그 방지
        """
        pain_expressions = [
            "아파요",
            "너무 아프다",
            "고통스러워요",
            "괴로워요",
        ]

        for text in pain_expressions:
            result = self.classifier.predict(text, language="ko")
            assert result.emotion != "happiness", \
                f"REGRESSION: '{text}' should not be 'happiness'"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
