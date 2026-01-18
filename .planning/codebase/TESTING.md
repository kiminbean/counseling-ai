# Testing Documentation

> MindBridge AI Frontend - Test Infrastructure & Practices

## Current Status

**NO TESTING INFRASTRUCTURE CONFIGURED**

The frontend codebase currently has:
- No test framework installed
- No test files
- No coverage configuration
- No CI/CD test pipeline

## Missing Test Dependencies

```json
// Not in package.json - need to add:
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^23.0.0",
    "playwright": "^1.40.0"
  }
}
```

## Recommended Test Structure

```
frontend/
├── __tests__/
│   ├── components/
│   │   ├── ChatMessage.test.tsx
│   │   ├── ChatInput.test.tsx
│   │   ├── EmotionBadge.test.tsx
│   │   └── CrisisAlert.test.tsx
│   ├── hooks/
│   │   ├── useChat.test.ts
│   │   ├── useLocalStorage.test.ts
│   │   └── useMediaQuery.test.ts
│   ├── lib/
│   │   └── api.test.ts
│   └── pages/
│       ├── chat.test.tsx
│       └── checkin.test.tsx
├── e2e/
│   ├── chat-flow.spec.ts
│   ├── mood-checkin.spec.ts
│   └── crisis-detection.spec.ts
├── __mocks__/
│   ├── api.ts
│   └── localStorage.ts
└── vitest.config.ts
```

## Recommended Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', '**/*.d.ts'],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

## Priority Test Cases

### Critical (Must Have)
1. **useChat hook** - Message sending, error handling, session management
2. **API client** - Retry logic, error handling, response adaptation
3. **AuthContext** - Token acquisition, persistence, logout
4. **CrisisAlert** - Display on crisis detection, hotline rendering

### Important (Should Have)
1. **ChatMessage** - Renders user/assistant messages correctly
2. **ChatInput** - Enter to send, Shift+Enter for newline
3. **EmotionBadge** - Correct color mapping for emotions
4. **Mood check-in** - Multi-step form validation

### Nice to Have
1. **Accessibility** - ARIA labels, keyboard navigation
2. **Responsive layout** - Mobile vs desktop rendering
3. **Error boundaries** - Graceful error handling

## Example Test Cases

### Hook Test (useChat)
```typescript
// __tests__/hooks/useChat.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';

describe('useChat', () => {
  it('should add optimistic message on send', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toContainEqual(
      expect.objectContaining({ role: 'user', content: 'Hello' })
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock API failure
    vi.spyOn(api, 'sendMessage').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

### Component Test (ChatMessage)
```typescript
// __tests__/components/ChatMessage.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/ChatMessage';

describe('ChatMessage', () => {
  it('renders user message with correct styling', () => {
    render(
      <ChatMessage
        role="user"
        content="Hello"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('justify-end');
  });

  it('shows emotion badge for assistant messages', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Hi there"
        emotion="calm"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByText('calm')).toBeInTheDocument();
  });
});
```

### E2E Test (Playwright)
```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test('should send message and receive response', async ({ page }) => {
    await page.goto('/');

    // Wait for auth
    await page.waitForSelector('[data-testid="chat-input"]');

    // Send message
    await page.fill('[data-testid="chat-input"]', '안녕하세요');
    await page.click('[data-testid="send-button"]');

    // Verify user message appears
    await expect(page.getByText('안녕하세요')).toBeVisible();

    // Wait for AI response
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({
      timeout: 10000,
    });
  });
});
```

## Test Scripts to Add

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Next Steps

1. Install test dependencies
2. Create vitest.config.ts
3. Add test scripts to package.json
4. Write critical path tests first
5. Set up CI/CD pipeline
6. Achieve 70% coverage threshold
