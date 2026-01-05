# Memory & Personalization

## Overview

Claude.ai has a two-layer memory system:
1. **Centralized personal memory** - Auto-generated from all conversations, regenerated nightly
2. **Project-specific memory** - Separate context per project

---

## Memory Structure

The centralized memory is organized into three sections:

| Section | Purpose | Example |
|---------|---------|---------|
| **Work context** | Professional role, team, tech stack | "Senior AI engineer at large enterprise, leading 3-person team..." |
| **Personal context** | Interests, hobbies, thinking style | "Broad intellectual interests spanning cinema, coffee, board games..." |
| **Top of mind** | Current projects/focus areas | "Exploring Claude tooling ecosystem, working on PR review agents..." |

### Key Characteristics

- **Regenerated nightly** - Server/model decides what to remember
- **Automatic extraction** - No manual memory saving required
- **Project separation** - "does not include projects, which have their own specific memory"

---

## Settings

Located in **Settings > Capabilities > Memory**:

| Setting | Description | Default |
|---------|-------------|---------|
| **Search and reference chats** | Allow Claude to search for relevant details in past chats | ON |
| **Generate memory from chat history** | Allow Claude to remember relevant context from your chats. Controls memory for both chats and projects. | ON |

### Related Settings (Privacy)

| Setting | Description | Location |
|---------|-------------|----------|
| **Memory preferences** | Manage memory | Settings > Privacy |
| **Personal preferences** | What Claude should consider in responses | Settings > General |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/organizations/{org}/memory` | GET | Fetch user's memory summary |

### Modal URL Pattern

```
/settings/capabilities?modal=memory
```

---

## Personalization Layers

| Layer | Scope | Management |
|-------|-------|------------|
| **Centralized memory** | All conversations | Auto-generated, viewable in Settings > Capabilities |
| **Personal preferences** | All conversations | Text field in Settings > General |
| **Project memory** | Per-project | Project-specific, separate from centralized |
| **Style presets** | Per-conversation | Normal, Learning, Concise, Explanatory, Formal |

---

## Comparison with ChatGPT

| Aspect | Claude.ai | ChatGPT |
|--------|-----------|---------|
| Memory generation | Nightly regeneration (server-decided) | Real-time extraction |
| Memory structure | 3 sections (Work, Personal, Top of mind) | Flat list of memories |
| Project scoping | Separate project memory | `exclusive_to_gizmo` flag |
| Third-party sharing | Not observed | Bing toggle |
| Browser extension | No | Atlas extension |
| Voice memories | No | Yes (Record History) |

---

## Evidence

### Screenshot: Memory Modal (ss_7748ztebp)

**Manage memory** dialog showing:
- Work context section
- Personal context section
- Top of mind section
- "This summary is regenerated each night and does not include projects"

### Network Capture (2026-01-04)

```
GET /api/organizations/{org}/memory -> 200
```

---

## Open Questions

1. What triggers memory regeneration? (Time-based? Conversation threshold?)
2. Can users edit/delete specific memory sections?
3. How is project memory structured? (Same 3-section format?)
4. Memory injection timing during conversations?
