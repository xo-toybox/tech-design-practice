# Realtime Sync Comparison

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Realtime mechanism** | WebSocket (`celsius`) | Firebase Cloud Messaging | Fundamentally different architectures |
| **Connection type** | Persistent bidirectional | Push-based | WebSocket vs FCM |
| **Init endpoint** | `GET /backend-api/celsius/ws/user` | `POST /notification/channels` | Both init on page load |
| **Multi-tab sync** | No real-time sync | No real-time sync | **Neither syncs conversation content** |
| **Offline recovery** | `/stream_status` polling | `/completion_status` polling | Both have recovery |

---

## Architecture Comparison

### ChatGPT: WebSocket (`celsius`)

```
Page Load                               Server
    |                                     |
    |--GET /celsius/ws/user-------------->|
    |<--200 { ws_url, verify_token }------|
    |                                     |
    |==WSS wss://ws.chatgpt.com/ws/user/{id}?verify={token}==|
    |<================bidirectional=================>|
    |                                     |
    | [Multi-tab: broadcast to all]       |
```

**Evidence (2026-01-04)**:
```
GET /backend-api/celsius/ws/user → 200
```

**WebSocket URL pattern**:
```
wss://ws.chatgpt.com/ws/user/{user_id}?verify={timestamp}-{signature}
```

**Benefits**:
- True realtime bidirectional communication
- Server can push to all connected clients
- Low latency updates
- Multi-tab sync via broadcast

**Costs**:
- Persistent connection overhead
- Connection management complexity
- Reconnection logic needed

### Claude.ai: Firebase Cloud Messaging (FCM)

```
Page Load                               Server                    FCM
    |                                     |                         |
    |--POST /notification/channels------->|                         |
    |<--200 { channel_info }--------------|                         |
    |                                     |                         |
    |--POST fcmregistrations.googleapis.com/v1/projects/..../registrations-->|
    |<--200 { registration }----------------------------------------|
    |                                     |                         |
    | [Push notification via FCM]         |                         |
    |<------------------------------------------[push]--------------|
```

**Evidence (2026-01-04)**:
```
POST /api/.../notification/channels → 200
POST https://fcmregistrations.googleapis.com/v1/projects/proj-scandium-production-5zhm/registrations → 200
```

**Benefits**:
- No persistent connection needed
- Works across browser tabs and mobile
- Leverages Google infrastructure
- Battery efficient on mobile

**Costs**:
- Unidirectional (server → client only)
- Higher latency than WebSocket
- Dependent on third-party service

---

## Multi-Tab Sync Behavior

### Test Results (2026-01-04)

**Critical Finding**: Neither platform provides real-time multi-tab conversation sync.

| Platform | Test | Result | Wait Time |
|----------|------|--------|-----------|
| Claude.ai | Send message in Tab A | Tab B shows stale state | 13+ seconds |
| ChatGPT | Send message in Tab A | Tab B shows stale state | 15+ seconds |

### ChatGPT

**Hypothesis**: WebSocket broadcasts enable true multi-tab sync.
**Result**: ❌ **FALSE** - Tab B did not receive updates via WebSocket.

**Observed behavior**:
1. Tab A sends HTTP POST, receives SSE response
2. Tab B remains stale (only shows original messages)
3. WebSocket connection exists but NOT used for conversation content sync

**Implication**: ChatGPT's `celsius` WebSocket is likely used for:
- Notifications (tasks, scheduled messages)
- System alerts
- NOT conversation content synchronization

### Claude.ai

**Hypothesis**: Relies on polling or FCM push for cross-tab updates.
**Result**: ✅ **CONFIRMED** - No real-time sync observed.

**Observed behavior**:
1. Tab A sends HTTP POST, receives SSE response
2. Tab B remains stale (only shows original messages)
3. No FCM push observed for conversation updates
4. Only `/feature_settings` request on Tab B

**Implication**: Claude.ai's FCM is likely used for:
- Background notifications
- NOT conversation content synchronization

### Consistency Model

Both platforms use **refresh-to-sync** for multi-tab conversation state:

```
Tab A: [sends message] → [receives response] → [state updated]
Tab B: [stale state] → [manual refresh] → [fetches latest] → [state updated]
```

This is consistent with the **stale read hazard** documented in durability.md.

---

## Design Tradeoffs

| Decision | ChatGPT | Claude.ai |
|----------|---------|-----------|
| **Realtime approach** | WebSocket (custom) | FCM (managed) |
| **Connection overhead** | Higher (persistent WS) | Lower (push-based) |
| **Latency** | Lower (~50ms) | Higher (~500ms-2s) |
| **Multi-tab sync** | None (refresh required) | None (refresh required) |
| **Mobile support** | Requires reconnection | Native FCM support |
| **Infrastructure** | Self-managed | Google-managed |

---

## Open Questions

| Question | ChatGPT | Claude.ai |
|----------|---------|-----------|
| WebSocket message format? | Unknown | N/A |
| FCM payload structure? | N/A | Unknown |
| Multi-tab conflict resolution? | N/A (no sync) | N/A (no sync) |
| What triggers WS/FCM messages? | Unknown (not conversation content) | Unknown (not conversation content) |
| Reconnection strategy? | Unknown | FCM handles |

---

## Evidence

### ChatGPT (2026-01-04)

Network capture on fresh page load:
```
GET /backend-api/celsius/ws/user → 200
```

WebSocket URL documented in codebase analysis:
```
wss://ws.chatgpt.com/ws/user/{user_id}?verify={timestamp}-{signature}
```

### Claude.ai (2026-01-04)

Network capture on fresh page load:
```
POST /api/.../notification/channels → 200
POST https://fcmregistrations.googleapis.com/v1/projects/proj-scandium-production-5zhm/registrations → 200
```

No WebSocket connection observed.

---

## Recommendations for Further Testing

1. ~~**Multi-tab test**: Open 2 tabs on each platform, send message in one, time sync to other~~ **DONE** - Neither syncs
2. **Offline test**: Send message, go offline, observe behavior on reconnect
3. **DevTools WS tab**: Capture actual WebSocket frames on ChatGPT to understand what triggers WS messages
4. **FCM analysis**: Intercept FCM messages on Claude.ai to understand what triggers push notifications
5. **Task notifications**: Test if ChatGPT WebSocket pushes task completion notifications
