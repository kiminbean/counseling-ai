"""
상담 에이전트 서비스 (Phase 1-3 통합)
저장 경로: services/counselor_agent.py
"""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid

from models.emotion_classifier import EmotionClassifier, EmotionResult
from models.response_generator import ResponseGenerator, CounselingResponse, TherapeuticApproach


class SessionStatus(Enum):
    """세션 상태"""
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"
    CRISIS = "crisis"


@dataclass
class ConversationTurn:
    """대화 턴"""
    turn_id: str
    user_message: str
    ai_response: str
    emotion: str
    emotion_confidence: float
    timestamp: datetime
    is_crisis: bool = False


@dataclass
class Session:
    """상담 세션"""
    session_id: str
    user_id: str
    language: str
    status: SessionStatus
    created_at: datetime
    turns: List[ConversationTurn] = field(default_factory=list)
    therapeutic_approach: TherapeuticApproach = TherapeuticApproach.CBT
    
    def add_turn(self, turn: ConversationTurn):
        self.turns.append(turn)
    
    @property
    def turn_count(self) -> int:
        return len(self.turns)
    
    @property
    def emotion_history(self) -> List[str]:
        return [turn.emotion for turn in self.turns]


class CounselorAgent:
    """
    통합 상담 에이전트
    
    Features:
    - 다국어 지원
    - 감정 분석 및 추적
    - 위기 대응
    - 세션 관리
    - 치료적 접근법 적용
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.emotion_classifier = EmotionClassifier(config)
        self.response_generator = ResponseGenerator(config)
        self.sessions: Dict[str, Session] = {}
        
        print("CounselorAgent initialized.")
    
    def create_session(
        self, 
        user_id: str,
        language: str = "ko",
        approach: TherapeuticApproach = TherapeuticApproach.CBT
    ) -> Session:
        """새 세션 생성"""
        session_id = f"session_{uuid.uuid4().hex[:8]}"
        
        session = Session(
            session_id=session_id,
            user_id=user_id,
            language=language,
            status=SessionStatus.ACTIVE,
            created_at=datetime.now(),
            therapeutic_approach=approach
        )
        
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """세션 조회"""
        return self.sessions.get(session_id)
    
    def get_or_create_session(
        self, 
        session_id: str,
        user_id: str,
        language: str = "ko"
    ) -> Session:
        """세션 조회 또는 생성"""
        if session_id in self.sessions:
            return self.sessions[session_id]
        
        session = Session(
            session_id=session_id,
            user_id=user_id,
            language=language,
            status=SessionStatus.ACTIVE,
            created_at=datetime.now()
        )
        self.sessions[session_id] = session
        return session
    
    async def process_message(
        self,
        user_id: str,
        message: str,
        session_id: str = None,
        language: str = "ko"
    ) -> Dict[str, Any]:
        """
        메시지 처리
        
        Args:
            user_id: 사용자 ID
            message: 사용자 메시지
            session_id: 세션 ID
            language: 언어 코드
        
        Returns:
            처리 결과
        """
        # 세션 관리
        if session_id:
            session = self.get_or_create_session(session_id, user_id, language)
        else:
            session = self.create_session(user_id, language)
        
        # 1. 감정 분석
        emotion_result: EmotionResult = self.emotion_classifier.predict(message, language)
        
        # 2. 위기 상황 확인
        if emotion_result.is_crisis:
            session.status = SessionStatus.CRISIS
        
        # 3. 응답 생성
        response: CounselingResponse = self.response_generator.generate(
            user_text=message,
            emotion=emotion_result.emotion,
            language=language,
            is_crisis=emotion_result.is_crisis,
            approach=session.therapeutic_approach
        )
        
        # 4. 대화 턴 기록
        turn = ConversationTurn(
            turn_id=f"turn_{uuid.uuid4().hex[:6]}",
            user_message=message,
            ai_response=response.text,
            emotion=emotion_result.emotion,
            emotion_confidence=emotion_result.confidence,
            timestamp=datetime.now(),
            is_crisis=emotion_result.is_crisis
        )
        session.add_turn(turn)
        
        # 5. 결과 반환
        result = {
            "session_id": session.session_id,
            "user_id": user_id,
            "response": response.text,
            "emotion": {
                "label": emotion_result.emotion,
                "confidence": emotion_result.confidence,
                "intensity": emotion_result.intensity,
                "secondary": emotion_result.secondary_emotions
            },
            "is_crisis": emotion_result.is_crisis,
            "suggested_techniques": response.suggested_techniques,
            "approach": response.approach,
            "turn_count": session.turn_count
        }
        
        # 위기 상황 시 안전 자원 추가
        if emotion_result.is_crisis:
            result["safety_resources"] = response.safety_resources
            result["crisis_keywords"] = emotion_result.crisis_keywords_detected
        
        return result
    
    async def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """세션 요약"""
        session = self.get_session(session_id)
        if not session:
            return {"error": "Session not found"}
        
        # 감정 통계
        emotions = session.emotion_history
        emotion_counts = {}
        for e in emotions:
            emotion_counts[e] = emotion_counts.get(e, 0) + 1
        
        dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"
        
        # 위기 발생 여부
        crisis_turns = [t for t in session.turns if t.is_crisis]
        
        return {
            "session_id": session.session_id,
            "user_id": session.user_id,
            "status": session.status.value,
            "total_turns": session.turn_count,
            "duration_minutes": (datetime.now() - session.created_at).seconds // 60,
            "dominant_emotion": dominant_emotion,
            "emotion_distribution": emotion_counts,
            "crisis_detected": len(crisis_turns) > 0,
            "crisis_count": len(crisis_turns),
            "therapeutic_approach": session.therapeutic_approach.value
        }
    
    def end_session(self, session_id: str) -> Dict[str, Any]:
        """세션 종료"""
        session = self.get_session(session_id)
        if not session:
            return {"error": "Session not found"}
        
        session.status = SessionStatus.ENDED
        return {"session_id": session_id, "status": "ended"}


# 테스트
if __name__ == "__main__":
    import asyncio
    
    async def main():
        agent = CounselorAgent()
        
        # 테스트 대화
        test_messages = [
            ("user001", "안녕하세요, 요즘 너무 힘들어요"),
            ("user001", "직장에서 스트레스를 많이 받고 있어요"),
            ("user001", "잠도 잘 못 자고 불안해요")
        ]
        
        session_id = None
        
        for user_id, message in test_messages:
            result = await agent.process_message(
                user_id=user_id,
                message=message,
                session_id=session_id
            )
            
            if session_id is None:
                session_id = result["session_id"]
            
            print(f"\n사용자: {message}")
            print(f"AI: {result['response']}")
            print(f"감정: {result['emotion']['label']} ({result['emotion']['confidence']:.2f})")
        
        # 세션 요약
        summary = await agent.get_session_summary(session_id)
        print(f"\n=== 세션 요약 ===")
        print(f"총 대화: {summary['total_turns']}턴")
        print(f"주요 감정: {summary['dominant_emotion']}")
        print(f"감정 분포: {summary['emotion_distribution']}")
    
    asyncio.run(main())
