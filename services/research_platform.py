"""
연구 플랫폼 서비스
Phase 3: 임상 연구 지원 및 데이터 분석
저장 경로: /AI_Drive/counseling_ai/services/research_platform.py
"""
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import hashlib
import json
import random
import string
from collections import defaultdict
import numpy as np

class StudyType(Enum):
    """연구 유형"""
    RCT = "randomized_controlled_trial"
    OBSERVATIONAL = "observational"
    COHORT = "cohort_study"
    CASE_CONTROL = "case_control"
    PILOT = "pilot_study"

class StudyStatus(Enum):
    """연구 상태"""
    DRAFT = "draft"
    IRB_PENDING = "irb_pending"
    IRB_APPROVED = "approved"
    RECRUITING = "recruiting"
    ACTIVE = "active"
    COMPLETED = "completed"
    TERMINATED = "terminated"

class ParticipantStatus(Enum):
    """참여자 상태"""
    SCREENING = "screening"
    ENROLLED = "enrolled"
    ACTIVE = "active"
    COMPLETED = "completed"
    WITHDRAWN = "withdrawn"
    LOST_TO_FOLLOWUP = "lost_to_followup"

class DataExportFormat(Enum):
    """데이터 내보내기 형식"""
    CSV = "csv"
    JSON = "json"
    SPSS = "spss"
    STATA = "stata"
    R_DATA = "r_data"
    EXCEL = "excel"

@dataclass
class ConsentRecord:
    """동의 기록"""
    participant_id: str
    study_id: str
    consent_version: str
    consent_date: datetime
    consent_type: str # full, data_only, anonymous
    ip_hash: str # 익명화된 IP
    signature_method: str
    withdrawal_date: Optional[datetime] = None

@dataclass
class StudyArm:
    """연구 그룹(arm)"""
    arm_id: str
    name: str
    description: str
    intervention: str
    target_size: int
    current_size: int = 0
    allocation_ratio: float = 1.0

@dataclass
class Study:
    """연구 정의"""
    study_id: str
    title: str
    study_type: StudyType
    status: StudyStatus
    
    # 연구 정보
    principal_investigator: str
    institution: str
    irb_number: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # 연구 설계
    arms: List[StudyArm] = field(default_factory=list)
    randomization_enabled: bool = False
    blinding_type: str = "none" # none, single, double
    
    # 참여자
    target_enrollment: int = 0
    current_enrollment: int = 0
    
    # 결과 측정
    primary_outcome: str = ""
    secondary_outcomes: List[str] = field(default_factory=list)
    assessment_schedule: Dict[str, int] = field(default_factory=dict) # name: week
    
    # 메타데이터
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class Participant:
    """연구 참여자"""
    participant_id: str # 익명화된 ID
    study_id: str
    arm_id: Optional[str] = None
    status: ParticipantStatus
    
    # 익명화된 정보
    enrollment_date: datetime
    demographics: Dict[str, Any] # 익명화된 인구통계
    
    # 데이터
    assessments: List[Dict[str, Any]] = field(default_factory=list)
    session_count: int = 0
    
    # 추적
    last_activity: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    withdrawal_reason: Optional[str] = None

@dataclass
class ResearchDataset:
    """연구 데이터셋"""
    dataset_id: str
    study_id: str
    created_at: datetime
    
    # 데이터
    participants: int
    variables: List[str]
    records: int
    
    # 품질
    completeness: float
    anonymization_level: str # k-anonymity level
    
    # 접근
    access_level: str # public, restricted, private
    doi: Optional[str] = None

class AnonymizationEngine:
    """익명화 엔진"""
    def __init__(self, k_anonymity: int = 5):
        self.k_anonymity = k_anonymity
        self.salt = self._generate_salt()
    
    def _generate_salt(self) -> str:
        """솔트 생성"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

    def anonymize_id(self, original_id: str) -> str:
        """ID 익명화"""
        hash_input = f"{original_id}{self.salt}"
        return hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    def anonymize_demographics(self, demographics: Dict[str, Any]) -> Dict[str, Any]:
        """인구통계 익명화"""
        anonymized = {}
        
        # 나이 -> 연령대
        if 'age' in demographics:
            age = demographics['age']
            if age < 20:
                anonymized['age_group'] = '< 20'
            elif age < 30:
                anonymized['age_group'] = '20-29'
            elif age < 40:
                anonymized['age_group'] = '30-39'
            elif age < 50:
                anonymized['age_group'] = '40-49'
            elif age < 60:
                anonymized['age_group'] = '50-59'
            else:
                anonymized['age_group'] = '60+'
                
        # 성별 (그대로)
        if 'gender' in demographics:
            anonymized['gender'] = demographics['gender']
            
        # 지역 -> 대분류
        if 'region' in demographics:
            region = demographics['region']
            region_mapping = {
                '서울': '수도권', '경기': '수도권', '인천': '수도권',
                '부산': '영남권', '대구': '영남권', '울산': '영남권', '경상': '영남권',
                '광주': '호남권', '전라': '호남권',
                '대전': '충청권', '충청': '충청권',
                '강원': '강원권',
                '제주': '제주권'
            }
            
            for key, value in region_mapping.items():
                if key in region:
                    anonymized['region_group'] = value
                    break
            else:
                anonymized['region_group'] = '기타'
                
        return anonymized

    def anonymize_text(self, text: str) -> str:
        """텍스트 익명화 (PII 제거)"""
        import re
        
        # 이름 패턴
        text = re.sub(r'[가-힣]{2,4}(?=씨|님|선생|과장|부장|대리)', '[이름]', text)
        
        # 전화번호
        text = re.sub(r'\d{2,3}-\d{3,4}-\d{4}', '[전화번호]', text)
        text = re.sub(r'\d{10,11}', '[전화번호]', text)
        
        # 이메일
        text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[이메일]', text)
        
        # 주소
        text = re.sub(r'[가-힣]+(?:시|도)\s*[가-힣]+(?:구|군|시)', '[주소]', text)
        
        # 날짜 (구체적인 날짜 -> 상대적 시간)
        text = re.sub(r'\d{4}년\s*\d{1,2}월\s*\d{1,2}일', '[날짜]', text)
        text = re.sub(r'\d{4}-\d{2}-\d{2}', '[날짜]', text)
        
        return text

    def check_k_anonymity(self, dataset: List[Dict[str, Any]], quasi_identifiers: List[str]) -> bool:
        """k-익명성 확인"""
        # 준식별자 조합별 그룹화
        groups = defaultdict(list)
        for record in dataset:
            key = tuple(record.get(qi, None) for qi in quasi_identifiers)
            groups[key].append(record)
            
        # 모든 그룹이 k 이상인지 확인
        for key, group in groups.items():
            if len(group) < self.k_anonymity:
                return False
        return True

    def generalize_for_k_anonymity(self, dataset: List[Dict[str, Any]], quasi_identifiers: List[str]) -> List[Dict[str, Any]]:
        """k-익명성을 위한 일반화"""
        # 간단한 일반화 전략
        generalized = []
        for record in dataset:
            new_record = record.copy()
            for qi in quasi_identifiers:
                if qi == 'age_group':
                    # 연령대 더 넓게
                    age_group = new_record.get(qi, '')
                    if age_group in ['20-29', '30-39']:
                        new_record[qi] = '20-39'
                    elif age_group in ['40-49', '50-59']:
                        new_record[qi] = '40-59'
                elif qi == 'region_group':
                    # 지역 더 넓게
                    if new_record.get(qi) not in ['수도권', '기타']:
                        new_record[qi] = '비수도권'
            generalized.append(new_record)
        return generalized

class RandomizationService:
    """무작위 배정 서비스"""
    def __init__(self, seed: Optional[int] = None):
        self.rng = random.Random(seed)
        self.allocation_log: Dict[str, List[str]] = defaultdict(list)

    def simple_randomization(self, study_id: str, arms: List[StudyArm]) -> str:
        """단순 무작위 배정"""
        total_ratio = sum(arm.allocation_ratio for arm in arms)
        rand_value = self.rng.random() * total_ratio
        
        cumulative = 0
        for arm in arms:
            cumulative += arm.allocation_ratio
            if rand_value <= cumulative:
                self.allocation_log[study_id].append(arm.arm_id)
                return arm.arm_id
        return arms[-1].arm_id

    def block_randomization(self, study_id: str, arms: List[StudyArm], block_size: int = 4) -> str:
        """블록 무작위 배정"""
        # 현재 블록 상태 확인
        current_allocations = self.allocation_log.get(study_id, [])
        block_position = len(current_allocations) % block_size
        
        if block_position == 0:
            # 새 블록 생성
            block = []
            for arm in arms:
                count = int(block_size * arm.allocation_ratio / sum(a.allocation_ratio for a in arms))
                block.extend([arm.arm_id] * max(1, count))
            
            # 블록 크기 조정
            while len(block) < block_size:
                block.append(self.rng.choice([a.arm_id for a in arms]))
                
            self.rng.shuffle(block)
            self._current_block = block
            
        selected = self._current_block[block_position]
        self.allocation_log[study_id].append(selected)
        return selected

    def stratified_randomization(self, study_id: str, arms: List[StudyArm], strata: Dict[str, str]) -> str:
        """층화 무작위 배정"""
        strata_key = "_".join(f"{k}:{v}" for k, v in sorted(strata.items()))
        strata_study_id = f"{study_id}_{strata_key}"
        return self.block_randomization(strata_study_id, arms)

    def get_allocation_balance(self, study_id: str, arms: List[StudyArm]) -> Dict[str, Dict[str, Any]]:
        """배정 균형 확인"""
        allocations = self.allocation_log.get(study_id, [])
        balance = {}
        for arm in arms:
            count = allocations.count(arm.arm_id)
            expected = len(allocations) * (arm.allocation_ratio / sum(a.allocation_ratio for a in arms))
            balance[arm.arm_id] = {
                'count': count,
                'expected': expected,
                'difference': count - expected,
                'percentage': (count / len(allocations) * 100) if allocations else 0
            }
        return balance

class OutcomeAssessment:
    """결과 측정 도구"""
    # 표준화된 평가 도구
    ASSESSMENT_TOOLS = {
        'PHQ-9': {
            'name': 'Patient Health Questionnaire-9',
            'purpose': 'Depression screening',
            'items': 9,
            'score_range': (0, 27),
            'severity_cutoffs': {
                'minimal': (0, 4),
                'mild': (5, 9),
                'moderate': (10, 14),
                'moderately_severe': (15, 19),
                'severe': (20, 27)
            },
            'questions': {
                'ko': [
                    "일을 하는 것에 대한 흥미나 즐거움이 거의 없음",
                    "기분이 가라앉거나 우울하거나 희망이 없음",
                    "잠들기 어렵거나 자주 깸, 또는 너무 많이 잠",
                    "피곤하거나 기운이 없음",
                    "식욕이 줄거나 과식함",
                    "자신을 나쁘게 느끼거나 실패자라고 느낌",
                    "신문을 읽거나 TV를 볼 때 집중하기 어려움",
                    "다른 사람이 알아챌 정도로 느리게 움직이거나 반대로 안절부절",
                    "차라리 죽는 것이 낫겠다는 생각"
                ],
                'en': [
                    "Little interest or pleasure in doing things",
                    "Feeling down, depressed, or hopeless",
                    "Trouble falling/staying asleep, or sleeping too much",
                    "Feeling tired or having little energy",
                    "Poor appetite or overeating",
                    "Feeling bad about yourself",
                    "Trouble concentrating on things",
                    "Moving or speaking slowly/being fidgety",
                    "Thoughts that you would be better off dead"
                ]
            }
        },
        'GAD-7': {
            'name': 'Generalized Anxiety Disorder-7',
            'purpose': 'Anxiety screening',
            'items': 7,
            'score_range': (0, 21),
            'severity_cutoffs': {
                'minimal': (0, 4),
                'mild': (5, 9),
                'moderate': (10, 14),
                'severe': (15, 21)
            },
            'questions': {
                'ko': [
                    "초조하거나 불안하거나 조마조마하게 느낀다",
                    "걱정하는 것을 멈추거나 조절할 수가 없다",
                    "여러 가지 것들에 대해 너무 많이 걱정한다",
                    "편하게 있기가 어렵다",
                    "쉽게 짜증이 나거나 쉽게 성을 내게 된다",
                    "너무 안절부절 못해서 가만히 있기가 어렵다",
                    "마치 무서운 일이 생길 것처럼 두렵게 느껴진다"
                ],
                'en': [
                    "Feeling nervous, anxious, or on edge",
                    "Not being able to stop or control worrying",
                    "Worrying too much about different things",
                    "Trouble relaxing",
                    "Being so restless that it's hard to sit still",
                    "Becoming easily annoyed or irritable",
                    "Feeling afraid as if something awful might happen"
                ]
            }
        },
        'K-10': {
            'name': 'Kessler Psychological Distress Scale',
            'purpose': 'Psychological distress',
            'items': 10,
            'score_range': (10, 50),
            'severity_cutoffs': {
                'low': (10, 15),
                'moderate': (16, 21),
                'high': (22, 29),
                'very_high': (30, 50)
            }
        },
        'WAI-SR': {
            'name': 'Working Alliance Inventory-Short Revised',
            'purpose': 'Therapeutic alliance',
            'items': 12,
            'score_range': (12, 60),
            'subscales': ['task', 'bond', 'goal']
        }
    }

    def __init__(self):
        self.responses: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    def create_assessment(self, participant_id: str, tool_name: str, timepoint: str, language: str = 'ko') -> Dict[str, Any]:
        """평가 생성"""
        tool = self.ASSESSMENT_TOOLS.get(tool_name)
        if not tool:
            raise ValueError(f"Unknown assessment tool: {tool_name}")
            
        questions = tool.get('questions', {}).get(language, tool.get('questions', {}).get('en', []))
        
        return {
            'assessment_id': f"{participant_id}_{tool_name}_{timepoint}_{datetime.now().strftime('%Y%m%d')}",
            'participant_id': participant_id,
            'tool': tool_name,
            'timepoint': timepoint,
            'questions': questions,
            'created_at': datetime.now().isoformat(),
            'status': 'pending'
        }

    def score_assessment(self, tool_name: str, responses: List[int]) -> Dict[str, Any]:
        """평가 점수 계산"""
        tool = self.ASSESSMENT_TOOLS.get(tool_name)
        if not tool:
            raise ValueError(f"Unknown assessment tool: {tool_name}")
            
        total_score = sum(responses)
        
        # 심각도 결정
        severity = 'unknown'
        cutoffs = tool.get('severity_cutoffs', {})
        for level, (low, high) in cutoffs.items():
            if low <= total_score <= high:
                severity = level
                break
                
        return {
            'tool': tool_name,
            'total_score': total_score,
            'max_score': tool['score_range'][1],
            'severity': severity,
            'item_responses': responses,
            'scored_at': datetime.now().isoformat()
        }

    def calculate_change(self, baseline_score: int, followup_score: int, tool_name: str) -> Dict[str, Any]:
        """변화량 계산"""
        tool = self.ASSESSMENT_TOOLS.get(tool_name)
        if not tool:
            raise ValueError(f"Unknown assessment tool: {tool_name}")
            
        absolute_change = followup_score - baseline_score
        percent_change = (absolute_change / baseline_score * 100) if baseline_score > 0 else 0
        
        # 임상적 유의미한 변화 (일반적으로 50% 감소)
        clinically_significant = percent_change <= -50
        
        # 신뢰 가능한 변화 (Reliable Change Index 기준)
        # 간단한 근사: 5점 이상 변화
        reliable_change = abs(absolute_change) >= 5
        
        return {
            'baseline': baseline_score,
            'followup': followup_score,
            'absolute_change': absolute_change,
            'percent_change': round(percent_change, 1),
            'clinically_significant': clinically_significant,
            'reliable_change': reliable_change,
            'direction': 'improved' if absolute_change < 0 else ('worsened' if absolute_change > 0 else 'unchanged')
        }

class ResearchPlatformService:
    """
    연구 플랫폼 서비스
    Features:
    - 연구 생성 및 관리
    - 참여자 등록 및 무작위 배정
    - 데이터 수집 및 익명화
    - 결과 분석 및 내보내기
    """
    def __init__(self):
        self.studies: Dict[str, Study] = {}
        self.participants: Dict[str, Participant] = {}
        self.consents: Dict[str, ConsentRecord] = {}
        self.datasets: Dict[str, ResearchDataset] = {}
        
        self.anonymization = AnonymizationEngine(k_anonymity=5)
        self.randomization = RandomizationService()
        self.assessment = OutcomeAssessment()

    async def create_study(
        self,
        title: str,
        study_type: StudyType,
        principal_investigator: str,
        institution: str,
        arms: List[Dict[str, Any]],
        **kwargs
    ) -> Study:
        """연구 생성"""
        study_id = f"STUDY_{datetime.now().strftime('%Y%m%d')}_{self._generate_id(8)}"
        
        # 연구 그룹 생성
        study_arms = []
        for arm_data in arms:
            arm = StudyArm(
                arm_id=f"{study_id}_ARM_{len(study_arms) + 1}",
                name=arm_data['name'],
                description=arm_data.get('description', ''),
                intervention=arm_data['intervention'],
                target_size=arm_data.get('target_size', 0),
                allocation_ratio=arm_data.get('allocation_ratio', 1.0)
            )
            study_arms.append(arm)
            
        study = Study(
            study_id=study_id,
            title=title,
            study_type=study_type,
            status=StudyStatus.DRAFT,
            principal_investigator=principal_investigator,
            institution=institution,
            arms=study_arms,
            **kwargs
        )
        self.studies[study_id] = study
        return study

    async def submit_for_irb(self, study_id: str, protocol_document: str, consent_form: str) -> Dict[str, Any]:
        """IRB 제출"""
        study = self.studies.get(study_id)
        if not study:
            raise ValueError(f"Study not found: {study_id}")
            
        study.status = StudyStatus.IRB_PENDING
        study.updated_at = datetime.now()
        
        return {
            'study_id': study_id,
            'status': 'irb_pending',
            'submission_date': datetime.now().isoformat(),
            'message': 'IRB 심사 제출 완료. 승인까지 4-6주 소요 예상.'
        }

    async def approve_irb(self, study_id: str, irb_number: str, approval_date: datetime) -> Study:
        """IRB 승인"""
        study = self.studies.get(study_id)
        if not study:
            raise ValueError(f"Study not found: {study_id}")
            
        study.status = StudyStatus.IRB_APPROVED
        study.irb_number = irb_number
        study.updated_at = datetime.now()
        return study

    async def start_recruitment(self, study_id: str) -> Study:
        """모집 시작"""
        study = self.studies.get(study_id)
        if not study:
            raise ValueError(f"Study not found: {study_id}")
            
        if study.status != StudyStatus.IRB_APPROVED:
            raise ValueError("IRB approval required before recruitment")
            
        study.status = StudyStatus.RECRUITING
        study.start_date = datetime.now()
        study.updated_at = datetime.now()
        return study

    async def enroll_participant(
        self,
        study_id: str,
        user_id: str,
        demographics: Dict[str, Any],
        consent_data: Dict[str, Any]
    ) -> Tuple[Participant, str]:
        """참여자 등록"""
        study = self.studies.get(study_id)
        if not study:
            raise ValueError(f"Study not found: {study_id}")
            
        if study.status not in [StudyStatus.RECRUITING, StudyStatus.ACTIVE]:
            raise ValueError("Study is not accepting participants")
            
        # 동의 기록
        consent = ConsentRecord(
            participant_id=self.anonymization.anonymize_id(user_id),
            study_id=study_id,
            consent_version=consent_data.get('version', '1.0'),
            consent_date=datetime.now(),
            consent_type=consent_data.get('type', 'full'),
            ip_hash=self.anonymization.anonymize_id(consent_data.get('ip', '')),
            signature_method=consent_data.get('signature_method', 'electronic')
        )
        self.consents[consent.participant_id] = consent
        
        # 익명화된 인구통계
        anonymized_demographics = self.anonymization.anonymize_demographics(demographics)
        
        # 무작위 배정 (해당되는 경우)
        arm_id = None
        if study.randomization_enabled and study.arms:
            arm_id = self.randomization.block_randomization(
                study_id, study.arms
            )
            
        # 그룹 인원 업데이트
        for arm in study.arms:
            if arm.arm_id == arm_id:
                arm.current_size += 1
                break
                
        # 참여자 생성
        participant = Participant(
            participant_id=consent.participant_id,
            study_id=study_id,
            arm_id=arm_id,
            status=ParticipantStatus.ENROLLED,
            enrollment_date=datetime.now(),
            demographics=anonymized_demographics
        )
        self.participants[participant.participant_id] = participant
        
        # 등록 수 업데이트
        study.current_enrollment += 1
        
        # 목표 도달 시 상태 변경
        if study.current_enrollment >= study.target_enrollment:
            study.status = StudyStatus.ACTIVE
            
        return participant, arm_id

    async def record_assessment(
        self,
        participant_id: str,
        tool_name: str,
        timepoint: str,
        responses: List[int]
    ) -> Dict[str, Any]:
        """평가 기록"""
        participant = self.participants.get(participant_id)
        if not participant:
            raise ValueError(f"Participant not found: {participant_id}")
            
        # 점수 계산
        score_result = self.assessment.score_assessment(tool_name, responses)
        
        # 기록 저장
        assessment_record = {
            'tool': tool_name,
            'timepoint': timepoint,
            'responses': responses,
            'score': score_result['total_score'],
            'severity': score_result['severity'],
            'recorded_at': datetime.now().isoformat()
        }
        participant.assessments.append(assessment_record)
        participant.last_activity = datetime.now()
        
        return score_result

    async def get_participant_progress(self, participant_id: str) -> Dict[str, Any]:
        """참여자 진행 상황"""
        participant = self.participants.get(participant_id)
        if not participant:
            raise ValueError(f"Participant not found: {participant_id}")
            
        # 평가별 추적
        assessment_history = defaultdict(list)
        for assessment in participant.assessments:
            assessment_history[assessment['tool']].append({
                'timepoint': assessment['timepoint'],
                'score': assessment['score'],
                'severity': assessment['severity'],
                'date': assessment['recorded_at']
            })
            
        # 변화 계산
        changes = {}
        for tool, history in assessment_history.items():
            if len(history) >= 2:
                baseline = history[0]['score']
                latest = history[-1]['score']
                changes[tool] = self.assessment.calculate_change(baseline, latest, tool)
                
        return {
            'participant_id': participant_id,
            'status': participant.status.value,
            'arm': participant.arm_id,
            'session_count': participant.session_count,
            'assessment_history': dict(assessment_history),
            'changes': changes
        }

    async def generate_study_report(self, study_id: str) -> Dict[str, Any]:
        """연구 보고서 생성"""
        study = self.studies.get(study_id)
        if not study:
            raise ValueError(f"Study not found: {study_id}")
            
        # 참여자 데이터 수집
        study_participants = [
            p for p in self.participants.values() if p.study_id == study_id
        ]
        
        # 그룹별 분석
        arm_analysis = {}
        for arm in study.arms:
            arm_participants = [p for p in study_participants if p.arm_id == arm.arm_id]
            
            # 기본 통계
            arm_analysis[arm.arm_id] = {
                'name': arm.name,
                'n': len(arm_participants),
                'completed': sum(1 for p in arm_participants if p.status == ParticipantStatus.COMPLETED),
                'withdrawn': sum(1 for p in arm_participants if p.status == ParticipantStatus.WITHDRAWN),
                'demographics': self._summarize_demographics(arm_participants),
                'outcomes': self._summarize_outcomes(arm_participants)
            }
            
        # 비교 분석 (두 그룹인 경우)
        comparison = None
        if len(study.arms) == 2:
            comparison = await self._compare_arms(study.arms, study_participants)
            
        return {
            'study_id': study_id,
            'title': study.title,
            'status': study.status.value,
            'enrollment': {
                'target': study.target_enrollment,
                'current': study.current_enrollment,
                'percentage': round(study.current_enrollment / study.target_enrollment * 100, 1) if study.target_enrollment > 0 else 0
            },
            'arms': arm_analysis,
            'comparison': comparison,
            'generated_at': datetime.now().isoformat()
        }

    def _summarize_demographics(self, participants: List[Participant]) -> Dict[str, Any]:
        """인구통계 요약"""
        if not participants:
            return {}
            
        demographics = {
            'age_groups': defaultdict(int),
            'gender': defaultdict(int),
            'region_groups': defaultdict(int)
        }
        
        for p in participants:
            demo = p.demographics
            if 'age_group' in demo:
                demographics['age_groups'][demo['age_group']] += 1
            if 'gender' in demo:
                demographics['gender'][demo['gender']] += 1
            if 'region_group' in demo:
                demographics['region_groups'][demo['region_group']] += 1
                
        return {k: dict(v) for k, v in demographics.items()}

    def _summarize_outcomes(self, participants: List[Participant]) -> Dict[str, Any]:
        """결과 요약"""
        outcomes = defaultdict(lambda: {'baseline': [], 'final': []})
        
        for p in participants:
            for assessment in p.assessments:
                tool = assessment['tool']
                timepoint = assessment['timepoint']
                score = assessment['score']
                
                if timepoint == 'baseline':
                    outcomes[tool]['baseline'].append(score)
                elif timepoint in ['final', 'week12', 'post']:
                    outcomes[tool]['final'].append(score)
                    
        summary = {}
        for tool, data in outcomes.items():
            if data['baseline'] and data['final']:
                summary[tool] = {
                    'baseline_mean': round(np.mean(data['baseline']), 2),
                    'baseline_sd': round(np.std(data['baseline']), 2),
                    'final_mean': round(np.mean(data['final']), 2),
                    'final_sd': round(np.std(data['final']), 2),
                    'mean_change': round(np.mean(data['final']) - np.mean(data['baseline']), 2)
                }
        return summary

    async def _compare_arms(self, arms: List[StudyArm], participants: List[Participant]) -> Dict[str, Any]:
        """그룹 간 비교"""
        arm1_id = arms[0].arm_id
        arm2_id = arms[1].arm_id
        
        arm1_participants = [p for p in participants if p.arm_id == arm1_id]
        arm2_participants = [p for p in participants if p.arm_id == arm2_id]
        
        # 간단한 비교 (실제로는 통계 테스트 필요)
        comparison = {
            'arms_compared': [arms[0].name, arms[1].name],
            'n': [len(arm1_participants), len(arm2_participants)],
            'outcome_differences': {}
        }
        
        # 각 도구별 비교
        for tool in ['PHQ-9', 'GAD-7']:
            arm1_changes = []
            arm2_changes = []
            
            for p in arm1_participants:
                baseline = next((a['score'] for a in p.assessments if a['tool'] == tool and a['timepoint'] == 'baseline'), None)
                final = next((a['score'] for a in p.assessments if a['tool'] == tool and a['timepoint'] in ['final', 'week12']), None)
                if baseline is not None and final is not None:
                    arm1_changes.append(final - baseline)
                    
            for p in arm2_participants:
                baseline = next((a['score'] for a in p.assessments if a['tool'] == tool and a['timepoint'] == 'baseline'), None)
                final = next((a['score'] for a in p.assessments if a['tool'] == tool and a['timepoint'] in ['final', 'week12']), None)
                if baseline is not None and final is not None:
                    arm2_changes.append(final - baseline)
                    
            if arm1_changes and arm2_changes:
                comparison['outcome_differences'][tool] = {
                    f'{arms[0].name}_mean_change': round(np.mean(arm1_changes), 2),
                    f'{arms[1].name}_mean_change': round(np.mean(arm2_changes), 2),
                    'difference': round(np.mean(arm1_changes) - np.mean(arm2_changes), 2)
                }
        return comparison

    async def export_data(
        self,
        study_id: str,
        format: DataExportFormat,
        include_demographics: bool = True,
        include_assessments: bool = True
    ) -> Dict[str, Any]:
        """데이터 내보내기"""
        study = self.studies.get(study_id)
        if not study:
            raise ValueError(f"Study not found: {study_id}")
            
        # 데이터 수집
        data = []
        study_participants = [
            p for p in self.participants.values() if p.study_id == study_id
        ]
        
        for p in study_participants:
            record = {
                'participant_id': p.participant_id,
                'arm': p.arm_id,
                'status': p.status.value,
                'enrollment_date': p.enrollment_date.isoformat()
            }
            
            if include_demographics:
                record.update(p.demographics)
                
            if include_assessments:
                for assessment in p.assessments:
                    key = f"{assessment['tool']}_{assessment['timepoint']}"
                    record[key] = assessment['score']
            
            data.append(record)
            
        # k-익명성 확인
        quasi_identifiers = ['age_group', 'gender', 'region_group']
        if not self.anonymization.check_k_anonymity(data, quasi_identifiers):
            # 일반화 적용
            data = self.anonymization.generalize_for_k_anonymity(data, quasi_identifiers)
            
        # 형식별 변환
        if format == DataExportFormat.CSV:
            output = self._to_csv(data)
        elif format == DataExportFormat.JSON:
            output = json.dumps(data, ensure_ascii=False, indent=2)
        else:
            output = data
            
        return {
            'study_id': study_id,
            'format': format.value,
            'records': len(data),
            'variables': list(data[0].keys()) if data else [],
            'data': output,
            'exported_at': datetime.now().isoformat()
        }

    def _to_csv(self, data: List[Dict[str, Any]]) -> str:
        """CSV 변환"""
        if not data:
            return ""
        headers = list(data[0].keys())
        lines = [','.join(headers)]
        for record in data:
            values = [str(record.get(h, '')) for h in headers]
            lines.append(','.join(values))
        return "\n".join(lines)

    def _generate_id(self, length: int = 8) -> str:
        """랜덤 ID 생성"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# 테스트 코드
if __name__ == "__main__":
    import asyncio
    
    async def main():
        platform = ResearchPlatformService()
        print("=== 연구 플랫폼 테스트 ===\\n")
        
        # 연구 생성
        study = await platform.create_study(
            title="AI 심리상담 효과성 무작위 대조 시험",
            study_type=StudyType.RCT,
            principal_investigator="홍길동",
            institution="서울대학교병원",
            arms=[
                {
                    'name': '중재군',
                    'description': 'AI 심리상담 서비스 이용',
                    'intervention': 'ai_counseling',
                    'target_size': 150,
                    'allocation_ratio': 1.0
                },
                {
                    'name': '대조군',
                    'description': '일반 정보 제공',
                    'intervention': 'information_only',
                    'target_size': 150,
                    'allocation_ratio': 1.0
                }
            ],
            target_enrollment=300,
            randomization_enabled=True,
            primary_outcome='PHQ-9 score change at 12 weeks'
        )
        
        print(f"연구 생성: {study.study_id}")
        print(f"제목: {study.title}")
        print(f"상태: {study.status.value}")
        
        # IRB 승인 시뮬레이션
        await platform.submit_for_irb(study.study_id, "protocol.pdf", "consent.pdf")
        await platform.approve_irb(study.study_id, "IRB-2026-001", datetime.now())
        await platform.start_recruitment(study.study_id)
        
        print(f"\\n모집 시작: {study.status.value}")
        
        # 참여자 등록 테스트
        for i in range(10):
            participant, arm = await platform.enroll_participant(
                study_id=study.study_id,
                user_id=f"user_{i:03d}",
                demographics={
                    'age': random.randint(20, 60),
                    'gender': random.choice(['male', 'female']),
                    'region': random.choice(['서울', '경기', '부산', '대구'])
                },
                consent_data={'version': '1.0', 'type': 'full'}
            )
            
            # 기준선 평가
            await platform.record_assessment(
                participant.participant_id, 'PHQ-9', 'baseline',
                [random.randint(0, 3) for _ in range(9)]
            )
            
        print(f"등록된 참여자: {study.current_enrollment}명")
        
        # 배정 균형 확인
        balance = platform.randomization.get_allocation_balance(study.study_id, study.arms)
        print(f"\\n배정 균형:")
        for arm_id, info in balance.items():
            print(f" {arm_id}: {info['count']}명 ({info['percentage']:.1f}%)")
            
        # 보고서 생성
        report = await platform.generate_study_report(study.study_id)
        print(f"\\n연구 보고서:")
        print(f" 등록률: {report['enrollment']['percentage']}% ")
        for arm_id, arm_data in report['arms'].items():
            print(f" {arm_data['name']}: {arm_data['n']}명")

    asyncio.run(main())
