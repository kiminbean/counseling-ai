"""
국제화 확장 서비스
Phase 3: 일본/동남아 시장 진출
저장 경로: /AI_Drive/counseling_ai/services/international_expansion.py
"""
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import asyncio

class Region(Enum):
    """지원 지역"""
    KOREA = "kr"
    JAPAN = "jp"
    SINGAPORE = "sg"
    VIETNAM = "vn"
    THAILAND = "th"
    INDONESIA = "id"
    TAIWAN = "tw"

class Currency(Enum):
    """지원 통화"""
    KRW = "KRW"
    JPY = "JPY"
    SGD = "SGD"
    VND = "VND"
    THB = "THB"
    IDR = "IDR"
    TWD = "TWD"
    USD = "USD"

@dataclass
class RegionalConfig:
    """지역별 설정"""
    region: Region
    language_code: str
    currency: Currency
    timezone: str
    
    # 긴급 연락처
    emergency_hotlines: Dict[str, str]
    
    # 규제 정보
    regulatory_body: str
    data_residency: str
    compliance_requirements: List[str]
    
    # 문화적 설정
    cultural_adaptations: List[str]
    communication_style: str
    formality_default: str
    
    # 가격 정책
    pricing: Dict[str, float]
    payment_methods: List[str]
    
    # 운영 정보
    support_hours: str
    local_partner: Optional[str] = None

@dataclass
class LocalizedContent:
    """현지화 콘텐츠"""
    content_id: str
    content_type: str
    
    # 언어별 콘텐츠
    translations: Dict[str, str]
    
    # 문화 적응
    cultural_notes: Dict[str, str]
    
    # 메타데이터
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    version: str = "1.0"

class InternationalExpansionService:
    """
    국제화 확장 서비스
    Features:
    - 지역별 설정 관리
    - 콘텐츠 현지화
    - 규제 준수
    - 결제 처리
    """
    def __init__(self):
        self.regional_configs = self._initialize_regional_configs()
        self.localized_content: Dict[str, LocalizedContent] = {}
        self.currency_rates = self._get_currency_rates()

    def _initialize_regional_configs(self) -> Dict[Region, RegionalConfig]:
        """지역별 설정 초기화"""
        return {
            Region.KOREA: RegionalConfig(
                region=Region.KOREA,
                language_code="ko",
                currency=Currency.KRW,
                timezone="Asia/Seoul",
                emergency_hotlines={
                    "suicide_prevention": "1393",
                    "mental_health": "1577-0199",
                    "emergency": "119"
                },
                regulatory_body="식품의약품안전처 (MFDS)",
                data_residency="kr-central",
                compliance_requirements=[
                    "개인정보보호법", "의료기기법", "디지털치료기기 가이드라인"
                ],
                cultural_adaptations=[
                    "존칭 사용", "가족 중심 접근", "체면 고려", "간접적 표현"
                ],
                communication_style="indirect",
                formality_default="formal",
                pricing={
                    "free_tier": 0,
                    "premium_monthly": 29000,
                    "premium_yearly": 290000,
                    "professional_session": 99000
                },
                payment_methods=[
                    "credit_card", "kakao_pay", "naver_pay", "bank_transfer"
                ],
                support_hours="24/7"
            ),
            Region.JAPAN: RegionalConfig(
                region=Region.JAPAN,
                language_code="ja",
                currency=Currency.JPY,
                timezone="Asia/Tokyo",
                emergency_hotlines={
                    "yorisoi_hotline": "0120-279-338",
                    "inochi_no_denwa": "0570-783-556",
                    "emergency": "110"
                },
                regulatory_body="厚生労働省 (MHLW)",
                data_residency="jp-east",
                compliance_requirements=[
                    "個人情報保護法", "医療機器法", "プログラム医療機器ガイドライン"
                ],
                cultural_adaptations=[
                    "敬語使用", "和の重視", "本音と建前", "間接的表現", "恥の文化考慮"
                ],
                communication_style="very_indirect",
                formality_default="very_formal",
                pricing={
                    "free_tier": 0,
                    "premium_monthly": 2980,
                    "premium_yearly": 29800,
                    "professional_session": 9800
                },
                payment_methods=[
                    "credit_card", "konbini", "paypay", "line_pay", "bank_transfer"
                ],
                support_hours="9:00-21:00 JST",
                local_partner="Japan Mental Health Partner Inc."
            ),
            Region.SINGAPORE: RegionalConfig(
                region=Region.SINGAPORE,
                language_code="en",
                currency=Currency.SGD,
                timezone="Asia/Singapore",
                emergency_hotlines={
                    "sos": "1800-221-4444",
                    "imh": "6389-2222",
                    "emergency": "995"
                },
                regulatory_body="Health Sciences Authority (HSA)",
                data_residency="sg-central",
                compliance_requirements=[
                    "PDPA", "Health Products Act", "Medical Device Regulations"
                ],
                cultural_adaptations=[
                    "Multicultural sensitivity", "English/Mandarin/Malay support", "Direct but polite communication"
                ],
                communication_style="direct",
                formality_default="professional",
                pricing={
                    "free_tier": 0,
                    "premium_monthly": 29.90,
                    "premium_yearly": 299.00,
                    "professional_session": 99.00
                },
                payment_methods=[
                    "credit_card", "paynow", "grabpay", "bank_transfer"
                ],
                support_hours="24/7"
            ),
            Region.VIETNAM: RegionalConfig(
                region=Region.VIETNAM,
                language_code="vi",
                currency=Currency.VND,
                timezone="Asia/Ho_Chi_Minh",
                emergency_hotlines={
                    "mental_health": "1800-599-920",
                    "emergency": "115"
                },
                regulatory_body="Ministry of Health (MOH)",
                data_residency="vn-central",
                compliance_requirements=[
                    "Cybersecurity Law", "Personal Data Protection Decree"
                ],
                cultural_adaptations=[
                    "존경어 사용", "가족 중심", "체면 문화", "유교적 가치관"
                ],
                communication_style="indirect",
                formality_default="formal",
                pricing={
                    "free_tier": 0,
                    "premium_monthly": 199000,
                    "premium_yearly": 1990000,
                    "professional_session": 499000
                },
                payment_methods=[
                    "credit_card", "momo", "zalopay", "bank_transfer"
                ],
                support_hours="8:00-22:00 ICT"
            )
        }

    def _get_currency_rates(self) -> Dict[str, float]:
        """환율 정보 (USD 기준)"""
        return {
            "KRW": 1300.0,
            "JPY": 150.0,
            "SGD": 1.35,
            "VND": 24500.0,
            "THB": 35.0,
            "IDR": 15500.0,
            "TWD": 31.5,
            "USD": 1.0
        }

    def get_regional_config(self, region: Region) -> RegionalConfig:
        """지역별 설정 조회"""
        return self.regional_configs.get(region)

    def convert_currency(self, amount: float, from_currency: Currency, to_currency: Currency) -> float:
        """환율 변환"""
        from_rate = self.currency_rates.get(from_currency.value, 1.0)
        to_rate = self.currency_rates.get(to_currency.value, 1.0)
        
        # USD로 변환 후 대상 통화로 변환
        usd_amount = amount / from_rate
        return round(usd_amount * to_rate, 2)

    def get_localized_price(self, base_price_krw: float, region: Region) -> Dict[str, Any]:
        """지역별 가격 조회"""
        config = self.regional_configs.get(region)
        if not config:
            return {"error": "Region not supported"}
            
        converted = self.convert_currency(
            base_price_krw, Currency.KRW, config.currency
        )
        
        return {
            "amount": converted,
            "currency": config.currency.value,
            "formatted": self._format_price(converted, config.currency)
        }

    def _format_price(self, amount: float, currency: Currency) -> str:
        """가격 포맷팅"""
        formats = {
            Currency.KRW: f"₩{amount:,.0f}",
            Currency.JPY: f"¥{amount:,.0f}",
            Currency.SGD: f"S${amount:,.2f}",
            Currency.VND: f"₫{amount:,.0f}",
            Currency.USD: f"${amount:,.2f}"
        }
        return formats.get(currency, f"{amount:,.2f}{currency.value}")

    def get_emergency_resources(self, region: Region, language: str) -> Dict[str, Any]:
        """지역별 긴급 자원"""
        config = self.regional_configs.get(region)
        if not config:
            return {"error": "Region not supported"}
            
        # 언어별 메시지
        messages = {
            "ko": {
                "header": "긴급 상황 시 연락처",
                "description": "지금 힘드시다면, 아래 전문 기관에 연락해 주세요.",
                "available_24_7": "24시간 운영"
            },
            "ja": {
                "header": "緊急連絡先",
                "description": "今つらいと感じていたら、以下の専門機関にご連絡ください。",
                "available_24_7": "24時間対応"
            },
            "en": {
                "header": "Emergency Resources",
                "description": "If you're struggling right now, please reach out to these professional services.",
                "available_24_7": "Available 24/7"
            },
            "vi": {
                "header": "Liên hệ khẩn cấp",
                "description": "Nếu bạn đang gặp khó khăn, vui lòng liên hệ các dịch vụ chuyên nghiệp dưới đây.",
                "available_24_7": "Hoạt động 24/7"
            }
        }
        
        msg = messages.get(language, messages["en"])
        
        return {
            "header": msg["header"],
            "description": msg["description"],
            "hotlines": config.emergency_hotlines,
            "availability": msg["available_24_7"],
            "region": region.value
        }

    async def create_localized_content(
        self,
        content_id: str,
        content_type: str,
        translations: Dict[str, str],
        cultural_notes: Optional[Dict[str, str]] = None
    ) -> LocalizedContent:
        """현지화 콘텐츠 생성"""
        content = LocalizedContent(
            content_id=content_id,
            content_type=content_type,
            translations=translations,
            cultural_notes=cultural_notes or {}
        )
        self.localized_content[content_id] = content
        return content

    def get_localized_content(self, content_id: str, language: str) -> Optional[str]:
        """현지화 콘텐츠 조회"""
        content = self.localized_content.get(content_id)
        if not content:
            return None
        return content.translations.get(language, content.translations.get("en"))

    def get_cultural_adaptation_guidelines(
        self,
        region: Region
    ) -> Dict[str, Any]:
        """문화적 적응 가이드라인"""
        config = self.regional_configs.get(region)
        if not config:
            return {"error": "Region not supported"}
            
        guidelines = {
            Region.KOREA: {
                "do": [
                    "존댓말 사용하기", "감정을 간접적으로 탐색하기",
                    "가족 관계 맥락 고려하기", "체면 손상 피하기", "점진적으로 신뢰 쌓기"
                ],
                "dont": [
                    "초기에 직접적으로 정신건강 언급하기", "가족을 직접 비판하기",
                    "감정 표현 강요하기", "성급하게 해결책 제시하기"
                ],
                "key_concepts": {
                    "정(jeong)": "깊은 정서적 유대감, 상담 관계에서 활용",
                    "체면(chemyeon)": "사회적 평판, 비밀보장 강조로 안심시키기",
                    "눈치(nunchi)": "비언어적 신호 읽기, 명시적 확인 필요",
                    "한(han)": "깊은 슬픔과 억울함, 감정 수용 및 인정"
                }
            },
            Region.JAPAN: {
                "do": [
                    "경어(敬語) 사용하기", "매우 간접적으로 접근하기",
                    "침묵을 존중하기", "화(和)의 가치 인정하기", "수치심에 민감하게 대응하기"
                ],
                "dont": [
                    "직접적인 대면 요구하기", "감정 표현 강요하기",
                    "개인주의적 해결책 제안하기", "가족/조직에 대한 불평 유도하기"
                ],
                "key_concepts": {
                    "和(wa)": "조화, 갈등 최소화 접근",
                    "本音と建前": "속마음과 겉모습, 점진적 탐색 필요",
                    "我慢(gaman)": "인내, 과도한 참음 확인",
                    "恥(haji)": "수치심, 비밀보장 강조"
                }
            },
            Region.SINGAPORE: {
                "do": [
                    "다문화적 민감성 유지하기", "실용적 접근 제공하기",
                    "가족 역동 이해하기", "영어/중국어/말레이어 지원"
                ],
                "dont": [
                    "문화적 가정하기", "종교적 민감성 무시하기"
                ],
                "key_concepts": {
                    "Kiasu": "뒤처지는 것에 대한 두려움",
                    "Face": "체면 문화 (중국계)",
                    "Kampong spirit": "공동체 정신"
                }
            }
        }
        
        return {
            "region": region.value,
            "adaptations": config.cultural_adaptations,
            "communication_style": config.communication_style,
            "formality": config.formality_default,
            "guidelines": guidelines.get(region, {})
        }

    def get_regulatory_requirements(
        self,
        region: Region
    ) -> Dict[str, Any]:
        """규제 요구사항"""
        config = self.regional_configs.get(region)
        if not config:
            return {"error": "Region not supported"}
            
        # 지역별 상세 요구사항
        detailed_requirements = {
            Region.KOREA: {
                "digital_therapeutics": {
                    "class": "2등급 의료기기",
                    "certification_body": "식품의약품안전처",
                    "required_documents": [
                        "기술문서", "임상시험 자료", "소프트웨어 검증 자료",
                        "사이버보안 문서", "개인정보 영향평가"
                    ],
                    "clinical_requirements": {
                        "rct_required": True,
                        "minimum_participants": 200,
                        "minimum_duration_weeks": 8,
                        "primary_outcome": "표준화된 심리 척도"
                    },
                    "timeline_months": 12,
                    "estimated_cost_krw": 500000000
                },
                "data_protection": {
                    "law": "개인정보보호법",
                    "key_requirements": [
                        "동의 획득", "목적 제한", "안전조치 의무", "파기 의무", "국외이전 제한"
                    ],
                    "breach_notification_hours": 72
                }
            },
            Region.JAPAN: {
                "digital_therapeutics": {
                    "class": "プログラム医療機器",
                    "certification_body": "PMDA/厚生労働省",
                    "pathway": "認証 or 承認",
                    "required_documents": [
                        "製造販売承認申請書", "臨床試験データ", "品質管理文書"
                    ],
                    "timeline_months": 18,
                    "local_presence_required": True
                },
                "data_protection": {
                    "law": "個人情報保護法",
                    "key_requirements": [
                        "利用目的の特定", "安全管理措置", "第三者提供の制限"
                    ]
                }
            },
            Region.SINGAPORE: {
                "digital_therapeutics": {
                    "class": "Class B Medical Device",
                    "certification_body": "HSA",
                    "pathway": "Product Registration",
                    "required_documents": [
                        "Device Master File", "Clinical Evidence", "Quality System Documentation"
                    ],
                    "timeline_months": 6,
                    "gmp_required": True
                },
                "data_protection": {
                    "law": "PDPA",
                    "key_requirements": [
                        "Consent", "Purpose limitation", "Access and correction", "Protection"
                    ]
                }
            }
        }
        
        return {
            "region": region.value,
            "regulatory_body": config.regulatory_body,
            "data_residency": config.data_residency,
            "compliance_requirements": config.compliance_requirements,
            "detailed": detailed_requirements.get(region, {})
        }

    async def initialize_region(
        self,
        region: Region
    ) -> Dict[str, Any]:
        """지역 초기화"""
        config = self.regional_configs.get(region)
        if not config:
            return {"error": "Region not supported"}
            
        # 필수 콘텐츠 현지화
        essential_content = [
            {
                "id": "welcome_message",
                "type": "greeting",
                "translations": {
                    "ko": "안녕하세요. 오늘 기분이 어떠세요?",
                    "ja": "こんにちは。今日の調子はいかがですか？",
                    "en": "Hello. How are you feeling today?",
                    "vi": "Xin chào. Hôm nay bạn cảm thấy thế nào?"
                }
            },
            {
                "id": "crisis_prompt",
                "type": "safety",
                "translations": {
                    "ko": "많이 힘드시군요. 지금 안전하신가요?",
                    "ja": "とてもつらそうですね。今、安全ですか？",
                    "en": "I hear that you're going through a difficult time. Are you safe right now?",
                    "vi": "Tôi hiểu bạn đang trải qua thời gian khó khăn. Bạn có an toàn không?"
                }
            },
            {
                "id": "session_end",
                "type": "closing",
                "translations": {
                    "ko": "오늘 대화해 주셔서 감사합니다. 편안한 하루 보내세요.",
                    "ja": "今日はお話しいただきありがとうございました。お大事にしてください。",
                    "en": "Thank you for sharing with me today. Take care of yourself.",
                    "vi": "Cảm ơn bạn đã chia sẻ hôm nay. Hãy chăm sóc bản thân nhé."
                }
            }
        ]
        
        for content in essential_content:
            await self.create_localized_content(
                content_id=content["id"],
                content_type=content["type"],
                translations=content["translations"]
            )
            
        return {
            "region": region.value,
            "status": "initialized",
            "language": config.language_code,
            "content_items": len(essential_content),
            "emergency_resources": config.emergency_hotlines,
            "initialized_at": datetime.now().isoformat()
        }

# 테스트 코드
if __name__ == "__main__":
    async def main():
        service = InternationalExpansionService()
        print("=== 국제화 확장 서비스 테스트 ===\n")
        
        # 지역별 설정 테스트
        for region in [Region.KOREA, Region.JAPAN, Region.SINGAPORE]:
            config = service.get_regional_config(region)
            print(f"\n{region.value} 설정:")
            print(f" 언어: {config.language_code}")
            print(f" 통화: {config.currency.value}")
            print(f" 긴급 연락처: {config.emergency_hotlines}")
            
        # 가격 변환 테스트
        print("\n\n=== 가격 변환 테스트 ===")
        base_price = 29000 # KRW
        for region in [Region.KOREA, Region.JAPAN, Region.SINGAPORE]:
            localized = service.get_localized_price(base_price, region)
            print(f"{region.value}: {localized['formatted']}")
            
        # 문화 가이드라인 테스트
        print("\n\n=== 문화 가이드라인 (한국) ===")
        guidelines = service.get_cultural_adaptation_guidelines(Region.KOREA)
        print(f"Do: {guidelines['guidelines'].get('do', [])[:2]}")
        print(f"Don't: {guidelines['guidelines'].get('dont', [])[:2]}")
        
        # 지역 초기화 테스트
        print("\n\n=== 일본 지역 초기화 ===")
        result = await service.initialize_region(Region.JAPAN)
        print(f"상태: {result['status']}")
        print(f"초기화된 콘텐츠: {result['content_items']}개")

    asyncio.run(main())
