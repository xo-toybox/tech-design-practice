# AI Chatbot Architecture Analysis

Analysis of ChatGPT and Claude.ai architectures via client-side observation.

**Methodology**: Chrome DevTools network captures, no source code access.

---

## Key Insights

### 1. Claude.ai Stale Read Hazard (Critical)

Claude.ai exhibits a **read-your-writes consistency violation** during ~2s replication window:

```
Submit message → Persists on primary → Replication lag (~2s)
                                              ↓
                              Refresh during window → Stale read
                                              ↓
                              Re-submit → Overwrites original
```

**Impact**: User-triggered data loss. Not a durability failure - data IS persisted, but clients may read stale replicas.

### 2. Extended Thinking Latency (10x Overhead)

| Platform | Model | Simple Prompt |
|----------|-------|---------------|
| ChatGPT | GPT-5.2 Thinking | ~5s |
| Claude.ai | Opus 4.5 (extended) | 50+s |

**Root cause**: Extended thinking applies to all prompts, including trivial ones.

### 3. No Real-Time Multi-Tab Sync (Both Platforms)

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Mechanism** | WebSocket (`celsius`) | Firebase Cloud Messaging |
| **Type** | Persistent bidirectional | Push-based |
| **Multi-tab sync** | None (refresh required) | None (refresh required) |

**Key finding**: Neither platform syncs conversation content across tabs in real-time. WebSocket/FCM appear to be used for notifications, not conversation state.

### 4. Anti-Abuse Patterns

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Pre-validation** | Sentinel prepare/finalize | None observed |
| **Overhead** | ~100-200ms | 0ms |
| **Recovery** | `/stream_status` polling | `/completion_status` polling |

### 5. Memory Architecture

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Extraction** | Real-time during chat | Nightly batch regeneration |
| **Structure** | Flat list | 3 sections (Work/Personal/Top-of-mind) |
| **Update latency** | Immediate | ~24 hours |

### 6. Agent Architecture Divergence

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Approach** | Explicit modes (Deep Research, Canvas, Codex) | Capabilities-based (Settings toggles) |
| **Custom agents** | GPTs (marketplace) | Skills (Preview) |
| **Scheduled tasks** | Tasks feature | None observed |
| **Browser automation** | Computer Use (API) | Claude in Chrome (Max plan) |

**Key finding**: ChatGPT has modular agent architecture with explicit mode selection. Claude.ai integrates capabilities without explicit "agent mode" toggle.

---

## Summary Comparison

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Consistency** | Unknown (likely similar) | Eventually consistent (~2s) |
| **Extensions** | OAuth connectors (cloud) | MCP (local + OAuth sync) |
| **Protocol** | Proprietary | MCP (open standard) |
| **Default latency** | ~5s | 50+s (extended thinking) |

---

## Directory Structure

```
analysis/
├── chatgpt/              # ChatGPT-specific analysis
│   ├── features/         # Feature deep-dives
│   ├── insights/         # Architectural patterns
│   └── backlog/          # Future explorations
│
├── claude-ai/            # Claude.ai-specific analysis
│   ├── features/         # Feature deep-dives
│   ├── insights/         # Architectural patterns
│   └── backlog/          # Future explorations
│
└── comparison/           # Cross-platform comparison
    ├── PLAN.md           # Planning & tracking
    ├── README.md         # Document index
    └── *.md              # Comparison docs (12 total)
```

---

## Comparison Documents

See [analysis/comparison/README.md](analysis/comparison/README.md) for full document list.

**Completed (12)**:
architecture, streaming, durability, error-handling, agent-execution, extensions, memories, gpts-projects, realtime-sync, performance, security, agent-modes

---

## Methodology

- Chrome DevTools network captures
- Direct browser interaction
- No source code access (client-observable only)
- Evidence-based claims with network capture citations
