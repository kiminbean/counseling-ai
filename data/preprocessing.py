"""
데이터 전처리 유틸리티
"""
import re

def clean_text(text: str) -> str:
    # Remove special chars but keep Korean, English, numbers, punctuation
    text = re.sub(r'[^가-힣a-zA-Z0-9.,?! ]', '', text)
    return text.strip()
