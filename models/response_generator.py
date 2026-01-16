"""
응답 생성 모델 (Phase 1-3 통합)
저장 경로: models/response_generator.py
"""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
import random


class TherapeuticApproach(Enum):
    """치료적 접근법"""
    CBT = "cbt"
    DBT = "dbt"
    MI = "mi"
    PCT = "pct"
    SFBT = "sfbt"


@dataclass
class CounselingResponse:
    """상담 응답"""
    text: str
    approach: str
    empathy_elements: List[str]
    suggested_techniques: List[str]
    follow_up_question: Optional[str] = None
    safety_resources: Optional[Dict[str, str]] = None


class ResponseGenerator:
    """
    상담 응답 생성기 (다국어 지원)
    
    Features:
    - 다양한 치료적 접근법 지원
    - 다국어 응답 생성
    - 문화적 맥락 적응
    - 위기 대응 프로토콜
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self._init_response_templates()
        self._init_techniques()
        self._init_safety_resources()
        print("ResponseGenerator initialized with multilingual support.")
    
    def _init_response_templates(self):
        """응답 템플릿 초기화"""
        self.templates = {
            "ko": {
                "sadness": {
                    "empathy": [
                        "많이 힘드시군요. 그런 감정을 느끼시는 게 당연해요.",
                        "정말 힘든 시간을 보내고 계시네요. 마음이 아프실 것 같아요.",
                        "많이 지치셨겠어요. 저도 그 마음이 느껴져요."
                    ],
                    "validation": [
                        "그런 상황에서 슬프고 힘든 건 자연스러운 거예요.",
                        "지금 느끼시는 감정은 충분히 이해가 돼요."
                    ],
                    "follow_up": [
                        "언제부터 이런 감정을 느끼셨어요?",
                        "조금 더 이야기해 주실 수 있을까요?",
                        "오늘 특별히 힘들게 한 일이 있었나요?"
                    ]
                },
                "anger": {
                    "empathy": [
                        "정말 화가 나셨겠어요. 그런 일을 겪으시면 누구라도 그러실 거예요.",
                        "그런 상황이라면 화가 나시는 게 당연해요."
                    ],
                    "validation": [
                        "화나는 감정을 느끼시는 건 자연스러운 거예요.",
                        "그런 대우를 받으시면 분노를 느끼실 수밖에 없어요."
                    ],
                    "follow_up": [
                        "어떤 일이 있으셨는지 더 말씀해 주시겠어요?",
                        "그때 어떤 생각이 드셨어요?"
                    ]
                },
                "anxiety": {
                    "empathy": [
                        "많이 불안하시군요. 그 마음이 느껴져요.",
                        "걱정이 많으시겠어요. 마음이 편치 않으시죠."
                    ],
                    "validation": [
                        "불안함을 느끼시는 건 마음이 보내는 신호예요.",
                        "걱정이 되시는 건 자연스러운 반응이에요."
                    ],
                    "techniques": [
                        "잠시 깊은 호흡을 함께 해볼까요?",
                        "지금 발이 땅에 닿는 느낌에 집중해 보시겠어요?"
                    ],
                    "follow_up": [
                        "무엇이 가장 걱정되세요?",
                        "불안할 때 평소 어떻게 하세요?"
                    ]
                },
                "happiness": {
                    "empathy": [
                        "정말 좋은 소식이네요! 기쁜 마음이 느껴져요.",
                        "정말 다행이에요. 저도 기분이 좋아지네요."
                    ],
                    "follow_up": [
                        "어떤 일이 있으셨는지 더 들려주세요!",
                        "그 기분을 계속 유지하려면 어떻게 하면 좋을까요?"
                    ]
                },
                "neutral": {
                    "empathy": [
                        "네, 말씀 들었어요.",
                        "그렇군요, 이해했어요."
                    ],
                    "follow_up": [
                        "조금 더 자세히 말씀해 주시겠어요?",
                        "그 부분에 대해 어떻게 느끼세요?"
                    ]
                },
                "crisis": {
                    "immediate": [
                        "지금 많이 힘드시군요. 말씀해 주셔서 감사해요.",
                        "지금 느끼시는 감정이 정말 고통스러우시겠어요."
                    ],
                    "safety": [
                        "지금 안전하신가요?",
                        "혹시 스스로를 해치고 싶은 생각이 있으세요?"
                    ],
                    "resources": [
                        "지금 바로 전문가와 이야기하실 수 있어요. 자살예방상담전화 1393은 24시간 운영됩니다.",
                        "힘드실 때 정신건강위기상담전화 1577-0199로 연락해 주세요."
                    ]
                }
            },
            "en": {
                "sadness": {
                    "empathy": [
                        "I hear that you're going through a really difficult time.",
                        "It sounds like you're carrying a heavy burden right now.",
                        "I'm sorry you're feeling this way. That must be really hard."
                    ],
                    "validation": [
                        "It's completely understandable to feel sad in this situation.",
                        "Your feelings are valid and make sense given what you're experiencing."
                    ],
                    "follow_up": [
                        "Can you tell me more about what's been happening?",
                        "How long have you been feeling this way?",
                        "What would feel most helpful right now?"
                    ]
                },
                "anger": {
                    "empathy": [
                        "I can understand why you'd feel angry about that.",
                        "That situation sounds really frustrating."
                    ],
                    "validation": [
                        "It's natural to feel angry when something unfair happens.",
                        "Your anger makes sense given what you've been through."
                    ],
                    "follow_up": [
                        "What happened that led to these feelings?",
                        "How has this been affecting you?"
                    ]
                },
                "anxiety": {
                    "empathy": [
                        "It sounds like you're feeling really anxious right now.",
                        "I can hear that worry in what you're sharing."
                    ],
                    "validation": [
                        "Anxiety is your mind's way of trying to protect you.",
                        "It's okay to feel worried about uncertain situations."
                    ],
                    "techniques": [
                        "Would you like to try a brief breathing exercise together?",
                        "Let's try grounding - can you name 5 things you can see right now?"
                    ],
                    "follow_up": [
                        "What's worrying you the most?",
                        "When did you start feeling this way?"
                    ]
                },
                "happiness": {
                    "empathy": [
                        "That's wonderful to hear! I'm happy for you.",
                        "It sounds like something really positive happened!"
                    ],
                    "follow_up": [
                        "I'd love to hear more about it!",
                        "What made this experience so meaningful for you?"
                    ]
                },
                "neutral": {
                    "empathy": [
                        "I hear you.",
                        "Thank you for sharing that with me."
                    ],
                    "follow_up": [
                        "Could you tell me more about that?",
                        "How do you feel about what you just shared?"
                    ]
                },
                "crisis": {
                    "immediate": [
                        "I'm really glad you reached out. What you're feeling matters.",
                        "It sounds like you're in a lot of pain right now. I want to help."
                    ],
                    "safety": [
                        "Are you safe right now?",
                        "Are you having thoughts of hurting yourself?"
                    ],
                    "resources": [
                        "Please reach out to the 988 Suicide & Crisis Lifeline - they're available 24/7.",
                        "You can also text HOME to 741741 to reach a crisis counselor."
                    ]
                }
            }
        }
    
    def _init_techniques(self):
        """치료 기법 초기화"""
        self.techniques = {
            "ko": {
                "anxiety": [
                    "4-7-8 호흡법",
                    "5-4-3-2-1 그라운딩 기법",
                    "점진적 근육 이완"
                ],
                "sadness": [
                    "행동 활성화",
                    "감사 일기",
                    "자기 연민 연습"
                ],
                "anger": [
                    "타임아웃 기법",
                    "인지 재구조화",
                    "이완 훈련"
                ]
            },
            "en": {
                "anxiety": [
                    "4-7-8 Breathing",
                    "5-4-3-2-1 Grounding",
                    "Progressive Muscle Relaxation"
                ],
                "sadness": [
                    "Behavioral Activation",
                    "Gratitude Journaling",
                    "Self-Compassion Practice"
                ],
                "anger": [
                    "Time-out Technique",
                    "Cognitive Restructuring",
                    "Relaxation Training"
                ]
            }
        }
    
    def _init_safety_resources(self):
        """안전 자원 초기화"""
        self.safety_resources = {
            "ko": {
                "suicide_prevention": "1393 (자살예방상담전화)",
                "mental_health": "1577-0199 (정신건강위기상담전화)",
                "emergency": "119"
            },
            "en": {
                "suicide_prevention": "988 (Suicide & Crisis Lifeline)",
                "crisis_text": "Text HOME to 741741",
                "emergency": "911"
            },
            "ja": {
                "yorisoi": "0120-279-338 (よりそいホットライン)",
                "inochi": "0570-783-556 (いのちの電話)"
            }
        }
    
    def generate(
        self,
        user_text: str,
        emotion: str,
        context: Dict[str, Any] = None,
        language: str = "ko",
        is_crisis: bool = False,
        approach: TherapeuticApproach = TherapeuticApproach.CBT
    ) -> CounselingResponse:
        """
        사용자 입력과 감정에 따른 공감적 응답 생성
        
        Args:
            user_text: 사용자 메시지
            emotion: 감지된 감정
            context: 대화 컨텍스트
            language: 언어 코드
            is_crisis: 위기 상황 여부
            approach: 치료적 접근법
        
        Returns:
            CounselingResponse
        """
        templates = self.templates.get(language, self.templates["en"])
        
        # 위기 상황 처리
        if is_crisis:
            return self._generate_crisis_response(templates, language)
        
        # 감정별 템플릿 가져오기
        emotion_templates = templates.get(emotion, templates.get("neutral", {{}}))
        
        # 공감 표현 선택
        empathy_list = emotion_templates.get("empathy", ["네, 말씀 들었어요."])
        empathy = random.choice(empathy_list)
        
        # 검증 표현 추가 (있는 경우)
        validation_list = emotion_templates.get("validation", [])
        validation = random.choice(validation_list) if validation_list else ""
        
        # 후속 질문
        follow_up_list = emotion_templates.get("follow_up", [])
        follow_up = random.choice(follow_up_list) if follow_up_list else None
        
        # 기법 제안 (해당되는 경우)
        technique_suggestions = emotion_templates.get("techniques", [])
        
        # 응답 조합
        response_parts = [empathy]
        if validation:
            response_parts.append(validation)
        if follow_up:
            response_parts.append(follow_up)
        
        response_text = " ".join(response_parts)
        
        # 추가 기법 가져오기
        techniques = self.techniques.get(language, self.techniques["en"])
        suggested = techniques.get(emotion, [])[:2]
        
        return CounselingResponse(
            text=response_text,
            approach=approach.value,
            empathy_elements=[empathy],
            suggested_techniques=suggested + technique_suggestions,
            follow_up_question=follow_up
        )
    
    def _generate_crisis_response(
        self,
        templates: Dict,
        language: str
    ) -> CounselingResponse:
        """위기 상황 응답 생성"""
        crisis = templates.get("crisis", {{}})
        
        immediate = random.choice(crisis.get("immediate", ["지금 많이 힘드시군요."]))
        safety = random.choice(crisis.get("safety", ["지금 안전하신가요?"]))
        resource = random.choice(crisis.get("resources", []))
        
        response_text = f"{immediate} {safety} {resource}"
        
        return CounselingResponse(
            text=response_text,
            approach="crisis_intervention",
            empathy_elements=[immediate],
            suggested_techniques=["안전 계획 수립", "전문가 연결"],
            follow_up_question=safety,
            safety_resources=self.safety_resources.get(language, self.safety_resources["ko"])
        )
    
    def get_safety_resources(self, language: str = "ko") -> Dict[str, str]:
        """안전 자원 조회"""
        return self.safety_resources.get(language, self.safety_resources["ko"])


# 테스트
if __name__ == "__main__":
    generator = ResponseGenerator()
    
    # 일반 응답 테스트
    result = generator.generate(
        user_text="요즘 너무 힘들어요",
        emotion="sadness",
        language="ko"
    )
    print(f"응답: {result.text}")
    print(f"기법 제안: {result.suggested_techniques}")
    
    # 위기 응답 테스트
    crisis_result = generator.generate(
        user_text="죽고 싶어요",
        emotion="sadness",
        language="ko",
        is_crisis=True
    )
    print(f"\n위기 응답: {crisis_result.text}")
    print(f"안전 자원: {crisis_result.safety_resources}")
