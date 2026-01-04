# Research Backlog

Future explorations and investigations.

---

## Priority Queue

### High Priority

| Topic | Reason | Status |
|-------|--------|--------|
| **WebSocket Deep Dive** | Message format unknown | PENDING |
| **Extended Thinking Triggers** | Need visible thinking in stream | PENDING |

### Medium Priority

| Topic | Reason | Status |
|-------|--------|--------|
| **Voice Mode** | WebRTC complexity | PENDING |
| **ChatGPT OAuth Provider** | New identity layer | PENDING |
| **Error Handling** | Mid-stream errors | PENDING |

### Lower Priority

| Topic | Reason | Status |
|-------|--------|--------|
| **Orders/E-commerce** | API structure unknown | PENDING |
| **Analytics Deep Dive** | CES event catalog | PENDING |
| **A/B Testing System** | Experiment structure | PENDING |

---

## WebSocket Investigation

**Goal**: Understand WebSocket connection purpose

**Known**:
- URL: `wss://ws.chatgpt.com/ws/user/{user_id}?verify={timestamp}-{signature}`
- Init: `/backend-api/celsius/ws/user` (GET, 200)

**Unknown**:
- Message format (JSON? Binary?)
- Triggers (conversation? typing? background?)
- Purpose (notifications? sync?)

**Test plan**:
1. DevTools > Network > WS filter
2. Observe during page load, messaging, multi-tab

---

## Extended Thinking

**Goal**: Capture visible thinking blocks in stream

**Known**:
- Metadata: `model_slug: "gpt-5-2-thinking"`, `thinking_effort: "extended"`
- `did_auto_switch_to_reasoning` flag exists

**Finding**: No thinking blocks observed; may be server-side only.

**Test plan**:
1. Find query showing "Thinking..." UI indicator
2. Capture stream during thinking phase
3. Test auto-switching scenarios

---

## Voice Mode

**Goal**: Understand real-time voice architecture

**To explore**:
- Voice streaming protocol (WebRTC?)
- Speech-to-text integration
- Text-to-speech for responses
- Latency characteristics

---

## ChatGPT OAuth Provider

**Goal**: Understand "Secure sign in with ChatGPT"

Discovered in Security settings. ChatGPT expanding to platform identity layer.

**To explore**:
- API endpoints
- OAuth flow details
- Third-party app registration

---

## Orders/E-commerce

**Goal**: Understand purchase system

Empty "Orders" tab: "Products you buy with ChatGPT will show here"

**To explore**:
- Available products
- Purchase API structure
- Integration with conversations

---

## Completed Investigations

| Topic | Date | Document |
|-------|------|----------|
| Streaming Protocol | 2026-01-04 | features/conversations.md |
| Durability | 2026-01-04 | features/conversations.md |
| GPTs/Gizmos | 2026-01-04 | features/gpts.md |
| Memories | 2026-01-04 | features/memories.md |
| Tasks/Automations | 2026-01-04 | features/tasks.md |
| Sentinel | 2026-01-04 | features/conversations.md |
| Codex/WHAM | 2026-01-04 | features/codex.md |
| Calpico/Rooms | 2026-01-04 | features/calpico.md |
| Images | 2026-01-04 | features/images.md |
| Modes/Connectors | 2026-01-04 | features/modes.md |
| Settings | 2026-01-04 | features/settings.md |

---

## Test Methodology

**Network capture**:
1. DevTools Network tab, "Preserve log"
2. Filter to target domain
3. Export HAR

**Timing**:
```javascript
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/backend-api/'))
  .map(r => ({ url: r.name, duration: r.duration }))
```

---

## Constraints

- Live account: Be conservative
- Rate limits: Sentinel may block
- Privacy: Don't capture PII
- ToS: Respect usage policies
