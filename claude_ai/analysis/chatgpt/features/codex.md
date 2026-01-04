# Codex (WHAM)

Autonomous coding agent with sandboxed execution.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Sandboxed execution | Isolated containers per task | Startup latency, resource limits |
| WebSocket terminal | Real-time shell access | Connection management complexity |
| Separate from Tasks | Distinct from Automations | Potential user confusion |
| Template-based | Pre-built sandbox environments | Limited customization |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CODEX (WHAM) SYSTEM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      TASK LAYER                               │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐               │  │
│  │  │   Create   │ │   Turns    │ │  Complete  │               │  │
│  │  │   Task     │ │ (messages) │ │   Task     │               │  │
│  │  └────────────┘ └────────────┘ └────────────┘               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    SANDBOX LAYER                              │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐               │  │
│  │  │  Create    │ │  Execute   │ │   Files    │               │  │
│  │  │ Environment│ │  Commands  │ │ Read/Write │               │  │
│  │  └────────────┘ └────────────┘ └────────────┘               │  │
│  │                       │                                       │  │
│  │                       ▼                                       │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │              TERMINAL (WebSocket)                     │   │  │
│  │  │  wss://.../wham/sandbox/{id}/terminal                │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## URL Structure

| Page | URL |
|------|-----|
| Codex home | `/codex` |
| Task view | `/codex/{task_id}` |

---

## Task Lifecycle

1. **Create task**: POST /wham/tasks
2. **Create environment**: POST /wham/tasks/{id}/environment
3. **Send messages**: POST /wham/tasks/{id}/turns
4. **Agent executes**: Runs commands in sandbox
5. **View results**: GET /wham/tasks/{id}/turns

---

## Sandbox Features

### Templates

Pre-built environments for different languages/frameworks.

```
GET /wham/sandbox/templates
```

### Command Execution

```
POST /wham/sandbox/{id}/exec
```

Execute shell commands in sandbox.

### File Operations

| Endpoint | Purpose |
|----------|---------|
| GET /wham/sandbox/{id}/files | List files |
| PUT /wham/sandbox/{id}/files | Upload file |

### Terminal

WebSocket connection for real-time shell:

```
wss://.../wham/sandbox/{id}/terminal
```

---

## Task ID Format

UUID format (e.g., `019b8680-3afb-731f-88ab-13fba59cab9c`)

---

## Sandbox Status

```
GET /wham/sandbox/{id}/status
```

Returns:
- Running/stopped state
- Resource usage
- Uptime

---

## vs Tasks/Automations

| Aspect | Codex | Tasks |
|--------|-------|-------|
| Purpose | Interactive coding | Scheduled jobs |
| Environment | Sandboxed container | No sandbox |
| Interface | IDE-like | Conversation |
| Execution | Real-time | Background |
| Terminal | WebSocket | None |

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#codexwham) for complete endpoint list.
