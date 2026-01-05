# Future Explorations

Tests and deep dives for future analysis sessions.

---

## Priority 1: Durability & Recovery

### 1.1 Disconnect Recovery

**Goal**: Understand stream resilience

**Test plan**:
1. Start long completion (extended thinking)
2. Kill network mid-stream (DevTools offline)
3. Restore network
4. Observe: Does client auto-reconnect? Resume mechanism?

**Questions**:
- Is there a resume token? (last event ID?)
- How is partial response handled?
- Does server checkpoint progress?

### 1.2 Multi-tab Sync

**Test plan**:
1. Open 2 tabs with same conversation
2. Send message in tab A
3. Observe Network tab B for sync

**Questions**:
- Real-time sync mechanism? (WebSocket, polling, SSE?)
- Conflict handling?

---

## Priority 2: Feature Deep Dives

### 2.1 Message Branching

**Goal**: Understand conversation tree structure

**Test**:
1. Send 3 messages
2. Edit message #2
3. `GET /chat_conversations/{id}?tree=True`
4. Analyze tree structure

**Questions**:
- How are branches stored?
- Can you switch between branches?
- What happens to abandoned branch responses?

### 2.2 Artifact Versioning

**Goal**: Understand iteration workflow

**Test**:
1. Ask Claude to write code
2. Ask Claude to modify it 3x
3. `GET /artifacts/{id}/versions`
4. Analyze version schema

**Questions**:
- Full snapshots or deltas?
- Revert capability?

### 2.3 Research Mode

**Goal**: Understand deep research backend

**Test**:
1. Click "+" -> Research
2. Submit research query
3. Capture all API calls

**Questions**:
- Different model? Different system prompt?
- Progress tracking mechanism?
- Sources accessed?

### 2.4 Web Search

**Goal**: Understand search integration

**Test**:
1. Enable web search toggle
2. Ask current events question
3. Capture API calls

**Questions**:
- Search API provider? (Bing, Google, proprietary?)
- Result injection format?
- Citation mechanism?

---

## Priority 3: Performance

### 3.1 Inference Performance

**Metrics to capture**:
- TTFB (time to `message_start`)
- Time to first text token
- Token rate (tokens/sec)
- Thinking time vs response time ratio

**Test**:
1. Send identical prompt 10x, measure TTFB
2. Parse SSE timestamps for token rate
3. Compare morning vs evening latency
4. Compare with/without extended thinking

### 3.2 Context Overflow

**Test**:
1. Build very long conversation
2. Observe if/when requests fail
3. Check for explicit error events

**Questions**:
- Truncation indicators?
- Request size limits?

---

## Priority 4: Infrastructure

### 4.1 Rate Limiting

**Test** (careful):
1. Send many messages rapidly
2. Observe for 429 or error events

**Questions**:
- Per-endpoint or global?
- Retry-After header behavior?

### 4.2 Extension Install Flow

**Test**:
1. Install new extension
2. Capture all API calls
3. Uninstall, capture again

**Questions**:
- Signature verification flow?
- Tool loading (lazy vs eager)?

### 4.3 Sync Ingestion

**Test**:
1. Full OAuth flow capture
2. Large file sync
3. Observe polling frequency

**Questions**:
- Incremental sync?
- Storage limits?

---

## Test Methodology

### Capture Setup

1. Open DevTools Network tab
2. Enable "Preserve log"
3. Filter to `claude.ai` domain
4. Execute test
5. Export HAR or copy as cURL

### Timing Analysis

```javascript
// In console after test
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/'))
  .map(r => ({ url: r.name, duration: r.duration }))
```

### SSE Parsing

```javascript
// Intercept SSE events
const events = [];
// ... capture during test
events.map(e => ({ type: e.type, time: e.timestamp }))
```

---

## Research Queue Status

| Investigation | Priority | Status |
|---------------|----------|--------|
| Disconnect recovery | P0 | PENDING |
| Multi-tab sync | P0 | PENDING |
| Message branching | P1 | PENDING |
| Artifact versioning | P1 | PENDING |
| Research mode | P1 | PENDING |
| Web search | P1 | PENDING |
| Inference performance | P2 | PENDING |
| Context overflow | P2 | PENDING |
| Rate limiting | P3 | PENDING |
| Extension install | P3 | PENDING |
| Sync ingestion | P3 | PENDING |
