"""
다국어 언어 감지 및 문화 컨텍스트 분석 모듈
Phase 3: 국제화 확장
저장 경로: /AI_Drive/counseling_ai/models/multilingual/language_detector.py
"""
import tensorflow as tf
from tensorflow import keras
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import numpy as np
import re
from datetime import datetime

class SupportedLanguage(Enum):
    """지원 언어 목록"""
    KOREAN = "ko"
    ENGLISH = "en"
    JAPANESE = "ja"
    CHINESE_SIMPLIFIED = "zh"
    CHINESE_TRADITIONAL = "zh-TW"
    VIETNAMESE = "vi"

class CommunicationStyle(Enum):
    """문화별 커뮤니케이션 스타일"""
    HIGH_CONTEXT = "high_context" # 한국, 일본
    LOW_CONTEXT = "low_context"   # 영어권
    INDIRECT = "indirect"         # 동아시아
    DIRECT = "direct"             # 서양

@dataclass
class LanguageDetectionResult:
    """언어 감지 결과"""
    primary_language: str
    confidence: float
    secondary_languages: List[Tuple[str, float]]
    script_type: str
    is_mixed: bool
    code_switching_detected: bool
    detected_phrases: Dict[str, List[str]]

@dataclass
class CulturalContext:
    """문화적 컨텍스트 분석 결과"""
    language: str
    communication_style: CommunicationStyle
    formality_level: str # formal, informal, mixed
    emotional_expression_style: str # reserved, expressive
    family_orientation: str # collectivist, individualist
    stigma_sensitivity: float # 0-1
    recommended_approach: str
    cultural_considerations: List[str]
    taboo_topics: List[str]
    preferred_honorifics: Dict[str, str]

class MultilingualLanguageDetector(keras.Model):
    """
    다국어 언어 감지 및 문화 분석 모델
    Features:
    - 6개 언어 지원 (ko, en, ja, zh, zh-TW, vi)
    - 코드 스위칭 감지
    - 문화적 컨텍스트 분석
    - 커뮤니케이션 스타일 파악
    """
    
    def __init__(self, vocab_size: int = 100000, embedding_dim: int = 256, num_languages: int = 6, max_length: int = 512, **kwargs):
        super().__init__(**kwargs)
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.num_languages = num_languages
        self.max_length = max_length
        
        # 언어별 특성 정의
        self.language_features = self._define_language_features()
        
        # 문화별 컨텍스트 정의
        self.cultural_contexts = self._define_cultural_contexts()
        
        # 모델 레이어 구축
        self._build_layers()

    def _define_language_features(self) -> Dict[str, Dict[str, Any]]:
        """언어별 특성 정의"""
        return {
            "ko": {
                "script_patterns": [r'[가-힣]', r'[ㄱ-ㅎㅏ-ㅣ]'],
                "common_particles": ["이", "가", "을", "를", "은", "는", "에", "에서", "로", "으로"],
                "honorific_markers": ["요", "습니다", "세요", "시", "님"],
                "emotion_markers": ["ㅜㅜ", "ㅠㅠ", "ㅎㅎ", "ㄱㄱ", ";;"],
                "sentence_enders": ["다", "요", "까", "네", "군"],
            },
            "en": {
                "script_patterns": [r'[a-zA-Z]'],
                "common_words": ["the", "is", "are", "was", "were", "have", "has", "been"],
                "emotion_markers": ["...", "!", "?!", ":(", ":)"],
                "contractions": ["'m", "'re", "'ve", "'ll", "'d", "n't"],
            },
            "ja": {
                "script_patterns": [r'[ひらがな]', r'[カタカナ]', r'[一-龯]'],
                "hiragana": r'[぀-ゟ]',
                "katakana": r'[゠-ヿ]',
                "common_particles": ["は", "が", "を", "に", "で", "と", "も", "の"],
                "honorific_markers": ["です", "ます", "ございます", "さん", "様"],
                "emotion_markers": ["（笑）", "w", "orz", "^^"],
            },
            "zh": {
                "script_patterns": [r'[一-鿿]'],
                "simplified_specific": ["们", "这", "那", "国", "学"],
                "common_particles": ["的", "了", "是", "在", "有", "和"],
                "emotion_markers": ["哈哈", "呵呵", "嘿嘿", "。。。"],
            },
            "zh-TW": {
                "script_patterns": [r'[一-鿿]'],
                "traditional_specific": ["們", "這", "國", "學", "為"],
                "common_particles": ["的", "了", "是", "在", "有", "和"],
            },
            "vi": {
                "script_patterns": [r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]'],
                "tone_markers": ["à", "á", "ả", "ã", "ạ", "ă", "â"],
                "common_words": ["là", "của", "và", "có", "được", "trong", "này"],
            }
        }

    def _define_cultural_contexts(self) -> Dict[str, CulturalContext]:
        """문화별 컨텍스트 정의"""
        return {
            "ko": CulturalContext(
                language="ko",
                communication_style=CommunicationStyle.HIGH_CONTEXT,
                formality_level="formal",
                emotional_expression_style="reserved",
                family_orientation="collectivist",
                stigma_sensitivity=0.8,
                recommended_approach="indirect_supportive",
                cultural_considerations=[
                    "체면(face) 중시",
                    "정(jeong) - 정서적 유대감",
                    "눈치(nunchi) - 비언어적 커뮤니케이션",
                    "한(han) - 깊은 슬픔과 억울함",
                    "효(hyo) - 부모 공경",
                    "가족 중심 문화",
                    "세대 간 갈등 이해"
                ],
                taboo_topics=[
                    "직접적인 정신건강 언급 (초기)",
                    "가족 비판",
                    "사회적 실패"
                ],
                preferred_honorifics={
                    "greeting": "안녕하세요",
                    "acknowledgment": "네, 이해합니다",
                    "empathy": "많이 힘드셨겠어요",
                    "closing": "편안한 하루 보내세요"
                }
            ),
            "en": CulturalContext(
                language="en",
                communication_style=CommunicationStyle.LOW_CONTEXT,
                formality_level="informal",
                emotional_expression_style="expressive",
                family_orientation="individualist",
                stigma_sensitivity=0.4,
                recommended_approach="direct_supportive",
                cultural_considerations=[
                    "Individual autonomy valued",
                    "Direct communication preferred",
                    "Emotional expression encouraged",
                    "Self-help orientation",
                    "Work-life balance awareness"
                ],
                taboo_topics=[],
                preferred_honorifics={
                    "greeting": "Hello",
                    "acknowledgment": "I understand",
                    "empathy": "That sounds really difficult",
                    "closing": "Take care"
                }
            ),
            "ja": CulturalContext(
                language="ja",
                communication_style=CommunicationStyle.HIGH_CONTEXT,
                formality_level="formal",
                emotional_expression_style="reserved",
                family_orientation="collectivist",
                stigma_sensitivity=0.85,
                recommended_approach="indirect_respectful",
                cultural_considerations=[
                    "和(wa) - 조화 중시",
                    "本音と建前(honne/tatemae) - 속마음과 겉모습",
                    "我慢(gaman) - 인내",
                    "空気を読む(kuuki wo yomu) - 분위기 파악",
                    "恥(haji) - 수치심 문화"
                ],
                taboo_topics=[
                    "직접적인 감정 표현 강요",
                    "가족 문제 직접 언급"
                ],
                preferred_honorifics={
                    "greeting": "こんにちは",
                    "acknowledgment": "はい、わかります",
                    "empathy": "それは大変でしたね",
                    "closing": "お体をお大事に"
                }
            ),
            "zh": CulturalContext(
                language="zh",
                communication_style=CommunicationStyle.HIGH_CONTEXT,
                formality_level="mixed",
                emotional_expression_style="reserved",
                family_orientation="collectivist",
                stigma_sensitivity=0.75,
                recommended_approach="indirect_warm",
                cultural_considerations=[
                    "面子(miànzi) - 체면",
                    "关系(guānxi) - 관계 중시",
                    "孝顺(xiàoshùn) - 효도",
                    "家庭 중심 가치관"
                ],
                taboo_topics=[
                    "가족 비판",
                    "직접적 정신건강 진단"
                ],
                preferred_honorifics={
                    "greeting": "您好",
                    "acknowledgment": "我理解",
                    "empathy": "这一定很不容易",
                    "closing": "祝您一切顺利"
                }
            )
        }

    def _build_layers(self):
        """모델 레이어 구축"""
        # 임베딩 레이어
        self.token_embedding = keras.layers.Embedding(
            self.vocab_size, self.embedding_dim, name="token_embedding"
        )
        
        # 문자 수준 CNN
        self.char_cnn = keras.Sequential([
            keras.layers.Conv1D(128, 3, activation='relu', padding='same'),
            keras.layers.Conv1D(128, 5, activation='relu', padding='same'),
            keras.layers.GlobalMaxPooling1D()
        ], name="char_cnn")
        
        # BiLSTM 레이어
        self.bilstm = keras.layers.Bidirectional(
            keras.layers.LSTM(128, return_sequences=True),
            name="bilstm"
        )
        
        # 언어 분류 헤드
        self.language_classifier = keras.Sequential([
            keras.layers.GlobalAveragePooling1D(),
            keras.layers.Dense(256, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(128, activation='relu'),
            keras.layers.Dense(self.num_languages, activation='softmax')
        ], name="language_classifier")
        
        # 코드 스위칭 감지 헤드
        self.code_switch_detector = keras.Sequential([
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')
        ], name="code_switch_detector")
        
        # 형식성 분류 헤드
        self.formality_classifier = keras.Sequential([
            keras.layers.GlobalAveragePooling1D(),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dense(3, activation='softmax') # formal, informal, mixed
        ], name="formality_classifier")

    def call(self, inputs: Dict[str, tf.Tensor], training: bool = False) -> Dict[str, tf.Tensor]:
        """
        순전파
        Args:
            inputs: {
                'input_ids': (batch, seq_len),
                'char_ids': (batch, seq_len, char_len)
            }
            training: 학습 모드 여부
        Returns:
            언어 확률, 코드 스위칭 확률, 형식성 확률
        """
        input_ids = inputs['input_ids']
        
        # 토큰 임베딩
        token_emb = self.token_embedding(input_ids)
        
        # BiLSTM 처리
        lstm_out = self.bilstm(token_emb, training=training)
        
        # 언어 분류
        language_probs = self.language_classifier(lstm_out)
        
        # 코드 스위칭 감지
        pooled = tf.reduce_mean(lstm_out, axis=1)
        code_switch_prob = self.code_switch_detector(pooled)
        
        # 형식성 분류
        formality_probs = self.formality_classifier(lstm_out)
        
        return {
            'language_probs': language_probs,
            'code_switch_prob': code_switch_prob,
            'formality_probs': formality_probs,
            'hidden_states': lstm_out
        }

    def detect_language(self, text: str, tokenizer: Any = None) -> LanguageDetectionResult:
        """
        텍스트 언어 감지
        Args:
            text: 입력 텍스트
            tokenizer: 토크나이저 (None이면 규칙 기반 사용)
        Returns:
            LanguageDetectionResult
        """
        # 규칙 기반 빠른 감지
        rule_based = self._rule_based_detection(text)
        
        # 모델 기반 감지 (tokenizer가 있는 경우)
        if tokenizer is not None:
            model_based = self._model_based_detection(text, tokenizer)
            # 앙상블
            final_result = self._ensemble_results(rule_based, model_based)
        else:
            final_result = rule_based
            
        return final_result

    def _rule_based_detection(self, text: str) -> LanguageDetectionResult:
        """규칙 기반 언어 감지"""
        scores = {lang: 0.0 for lang in SupportedLanguage}
        detected_phrases = {lang.value: [] for lang in SupportedLanguage}
        
        # 한국어 감지
        korean_chars = len(re.findall(r'[가-힣]', text))
        if korean_chars > 0:
            scores[SupportedLanguage.KOREAN] = korean_chars / len(text) if text else 0
            
        # 일본어 감지 (히라가나/카타카나)
        hiragana = len(re.findall(r'[\u3040-\u309F]', text))
        katakana = len(re.findall(r'[\u30A0-\u30FF]', text))
        if hiragana + katakana > 0:
            scores[SupportedLanguage.JAPANESE] = (hiragana + katakana) / len(text) if text else 0
            
        # 중국어 감지 (한자)
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        # 한국어/일본어가 아닌 경우의 한자
        if chinese_chars > 0 and scores[SupportedLanguage.KOREAN] < 0.1 and scores[SupportedLanguage.JAPANESE] < 0.1:
            # 간체/번체 구분
            simplified = len(re.findall(r'[们这那国学为会]', text))
            traditional = len(re.findall(r'[們這國學為會]', text))
            if simplified > traditional:
                scores[SupportedLanguage.CHINESE_SIMPLIFIED] = chinese_chars / len(text) if text else 0
            else:
                scores[SupportedLanguage.CHINESE_TRADITIONAL] = chinese_chars / len(text) if text else 0
                
        # 베트남어 감지
        vietnamese_chars = len(re.findall(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]', text))
        if vietnamese_chars > 0:
            scores[SupportedLanguage.VIETNAMESE] = vietnamese_chars / len(text) if text else 0
            
        # 영어 감지
        english_chars = len(re.findall(r'[a-zA-Z]', text))
        english_words = len(re.findall(r'\b(the|is|are|was|were|have|has|been|I|you|we|they|it|this|that)\b', text.lower()))
        if english_chars > 0 and sum([scores[lang] for lang in scores if lang != SupportedLanguage.ENGLISH]) < 0.3:
            scores[SupportedLanguage.ENGLISH] = (english_chars / len(text) * 0.5 + min(english_words / 10, 0.5)) if text else 0
            
        # 결과 정렬
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_scores[0]
        
        # 코드 스위칭 감지
        significant_languages = [lang for lang, score in sorted_scores if score > 0.1]
        is_mixed = len(significant_languages) > 1
        
        return LanguageDetectionResult(
            primary_language=primary[0].value,
            confidence=primary[1],
            secondary_languages=[(lang.value, score) for lang, score in sorted_scores[1:] if score > 0.05],
            script_type=self._detect_script_type(text),
            is_mixed=is_mixed,
            code_switching_detected=is_mixed,
            detected_phrases=detected_phrases
        )

    def _model_based_detection(self, text: str, tokenizer: Any) -> LanguageDetectionResult:
        """모델 기반 언어 감지"""
        # 토큰화
        encoded = tokenizer(
            text,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='tf'
        )
        
        # 모델 추론
        outputs = self({
            'input_ids': encoded['input_ids']
        }, training=False)
        
        # 언어 확률 추출
        lang_probs = outputs['language_probs'][0].numpy()
        code_switch = outputs['code_switch_prob'][0].numpy()[0]
        
        # 언어 매핑
        lang_map = {
            0: "ko", 1: "en", 2: "ja", 3: "zh", 4: "zh-TW", 5: "vi"
        }
        
        sorted_indices = np.argsort(lang_probs)[::-1]
        primary_lang = lang_map[sorted_indices[0]]
        primary_conf = float(lang_probs[sorted_indices[0]])
        
        secondary = [
            (lang_map[idx], float(lang_probs[idx]))
            for idx in sorted_indices[1:]
            if lang_probs[idx] > 0.05
        ]
        
        return LanguageDetectionResult(
            primary_language=primary_lang,
            confidence=primary_conf,
            secondary_languages=secondary,
            script_type=self._detect_script_type(text),
            is_mixed=code_switch > 0.5,
            code_switching_detected=code_switch > 0.5,
            detected_phrases={}
        )

    def _ensemble_results(
        self,
        rule_based: LanguageDetectionResult,
        model_based: LanguageDetectionResult
    ) -> LanguageDetectionResult:
        """규칙 기반과 모델 기반 결과 앙상블"""
        # 가중 평균
        rule_weight = 0.4
        model_weight = 0.6
        
        if rule_based.primary_language == model_based.primary_language:
            # 일치하는 경우
            confidence = (
                rule_based.confidence * rule_weight +
                model_based.confidence * model_weight
            )
            return LanguageDetectionResult(
                primary_language=rule_based.primary_language,
                confidence=confidence,
                secondary_languages=model_based.secondary_languages,
                script_type=rule_based.script_type,
                is_mixed=rule_based.is_mixed or model_based.is_mixed,
                code_switching_detected=model_based.code_switching_detected,
                detected_phrases=rule_based.detected_phrases
            )
        else:
            # 불일치하는 경우 - 더 높은 신뢰도 선택
            if rule_based.confidence > model_based.confidence:
                return rule_based
            else:
                return model_based

    def _detect_script_type(self, text: str) -> str:
        """문자 체계 감지"""
        if re.search(r'[가-힣]', text):
            return "hangul"
        elif re.search(r'[\u3040-\u309F]', text):
            return "hiragana"
        elif re.search(r'[\u30A0-\u30FF]', text):
            return "katakana"
        elif re.search(r'[\u4e00-\u9fff]', text):
            return "hanzi"
        elif re.search(r'[àáảãạăằắẳẵặâầấẩẫậ]', text):
            return "vietnamese_latin"
        else:
            return "latin"

    def analyze_cultural_context(self, text: str, detected_language: str) -> CulturalContext:
        """
        문화적 컨텍스트 분석
        Args:
            text: 입력 텍스트
            detected_language: 감지된 언어 코드
        Returns:
            CulturalContext
        """
        # 기본 문화 컨텍스트 가져오기
        base_context = self.cultural_contexts.get(
            detected_language,
            self.cultural_contexts["en"] # 기본값
        )
        
        # 텍스트에서 추가 문화적 단서 분석
        formality = self._analyze_formality(text, detected_language)
        emotional_style = self._analyze_emotional_style(text, detected_language)
        
        # 컨텍스트 업데이트
        return CulturalContext(
            language=detected_language,
            communication_style=base_context.communication_style,
            formality_level=formality,
            emotional_expression_style=emotional_style,
            family_orientation=base_context.family_orientation,
            stigma_sensitivity=base_context.stigma_sensitivity,
            recommended_approach=base_context.recommended_approach,
            cultural_considerations=base_context.cultural_considerations,
            taboo_topics=base_context.taboo_topics,
            preferred_honorifics=base_context.preferred_honorifics
        )

    def _analyze_formality(self, text: str, language: str) -> str:
        """형식성 분석"""
        if language == "ko":
            # 한국어 형식성
            formal_markers = ["습니다", "입니다", "세요", "시"]
            informal_markers = ["어", "야", "냐", "ㅋ", "ㅎ"]
            
            formal_count = sum(1 for m in formal_markers if m in text)
            informal_count = sum(1 for m in informal_markers if m in text)
            
            if formal_count > informal_count:
                return "formal"
            elif informal_count > formal_count:
                return "informal"
            else:
                return "mixed"
                
        elif language == "ja":
            # 일본어 형식성
            formal_markers = ["です", "ます", "ございます"]
            informal_markers = ["だ", "よ", "ね"]
            
            formal_count = sum(1 for m in formal_markers if m in text)
            informal_count = sum(1 for m in informal_markers if m in text)
            
            if formal_count > informal_count:
                return "formal"
            elif informal_count > formal_count:
                return "informal"
            else:
                return "mixed"
        else:
            return "neutral"

    def _analyze_emotional_style(self, text: str, language: str) -> str:
        """감정 표현 스타일 분석"""
        # 감정 표현 마커
        expressive_markers = ["!", "!!", "...", "ㅜㅜ", "ㅠㅠ", "😢", "😭"]
        reserved_indicators = len(text) > 50 and text.count("!") < 2
        
        expressive_count = sum(1 for m in expressive_markers if m in text)
        
        if expressive_count > 3:
            return "expressive"
        elif reserved_indicators:
            return "reserved"
        else:
            return "moderate"

    def get_therapeutic_recommendations(
        self,
        cultural_context: CulturalContext
    ) -> Dict[str, Any]:
        """
        문화적 컨텍스트 기반 치료적 권고사항
        Args:
            cultural_context: 문화 컨텍스트 분석 결과
        Returns:
            치료적 권고사항
        """
        recommendations = {
            "communication_approach": "",
            "initial_rapport": [],
            "therapeutic_techniques": [],
            "things_to_avoid": [],
            "crisis_response_adaptation": {}
        }
        
        if cultural_context.communication_style == CommunicationStyle.HIGH_CONTEXT:
            recommendations["communication_approach"] = "간접적이고 맥락을 고려한 접근"
            recommendations["initial_rapport"] = [
                "충분한 시간을 두고 신뢰 구축",
                "비언어적 신호에 주의",
                "성급한 문제 해결 지양"
            ]
            recommendations["therapeutic_techniques"] = [
                "은유와 이야기 활용",
                "가족 체계 고려",
                "점진적 자기 개방 유도"
            ]
        else:
            recommendations["communication_approach"] = "직접적이고 명확한 접근"
            recommendations["initial_rapport"] = [
                "목표 지향적 대화",
                "감정 표현 격려",
                "자기 효능감 강조"
            ]
            recommendations["therapeutic_techniques"] = [
                "구체적 행동 계획",
                "인지 재구조화",
                "자기 주장 훈련"
            ]
            
        if cultural_context.stigma_sensitivity > 0.7:
            recommendations["things_to_avoid"] = [
                "초기에 '정신건강' 직접 언급",
                "진단명 사용",
                "가족에게 알릴 것을 강요"
            ]
            recommendations["crisis_response_adaptation"] = {
                "approach": "부드럽고 비낙인적",
                "language": "일상적 어휘 사용",
                "framing": "스트레스 관리 관점"
            }
            
        return recommendations

# 테스트 코드
if __name__ == "__main__":
    # 모델 초기화
    detector = MultilingualLanguageDetector()
    
    # 테스트 텍스트
    test_texts = [
        "오늘 하루가 너무 힘들었어요. 아무것도 하기 싫어요.",
        "I'm feeling overwhelmed with work and life.",
        "오늘은 정말 피곤했어요. 아무것도 하고 싶지 않아요.",
        "我今天感觉很累，什么都不想做。",
        "Tôi cảm thấy rất mệt mỏi hôm nay.",
        "요즘 I feel so tired 매일 힘들어요" # 코드 스위칭
    ]
    
    print("=== 다국어 언어 감지 테스트 ===\n")
    for text in test_texts:
        result = detector.detect_language(text)
        print(f"텍스트: {text}")
        print(f" 언어: {result.primary_language} (신뢰도: {result.confidence:.2f})")
        print(f" 코드 스위칭: {result.code_switching_detected}")
        
        # 문화 컨텍스트 분석
        context = detector.analyze_cultural_context(text, result.primary_language)
        print(f" 커뮤니케이션 스타일: {context.communication_style.value}")
        print(f" 낙인 민감도: {context.stigma_sensitivity}")
        print()
