"""
Main API Entry Point (Phase 1 + 2 + 3 Integrated)
"""
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.v3.endpoints import router as v3_router
import os

app = FastAPI(
    title="Counseling AI Platform",
    description="Integrated AI Counseling Platform (Phase 1-3)",
    version="3.0.0"
)

# Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')

# Include Routers
app.include_router(v3_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "3.0.0"}
