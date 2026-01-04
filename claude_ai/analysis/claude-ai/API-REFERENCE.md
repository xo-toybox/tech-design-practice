# Claude.ai API Reference

## Communication Patterns

Three distinct patterns optimized for different use cases:

| Pattern | Direction | Use Case | Latency |
|---------|-----------|----------|---------|
| **REST** | Request-Response | CRUD, metadata | 50-800ms |
| **SSE** | Server -> Client stream | LLM token streaming | Real-time |
| **FCM** | Server -> Device push | Background notifications | Best-effort |

---

## REST Endpoints

All endpoints prefixed with `/api/organizations/{org_uuid}/`.

### Chat

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/chat_conversations` | GET | List conversations | 200-300ms |
| `/chat_conversations` | POST | Create conversation | 200-300ms |
| `/chat_conversations/{id}` | GET | Get conversation (tree) | 200-400ms |
| `/chat_conversations/{id}` | DELETE | Delete conversation | 200ms |
| `/chat_conversations/{id}/title` | POST | Generate title (async) | 202 Accepted |
| `/chat_conversations/{id}/completion` | POST | Stream completion | SSE |
| `/chat_conversations/{id}/wiggle/list-files` | GET | List attachments | 100ms |

### Projects

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/projects` | GET | List projects | 100ms |
| `/projects` | POST | Create project | 200ms |
| `/projects/{id}` | GET | Get project | 100ms |
| `/projects/{id}/permissions` | GET | Get permissions | 100ms |
| `/projects/{id}/accounts` | GET | Get team access | 100ms |
| `/published_artifacts` | GET | List artifacts | 100ms |

### Extensions & Skills

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/dxt/extensions` | GET | List extensions (~190KB) | 150-250ms |
| `/skills/list-skills` | GET | List skills (~5KB) | 100ms |
| `/mcp/v2/bootstrap` | POST | MCP server bootstrap | SSE |

### Sync (Google Integrations)

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/sync/gmail/status` | GET | Gmail OAuth status | 100ms |
| `/sync/gcal/status` | GET | Calendar OAuth status | 100ms |
| `/sync/drive/status` | GET | Drive OAuth status | 100ms |
| `/sync/ingestion/{id}/progress` | GET | Sync progress (polling) | 100ms |

### Settings & Config

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/feature_settings` | GET | Feature flags | 50ms |
| `/experiences` | GET | In-app messaging | 50ms |
| `/model_configs` | GET | Available models | 50ms |
| `/style-presets` | GET | Response styles | 100ms |
| `/notification/preferences` | GET | Push preferences | 100ms |
| `/notification/channels` | POST | Register FCM token | 100ms |

### Billing

| Endpoint | Method | Purpose | Latency |
|----------|--------|---------|---------|
| `/payment_method` | GET | Payment info (Stripe) | 300-850ms |
| `/prepaid/credits` | GET | Credit balance | 200ms |

---

## SSE Streaming Protocol

### Request

```http
POST /api/organizations/{org}/chat_conversations/{id}/completion
Accept: text/event-stream
Content-Type: application/json
anthropic-client-platform: web_claude_ai
anthropic-device-id: {device_uuid}
```

### Response Headers

```http
content-type: text/event-stream
content-encoding: br
cache-control: no-cache
```

### Event Types

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `message_start` | Initialize streaming | `id`, `uuid`, `trace_id`, `request_id`, `model` |
| `content_block_start` | Begin content block | `type` ("thinking"/"text"), `index` |
| `content_block_delta` | Stream tokens | `thinking_delta`, `text_delta` |
| `content_block_stop` | End content block | `index`, `stop_timestamp` |
| `message_delta` | Message complete | `stop_reason` ("end_turn") |
| `message_limit` | Usage tracking | `remaining`, `utilization`, `windows` |

### Event Flow

```
message_start
  -> content_block_start (type: "thinking")
    -> content_block_delta* (thinking tokens)
  -> content_block_stop
  -> content_block_start (type: "text")
    -> content_block_delta* (response tokens)
  -> content_block_stop
-> message_delta (stop_reason)
-> message_limit (usage tracking)
```

### Sample Events

```
event: message_start
data: {"type":"message_start","message":{"id":"chatcompl_01LkfMtWr6o9PUt3Z7w18YEd",
  "trace_id":"db7577439d3cacb9818e102c307ed657","role":"assistant"}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"Hello,"}}

event: message_limit
data: {"type":"message_limit","message_limit":{"type":"within_limit",
  "windows":{"5h":{"utilization":0.04},"7d":{"utilization":0.09}}}}
```

---

## FCM Push Notifications

### Registration

```json
POST /notification/channels
{
  "channel_type": "FCM",
  "registration_token": "dUwRmx-AlSJGVi42...",
  "device_id": "5bd42e02-b09a-4634-9dd3-683dbc12e494",
  "client_platform": "web_claude_ai"
}
```

### Available Channels

| Channel | Purpose |
|---------|---------|
| `completion` | Response complete (long-running tasks) |
| `project_sharing` | Collaboration events |
| `compass`, `bogosort`, `tiny_pancakes` | Unknown |

---

## Query Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `consistency` | `eventual` | Accept stale reads from replica |
| `tree` | `True` | Return full message tree structure |
| `rendering_mode` | `messages` | Format as message list |
| `limit` | number | Pagination page size |
| `offset` | number | Pagination offset |

---

## Response Headers

| Header | Value | Meaning |
|--------|-------|---------|
| `x-envoy-upstream-service-time` | ms | Service mesh latency |
| `cf-cache-status` | `DYNAMIC` | Cloudflare cache status |
| `via` | `1.1 google` | GCP load balancer |
| `content-encoding` | `br`/`zstd` | Compression (Brotli/zstd) |

---

## Latency Profile

| Category | Range | Examples |
|----------|-------|----------|
| Fast | 50-150ms | OAuth status, model configs, flags |
| Medium | 150-300ms | Conversations list, extensions |
| Slow | 300-850ms | Billing (Stripe), account profile |
| Streaming | 1-5s | Completion (model inference bound) |
