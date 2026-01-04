# Claude.ai Analysis

Technical analysis of Claude.ai architecture and features (2026-01-04).

---

## Quick Navigation

| Document | Purpose |
|----------|---------|
| [API-REFERENCE.md](API-REFERENCE.md) | Complete endpoint catalog |

### Features

| Feature | Document |
|---------|----------|
| Conversations (streaming, durability) | [features/conversations.md](features/conversations.md) |
| Extensions (MCP, DXT, OAuth) | [features/extensions.md](features/extensions.md) |
| Styles & Personalization | [features/styles.md](features/styles.md) |
| Projects | [features/projects.md](features/projects.md) |
| Syncing (Google integrations) | [features/syncing.md](features/syncing.md) |

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
+-------------------------------------------------------------------------+
|                    INFRASTRUCTURE SERVICES                               |
|  Cloudflare (CDN) | GCP L7 LB | Envoy (Service Mesh)                    |
|  Honeycomb (Tracing) | Statsig (Flags) | Segment (Analytics)            |
+-------------------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
|                      FEATURE SERVICES                                    |
|  Chat | Projects | Sync | Billing | Skills/Extensions                   |
+-------------------------------------------------------------------------+
```

---

## Key Patterns

1. **Eventually consistent reads** - `consistency=eventual` on all GETs, ~2s replication lag
2. **Message tree structure** - `parent_uuid` linking enables branching/editing
3. **Three communication channels** - REST (CRUD), SSE (streaming), FCM (push)
4. **MCP protocol for extensions** - Open standard for desktop tool integrations

---

## ID Formats

| Entity | Format |
|--------|--------|
| Conversation | UUIDv7 (019xxxxx-xxxx-7xxx-...) |
| Message | UUIDv7 |
| Project | UUIDv7 |
| Organization | UUIDv7 |
| Extension | `ant.dir.gh.{author}.{name}` |

---

## Evidence Sources

All findings based on:
- Chrome DevTools network captures
- API response inspection
- UI interaction observation

Captured: 2026-01-04
