# {Chatbot} Communication Patterns

## Pattern Overview

| Pattern | Use Case | Direction | Connection |
|---------|----------|-----------|------------|
| REST | | Request-Response | Per-request |
| SSE | | Server → Client | Long-lived |
| WebSocket | | Bidirectional | Persistent |
| FCM/Push | | Server → Device | Out-of-band |

---

## User State Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│  User Active (foreground)                               │
│  └─► [Which pattern?]                                   │
│                                                         │
│  User Inactive (backgrounded)                           │
│  └─► [Which pattern?]                                   │
│                                                         │
│  User Returns                                           │
│  └─► [Which pattern?]                                   │
└─────────────────────────────────────────────────────────┘
```

---

## REST API

### Base Pattern
```
[URL structure, e.g., /api/organizations/{uuid}/...]
```

### Endpoint Categories

| Category | Pattern | Purpose |
|----------|---------|---------|
| | | |

### Latency Profile

| Category | Latency | Examples |
|----------|---------|----------|
| Fast (<150ms) | | |
| Medium (150-300ms) | | |
| Slow (>300ms) | | |

### Authentication
```
[Headers observed]
```

---

## Real-time Streaming

### Protocol Choice
- SSE / WebSocket / gRPC-Web:
- Why this choice:

### Implementation
- EventSource vs fetch+ReadableStream:
- Reconnection handling:

### Event Types

| Event | Purpose | Key Fields |
|-------|---------|------------|
| | | |

### Event Flow
```
[Sequence diagram of events]
```

### Sample Events
```
[Actual event samples]
```

---

## Push Notifications

### Provider
- FCM / APNs / WebPush:
- Evidence:

### Use Cases
- What triggers push:
- User preferences:

### Registration
```json
{
  // Channel registration schema
}
```

---

## Pattern Selection Guide

| Scenario | Pattern | Reason |
|----------|---------|--------|
| | | |

---

## Trade-offs

### REST vs GraphQL
- Choice:
- Trade-off:

### SSE vs WebSocket
- Choice:
- Trade-off:

### Push vs Polling
- Choice:
- Trade-off:

---

## Third-party Domains

| Domain | Purpose | Request Type |
|--------|---------|--------------|
| | | |
