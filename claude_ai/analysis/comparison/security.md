# Security Architecture Comparison

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Anti-abuse layer** | Sentinel (prepare/finalize) | None observed | ChatGPT has explicit pre/post validation |
| **Pre-request validation** | `/sentinel/chat-requirements/prepare` | None | ChatGPT validates before execution |
| **Post-request logging** | `/sentinel/chat-requirements/finalize` | None | ChatGPT logs after execution |
| **Latency overhead** | ~100-200ms | 0ms | Sentinel adds round trips |
| **Content filtering** | Server-side (not exposed) | Server-side (not exposed) | Both filter in model layer |
| **Analytics/telemetry** | CES, A/B testing | Honeycomb, a-api.anthropic.com | Different telemetry stacks |

---

## Architecture Comparison

### ChatGPT: Sentinel-Wrapped Execution

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│ /f/conversation/prepare         │  ← Context preparation
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ /sentinel/chat-requirements/    │  ← PRE-VALIDATION
│ prepare                         │     Anti-abuse check
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ /f/conversation                 │  ← Message execution (SSE)
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ /sentinel/chat-requirements/    │  ← POST-VALIDATION
│ finalize                        │     Usage logging
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ /stream_status                  │  ← Recovery check
└─────────────────────────────────┘
```

**Captured Endpoints (2026-01-04)**:
```
POST /backend-api/f/conversation/prepare                    → 200
POST /backend-api/sentinel/chat-requirements/prepare        → 200
POST /backend-api/f/conversation                            → 200 (SSE)
POST /backend-api/sentinel/chat-requirements/finalize       → 200
GET  /backend-api/conversation/{id}/stream_status           → 200
```

### Claude.ai: Direct Execution

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│ /chat_conversations             │  ← Create conversation (201)
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ /chat_conversations/{id}/title  │  ← Async title (202)
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ /chat_conversations/{id}/       │  ← Message execution (SSE)
│ completion                      │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ GET /chat_conversations/{id}    │  ← State fetch
│ ?consistency=eventual           │     (eventual consistency)
└─────────────────────────────────┘
```

**Captured Endpoints (2026-01-04)**:
```
POST /api/.../chat_conversations                            → 201 Created
POST /api/.../chat_conversations/{id}/title                 → 202 Accepted
POST /api/.../chat_conversations/{id}/completion            → 200 (SSE)
GET  /api/.../chat_conversations/{id}?consistency=eventual  → 200
```

**Key observation**: No `/sentinel`, `/prepare`, or `/finalize` endpoints observed.

---

## Sentinel Deep-Dive (ChatGPT)

### Purpose

Sentinel appears to be a universal anti-abuse gateway that wraps all user-initiated actions:

| Function | Purpose |
|----------|---------|
| **prepare** | Pre-validates request, checks rate limits, abuse patterns |
| **finalize** | Post-validates response, logs usage, tracks quotas |

### Timing Overhead

| Phase | Estimated Duration |
|-------|-------------------|
| Sentinel prepare | ~50-100ms |
| Sentinel finalize | ~50-100ms |
| **Total overhead** | ~100-200ms |

### Tradeoffs

| Benefit | Cost |
|---------|------|
| Pre-validation prevents wasted compute | Added latency |
| Centralized abuse detection | Single point of failure risk |
| Usage tracking for billing | Extra network round trips |
| Audit trail | Additional infrastructure |

---

## Claude.ai Security Model

### Observed Characteristics

1. **No explicit pre-validation layer** - Requests go directly to execution
2. **Content filtering in model layer** - Not exposed as separate service
3. **Rate limiting via SSE events** - `message_limit` event in stream
4. **Telemetry separate from execution** - `a-api.anthropic.com` endpoints

### Telemetry Endpoints

```
POST https://a-api.anthropic.com/v1/m    → 200  (metrics?)
POST https://a-api.anthropic.com/v1/t    → 200  (telemetry)
POST https://a-api.anthropic.com/v1/p    → 200  (pageview?)
POST https://api.honeycomb.io/v1/traces  → 200  (distributed tracing)
```

### Tradeoffs

| Benefit | Cost |
|---------|------|
| Lower latency (no pre-validation) | Less explicit abuse prevention |
| Simpler request flow | Content filtering less visible |
| Direct execution | Potentially higher compute waste on abusive requests |

---

## Design Philosophy Comparison

### ChatGPT: Defense-in-Depth

```
Request → [Sentinel Gate] → [Execution] → [Sentinel Gate] → Response
```

**Philosophy**: Validate before and after every action
- Pre-validation catches abuse early
- Post-validation ensures logging/billing
- Explicit separation of concerns

### Claude.ai: Trust-but-Verify

```
Request → [Execution + Inline Filtering] → Response
```

**Philosophy**: Handle filtering inline with execution
- Model-level content filtering
- Rate limits communicated via stream
- Simpler architecture, fewer moving parts

---

## Content Filtering

### ChatGPT

Content filtering is not directly exposed in network traffic. Likely handled:
- Server-side before/during generation
- Possibly in Sentinel prepare phase
- Model-level safety training

### Claude.ai

Content filtering is not directly exposed in network traffic. Likely handled:
- Server-side during generation
- Model-level Constitutional AI training
- Inline with completion generation

**Note**: Neither platform exposes content moderation endpoints in client-observable traffic.

---

## Rate Limiting

### ChatGPT

**Detection**: Unknown format - likely in Sentinel prepare response
**Recovery**: Unknown - needs testing

### Claude.ai

**Detection**: `message_limit` SSE event in stream
```
event: message_limit
data: { "type": "message_limit", "limit_window": "5h", ... }
```

**Recovery**: Client shows usage UI, user waits for window reset

---

## Open Questions

| Question | ChatGPT | Claude.ai |
|----------|---------|-----------|
| Sentinel prepare payload? | Unknown | N/A |
| Sentinel finalize payload? | Unknown | N/A |
| Content filter response format? | Unknown | Unknown |
| Rate limit trigger threshold? | Unknown | Unknown |
| Abuse detection algorithms? | Unknown | Unknown |

---

## Recommendations for Further Testing

1. **Sentinel payload capture**: Examine prepare/finalize request/response bodies
2. **Rate limit testing**: Send rapid messages to trigger limits
3. **Content filter testing**: Send borderline content to observe filtering behavior
4. **Error response analysis**: Capture and analyze moderation error formats
5. **Timing measurement**: Quantify exact Sentinel overhead with multiple samples
