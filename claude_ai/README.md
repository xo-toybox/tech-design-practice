# Chatbot Protocol & Architecture Analysis

Analysis of chatbot streaming protocols and system architectures via client-side observation.

## claude.ai Analysis

### Documents

| Document | Scope |
|----------|-------|
| [system-architecture.md](analysis/claude-ai/system-architecture.md) | Infrastructure, services, data layer, tradeoffs |
| [communication-api.md](analysis/claude-ai/communication-api.md) | REST vs SSE vs FCM patterns, user state lifecycle |
| [communication-api-rest.md](analysis/claude-ai/communication-api-rest.md) | REST endpoints, latency profiles, schemas |
| [deep-dive-consistency.md](analysis/claude-ai/deep-dive-consistency.md) | Eventual consistency, LWW data loss scenario |
| [frontend-overview.md](analysis/claude-ai/frontend-overview.md) | Next.js, third-party services, feature flags |
| [product-analysis.md](analysis/claude-ai/product-analysis.md) | Extensions ecosystem, skills, connectors |
| [future-explorations.md](analysis/claude-ai/future-explorations.md) | Test plans for future deep dives |

### Key Findings

| Finding | Detail |
|---------|--------|
| **Infrastructure** | Cloudflare CDN → Google Cloud LB → Envoy mesh, HTTP/3 (86%) |
| **Streaming** | SSE via POST+fetch (not EventSource), 6 event types |
| **Consistency** | Eventually consistent (~2s lag), LWW causes data loss on re-submit |
| **Extensions** | 3 systems: DXT (190KB manifests), Skills (5KB), MCP (SSE bootstrap) |
| **Observability** | Honeycomb tracing, Segment analytics, Statsig flags |
| **Push** | FCM for long-running tasks (Research, tool calls, Claude Code) |

### Tradeoffs Observed

| Tradeoff | Choice |
|----------|--------|
| No idempotency layer | Data loss when user re-submits during stale window |
| Full extension manifests | 190KB on every page load |
| Eventually consistent reads | Simpler backend, but stale reads possible |
| No API versioning | Risk of breaking changes |

---

## Framework

### Capture Methodology

```javascript
// In DevTools Console:
// 1. Paste config: scripts/configs/claude-ai.js
// 2. Paste script: scripts/capture-requests.js
// 3. Interact and export: downloadCaptures()
```

### Directory Structure

```
analysis/{chatbot}/     # Analysis documents
.data/{chatbot}/        # Raw capture data (NDJSON)
scripts/configs/        # Per-chatbot capture configs
```

## Future Work

- Cross-app analysis comparing Claude.ai vs ChatGPT architectures
- Deep dive into streaming protocol differences
- Analyze additional chatbots (Gemini, Copilot, etc.)

## Notes

- PII: remove personal info
- **Live account constraint**: Be conservative with server requests when capturing
- Frontend docs should be visual/diagrammatic for quick reference
- Backend/architecture docs are priority for deep dives
