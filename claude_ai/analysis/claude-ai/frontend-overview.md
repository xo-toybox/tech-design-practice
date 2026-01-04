# claude.ai Frontend Overview

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │    Next.js (RSC)    │  │    React 18+        │  │    Webpack          │  │
│  │    App Router       │  │    Server Components│  │    Bundler          │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Third-party Integrations                        │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │  Statsig  │  │  Segment  │  │  Sentry   │  │  Intercom │        │    │
│  │  │  (flags)  │  │ (analytics)│  │  (errors) │  │  (support)│        │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Communication Layer                              │    │
│  │  ┌───────────────────────┐  ┌───────────────────────┐              │    │
│  │  │  fetch() + SSE        │  │  FCM (Push)           │              │    │
│  │  │  ReadableStream       │  │  Service Worker?      │              │    │
│  │  └───────────────────────┘  └───────────────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Framework

### Next.js

**Evidence**: `window.__next_f` global detected

| Feature | Usage |
|---------|-------|
| App Router | React Server Components |
| Webpack | Bundle building |
| Hydration | Server-rendered initial state |

### Why Not EventSource?

SSE streaming uses `fetch()` + `ReadableStream` instead of browser's `EventSource` API because:

1. **POST required**: Completion endpoint uses POST to send conversation payload
2. **EventSource is GET-only**: Browser API doesn't support POST requests
3. **Custom headers**: Need `anthropic-client-platform`, `anthropic-device-id`

```javascript
// Actual pattern used
const response = await fetch('/api/.../completion', {
  method: 'POST',
  headers: { 'Accept': 'text/event-stream' },
  body: JSON.stringify({ prompt, model, ... })
});

const reader = response.body.getReader();
// Manual SSE parsing
```

---

## Third-party Services

### Detected via Window Globals

| Global | Service | Purpose |
|--------|---------|---------|
| `__STATSIG__` | Statsig | Feature flags |
| `__SEGMENT_INSPECTOR__` | Segment | Product analytics |
| `__SENTRY__` | Sentry | Error tracking |
| `__intercom*` | Intercom | Customer support |
| `__REACT_INTL_CONTEXT__` | react-intl | Internationalization |
| `__perseus_debug__` | Internal | Debug tooling |

### External Domains

| Domain | Purpose |
|--------|---------|
| `statsig.anthropic.com` | Feature flag evaluation |
| `a-api.anthropic.com` | Analytics events (Segment) |
| `s-cdn.anthropic.com` | Static scripts |
| `fcmregistrations.googleapis.com` | Push notification registration |
| `api.honeycomb.io` | Distributed tracing |
| `widget.intercom.io` | Support chat widget |

---

## State Management

### Observations

- No Redux detected (no `__REDUX_*` globals)
- Likely React Context + Server Components
- `__next_f` hydration array for SSR state

### Caching

- `cf-cache-status: DYNAMIC` on all API responses
- No client-side caching headers observed
- State likely kept in React component tree

---

## Feature Flags

### Statsig Integration

Feature flags control UI features:

| Flag | Purpose |
|------|---------|
| `paprika_mode` | Extended thinking toggle |
| `saffron`, `turmeric` | Unknown features |
| `monkeys_in_a_barrel` | Unknown feature |
| `bananagrams`, `sourdough` | Unknown features |

### Loading Pattern

1. Flags fetched from `statsig.anthropic.com/v1/rgstr`
2. Stored in `__STATSIG__` global
3. React components read flag values
4. Some flags stored per-conversation in `settings`

---

## Analytics

### Segment Integration

Events sent to `a-api.anthropic.com/v1/t`:

```json
{
  "event": "claudeai.cardamom_prompts.prompt_displayed",
  "type": "track",
  "properties": {
    "account_uuid": "...",
    "organization_uuid": "...",
    "billing_type": "stripe_subscription"
  }
}
```

### Amplitude Sessions

Session tracking via Amplitude integration.

---

## Push Notifications

### FCM Integration

1. Service worker registers with `fcmregistrations.googleapis.com`
2. Token stored via `POST /notification/channels`
3. Per-feature preferences in `/notification/preferences`
4. Features: `completion`, `compass`, `project_sharing`

---

## Performance Patterns

### Bundle Loading

- Webpack chunking (observed multiple `.js` chunks)
- Code splitting likely by route
- Server-side rendering for initial paint

### Network Optimization

- HTTP/3 (QUIC) for 86% of requests
- Brotli compression (`br` encoding)
- CDN via Cloudflare

---

## Unknown / Future Investigation

| Item | Status |
|------|--------|
| Bundle size analysis | Not captured |
| Route-level code splitting | Not verified |
| Service worker scope | Not captured |
| React version | Not captured (likely 18+) |
| State management details | Not captured |

