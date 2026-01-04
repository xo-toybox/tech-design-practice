# claude.ai - Future Explorations

Tests and deep dives for future analysis sessions.

---

## Message Branching

**Goal**: Understand conversation tree structure and edit behavior

**What we know**:
- Messages have `parent_uuid` linking
- `current_leaf_message_uuid` points to active branch
- `tree=True` query param returns full tree

**To explore**:
1. Edit a message mid-conversation
2. Capture the resulting tree structure
3. How are branches stored? Can you switch between branches?
4. What happens to Claude's responses on the abandoned branch?

**Test**:
```
1. Send 3 messages in conversation
2. Edit message #2
3. GET /chat_conversations/{id}?tree=True
4. Analyze tree structure
```

---

## Artifact Versioning

**Goal**: Understand iteration workflow for Claude-generated content

**What we know**:
- Endpoint: `/artifacts/{uuid}/versions?source=w`
- Called twice: initial load + post-completion refresh
- Supports iteration/editing workflow

**To explore**:
1. Create an artifact (code, document)
2. Ask Claude to iterate on it
3. Capture version history
4. How are diffs stored? Full snapshots or deltas?
5. Can you revert to previous versions?

**Test**:
```
1. Ask Claude to write code
2. Ask Claude to modify it 3x
3. GET /artifacts/{id}/versions
4. Analyze version schema
```

---

## Research Mode

**Goal**: Understand deep research backend

**What we know**:
- Available from "+" attachment menu
- Long-running task (FCM notification on completion)
- Unknown backend

**To explore**:
1. Trigger research mode
2. What endpoints are called?
3. Is it a different model? Different system prompt?
4. How does progress tracking work?
5. What sources does it access? Web search? Internal knowledge?

**Test**:
```
1. Click "+" → Research
2. Submit research query
3. Capture all API calls during execution
4. Note timing, endpoints, response structure
```

---

## Web Search

**Goal**: Understand search integration

**What we know**:
- Available from "+" attachment menu as toggle
- Unknown backend

**To explore**:
1. Enable web search
2. Ask question requiring current information
3. What search API is used? (Bing, Google, proprietary?)
4. How are results injected into context?
5. Are sources cited? How?

**Test**:
```
1. Enable web search toggle
2. Ask "What happened in the news today?"
3. Capture all API calls
4. Analyze search request/response format
```

---

## Inference Performance

**Goal**: Characterize model serving behavior

**What we know**:
- Completion TTFB ~1s
- Total completion 4-5s
- `x-envoy-upstream-service-time` header available

**To explore**:
1. Time to first token (TTFB) distribution
2. Token generation rate (tokens/sec)
3. Does TTFB vary by time of day? (queue depth)
4. Extended thinking vs non-thinking latency difference
5. Model warmup effects (first request vs subsequent)

**Test**:
```
1. Send identical prompt 10x, measure TTFB
2. Parse SSE timestamps for token rate
3. Compare morning vs evening latency
4. Compare with/without extended thinking
```

**Metrics to capture**:
- TTFB (time to `message_start`)
- Time to first text token
- Total token count / total time
- Thinking time vs response time ratio

---

## SSE Reconnection

**Goal**: Understand stream resilience

**What we know**:
- SSE via POST + fetch (not EventSource)
- No WebSocket fallback observed

**To explore**:
1. What happens if connection drops mid-stream?
2. Does client auto-reconnect?
3. Is there a resume mechanism? (last event ID?)
4. How is partial response handled?
5. Does server checkpoint progress?

**Test**:
```
1. Start long completion (extended thinking)
2. Kill network mid-stream (DevTools offline)
3. Restore network
4. Observe client behavior
5. Check if response is recoverable
```

---

## Additional Candidates

### Extension Install Flow
- What APIs are called on install/uninstall?
- How is signature verification done?
- Are tools loaded lazily or eagerly?

### Sync Ingestion
- Full OAuth flow capture
- Polling frequency for progress
- How large files are handled
- Incremental sync behavior

### Project Sharing
- Permission model (viewer, editor, owner?)
- How are shared resources accessed?
- Real-time collaboration support?

### Rate Limiting
- What triggers 429?
- Per-endpoint or global?
- Retry-After header behavior?
- ⚠️ Requires careful testing

---

## Test Methodology

**Capture setup**:
1. Open DevTools Network tab
2. Enable "Preserve log"
3. Filter to `claude.ai` domain
4. Execute test
5. Export HAR or copy as cURL

**Timing analysis**:
```javascript
// In console after test
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/'))
  .map(r => ({ url: r.name, duration: r.duration }))
```

**SSE parsing**:
```javascript
// Intercept SSE events
const events = [];
// ... capture during test
events.map(e => ({ type: e.type, time: e.timestamp }))
```
