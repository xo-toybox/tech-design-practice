# claude.ai System Architecture Analysis

## Summary: Key Tradeoffs

| Tradeoff | Choice | Consequence |
|----------|--------|-------------|
| **Latency profile** | Metadata 50-150ms, CRUD 200-700ms, Completion 4-5s | Model inference dominates; CRUD bound by replication |
| **No idempotency layer** | Last-write-wins, no client keys | Data loss when user re-submits during ~2s stale window |
| **Eventually consistent reads** | `consistency=eventual` everywhere | Refresh during ~2s lag window shows empty content |
| **190KB extension payload** | Full manifests for all 52 extensions on every load | Could lazy-load or send only installed extensions |
| **Async title generation** | 202 Accepted, fire-and-forget | Title available before content on refresh |
| **Message tree structure** | `parent_uuid` linking, `current_leaf_message_uuid` | Enables branching but complicates conflict resolution |
| **No API versioning** | No version in URLs or headers | Risk of breaking changes; simpler routing |

**Critical Issue**: Re-submitting during stale read window permanently deletes first message. See [deep-dive-consistency.md](deep-dive-consistency.md).

---

## Architecture Overview

```
┌─────────────┐
│   Browser   │  Next.js (RSC) + Webpack
│  (Client)   │  fetch() + ReadableStream for SSE
└──────┬──────┘
       │
       │  HTTP/3 (QUIC) - 86% of requests (h3)
       │  HTTP/2 fallback - 1.4% (h2)
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NETWORK INFRASTRUCTURE                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  CLOUDFLARE CDN (Edge)                                                  ││
│  │  • TLS 1.3 termination, HTTP/3 (QUIC)                                   ││
│  │  • Brotli/zstd compression                                              ││
│  │  • WAF (assumed)         ← NO EVIDENCE                                  ││
│  │  • DDoS protection       ← NO EVIDENCE (implicit with Cloudflare)       ││
│  └────────────────────────────────┬────────────────────────────────────────┘│
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  GOOGLE CLOUD LOAD BALANCER (L7)                                        ││
│  │  • HTTP-aware routing                                                   ││
│  │  • Rate limiting?        ← NO EVIDENCE (need 429 responses)             ││
│  │  • API Gateway?          ← UNCLEAR if separate component                ││
│  └────────────────────────────────┬────────────────────────────────────────┘│
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ENVOY SERVICE MESH (Internal)                                          ││
│  │  • Service discovery, routing                                           ││
│  │  • Circuit breakers?     ← NO EVIDENCE (need 503 responses)             ││
│  │  • mTLS between services?← NO EVIDENCE (not observable from client)     ││
│  └────────────────────────────────┬────────────────────────────────────────┘│
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
       ┌─────────────┬─────────────┬┴───────────┬─────────────┬─────────────┐
       │             │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  Chat     │ │  Model    │ │ Projects  │ │   Sync    │ │  Billing  │ │ Skills/   │
│  Service  │ │  Service  │ │  Service  │ │  Service  │ │  Service  │ │ Extensions│
├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤
│/chat_conv │ │/completion│ │/projects  │ │/sync/gmail│ │/payment_  │ │/skills/   │
│/count_all │ │/model_cfg │ │/published_│ │/sync/gcal │ │ method    │ │ list-skill│
│           │ │           │ │ artifacts │ │/sync/drive│ │/prepaid/  │ │/dxt/ext   │
│           │ │           │ │           │ │/ingestion │ │ credits   │ │/mcp/v2/   │
└───────────┘ └─────┬─────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
                    │
                    ▼
       ┌─────────────────────────┐
       │    Claude LLM Backend   │
       │  (Inference Servers)    │
       └─────────────────────────┘
```

---

## Edge & Gateway Layer

### HTTP/3 Evidence

**Protocol breakdown from Performance Resource Timing API:**
```javascript
// performance.getEntriesByType('resource') - 221 total requests
{
  "h3": 191,    // 86.4% - HTTP/3 (QUIC)
  "h2": 3,      // 1.4% - HTTP/2 fallback
  "unknown": 27 // 12.2% - Not reported (inline/data URLs)
}
```

**Response headers confirming infrastructure:**
```
server: cloudflare
via: 1.1 google
x-envoy-upstream-service-time: 37
cf-ray: 9b85bf5a3fb3ff90-EWR
content-encoding: zstd
alt-svc: h3=":443"; ma=86400
```

### CDN (Cloudflare)

| Aspect | Configuration |
|--------|---------------|
| Provider | Cloudflare |
| Evidence | `server: cloudflare`, `cf-ray` header |
| Cache behavior | `cf-cache-status: DYNAMIC` for all API endpoints |
| Static assets | Cached on a-cdn/s-cdn.anthropic.com |
| API caching | Bypassed (all `/api/` requests are DYNAMIC) |
| Compression | Brotli (br) for SSE, zstd for JSON (~2.8x ratio) |

### Load Balancer (GCP)

| Aspect | Configuration |
|--------|---------------|
| Provider | Google Cloud Load Balancer |
| Evidence | `via: 1.1 google` header |
| Type | L7 (HTTP-aware, required for QUIC termination) |
| TLS | TLS 1.3 (required for HTTP/3) |

### Network Infrastructure Unknowns

| Topic | Status | Evidence | Open Questions |
|-------|--------|----------|----------------|
| Rate Limiting | Unknown | No `x-ratelimit-*` headers observed | Per-user, per-org, or per-endpoint? Token bucket vs sliding window? |
| Circuit Breakers | Inferred | Envoy presence suggests outlier detection | Trip thresholds? Fallback behavior? |
| Retry Logic | Unknown | — | Between which layers? Idempotency for SSE retries? |
| Timeout Hierarchy | Unknown | — | Edge → Gateway → Backend → Model cascade? |
| Backpressure | Unknown | — | Queue depth limits? How does slow inference propagate? |
| Session Affinity | Unknown | — | Required for SSE? Sticky sessions to pods? |
| Regional Failover | Unknown | — | Multi-region? Active-active or passive? |
| Connection Draining | Unknown | — | Long-lived SSE handling during deploys? |
| DDoS Mitigation | Inferred | Cloudflare WAF (standard deployment) | Application-layer protections beyond WAF? |
| Quota Management | Unknown | — | How do usage limits tie into rate limiting? |
| Service Mesh | Inferred | `x-envoy-upstream-service-time` header | Istio or standalone Envoy? Sidecar topology? |
| Connection Pooling | Observed | 86% HTTP/3, 1.4% HTTP/2 fallback | QUIC 0-RTT resumption enabled? |
| Health Checks | Unknown | — | L4 TCP, L7 HTTP, or gRPC health protocol? |
| Queue Management | Unknown | — | Request queues? Admission control? |
| Secrets Management | Unknown | — | Vault, GCP Secret Manager? |
| Observability | Observed | Honeycomb requests observed | OTEL pipeline details? Trace sampling rate? |
| Blue/Green Deploys | Unknown | — | Traffic splitting strategy? Canary analysis? |

---

## Service Layer

### Service Mesh
- **Provider**: Envoy
- **Evidence**: `x-envoy-upstream-service-time` header
- **Observed latency overhead**: ~50-100ms for metadata, 4000-5000ms for completion (includes model inference)

### API Patterns
- **Style**: REST (resource-based URLs)
- **Versioning strategy**: None observed in URLs (may use headers)
- **Pagination**: Offset-based (`limit`, `offset`, `total` fields)

### Microservices (Discovered)

| Service | Endpoints | Purpose | Latency Profile |
|---------|-----------|---------|-----------------|
| Chat | `/chat_conversations`, `/count_all` | Conversation CRUD | 200-700ms |
| Model | `/completion`, `/model_configs` | LLM inference | 4000-5000ms |
| Projects | `/projects`, `/published_artifacts` | Project management | ~100ms |
| Sync | `/sync/gmail`, `/sync/gcal`, `/sync/drive` | Third-party integrations | ~100ms |
| Billing | `/payment_method`, `/prepaid/credits` | Subscription/payments | ~100ms |
| Skills | `/skills/`, `/dxt/`, `/mcp/v2/` | Extensions & MCP | ~100ms |
| Settings | `/feature_settings`, `/experiences` | Feature flags | ~50ms |

### Inter-service Communication
- **Sync vs async patterns**: SSE for completion (async streaming), JSON for CRUD (sync)
- **Message queues**: Not directly observable, but sync integrations suggest async processing

### Extension Architecture

Three distinct extension systems coexist:

| System | Endpoint | Payload Size | Response Type |
|--------|----------|--------------|---------------|
| **DXT Extensions** | `/dxt/extensions` | ~190KB | Paginated JSON |
| **Skills** | `/skills/list-skills` | ~5KB | JSON array |
| **MCP** | `/mcp/v2/bootstrap` | Variable | SSE stream |

**Technical Notes**:
- DXT: Full manifests sent inline (no lazy loading)
- MCP: SSE bootstrap returns `server_list` event for user-configured servers
- All use standard pagination (`limit`, `offset`, `total`)

*For extension schemas and ecosystem analysis, see [product-analysis.md](product-analysis.md)*

---

## Data Layer

### Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA STORAGE LAYERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRIMARY DATABASE (Relational)                            │   │
│  │  • Conversations, Messages (tree structure)               │   │
│  │  • Projects, Users, Organizations                         │   │
│  │  • Settings, Styles, Experiences                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐      │
│  │    WIGGLE      │ │   ARTIFACTS    │ │     CACHE      │      │
│  │  (User Files)  │ │  (Generated)   │ │  (Redis?)      │      │
│  │                │ │                │ │                │      │
│  │  /wiggle/      │ │  /artifacts/   │ │  Settings,     │      │
│  │  list-files    │ │  {id}/versions │ │  Model configs │      │
│  └────────────────┘ └────────────────┘ └────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Primary Database (Inferred)

**Type**: Likely PostgreSQL (UUID patterns, relational structure)

**Core Entities**:

| Entity | Key Fields | Storage Pattern |
|--------|------------|-----------------|
| **Conversation** | uuid, name, summary, model, `current_leaf_message_uuid` | Tree structure for message branching |
| **Messages** | uuid, parent_uuid, content, role | Tree (enables edits/branches) |
| **Project** | uuid, name, is_private, creator | Org-scoped container |
| **Organization** | uuid | Tenant isolation boundary |

**Conversation Schema** (captured):
```json
{
  "uuid": "019b8680-3afb-731f-88ab-13fba59cab9c",
  "name": "Conversation title",
  "summary": "Auto-generated summary",
  "model": "claude-opus-4-5-20251101",
  "created_at": "2026-01-04T00:55:11.167056Z",
  "updated_at": "2026-01-04T00:55:11.167056Z",
  "current_leaf_message_uuid": "...",
  "settings": {
    "paprika_mode": "extended",
    "enabled_saffron": true,
    "enabled_monkeys_in_a_barrel": true
  }
}
```
- `paprika_mode: "extended"` = extended thinking enabled
- Settings contain feature flags per conversation

**Project Schema**:
```json
{
  "uuid": "...",
  "name": "Project Name",
  "description": "...",
  "is_private": true,
  "is_harmony_project": false,
  "creator": { "uuid": "...", "display_name": "..." }
}
```

**Style Presets**: 5 defaults (Normal, Learning, Concise, Explanatory, Formal) with `is_default: true`. Custom styles have `is_default: false`.

**Message Tree Structure**:
- `current_leaf_message_uuid` points to latest message
- `tree=True` query param returns full tree
- Enables conversation branching and edit history

#### File Storage

| System | Endpoint | Scope | Purpose |
|--------|----------|-------|---------|
| **Wiggle** | `/conversations/{uuid}/wiggle/list-files?prefix=` | Per-conversation | User uploads (images, docs) |
| **Artifacts** | `/artifacts/{uuid}/versions?source=w` | Per-artifact | Claude-generated code/docs |

**Wiggle (User Attachments)**:
- Folder-like structure with prefix filtering
- Called after conversation creation
- Files tied to conversation lifecycle

**Artifacts (Generated Content)**:
- Version-controlled storage
- Called twice: initial load + post-completion refresh
- Supports iteration/editing workflow

#### Caching Layer

- **Redis/Memcached indicators**: ~50ms for feature_settings, consistent model_configs
- **Cache patterns**: Read-through for configs/settings
- **CDN**: Static assets via a-cdn.anthropic.com

### Consistency Model

**See [deep-dive-consistency.md](deep-dive-consistency.md) for detailed empirical analysis.**

#### Key Findings
- **Read Consistency**: Eventually consistent (`consistency=eventual` query param)
- **Replication Lag**: ~2 seconds observed
- **Write Conflict Resolution**: Last-write-wins (causes data loss on re-submit)
- **Partial Replication**: Title replicates before message content

#### Normal vs Refresh Behavior
```
Normal flow:
  POST /completion → SSE stream delivers response in real-time
  (no read needed - data comes through stream)

Refresh during lag window:
  POST /completion → 200 + SSE (write succeeds)
  [user refreshes page]
  GET /conversation → { messages: [] }  ← stale read, content empty
  [user thinks submission failed, re-submits different message]
  → LWW overwrites first message
```

#### Critical Issue: LWW Data Loss
If user refreshes mid-stream and re-submits during stale read window, first message is permanently lost. No idempotency or conflict detection implemented.

### Durability

#### Write Acknowledgment
- **Model**: Synchronous acknowledgment for user data
- **Evidence**:
  - 201 response includes created resource
  - No client-side retry logic observed

#### Replication (Inferred)
- **Multi-region indicators**:
  - Cloudflare global edge
  - Google Cloud backend (likely multi-region)
- **Failover patterns**: Not observable from client

### Data Partitioning
- **Sharding indicators**: Organization UUID in all API paths suggests org-based partitioning
- **Tenant isolation**: Strong (org UUID required for all data access)

---

## Observability & Third-party Services

### Distributed Tracing (Honeycomb)

**How it works**:
1. Server generates `trace_id` for each completion request
2. `trace_id` included in SSE `message_start` event to client
3. Server sends spans to `api.honeycomb.io/v1/traces`
4. Client can correlate UX metrics with server-side traces

**SSE Trace Correlation**:
```json
{
  "type": "message_start",
  "message": {
    "trace_id": "db7577439d3cacb9818e102c307ed657",
    "request_id": "req_011CWmRgdwSkKf1UMebexS57"
  }
}
```

### Product Analytics (Segment-based)

**Endpoint**: `a-api.anthropic.com/v1/t` (track events)

**Integrations**:
| System | Purpose | Status |
|--------|---------|--------|
| Segment.io | Event routing | Enabled |
| Amplitude | Session tracking | Enabled (session_id) |
| Facebook Pixel | Ad tracking | Disabled |
| DoubleClick | Ad tracking | Disabled |

**Event Structure**:
```json
{
  "event": "claudeai.cardamom_prompts.prompt_displayed",
  "type": "track",
  "properties": {
    "account_uuid": "...",
    "organization_uuid": "...",
    "billing_type": "stripe_subscription",
    "surface": "claude-ai"
  }
}
```

### Feature Flags (Statsig)

**Endpoint**: `statsig.anthropic.com/v1/rgstr`

**Feature Flag Codenames** (from conversation settings):
- `paprika_mode`: Extended thinking ("extended")
- `enabled_saffron`, `enabled_turmeric`: Unknown features
- `enabled_monkeys_in_a_barrel`: Unknown feature
- `enabled_bananagrams`, `enabled_sourdough`, `enabled_foccacia`: Unreleased features

### Observability Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
├─────────────────────────────────────────────────────────────────┤
│  Segment Events ──────▶ a-api.anthropic.com/v1/t               │
│  Feature Flags  ◀─────▶ statsig.anthropic.com                  │
│  trace_id       ◀───── SSE message_start                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER                                   │
├─────────────────────────────────────────────────────────────────┤
│  Spans ─────────────────▶ api.honeycomb.io/v1/traces           │
│  trace_id propagation across microservices via Envoy           │
└─────────────────────────────────────────────────────────────────┘
```

### External Service Dependencies

| Service | Domain | Purpose |
|---------|--------|---------|
| Honeycomb | api.honeycomb.io | Distributed tracing |
| Segment | a-api.anthropic.com | Product analytics |
| Statsig | statsig.anthropic.com | Feature flags |
| Firebase | fcmregistrations.googleapis.com | Push notifications |
| Google APIs | via /sync/* | OAuth integrations (Drive, Gmail, Calendar) |

---

## Security Observations

### Authentication
- **Auth mechanisms**: Cookie-based session + device ID
- **Token patterns**: UUID device identifiers, session cookies

### Authorization
- **RBAC / ABAC indicators**:
  - `/projects/{uuid}/permissions` endpoint
  - `/projects/{uuid}/accounts` for team access
- **Org/project scoping**: All resources under organization UUID

### Data Protection
- **Encryption in transit**: TLS 1.3 (required for HTTP/3)
- **PII handling**: User data scoped to authenticated session

---

## Performance Characteristics

### Latency Breakdown

| Operation | Typical Latency | Bound By |
|-----------|----------------|----------|
| Metadata fetch | 50-150ms | Cache hit, network RTT |
| Conversation CRUD | 200-700ms | Database, replication |
| Completion (TTFB) | ~1s | Model queue, warmup |
| Completion (total) | 4000-5000ms | Token generation |
| Page load (DOMContentLoaded) | ~1.7s | Bundle size, parallelism |
| Page load (Complete) | ~2.3s | Extension manifests (190KB) |

### Operational Patterns

| Pattern | Observation |
|---------|-------------|
| **Parallel requests** | ~250 requests on page load (batched metadata + extensions + settings) |
| **Streaming** | SSE with Brotli compression; chunked token delivery |
| **Connection reuse** | HTTP/3 multiplexing (single QUIC connection) |
| **Compression** | Brotli for SSE, zstd for JSON (~2.8x ratio) |
| **Graceful degradation** | Feature flags enable per-feature disable on issues |

---

## Related Documents

- **[product-analysis.md](product-analysis.md)** - Extension ecosystem, skills, feature insights
- **[communication-overview.md](communication-overview.md)** - Communication patterns (REST, SSE, FCM)
- **[communication-api.md](communication-api.md)** - REST endpoint patterns and latency analysis
