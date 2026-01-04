# ChatGPT Analysis

Technical analysis of ChatGPT architecture and features (2026-01-04).

---

## Quick Navigation

| Document | Purpose |
|----------|---------|
| [API-REFERENCE.md](API-REFERENCE.md) | Complete endpoint catalog |

### Features

| Feature | Document |
|---------|----------|
| Conversations (streaming, durability) | [features/conversations.md](features/conversations.md) |
| GPTs/Gizmos | [features/gpts.md](features/gpts.md) |
| Memories & Personalization | [features/memories.md](features/memories.md) |
| Tasks/Automations | [features/tasks.md](features/tasks.md) |
| Codex/WHAM | [features/codex.md](features/codex.md) |
| Calpico (Group Chat) | [features/calpico.md](features/calpico.md) |
| Images (DALL-E) | [features/images.md](features/images.md) |
| Modes & Connectors | [features/modes.md](features/modes.md) |
| Settings | [features/settings.md](features/settings.md) |

### Insights

| Topic | Document |
|-------|----------|
| Architectural Patterns | [insights/architectural-patterns.md](insights/architectural-patterns.md) |
| Product Strategy | [insights/product-strategy.md](insights/product-strategy.md) |

### Backlog

| Document | Purpose |
|----------|---------|
| [backlog/explorations.md](backlog/explorations.md) | Research queue |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE SERVICES                               │
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

---

## Key Patterns

1. **Conversation as universal container** - All features route through conversation infrastructure
2. **Sentinel as universal gate** - prepare/finalize wraps every action
3. **Estuary for assets** - HMAC-signed URLs for all file delivery
4. **Server-authoritative durability** - Persist before stream, no data loss

---

## ID Formats

| Entity | Format |
|--------|--------|
| Conversation | UUID |
| File | `file_00000000{16-char-hex}` |
| GPT | `g-{11-char}` or `g-{32-char-hex}` |
| Room | 32-char hex |
| Task | `task_e_{32-char-hex}` |
| Connector | `connector_{32-char-hex}` |

---

## Evidence Sources

All findings based on:
- Chrome DevTools network captures
- API response inspection
- UI interaction observation

Captured: 2026-01-04
