"""
적응형 치료 개인화 모듈
Phase 3: 고급 개인화 및 장기 기억
저장 경로: /AI_Drive/counseling_ai/models/personalization/adaptive_therapy.py
"""
import tensorflow as tf
from tensorflow import keras
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import numpy as np
import json
from collections import defaultdict

class TherapeuticApproach(Enum):
    """치료적 접근법"""
    CBT = "cognitive_behavioral_therapy"
    DBT = "dialectical_behavior_therapy"
    ACT = "acceptance_commitment_therapy"
    MI = "motivational_interviewing"
    PCT = "person_centered_therapy"
    SFBT = "solution_focused_brief_therapy"
    PSYCHODYNAMIC = "psychodynamic_lite"
    INTEGRATIVE = "integrative"

class EmotionalPattern(Enum):
    """감정 패턴"""
    PERSISTENT_LOW = "persistent_low_mood"
    MOOD_SWINGS = "mood_fluctuations"
    ANXIETY_DOMINANT = "anxiety_dominant"
    ANGER_ISSUES = "anger_management"
    EMOTIONAL_NUMBING = "emotional_numbing"
    MIXED = "mixed_presentation"
    STABLE = "emotionally_stable"

@dataclass
class UserProfile:
    """사용자 프로파일"""
    user_id: str
    created_at: datetime
    language: str
    
    # 인구통계 (선택적)
    age_range: Optional[str] = None
    gender: Optional[str] = None
    cultural_background: Optional[str] = None
    
    # 선호도
    preferred_approach: Optional[TherapeuticApproach] = None
    preferred_communication_style: str = "balanced"
    preferred_session_length: str = "medium" # short, medium, long
    
    # 치료 이력
    presenting_concerns: List[str] = field(default_factory=list)
    therapy_goals: List[str] = field(default_factory=list)
    coping_strategies_learned: List[str] = field(default_factory=list)
    
    # 위험 요소
    risk_factors: List[str] = field(default_factory=list)
    protective_factors: List[str] = field(default_factory=list)
    crisis_history: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class EmotionalMemory:
    """감정 기억"""
    timestamp: datetime
    emotion: str
    intensity: float
    trigger: Optional[str]
    context: Dict[str, Any]
    coping_used: Optional[str]
    effectiveness: Optional[float]

@dataclass
class TherapeuticProgress:
    """치료 진행 상황"""
    user_id: str
    start_date: datetime
    
    # 진행 지표
    total_sessions: int = 0
    engagement_score: float = 0.0
    therapeutic_alliance_score: float = 0.0
    
    # 증상 추적
    symptom_trajectory: List[Dict[str, float]] = field(default_factory=list)
    mood_trend: str = "stable"
    
    # 목표 달성
    goals_achieved: List[str] = field(default_factory=list)
    goals_in_progress: List[str] = field(default_factory=list)
    
    # 학습된 기술
    skills_mastered: List[str] = field(default_factory=list)
    skills_practicing: List[str] = field(default_factory=list)

@dataclass
class AdaptationRecommendation:
    """적응 권고"""
    recommended_approach: TherapeuticApproach
    confidence: float
    reasoning: str
    specific_techniques: List[str]
    communication_adjustments: List[str]
    pacing_recommendation: str
    focus_areas: List[str]

class LongTermMemoryStore:
    """
    장기 기억 저장소
    벡터 DB 기반 사용자 기억 관리
    """
    def __init__(self, embedding_dim: int = 1536):
        self.embedding_dim = embedding_dim
        self.memories: Dict[str, List[EmotionalMemory]] = defaultdict(list)
        self.patterns: Dict[str, Dict[str, Any]] = {}

    def store_memory(self, user_id: str, memory: EmotionalMemory):
        """기억 저장"""
        self.memories[user_id].append(memory)
        # 패턴 업데이트
        self._update_patterns(user_id)

    def retrieve_relevant_memories(
        self,
        user_id: str,
        current_context: Dict[str, Any],
        limit: int = 5
    ) -> List[EmotionalMemory]:
        """관련 기억 검색"""
        user_memories = self.memories.get(user_id, [])
        if not user_memories:
            return []
            
        # 관련성 점수 계산
        scored_memories = []
        for memory in user_memories:
            relevance = self._calculate_relevance(memory, current_context)
            scored_memories.append((memory, relevance))
            
        # 정렬 및 반환
        scored_memories.sort(key=lambda x: x[1], reverse=True)
        return [m for m, _ in scored_memories[:limit]]

    def _calculate_relevance(self, memory: EmotionalMemory, context: Dict[str, Any]) -> float:
        """관련성 계산"""
        relevance = 0.0
        
        # 감정 일치
        if memory.emotion == context.get('current_emotion'):
            relevance += 0.4
            
        # 최근성
        days_ago = (datetime.now() - memory.timestamp).days
        recency_score = max(0, 1 - (days_ago / 365))
        relevance += recency_score * 0.3
        
        # 트리거 유사성
        if memory.trigger and memory.trigger in str(context.get('triggers', [])):
            relevance += 0.3
            
        return relevance

    def _update_patterns(self, user_id: str):
        """패턴 업데이트"""
        user_memories = self.memories[user_id]
        if len(user_memories) < 5:
            return
            
        # 감정 빈도 분석
        emotion_counts = defaultdict(int)
        for memory in user_memories:
            emotion_counts[memory.emotion] += 1
            
        # 주요 패턴 식별
        dominant_emotion = max(emotion_counts, key=emotion_counts.get)
        
        # 트리거 패턴
        trigger_counts = defaultdict(int)
        for memory in user_memories:
            if memory.trigger:
                trigger_counts[memory.trigger] += 1
                
        self.patterns[user_id] = {
            'dominant_emotion': dominant_emotion,
            'emotion_distribution': dict(emotion_counts),
            'common_triggers': dict(trigger_counts),
            'average_intensity': np.mean([m.intensity for m in user_memories]),
            'updated_at': datetime.now()
        }

    def get_user_patterns(self, user_id: str) -> Dict[str, Any]:
        """사용자 패턴 조회"""
        return self.patterns.get(user_id, {})

class AdaptiveTherapyEngine:
    """
    적응형 치료 엔진
    Features:
    - 실시간 접근법 조정
    - 개인화된 기법 선택
    - 진행 상황 기반 적응
    - 문화적 맥락 고려
    """
    def __init__(self):
        # 장기 기억 저장소
        self.memory_store = LongTermMemoryStore()
        # 사용자 프로파일
        self.user_profiles: Dict[str, UserProfile] = {}
        # 치료 진행 상황
        self.progress_tracking: Dict[str, TherapeuticProgress] = {}
        
        # 접근법별 특성
        self.approach_characteristics = self._define_approach_characteristics()
        # 문화별 적응 규칙
        self.cultural_adaptations = self._define_cultural_adaptations()

    def _define_approach_characteristics(self) -> Dict[TherapeuticApproach, Dict[str, Any]]:
        """접근법별 특성 정의"""
        return {
            TherapeuticApproach.CBT: {
                "best_for": ["anxiety", "depression", "negative_thinking"],
                "core_techniques": [
                    "cognitive_restructuring", "behavioral_activation", "thought_records", "graded_exposure"
                ],
                "structure_level": "high",
                "homework_focus": True,
                "insight_required": "moderate",
                "session_structure": "structured"
            },
            TherapeuticApproach.DBT: {
                "best_for": ["emotional_dysregulation", "self_harm", "interpersonal_issues"],
                "core_techniques": [
                    "distress_tolerance", "emotion_regulation", "interpersonal_effectiveness", "mindfulness"
                ],
                "structure_level": "high",
                "homework_focus": True,
                "insight_required": "low",
                "session_structure": "skills_based"
            },
            TherapeuticApproach.ACT: {
                "best_for": ["chronic_conditions", "avoidance", "values_confusion"],
                "core_techniques": [
                    "acceptance", "defusion", "present_moment", "values_clarification", "committed_action"
                ],
                "structure_level": "moderate",
                "homework_focus": True,
                "insight_required": "moderate",
                "session_structure": "experiential"
            },
            TherapeuticApproach.MI: {
                "best_for": ["ambivalence", "addiction", "behavior_change"],
                "core_techniques": [
                    "open_questions", "affirmations", "reflections", "summaries", "change_talk"
                ],
                "structure_level": "low",
                "homework_focus": False,
                "insight_required": "moderate",
                "session_structure": "client_led"
            },
            TherapeuticApproach.PCT: {
                "best_for": ["self_exploration", "relationship_issues", "low_self_esteem"],
                "core_techniques": [
                    "unconditional_positive_regard", "empathic_understanding", "congruence", "reflection"
                ],
                "structure_level": "low",
                "homework_focus": False,
                "insight_required": "high",
                "session_structure": "unstructured"
            },
            TherapeuticApproach.SFBT: {
                "best_for": ["goal_setting", "brief_intervention", "solution_focus"],
                "core_techniques": [
                    "miracle_question", "scaling_questions", "exception_finding", "coping_questions"
                ],
                "structure_level": "moderate",
                "homework_focus": True,
                "insight_required": "low",
                "session_structure": "goal_oriented"
            }
        }

    def _define_cultural_adaptations(self) -> Dict[str, Dict[str, Any]]:
        """문화별 적응 규칙"""
        return {
            "ko": {
                "preferred_approaches": [
                    TherapeuticApproach.CBT, TherapeuticApproach.SFBT, TherapeuticApproach.PCT
                ],
                "communication_style": {
                    "directness": "indirect",
                    "emotion_expression": "reserved",
                    "family_involvement": "important"
                },
                "adaptations": ["존칭 사용 필수", "가족 맥락 고려", "체면(face) 존중", "정(jeong) 활용", "점진적 자기 개방"],
                "avoid": [
                    "초기 직접적 감정 표현 요구", "가족 비판", "급격한 변화 기대"
                ]
            },
            "en": {
                "preferred_approaches": [
                    TherapeuticApproach.CBT, TherapeuticApproach.MI, TherapeuticApproach.ACT
                ],
                "communication_style": {
                    "directness": "direct",
                    "emotion_expression": "encouraged",
                    "family_involvement": "optional"
                },
                "adaptations": ["Direct communication", "Individual focus", "Goal orientation", "Emotional expression encouraged"],
                "avoid": [
                    "Over-generalization", "Cultural assumptions"
                ]
            },
            "ja": {
                "preferred_approaches": [
                    TherapeuticApproach.PCT, TherapeuticApproach.ACT, TherapeuticApproach.SFBT
                ],
                "communication_style": {
                    "directness": "very_indirect",
                    "emotion_expression": "very_reserved",
                    "family_involvement": "important"
                },
                "adaptations": ["경어 사용 필수", "화(和) 존중", "비언어적 소통 중시", "간접적 표현 활용", "수치심 민감성 고려"],
                "avoid": [
                    "직접적 대면", "감정 표현 강요", "개인주의적 접근"
                ]
            }
        }

    def create_user_profile(
        self,
        user_id: str,
        language: str,
        initial_data: Optional[Dict[str, Any]] = None
    ) -> UserProfile:
        """사용자 프로파일 생성"""
        profile = UserProfile(
            user_id=user_id,
            created_at=datetime.now(),
            language=language
        )
        
        if initial_data:
            if 'age_range' in initial_data:
                profile.age_range = initial_data['age_range']
            if 'gender' in initial_data:
                profile.gender = initial_data['gender']
            if 'presenting_concerns' in initial_data:
                profile.presenting_concerns = initial_data['presenting_concerns']
                
        self.user_profiles[user_id] = profile
        
        # 진행 추적 초기화
        self.progress_tracking[user_id] = TherapeuticProgress(
            user_id=user_id,
            start_date=datetime.now()
        )
        
        return profile

    def get_adaptation_recommendation(
        self,
        user_id: str,
        current_session_data: Dict[str, Any]
    ) -> AdaptationRecommendation:
        """적응 권고 생성"""
        profile = self.user_profiles.get(user_id)
        progress = self.progress_tracking.get(user_id)
        patterns = self.memory_store.get_user_patterns(user_id)
        
        if not profile:
            # 기본 권고
            return self._get_default_recommendation(
                current_session_data.get('language', 'ko')
            )
            
        # 접근법 선택
        recommended_approach = self._select_approach(
            profile, progress, patterns, current_session_data
        )
        
        # 구체적 기법 선택
        techniques = self._select_techniques(
            recommended_approach, profile, current_session_data
        )
        
        # 커뮤니케이션 조정
        communication_adjustments = self._get_communication_adjustments(
            profile, current_session_data
        )
        
        # 페이싱 권고
        pacing = self._determine_pacing(progress, current_session_data)
        
        # 초점 영역
        focus_areas = self._identify_focus_areas(
            profile, patterns, current_session_data
        )
        
        return AdaptationRecommendation(
            recommended_approach=recommended_approach,
            confidence=0.85,
            reasoning=self._generate_reasoning(
                recommended_approach, profile, patterns
            ),
            specific_techniques=techniques,
            communication_adjustments=communication_adjustments,
            pacing_recommendation=pacing,
            focus_areas=focus_areas
        )

    def _select_approach(
        self,
        profile: UserProfile,
        progress: Optional[TherapeuticProgress],
        patterns: Dict[str, Any],
        session_data: Dict[str, Any]
    ) -> TherapeuticApproach:
        """접근법 선택"""
        scores = {}
        for approach in TherapeuticApproach:
            score = self._calculate_approach_fit(
                approach, profile, progress, patterns, session_data
            )
            scores[approach] = score
            
        # 최고 점수 접근법 선택
        return max(scores, key=scores.get)

    def _calculate_approach_fit(
        self,
        approach: TherapeuticApproach,
        profile: UserProfile,
        progress: Optional[TherapeuticProgress],
        patterns: Dict[str, Any],
        session_data: Dict[str, Any]
    ) -> float:
        """접근법 적합성 계산"""
        score = 0.5 # 기본 점수
        characteristics = self.approach_characteristics.get(approach, {})
        
        # 사용자 문제와의 적합성
        concerns = profile.presenting_concerns
        best_for = characteristics.get('best_for', [])
        
        matching_concerns = sum(1 for c in concerns if any(b in c.lower() for b in best_for))
        score += matching_concerns * 0.1
        
        # 문화적 선호도
        cultural = self.cultural_adaptations.get(profile.language, {})
        preferred = cultural.get('preferred_approaches', [])
        if approach in preferred:
            score += 0.2
            
        # 이전 효과성
        if progress and progress.total_sessions > 5:
            if profile.preferred_approach == approach:
                score += 0.15
                
        # 현재 상태 고려
        current_emotion = session_data.get('current_emotion', '')
        if current_emotion in ['anxiety', 'worry']:
            if approach == TherapeuticApproach.CBT:
                score += 0.1
        elif current_emotion in ['sadness', 'hopelessness']:
            if approach in [TherapeuticApproach.CBT, TherapeuticApproach.ACT]:
                score += 0.1
                
        return min(1.0, score)

    def _select_techniques(
        self,
        approach: TherapeuticApproach,
        profile: UserProfile,
        session_data: Dict[str, Any]
    ) -> List[str]:
        """기법 선택"""
        characteristics = self.approach_characteristics.get(approach, {})
        all_techniques = characteristics.get('core_techniques', [])
        
        # 사용자 수준에 따른 필터링
        session_count = self.progress_tracking.get(profile.user_id, TherapeuticProgress(
            user_id=profile.user_id,
            start_date=datetime.now()
        )).total_sessions
        
        if session_count < 3:
            # 초기: 기본 기법
            return all_techniques[:2]
        elif session_count < 10:
            # 중기: 확장
            return all_techniques[:4]
        else:
            # 후기: 전체
            return all_techniques

    def _get_communication_adjustments(
        self,
        profile: UserProfile,
        session_data: Dict[str, Any]
    ) -> List[str]:
        """커뮤니케이션 조정"""
        adjustments = []
        cultural = self.cultural_adaptations.get(profile.language, {})
        style = cultural.get('communication_style', {})
        
        if style.get('directness') == 'indirect':
            adjustments.append("간접적 표현 사용")
            adjustments.append("은유와 비유 활용")
            
        if style.get('emotion_expression') == 'reserved':
            adjustments.append("감정 표현 강요 지양")
            adjustments.append("점진적 탐색")
            
        # 현재 감정 상태에 따른 조정
        intensity = session_data.get('emotion_intensity', 0.5)
        if intensity > 0.8:
            adjustments.append("안정화 우선")
            adjustments.append("속도 조절")
            
        return adjustments

    def _determine_pacing(
        self,
        progress: Optional[TherapeuticProgress],
        session_data: Dict[str, Any]
    ) -> str:
        """페이싱 결정"""
        if not progress:
            return "slow"
            
        if progress.total_sessions < 3:
            return "slow"
        elif progress.engagement_score < 0.5:
            return "slow"
        elif progress.therapeutic_alliance_score > 0.8:
            return "moderate"
        else:
            return "moderate"

    def _identify_focus_areas(
        self,
        profile: UserProfile,
        patterns: Dict[str, Any],
        session_data: Dict[str, Any]
    ) -> List[str]:
        """초점 영역 식별"""
        focus_areas = []
        
        # 주요 관심사
        if profile.presenting_concerns:
            focus_areas.extend(profile.presenting_concerns[:2])
            
        # 패턴 기반
        if patterns:
            dominant = patterns.get('dominant_emotion')
            if dominant:
                focus_areas.append(f"감정 패턴: {dominant}")
            
            triggers = patterns.get('common_triggers', {})
            if triggers:
                top_trigger = max(triggers, key=triggers.get)
                focus_areas.append(f"주요 트리거: {top_trigger}")
                
        # 현재 세션
        current_topic = session_data.get('current_topic')
        if current_topic:
            focus_areas.append(current_topic)
            
        return focus_areas[:5]

    def _generate_reasoning(
        self,
        approach: TherapeuticApproach,
        profile: UserProfile,
        patterns: Dict[str, Any]
    ) -> str:
        """추론 근거 생성"""
        reasons = []
        reasons.append(f"선택된 접근법: {approach.value}")
        
        if profile.presenting_concerns:
            reasons.append(f"주요 관심사: {', '.join(profile.presenting_concerns[:2])}")
            
        if patterns:
            reasons.append(f"감정 패턴: {patterns.get('dominant_emotion', 'unknown')}")
            
        return " | ".join(reasons)

    def _get_default_recommendation(
        self,
        language: str
    ) -> AdaptationRecommendation:
        """기본 권고"""
        cultural = self.cultural_adaptations.get(language, {})
        preferred = cultural.get('preferred_approaches', [TherapeuticApproach.CBT])
        
        return AdaptationRecommendation(
            recommended_approach=preferred[0] if preferred else TherapeuticApproach.CBT,
            confidence=0.6,
            reasoning="초기 세션 - 기본 접근법 적용",
            specific_techniques=["rapport_building", "assessment"],
            communication_adjustments=cultural.get('adaptations', [])[:3],
            pacing_recommendation="slow",
            focus_areas=["관계 형성", "문제 탐색"]
        )

    def update_progress(
        self,
        user_id: str,
        session_outcome: Dict[str, Any]
    ):
        """진행 상황 업데이트"""
        if user_id not in self.progress_tracking:
            return
            
        progress = self.progress_tracking[user_id]
        progress.total_sessions += 1
        
        # 참여도 업데이트
        if 'engagement' in session_outcome:
            progress.engagement_score = (
                progress.engagement_score * 0.8 + session_outcome['engagement'] * 0.2
            )
            
        # 치료적 동맹 업데이트
        if 'alliance' in session_outcome:
            progress.therapeutic_alliance_score = (
                progress.therapeutic_alliance_score * 0.8 + session_outcome['alliance'] * 0.2
            )
            
        # 증상 추적
        if 'symptom_level' in session_outcome:
            progress.symptom_trajectory.append({
                'date': datetime.now().isoformat(),
                'level': session_outcome['symptom_level']
            })

    def record_emotional_memory(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        trigger: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        coping_used: Optional[str] = None,
        effectiveness: Optional[float] = None
    ):
        """감정 기억 기록"""
        memory = EmotionalMemory(
            timestamp=datetime.now(),
            emotion=emotion,
            intensity=intensity,
            trigger=trigger,
            context=context or {},
            coping_used=coping_used,
            effectiveness=effectiveness
        )
        self.memory_store.store_memory(user_id, memory)

    def get_personalized_techniques(
        self,
        user_id: str,
        current_emotion: str,
        language: str
    ) -> List[Dict[str, str]]:
        """개인화된 기법 제안"""
        profile = self.user_profiles.get(user_id)
        patterns = self.memory_store.get_user_patterns(user_id)
        
        # 이전에 효과적이었던 대처 기법 찾기
        effective_coping = []
        if user_id in self.memory_store.memories:
            for memory in self.memory_store.memories[user_id]:
                if memory.effectiveness and memory.effectiveness > 0.7:
                    if memory.coping_used:
                        effective_coping.append(memory.coping_used)
                        
        # 기법 제안 생성
        techniques = []
        
        # 효과적이었던 기법 우선
        if effective_coping:
            techniques.append({
                "name": effective_coping[0],
                "reason": "이전에 효과적이었던 방법" if language == "ko" else "Previously effective",
                "type": "proven"
            })
            
        # 감정별 기법
        emotion_techniques = self._get_emotion_specific_techniques(
            current_emotion, language
        )
        techniques.extend(emotion_techniques)
        
        return techniques[:5]

    def _get_emotion_specific_techniques(
        self,
        emotion: str,
        language: str
    ) -> List[Dict[str, str]]:
        """감정별 기법"""
        techniques_db = {
            "anxiety": {
                "ko": [
                    {"name": "호흡 조절", "reason": "불안 감소에 효과적", "type": "grounding"},
                    {"name": "5-4-3-2-1 기법", "reason": "현재 순간 집중", "type": "grounding"},
                    {"name": "걱정 시간 정하기", "reason": "걱정 통제감 향상", "type": "cognitive"}
                ],
                "en": [
                    {"name": "Deep breathing", "reason": "Reduces anxiety", "type": "grounding"},
                    {"name": "5-4-3-2-1 technique", "reason": "Present moment focus", "type": "grounding"},
                    {"name": "Worry time", "reason": "Increases control", "type": "cognitive"}
                ]
            },
            "sadness": {
                "ko": [
                    {"name": "행동 활성화", "reason": "기분 향상에 도움", "type": "behavioral"},
                    {"name": "감사 일기", "reason": "긍정적 관점 증진", "type": "cognitive"},
                    {"name": "자기 연민 연습", "reason": "자기 비판 감소", "type": "emotional"}
                ],
                "en": [
                    {"name": "Behavioral activation", "reason": "Improves mood", "type": "behavioral"},
                    {"name": "Gratitude journal", "reason": "Positive perspective", "type": "cognitive"},
                    {"name": "Self-compassion", "reason": "Reduces self-criticism", "type": "emotional"}
                ]
            },
            "anger": {
                "ko": [
                    {"name": "타임아웃", "reason": "감정 조절 시간 확보", "type": "behavioral"},
                    {"name": "STOP 기법", "reason": "충동 조절", "type": "cognitive"},
                    {"name": "이완 훈련", "reason": "신체적 긴장 감소", "type": "physical"}
                ],
                "en": [
                    {"name": "Time-out", "reason": "Create space for regulation", "type": "behavioral"},
                    {"name": "STOP technique", "reason": "Impulse control", "type": "cognitive"},
                    {"name": "Relaxation training", "reason": "Reduce physical tension", "type": "physical"}
                ]
            }
        }
        
        emotion_lower = emotion.lower()
        for key in techniques_db:
            if key in emotion_lower:
                return techniques_db[key].get(language, techniques_db[key].get("en", []))
                
        # 기본 기법
        return techniques_db.get("anxiety", {}).get(language, [])[:2]

# 테스트 코드
if __name__ == "__main__":
    # 엔진 초기화
    engine = AdaptiveTherapyEngine()
    
    # 테스트 사용자 생성
    user_id = "test_user_001"
    profile = engine.create_user_profile(
        user_id=user_id,
        language="ko",
        initial_data={
            "presenting_concerns": ["anxiety", "work_stress"],
            "age_range": "30-39"
        }
    )
    
    print("=== 적응형 치료 엔진 테스트 ===\n")
    print(f"사용자 프로파일 생성: {profile.user_id}")
    
    # 적응 권고 테스트
    session_data = {
        "current_emotion": "anxiety",
        "emotion_intensity": 0.7,
        "current_topic": "직장 스트레스"
    }
    
    recommendation = engine.get_adaptation_recommendation(user_id, session_data)
    
    print(f"\n권고 접근법: {recommendation.recommended_approach.value}")
    print(f"신뢰도: {recommendation.confidence:.2f}")
    print(f"추론: {recommendation.reasoning}")
    print(f"기법: {recommendation.specific_techniques}")
    print(f"커뮤니케이션 조정: {recommendation.communication_adjustments}")
    
    # 개인화된 기법 테스트
    techniques = engine.get_personalized_techniques(
        user_id, "anxiety", "ko"
    )
    
    print(f"\n개인화된 기법 제안:")
    for tech in techniques:
        print(f" - {tech['name']}: {tech['reason']}")
