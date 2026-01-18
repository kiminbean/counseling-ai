# Conventions Documentation

> MindBridge AI Frontend - Code Style & Patterns

## TypeScript Conventions

### Strict Mode
- `strict: true` enabled in tsconfig.json
- All variables must have explicit or inferred types
- No implicit `any`

### Path Aliases
```typescript
// Use @ alias for absolute imports
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';

// NOT relative paths like
import { useAuth } from '../../../contexts/AuthContext';
```

### Type Definitions
```typescript
// Interface for component props
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  timestamp: number;
}

// Export types with `export type` when needed
export type { ChatResponseFormatted };
```

## Naming Conventions

### Files
| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `ChatMessage.tsx` |
| Hook | useXxx.ts | `useChat.ts` |
| Context | XxxContext.tsx | `AuthContext.tsx` |
| Utility | camelCase.ts | `api.ts` |
| Page | page.tsx | `app/profile/page.tsx` |

### Variables & Functions
```typescript
// camelCase for variables
const isLoading = true;
const sessionId = 'abc123';

// camelCase for functions
function sendMessage() {}
const handleSubmit = () => {};

// UPPER_SNAKE_CASE for constants
const MAX_STORED_MESSAGES = 50;
const MAX_RETRIES = 3;
```

### Components
```typescript
// PascalCase for components
export const ChatMessage = memo<ChatMessageProps>(function ChatMessage() {});
export default function ProfilePage() {}

// Props interface matches component name
interface ChatMessageProps {}
interface AvatarProps {}
```

## Import Order
```typescript
// 1. React/Next imports
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { Send, Sparkles } from 'lucide-react';

// 3. Local imports with @ alias
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage } from '@/lib/api';
import { Message, EmotionData } from '@/types';
```

## Component Patterns

### Client Components
```typescript
'use client';  // Must be at top of file

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  return <div>...</div>;
}
```

### Memoized Components
```typescript
import { memo } from 'react';

export const ChatMessage = memo<ChatMessageProps>(function ChatMessage({
  role,
  content,
  emotion,
  timestamp,
}) {
  return <div>...</div>;
});
```

### Custom Hooks
```typescript
export function useChat(): UseChatReturn {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    // Implementation
  }, [userId]);

  return { messages, sendMessage, /* ... */ };
}
```

## Styling Conventions

### Tailwind CSS Classes
```typescript
// Group classes by concern
className={`
  flex w-full mb-4                              // Layout
  bg-white rounded-2xl border border-gray-100  // Appearance
  animate-fade-in                              // Animation
  ${isUser ? 'justify-end' : 'justify-start'}  // Conditional
`}
```

### Responsive Design
```typescript
// Mobile-first approach
className="hidden lg:block"    // Show on desktop
className="lg:hidden"          // Show on mobile
className="pb-16 lg:pb-0"      // Different padding
```

### Custom Colors
```typescript
// Brand colors
className="bg-brand-500 text-white"

// Emotion colors
className="bg-emotion-happy"
className="text-emotion-sad"
```

## Error Handling

### API Errors
```typescript
try {
  const response = await sendMessageApi(content);
} catch (error) {
  if (error instanceof ApiError) {
    setError(getErrorMessage(error, language));
  }
}
```

### Component Errors
```typescript
{error && (
  <div className="text-red-500">{error}</div>
)}
```

## Documentation Style

### Module Comments
```typescript
/**
 * API Client
 * 저장 경로: frontend/lib/api.ts
 * 기능:
 * - 에러 핸들링 및 재시도
 * - 타입 안전한 API 호출
 */
```

### Function Comments
```typescript
/**
 * 저장된 토큰 가져오기
 */
function getStoredToken(): string | null {
  // ...
}
```

### Inline Comments
```typescript
// localStorage에서 세션 복원
// Rate limit인 경우 더 긴 대기
// 낙관적 업데이트 롤백
```

## Export Patterns

### Named Exports (Reusable)
```typescript
export const ChatMessage = memo(...);
export { useChat } from './useChat';
```

### Default Exports (Pages)
```typescript
export default function ProfilePage() {}
```

### Barrel Exports (index.ts)
```typescript
// hooks/index.ts
export { useChat } from './useChat';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery } from './useMediaQuery';
```
