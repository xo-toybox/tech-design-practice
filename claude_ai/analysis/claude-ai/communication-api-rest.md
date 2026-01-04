# claude.ai API Patterns Analysis

## Overview

This document analyzes non-streaming REST API patterns observed in claude.ai, complementing the streaming protocol analysis.

---

## API Structure

### Base Pattern
```
https://claude.ai/api/organizations/{org_uuid}/...
```

All user-scoped resources are namespaced under organization UUID, enabling multi-tenancy.

### Endpoint Categories

| Category | Pattern | Purpose |
|----------|---------|---------|
| Chat | `/chat_conversations/*` | Conversation CRUD |
| Projects | `/projects/*` | Project management |
| Settings | `/feature_settings`, `/experiences/*` | Feature flags, preferences |
| Billing | `/payment_method`, `/prepaid/*`, `/subscription_details` | Payment and subscription |
| Sync | `/sync/gmail/*`, `/sync/gcal/*`, `/sync/drive/*` | Third-party integrations |
| Extensions | `/skills/*`, `/dxt/*`, `/mcp/*` | Plugins and MCP |
| Notifications | `/notification/*` | Push notification settings |

---

## Request Patterns

### Authentication Headers
```
anthropic-client-platform: web_claude_ai
anthropic-device-id: {device_uuid}
Cookie: [session cookies]
```

### Common Request Headers (Captured)
```javascript
// From raw-capture.ndjson analysis
{
  "Accept": "application/json",
  "Content-Type": "application/json",
  "anthropic-client-platform": "web_claude_ai"
}
```

---

## Response Patterns

### Standard JSON Response
All non-streaming endpoints return `application/json`.

### Response Size Distribution
From raw-capture.ndjson:

| Endpoint | Response Size | Category |
|----------|---------------|----------|
| `/feature_settings` | 414 bytes | Small config |
| `/model_configs/...` | 400 bytes | Small config |
| `/dxt/extensions` | 46,225 bytes | Large payload |
| `/dxt/installable_extensions` | 46,119 bytes | Large payload |
| `/list_styles` | 4,271 bytes | Medium |
| `/skills/list-skills` | 2,066 bytes | Medium |

**Observation**: Extension/plugin data dominates payload size.

---

## Latency Analysis

### By Endpoint Category (from raw-capture.ndjson)

| Category | Endpoint | Latency | Description | Basis |
|----------|----------|---------|-------------|-------|
| **Fast (<150ms)** | | | | |
| | `/sync/gcal/auth` | 117ms | OAuth status (`is_authenticated`) | ✅ verified |
| | `/sync/gmail/auth` | 119ms | OAuth status (`is_authenticated`) | ✅ verified |
| | `/sync/ingestion/gdrive/progress` | 112ms | Drive ingestion job progress | name |
| | `/model_configs/...` | 115ms | Model capabilities (image, pdf, max_tokens) | ✅ verified |
| | `/prepaid/credits` | 121ms | Credit balance + auto-reload settings | ✅ verified |
| | `/projects` | 128ms | List user's projects (array) | ✅ verified |
| **Medium (150-250ms)** | | | | |
| | `/feature_settings` | 149ms | Disabled features list | ✅ verified |
| | `/projects/{uuid}` | 150ms | Single project details | name |
| | `/dxt/installable_extensions` | 151ms | Available extensions catalog | size (46KB) |
| | `/sync/settings` | 155ms | Per-provider sync config (gcal, gdrive, github, gmail) | ✅ verified |
| | `/overage_spend_limit` | 156ms | Usage overage spending cap | name |
| | `/dxt/extensions` | 162ms | Installed extensions list | size (46KB) |
| | `/chat_conversations/count_all` | 164ms | Total count + is_first_conversation flag | ✅ verified |
| | `/chat_conversations` | 165ms | List recent conversations | name |
| | `/spotlight` | 183ms | Promotional slot (returns null when empty) | ✅ verified |
| | `/notification/preferences` | 213ms | Per-feature push/email preferences | ✅ verified |
| | `/experiences/claude_web` | 217ms | In-app messaging/nudge system | ✅ verified |
| | `/skills/list-skills` | 225ms | Available skills catalog | size (2KB) |
| **Slow (>250ms)** | | | | |
| | `/sync/mcp/drive/auth` | 254ms | MCP Drive connector OAuth | name |
| | `/list_styles` | 317ms | Default + custom style presets | ✅ verified |
| | `/payment_method` | 342ms | Saved payment methods | name |
| | `/check_3ds_required` | 349ms | 3D Secure requirement check | ✅ verified |
| | `/account_profile` | 560ms | User preferences (work, locale, avatar) | ✅ verified |
| | `/subscription_details` | 842ms | Full subscription state + billing | ✅ verified |

**Observations**:
- **Fast endpoints**: Read-only cached data (OAuth checks, configs)
- **Slow billing endpoints (340-840ms)**: External payment provider calls (Stripe?)
- **`/account_profile` (560ms)**: Unexpectedly slow - may aggregate multiple sources
- **`/subscription_details` (842ms)**: Slowest - likely Stripe API + usage calc
- **Extension data fast despite size**: 46KB in ~160ms (pre-computed?)

*Basis key: `✅ verified` = response captured and analyzed, `name` = inferred from endpoint name, `size` = response size captured*

---

## Discovered Endpoints

### Full Endpoint List (from capture)
```
# Core API
/api/organizations/{uuid}/chat_conversations
/api/organizations/{uuid}/chat_conversations/count_all
/api/organizations/{uuid}/feature_settings
/api/organizations/{uuid}/projects
/api/organizations/{uuid}/projects/{uuid}
/api/organizations/{uuid}/sync/settings

# Model
/api/organizations/{uuid}/model_configs/claude-opus-4-5-20251101

# Account
/api/account_profile
/api/account/raven_eligible
/api/auth/current_account

# Billing
/api/organizations/{uuid}/subscription_details
/api/organizations/{uuid}/payment_method
/api/organizations/{uuid}/prepaid/credits
/api/organizations/{uuid}/overage_spend_limit
/api/organizations/{uuid}/check_3ds_required

# Integrations (Sync)
/api/organizations/{uuid}/sync/gmail/auth
/api/organizations/{uuid}/sync/gcal/auth
/api/organizations/{uuid}/sync/mcp/drive/auth
/api/organizations/{uuid}/sync/ingestion/gdrive/progress

# Extensions & Plugins
/api/organizations/{uuid}/dxt/extensions
/api/organizations/{uuid}/dxt/installable_extensions
/api/organizations/{uuid}/skills/list-skills
/api/organizations/{uuid}/mcp/v2/bootstrap

# Notifications
/api/organizations/{uuid}/notification/preferences
/api/organizations/{uuid}/notification/channels

# Other
/api/organizations/{uuid}/experiences/claude_web
/api/organizations/{uuid}/list_styles
/api/organizations/{uuid}/spotlight
```

---

## Payload Samples

### feature_settings
```json
{
  "disabled_features": ["haystack", "dxt_allowlist"],
  ...
}
```

### model_configs
```json
{
  "api_model": "claude-opus-4-5-20251101",
  "image_in": true,
  "pdf_in": true,
  "max_tokens_cap": 64000
}
```

### Verified Response Schemas

| Endpoint | Response Keys | Notes |
|----------|---------------|-------|
| `/sync/gcal/auth` | `is_authenticated` | Boolean |
| `/sync/gmail/auth` | `is_authenticated` | Boolean |
| `/prepaid/credits` | `amount`, `currency`, `auto_reload_settings` | |
| `/projects` | Array of project objects | 15 projects captured |
| `/sync/settings` | Array: `{type, enabled, config}` | gcal, gdrive, github, gmail |
| `/chat_conversations/count_all` | `count`, `is_first_conversation` |  |
| `/spotlight` | `spotlight` | null when empty |
| `/notification/preferences` | `account_id`, `organization_id`, `preferences` | Per-feature push/email |
| `/experiences/claude_web` | `experiences`, `rules` | Nudge placements |
| `/list_styles` | `defaultStyles`, `customStyles`, `text` | 5 defaults |
| `/check_3ds_required` | `requires_3ds_verification` | Boolean |
| `/subscription_details` | 13 keys including `status`, `billing_interval`, `payment_method` | Full billing state |
| `/account_profile` | `work_function`, `conversation_preferences`, `locale`, `onboarding_topics`, `avatar` | User preferences only |

---

## Patterns Observed

### 1. Organization Scoping
Every resource is scoped under `/organizations/{uuid}/`, providing:
- Multi-tenant isolation
- Consistent authorization boundary
- Simplified permission model

### 2. Auth State Separation
Three levels of endpoints observed:
- **Account-level**: `/api/account_profile` (user identity)
- **Auth-level**: `/api/auth/current_account` (session)
- **Org-level**: `/api/organizations/{uuid}/...` (resources)

### 3. Sync Integration Pattern
```
/sync/{provider}/auth     - OAuth status check
/sync/ingestion/{provider}/progress - Background job status
/sync/settings            - User preferences
```
Suggests async ingestion with polling for status.

### 4. Extension Architecture
```
/dxt/extensions           - Installed extensions
/dxt/installable_extensions - Available extensions
/skills/list-skills       - Skill definitions
/mcp/v2/bootstrap         - MCP server config
```
Multiple extension systems coexist (dxt, skills, mcp).

---

## Mutation Patterns

### Conversation Creation Flow

When a user sends their first message in a new conversation, the client executes this sequence:

```
1. POST /chat_conversations           → 201 Created (optimistic create)
2. GET  /chat_conversations/count_all → 200 (update sidebar count)
3. POST /chat_conversations/{id}/title → 202 Accepted (async title gen)
4. POST /chat_conversations/{id}/completion → 200 + SSE (stream response)
5. GET  /chat_conversations/{id}?tree=True&consistency=eventual → refresh
```

### Title Generation Endpoint

```
POST /chat_conversations/{uuid}/title
Response: 202 Accepted
```

The 202 status indicates the server accepted the request for asynchronous processing. Title is generated by Claude after analyzing conversation content.

### Conversation Refresh Query Parameters

```
GET /chat_conversations/{uuid}?tree=True&rendering_mode=messages&render_all_tools=true&consistency=eventual
```

| Parameter | Purpose |
|-----------|---------|
| `tree=True` | Return message tree (supports branching/edits) |
| `rendering_mode=messages` | Format output as message list |
| `render_all_tools=true` | Include tool call details |
| `consistency=eventual` | Accept eventually consistent read |

---

## Third-party Domains

| Domain | Purpose | Request Type |
|--------|---------|--------------|
| statsig.anthropic.com | Feature flags | POST `/v1/rgstr` |
| a-api.anthropic.com | Analytics | POST `/v1/i`, `/v1/p`, `/v1/t`, `/v1/m` |
| s-cdn.anthropic.com | Scripts | GET `/s.js` |
| fcmregistrations.googleapis.com | Push notifications | POST |
| widget.intercom.io | Support widget | GET |

---

## Related Documents

- **[open-questions.md](open-questions.md)** - Analysis tracking
- **[deep-dive-consistency.md](deep-dive-consistency.md)** - Consistency behavior and race conditions
- **[communication-api.md](communication-api.md)** - Communication patterns (REST, SSE, FCM)
- **[system-architecture.md](system-architecture.md)** - Infrastructure overview
