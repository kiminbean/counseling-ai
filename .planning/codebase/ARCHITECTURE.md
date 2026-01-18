# Architecture Documentation

> MindBridge AI Frontend - System Design & Patterns

## Architecture Overview

**Pattern**: Next.js App Router (Server-Client Hybrid) with Context-based State

```
┌─────────────────────────────────────────────────────────────┐
│           Next.js App Router (Server)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Root Layout                                           │  │
│  │  - Metadata, Viewport, Fonts                          │  │
│  │  - AuthProvider (Client Context)                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ├─ Client Components ('use client')
         │  ├─ Pages (state orchestration)
         │  ├─ Layout Components (AppShell, BottomNav)
         │  ├─ Domain Components (Chat, CrisisAlert)
         │  └─ Utility Components (Avatar, EmotionBadge)
         │
         ├─ Custom Hooks (business logic)
         │  ├─ useChat (chat + session management)
         │  ├─ useMediaQuery (responsive detection)
         │  └─ useLocalStorage (persistence)
         │
         ├─ API Layer (lib/api.ts)
         │  └─ fetchWithRetry (error handling, retry logic)
         │
         └─ Context (AuthProvider)
            └─ Authentication state
```

## State Management

**Approach**: Context API + Custom Hooks + localStorage

### Global State (AuthContext)
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  anonymousId: string | null;
  accessToken: string | null;
  initialize(): Promise<void>;
  logout(): void;
  getToken(): string | null;
}
```

### Feature State (useChat)
```typescript
interface UseChatReturn {
  messages: Message[];
  sessionId: string | null;
  currentEmotion: EmotionData | null;
  techniques: string[];
  showCrisisAlert: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage(content: string): Promise<void>;
  clearError(): void;
}
```

### Persistence (localStorage)
- `access_token`, `refresh_token` - Authentication
- `user_id`, `anonymous_id`, `device_id` - Identity
- `current_session_id` - Active chat session
- `current_messages` - Chat history (max 50)

## Data Flow

**Unidirectional**: User Input → API → State Update → UI Render

```
ChatInput (user types)
    ↓
sendMessage() [useChat hook]
    ├─ Optimistic Update (immediate UI feedback)
    ├─ API Call (fetchWithRetry)
    │   ├─ 3x retry with exponential backoff
    │   └─ Response adaptation
    ├─ State Update (session, emotion, messages)
    └─ Side Effects
        ├─ localStorage persistence
        ├─ Auto-scroll to latest
        └─ Crisis alert if detected
```

## Component Patterns

### Smart Components (Pages)
- Orchestrate hooks and state
- Pass data down via props
- Handle side effects

### Presentational Components
- Pure rendering logic
- Memoized with `memo()`
- Receive all data via props

### Layout Components
- AppShell: Main container with responsive layout
- BottomNav: Mobile navigation (hidden on desktop)

## Routing Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | page.tsx | Main chat interface |
| `/profile` | profile/page.tsx | User profile & settings |
| `/checkin` | checkin/page.tsx | Daily mood check-in |
| `/exercises` | exercises/page.tsx | Therapeutic exercises |

## API Communication

**Backend**: Python FastAPI on port 8000

**Endpoints Used**:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v3/auth/anonymous` | POST | Anonymous token |
| `/api/v3/chat/multilingual` | POST | Send message |
| `/api/v3/sessions/{id}/summary` | GET | Session summary |
| `/api/v3/checkin/mood` | POST | Submit mood |
| `/api/v3/checkin/mood/history` | GET | Mood history |

## Error Handling Strategy

1. **API Level**: Custom `ApiError` class with retry logic
2. **Hook Level**: Error state with `clearError()`
3. **UI Level**: Toast notifications and inline messages
4. **Fallback**: Graceful degradation for network failures
