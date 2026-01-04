# Agent Execution Comparison

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Web search** | Built-in, auto-triggered | Toggle in "+" menu | Both have web search |
| **Tool invocation** | In SSE stream | In SSE stream | Similar patterns |
| **Error handling** | Sentinel wrapping | `/completion_status` polling | Different approaches |
| **Result formatting** | Rich widgets (weather cards) | Standard text | ChatGPT more polished |
| **Consistency mode** | Unknown | `?consistency=strong` | Claude uses strong consistency for tools |

---

## Web Search Test (2026-01-04)

### ChatGPT

**Query**: "What is the current weather in San Francisco today?"

**Result**: Successful web search with rich weather widget

**Network flow**:
```
POST /sentinel/chat-requirements/prepare  → 200
POST /f/conversation/prepare              → 200
POST /f/conversation                      → 200 (SSE with tool events)
POST /sentinel/chat-requirements/finalize → 200
GET  /stream_status                       → 200
```

**Rendering**: Weather card with:
- Current temperature (53°F)
- Conditions (Light rain)
- 3-day forecast
- Flood warning

### Claude.ai

**Query**: "What is the current weather in San Francisco today?"

**Result**: 502 Bad Gateway error during completion

**Network flow**:
```
POST /chat_conversations                  → 201 Created
POST /title                               → 202 Accepted
POST /completion                          → 502 Bad Gateway ⚠️
GET  /completion_status?poll=false        → 200 (recovery check)
GET  /chat_conversations?consistency=strong → 200
```

**Key observation**: Claude.ai uses `?consistency=strong` for tool operations, different from normal `?consistency=eventual`.

---

## Tool Architecture

### ChatGPT

**Model**: Server-side tool execution

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│  Backend    │────►│ Tool Server │
│             │     │ (SSE stream)│     │ (web search)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼ Tool results embedded in stream
```

**Tool types observed**:
- Web search (built-in)
- Code interpreter (Python)
- DALL-E (image generation)
- Connectors (GitHub, Box, etc.)

### Claude.ai

**Model**: MCP-based tool execution

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│  Backend    │────►│ MCP Server  │
│             │     │ (SSE stream)│     │ (local/cloud)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼ Tool results in stream events
```

**Tool types**:
- Web search (toggle)
- Research mode
- MCP extensions (local)
- Sync integrations (OAuth)

---

## Stream Event Types

### ChatGPT (Inferred)

Based on SSE stream from `/f/conversation`:
- Message start
- Content delta
- Tool call (web search, code exec)
- Tool result
- Message complete

### Claude.ai (Documented)

Based on SSE stream from `/completion`:
```
event: message_start
event: content_block_start
event: content_block_delta
event: tool_use          # Tool invocation
event: tool_result       # Tool output
event: message_delta
event: message_stop
```

---

## Consistency Modes

### ChatGPT

No `consistency` parameter observed. Likely uses strong consistency for all operations.

### Claude.ai

| Operation | Consistency | Evidence |
|-----------|-------------|----------|
| Normal read | `?consistency=eventual` | Standard conversation fetch |
| Tool operations | `?consistency=strong` | Observed during web search |
| Recovery check | N/A | `/completion_status` endpoint |

**Hypothesis**: Claude.ai uses strong consistency when tools are involved to ensure tool results are immediately available.

---

## Error Handling During Tool Use

### ChatGPT

**Observed**: No errors during web search test.

**Expected patterns** (based on Sentinel):
- Pre-validation catches invalid tool requests
- Tool errors embedded in stream
- Recovery via `/stream_status`

### Claude.ai

**Observed**: 502 Bad Gateway during web search

**Recovery flow**:
1. Client receives 502 error
2. Client polls `/completion_status?poll=false`
3. Client fetches conversation with `?consistency=strong`
4. UI shows original query, awaiting retry

---

## Design Tradeoffs

### ChatGPT

| Choice | Benefit | Cost |
|--------|---------|------|
| Sentinel wrapping | Pre-validates tool requests | Latency overhead |
| Built-in tools | Polished UX, rich widgets | Less extensibility |
| Server-side execution | Security, control | No local tools |

### Claude.ai

| Choice | Benefit | Cost |
|--------|---------|------|
| MCP protocol | Open, extensible | Complexity |
| Local + cloud tools | Flexibility | Security considerations |
| Strong consistency for tools | Reliable tool results | Higher latency |

---

## Evidence

### ChatGPT (2026-01-04)

Screenshot: Weather card rendered with:
- Current: 53°F, Light rain
- Forecast: 3-day view
- Warning: Possible flooding

Network: 85 requests captured including full Sentinel flow.

### Claude.ai (2026-01-04)

Screenshot: Query visible but no response (502 error)

Network: 19 requests captured including:
- `POST /completion → 502`
- `GET /completion_status?poll=false → 200`
- `GET ?consistency=strong → 200`

---

## Open Questions

| Question | ChatGPT | Claude.ai |
|----------|---------|-----------|
| Tool event format in SSE? | Unknown details | `tool_use`, `tool_result` events |
| Multi-step orchestration? | Unknown | Unknown |
| Parallel tool execution? | Unknown | Unknown |
| Tool timeout handling? | Unknown | 502 observed |

---

## Recommendations

1. **Capture SSE events**: Use browser extension or proxy to capture full SSE stream during tool use
2. **Test multi-step**: Try queries requiring multiple tool calls
3. **Test connectors**: Test GitHub/Salesforce connectors on ChatGPT vs MCP on Claude.ai
4. **Error recovery**: Intentionally trigger errors to observe retry behavior
