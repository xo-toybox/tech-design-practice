# Architectural Patterns

Synthesized cross-cutting patterns discovered across feature analysis.

---

## Core Principles

### 1. Conversation as Universal Container

| Feature | Implementation | Why? |
|---------|----------------|------|
| Text chat | Native | Primary use case |
| Image generation | Creates new conversation | Reuse streaming, storage |
| Codex tasks | Links to conversation | Unified history |
| GPTs | Conversation + gizmo context | Same UI, different prompt |

**Tradeoff**: Maximum reuse vs. feature-specific optimization lost.

### 2. Estuary CDN as Universal Asset Delivery

All assets through HMAC-signed URLs:

| Security | Mechanism |
|----------|-----------|
| URL forgery prevention | HMAC signature (`sig`) |
| Expiration | Timestamp (`ts`) |
| Provenance tracking | Composite IDs |

### 3. Sentinel as Universal Gate

```
User Action → POST /sentinel/prepare → Execute → POST /sentinel/finalize
```

**Cost**: +100-200ms per action for abuse prevention.

### 4. Hash-Based Client Routing

| Route | Example | Behavior |
|-------|---------|----------|
| Settings modal | `/#settings/Security` | Opens overlay |
| Deep link | `/#settings/Account` | Opens specific tab |

### 5. Modes as Capability Switches

| Mode | Badge | Entry |
|------|-------|-------|
| Agent | "Agent" | "+" menu |
| Research | "Research" | "+" menu |
| Shopping | "Shopping research" | "+" menu |

---

## API Conventions

### ID Formats

| Entity | Format |
|--------|--------|
| Conversation | UUID |
| File | `file_00000000{16-char-hex}` |
| GPT | `g-{11-char}` or `g-{32-char-hex}` |
| Room | 32-char hex |
| Task | `task_e_{32-char-hex}` |
| Connector | `connector_{32-char-hex}` |

### Pagination

- Offset: `?offset=0&limit=28` (conversations)
- Cursor: `?after={cursor}` (Calpico messages)

---

## Communication Patterns

| Protocol | Use Case | Why |
|----------|----------|-----|
| REST | CRUD, queries, settings | Simplicity |
| SSE (POST) | Model response streaming | Supports request body |
| WebSocket | Unknown (see below) | Bi-directional |

### WebSocket (Celsius) - Purpose Unknown

**Observed**:
- URL: `wss://ws.chatgpt.com/ws/user/{user_id}?verify={timestamp}-{signature}`
- Init endpoint: `/backend-api/celsius/ws/user`
- Connection established on page load

**Unknown**:
- Message format (JSON? Binary?)
- What triggers messages
- Specific purpose (notifications? presence? sync?)

**Hypothesis**: Likely used for push notifications or real-time updates (e.g., task completion, room messages) but not confirmed.

See [backlog/explorations.md](../backlog/explorations.md#websocket-investigation) for investigation plan.

---

## Durability Model

**Server-authoritative**: Client state is transient.

| Mechanism | Purpose |
|-----------|---------|
| Persist before stream | Message has ID before response |
| Echo in stream | `input_message` confirms persistence |
| Full reload | GET on every page load |
| Status check | `/stream_status` on load |

**Result**: No data loss window on refresh.

---

## Isolation Patterns

### Memory

| Context | Behavior |
|---------|----------|
| Personal | Uses personal memories |
| GPT | GPT-specific (`?gizmo_id`) |
| Room | "Personal memory never used" |

### Instructions

| Context | Source |
|---------|--------|
| Personal | User custom instructions |
| GPT | GPT system prompt + user |
| Room | Per-room (1500 chars) |

---

## Service Code Names

| Service | Name | Domain |
|---------|------|--------|
| Group chat | Calpico | Beverage |
| Notifications | Amphora | Vessel |
| WebSocket | Celsius | Temperature |
| Codex | WHAM | Sound effect |
| GPTs sidebar | Snorlax | Pokémon |

---

## Common Tradeoffs

### Latency vs Safety

| Choice | Cost |
|--------|------|
| Sentinel prepare/finalize | +100-200ms |
| POST streaming | Manual reconnect |
| Full page reload | Larger payloads |

### Simplicity vs Optimization

| Choice | Cost |
|--------|------|
| Images via conversation | Can't optimize UX |
| Calpico polling | Not real-time |

### Security vs DX

| Choice | Cost |
|--------|------|
| HMAC-signed URLs | Complex construction |
| Signed WebSocket | Extra init |

---

## Infrastructure Services

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SHARED INFRASTRUCTURE                                 │
│  Estuary (CDN) | Sentinel (Anti-abuse) | Celsius (WebSocket)            │
│  Amphora (Notifications) | Beacons (Home) | CES (Analytics)             │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FEATURE SERVICES                                    │
│  Conversation | Gizmos | Calpico | WHAM | Memories | Images             │
│  Automations | Apps/AIP | Settings | Modes | Orders                     │
└─────────────────────────────────────────────────────────────────────────┘
```
