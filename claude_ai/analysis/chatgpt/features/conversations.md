# Conversations: Streaming & Durability

Core chat system covering message streaming, persistence, and recovery.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| JSON-patch deltas | Structured `p`/`o`/`v` operations | Complex parsing, bandwidth |
| Persist before stream | Server saves message before streaming | Higher initial latency |
| Resume token in stream | JWT for recovery | Bandwidth overhead |
| Thinking server-side only | No thinking blocks streamed | Less transparency |
| Sentinel prepare/finalize | Anti-abuse checks on every message | Extra round trips |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MESSAGE FLOW                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CLIENT                          SERVER                              │
│    │                               │                                 │
│    │ 1. POST /f/conversation/prepare                                │
│    │ ─────────────────────────────>│                                │
│    │                               │                                 │
│    │ 2. POST /sentinel/prepare     │                                │
│    │ ─────────────────────────────>│                                │
│    │                               │                                 │
│    │ 3. POST /f/conversation       │                                │
│    │ ─────────────────────────────>│                                │
│    │                               │  ┌─────────────────────────┐   │
│    │   resume_conversation_token   │  │ Server persists user    │   │
│    │ <═════════════════════════════│  │ message BEFORE stream   │   │
│    │                               │  └─────────────────────────┘   │
│    │   input_message (with ID)     │                                │
│    │ <═════════════════════════════│                                │
│    │                               │                                │
│    │   delta events (tokens)       │                                │
│    │ <═════════════════════════════│                                │
│    │                               │                                │
│    │   message_stream_complete     │                                │
│    │ <═════════════════════════════│                                │
│    │                               │                                │
│    │ 4. POST /sentinel/finalize    │                                │
│    │ ─────────────────────────────>│                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Streaming Protocol

### Why POST-based SSE?

| Aspect | fetch() + POST | EventSource |
|--------|----------------|-------------|
| HTTP method | Any (POST used) | GET only |
| Request body | Supported | Not supported |
| Custom headers | Full control | Limited |
| Reconnection | Manual | Automatic |

ChatGPT needs POST to send message body.

### Event Format

**Protocol version marker**:
```
event: delta_encoding
data: "v1"
```

**Event types**:
| Event | Purpose |
|-------|---------|
| `resume_conversation_token` | JWT for recovery |
| `input_message` | Echo of user message with ID |
| `server_ste_metadata` | Model, region, flags |
| `message_marker` | Stream position |
| `delta` | Content updates |
| `message_stream_complete` | Completion signal |

### Delta Operations

**Simple append** (most common):
```json
{"v": "content to append"}
```

**Full JSON-patch**:
```json
{
  "p": "/message/content/parts/0",
  "o": "append",
  "v": "content"
}
```

**Batch operations**:
```json
{
  "p": "",
  "o": "patch",
  "v": [
    {"p": "/message/content/parts/0", "o": "append", "v": "final"},
    {"p": "/message/status", "o": "replace", "v": "finished_successfully"},
    {"p": "/message/end_turn", "o": "replace", "v": true}
  ]
}
```

Operations: `add`, `append`, `replace`, `patch`

### Server Metadata

| Field | Example | Purpose |
|-------|---------|---------|
| `model_slug` | `gpt-5-2-thinking` | Model ID |
| `thinking_effort` | `extended` | Thinking mode |
| `plan_type` | `plus` | Subscription tier |
| `cluster_region` | `westus3` | Server region |
| `warmup_state` | `warm` | Model readiness |

---

## Durability Model

### Why No Data Loss?

1. **Persist before streaming**: User message gets ID before any tokens stream
2. **Server authoritative**: Always fetches from server on page load
3. **Recovery token**: JWT enables mid-stream reconnection
4. **Explicit completion**: `message_stream_complete` signals end

### Stream Evidence

```
data: {"type": "resume_conversation_token", "token": "eyJhbGci...", "conversation_id": "..."}

data: {"type": "input_message", "input_message": {"id": "874836bf-...", "status": "finished_successfully"}}

... delta events ...

data: {"type": "message_stream_complete", "conversation_id": "..."}
```

Key observations:
- User message has ID immediately (server-assigned)
- Status is `finished_successfully` (already persisted)
- Resume token provided early (recovery)

### Recovery Mechanisms

**Page refresh during stream**:
1. `GET /conversation/{id}` - Load state
2. `GET /conversation/{id}/stream_status` - Check completion
3. UI shows partial or retries

**Stream disconnect**:
- Use `resume_conversation_token` JWT
- Contains: conversation ID, message ID, stream position, expiration

---

## Extended Thinking

### Observed Behavior

Metadata indicates thinking mode:
```json
{
  "model_slug": "gpt-5-2-thinking",
  "thinking_effort": "extended",
  "did_auto_switch_to_reasoning": false
}
```

**Key finding**: No thinking block events captured in stream. The `message_marker` with `user_visible_token` suggests thinking occurs server-side before visible response.

---

## API Endpoints

See [API-REFERENCE.md](../API-REFERENCE.md) for complete list.

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/f/conversation/prepare` | POST | Prepare context |
| `/backend-api/f/conversation` | POST | Send message (SSE) |
| `/backend-api/conversation/{id}` | GET | Load conversation |
| `/backend-api/conversation/{id}/stream_status` | GET | Check completion |

---

## Performance

| Phase | Duration |
|-------|----------|
| DNS + TLS | ~50ms (cached) |
| Prepare | ~50-100ms |
| TTFB | ~300-2000ms |
| Token rate | ~30-80 tokens/sec |
| Finalize | ~50-100ms |

---

## Error Handling

| Error Type | Handling |
|------------|----------|
| Connection lost | Reconnect + resume token |
| Rate limited | Show error + retry |
| Content blocked | Show warning |
| Timeout | May auto-recover |

Error event format:
```json
{"type": "error", "error": {"type": "rate_limit_error", "message": "..."}}
```

