# Tasks & Automations

Scheduled and recurring conversations.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Polling for status | Task status via scheduled GET requests | Not real-time, latency |
| Separate from Codex | Tasks distinct from WHAM coding | Potential confusion |
| User-friendly scheduling | Natural language in prompts | Parsing ambiguity |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TASKS SYSTEM (Automations)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      TASK LIFECYCLE                           │  │
│  │                                                                │  │
│  │  Create → Schedule → Execute → Complete → (Repeat?)           │  │
│  │                                                                │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │  │
│  │  │   Prompt   │ │  Schedule  │ │   Result   │                │  │
│  │  │  (input)   │ │ (cron/one) │ │  (output)  │                │  │
│  │  └────────────┘ └────────────┘ └────────────┘                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   AUTOMATIONS API                             │  │
│  │  /backend-api/automations       (CRUD)                       │  │
│  │  /backend-api/automations/{id}/conversations (runs)          │  │
│  │  /backend-api/schedules         (schedule listing)           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Task Types

| Type | Description |
|------|-------------|
| One-time | Single scheduled execution |
| Recurring | Repeating on schedule |
| Triggered | Activated by conditions (planned?) |

---

## Task ID Format

```
sched_{hex}
```

Example: `sched_693f3b7a76e88170`

---

## Task Lifecycle

1. **Create**: POST /automations with prompt + schedule
2. **Enable**: POST /automations/{id}/enable
3. **Execute**: System runs at scheduled time
4. **Complete**: Result stored as conversation
5. **Repeat**: If recurring, re-schedule

---

## Available Tools

Tasks can use tools like:
- Web search
- Code execution
- Connectors (if configured)

Endpoint: `GET /automations/available_tools`

---

## Task Runs

Each execution creates a conversation:

```
GET /automations/{id}/conversations
```

Returns history of all runs with:
- Execution timestamp
- Conversation ID
- Status (success/failure)

---

## Settings Integration

Tasks accessible from Settings → Schedules tab.

Links to dedicated `/schedules` page.

---

## vs Codex/WHAM

| Aspect | Tasks | Codex |
|--------|-------|-------|
| Purpose | Scheduled conversations | Coding projects |
| Execution | Background, scheduled | Interactive IDE |
| Output | Conversation | Code + artifacts |
| URL | `/schedules` | `/codex` |

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#tasksautomations) for complete endpoint list.
