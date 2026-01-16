"""
Main API Entry Point (Phase 1 + 2 + 3 Integrated)
"""
from fastapi import FastAPI, Depends
from api.v3.endpoints import router as v3_router
# Phase 2 endpoints would be imported here
# from api.v2.voice_endpoints import router as v2_router

app = FastAPI(
    title="Counseling AI Platform",
    description="Integrated AI Counseling Platform (Phase 1-3)",
    version="3.0.0"
)

# Include Routers
app.include_router(v3_router)
# app.include_router(v2_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Counseling AI Platform"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "3.0.0"}
