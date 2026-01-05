# Architecture Comparison: ChatGPT vs Claude.ai

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **CDN** | Cloudflare | Cloudflare | Both |
| **Backend cloud** | Not determined | GCP | Via header |
| **Service mesh** | Not observed | Envoy | `x-envoy-upstream-service-time` |
| **Protocol** | HTTP/1.1, HTTP/2 | HTTP/3 (86%), HTTP/2 fallback | Claude more modern |
| **Streaming** | SSE (POST-based) | SSE (POST-based) | Both use POST, not EventSource |
| **Compression** | Not captured | Brotli (SSE), zstd (JSON) | Claude captured |
| **API style** | REST | REST | Both resource-based |

---

## System Architecture

### ChatGPT

```
┌─────────────┐
│   Browser   │  React SPA
└──────┬──────┘
       │ HTTP/1.1, HTTP/2
       ▼
┌─────────────────┐
│   Cloudflare    │  CDN, WAF
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Conversat.│ │ Gizmos   │ │ Memories │ │ Sentinel │ │  Tasks   │  │
│  │ /f/conv  │ │/discovery│ │/memories │ │/sentinel │ │/automats │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Calpico  │ │  Images  │ │  Codex   │ │ Settings │ │Connectors│  │
│  │  /rooms  │ │ /images  │ │  /wham   │ │/settings │ │  /aip    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Model Service  │  GPT-4o, o1, etc.
└─────────────────┘
```

**Key Services Identified**:
- `/backend-api/f/conversation` - Core chat (streaming)
- `/backend-api/gizmos` - Custom GPTs
- `/backend-api/memories` - Personalization
- `/backend-api/sentinel` - Anti-abuse
- `/backend-api/automations` - Scheduled tasks
- `/backend-api/calpico` - Group chat
- `/backend-api/images` - DALL-E
- `/backend-api/wham` - Codex IDE

### Claude.ai

```
┌─────────────┐
│   Browser   │  Next.js (RSC) + Webpack
└──────┬──────┘
       │ HTTP/3 (QUIC) - 86%
       ▼
┌─────────────────┐
│   Cloudflare    │  CDN, TLS 1.3
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   GCP L7 LB     │  via: 1.1 google
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Envoy       │  Service mesh
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Chat   │ │ Projects │ │   Sync   │ │ Billing  │ │ Skills/  │  │
│  │/chat_conv│ │/projects │ │/sync/*   │ │/payment  │ │Extensions│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Claude Models  │  Opus, Sonnet, Haiku
└─────────────────┘
```

**Key Services Identified**:
- `/api/chat_conversations` - Core chat
- `/api/completion` - Model inference (SSE)
- `/api/projects` - Project management
- `/api/sync/*` - Google integrations (Drive, Gmail, Calendar)
- `/api/skills`, `/api/dxt`, `/api/mcp` - Extensions

---

## Streaming Protocol Comparison

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Transport** | SSE via POST | SSE via POST |
| **Content-Type** | `text/event-stream` | `text/event-stream` |
| **Delta format** | JSON-patch (`path`, `op`, `value`) | Token deltas |
| **Compression** | Not observed | Brotli |
| **Thinking support** | Extended thinking events | `paprika_mode: "extended"` |
| **Event types** | 25+ types documented | Fewer documented |

### ChatGPT Event Types (Captured)

```
message_start, content_block_start, content_block_delta, content_block_stop,
message_delta, message_stop, status, error, ping, message_limit,
tool_use events, image events, etc.
```

### Claude.ai Event Types (Partial)

```
message_start (with trace_id), content_block_delta, message_stop
```

---

## Data Model Comparison

### Conversation Structure

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **ID format** | 32-char hex (various prefixes) | UUIDv7 |
| **Message structure** | Flat with parent_uuid | Tree with parent_uuid |
| **Branching** | `current_leaf_message_uuid` | `current_leaf_message_uuid` |
| **Model field** | `model` in conversation | `model` in conversation |

### ID Formats

**ChatGPT**:
```
Conversations: 36-char UUID
Messages: 36-char UUID
Gizmos: g-{13-char}
Connectors: connector_{32-char-hex}
Tasks: sched_{hex}
Rooms: 32-char hex
```

**Claude.ai**:
```
Conversations: UUIDv7 (019xxxxx-xxxx-7xxx-...)
Messages: UUIDv7
Projects: UUIDv7
Organizations: UUIDv7
```

---

## Extension Ecosystem Comparison

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Web connectors** | ~40+ (OAuth) | ~5 (Sync integrations) |
| **Desktop extensions** | N/A (GPT Store) | 52 (MCP protocol) |
| **First-party tools** | Custom GPTs | Skills (10) |
| **Marketplace** | GPT Store | Extension directory |
| **Protocol** | Proprietary | MCP (open standard) |
| **Download counts** | Not visible | Visible (1.5M+ total) |

### Extension Categories

**ChatGPT Connectors**: GitHub, Box, Dropbox, Gmail, Google Calendar

**Claude.ai Extensions**:
- First-party (8): Filesystem, chrome-control, Notes, iMessage, Spotify, Excel, Word, PowerPoint
- Third-party (44): Windows-MCP (737K downloads), pdf-toolkit, Figma, Tableau

---

## Performance Characteristics

| Metric | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Metadata fetch** | Not measured | 50-150ms |
| **CRUD operations** | Not measured | 200-700ms |
| **Completion TTFB** | Not measured | ~1s |
| **Completion total** | Not measured | 4-5s |
| **Page load (DOMContentLoaded)** | Not measured | ~1.7s |
| **Extension payload** | Not measured | ~190KB |

---

## Observability

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Distributed tracing** | Not observed | Honeycomb (trace_id in SSE) |
| **Analytics** | Not observed | Segment.io |
| **Feature flags** | Not observed | Statsig |
| **Push notifications** | FCM | FCM |

---

## Security Models

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Anti-abuse** | Sentinel (prepare/finalize) | Not documented |
| **Auth** | Session cookies | Session cookies |
| **Tenant isolation** | Org-scoped APIs | Org-scoped APIs |
| **TLS** | 1.2/1.3 | TLS 1.3 (required for H3) |

---

## Coverage Gaps

### ChatGPT (Well-Covered)

- Streaming protocol (deep-dive)
- Durability patterns (deep-dive)
- GPTs/Gizmos (deep-dive)
- Memories (deep-dive)
- Sentinel/anti-abuse (deep-dive)
- Tasks/automations (deep-dive)
- Codex/WHAM (deep-dive)
- Calpico/rooms (deep-dive)
- Images/DALL-E (deep-dive)
- Modes (deep-dive)
- Settings (deep-dive)

### Claude.ai (Gaps)

- Streaming protocol detail
- Memory/personalization system
- Agent modes (if any)
- Scheduled tasks (if any)
- Group chat (if any)
- Image generation (if any)
- Full settings taxonomy

