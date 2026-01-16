"""
유틸리티 함수
"""
import uuid
from datetime import datetime

def generate_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def get_timestamp() -> str:
    return datetime.now().isoformat()
