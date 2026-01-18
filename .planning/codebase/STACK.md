# Stack Documentation

> MindBridge AI Frontend - Technology Stack

## Primary Language
- **TypeScript** 5.x (strict mode enabled)
- ES2023+ features supported

## Framework & Runtime
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.1.0 | React meta-framework (App Router) |
| React | ^18 | UI component library |
| React DOM | ^18 | Browser DOM rendering |
| Node.js | 20.x | Runtime environment |

## Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| lucide-react | ^0.309.0 | Icon library (24x24 SVG icons) |
| clsx | ^2.1.0 | Conditional CSS class utility |
| tailwind-merge | ^2.2.0 | Intelligent Tailwind class merging |

## Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5 | Static type checking |
| @types/react | ^18 | React type definitions |
| @types/react-dom | ^18 | React DOM types |
| @types/node | ^20 | Node.js types |
| tailwindcss | ^3.3.0 | Utility-first CSS framework |
| autoprefixer | ^10.0.1 | CSS vendor prefixes |
| postcss | ^8 | CSS transformation |

## Build Configuration

### TypeScript (tsconfig.json)
- Strict mode: `true`
- Module resolution: `bundler`
- Path alias: `@/*` → `./*`
- Incremental builds enabled

### Next.js (next.config.js)
```javascript
// API proxy to backend
rewrites: [
  { source: '/api/:path*', destination: 'http://127.0.0.1:8000/api/:path*' },
  { source: '/health', destination: 'http://127.0.0.1:8000/health' }
]
```

### Tailwind CSS (tailwind.config.ts)
- Custom brand color palette (50-900)
- Emotion-specific colors (happy, calm, sad, angry, anxious, etc.)
- Custom animations (fade-in, slide-up, slide-down, scale-in)
- Inter font family

## Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

## Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| NEXT_PUBLIC_API_URL | Backend API base URL | (empty, uses /api proxy) |

## Package Manager
- npm (lockfile: package-lock.json)
