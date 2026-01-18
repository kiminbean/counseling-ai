# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered psychological counseling platform with multilingual support, emotion analysis, and crisis detection. Three-phase architecture: text counseling (Phase 1), voice/multimodal (Phase 2), multilingual + AI supervisor + research platform (Phase 3).

## Tech Stack

**Backend**: FastAPI (Python 3.11+), PyTorch, HuggingFace Transformers (`klue/bert-base`), scikit-learn
**Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
**ML Acceleration**: MPS (Apple Silicon) - always prefer MPS over CUDA

## Common Commands

### Backend
```bash
# Install dependencies
pip install -r requirements_phase3.txt
pip install -r requirements_training.txt

# Run development server (from project root)
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Run tests
PYTHONPATH=. python -m pytest tests/
PYTHONPATH=. python -m unittest tests/test_counselor.py

# Train emotion model
PYTHONPATH=. python training/train_emotion_model.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Development (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Docker
```bash
cd docker
docker-compose up --build
```

## Architecture

```
Request Flow:
Frontend (Next.js)
  → /api/* proxy (next.config.js rewrites to :8000)
  → FastAPI (api/main.py)
  → CounselorAgent (services/counselor_agent.py)
  → EmotionClassifier + ResponseGenerator (models/)
```

### Core Components

| File | Role |
|------|------|
| `api/main.py` | App lifecycle, global CounselorAgent instance, CORS, routes |
| `api/v3/endpoints.py` | Phase 3 API: multilingual chat, supervisor, personalization, research |
| `services/counselor_agent.py` | Session management, orchestrates emotion → response pipeline |
| `models/emotion_classifier.py` | BERT-based (or rule fallback) emotion classification |
| `models/response_generator.py` | Therapeutic response generation with approach selection |
| `frontend/lib/api.ts` | API adapter normalizing v1/v3 responses for UI |

### API Endpoints

- `/health` - Health check
- `/api/v1/chat` - Legacy simple chat (Phase 1 compatibility)
- `/api/v3/chat/multilingual` - Main endpoint (requires `X-API-Key` header)
- `/api/v3/supervisor/*` - AI supervisor review/alerts
- `/api/v3/research/*` - Research platform (studies, participants, assessments)
- `/docs` - OpenAPI documentation

### Supported Languages
ko (Korean), en (English), ja (Japanese), zh (Chinese), vi (Vietnamese)

## Development Notes

- Frontend proxies `/api/*` to `http://127.0.0.1:8000` - backend must be running
- Global CounselorAgent instance initialized at app startup via lifespan manager
- Session state is in-memory (dict) - not persisted across restarts
- Model weights stored in `models/weights/`
- Training data expected in `data/` (train.tsv, test.tsv for KOTE/NSMC datasets)

## Type Safety

- **Python**: Use type hints and Pydantic models for all API contracts
- **TypeScript**: Use interfaces for props and API responses (see `frontend/types/`)
