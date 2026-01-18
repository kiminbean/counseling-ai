# Integrations Documentation

> MindBridge AI Frontend - External Services & APIs

## Backend API Integration

### Connection Configuration
- **Backend URL**: `http://127.0.0.1:8000` (via Next.js rewrites)
- **Environment Variable**: `NEXT_PUBLIC_API_URL`
- **Protocol**: RESTful HTTP/HTTPS
- **Authentication**: Bearer token (JWT)

### API Proxy (next.config.js)
```javascript
rewrites: [
  { source: '/api/:path*', destination: 'http://127.0.0.1:8000/api/:path*' },
  { source: '/health', destination: 'http://127.0.0.1:8000/health' }
]
```

## API Endpoints

### Authentication
| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/v3/auth/anonymous` | POST | Get anonymous token | `{ device_id, language }` | `{ access_token, refresh_token, user_id, anonymous_id }` |

### Chat
| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/v3/chat/multilingual` | POST | Send message | `{ user_id, message, session_id, language }` | `ChatResponse` |
| `/api/v3/sessions/{id}/summary` | GET | Get summary | - | Session summary |

### Mood Check-in
| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/v3/checkin/mood` | POST | Submit mood | Mood data | Confirmation |
| `/api/v3/checkin/mood/history` | GET | Get history | `?days=7` | History array |

### Health
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Backend health check |

## Authentication Flow

```
App Initialization
    │
    ├─ Check localStorage for existing token
    │   ├─ Token exists → Validate (future: refresh if expired)
    │   └─ No token → Request anonymous token
    │
    ├─ POST /api/v3/auth/anonymous
    │   ├─ device_id: 'device_{timestamp}_{random}'
    │   └─ language: 'ko'
    │
    └─ Store in localStorage
        ├─ access_token
        ├─ refresh_token
        ├─ user_id
        ├─ anonymous_id
        └─ device_id
```

## API Client Implementation

### Location
`lib/api.ts`

### Features
- **Retry Logic**: 3 attempts with exponential backoff
- **Retryable Status Codes**: 408, 429, 500, 502, 503, 504
- **Rate Limit Handling**: Respects Retry-After header
- **Response Adaptation**: Normalizes v3 API responses to frontend format

### Error Handling
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isRetryable: boolean = false
  ) {}
}
```

### Error Messages (i18n)
| Status | Korean | English |
|--------|--------|---------|
| 400 | 요청을 처리할 수 없습니다 | Cannot process request |
| 401 | 인증이 필요합니다 | Authentication required |
| 403 | 접근 권한이 없습니다 | Access denied |
| 404 | 요청한 내용을 찾을 수 없습니다 | Not found |
| 429 | 요청이 너무 많습니다 | Too many requests |
| 500 | 서버에 일시적인 문제가 발생했습니다 | Server error |
| 503 | 서비스가 일시적으로 사용 불가능합니다 | Service unavailable |

## Request/Response Types

### ChatRequest
```typescript
interface ChatRequest {
  user_id: string;
  message: string;
  session_id: string;
  language: string;
}
```

### ChatResponse
```typescript
interface ChatResponse {
  session_id: string;
  response_text?: string;
  response?: string;
  emotion_analysis?: {
    primary_emotion: string;
    intensity: number;
    secondary_emotions: string[];
  };
  emotion?: {  // v1 compatibility
    label: string;
    confidence: number;
    intensity: number;
    secondary: string[];
  };
  supervisor_feedback?: {
    intervention_needed: boolean;
    quality_score: number;
  };
  is_crisis?: boolean;
  suggested_techniques: string[];
  safety_resources?: Record<string, string>;
}
```

## Browser Storage

### localStorage Keys
| Key | Purpose | Type |
|-----|---------|------|
| `access_token` | JWT for API auth | string |
| `refresh_token` | Token refresh | string |
| `user_id` | User identifier | string |
| `anonymous_id` | Anonymous session ID | string |
| `device_id` | Device identifier | string |
| `current_session_id` | Active chat session | string |
| `current_messages` | Chat history | JSON (max 50) |

## Third-Party Services

**Currently None Integrated**

Not using:
- Analytics (Google Analytics, Segment)
- Error monitoring (Sentry, Rollbar)
- Payment processing
- Email services
- Real-time (WebSocket, Pusher)
- Maps/Geolocation
- File storage (S3, Cloudinary)

## PWA Configuration

### Manifest (public/manifest.json)
```json
{
  "name": "MindBridge AI",
  "short_name": "MindBridge",
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<meta name="theme-color" content="#0ea5e9" />
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `` | Backend API base URL |

**Note**: Uses Next.js rewrites for API proxy, so env var can be empty for development.
