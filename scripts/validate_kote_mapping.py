#!/usr/bin/env python3
"""
KOTE 매핑 검증 스크립트
파일명: scripts/validate_kote_mapping.py

사용법:
    PYTHONPATH=. python scripts/validate_kote_mapping.py

이 스크립트는:
1. KOTE_MAPPING이 모든 인덱스(0-43)를 포함하는지 확인
2. 모든 매핑 값이 유효한 앱 라벨인지 확인
3. 핵심 매핑이 올바른지 확인
4. 샘플 텍스트로 실제 분류 테스트
"""
import sys
from typing import Dict, List, Tuple

# KOTE 원본 라벨 정의 (data/README.md 기준)
KOTE_LABELS = [
    "불평/불만",      # 0
    "환영/호의",      # 1
    "감동/감탄",      # 2
    "지긋지긋",       # 3
    "고마움",         # 4
    "슬픔",           # 5 ★
    "화남/분노",      # 6 ★
    "존경",           # 7
    "기대감",         # 8
    "우쭐댐/무시함",  # 9
    "안타까움/실망",  # 10
    "비장함",         # 11
    "의심/불신",      # 12
    "뿌듯함",         # 13
    "편안/쾌적",      # 14
    "신기함/관심",    # 15
    "아껴주는",       # 16
    "부끄러움",       # 17
    "공포/무서움",    # 18 ★
    "절망",           # 19
    "한심함",         # 20
    "역겨움/징그러움", # 21
    "짜증",           # 22
    "어이없음",       # 23
    "없음",           # 24 ★
    "패배/자기혐오",  # 25
    "귀찮음",         # 26
    "힘듦/지침",      # 27 ★
    "즐거움/신남",    # 28
    "깨달음",         # 29
    "죄책감",         # 30
    "증오/혐오",      # 31
    "흐뭇함(귀여움/예쁨)", # 32
    "당황/난처",      # 33
    "경악",           # 34
    "부담/안_내킴",   # 35
    "서러움",         # 36
    "재미없음",       # 37
    "불쌍함/연민",    # 38
    "놀람",           # 39
    "행복",           # 40 ★
    "불안/걱정",      # 41 ★
    "기쁨",           # 42
    "안심/신뢰",      # 43
]

# 앱 내부에서 사용하는 유효한 라벨
VALID_APP_LABELS = {
    "happiness", "sadness", "anger", "fear", "anxiety",
    "surprise", "disgust", "shame", "guilt", "loneliness",
    "hope", "neutral"
}

# 핵심 매핑 (반드시 맞아야 함)
CRITICAL_MAPPINGS = {
    5: "sadness",     # 슬픔
    6: "anger",       # 화남/분노
    18: "fear",       # 공포/무서움
    24: "neutral",    # 없음
    27: "sadness",    # 힘듦/지침 (통증 표현 포함)
    40: "happiness",  # 행복
    41: "anxiety",    # 불안/걱정
    30: "guilt",      # 죄책감
}

# 부정적 KOTE 라벨 → 부정적 앱 라벨이어야 함
NEGATIVE_KOTE_INDICES = {5, 6, 10, 18, 19, 20, 21, 22, 23, 25, 26, 27, 31, 33, 34, 35, 36, 37, 38, 41}
NEGATIVE_APP_LABELS = {"sadness", "anger", "fear", "anxiety", "disgust", "shame", "guilt"}


def validate_mapping(mapping: Dict[int, str]) -> Tuple[bool, List[str]]:
    """매핑 검증"""
    errors = []

    # 1. 완전성 검사: 0-43 모든 인덱스 포함
    for i in range(44):
        if i not in mapping:
            errors.append(f"[ERROR] Missing index: {i} ({KOTE_LABELS[i]})")

    # 2. 유효성 검사: 모든 값이 유효한 앱 라벨
    for idx, label in mapping.items():
        if label not in VALID_APP_LABELS:
            errors.append(f"[ERROR] Index {idx} has invalid label: '{label}'")

    # 3. 핵심 매핑 검사
    for idx, expected in CRITICAL_MAPPINGS.items():
        actual = mapping.get(idx)
        if actual != expected:
            errors.append(
                f"[CRITICAL] Index {idx} ({KOTE_LABELS[idx]}): "
                f"expected '{expected}', got '{actual}'"
            )

    # 4. 부정적 라벨 일관성 검사
    for idx in NEGATIVE_KOTE_INDICES:
        actual = mapping.get(idx)
        if actual and actual not in NEGATIVE_APP_LABELS and actual != "neutral":
            errors.append(
                f"[WARNING] Negative KOTE label {idx} ({KOTE_LABELS[idx]}) "
                f"maps to non-negative app label: '{actual}'"
            )

    return len(errors) == 0, errors


def test_sample_classifications():
    """샘플 텍스트로 실제 분류 테스트"""
    from models.emotion_classifier import EmotionClassifier

    classifier = EmotionClassifier()

    test_cases = [
        # (텍스트, 허용되는 감정들, 금지된 감정들)
        ("머리가 아파요", ["sadness", "anxiety"], ["happiness"]),
        ("너무 행복해요", ["happiness"], ["sadness", "anger"]),
        ("화가 나요", ["anger"], ["happiness"]),
        ("불안해요", ["anxiety"], ["happiness"]),
        ("무서워요", ["fear", "anxiety"], ["happiness"]),  # fear와 anxiety는 유사
        ("죽고 싶어요", None, None),  # 위기 감지 테스트
    ]

    print("\n=== 샘플 분류 테스트 ===")
    all_passed = True

    for text, allowed, forbidden in test_cases:
        result = classifier.predict(text, language="ko")

        if text == "죽고 싶어요":
            # 위기 감지 테스트
            status = "✅ PASS" if result.is_crisis else "❌ FAIL"
            print(f"{status} | '{text}' → is_crisis={result.is_crisis}")
            if not result.is_crisis:
                all_passed = False
        else:
            passed = True
            if allowed and result.emotion not in allowed:
                passed = False
            if forbidden and result.emotion in forbidden:
                passed = False

            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} | '{text}' → {result.emotion} (allowed: {allowed})")

            if not passed:
                all_passed = False

    return all_passed


def main():
    print("=" * 60)
    print("KOTE 매핑 검증 스크립트")
    print("=" * 60)

    # 매핑 로드
    try:
        from models.emotion_classifier import EmotionClassifier
        mapping = EmotionClassifier.KOTE_MAPPING
    except ImportError as e:
        print(f"[ERROR] Failed to import EmotionClassifier: {e}")
        sys.exit(1)

    # 매핑 검증
    print("\n=== 매핑 검증 ===")
    is_valid, errors = validate_mapping(mapping)

    if is_valid:
        print("✅ 모든 매핑 검증 통과!")
    else:
        print(f"❌ {len(errors)}개 오류 발견:")
        for error in errors:
            print(f"  {error}")

    # 현재 매핑 출력
    print("\n=== 현재 KOTE 매핑 ===")
    print(f"{'Index':<6} {'KOTE Label':<20} {'App Label':<12} {'Status'}")
    print("-" * 50)
    for i in range(44):
        kote_label = KOTE_LABELS[i]
        app_label = mapping.get(i, "MISSING")
        status = "★" if i in CRITICAL_MAPPINGS else ""
        print(f"{i:<6} {kote_label:<20} {app_label:<12} {status}")

    # 샘플 분류 테스트
    sample_passed = test_sample_classifications()

    # 최종 결과
    print("\n" + "=" * 60)
    if is_valid and sample_passed:
        print("✅ 모든 검증 통과!")
        sys.exit(0)
    else:
        print("❌ 일부 검증 실패")
        sys.exit(1)


if __name__ == "__main__":
    main()
