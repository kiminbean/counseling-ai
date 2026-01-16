"""
Main API Entry Point (Phase 1 + 2 + 3 Integrated)
저장 경로: api/main.py
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging

from api.v3.endpoints import router as v3_router
from services.counselor_agent import CounselorAgent

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 전역 서비스 인스턴스
counselor_agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 생명주기 관리"""
    global counselor_agent
    
    # 시작 시
    logger.info("Starting Counseling AI Platform...")
    counselor_agent = CounselorAgent()
    logger.info("CounselorAgent initialized")
    
    yield
    
    # 종료 시
    logger.info("Shutting down Counseling AI Platform...")


app = FastAPI(
    title="Counseling AI Platform",
    description="""
    ## 통합 AI 심리상담 플랫폼 (Phase 1-3)
    
    ### 주요 기능
    - **Phase 1**: 텍스트 기반 심리상담
    - **Phase 2**: 음성/영상 멀티모달 상담
    - **Phase 3**: 다국어 지원, AI 슈퍼바이저, 연구 플랫폼
    
    ### 지원 언어
    - 🇰🇷 한국어 (ko)
    - 🇺🇸 English (en)
    - 🇯🇵 日本語 (ja)
    - 🇨🇳 中文 (zh)
    - 🇻🇳 Tiếng Việt (vi)
    
    ### 위기 상담
    - 한국: 1393 (자살예방), 1577-0199 (정신건강)
    - 미국: 988 (Suicide & Crisis Lifeline)
    """,
    version="3.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


# 의존성
def get_counselor_agent() -> CounselorAgent:
    """CounselorAgent 의존성"""
    if counselor_agent is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return counselor_agent


# 기본 라우트
@app.get("/", include_in_schema=False)
async def read_index():
    """메인 페이지"""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Welcome to Counseling AI Platform", "version": "3.0.0"}


# Phase 1 간단 채팅 엔드포인트 (호환성)
@app.post("/api/v1/chat")
async def simple_chat(
    request: Request,
    agent: CounselorAgent = Depends(get_counselor_agent)
):
    """
    Phase 1 호환 간단 채팅 API
    """
    try:
        body = await request.json()
        message = body.get("message", "")
        user_id = body.get("user_id", "anonymous")
        session_id = body.get("session_id")
        language = body.get("language", "ko")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        result = await agent.process_message(
            user_id=user_id,
            message=message,
            session_id=session_id,
            language=language
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Phase 3 라우터 등록
app.include_router(v3_router)


# 헬스체크
@app.get("/health")
async def health_check():
    """API 헬스체크"""
    return {
        "status": "healthy",
        "version": "3.0.0",
        "services": {
            "counselor_agent": counselor_agent is not None
        }
    }


# 에러 핸들러
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """전역 에러 핸들러"""
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": str(type(exc).__name__)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)