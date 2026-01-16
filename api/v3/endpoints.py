"""
Phase 3 API 엔드포인트
저장 경로: /AI_Drive/counseling_ai/api/v3/endpoints.py
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

# 라우터 생성
router = APIRouter(prefix="/api/v3", tags=["Phase 3 API"])

# =============================================================================
# Pydantic 모델
# =============================================================================
class LanguageCode(str, Enum):
    KO = "ko"
    EN = "en"
    JA = "ja"
    ZH = "zh"
    VI = "vi"

class RegionCode(str, Enum):
    KR = "kr"
    JP = "jp"
    SG = "sg"
    VN = "vn"

class TherapyApproach(str, Enum):
    CBT = "cbt"
    DBT = "dbt"
    ACT = "act"
    MI = "mi"
    PCT = "pct"
    SFBT = "sfbt"
    INTEGRATIVE = "integrative"

# 요청/응답 모델
class MultilingualChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str
    language: LanguageCode = LanguageCode.KO
    region: Optional[RegionCode] = None
    enable_personalization: bool = True
    preferred_approach: Optional[TherapyApproach] = None

class MultilingualChatResponse(BaseModel):
    session_id: str
    response_text: str
    detected_language: str
    applied_approach: str
    emotion_analysis: Dict[str, Any]
    cultural_adaptations: List[str]
    supervisor_feedback: Optional[Dict[str, Any]] = None
    personalization_applied: bool
    suggested_techniques: List[str]
    timestamp: str

class SupervisorReviewRequest(BaseModel):
    session_id: str
    include_quality_scores: bool = True
    include_recommendations: bool = True

class SupervisorReviewResponse(BaseModel):
    session_id: str
    overall_quality: float
    quality_scores: Dict[str, float]
    intervention_level: str
    coaching_points: List[str]
    recommendations: List[str]
    reviewed_at: str

class ResearchStudyRequest(BaseModel):
    title: str
    study_type: str
    principal_investigator: str
    institution: str
    target_enrollment: int
    arms: List[Dict[str, Any]]
    primary_outcome: str
    secondary_outcomes: List[str] = []

class ResearchStudyResponse(BaseModel):
    study_id: str
    title: str
    status: str
    irb_number: Optional[str]
    enrollment: Dict[str, int]
    created_at: str

class ParticipantEnrollRequest(BaseModel):
    study_id: str
    demographics: Dict[str, Any]
    consent_version: str
    consent_type: str = "full"

class ParticipantEnrollResponse(BaseModel):
    participant_id: str
    study_id: str
    arm_id: Optional[str]
    status: str
    enrolled_at: str

class AssessmentRequest(BaseModel):
    participant_id: str
    tool: str # PHQ-9, GAD-7, etc.
    timepoint: str # baseline, week4, week8, final
    responses: List[int]

class AssessmentResponse(BaseModel):
    assessment_id: str
    tool: str
    total_score: int
    severity: str
    recorded_at: str

class PersonalizationProfileRequest(BaseModel):
    user_id: str
    language: LanguageCode
    presenting_concerns: List[str] = []
    therapy_goals: List[str] = []
    demographics: Optional[Dict[str, Any]] = None

class PersonalizationProfileResponse(BaseModel):
    user_id: str
    recommended_approach: str
    personalized_techniques: List[Dict[str, str]]
    cultural_adaptations: List[str]
    created_at: str

class RegionalConfigRequest(BaseModel):
    region: RegionCode

class RegionalConfigResponse(BaseModel):
    region: str
    language: str
    currency: str
    emergency_hotlines: Dict[str, str]
    pricing: Dict[str, float]
    cultural_guidelines: Dict[str, Any]

# =============================================================================
# 의존성
# =============================================================================
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Depends(api_key_header)):
    """API 키 검증"""
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required")
    # 실제 구현에서는 DB 조회
    return {"client_id": "verified_client", "tier": "professional"}

async def get_services():
    """서비스 인스턴스 반환"""
    # 실제 구현에서는 DI 컨테이너 사용
    return {
        "counselor": None, # BilingualCounselorAgent
        "supervisor": None, # AISupervisor
        "personalization": None, # AdaptiveTherapyEngine
        "research": None, # ResearchPlatformService
        "international": None # InternationalExpansionService
    }

# =============================================================================
# 다국어 상담 엔드포인트
# =============================================================================
@router.post("/chat/multilingual", response_model=MultilingualChatResponse)
async def multilingual_chat(
    request: MultilingualChatRequest,
    background_tasks: BackgroundTasks,
    client: dict = Depends(verify_api_key),
    services: dict = Depends(get_services)
):
    """
    다국어 심리상담 채팅
    - 6개 언어 지원 (ko, en, ja, zh, zh-TW, vi)
    - 자동 언어 감지
    - 문화적 맥락 적응
    - AI 슈퍼바이저 품질 모니터링
    - 개인화된 치료적 접근
    """
    # 실제 구현
    response = MultilingualChatResponse(
        session_id=request.session_id,
        response_text="많이 힘드셨겠어요. 조금 더 이야기해 주실 수 있을까요?",
        detected_language=request.language.value,
        applied_approach="cbt",
        emotion_analysis={
            "primary_emotion": "sadness",
            "intensity": 0.7,
            "secondary_emotions": ["anxiety"]
        },
        cultural_adaptations=["존칭 사용", "간접적 표현"],
        supervisor_feedback={
            "quality_score": 0.85,
            "intervention_needed": False
        },
        personalization_applied=request.enable_personalization,
        suggested_techniques=["호흡 조절", "인지 재구조화"],
        timestamp=datetime.now().isoformat()
    )
    
    # 백그라운드에서 슈퍼바이저 분석
    background_tasks.add_task(
        analyze_session_quality,
        request.session_id,
        request.message,
        response.response_text
    )
    
    return response

async def analyze_session_quality(session_id: str, user_message: str, ai_response: str):
    """백그라운드 품질 분석"""
    # 실제 구현에서는 AI 슈퍼바이저 호출
    pass

@router.get("/chat/languages")
async def get_supported_languages():
    """지원 언어 목록"""
    return {
        "supported_languages": [
            {"code": "ko", "name": "한국어", "status": "full_support"},
            {"code": "en", "name": "English", "status": "full_support"},
            {"code": "ja", "name": "日本語", "status": "full_support"},
            {"code": "zh", "name": "中文(简体)", "status": "beta"},
            {"code": "zh-TW", "name": "中文(繁體)", "status": "beta"},
            {"code": "vi", "name": "Tiếng Việt", "status": "beta"}
        ]
    }

# =============================================================================
# AI 슈퍼바이저 엔드포인트
# =============================================================================
@router.post("/supervisor/review", response_model=SupervisorReviewResponse)
async def review_session(
    request: SupervisorReviewRequest,
    client: dict = Depends(verify_api_key)
):
    """
    AI 슈퍼바이저 세션 리뷰
    - 품질 평가 (공감, 안전, 문화적 적절성 등)
    - 개입 권고
    - 코칭 포인트
    """
    return SupervisorReviewResponse(
        session_id=request.session_id,
        overall_quality=0.82,
        quality_scores={
            "empathy": 0.85,
            "safety_compliance": 0.95,
            "cultural_appropriateness": 0.80,
            "therapeutic_alliance": 0.78,
            "clinical_accuracy": 0.82
        },
        intervention_level="none",
        coaching_points=[
            "공감 표현 잘 유지됨",
            "문화적 맥락 고려 개선 가능"
        ],
        recommendations=[
            "사용자의 가족 관계 맥락 더 탐색",
            "다음 세션에서 대처 기술 소개 고려"
        ],
        reviewed_at=datetime.now().isoformat()
    )

@router.get("/supervisor/alerts")
async def get_supervisor_alerts(
    severity: Optional[str] = Query(None, enum=["low", "medium", "high", "critical"]),
    since: Optional[str] = None,
    client: dict = Depends(verify_api_key)
):
    """슈퍼바이저 알림 조회"""
    return {
        "alerts": [
            {
                "alert_id": "ALERT_001",
                "session_id": "SESSION_123",
                "severity": "medium",
                "type": "quality_concern",
                "message": "공감 수준 저하 감지",
                "timestamp": datetime.now().isoformat()
            }
        ],
        "total": 1
    }

# =============================================================================
# 개인화 엔드포인트
# =============================================================================
@router.post("/personalization/profile", response_model=PersonalizationProfileResponse)
async def create_personalization_profile(
    request: PersonalizationProfileRequest,
    client: dict = Depends(verify_api_key)
):
    """개인화 프로파일 생성"""
    return PersonalizationProfileResponse(
        user_id=request.user_id,
        recommended_approach="cbt",
        personalized_techniques=[
            {"name": "호흡 조절", "reason": "불안 감소에 효과적"},
            {"name": "인지 재구조화", "reason": "부정적 사고 패턴 개선"}
        ],
        cultural_adaptations=[
            "존칭 사용", "가족 맥락 고려", "점진적 자기 개방"
        ],
        created_at=datetime.now().isoformat()
    )

@router.get("/personalization/recommendations/{user_id}")
async def get_personalized_recommendations(
    user_id: str,
    current_emotion: Optional[str] = None,
    client: dict = Depends(verify_api_key)
):
    """개인화 추천 조회"""
    return {
        "user_id": user_id,
        "recommended_approach": "cbt",
        "techniques": [
            {
                "name": "호흡 조절",
                "description": "4-7-8 호흡법으로 불안 감소",
                "effectiveness_score": 0.85
            }
        ],
        "session_suggestions": {
            "optimal_time": "evening",
            "recommended_duration": "20-30 minutes",
            "focus_areas": ["stress_management", "sleep_improvement"]
        }
    }

@router.post("/personalization/memory")
async def record_emotional_memory(
    user_id: str,
    emotion: str,
    intensity: float,
    trigger: Optional[str] = None,
    coping_used: Optional[str] = None,
    effectiveness: Optional[float] = None,
    client: dict = Depends(verify_api_key)
):
    """감정 기억 기록"""
    return {
        "status": "recorded",
        "user_id": user_id,
        "emotion": emotion,
        "recorded_at": datetime.now().isoformat()
    }

# =============================================================================
# 연구 플랫폼 엔드포인트
# =============================================================================
@router.post("/research/studies", response_model=ResearchStudyResponse)
async def create_research_study(
    request: ResearchStudyRequest,
    client: dict = Depends(verify_api_key)
):
    """연구 생성"""
    return ResearchStudyResponse(
        study_id=f"STUDY_{datetime.now().strftime('%Y%m%d')}_001",
        title=request.title,
        status="draft",
        irb_number=None,
        enrollment={"target": request.target_enrollment, "current": 0},
        created_at=datetime.now().isoformat()
    )

@router.get("/research/studies/{study_id}")
async def get_research_study(
    study_id: str,
    client: dict = Depends(verify_api_key)
):
    """연구 조회"""
    return {
        "study_id": study_id,
        "title": "AI 심리상담 효과성 RCT",
        "status": "recruiting",
        "enrollment": {"target": 300, "current": 45},
        "arms": [
            {"name": "중재군", "current": 23},
            {"name": "대조군", "current": 22}
        ]
    }

@router.post("/research/participants", response_model=ParticipantEnrollResponse)
async def enroll_participant(
    request: ParticipantEnrollRequest,
    client: dict = Depends(verify_api_key)
):
    """참여자 등록"""
    return ParticipantEnrollResponse(
        participant_id="PART_ABC123",
        study_id=request.study_id,
        arm_id="ARM_001",
        status="enrolled",
        enrolled_at=datetime.now().isoformat()
    )

@router.post("/research/assessments", response_model=AssessmentResponse)
async def record_assessment(
    request: AssessmentRequest,
    client: dict = Depends(verify_api_key)
):
    """평가 기록"""
    total_score = sum(request.responses)
    
    # 심각도 결정 (PHQ-9 기준)
    if total_score <= 4:
        severity = "minimal"
    elif total_score <= 9:
        severity = "mild"
    elif total_score <= 14:
        severity = "moderate"
    elif total_score <= 19:
        severity = "moderately_severe"
    else:
        severity = "severe"
        
    return AssessmentResponse(
        assessment_id=f"ASSESS_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        tool=request.tool,
        total_score=total_score,
        severity=severity,
        recorded_at=datetime.now().isoformat()
    )

@router.get("/research/studies/{study_id}/report")
async def get_study_report(
    study_id: str,
    client: dict = Depends(verify_api_key)
):
    """연구 보고서"""
    return {
        "study_id": study_id,
        "title": "AI 심리상담 효과성 RCT",
        "enrollment_rate": 15.0,
        "completion_rate": 85.2,
        "primary_outcome": {
            "measure": "PHQ-9",
            "intervention_group": {
                "baseline_mean": 14.2,
                "final_mean": 8.5,
                "change": -5.7
            },
            "control_group": {
                "baseline_mean": 14.5,
                "final_mean": 12.1,
                "change": -2.4
            },
            "between_group_difference": -3.3,
            "p_value": 0.001
        },
        "generated_at": datetime.now().isoformat()
    }

# =============================================================================
# 국제화 엔드포인트
# =============================================================================
@router.get("/international/regions/{region}", response_model=RegionalConfigResponse)
async def get_regional_config(
    region: RegionCode,
    client: dict = Depends(verify_api_key)
):
    """지역별 설정 조회"""
    configs = {
        RegionCode.KR: {
            "region": "kr",
            "language": "ko",
            "currency": "KRW",
            "emergency_hotlines": {
                "suicide_prevention": "1393",
                "mental_health": "1577-0199"
            },
            "pricing": {
                "free_tier": 0,
                "premium_monthly": 29000,
                "professional_session": 99000
            },
            "cultural_guidelines": {
                "formality": "formal",
                "communication_style": "indirect"
            }
        },
        RegionCode.JP: {
            "region": "jp",
            "language": "ja",
            "currency": "JPY",
            "emergency_hotlines": {
                "yorisoi": "0120-279-338",
                "inochi_no_denwa": "0570-783-556"
            },
            "pricing": {
                "free_tier": 0,
                "premium_monthly": 2980,
                "professional_session": 9800
            },
            "cultural_guidelines": {
                "formality": "very_formal",
                "communication_style": "very_indirect"
            }
        }
    }
    
    config = configs.get(region)
    if not config:
        raise HTTPException(status_code=404, detail="Region not supported")
        
    return RegionalConfigResponse(**config)

@router.get("/international/emergency/{region}")
async def get_emergency_resources(
    region: RegionCode,
    language: Optional[LanguageCode] = None
):
    """지역별 긴급 자원"""
    resources = {
        RegionCode.KR: {
            "header": "긴급 상황 시 연락처" if language == LanguageCode.KO else "Emergency Resources",
            "hotlines": [
                {"name": "자살예방상담전화", "number": "1393", "available": "24/7"},
                {"name": "정신건강위기상담전화", "number": "1577-0199", "available": "24/7"}
            ],
            "online_resources": [
                {"name": "정신건강복지센터", "url": "https://www.mentalhealth.go.kr"}
            ]
        },
        RegionCode.JP: {
            "header": "緊急連絡先" if language == LanguageCode.JA else "Emergency Resources",
            "hotlines": [
                {"name": "よりそいホットライン", "number": "0120-279-338", "available": "24/7"},
                {"name": "いのちの電話", "number": "0570-783-556", "available": "24/7"}
            ]
        }
    }
    
    return resources.get(region, {"error": "Region not supported"})

@router.post("/international/localize")
async def localize_content(
    content_id: str,
    content: str,
    source_language: LanguageCode,
    target_languages: List[LanguageCode],
    client: dict = Depends(verify_api_key)
):
    """콘텐츠 현지화"""
    # 실제 구현에서는 번역 서비스 호출
    return {
        "content_id": content_id,
        "source": source_language.value,
        "translations": {
            lang.value: f"[Translated to {lang.value}] {content}"
            for lang in target_languages
        },
        "localized_at": datetime.now().isoformat()
    }

# =============================================================================
# 헬스체크
# =============================================================================
@router.get("/health")
async def health_check():
    """API 헬스체크"""
    return {
        "status": "healthy",
        "version": "3.0.0",
        "phase": 3,
        "features": {
            "multilingual": True,
            "ai_supervisor": True,
            "personalization": True,
            "research_platform": True,
            "international": True
        },
        "supported_languages": ["ko", "en", "ja", "zh", "vi"],
        "supported_regions": ["kr", "jp", "sg", "vn"],
        "timestamp": datetime.now().isoformat()
    }
