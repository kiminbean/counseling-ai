"""
감정 분류 모델 (Phase 1-3 통합 + 학습 모델 연동)
저장 경로: models/emotion_classifier.py
"""
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
import re
import os
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class EmotionLabel(Enum):
    """감정 라벨 (앱 내부용 12개)"""
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
    학습된 모델이 있으면 로드하고, 없으면 규칙 기반으로 동작합니다.
    """
    
    # KOTE 44개 라벨 -> 앱 내부 12개 라벨 매핑
    # 참조: data/README.md의 KOTE 라벨 정의
    # ['불평/불만', '환영/호의', '감동/감탄', '지긋지긋', '고마움', '슬픔', '화남/분노', '존경',
    #  '기대감', '우쭐댐/무시함', '안타까움/실망', '비장함', '의심/불신', '뿌듯함', '편안/쾌적',
    #  '신기함/관심', '아껴주는', '부끄러움', '공포/무서움', '절망', '한심함', '역겨움/징그러움',
    #  '짜증', '어이없음', '없음', '패배/자기혐오', '귀찮음', '힘듦/지침', '즐거움/신남', '깨달음',
    #  '죄책감', '증오/혐오', '흐뭇함(귀여움/예쁨)', '당황/난처', '경악', '부담/안_내킴', '서러움',
    #  '재미없음', '불쌍함/연민', '놀람', '행복', '불안/걱정', '기쁨', '안심/신뢰']
    KOTE_MAPPING = {
        0: "anger",       # 불평/불만
        1: "happiness",   # 환영/호의
        2: "happiness",   # 감동/감탄
        3: "disgust",     # 지긋지긋
        4: "happiness",   # 고마움
        5: "sadness",     # 슬픔 ★
        6: "anger",       # 화남/분노 ★
        7: "hope",        # 존경
        8: "hope",        # 기대감
        9: "anger",       # 우쭐댐/무시함
        10: "sadness",    # 안타까움/실망
        11: "hope",       # 비장함
        12: "anxiety",    # 의심/불신
        13: "happiness",  # 뿌듯함
        14: "happiness",  # 편안/쾌적
        15: "surprise",   # 신기함/관심
        16: "happiness",  # 아껴주는
        17: "shame",      # 부끄러움
        18: "fear",       # 공포/무서움
        19: "sadness",    # 절망
        20: "disgust",    # 한심함
        21: "disgust",    # 역겨움/징그러움
        22: "anger",      # 짜증
        23: "anger",      # 어이없음
        24: "neutral",    # 없음
        25: "sadness",    # 패배/자기혐오
        26: "anger",      # 귀찮음
        27: "sadness",    # 힘듦/지침 ★
        28: "happiness",  # 즐거움/신남
        29: "neutral",    # 깨달음
        30: "guilt",      # 죄책감
        31: "anger",      # 증오/혐오
        32: "happiness",  # 흐뭇함(귀여움/예쁨)
        33: "anxiety",    # 당황/난처
        34: "fear",       # 경악
        35: "anxiety",    # 부담/안_내킴
        36: "sadness",    # 서러움
        37: "sadness",    # 재미없음
        38: "sadness",    # 불쌍함/연민
        39: "surprise",   # 놀람
        40: "happiness",  # 행복 ★
        41: "anxiety",    # 불안/걱정
        42: "happiness",  # 기쁨
        43: "happiness",  # 안심/신뢰
    }

    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.labels = [e.value for e in EmotionLabel]
        
        # 언어별 감정 키워드
        self._init_emotion_keywords()
        # 위기 키워드
        self._init_crisis_keywords()
        
        # 학습된 모델 로드 시도
        self.model_path = "./models/weights/kote_emotion_model"
        self.model = None
        self.tokenizer = None
        self.device = "cpu"
        
        if os.path.exists(self.model_path):
            try:
                print(f"Loading trained model from {self.model_path}...")
                self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
                # Load Tokenizer & Model
                self.tokenizer = AutoTokenizer.from_pretrained("klue/bert-base")
                self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
                self.model.to(self.device)
                self.model.eval()
                print(f"✅ Model loaded successfully on {self.device}")
            except Exception as e:
                print(f"⚠️ Failed to load model: {e}")
                self.model = None
        else:
            print("⚠️ No trained model found. Using rule-based fallback.")

    def _init_emotion_keywords(self):
        """언어별 감정 키워드 초기화 (Fallback용)"""
        self.emotion_keywords = {
            "ko": {
                "happiness": ["행복", "좋아", "기뻐", "즐거", "신나", "감사", "사랑"],
                "sadness": ["슬프", "우울", "힘들", "눈물", "외로", "쓸쓸", "허전", "아프", "아파", "고통", "괴로"],
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
            "en": {"happiness": ["happy"], "sadness": ["sad"]} # Simplified for brevity
        }
    
    def _init_crisis_keywords(self):
        """위기 키워드 초기화"""
        self.crisis_keywords = {
            "ko": ["죽고 싶", "자살", "자해", "죽을", "끝내고 싶", "살고 싶지 않", "죽어버리", "목숨"],
            "en": ["kill myself", "suicide", "self-harm", "end my life", "don't want to live"]
        }
    
    def detect_language(self, text: str) -> str:
        if re.search(r'[가-힣]', text): return "ko"
        return "en"
    
    def check_crisis(self, text: str, language: str = None) -> tuple:
        if language is None: language = self.detect_language(text)
        text_lower = text.lower()
        detected_keywords = []
        for lang, keywords in self.crisis_keywords.items():
            for keyword in keywords:
                if keyword in text_lower: detected_keywords.append(keyword)
        return len(detected_keywords) > 0, detected_keywords
    
    def calculate_intensity(self, text: str, emotion: str) -> float:
        intensity = 0.5
        if re.search(r'[!]{2,}|[ㅠㅜ]{2,}|[.]{3,}', text): intensity += 0.15
        return min(1.0, intensity)
    
    def predict(self, text: str, language: str = None) -> EmotionResult:
        """감정 예측 (모델 우선, 실패 시 규칙 기반)"""
        if language is None:
            language = self.detect_language(text)
            
        is_crisis, crisis_keywords = self.check_crisis(text, language)
        
        # 1. 모델 기반 예측
        if self.model and self.tokenizer and language == "ko":
            try:
                inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=128, padding=True)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    logits = outputs.logits
                    probs = torch.sigmoid(logits).cpu().numpy()[0] # Multi-label probabilities
                
                # Top prediction
                top_idx = np.argmax(probs)
                confidence = float(probs[top_idx])
                
                # Map KOTE index (0-42) to App label (string)
                # KOTE_MAPPING을 통해 43개 라벨을 12개로 축소
                predicted_emotion = self.KOTE_MAPPING.get(top_idx, "neutral")
                
                # Secondary emotions
                top_3_indices = probs.argsort()[-3:][::-1]
                secondary = [self.KOTE_MAPPING.get(idx, "neutral") for idx in top_3_indices[1:] if probs[idx] > 0.3]
                secondary = list(set(secondary)) # 중복 제거
                
                # Create simplified probability dict
                probabilities = {self.KOTE_MAPPING.get(i, "neutral"): float(p) for i, p in enumerate(probs)}
                
                # 키워드 기반 검증: 모델 예측이 키워드와 충돌하면 보정
                keywords = self.emotion_keywords.get(language, self.emotion_keywords.get("ko", {}))
                keyword_emotion = None
                for emotion, kws in keywords.items():
                    for kw in kws:
                        if kw in text:
                            keyword_emotion = emotion
                            break
                    if keyword_emotion:
                        break

                # 모델이 happiness인데 부정적 키워드가 있으면 보정
                if predicted_emotion == "happiness" and keyword_emotion in ["sadness", "anger", "fear", "anxiety"]:
                    predicted_emotion = keyword_emotion
                    confidence = max(0.6, confidence * 0.8)

                return EmotionResult(
                    emotion=predicted_emotion,
                    confidence=confidence,
                    probabilities=probabilities,
                    intensity=self.calculate_intensity(text, predicted_emotion),
                    secondary_emotions=secondary,
                    is_crisis=is_crisis,
                    crisis_keywords_detected=crisis_keywords
                )

            except Exception as e:
                print(f"Model prediction failed: {e}. Falling back to rules.")

        # 2. 규칙 기반 예측 (Fallback)
        # (기존 로직 유지)
        emotion_scores = {label: 0.0 for label in self.labels}
        keywords = self.emotion_keywords.get(language, self.emotion_keywords.get("ko", {}))
        
        for emotion, kws in keywords.items():
            for kw in kws:
                if kw in text: emotion_scores[emotion] += 0.3
        
        if max(emotion_scores.values()) == 0:
            primary = "neutral"
            conf = 0.5
        else:
            primary = max(emotion_scores, key=emotion_scores.get)
            conf = min(0.95, 0.5 + emotion_scores[primary])
            
        return EmotionResult(
            emotion=primary,
            confidence=conf,
            probabilities={k: v/sum(emotion_scores.values()) if sum(emotion_scores.values()) else 0 for k,v in emotion_scores.items()},
            intensity=self.calculate_intensity(text, primary),
            secondary_emotions=[],
            is_crisis=is_crisis,
            crisis_keywords_detected=crisis_keywords
        )