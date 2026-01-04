# claude.ai Communication Patterns Overview

## Three Communication Channels

claude.ai uses three distinct communication patterns, each optimized for different use cases:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMMUNICATION PATTERNS                            │
├─────────────────┬─────────────────────┬─────────────────────────────────┤
│      REST       │        SSE          │           FCM                   │
│   (Request →    │   (Server →         │    (Server →                    │
│    Response)    │    Client Stream)   │     Device Push)                │
├─────────────────┼─────────────────────┼─────────────────────────────────┤
│ CRUD operations │ LLM token streaming │ Out-of-band notifications       │
│ Metadata fetch  │ Real-time updates   │ Background alerts               │
│ Settings/config │ Extended thinking   │ Cross-device sync               │
└─────────────────┴─────────────────────┴─────────────────────────────────┘
```

---

## Pattern Comparison

| Aspect | REST | SSE | FCM |
|--------|------|-----|-----|
| **Direction** | Bidirectional | Server → Client | Server → Device |
| **Connection** | Per-request | Long-lived stream | Push (no connection) |
| **Latency** | 50-800ms | Real-time tokens | Best-effort |
| **Use Case** | CRUD, metadata | LLM streaming | Offline notifications |
| **Protocol** | HTTP/3 JSON | HTTP/3 text/event-stream | Firebase |
| **Payload** | JSON objects | Newline-delimited events | Small JSON |

---

## REST API Pattern

**When Used**: All non-streaming operations

### Characteristics
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response bodies
- Organization-scoped URLs: `/api/organizations/{uuid}/...`
- Pagination: offset-based (`limit`, `offset`, `total`)

### Latency Profile

| Category | Latency | Examples |
|----------|---------|----------|
| Fast (<150ms) | 100-150ms | OAuth status, model configs, sync settings |
| Medium (150-300ms) | 150-250ms | Feature flags, conversations list, extensions |
| Slow (>300ms) | 300-850ms | Billing (Stripe), account profile, subscription |

### Key Endpoints
```
/chat_conversations     - Conversation CRUD
/projects               - Project management
/feature_settings       - Feature flags
/dxt/extensions         - Extension manifests (190KB)
/notification/preferences - Push notification settings
```

---

## Real-time Updates: SSE Streaming Pattern

**When Used**: LLM completions (token-by-token streaming)

### Request Details
- **Method**: `POST`
- **Endpoint**: `/api/organizations/{org_uuid}/chat_conversations/{conv_uuid}/completion`
- **Request Headers**:
  - `Accept: text/event-stream`
  - `Content-Type: application/json`
  - `anthropic-client-platform: web_claude_ai`
  - `anthropic-device-id: {device_uuid}`
- **Response Headers**:
  - `cache-control: no-cache`
  - `content-encoding: br` (Brotli compression)

### Why SSE (not WebSocket)?
- Unidirectional streaming (server → client) fits LLM response pattern
- Works over standard HTTP/2 and HTTP/3 with multiplexing
- Simpler than WebSocket for request-response with streaming

### Why fetch() (not EventSource)?
The browser's `EventSource` API only supports **GET** requests, but the completion endpoint uses **POST** to send the conversation payload:

```javascript
const response = await fetch('/api/.../completion', {
  method: 'POST',
  headers: { 'Accept': 'text/event-stream' },
  body: JSON.stringify({ prompt, model, ... })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE format: "event: ...\ndata: {...}\n\n"
}
```

### Event Flow
```
message_start
  → content_block_start (type: "thinking")
    → content_block_delta* (thinking tokens)
  → content_block_stop
  → content_block_start (type: "text")
    → content_block_delta* (response tokens)
  → content_block_stop
→ message_delta (stop_reason)
→ message_limit (usage tracking)
```

### Event Types

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `message_start` | Initialize streaming | `id`, `uuid`, `trace_id`, `request_id`, `model`, `role` |
| `content_block_start` | Begin content block | `type` ("thinking" or "text"), `index`, `start_timestamp` |
| `content_block_delta` | Stream tokens | `thinking_delta`, `text_delta`, `thinking_summary_delta` |
| `content_block_stop` | End content block | `index`, `stop_timestamp` |
| `message_delta` | Message complete | `stop_reason` ("end_turn"), `stop_sequence` |
| `message_limit` | Usage tracking | `remaining`, `utilization`, `windows` |

### Sample Events

```
event: message_start
data: {"type":"message_start","message":{"id":"chatcompl_01LkfMtWr6o9PUt3Z7w18YEd",
  "uuid":"019b8680-3afb-731f-88ab-13fba59cab9c","trace_id":"db7577439d3cacb9818e102c307ed657",
  "request_id":"req_011CWmRgdwSkKf1UMebexS57","role":"assistant","content":[]}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking",
  "start_timestamp":"2026-01-04T00:55:11.167056Z","thinking":"","summaries":[]}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"The user wants"}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"Hello,"}}

event: message_limit
data: {"type":"message_limit","message_limit":{"type":"within_limit",
  "windows":{"5h":{"utilization":0.04},"7d":{"utilization":0.09}}}}
```

### Key Observations
- **Extended thinking**: Separate `thinking` content block type
- **Streaming summaries**: `thinking_summary_delta` alongside thinking tokens
- **Tracing**: `trace_id` correlates with Honeycomb distributed traces
- **Usage tracking**: Real-time utilization windows (5h, 7d) in `message_limit`
- **Format**: Newline-delimited events (`\r\n\r\n` between events)

### Evidence
- Completion request uses `POST` method (EventSource is GET-only)
- Intercepted `EventSource` constructor showed 0 instances created
- Intercepted `WebSocket` constructor showed 0 connections
- No `application/grpc-web` content-types detected

---

## FCM Push Pattern

**When Used**: Out-of-band notifications when user is away

### Characteristics
- Firebase Cloud Messaging (Google)
- Per-feature opt-in (push and/or email)
- Device registration via `/notification/channels`

### Architecture
```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  claude.ai       │────▶│  FCM Service     │────▶│  User Device     │
│  Backend         │     │  (Google)        │     │  (Browser/App)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                                                 │
         └─────────── /notification/channels ──────────────┘
                      (registration token)
```

### Notification Preferences

From Settings UI:

| Setting | Description |
|---------|-------------|
| **Response completions** | "Get notified when Claude has finished a response. Most useful for long-running tasks like tool calls, Research, and Claude Code on the web." |
| **Emails from Claude Code** | "Get an email when Claude Code on the web has finished building or needs your response." |

API features (`/notification/preferences`): `completion`, `compass`, `project_sharing`, `bogosort`, `tiny_pancakes`

### Channel Registration
```json
{
  "channel_type": "FCM",
  "status": "ACTIVE",
  "registration_token": "dUwRmx-AlSJGVi42...",
  "device_id": "5bd42e02-b09a-4634-9dd3-683dbc12e494",
  "client_platform": "web_claude_ai"
}
```

### User State Lifecycle

The three patterns serve different user states:

```
┌─────────────────────────────────────────────────────────┐
│  User Active (tab foreground)                           │
│  └─► SSE stream for real-time token delivery            │
│                                                         │
│  User Navigates Away (long-running task in progress)    │
│  └─► FCM push when task completes                       │
│      Use cases: Research, tool calls, Claude Code       │
│                                                         │
│  User Returns (opens tab / navigates back)              │
│  └─► REST GET to fetch current state                    │
│      ⚠️ May see stale data during ~2s replication lag   │
└─────────────────────────────────────────────────────────┘
```

Complementary, not competing - each solves a different problem:
- **SSE**: Real-time streaming for active sessions
- **FCM**: Alert when long-running tasks complete (Research, tool calls, Claude Code)
- **REST**: Fetch current state on page load/refresh

---

## Pattern Selection Guide

| Scenario | Pattern | Reason |
|----------|---------|--------|
| Fetch conversation list | REST | One-time data retrieval |
| Load user settings | REST | Small, cacheable payload |
| Stream LLM response | SSE | Real-time token delivery |
| Show thinking process | SSE | Extended thinking blocks |
| Alert when Research completes | FCM | Long-running, user may navigate away |
| Alert when tool calls finish | FCM | Long-running, user may navigate away |
| Update extension list | REST | Large but infrequent |

---

## Trade-offs Analysis

### REST vs GraphQL
- **Choice**: REST
- **Trade-off**: More requests but simpler implementation
- **Evidence**: ~250 requests on page load, each small and focused

### SSE vs WebSocket
- **Choice**: SSE
- **Trade-off**: Unidirectional but works over HTTP/3
- **Evidence**: No WebSocket connections observed; POST+SSE pattern

### Push vs Polling
- **Choice**: FCM push for notifications, polling for sync status
- **Trade-off**: Push for critical alerts, polling for progress
- **Evidence**: `/sync/ingestion/*/progress` uses polling; FCM for completion

---

## Related Documents

- **[communication-api-rest.md](communication-api-rest.md)** - REST endpoint catalog and latency analysis
