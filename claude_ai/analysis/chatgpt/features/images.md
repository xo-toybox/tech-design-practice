# Images

Image generation integrated with conversation system.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Conversation-based generation | Uses /f/conversation flow | Couples image gen to chat |
| Prompt enhancement | Auto-enhances user prompts | User loses exact control |
| Estuary CDN delivery | HMAC-signed URLs | Complex URL structure |
| Thumbnail + full-size split | Separate requests | Extra requests |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         IMAGES SYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    IMAGES API LAYER                           │  │
│  │  /backend-api/images/bootstrap     (init)                    │  │
│  │  /backend-api/images/styles        (style presets)           │  │
│  │  /backend-api/my/recent/image_gen  (user gallery)            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  GENERATION (via Conversation)                │  │
│  │  POST /f/conversation/prepare                                │  │
│  │  POST /f/conversation (streams image)                        │  │
│  │  → Creates new conversation with image                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    DELIVERY (Estuary CDN)                     │  │
│  │  /backend-api/estuary/content?id={composite_id}&sig={hmac}   │  │
│  │  /backend-api/files/download/file_{id}                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## URL Structure

| Page | URL |
|------|-----|
| Images landing | `/images` |
| Generated image | `/c/{conversation_id}` |

**Key**: Generation creates a new conversation.

---

## Generation Flow

1. User enters prompt in /images
2. POST /f/conversation/prepare
3. POST /f/conversation (streaming)
   - Prompt enhancement applied
   - Image generation triggered
4. Redirect to /c/{new_conversation_id}
5. Image displayed with actions

---

## Style Presets

Styles like Gingerbread, Parisian postcard, Sketch, etc.

Available at: `/backend-api/images/styles`

Style assets on: `persistent.oaistatic.com/images-app/{style}.webp`

---

## File Storage

### File ID Format

```
file_00000000{16-char-hex}
```

### Estuary CDN URL

```
/backend-api/estuary/content?id={composite_id}&sig={hmac}&ts={timestamp}
```

**Composite ID format**:
```
{hash}#file_{id}#thumbnail
```

### URL Parameters

| Param | Purpose |
|-------|---------|
| `id` | Composite file ID |
| `sig` | HMAC signature (64-char hex) |
| `ts` | Timestamp |
| `ma` | Max age (caching) |
| `p` | Permission/policy |

---

## Prompt Enhancement

User prompts are auto-enhanced before generation:

| Input | Enhanced |
|-------|----------|
| "A blue cube" | "Vibrant blue cube on white background" |

Visible in stream as `Image created • {enhanced_prompt}`.

---

## User Gallery

```
GET /backend-api/my/recent/image_gen?limit=25
```

Grid display of thumbnails. Clicking navigates to source conversation.

---

## Parallel Generation

Feature: "Create another image while you wait"

Can queue additional requests while one generates.

---

## Images vs Regular Conversation

| Aspect | Images | Conversation |
|--------|--------|--------------|
| Entry point | `/images` | `/` or `/c/{id}` |
| Generation API | Same `/f/conversation` | Same |
| Result location | New conversation | Same conversation |
| Gallery | `/my/recent/image_gen` | `/conversations` |

**Key insight**: Images is a UI layer on conversation infrastructure.

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#images) for complete endpoint list.
