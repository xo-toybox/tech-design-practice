# claude.ai Consistency & Durability

## Summary

claude.ai uses eventually consistent reads with ~2 second replication lag. During this window, users see empty conversation content despite successful writes. Re-submitting during this window causes **data loss** via last-write-wins.

---

## Empirical Test: Request Flow

### Test 1: Stale Read Window

**T0: User submits "FIRST MESSAGE AAA"**

```
POST /api/organizations/{org}/chat_conversations
  → 201 Created { "uuid": "e50688e8-b3bb-4156-8ca3-2349201f299e" }

POST /api/organizations/{org}/chat_conversations/{id}/title
  → 202 Accepted (async title generation)

POST /api/organizations/{org}/chat_conversations/{id}/completion
  → 200 + SSE stream
  → Events: message_start → content_block_start → content_block_delta* → ...
```

**T1: User refreshes page immediately (cmd+r)**

```
GET /api/organizations/{org}/chat_conversations/{id}
    ?tree=True&rendering_mode=messages&consistency=eventual
  → 200
  → {
      "uuid": "e50688e8-...",
      "name": "Word count constraint response",  ← Title replicated
      "chat_messages": []                        ← Messages EMPTY (stale)
    }
```

UI shows: "What can I help you with today?" (empty conversation state)

**T2: Wait ~2 seconds, refresh again**

```
GET /api/organizations/{org}/chat_conversations/{id}
    ?tree=True&rendering_mode=messages&consistency=eventual
  → 200
  → {
      "chat_messages": [                         ← Messages now replicated
        { "text": "FIRST MESSAGE AAA...", "sender": "human" },
        { "text": "Hello! I see this is...", "sender": "assistant" }
      ]
    }
```

**Finding**: ~2 second window where title is available but messages are empty.

---

### Test 2: Last-Write-Wins Data Loss

**T0: User submits "FIRST MESSAGE AAA"**

```
POST /chat_conversations                   → 201 (conv created)
POST /chat_conversations/{id}/title        → 202 (async)
POST /chat_conversations/{id}/completion   → SSE streaming
```

**T1: User refreshes immediately**

```
GET /chat_conversations/{id}?consistency=eventual
  → { "name": "Word count...", "chat_messages": [] }
             ↑ Title present   ↑ Messages EMPTY
```

UI: User sees empty conversation, thinks submission failed

**T2: User re-submits "SECOND MESSAGE BBB"**

```
POST /chat_conversations/{id}/completion
  Body: { "prompt": "SECOND MESSAGE BBB..." }
  → This POST overwrites the conversation's message tree
  → First message A is replaced, not appended
```

**T3: First refresh after re-submit**

```
GET /chat_conversations/{id}?consistency=eventual
  → Shows FIRST message AAA (replica caught up to first write)
```

**T4: Second refresh**

```
GET /chat_conversations/{id}?consistency=eventual
  → Shows ONLY SECOND message BBB
  → FIRST MESSAGE AAA IS GONE
  → Last-write-wins: Second POST overwrote first message entirely
```

**Finding**: Re-submitting during stale window causes complete data loss of first message.

---

## Consistency Model

| Aspect | Behavior |
|--------|----------|
| Read consistency | Eventually consistent (`consistency=eventual` query param) |
| Replication lag | ~2 seconds |
| Partial replication | Conversation title replicates before message content |
| Write conflict resolution | Last-write-wins (no merge, no append) |
| Idempotency | None (no client-side keys, no server-side dedup) |

---

## Architecture

```
Client                          Primary                         Replica
   │                               │                               │
   │──POST /completion (msg A)────▶│                               │
   │◀═══200 + SSE stream═══════════│                               │
   │                               │───replication (~2s lag)──────▶│
   │                               │                               │
   │ [REFRESH]                     │                               │
   │──GET /?consistency=eventual───────────────────────────────────▶│
   │◀──{ messages: [] } STALE──────────────────────────────────────│
   │                               │                               │
   │ [User thinks failed]          │                               │
   │──POST /completion (msg B)────▶│                               │
   │                               │ OVERWRITES msg A              │
```

---

## Key API Parameters

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `consistency` | `eventual` | Accept stale reads from replica |
| `tree` | `True` | Return full message tree structure |
| `rendering_mode` | `messages` | Format as message list |

**Note**: No `consistency=strong` option observed - system does not expose read-after-write.

---

## Mitigation Comparison

| Approach | Complexity | Guarantee Strength | Failure Mode | Status |
|----------|------------|-------------------|--------------|--------|
| Pending State UI | Trivial | Weak | Refresh bypasses; doesn't survive page reload | Partial (SSE indicator) |
| Client Idempotency Key | Low | Medium | Key lost on refresh (unless persisted) | Not implemented |
| Idempotency Key + LocalStorage | Low-Medium | Medium-Strong | Storage cleared; private browsing | Not implemented |
| Read-After-Write Consistency | Medium | Strong | Latency cost; routing complexity | Not exposed |
| Optimistic Locking | High | Strongest | Requires schema changes; retry logic | Not implemented |
| Conflict Detection + Merge | Highest | Variable | User-facing resolution; complex UX | Not implemented |

---

## Design Trade-offs

| Choice | Trade-off |
|--------|-----------|
| Availability over consistency | Faster responses, risk of stale reads |
| Async replication | Lower write latency, data loss window |
| No idempotency layer | Simpler backend, duplicate risk |
| Last-write-wins | No conflict resolution complexity, data loss risk |
