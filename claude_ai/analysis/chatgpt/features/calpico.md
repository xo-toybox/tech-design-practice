# Calpico (Group Chat)

Multi-user collaborative rooms with ChatGPT.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Memory isolation | Personal memory never used in groups | Loss of personalization |
| Polling-based sync | GET /messages?after={cursor} | Not true real-time |
| Heartbeat during responses | POST /responding_heartbeat | Extra network traffic |
| Separate custom instructions | Per-room, 1500 char limit | Reconfigure per room |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CALPICO (ROOMS) SYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      ROOM MANAGEMENT                          │  │
│  │  /calpico/chatgpt/rooms/summary     (list rooms)             │  │
│  │  /calpico/chatgpt/rooms             (create room)            │  │
│  │  /calpico/chatgpt/rooms/{id}        (room details)           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      MESSAGING                                │  │
│  │  POST /rooms/{id}/messages          (send message)           │  │
│  │  GET  /rooms/{id}/messages          (poll for updates)       │  │
│  │  POST /rooms/{id}/read              (mark as read)           │  │
│  │  POST /rooms/{id}/responding_heartbeat (AI generating)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## URL Structure

| Type | Pattern |
|------|---------|
| Room | `/gg/{room_id}` |
| Invite | `/gg/v/{invite_code}` |

---

## ID Formats

| Entity | Format |
|--------|--------|
| Room ID | 32-char hex |
| Invite Code | 32-char hex (different) |
| Message ID | 32-char hex |
| Cursor | `{room}~{room}~CalpicoMessage~{msg}` |

---

## Message Flow

1. User types message
2. POST /rooms/{id}/messages
3. POST /rooms/{id}/responding_heartbeat (repeated during AI generation)
4. GET /rooms/{id}/messages?after={cursor} (poll for response)
5. POST /rooms/{id}/read (mark as read)

**Key**: Uses polling, not streaming like regular conversations.

---

## Room Settings

### Custom Instructions

- 1500 character limit
- Per-room (not global)
- Separate from personal ChatGPT

### Auto-Respond

Toggle for automatic ChatGPT responses (default: ON).

---

## Role System

| Role | Capabilities |
|------|--------------|
| admin | Full control, delete room, manage members |
| member | Send messages, view history |

---

## Privacy & Isolation

**Key privacy features**:

1. Personal memory never used in group chats
2. Room instructions don't inherit from personal
3. New members see full chat history

---

## Calpico vs Regular Conversations

| Aspect | Calpico | Regular |
|--------|---------|---------|
| Users | Multi-user | Single |
| Memory | Isolated | Personal |
| Message delivery | Polling | Streaming |
| Custom instructions | Per-room | User-level |
| URL | `/gg/{id}` | `/c/{id}` |
| API base | `/calpico/chatgpt/*` | `/conversation/*` |

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#calpicorooms) for complete endpoint list.
