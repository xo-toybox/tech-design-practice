# GPTs (Gizmos) System

Custom ChatGPT configurations combining instructions, knowledge, and capabilities.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Runtime context composition | Fetch system_hints + gizmo + memories per request | Latency, ordering conflicts |
| Memory scoping | `exclusive_to_gizmo` flag for GPT-specific | User confusion about scope |
| Public marketplace | Discovery API with rankings/ratings | GPT instructions easily cloneable |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GPT (GIZMO) SYSTEM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  GPT Store   │    │ User's GPTs  │    │  GPT Chat    │          │
│  │ (Discovery)  │    │  (Sidebar)   │    │  Interface   │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     GIZMOS API LAYER                          │  │
│  │  /public-api/gizmos/discovery    (store browsing)            │  │
│  │  /backend-api/gizmos/bootstrap   (recent GPTs)               │  │
│  │  /backend-api/gizmos/snorlax/sidebar (user's GPTs)           │  │
│  │  /backend-api/gizmos/{id}        (GPT config)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     SUPPORTING SERVICES                       │  │
│  │  /backend-api/estuary/content    (GPT assets)                │  │
│  │  /backend-api/memories           (GPT-specific memories)     │  │
│  │  /backend-api/system_hints       (system prompts)            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## GPT Identifier Format

| Format | Example | Notes |
|--------|---------|-------|
| Short ID | `g-h8l4uLHFQ` | 11-char alphanumeric after `g-` |
| Long ID | `g-68d8ecbe98388191bd93f6b1d03158bf` | 32-char hex after `g-` |
| URL slug | `g-h8l4uLHFQ-video-ai-by-invideo` | ID + slugified name |

URL pattern: `/g/{gizmo_id}-{slug}`

---

## GPT Store

### Categories

Top Picks, Writing, Productivity, Research & Analysis, Education, Lifestyle, DALL-E

### GPT Card Data

| Field | Description |
|-------|-------------|
| Name | GPT title |
| Author | Creator (verified badge possible) |
| Rating | Star rating |
| Description | Short description |
| Rank | Category ranking (e.g., "#4 in Productivity") |
| Conversations | Usage count (e.g., "14M+") |

---

## GPT Capabilities

| Capability | Description |
|------------|-------------|
| DALL-E Images | Image generation |
| Code Interpreter & Data Analysis | Python execution |
| Web Search | Internet search |
| Actions | External API calls |

---

## GPT-Specific Memory

Memories can be scoped to specific GPTs:

```
/backend-api/memories?gizmo_id=g-h8l4uLHFQ&exclusive_to_gizmo=false
```

- `exclusive_to_gizmo=true`: Only this GPT's memories
- `exclusive_to_gizmo=false`: All memories (global + GPT)

---

## Conversation Flow

When starting a GPT conversation:

1. Load GPT config: `GET /backend-api/gizmos/{id}`
2. Load GPT about: `GET /backend-api/gizmos/{id}/about`
3. Load GPT memories: `GET /backend-api/memories?gizmo_id={id}`
4. Initialize conversation with GPT context

---

## System Hints

GPT instructions delivered via:

| Mode | Purpose |
|------|---------|
| `basic` | Standard system prompts |
| `connectors` | Connector-specific prompts |

---

## Sidebar Pagination

Uses cursor-based pagination with Base64-encoded cursor containing:
- RID (Record ID)
- RT (Record Type)
- TRC (Total Record Count)
- ISV (Index Schema Version)

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#gptsgizmos) for complete endpoint list.
