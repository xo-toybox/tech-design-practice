# Projects

## Overview

Projects provide a container for organizing conversations, files, and artifacts around a specific context or goal.

---

## Schema

```json
{
  "uuid": "019xxxxx-xxxx-7xxx-...",
  "name": "Project Name",
  "description": "Project description",
  "is_private": true,
  "is_harmony_project": false,
  "creator": {
    "uuid": "...",
    "display_name": "User Name"
  },
  "created_at": "2026-01-04T00:00:00Z",
  "updated_at": "2026-01-04T00:00:00Z"
}
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Privacy** | `is_private` controls visibility |
| **Collaboration** | Team access via `/permissions` and `/accounts` |
| **Artifacts** | Published artifacts linked to projects |
| **Conversations** | Conversations can be linked via `project_uuid` |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/projects` | GET | List projects |
| `/projects` | POST | Create project |
| `/projects/{id}` | GET | Get project details |
| `/projects/{id}/permissions` | GET | Get permissions |
| `/projects/{id}/accounts` | GET | Get team access |
| `/published_artifacts` | GET | List artifacts |
| `/artifacts/{id}/versions` | GET | Artifact versions |

---

## Artifacts

### Versioning

Artifacts support version history:
- Endpoint: `/artifacts/{uuid}/versions?source=w`
- Called twice: initial load + post-completion refresh
- Supports iteration/editing workflow

### Storage

| System | Endpoint | Purpose |
|--------|----------|---------|
| **Wiggle** | `/wiggle/list-files` | User uploads (per-conversation) |
| **Artifacts** | `/artifacts/{id}/versions` | Claude-generated content |

---

## Unknowns

- Permission model granularity (viewer, editor, owner?)
- Real-time collaboration support?
- Artifact diff storage (snapshots vs deltas?)

See [backlog/explorations.md](../backlog/explorations.md) for planned investigations.
