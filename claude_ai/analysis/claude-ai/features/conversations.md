# Conversations: Streaming & Durability

## Key Tradeoffs

| Decision | Choice | Cost |
|----------|--------|------|
| Eventually consistent reads | Faster responses | ~2s stale window |
| Last-write-wins | No conflict resolution complexity | Data loss on re-submit |
| No idempotency layer | Simpler backend | Duplicate risk |
| Async title generation | 202 Accepted, non-blocking | Title may lag |
| Message tree structure | Enables branching/editing | Complicates conflict resolution |

**Critical Issue**: Re-submitting during stale read window permanently deletes first message.

---

## Architecture

### Message Flow

```
Client                          Primary                         Replica
   |                               |                               |
   |--POST /completion (msg A)---->|                               |
   |<===200 + SSE stream===========|                               |
   |                               |---replication (~2s lag)------>|
   |                               |                               |
   | [REFRESH]                     |                               |
   |--GET /?consistency=eventual---------------------------------->|
   |<--{ messages: [] } STALE-------------------------------------|
   |                               |                               |
   | [User thinks failed]          |                               |
   |--POST /completion (msg B)---->|                               |
   |                               | OVERWRITES msg A              |
```

### Message Tree Structure

```json
{
  "uuid": "e50688e8-b3bb-4156-8ca3-2349201f299e",
  "name": "Conversation title",
  "current_leaf_message_uuid": "...",
  "chat_messages": [
    { "uuid": "...", "parent_uuid": null, "text": "...", "sender": "human" },
    { "uuid": "...", "parent_uuid": "...", "text": "...", "sender": "assistant" }
  ],
  "settings": {
    "paprika_mode": "extended",
    "enabled_saffron": true
  }
}
```

- `parent_uuid` links form a tree (not flat list)
- `current_leaf_message_uuid` points to active branch tip
- `tree=True` query param returns full tree structure
- Enables conversation branching and edit history

---

## Streaming Protocol

### SSE via POST + fetch

The browser's `EventSource` API only supports GET, but completion uses POST:

```javascript
const response = await fetch('/api/.../completion', {
  method: 'POST',
  headers: { 'Accept': 'text/event-stream' },
  body: JSON.stringify({ prompt, model, ... })
});

const reader = response.body.getReader();
// Manual SSE parsing
```

### Event Types

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `message_start` | Initialize | `trace_id`, `request_id`, `model` |
| `content_block_start` | Begin block | `type` ("thinking"/"text") |
| `content_block_delta` | Stream tokens | `thinking_delta`, `text_delta` |
| `content_block_stop` | End block | `stop_timestamp` |
| `message_delta` | Complete | `stop_reason` |
| `message_limit` | Usage | `remaining`, `utilization` |

### Extended Thinking

Separate content block type for thinking:

```
event: content_block_start
data: {"type":"content_block_start","content_block":{"type":"thinking",...}}

event: content_block_delta
data: {"delta":{"type":"thinking_delta","thinking":"The user wants..."}}
```

---

## Consistency Model

| Aspect | Behavior |
|--------|----------|
| Read consistency | Eventually consistent |
| Replication lag | ~2 seconds |
| Partial replication | Title before message content |
| Write conflict | Last-write-wins (no merge) |
| Idempotency | None |

### Empirical Test: Stale Read Window

**T0: Submit message**
```
POST /completion -> 200 + SSE stream
```

**T1: Refresh immediately**
```
GET /conversation?consistency=eventual
-> { "name": "Title", "chat_messages": [] }  <- STALE
```

**T2: Wait ~2s, refresh again**
```
GET /conversation?consistency=eventual
-> { "chat_messages": [...] }  <- Replicated
```

### Data Loss Scenario

1. User submits "FIRST MESSAGE"
2. User refreshes during ~2s stale window
3. UI shows empty conversation
4. User thinks failed, re-submits "SECOND MESSAGE"
5. Last-write-wins: FIRST MESSAGE permanently lost

---

## Mitigation Options

| Approach | Complexity | Guarantee | Status |
|----------|------------|-----------|--------|
| Pending state UI | Trivial | Weak | Partial (SSE indicator) |
| Client idempotency key | Low | Medium | Not implemented |
| Read-after-write consistency | Medium | Strong | Not exposed |
| Optimistic locking | High | Strongest | Not implemented |

---

## Performance

| Metric | Value | Bound By |
|--------|-------|----------|
| TTFB | ~1s | Model queue, warmup |
| Total completion | 4-5s | Token generation |
| Conversation CRUD | 200-400ms | Database, replication |
| Title generation | Async (202) | Background processing |

---

## API Details

### Create Conversation

```http
POST /api/organizations/{org}/chat_conversations
Content-Type: application/json

{
  "project_uuid": null,
  "model": "claude-opus-4-5-20251101"
}
```

### Get Conversation (with tree)

```http
GET /api/organizations/{org}/chat_conversations/{id}
    ?tree=True
    &rendering_mode=messages
    &consistency=eventual
```

### Stream Completion

```http
POST /api/organizations/{org}/chat_conversations/{id}/completion
Accept: text/event-stream
Content-Type: application/json

{
  "prompt": "Hello",
  "model": "claude-opus-4-5-20251101",
  "timezone": "America/Los_Angeles"
}
```
