# ChatGPT API Reference

Consolidated endpoint catalog from all captured network traffic.

---

## Endpoint Index

| Category | Base Path | Doc Reference |
|----------|-----------|---------------|
| [Conversations](#conversations) | `/backend-api/conversation*` | features/conversations.md |
| [Streaming](#streaming) | `/backend-api/f/conversation*` | features/conversations.md |
| [GPTs/Gizmos](#gptsgizmos) | `/backend-api/gizmos/*` | features/gpts.md |
| [Memories](#memories) | `/backend-api/memories/*` | features/memories.md |
| [Tasks/Automations](#tasksautomations) | `/backend-api/automations/*` | features/tasks.md |
| [Calpico/Rooms](#calpicorooms) | `/backend-api/calpico/*` | features/calpico.md |
| [Images](#images) | `/backend-api/images/*` | features/images.md |
| [Codex/WHAM](#codexwham) | `/backend-api/wham/*` | features/codex.md |
| [Connectors](#connectors) | `/backend-api/aip/connectors/*` | features/modes.md |
| [Sentinel](#sentinel) | `/backend-api/sentinel/*` | features/conversations.md |
| [Settings](#settings) | `/backend-api/settings/*` | features/settings.md |
| [User/Account](#useraccount) | `/backend-api/me`, `/backend-api/accounts/*` | - |
| [Analytics](#analytics) | `/ces/*`, `ab.chatgpt.com/*` | - |

---

## Conversations

### CRUD Operations

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/conversations` | GET | List conversations |
| `/backend-api/conversations` | POST | Create conversation |
| `/backend-api/conversations/batch` | POST | Batch fetch metadata |
| `/backend-api/conversation/{id}` | GET | Get conversation |
| `/backend-api/conversation/{id}` | PATCH | Update conversation |
| `/backend-api/conversation/{id}` | DELETE | Delete conversation |
| `/backend-api/conversation/init` | POST | Initialize context |

**Query Parameters** (GET /conversations):
- `offset` - Pagination offset
- `limit` - Items per page (default: 28)
- `order` - Sort order (`updated`)
- `is_archived` - Filter archived
- `is_starred` - Filter starred

### Conversation State

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/conversation/{id}/stream_status` | GET | Check completion status |
| `/backend-api/conversation/{id}/textdocs` | GET | Get attached documents |

---

## Streaming

### Message Flow

| Endpoint | Method | Purpose | Order |
|----------|--------|---------|-------|
| `/backend-api/f/conversation/prepare` | POST | Prepare context | 1 |
| `/backend-api/sentinel/chat-requirements/prepare` | POST | Anti-abuse check | 2 |
| `/backend-api/f/conversation` | POST | Send message (SSE) | 3 |
| `/backend-api/sentinel/chat-requirements/finalize` | POST | Post-message check | 4 |

**Response**: `text/event-stream` with JSON-patch deltas.

---

## GPTs/Gizmos

### Discovery

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/gizmos/discovery` | GET | Browse GPT store |
| `/backend-api/gizmos/discovery/recent` | GET | Recently used GPTs |
| `/backend-api/gizmos/discovery/mine` | GET | User's created GPTs |
| `/backend-api/gizmos/discovery/mine/drafts` | GET | Draft GPTs |
| `/backend-api/gizmos/bootstrap` | GET | Recent GPTs summary |
| `/backend-api/gizmos/snorlax/sidebar` | GET | Sidebar GPT list |

**Query Parameters** (discovery endpoints):
- `offset`, `limit` - Pagination
- `category` - Filter by category

### Individual GPT

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/gizmos/{gizmo_id}` | GET | Get GPT details |
| `/backend-api/gizmos/{gizmo_id}` | PUT | Update GPT |
| `/backend-api/gizmos/{gizmo_id}/tools` | GET | Get GPT tools |
| `/backend-api/gizmos/{gizmo_id}/knowledge` | GET | Get GPT knowledge files |
| `/backend-api/gizmos/{gizmo_id}/icon` | PUT | Update GPT icon |
| `/backend-api/gizmo_editor/drafts` | POST | Create GPT draft |

**ID Format**: `g-{13-char-alphanumeric}` (e.g., `g-p9rJVPTq7K4`)

---

## Memories

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/memories` | GET | List all memories |
| `/backend-api/memories` | POST | Create memory |
| `/backend-api/memories/preferences` | GET | Memory preferences |
| `/backend-api/memories/preferences` | PATCH | Update preferences |
| `/backend-api/memories/{id}` | DELETE | Delete memory |
| `/backend-api/user_bio` | GET | User biography |
| `/backend-api/user_bio` | PUT | Update biography |
| `/backend-api/personalization/personality_nudges` | GET | Personality traits |
| `/backend-api/personalization/personality_nudges` | PATCH | Update traits |

**Memory Types**: core, persona, procedural, exemplar

---

## Tasks/Automations

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/automations` | GET | List automations |
| `/backend-api/automations` | POST | Create automation |
| `/backend-api/automations/{id}` | GET | Get automation |
| `/backend-api/automations/{id}` | PATCH | Update automation |
| `/backend-api/automations/{id}` | DELETE | Delete automation |
| `/backend-api/automations/{id}/conversations` | GET | Get runs |
| `/backend-api/automations/{id}/enable` | POST | Enable |
| `/backend-api/automations/{id}/disable` | POST | Disable |
| `/backend-api/automations/{id}/trigger` | POST | Manual trigger |
| `/backend-api/automations/available_tools` | GET | Available tools |
| `/backend-api/schedules` | GET | List schedules |

**ID Format**: `sched_{hex}` (e.g., `sched_693f3b7a76e88170`)

---

## Calpico/Rooms

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/calpico/chatgpt/rooms/summary` | GET | List rooms |
| `/backend-api/calpico/chatgpt/rooms` | POST | Create room |
| `/backend-api/calpico/chatgpt/rooms/{id}` | GET | Get room |
| `/backend-api/calpico/chatgpt/rooms/{id}/messages` | GET | Get messages |
| `/backend-api/calpico/chatgpt/rooms/{id}/messages` | POST | Send message |
| `/backend-api/calpico/chatgpt/rooms/{id}/read` | POST | Mark as read |
| `/backend-api/calpico/chatgpt/rooms/{id}/responding_heartbeat` | POST | AI generating |

**Query Parameters** (messages):
- `limit` - Messages per page (default: 20)
- `before`, `after` - Cursor pagination

**Cursor Format**: `{room_id}~{room_id}~CalpicoMessage~{message_id}`

---

## Images

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/images/bootstrap` | GET | Initialize images |
| `/backend-api/images/styles` | GET | Style presets |
| `/backend-api/images/init` | GET | Session init |
| `/backend-api/my/recent/image_gen` | GET | Generated images |
| `/backend-api/my/recent/uploaded_images` | GET | Uploaded images |
| `/backend-api/files/download/file_{id}` | GET | Download image |
| `/backend-api/estuary/content` | GET | CDN delivery |

**Estuary Parameters**:
- `id` - Composite ID (`{hash}#file_{id}#thumbnail`)
- `sig` - HMAC signature
- `ts` - Timestamp
- `ma` - Max age

---

## Codex/WHAM

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/wham/tasks` | GET | List tasks |
| `/backend-api/wham/tasks` | POST | Create task |
| `/backend-api/wham/tasks/{id}` | GET | Get task |
| `/backend-api/wham/tasks/{id}/turns` | GET | Get turns |
| `/backend-api/wham/tasks/{id}/environment` | GET | Get environment |
| `/backend-api/wham/tasks/{id}/environment` | POST | Create environment |
| `/backend-api/wham/tasks/{id}/turns` | POST | Send message |
| `/backend-api/wham/sandbox/templates` | GET | Sandbox templates |
| `/backend-api/wham/sandbox/{id}/status` | GET | Sandbox status |
| `/backend-api/wham/sandbox/{id}/exec` | POST | Execute command |
| `/backend-api/wham/sandbox/{id}/files` | GET | List files |
| `/backend-api/wham/sandbox/{id}/files` | PUT | Upload file |
| `/backend-api/wham/sandbox/{id}/terminal` | WS | Terminal stream |

**Task ID Format**: UUID

---

## Connectors

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/aip/connectors/list_accessible` | POST | List connectors |
| `/backend-api/aip/connectors/links/list_accessible` | POST | List links |
| `/backend-api/aip/connectors/{id}` | GET | Get connector |
| `/backend-api/aip/connectors/{id}/logo` | GET | Get logo |
| `/backend-api/aip/connectors/{id}/mfa_requirement` | GET | MFA check |
| `/backend-api/aip/connectors/{id}/tos` | GET | Terms of service |
| `/backend-api/aip/connectors/github/has_installations` | POST | GitHub check |
| `/backend-api/connectors/check` | GET | Check status |

**Connector ID Format**: `connector_{32-char-hex}`

---

## Sentinel

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/sentinel/chat-requirements/prepare` | POST | Pre-message check |
| `/backend-api/sentinel/chat-requirements/finalize` | POST | Post-message check |

Always called in pairs around `/f/conversation`.

---

## Settings

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/settings/user` | GET | User settings |
| `/backend-api/settings/voices` | GET | Voice options |
| `/backend-api/settings/is_adult` | GET | Age verification |
| `/backend-api/system_hints` | GET | System prompts |

**Query Parameters** (system_hints):
- `mode` - `basic` or `connectors`

---

## User/Account

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/me` | GET | Current user |
| `/backend-api/accounts/check/v4-2023-04-27` | GET | Account check |
| `/backend-api/user_system_messages` | GET | System messages |
| `/backend-api/client/strings` | GET | Localization |

---

## Analytics

### Custom Event System (CES)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ces/v1/t` | POST | Track event |
| `/ces/v1/i` | POST | Identify user |
| `/ces/v1/p` | POST | Page view |
| `/ces/statsc/flush` | POST | Flush buffer |
| `/ces/v1/projects/oai/settings` | GET | Settings |

### A/B Testing

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `ab.chatgpt.com/v1/rgstr` | POST | Register exposure |

**Query Parameters**:
- `k` - API key
- `st` - SDK type
- `sv` - SDK version
- `sid` - Session ID

---

## Miscellaneous

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend-api/pins` | GET | Pinned items |
| `/backend-api/beacons/home` | GET | Home notifications |
| `/backend-api/amphora/notifications` | GET | Notifications |
| `/backend-api/lat/r` | POST | Latency reporting |

---

## WebSocket

| Endpoint | Purpose |
|----------|---------|
| `wss://ws.chatgpt.com/ws/user/{user_id}?verify={timestamp}-{signature}` | Real-time updates |
| `/backend-api/celsius/ws/user` | WS initialization |

---

## Common Patterns

### Pagination
- Offset-based: `offset`, `limit`, `total`
- Cursor-based: `before`, `after` (Calpico)

### Authentication
- Cookie-based session
- Device ID in headers

### Response Codes
- 200: Success
- 202: Accepted (async)
- 204: No content
- 404: Not found
- 429: Rate limited
- 503: Service unavailable
