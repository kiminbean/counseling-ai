# KOTE (Korean Online That-gul Emotions) 라벨 정의

> 이 문서는 KOTE 데이터셋의 44개 감정 라벨과 앱 내부 12개 라벨 간의 매핑을 정의합니다.
> 매핑 변경 시 반드시 이 문서를 참조하고 업데이트하세요.

## 원본 출처
- Paper: https://arxiv.org/pdf/2205.05300.pdf
- Dataset: https://huggingface.co/datasets/searle-j/kote

## KOTE 44개 라벨 → 앱 12개 라벨 매핑

| Index | KOTE 라벨 (Korean) | KOTE 라벨 (English) | 앱 내부 라벨 | 비고 |
|-------|-------------------|---------------------|-------------|------|
| 0 | 불평/불만 | Complaint | anger | |
| 1 | 환영/호의 | Welcome/Favor | happiness | |
| 2 | 감동/감탄 | Impressed/Admiration | happiness | |
| 3 | 지긋지긋 | Sick and tired | disgust | |
| 4 | 고마움 | Gratitude | happiness | |
| 5 | 슬픔 | Sadness | **sadness** | ★ 핵심 |
| 6 | 화남/분노 | Anger | **anger** | ★ 핵심 |
| 7 | 존경 | Respect | hope | |
| 8 | 기대감 | Anticipation | hope | |
| 9 | 우쭐댐/무시함 | Arrogance/Dismissive | anger | |
| 10 | 안타까움/실망 | Regret/Disappointment | sadness | |
| 11 | 비장함 | Solemnity | hope | |
| 12 | 의심/불신 | Doubt/Distrust | anxiety | |
| 13 | 뿌듯함 | Pride | happiness | |
| 14 | 편안/쾌적 | Comfort | happiness | |
| 15 | 신기함/관심 | Curiosity/Interest | surprise | |
| 16 | 아껴주는 | Caring | happiness | |
| 17 | 부끄러움 | Embarrassment | shame | |
| 18 | 공포/무서움 | Fear/Terror | **fear** | ★ 핵심 |
| 19 | 절망 | Despair | sadness | |
| 20 | 한심함 | Pathetic | disgust | |
| 21 | 역겨움/징그러움 | Disgust | disgust | |
| 22 | 짜증 | Annoyance | anger | |
| 23 | 어이없음 | Absurd | anger | |
| 24 | 없음 | None | **neutral** | ★ 핵심 |
| 25 | 패배/자기혐오 | Defeat/Self-loathing | sadness | |
| 26 | 귀찮음 | Bothered | anger | |
| 27 | 힘듦/지침 | Exhaustion/Fatigue | **sadness** | ★ 통증 표현 |
| 28 | 즐거움/신남 | Joy/Excitement | happiness | |
| 29 | 깨달음 | Realization | neutral | |
| 30 | 죄책감 | Guilt | **guilt** | ★ 핵심 |
| 31 | 증오/혐오 | Hatred | anger | |
| 32 | 흐뭇함(귀여움/예쁨) | Delight (Cute/Pretty) | happiness | |
| 33 | 당황/난처 | Embarrassed/Awkward | anxiety | |
| 34 | 경악 | Shock | fear | |
| 35 | 부담/안_내킴 | Burden/Reluctance | anxiety | |
| 36 | 서러움 | Sorrow | sadness | |
| 37 | 재미없음 | Boredom | sadness | |
| 38 | 불쌍함/연민 | Pity/Compassion | sadness | |
| 39 | 놀람 | Surprise | surprise | |
| 40 | 행복 | Happiness | **happiness** | ★ 핵심 |
| 41 | 불안/걱정 | Anxiety/Worry | **anxiety** | ★ 핵심 |
| 42 | 기쁨 | Joy | happiness | |
| 43 | 안심/신뢰 | Relief/Trust | happiness | |

## 앱 내부 12개 라벨

| 라벨 | 설명 | 대표 KOTE 인덱스 |
|-----|------|-----------------|
| happiness | 긍정적 감정 | 1,2,4,13,14,16,28,32,40,42,43 |
| sadness | 슬픔, 우울, 고통 | 5,10,19,25,27,36,37,38 |
| anger | 분노, 짜증 | 0,6,9,22,23,26,31 |
| fear | 공포, 두려움 | 18,34 |
| anxiety | 불안, 걱정 | 12,33,35,41 |
| surprise | 놀람, 신기함 | 15,39 |
| disgust | 혐오, 역겨움 | 3,20,21 |
| shame | 부끄러움 | 17 |
| guilt | 죄책감 | 30 |
| loneliness | 외로움 | (키워드 기반) |
| hope | 희망, 기대 | 7,8,11 |
| neutral | 중립 | 24,29 |

## 매핑 원칙

1. **부정적 표현 → 부정적 감정**: "아프다", "힘들다" 등은 반드시 sadness 계열로 매핑
2. **긍정적 표현 → 긍정적 감정**: "좋다", "행복하다" 등은 happiness로 매핑
3. **모호한 경우**: 상담 맥락에서 더 적절한 감정으로 매핑 (예: "깨달음" → neutral)

## 변경 이력

| 날짜 | 변경 내용 | 담당자 |
|-----|----------|--------|
| 2025-01-18 | 초기 문서 작성, KOTE_MAPPING 전면 수정 | Claude |

## 검증 방법

```bash
# 테스트 실행
PYTHONPATH=. python -m pytest tests/test_emotion_classifier.py -v
```
