"""
세션 관리자 (Phase 1)
"""
from typing import Dict, List, Any
from datetime import datetime

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, List[Dict[str, Any]]] = {}
        
    def create_session(self, user_id: str) -> str:
        session_id = f"sess_{user_id}_{int(datetime.now().timestamp())}"
        self.sessions[session_id] = []
        return session_id
        
    def add_message(self, session_id: str, role: str, message: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        
        self.sessions[session_id].append({
            "role": role,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
        
    def get_history(self, session_id: str) -> List[Dict[str, Any]]:
        return self.sessions.get(session_id, [])
