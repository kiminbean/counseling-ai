# Structure Documentation

> MindBridge AI Frontend - Directory Layout & Organization

## Project Root
```
frontend/
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind theme & plugins
├── next.config.js         # Next.js configuration
├── next-env.d.ts          # Generated Next.js types
├── postcss.config.js      # PostCSS configuration
│
├── app/                   # Next.js App Router pages
├── components/            # React components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── .next/                 # Build output (generated)
├── node_modules/          # Dependencies (generated)
└── .planning/             # Planning documentation
```

## App Directory (Pages)
```
app/
├── layout.tsx             # Root layout (fonts, providers)
├── globals.css            # Global Tailwind styles
├── page.tsx               # / - Main chat interface
├── profile/
│   └── page.tsx           # /profile - User profile
├── checkin/
│   └── page.tsx           # /checkin - Mood check-in
└── exercises/
    └── page.tsx           # /exercises - Therapeutic exercises
```

## Components Directory
```
components/
├── layout/
│   ├── AppShell.tsx       # Main layout container
│   └── BottomNav.tsx      # Mobile navigation bar
│
├── chat/
│   ├── ChatInput.tsx      # Message input textarea
│   └── EmotionBadge.tsx   # Emotion indicator chip
│
├── common/
│   ├── Avatar.tsx         # User/AI avatar icons
│   └── Skeleton.tsx       # Loading placeholders
│
├── ChatMessage.tsx        # Message bubble component
├── Sidebar.tsx            # Desktop analysis panel
├── CrisisAlert.tsx        # Crisis intervention modal
└── MoodCheckIn.tsx        # Mood selection widget
```

## Contexts Directory
```
contexts/
└── AuthContext.tsx        # Authentication state management
                           # - Token acquisition
                           # - User/device identification
                           # - Token persistence
```

## Hooks Directory
```
hooks/
├── index.ts               # Barrel exports
├── useChat.ts             # Chat logic & session management
├── useMediaQuery.ts       # Responsive breakpoint detection
└── useLocalStorage.ts     # Browser storage sync
```

## Lib Directory
```
lib/
└── api.ts                 # HTTP client
                           # - fetchWithRetry wrapper
                           # - API functions (sendMessage, getAnonymousToken)
                           # - Response adaptation
                           # - Error handling & messages
```

## Types Directory
```
types/
└── index.ts               # Shared TypeScript types
                           # - ChatRequest, ChatResponse
                           # - EmotionData, Message
                           # - API interfaces
```

## Public Directory
```
public/
└── manifest.json          # PWA manifest
                           # - App name, icons
                           # - Theme color
```

## File Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| Pages | `page.tsx` | `app/profile/page.tsx` |
| Components | PascalCase | `ChatMessage.tsx` |
| Hooks | camelCase with `use` prefix | `useChat.ts` |
| Contexts | PascalCase with `Context` suffix | `AuthContext.tsx` |
| Types | `index.ts` barrel | `types/index.ts` |
| Utilities | camelCase | `lib/api.ts` |

## Component Categories

### By Responsibility
- **Pages**: Smart components with hooks & state
- **Layout**: Structural components (AppShell, BottomNav)
- **Domain**: Feature-specific (ChatMessage, CrisisAlert)
- **Common**: Reusable utilities (Avatar, Skeleton)

### By State
- **Presentational**: Pure, memoized, props-only
- **Controlled**: Value + onChange props
- **Container**: Hooks + business logic
