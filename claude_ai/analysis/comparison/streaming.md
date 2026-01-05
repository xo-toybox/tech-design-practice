# Streaming Protocol Comparison: ChatGPT vs Claude.ai

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Transport** | POST + SSE | POST + SSE | Same pattern |
| **Why POST?** | Need request body for messages | Need request body for messages | Same rationale |
| **Delta format** | JSON-patch operations | Direct token deltas | ChatGPT more structured |
| **Version marker** | `delta_encoding: v1` | None | ChatGPT has explicit version |
| **Thinking blocks** | Server-side only (inferred) | Explicit `thinking` content type | Claude more transparent |
| **Resume capability** | JWT token in stream | Not observed | ChatGPT has recovery |
| **Metadata richness** | Rich (region, model, flags) | Minimal | ChatGPT more verbose |

---

## Protocol Choice: Why POST-based SSE?

Both products use the same pattern: **POST request with SSE response**.

### Why Not EventSource?

| Constraint | EventSource | fetch() + SSE |
|------------|-------------|---------------|
| HTTP method | GET only | Any (POST used) |
| Request body | Not supported | Supported |
| Custom headers | Limited | Full control |
| Reconnection | Automatic | Manual |
| Connection limits | 6/domain | None |

**Both need POST** to send conversation/message payload in request body.

### Why Not WebSocket?

| Constraint | WebSocket | SSE |
|------------|-----------|-----|
| Direction | Bidirectional | Server → Client |
| HTTP/3 support | No | Yes |
| Complexity | Higher | Lower |
| Use case fit | Chat apps | LLM streaming |

LLM responses are inherently unidirectional (server → client streaming).

---

## Request Flow Comparison

### ChatGPT

```
1. POST /f/conversation/prepare      (context setup)
2. POST /sentinel/chat-requirements/prepare  (anti-abuse)
3. POST /f/conversation              (main streaming)
4. POST /sentinel/chat-requirements/finalize (logging)
```

### Claude.ai

```
1. POST /completion                  (streaming, includes all context)
```

**Key Difference**: ChatGPT has explicit prepare/finalize phases with anti-abuse checks.

---

## Event Format Comparison

### ChatGPT Events

**Format**: Named events with JSON payloads

```
event: delta_encoding
data: "v1"

data: {"type": "resume_conversation_token", "token": "eyJhbGci..."}

data: {"type": "input_message", "input_message": {...}}

data: {"type": "server_ste_metadata", "metadata": {...}}

data: {"type": "message_marker", "marker": "user_visible_token", "event": "first"}

event: delta
data: {"p": "/message/content/parts/0", "o": "append", "v": "content text"}

event: delta
data: {"v": " more text"}

event: delta
data: {"p": "", "o": "patch", "v": [{"p": "/message/status", "o": "replace", "v": "finished_successfully"}]}

data: {"type": "message_stream_complete"}
```

**Event Types**:
- `delta_encoding` - Protocol version
- `delta` - Content updates (JSON-patch)
- Unnamed data events for metadata

### Claude.ai Events

**Format**: Named events with JSON payloads

```
event: message_start
data: {"type":"message_start","message":{"id":"...","trace_id":"...","role":"assistant"}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"..."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: content_block_start
data: {"type":"content_block_start","index":1,"content_block":{"type":"text"}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"..."}}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}

event: message_limit
data: {"type":"message_limit","message_limit":{"windows":{"5h":{"utilization":0.04}}}}
```

**Event Types**:
- `message_start` - Response initialization
- `content_block_start/delta/stop` - Content streaming
- `message_delta` - Completion signal
- `message_limit` - Usage tracking

---

## Delta Format Deep Dive

### ChatGPT: JSON-patch Operations

Uses RFC 6902-like operations:

```json
// Simple append (most common)
{"v": "content to append"}

// Full operation
{
  "p": "/message/content/parts/0",  // path
  "o": "append",                    // operation
  "v": "content"                    // value
}

// Batch operations
{
  "p": "",
  "o": "patch",
  "v": [
    {"p": "/message/content/parts/0", "o": "append", "v": "final text"},
    {"p": "/message/status", "o": "replace", "v": "finished_successfully"},
    {"p": "/message/end_turn", "o": "replace", "v": true}
  ]
}
```

**Operations**: `add`, `append`, `replace`, `patch`

### Claude.ai: Direct Token Deltas

```json
// Thinking delta
{"type": "thinking_delta", "thinking": "token text"}

// Text delta
{"type": "text_delta", "text": "token text"}

// Thinking summary delta
{"type": "thinking_summary_delta", "thinking_summary": "..."}
```

**Simpler**: Just type + content, no path/operation semantics.

---

## Extended Thinking Comparison

### ChatGPT

**Captured behavior**: Thinking appears server-side only.

Metadata indicates thinking mode:
```json
{
  "model_slug": "gpt-5-2-thinking",
  "thinking_effort": "extended",
  "did_auto_switch_to_reasoning": false
}
```

But no thinking block events were captured in stream. The `message_marker` with `user_visible_token` suggests boundary between internal thinking and visible response.

### Claude.ai

**Explicit thinking blocks** in stream:

```
event: content_block_start
data: {"type":"content_block_start","content_block":{"type":"thinking"}}

event: content_block_delta
data: {"delta":{"type":"thinking_delta","thinking":"The user wants..."}}

event: content_block_stop
```

Then followed by:
```
event: content_block_start
data: {"content_block":{"type":"text"}}

event: content_block_delta
data: {"delta":{"type":"text_delta","text":"Hello,"}}
```

**Key Difference**: Claude.ai streams thinking to client. ChatGPT may not.

---

## Metadata Comparison

### ChatGPT Server Metadata (Captured)

```json
{
  "model_slug": "gpt-5-2-thinking",
  "thinking_effort": "extended",
  "plan_type": "plus",
  "cluster_region": "westus3",
  "conduit_prewarmed": true,
  "fast_convo": true,
  "warmup_state": "warm",
  "did_auto_switch_to_reasoning": false
}
```

**Rich**: Region, warmup state, subscription tier, performance flags.

### Claude.ai Message Start

```json
{
  "id": "chatcompl_01LkfMtWr6o9PUt3Z7w18YEd",
  "uuid": "019b8680-3afb-731f-88ab-13fba59cab9c",
  "trace_id": "db7577439d3cacb9818e102c307ed657",
  "request_id": "req_011CWmRgdwSkKf1UMebexS57",
  "role": "assistant",
  "model": "claude-opus-4-5-20251101"
}
```

**Minimal**: ID, model, role, trace correlation.

---

## Resume/Recovery

### ChatGPT

Includes `resume_conversation_token` JWT in stream:

```json
{
  "type": "resume_conversation_token",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "conversation_id": "695a0d96-..."
}
```

Enables reconnection after network interruption.

### Claude.ai

No resume token observed in stream. Recovery mechanism unknown.

---

## Usage Tracking

### ChatGPT

Not observed in captured streams.

### Claude.ai

`message_limit` event with utilization windows:

```json
{
  "type": "message_limit",
  "message_limit": {
    "type": "within_limit",
    "windows": {
      "5h": {"utilization": 0.04},
      "7d": {"utilization": 0.09}
    }
  }
}
```

**Real-time usage feedback** to client.

---

## Error Handling

### ChatGPT

```json
{"type": "error", "error": {"type": "rate_limit_error", "message": "..."}}
```

### Claude.ai

```
event: error
data: {"type": "error", "error": {...}}
```

Similar pattern, event-based errors in stream.

---

## Performance Characteristics

| Metric | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **TTFB** | ~300-2000ms | ~1s |
| **Tokens/sec** | 30-80 | Unknown |
| **Compression** | Not observed | Brotli |
| **Protocol** | HTTP/1.1, HTTP/2 | HTTP/3 (86%) |

---

## Design Philosophy Comparison

### ChatGPT

- **Structured updates**: JSON-patch enables complex state transitions
- **Session recovery**: JWT resume tokens for reliability
- **Rich metadata**: Detailed server state exposed
- **Separated phases**: Prepare → Stream → Finalize
- **Opaque thinking**: Server-side reasoning, visible output only

### Claude.ai

- **Simple tokens**: Direct content streaming
- **Transparent thinking**: Thinking blocks visible in stream
- **Minimal metadata**: Focus on essential fields
- **Unified request**: Single endpoint for streaming
- **Usage visibility**: Real-time utilization feedback

---

## Sources

### ChatGPT

- deep-dive-streaming.md
- JavaScript fetch interceptor capture (2026-01-04)
- GPT-5.2 Thinking model session

### Claude.ai

- communication-api.md
- communication-api-rest.md
- Network captures (2026-01-04)
