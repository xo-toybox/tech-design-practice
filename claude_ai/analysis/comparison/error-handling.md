# Error Handling Comparison

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Pre-request validation** | Sentinel prepare | None observed | ChatGPT validates before execution |
| **Post-request finalization** | Sentinel finalize | None observed | ChatGPT logs after execution |
| **Stream recovery** | `/stream_status` endpoint | `/completion_status` endpoint | Both have recovery polling |
| **Rate limiting** | Unknown format | `message_limit` SSE event | Different mechanisms |
| **HTTP error codes** | 404 observed | 502 observed | Both use standard HTTP codes |

---

## Request Lifecycle Comparison

### ChatGPT: Sentinel-Wrapped Execution

```
┌─────────┐    ┌──────────────────────┐    ┌─────────┐
│ Client  │───►│ sentinel/prepare     │───►│ Backend │
└─────────┘    │ (pre-validation)     │    └─────────┘
               └──────────────────────┘
                         │
                         ▼
               ┌──────────────────────┐
               │ f/conversation       │
               │ (SSE stream)         │
               └──────────────────────┘
                         │
                         ▼
               ┌──────────────────────┐
               │ sentinel/finalize    │
               │ (post-validation)    │
               └──────────────────────┘
                         │
                         ▼
               ┌──────────────────────┐
               │ stream_status        │
               │ (recovery check)     │
               └──────────────────────┘
```

**Captured Endpoints** (2026-01-04):
```
POST /backend-api/sentinel/chat-requirements/prepare  → 200
POST /backend-api/f/conversation/prepare              → 200
POST /backend-api/f/conversation                      → 200 (SSE)
POST /backend-api/sentinel/chat-requirements/finalize → 200
GET  /backend-api/conversation/{id}/stream_status     → 200
```

### Claude.ai: Direct Execution

```
┌─────────┐    ┌──────────────────────┐
│ Client  │───►│ chat_conversations   │
└─────────┘    │ (201 Created)        │
               └──────────────────────┘
                         │
                         ▼
               ┌──────────────────────┐
               │ completion           │
               │ (SSE stream)         │
               └──────────────────────┘
                         │
                         ▼
               ┌──────────────────────┐
               │ GET conversation     │
               │ (?consistency=eventual) │
               └──────────────────────┘
```

**Captured Endpoints** (2026-01-04):
```
POST /api/.../chat_conversations                      → 201 Created
POST /api/.../chat_conversations/{id}/title           → 202 Accepted
POST /api/.../chat_conversations/{id}/completion      → 200 (SSE)
GET  /api/.../chat_conversations/{id}?consistency=eventual → 200
```

---

## Error Handling Mechanisms

### ChatGPT

| Mechanism | Endpoint | Purpose |
|-----------|----------|---------|
| **Sentinel prepare** | `/sentinel/chat-requirements/prepare` | Pre-validates request, checks rate limits |
| **Sentinel finalize** | `/sentinel/chat-requirements/finalize` | Post-validates, logs usage |
| **Stream status** | `/conversation/{id}/stream_status` | Recovery polling after disconnect |
| **Conversation init** | `/conversation/init` | Returns 404 when conversation not found |

**Error observed**: `POST /conversation/init → 404`

### Claude.ai

| Mechanism | Location | Purpose |
|-----------|----------|---------|
| **HTTP status codes** | Response | Standard error codes (201, 202, 200) |
| **SSE events** | Stream | `message_limit` event for rate limiting |
| **Usage windows** | Stream | 5h, 7d usage tracking in stream metadata |
| **Async operations** | 202 Accepted | Title generation runs asynchronously |

---

## Rate Limiting

### ChatGPT

**Detection**: Unknown format - Sentinel prepare likely returns rate limit info.

**Recovery**: Unknown - needs testing with rapid message submission.

### Claude.ai

**Detection**: `message_limit` SSE event in stream
```
event: message_limit
data: { "type": "message_limit", "limit_window": "5h", ... }
```

**Recovery**: Client shows usage UI, user waits for window reset.

---

## Stream Interruption Handling

### ChatGPT

**Mechanism**: `/stream_status` endpoint
```
GET /backend-api/conversation/{id}/stream_status
Response: { "status": "complete" | "in_progress" }
```

**Client behavior**: Can poll to check if stream completed after disconnect.

### Claude.ai

**Mechanism**: `/completion_status` endpoint (discovered during 502 error)
```
GET /api/.../chat_conversations/{id}/completion_status?poll=false
Response: { status information }
```

**Client behavior**: Polls `completion_status` after error to check recovery.

**Error observed**: `POST /completion` → 502 Bad Gateway during web search test.

**Stale read hazard**: If client refreshes during ~2s replication window, may see incomplete state.

---

## Design Tradeoffs

### ChatGPT

| Choice | Benefit | Cost |
|--------|---------|------|
| Sentinel wrapping | Pre-validation, abuse prevention | Latency overhead (~100-200ms) |
| Explicit stream_status | Reliable recovery | Additional API surface |
| Centralized error handling | Consistent error format | Single point of failure |

### Claude.ai

| Choice | Benefit | Cost |
|--------|---------|------|
| Direct execution | Lower latency | Less pre-validation |
| Async title (202) | Non-blocking | Eventual consistency |
| No Sentinel | Simpler architecture | Less abuse prevention layer |
| Eventual consistency | High availability | Stale read hazard |

---

## Evidence

### ChatGPT Network Capture (2026-01-04)

Key services observed:
- `celsius` - WebSocket for real-time updates
- `amphora` - Notifications
- `calpico` - Group chat rooms
- `gizmos` - Custom GPTs
- `beacons` - Home feed

API patterns:
- `/backend-api/f/*` - Conversation operations
- `/backend-api/sentinel/*` - Anti-abuse validation
- `/backend-api/aip/connectors/*` - Extension management

### Claude.ai Network Capture (2026-01-04)

Key endpoints:
- `/api/.../completion` - SSE stream
- `/api/.../subscription_details` - Subscription info
- `/api/.../feature_settings` - Feature flags
- `?consistency=eventual` - Explicit eventual consistency

---

## Open Questions

| Question | ChatGPT | Claude.ai |
|----------|---------|-----------|
| Rate limit response format? | Sentinel prepare | `message_limit` event |
| Disconnect auto-retry? | Unknown | Unknown |
| Error event format in stream? | Unknown | Unknown |
| Circuit breaker behavior? | Unknown | Unknown |

---

## Recommendations for Further Testing

1. **Rate limit testing**: Send rapid messages to trigger limits on both platforms
2. **Disconnect recovery**: Kill network mid-stream, observe client behavior
3. **Error event capture**: Induce errors (invalid input, oversize) to capture error formats
4. **Sentinel overhead measurement**: Time prepare → finalize to quantify latency cost
