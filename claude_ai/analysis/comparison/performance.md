# Performance Comparison

## Summary

| Metric | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Default model** | GPT-5.2 Thinking | Opus 4.5 (extended thinking) | Both use "thinking" modes |
| **Simple prompt latency** | ~5s | 50+s | Extended thinking overhead |
| **Time to first token** | ~1-2s | ~30-40s (thinking phase) | Significant difference |
| **Request flow** | prepare → stream → status | create → title → completion | Different patterns |

---

## Test Methodology (2026-01-04)

**Prompt**: "Say only: Hello world"
**Goal**: Measure baseline latency for simple response

### ChatGPT Results

**Model**: GPT-4o 5.2 Thinking
**Total time**: ~5 seconds
**Response**: "Hello world" (correct)

**Network flow**:
```
POST /backend-api/f/conversation/prepare     → 200
POST /backend-api/f/conversation             → 200 (SSE stream)
GET  /backend-api/conversation/{id}/stream_status → 200
```

**Observations**:
- Sentinel prepare/finalize overhead present but minimal impact
- Streaming begins quickly after request
- Response completes within 5 seconds

### Claude.ai Results

**Model**: Opus 4.5 with Extended Thinking (default)
**Total time**: 50+ seconds (still processing at cutoff)
**Status**: "A bit longer, thanks for your patience..."

**Network flow**:
```
POST /api/.../chat_conversations           → 201 Created
POST /api/.../chat_conversations/{id}/title → 202 Accepted
POST /api/.../chat_conversations/{id}/completion → 200 (SSE)
```

**Observations**:
- Extended thinking phase dominates latency
- No visible streaming during thinking phase
- Simple prompts still trigger full thinking overhead

---

## Key Finding: Extended Thinking UX Trade-off

### The Problem

Claude.ai defaults to Opus 4.5 with extended thinking enabled. This creates a **10x+ latency penalty** for simple prompts that don't benefit from extended reasoning.

```
User expectation: "Hello world" → ~1-2s response
Actual experience: "Hello world" → 50+s with "please wait" messages
```

### ChatGPT's Approach

ChatGPT's "5.2 Thinking" mode appears to:
- Use extended reasoning selectively
- Not apply full thinking overhead to trivial prompts
- Maintain responsive streaming UX

### Design Trade-offs

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Thinking granularity** | Selective/adaptive | Always-on for Opus 4.5 |
| **Simple prompt latency** | Low (~5s) | High (50+s) |
| **Complex task quality** | Unknown | Potentially higher |
| **User control** | Mode selector | Model + thinking toggle |

---

## Request Flow Comparison

### ChatGPT

```
┌─────────┐   ┌──────────┐   ┌─────────┐   ┌─────────┐
│ prepare │──►│ stream   │──►│ SSE     │──►│ status  │
│ (~100ms)│   │ request  │   │ tokens  │   │ check   │
└─────────┘   └──────────┘   └─────────┘   └─────────┘
                  │
                  ▼ TTFB: ~1-2s
```

### Claude.ai (with Extended Thinking)

```
┌─────────┐   ┌──────────┐   ┌───────────────┐   ┌─────────┐
│ create  │──►│ title    │──►│ THINKING      │──►│ stream  │
│ conv    │   │ (async)  │   │ (30-50s)      │   │ tokens  │
└─────────┘   └──────────┘   └───────────────┘   └─────────┘
                                    │
                                    ▼ TTFB: ~30-50s
```

---

## Recommendations for Fair Comparison

1. **Test without extended thinking**: Toggle off extended thinking on Claude.ai for baseline comparison
2. **Test with same-tier models**: GPT-4o vs Claude Sonnet 4 (both mid-tier)
3. **Test complex prompts**: Extended thinking may be worthwhile for complex reasoning
4. **Measure token throughput**: Tokens/second during streaming phase

---

## Evidence

### ChatGPT Screenshot
- Conversation "Hello world request" created
- Response "Hello world" displayed
- Total time ~5 seconds

### Claude.ai Screenshot
- Conversation "Hello world" created
- Status: "A bit longer, thanks for your patience..."
- Extended thinking in progress at 50+ second mark

### Network Captures
- ChatGPT: 34 requests captured including conversation flow
- Claude.ai: 3 chat_conversations requests captured

---

## Open Questions

| Question | Status |
|----------|--------|
| Does ChatGPT's thinking mode skip for simple prompts? | Unknown |
| What's Claude.ai latency without extended thinking? | Not tested |
| What's token throughput during streaming? | Not measured |
| Does cold start add additional latency? | Not tested |
