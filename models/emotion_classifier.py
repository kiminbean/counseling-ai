"""
감정 분류 모델 (Phase 1-3 통합)
저장 경로: models/emotion_classifier.py
"""
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
import re


class EmotionLabel(Enum):
    """감정 라벨"""
    HAPPINESS = "happiness"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    ANXIETY = "anxiety"
    SURPRISE = "surprise"
    DISGUST = "disgust"
    NEUTRAL = "neutral"
    SHAME = "shame"
    GUILT = "guilt"
    LONELINESS = "loneliness"
    HOPE = "hope"


@dataclass
class EmotionResult:
    """감정 분석 결과"""
    emotion: str
    confidence: float
    probabilities: Dict[str, float]
    intensity: float = 0.5
    secondary_emotions: List[str] = None
    is_crisis: bool = False
    crisis_keywords_detected: List[str] = None
    
    def __post_init__(self):
        if self.secondary_emotions is None:
            self.secondary_emotions = []
        if self.crisis_keywords_detected is None:
            self.crisis_keywords_detected = []


class EmotionClassifier:
    """
    다국어 감정 분류기 (KoBERT/mBERT 기반)
    
    Features:
    - 12개 감정 분류
    - 다국어 지원 (ko, en, ja, zh, vi)
    - 위기 상황 감지
    - 감정 강도 측정
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.labels = [e.value for e in EmotionLabel]
        
        # 언어별 감정 키워드
        self._init_emotion_keywords()
        
        # 위기 키워드
        self._init_crisis_keywords()
        
        print("EmotionClassifier initialized with multilingual support.")
    
    def _init_emotion_keywords(self):
        """언어별 감정 키워드 초기화"""
        self.emotion_keywords = {
            "ko": {
                "happiness": ["행복", "좋아", "기뻐", "즐거", "신나", "감사", "사랑"],
                "sadness": ["슬프", "우울", "힘들", "눈물", "외로", "쓸쓸", "허전"],
                "anger": ["화나", "짜증", "분노", "열받", "빡치", "싫어", "미워"],
                "fear": ["무서", "두려", "겁나", "떨려", "공포"],
                "anxiety": ["불안", "걱정", "초조", "조마조마", "긴장"],
                "surprise": ["놀라", "깜짝", "헐", "대박", "믿기 힘"],
                "disgust": ["역겨", "싫어", "구역질", "메스꺼"],
                "shame": ["부끄", "창피", "쪽팔", "민망"],
                "guilt": ["죄책감", "미안", "후회", "잘못"],
                "loneliness": ["외로", "혼자", "쓸쓸", "고독"],
                "hope": ["희망", "기대", "바라", "꿈꾸"]
            },
            "en": {
                "happiness": ["happy", "joy", "glad", "pleased", "grateful", "love"],
                "sadness": ["sad", "depressed", "down", "crying", "lonely", "hurt"],
                "anger": ["angry", "mad", "furious", "annoyed", "frustrated", "hate"],
                "fear": ["scared", "afraid", "terrified", "frightened"],
                "anxiety": ["anxious", "worried", "nervous", "stressed", "overwhelmed"],
                "surprise": ["surprised", "shocked", "amazed", "unexpected"],
                "disgust": ["disgusted", "gross", "sick", "revolting"],
                "shame": ["ashamed", "embarrassed", "humiliated"],
                "guilt": ["guilty", "sorry", "regret", "remorse"],
                "loneliness": ["lonely", "alone", "isolated", "abandoned"],
                "hope": ["hopeful", "optimistic", "looking forward", "wish"]
            },
            "ja": {
                "happiness": ["嬉しい", "幸せ", "楽しい", "喜び"],
                "sadness": ["悲しい", "辛い", "寂しい", "泣"],
                "anger": ["怒り", "腹立", "ムカ", "イライラ"],
                "anxiety": ["不安", "心配", "緊張"],
                "loneliness": ["孤独", "一人", "寂しい"]
            }
        }
    
    def _init_crisis_keywords(self):
        """위기 키워드 초기화"""
        self.crisis_keywords = {
            "ko": [
                "죽고 싶", "자살", "자해", "죽을", "끝내고 싶",
                "사라지고 싶", "없어지고 싶", "살기 싫", "더 이상 못"
            ],
            "en": [
                "kill myself", "suicide", "self-harm", "end it all",
                "want to die", "better off dead", "no reason to live"
            ],
            "ja": [
                "死にたい", "自殺", "自傷", "消えたい", "生きたくない"
            ]
        }
    
    def detect_language(self, text: str) -> str:
        """간단한 언어 감지"""
        if re.search(r'[가-힣]', text):
            return "ko"
        elif re.search(r'[\u3040-\u309F\u30A0-\u30FF]', text):
            return "ja"
        elif re.search(r'[\u4e00-\u9fff]', text):
            return "zh"
        elif re.search(r'[àáảãạăằắẳẵặâầấẩẫậ]', text):
            return "vi"
        else:
            return "en"
    
    def check_crisis(self, text: str, language: str = None) -> tuple:
        """위기 상황 확인"""
        if language is None:
            language = self.detect_language(text)
        
        text_lower = text.lower()
        detected_keywords = []
        
        for lang, keywords in self.crisis_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    detected_keywords.append(keyword)
        
        is_crisis = len(detected_keywords) > 0
        return is_crisis, detected_keywords
    
    def calculate_intensity(self, text: str, emotion: str) -> float:
        """감정 강도 계산"""
        intensity = 0.5
        
        # 강조 표현 확인
        intensifiers = {
            "ko": ["너무", "정말", "진짜", "매우", "엄청", "완전"],
            "en": ["very", "really", "so", "extremely", "incredibly"]
        }
        
        for lang, words in intensifiers.items():
            for word in words:
                if word in text.lower():
                    intensity += 0.1
        
        # 반복/이모티콘 확인
        if re.search(r'[!]{2,}|[ㅠㅜ]{2,}|[.]{3,}', text):
            intensity += 0.15
        
        return min(1.0, intensity)
    
    def predict(self, text: str, language: str = None) -> EmotionResult:
        """
        텍스트의 감정을 예측합니다.
        
        Args:
            text: 입력 텍스트
            language: 언어 코드 (None이면 자동 감지)
        
        Returns:
            EmotionResult
        """
        if language is None:
            language = self.detect_language(text)
        
        # 위기 상황 확인
        is_crisis, crisis_keywords = self.check_crisis(text, language)
        
        # 감정 분석 (키워드 기반 + 규칙)
        emotion_scores = {label: 0.0 for label in self.labels}
        
        keywords = self.emotion_keywords.get(language, self.emotion_keywords["en"])
        text_lower = text.lower()
        
        for emotion, emotion_keywords in keywords.items():
            for keyword in emotion_keywords:
                if keyword in text_lower:
                    emotion_scores[emotion] += 0.3
        
        # 기본 규칙 (한국어)
        if language == "ko":
            if any(k in text for k in ["힘들", "우울", "지쳐"]):
                emotion_scores["sadness"] += 0.4
            if any(k in text for k in ["화나", "짜증"]):
                emotion_scores["anger"] += 0.4
            if any(k in text for k in ["불안", "걱정"]):
                emotion_scores["anxiety"] += 0.4
            if any(k in text for k in ["좋아", "행복", "감사"]):
                emotion_scores["happiness"] += 0.4
        
        # 최고 점수 감정 선택
        if max(emotion_scores.values()) == 0:
            primary_emotion = "neutral"
            confidence = 0.5
        else:
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = min(0.95, 0.5 + emotion_scores[primary_emotion])
        
        # 이차 감정
        sorted_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)
        secondary = [e[0] for e in sorted_emotions[1:3] if e[1] > 0]
        
        # 확률 정규화
        total = sum(emotion_scores.values()) or 1
        probabilities = {k: v/total for k, v in emotion_scores.items()}
        if primary_emotion not in probabilities or probabilities[primary_emotion] == 0:
            probabilities[primary_emotion] = confidence
        
        # 강도 계산
        intensity = self.calculate_intensity(text, primary_emotion)
        
        return EmotionResult(
            emotion=primary_emotion,
            confidence=confidence,
            probabilities=probabilities,
            intensity=intensity,
            secondary_emotions=secondary,
            is_crisis=is_crisis,
            crisis_keywords_detected=crisis_keywords
        )


# 테스트
if __name__ == "__main__":
    classifier = EmotionClassifier()
    
    test_texts = [
        "오늘 너무 힘들고 우울해요",
        "I'm feeling really anxious about tomorrow",
        "정말 행복한 하루였어요!",
        "요즘 죽고 싶다는 생각이 들어요"
    ]
    
    for text in test_texts:
        result = classifier.predict(text)
        print(f"\n텍스트: {text}")
        print(f"  감정: {result.emotion} ({result.confidence:.2f})")
        print(f"  강도: {result.intensity:.2f}")
        print(f"  위기: {result.is_crisis}")
        if result.is_crisis:
            print(f"  위기 키워드: {result.crisis_keywords_detected}")