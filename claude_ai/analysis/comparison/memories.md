# Memory & Personalization Comparison

## Summary

| Aspect | ChatGPT | Claude.ai | Winner | Notes |
|--------|---------|-----------|--------|-------|
| **Memory structure** | Flat list of memories | 3 sections (Work, Personal, Top of mind) | Claude.ai | More organized |
| **Generation timing** | Real-time extraction | Nightly regeneration | ChatGPT | More immediate |
| **Project scoping** | `exclusive_to_gizmo` flag | Separate project memory | Claude.ai | Cleaner separation |
| **Browser integration** | Atlas extension | None | ChatGPT | External context |
| **Third-party sharing** | Bing toggle | Not observed | Claude.ai | Privacy |
| **Granularity** | Per-trait adjustments | Single instruction field | ChatGPT | Fine-tuning |

---

## Architecture Comparison

### ChatGPT Memory System

```
+------------------+     +------------------+     +------------------+
|  Saved Memories  |     | Browser Memories |     |  Chat History    |
|  (auto-extract)  |     | (Atlas extension)|     |  (implicit)      |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   Memory Injection Layer  |
                    |   exclusive_to_gizmo flag |
                    +---------------------------+
```

### Claude.ai Memory System

```
+----------------------------------------------------------+
|              Centralized Personal Memory                   |
|  +----------------+  +----------------+  +---------------+ |
|  | Work Context   |  | Personal       |  | Top of Mind   | |
|  | (role, team,   |  | Context        |  | (current      | |
|  | tech stack)    |  | (interests,    |  | projects,     | |
|  |                |  | hobbies)       |  | focus)        | |
|  +----------------+  +----------------+  +---------------+ |
|                                                            |
|           Regenerated nightly by server/model              |
+----------------------------------------------------------+
                              |
                              v
+----------------------------------------------------------+
|                   Project-Specific Memory                  |
|            (Separate from centralized memory)              |
+----------------------------------------------------------+
```

---

## Memory Types

### ChatGPT

| Type | Source | Management | API |
|------|--------|------------|-----|
| Saved Memories | Auto-extracted from conversations | Edit/delete in settings | `/backend-api/memories` |
| Browser Memories | Atlas extension | Managed in extension | Unknown |
| Chat History | Implicit from past conversations | Toggle on/off | `/backend-api/conversations` |
| Record History | Voice transcripts | Toggle on/off | Unknown |

### Claude.ai

| Type | Source | Management | API |
|------|--------|------------|-----|
| Centralized Memory | Auto-generated from all chats | View in Settings > Capabilities | `/api/organizations/{org}/memory` |
| Personal Preferences | User-defined in Settings | Edit in Settings > General | Unknown |
| Project Memory | Per-project context | Per-project management | Unknown |
| Style Presets | System defaults + custom | Per-conversation | `/api/.../style-presets` |

---

## Memory Structure Detail

### ChatGPT

Flat list of individual memories:
```json
{
  "memories": [
    { "id": "...", "content": "User prefers Python over JavaScript", "created_at": "..." },
    { "id": "...", "content": "User works at Acme Corp", "created_at": "..." }
  ]
}
```

### Claude.ai

Structured 3-section summary:
```
Work context:
  Senior AI engineer at large enterprise (20,000+ employees)
  leading 3-person team responsible for AI coding agents...

Personal context:
  Broad intellectual interests spanning cinema, specialty coffee,
  board games, cycling, and cooking...

Top of mind:
  Exploring the latest Claude tooling ecosystem, including
  advanced tool use, Agent Skills, and MCP integration...
```

**Key difference**: ChatGPT stores discrete facts; Claude.ai generates narrative summaries.

---

## Generation Timing

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Trigger** | Real-time during conversation | Nightly batch regeneration |
| **User control** | Can manually add/delete | Server-decided content |
| **Latency** | Immediate | Up to 24 hours |
| **Freshness** | Always current | May lag recent conversations |

### Tradeoffs

**ChatGPT (Real-time)**:
- (+) Immediate memory of new facts
- (+) User can manually curate
- (-) May capture noise/transient info
- (-) No semantic consolidation

**Claude.ai (Nightly)**:
- (+) Consolidated, deduplicated summary
- (+) Server filters for relevance
- (-) New info not immediately available
- (-) Less user control over content

---

## Personalization Settings

### ChatGPT

| Setting | Description | Options |
|---------|-------------|---------|
| Base Style | Overall response tone | Nerdy, Formal, Friendly, etc. |
| Traits | Fine-grained adjustments | Warm/Enthusiastic/Headers/Emoji with Default/More/Less |
| Custom Instructions | Free-form text | User-defined |
| About You | Basic profile | Nickname, occupation, background |

### Claude.ai

| Setting | Description | Location |
|---------|-------------|----------|
| Personal Preferences | What Claude should consider | Settings > General |
| Style Presets | Response format | Normal, Learning, Concise, Explanatory, Formal |
| Project Instructions | Per-project context | Project settings |
| Memory Settings | Search/generate toggles | Settings > Capabilities |

---

## Project Scoping

### ChatGPT

Uses `exclusive_to_gizmo` flag:
```json
{
  "memories": [...],
  "exclusive_to_gizmo": "g-abc123"  // Only used with this GPT
}
```

### Claude.ai

Complete separation:
- Centralized memory: "does not include projects, which have their own specific memory"
- Project memory: Isolated per-project context
- No cross-contamination between personal and project memory

---

## Privacy & Third-party

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| External sharing | Bing integration (toggleable) | Not observed |
| Training data | Opt-out available | Opt-out available |
| Memory visibility | Full list viewable | Summary viewable |
| Deletion | Individual memories | Unknown granularity |

---

## Evidence

### ChatGPT
- API: `/backend-api/memories` endpoint documented
- Settings: Personalization UI with trait sliders
- Atlas: Browser extension for external context

### Claude.ai (Captured 2026-01-04)
- API: `GET /api/organizations/{org}/memory` → 200
- Modal: `/settings/capabilities?modal=memory`
- Screenshot: ss_7748ztebp showing 3-section memory structure
- UI: "This summary is regenerated each night"

---

## Coverage Status

| Item | ChatGPT | Claude.ai |
|------|---------|-----------|
| Memory types documented | DONE | DONE |
| API endpoints | DONE | DONE |
| Personalization settings | DONE | DONE |
| Memory structure | DONE | DONE |
| Injection timing | PENDING | PENDING |
