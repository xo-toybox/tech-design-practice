# AI Chatbot Comparison Analysis Plan

## Goal

Systematic comparison of ChatGPT and Claude.ai across technical architecture, product design, and user experience dimensions.

---

## User Feedback

### Addressed
- [x] **Memory feature**: Investigated Claude.ai centralized personal memory (Sept 2025)
- [x] **Durability nuance**: Reframed as stale read hazard, read-your-writes violation
- [x] **Connectors parity**: Both platforms have similar OAuth-based Google integrations
- [x] **syncing.md redundancy**: Merged sync API details into extensions.md
- [x] **README responsibilities**: Top-level README now has key insights; comparison/README.md is directory index only

### Open
- None currently

---

## Tracking Status

### Analysis Coverage

| Dimension | ChatGPT | Claude.ai | Comparison |
|-----------|---------|-----------|------------|
| **Core Architecture** | | | |
| System overview | DONE | DONE | PENDING |
| Streaming protocol | DONE (deep-dive) | PARTIAL | PENDING |
| Durability/consistency | DONE (deep-dive) | DONE (deep-dive) | DONE |
| API patterns | DONE | DONE | PENDING |
| | | | |
| **Features** | | | |
| Conversations | DONE | DONE | PENDING |
| Memory/personalization | DONE (deep-dive) | DONE (deep-dive) | DONE |
| Projects | PARTIAL | PARTIAL | PENDING |
| Extensions/integrations | DONE (product-analysis) | DONE (product-analysis) | PENDING |
| Agent modes | DONE (deep-dive) | DONE (capabilities research) | DONE |
| Tasks/automations | DONE (deep-dive) | MISSING | PENDING |
| Coding assistant | DONE (deep-dive-codex) | MISSING | PENDING |
| Group chat | DONE (deep-dive-calpico) | MISSING | PENDING |
| Image generation | DONE (deep-dive) | MISSING | PENDING |
| Settings | DONE (deep-dive) | MISSING | PENDING |
| | | | |
| **Infrastructure** | | | |
| CDN/edge | PARTIAL | DONE | PENDING |
| Observability | PARTIAL | DONE | PENDING |
| Security model | DONE (sentinel) | MISSING | PENDING |
| | | | |
| **Product** | | | |
| Extension ecosystem | DONE | DONE | PENDING |
| Feature flags/experiments | PARTIAL | DONE | PENDING |
| Pricing/billing | PARTIAL | PARTIAL | PENDING |

### Legend

- **DONE**: Complete deep-dive or thorough coverage
- **PARTIAL**: Surface-level or incomplete coverage
- **MISSING**: Not analyzed yet
- **PENDING**: Comparison doc not written

---

## Comparison Documents to Create

### Priority 1: Production Systems (Tier 1 Critical)

| Document | Purpose | Status | Depth |
|----------|---------|--------|-------|
| `durability.md` | Consistency models, recovery, race conditions | DONE | Network captures from both platforms |
| `error-handling.md` | Failure modes, retries, circuit breakers | DONE | Chrome captures from both platforms |
| `agent-execution.md` | Tool calling, multi-step orchestration | DONE | Web search test, 502 error capture |
| `security.md` | Sentinel vs Claude.ai, content filtering | DONE | Sentinel vs direct execution |

### Priority 2: User Experience (Tier 2)

| Document | Purpose | Status | Depth |
|----------|---------|--------|-------|
| `realtime-sync.md` | WebSocket, multi-tab, conflict resolution | DONE | ChatGPT WebSocket vs Claude.ai FCM |
| `performance.md` | TTFB, throughput, cold/warm paths | DONE | Extended thinking overhead documented |
| `context-management.md` | Memory injection, pruning, overflow | PENDING | Not started |

### Priority 3: Completed (Need Deepening)

| Document | Purpose | Status | Issue |
|----------|---------|--------|-------|
| `architecture.md` | Side-by-side system architecture | DONE | Diagrams only, no behavioral analysis |
| `streaming.md` | SSE protocols, delta formats | DONE | No failure modes documented |
| `extensions.md` | Extension/integration ecosystems | DONE | Good, could add protocol deep-dive |
| `memories.md` | Memory/personalization comparison | DONE | Architecture + generation timing documented |
| `gpts-projects.md` | GPTs vs Claude Projects | DONE | Capabilities only, no runtime behavior |

### Priority 4: Strategic (Tier 3)

| Document | Purpose | Status |
|----------|---------|--------|
| `state-machines.md` | Message/conversation lifecycle | PENDING |
| `api-versioning.md` | Breaking changes, feature flags | PENDING |
| `billing.md` | Usage tracking, rate limits | PENDING |

---

## Research Gaps to Fill

### Claude.ai Missing Coverage

1. **Memory/Personalization** - How does Claude.ai store user preferences?
2. **Agent modes** - Does Claude.ai have autonomous agent capability?
3. **Tasks/automations** - Scheduled/background tasks?
4. **Group chat** - Multi-user collaboration?
5. **Image generation** - DALL-E equivalent?
6. **Settings taxonomy** - Full settings structure

### ChatGPT Missing Coverage

1. **Full extension install flow** - OAuth/MCP detailed flow
2. **Rate limiting behavior** - 429 response handling
3. **Project collaboration** - Real-time sharing mechanics

### Both Need

1. **Error handling** - Retry logic, circuit breakers
2. **Performance under load** - Queue behavior
3. **Multi-region** - Failover, consistency across regions

---

## Methodology

### Data Sources

| Type | ChatGPT | Claude.ai |
|------|---------|-----------|
| Network captures | HAR files, DevTools | HAR files, DevTools |
| Screenshots | Chrome automation | Chrome automation |
| API responses | Captured payloads | Captured payloads |
| Source code | Not available | Not available |

### Evidence Requirements

All claims must cite:
- Screenshot ID (e.g., `ss_XXXXX`)
- Network capture (endpoint, status, timestamp)
- Direct quote from response payload

### Comparison Format

Each comparison doc uses:
```markdown
| Aspect | ChatGPT | Claude.ai | Winner | Notes |
|--------|---------|-----------|--------|-------|
```

---

## File Structure

```
analysis/
├── chatgpt/
│   ├── README.md              # Index
│   ├── API-REFERENCE.md       # Consolidated endpoints
│   ├── features/              # Feature documentation
│   │   ├── conversations.md
│   │   ├── gpts.md
│   │   ├── memories.md
│   │   ├── tasks.md
│   │   ├── codex.md
│   │   ├── calpico.md
│   │   ├── images.md
│   │   ├── modes.md
│   │   └── settings.md
│   ├── insights/              # Synthesized patterns
│   │   ├── architectural-patterns.md
│   │   └── product-strategy.md
│   └── backlog/
│       └── explorations.md
│
├── claude-ai/                 # Claude.ai analysis (restructured)
│   ├── README.md              # Index
│   ├── API-REFERENCE.md       # Consolidated endpoints
│   ├── features/
│   │   ├── conversations.md
│   │   ├── extensions.md      # Includes sync integrations
│   │   ├── memories.md
│   │   ├── projects.md
│   │   └── styles.md
│   ├── insights/
│   │   ├── architectural-patterns.md
│   │   └── product-strategy.md
│   └── backlog/
│       └── explorations.md
│
└── comparison/                # Cross-product comparison (12 docs)
    ├── README.md              # Directory index
    ├── PLAN.md                # Planning & tracking
    ├── architecture.md        # System diagrams
    ├── streaming.md           # SSE protocols
    ├── durability.md          # Consistency & recovery
    ├── error-handling.md      # Failure modes
    ├── agent-execution.md     # Tool calling
    ├── agent-modes.md         # Agent capabilities
    ├── extensions.md          # Extension ecosystems
    ├── memories.md            # Memory/personalization
    ├── gpts-projects.md       # GPTs vs Projects
    ├── realtime-sync.md       # WebSocket vs FCM
    ├── performance.md         # Latency & throughput
    └── security.md            # Anti-abuse patterns
```

---

## Research Queue (Client-Observable)

**Constraint**: All investigations via DevTools Network/WS/Console only.

### Tier 1: Critical (P0)

#### 1.1 Durability & Recovery

| Gap | ChatGPT | Claude.ai | Status |
|-----|---------|-----------|--------|
| Persist timing | Sentinel prepare | Eventual consistency | DONE |
| Disconnect recovery | `/stream_status` | `/completion_status` | DONE |
| Multi-tab sync | None (refresh required) | None (refresh required) | DONE |
| Branching behavior | `current_leaf_message_uuid` | Same field | PENDING |

**Completed**: durability.md, realtime-sync.md document these findings.

#### 1.2 Error Events & Client Retry

| Gap | ChatGPT | Claude.ai | Status |
|-----|---------|-----------|--------|
| Error event format | Partial (`rate_limit_error`) | Unknown | PENDING |
| Client retry behavior | Unknown | Unknown | PENDING |
| Rate limit response | Unknown | `message_limit` windows | PENDING |
| Stream interruption | Unknown | Unknown | PENDING |

**Test plan**:
1. Send many messages rapidly → observe for 429 or error events
2. Kill network mid-stream → does UI retry or show error?
3. Observe `message_limit` event in Claude.ai stream

#### 1.3 Agentic Execution Events

| Gap | ChatGPT | Claude.ai | Status |
|-----|---------|-----------|--------|
| Tool call events | Unknown | Unknown | PENDING |
| Tool result events | Unknown | Unknown | PENDING |
| Multi-step continuation | Unknown | Unknown | PENDING |
| Parallel tool indication | Unknown | Unknown | PENDING |

**Test plan**:
1. ChatGPT: Enable web search, send query, capture full stream for tool events
2. Claude.ai: Use MCP extension, capture stream for tool_use events
3. Agent mode: Capture multi-turn session, trace event sequence

#### 1.4 Sentinel Payload Capture

| Gap | ChatGPT | Claude.ai | Status |
|-----|---------|-----------|--------|
| Prepare payload | Captured flow | N/A | DONE |
| Finalize payload | Captured flow | N/A | DONE |
| Timing overhead | ~100-200ms | 0ms | DONE |

**Completed**: security.md documents Sentinel vs direct execution patterns.

### Tier 2: Important (P1)

#### 2.1 WebSocket Message Capture

| Gap | ChatGPT | Claude.ai | Status |
|-----|---------|-----------|--------|
| Message format | Unknown | N/A (uses FCM) | PENDING |
| Message triggers | NOT conversation content | NOT conversation content | DONE |
| Purpose | Likely notifications/tasks | Likely notifications | PARTIAL |

**Finding**: Neither platform uses WS/FCM for conversation content sync. Both require refresh.

**Remaining test plan**:
1. Schedule a ChatGPT task, observe WS traffic for task completion notification
2. Capture actual WebSocket frame format

#### 2.2 Performance Timing

| Metric | ChatGPT | Claude.ai | Status |
|--------|---------|-----------|--------|
| Simple prompt latency | ~5s | 50+s (extended thinking) | DONE |
| Extended thinking overhead | Selective | Always-on | DONE |
| Token rate | 30-80 tok/s | Unknown | PENDING |

**Completed**: performance.md documents 10x latency overhead for extended thinking.

**Remaining**: Token throughput measurement during streaming phase.

#### 2.3 Context Overflow Behavior

| Gap | ChatGPT | Claude.ai | Status |
|-----|---------|-----------|--------|
| Truncation indicators | Unknown | Unknown | PENDING |
| Error on overflow | Unknown | Unknown | PENDING |
| Request size limits | Unknown | Unknown | PENDING |

**Test plan**:
1. Build very long conversation (paste large content)
2. Observe if/when requests fail or responses degrade
3. Check for explicit error events

### Tier 3: Strategic (P2)

| Investigation | Method | Status |
|---------------|--------|--------|
| Message state lifecycle | Observe `status` field in GET/stream | PENDING |
| Feature flag indicators | Check metadata for `plan_type`, flags | PENDING |
| Usage tracking events | Look for usage events in stream | PENDING |

---

## What's Currently Too Shallow

| Document | Issue | Needed |
|----------|-------|--------|
| `architecture.md` | Diagrams only | Behavioral analysis |
| `streaming.md` | Format comparison | Failure modes |
| `memories.md` | Feature list | Injection timing |
| `gpts-projects.md` | Capabilities table | Runtime behavior |
| `extensions.md` | Ecosystem analysis | Protocol deep-dive |

---

## Next Actions

### Completed (Iteration 1-5)
- [x] Create comparison docs: architecture, streaming, extensions, memories, gpts-projects
- [x] Durability investigation with Chrome captures
- [x] Error handling investigation with 502 capture
- [x] Agent execution investigation with tool calling
- [x] Claude.ai Memory investigation (nightly regeneration)
- [x] WebSocket investigation (celsius vs FCM)
- [x] Address user feedback (durability reframe, syncing.md consolidation)

### Recommended Next (Priority Order)
1. [x] **Performance comparison** - Extended thinking latency documented (10x overhead)
2. [x] **Security comparison** - Sentinel vs direct execution documented
3. [x] **Multi-tab sync test** - Neither platform syncs conversation content in real-time
4. [x] **Claude.ai agent modes** - No explicit agent mode; capabilities-based architecture
5. [ ] **Context overflow test** - Build very long conversation, observe truncation behavior

---

## Session Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-01-04 | Audit ChatGPT docs (18 files) | Identified redundancy, overlap |
| 2026-01-04 | Audit Claude.ai docs (7 files) | Less coverage, fewer deep-dives |
| 2026-01-04 | Create comparison directory | Structure established |
| 2026-01-04 | Create PLAN.md | Tracking established |
| 2026-01-04 | Create architecture.md | System architecture comparison |
| 2026-01-04 | Create extensions.md | Extension ecosystem comparison |
| 2026-01-04 | Create streaming.md | Streaming protocol comparison |
| 2026-01-04 | Restructure chatgpt/ | features/, insights/, backlog/ structure |
| 2026-01-04 | Remove comparisons from feature docs | Moved to comparison/ directory |
| 2026-01-04 | Create memories.md | Memory comparison |
| 2026-01-04 | Create gpts-projects.md | GPTs vs Projects comparison |
| 2026-01-04 | Delete old deep-dive files | Consolidated into features/ |
| 2026-01-04 | Staff+ gap analysis | Identified 10 high-value exploration areas |
| 2026-01-04 | Add research queue | Client-observable investigations (Tier 1-3) |
| 2026-01-04 | Restructure claude-ai/ | New features/, insights/, backlog/ structure matching chatgpt/ |
| 2026-01-04 | Run durability experiments | Chrome browser captures on both platforms |
| 2026-01-04 | Create durability.md | Sentinel vs eventual consistency comparison with evidence |
| 2026-01-04 | Memory investigation | Chrome capture of Claude.ai memory modal, 3-section structure, nightly regeneration |
| 2026-01-04 | Create memories.md (claude-ai) | Work/Personal/Top-of-mind sections, API endpoint documented |
| 2026-01-04 | Update memories.md (comparison) | Architecture diagrams, generation timing comparison |
| 2026-01-04 | Reframe durability.md | Client-side recovery focus per user feedback |
| 2026-01-04 | Update durability terminology | Stale read hazard, read-your-writes violation |
| 2026-01-04 | Fix extensions.md | Both platforms have similar Google integrations |
| 2026-01-04 | Run error handling experiments | Chrome captures on both platforms |
| 2026-01-04 | Create error-handling.md | Sentinel vs direct execution comparison |
| 2026-01-04 | Create comparison/README.md | Key findings summary with stale read hazard lead |
| 2026-01-04 | Run agent execution experiments | Web search test on both platforms |
| 2026-01-04 | Capture Claude.ai 502 error | Real failure mode during web search |
| 2026-01-04 | Discover `/completion_status` | Claude.ai recovery endpoint found |
| 2026-01-04 | Update error-handling.md | Added Claude.ai recovery mechanism |
| 2026-01-04 | Create agent-execution.md | Tool calling, consistency modes, error handling |
| 2026-01-04 | Consolidate syncing.md | Merged into extensions.md, deleted redundant file |
| 2026-01-04 | WebSocket investigation | ChatGPT uses `celsius` WebSocket, Claude.ai uses FCM |
| 2026-01-04 | Create realtime-sync.md | WebSocket vs Firebase Cloud Messaging comparison |
| 2026-01-04 | Performance experiments | "Hello world" test on both platforms |
| 2026-01-04 | Create performance.md | Extended thinking latency overhead (10x difference) |
| 2026-01-04 | Security experiments | Captured Sentinel vs direct execution flows |
| 2026-01-04 | Create security.md | Sentinel anti-abuse vs Claude.ai direct execution |
| 2026-01-04 | Multi-tab sync test | Neither platform syncs conversation content in real-time |
| 2026-01-04 | Update realtime-sync.md | Added test results - WS/FCM NOT used for conversation sync |
| 2026-01-04 | Claude.ai agent research | Web search + browser exploration of capabilities |
| 2026-01-04 | Create agent-modes.md | Explicit modes (ChatGPT) vs capabilities-based (Claude.ai) |
