# Concerns Documentation

> MindBridge AI Frontend - Technical Debt, Risks & Issues

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 3 | 3 | 0 | 6 |
| Technical Debt | 2 | 3 | 0 | 5 |
| Performance | 0 | 4 | 0 | 4 |
| Maintainability | 0 | 5 | 0 | 5 |
| Missing Features | 2 | 3 | 0 | 5 |
| Testing | 0 | 3 | 0 | 3 |
| **Total** | **7** | **21** | **0** | **28** |

---

## HIGH SEVERITY

### 1. Token Storage Security Vulnerability
**Location**: `contexts/AuthContext.tsx` (lines 61-109)
**Issue**: Tokens stored in plain localStorage
- `access_token`, `refresh_token` directly in localStorage
- Vulnerable to XSS attacks
**Recommendation**: Use httpOnly cookies or encrypt tokens

### 2. Missing Error Boundaries
**Location**: All page components
**Issue**: No React error boundaries
- Component crash takes down entire page
- Bad UX for mental health app
**Recommendation**: Wrap pages with error boundary components

### 3. Missing CSRF Protection
**Location**: `lib/api.ts`
**Issue**: No CSRF tokens on state-changing requests
**Recommendation**: Implement CSRF token validation

### 4. No Session Validation
**Location**: `useChat.ts`
**Issue**: Session restored from localStorage without backend validation
- Session may be expired on server
- State out of sync
**Recommendation**: Validate session on app load

### 5. No Offline Detection
**Location**: No implementation
**Issue**: No `navigator.onLine` checks
- Users get confusing errors when offline
**Recommendation**: Add offline detection and messaging

### 6. Incomplete Pages (Dead Links)
**Location**: `profile/page.tsx`
**Issue**: Navigation to non-existent pages
- `/settings`, `/privacy`, `/help` don't exist
**Recommendation**: Implement or remove links

### 7. Console Logs in Production
**Location**: Multiple files
**Issue**: `console.error` with potentially sensitive data
**Recommendation**: Remove or sanitize logs in production

---

## MEDIUM SEVERITY

### Security

**8. No HTTP Security Headers**
- Location: `next.config.js`
- Missing: CSP, X-Content-Type-Options, X-Frame-Options, HSTS

**9. localStorage Without HTTPS Check**
- Location: Auth and chat hooks
- Should verify `https:` protocol before storing tokens

**10. No Authentication State Validation**
- Location: `useChat.ts`
- Checks `userId` but not `isAuthenticated`

### Technical Debt

**11. Hardcoded Phone Numbers**
- Location: `CrisisAlert.tsx`, `ChatInput.tsx`, `profile/page.tsx`
- Same numbers duplicated 3+ times
- Recommendation: Create shared constants file

**12. Duplicated Emotion Constants**
- Location: `EmotionBadge.tsx`, `checkin/page.tsx`, `MoodCheckIn.tsx`
- Different structures for same data
- Recommendation: Unify emotion definitions

**13. Race Condition in useChat**
- Location: `hooks/useChat.ts`
- Optimistic update without abort controller
- Missing cleanup on unmount

**14. No Input Validation**
- Location: `ChatInput.tsx`, `checkin/page.tsx`
- No max length enforcement in UI
- No sanitization before API

**15. Inconsistent Error Handling**
- Location: Multiple API call sites
- Different strategies: console.error, alert(), state

### Performance

**16. Missing Memoization**
- Location: `page.tsx`, `Sidebar.tsx`
- Inline functions in map causing re-renders
- Recommendation: Use `useCallback`

**17. localStorage Thrashing**
- Location: `useChat.ts`
- Writes after every message
- Recommendation: Debounce writes

**18. Unbounded Retry Logic**
- Location: `lib/api.ts`
- No circuit breaker pattern
- Can cause cascading failures

**19. No Image Optimization**
- No next/image usage for assets
- Missing bundle size optimization

### Maintainability

**20. Mock Data Mixed with Production**
- Location: `exercises/page.tsx`, `checkin/page.tsx`
- Hard to distinguish placeholder vs real code

**21. Props Drilling**
- Location: `AppShell.tsx`, `BottomNav.tsx`
- Sidebar content passed multiple levels

**22. Missing Component Documentation**
- Most components lack JSDoc
- Complex props undocumented

**23. Hard-coded Version**
- Location: `profile/page.tsx`
- "Version 1.0.0" not synced with package.json

**24. No Environment Validation**
- No `.env.example` file
- Missing env var causes silent failures

### Missing Features

**25. No Loading States for Navigation**
- No feedback during page transitions

**26. Incomplete i18n**
- Only Korean/English
- No translation file structure
- Hardcoded Korean in many places

**27. No Accessibility Audit**
- Missing `aria-label` on icon buttons
- No focus management in modals
- Color-only differentiation

**28. No Pagination for History**
- Location: `checkin/page.tsx`
- Loads all history at once

### Testing

**29. No Test Framework**
- Zero test files
- No Vitest, Jest, or Playwright

**30. No API Response Validation**
- Assumes API returns expected fields
- No schema validation (Zod, Yup)

**31. No E2E Tests**
- Can't verify critical user journeys

---

## Priority Remediation Roadmap

### Phase 1: Critical (Immediate)
1. Add error boundaries to all pages
2. Implement CSRF protection
3. Move tokens to httpOnly cookies
4. Add input validation
5. Fix API URL configuration

### Phase 2: Important (This Sprint)
1. Create shared constants file
2. Implement consistent error handling
3. Add accessibility attributes
4. Implement offline detection
5. Complete or remove dead navigation

### Phase 3: Recommended (Next Sprint)
1. Add logging/monitoring (Sentry)
2. Add form validation library
3. Set up test infrastructure
4. Improve state management
5. Debounce localStorage writes

---

## Files Requiring Attention

| Priority | File | Issues |
|----------|------|--------|
| HIGH | `contexts/AuthContext.tsx` | Token storage, validation |
| HIGH | `lib/api.ts` | CSRF, error handling |
| HIGH | All `page.tsx` | Error boundaries |
| MEDIUM | `hooks/useChat.ts` | Race conditions, cleanup |
| MEDIUM | `components/CrisisAlert.tsx` | Hardcoded values |
| MEDIUM | `next.config.js` | Security headers |
| LOW | `tailwind.config.ts` | Emotion color consolidation |
