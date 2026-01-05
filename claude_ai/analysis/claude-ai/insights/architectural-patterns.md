# Architectural Patterns

## Summary: Key Tradeoffs

| Tradeoff | Choice | Consequence |
|----------|--------|-------------|
| **Latency profile** | Metadata 50-150ms, CRUD 200-700ms, Completion 4-5s | Model inference dominates; CRUD bound by replication |
| **No idempotency layer** | Last-write-wins, no client keys | Data loss when user re-submits during ~2s stale window |
| **Eventually consistent reads** | `consistency=eventual` everywhere | Refresh during ~2s lag window shows empty content |
| **190KB extension payload** | Full manifests on every load | Could lazy-load or send only installed |
| **Async title generation** | 202 Accepted, fire-and-forget | Title available before content on refresh |
| **Message tree structure** | `parent_uuid` linking | Enables branching but complicates conflict resolution |
| **No API versioning** | No version in URLs or headers | Risk of breaking changes; simpler routing |

---

## Infrastructure Stack

```
+-------------------------------------------------------------------------+
|                         NETWORK LAYER                                    |
|  Cloudflare CDN (Edge) -> GCP L7 LB -> Envoy Service Mesh              |
+-------------------------------------------------------------------------+
         |
         v
+-------------------------------------------------------------------------+
|                         SERVICE LAYER                                    |
|  Chat | Model | Projects | Sync | Billing | Skills/Extensions          |
+-------------------------------------------------------------------------+
         |
         v
+-------------------------------------------------------------------------+
|                         DATA LAYER                                       |
|  Primary DB -> Replica (async, ~2s lag)                                 |
|  Wiggle (files) | Artifacts (versions) | Cache (Redis?)                |
+-------------------------------------------------------------------------+
```

---

## Network Infrastructure

### HTTP/3 Adoption

```
Protocol breakdown (221 requests):
  h3: 191 (86.4%) - HTTP/3 (QUIC)
  h2: 3 (1.4%) - HTTP/2 fallback
  unknown: 27 (12.2%) - Inline/data URLs
```

### Response Headers

```
server: cloudflare
via: 1.1 google
x-envoy-upstream-service-time: 37
cf-ray: 9b85bf5a3fb3ff90-EWR
content-encoding: zstd
alt-svc: h3=":443"; ma=86400
```

### Infrastructure Evidence

| Component | Evidence |
|-----------|----------|
| CDN | `server: cloudflare`, `cf-ray` header |
| Load Balancer | `via: 1.1 google` (GCP L7) |
| Service Mesh | `x-envoy-upstream-service-time` |
| Compression | Brotli (SSE), zstd (JSON) |

---

## Service Architecture

### Microservices

| Service | Endpoints | Latency |
|---------|-----------|---------|
| Chat | `/chat_conversations`, `/count_all` | 200-700ms |
| Model | `/completion`, `/model_configs` | 4000-5000ms |
| Projects | `/projects`, `/published_artifacts` | ~100ms |
| Sync | `/sync/gmail`, `/sync/gcal`, `/sync/drive` | ~100ms |
| Billing | `/payment_method`, `/prepaid/credits` | 300-850ms |
| Skills | `/skills/`, `/dxt/`, `/mcp/v2/` | ~100ms |
| Settings | `/feature_settings`, `/experiences` | ~50ms |

### API Patterns

| Pattern | Implementation |
|---------|----------------|
| Style | REST (resource-based URLs) |
| Versioning | None observed |
| Pagination | Offset-based (`limit`, `offset`, `total`) |
| Org scoping | `/organizations/{uuid}/` prefix |

---

## Data Architecture

### Primary Database (Inferred PostgreSQL)

Core entities with UUIDv7 identifiers:
- Conversations (tree structure)
- Messages (parent_uuid linking)
- Projects (org-scoped)
- Organizations (tenant boundary)

### Storage Systems

| System | Purpose | Endpoint |
|--------|---------|----------|
| **Wiggle** | User file uploads | `/wiggle/list-files` |
| **Artifacts** | Claude-generated content | `/artifacts/{id}/versions` |
| **Cache** | Settings, configs | ~50ms latency |

### Consistency Model

| Aspect | Behavior |
|--------|----------|
| Read consistency | Eventually consistent |
| Replication lag | ~2 seconds |
| Partial replication | Title before content |
| Write conflict | Last-write-wins |

---

## Observability

### Distributed Tracing (Honeycomb)

```json
{
  "type": "message_start",
  "message": {
    "trace_id": "db7577439d3cacb9818e102c307ed657",
    "request_id": "req_011CWmRgdwSkKf1UMebexS57"
  }
}
```

- `trace_id` in SSE `message_start` event
- Server spans sent to `api.honeycomb.io/v1/traces`
- Client can correlate UX metrics with server traces

### Analytics & Feature Flags

| System | Domain | Purpose |
|--------|--------|---------|
| Segment | a-api.anthropic.com | Product analytics |
| Statsig | statsig.anthropic.com | Feature flags |
| Sentry | (inferred) | Error tracking |
| Firebase | fcmregistrations.googleapis.com | Push notifications |

---

## Security

### Authentication

| Mechanism | Usage |
|-----------|-------|
| Session cookies | Primary auth |
| Device ID | `anthropic-device-id` header |

### Authorization

- Org/project scoping in all URLs
- `/projects/{id}/permissions` endpoint
- `/projects/{id}/accounts` for team access

### Extension Security

- Signature verification (`signature_info.verified`)
- Blocklist/allowlist flags
- Review process unclear

---

## Performance Characteristics

| Metric | Value | Bound By |
|--------|-------|----------|
| Metadata fetch | 50-150ms | Cache, network RTT |
| Conversation CRUD | 200-700ms | Database, replication |
| Completion TTFB | ~1s | Model queue |
| Completion total | 4-5s | Token generation |
| Page load (DOMContentLoaded) | ~1.7s | Bundle size |
| Page load (complete) | ~2.3s | Extension manifests |

### Optimization Patterns

| Pattern | Implementation |
|---------|----------------|
| Parallel requests | ~250 requests on page load |
| Streaming | SSE with Brotli compression |
| Connection reuse | HTTP/3 multiplexing |
| Graceful degradation | Feature flags |

---

## Unknown Infrastructure

| Topic | Status |
|-------|--------|
| Rate limiting | No `x-ratelimit-*` headers observed |
| Circuit breakers | Inferred from Envoy |
| Retry logic | Unknown |
| Regional failover | Unknown |
| Queue management | Unknown |
| Blue/green deploys | Unknown |
