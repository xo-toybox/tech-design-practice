# Memories & Personalization

Persistent context and customized responses based on user preferences.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Auto memory extraction | Model identifies facts from conversations | May capture wrong info |
| Four memory types | Separate toggles (Saved, Atlas, Chat, Records) | User confusion |
| Third-party sharing | Memories shared with Bing for search | Privacy concern |
| Bounded personality | Traits as Default/More/Less | Limited expressiveness |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMORIES & PERSONALIZATION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PERSONALIZATION LAYER                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │ Style/Tone  │  │   Traits    │  │ Custom Instructions │  │  │
│  │  │  (Nerdy,    │  │ (Warm,      │  │  (User-defined      │  │  │
│  │  │  Formal...) │  │  Emoji...)  │  │   preferences)      │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      MEMORY LAYER                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │   Saved     │  │  Browser    │  │    Chat History     │  │  │
│  │  │  Memories   │  │  (Atlas)    │  │    Reference        │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     CONTEXT INJECTION                         │  │
│  │  Memories + Personalization → Model System Prompt             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Memory Types

### 1. Saved Memories

User-editable memories auto-extracted from conversations.

- Search and filter
- Edit/delete individual entries
- "Manage" in settings

### 2. Browser Memories (Atlas)

From ChatGPT Atlas browser extension.

- Captures browsing context
- Managed in Atlas extension

### 3. Chat History Reference

Implicit context from past conversations.

- No explicit entries
- Toggle on/off

### 4. Record History

Voice recording transcripts and notes.

- Meeting notes
- Toggle on/off

---

## Memory Toggle Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Reference saved memories | Save and use memories | ON |
| Reference browser memories | Key details from Atlas | ON |
| Reference chat history | Previous conversations | ON |
| Reference record history | Recording transcripts | ON |

---

## Personalization Settings

### Base Style and Tone

Presets: Nerdy, Formal, Friendly, etc.

### Characteristics

| Trait | Options |
|-------|---------|
| Warm | Default / More / Less |
| Enthusiastic | Default / More / Less |
| Headers & Lists | Default / More / Less |
| Emoji | Default / More / Less |

### Custom Instructions

Free-form text for behavior, style, and tone preferences.

### About You

| Field | Purpose |
|-------|---------|
| Nickname | What ChatGPT calls you |
| Occupation | Professional context |
| More about you | Detailed background |

---

## GPT-Specific Memories

Memories can be scoped to specific GPTs:

```
/backend-api/memories?gizmo_id=g-xxx&exclusive_to_gizmo=true
```

- `exclusive_to_gizmo=true`: Only this GPT
- `exclusive_to_gizmo=false`: Global + GPT

---

## Privacy

Memories may be shared with Bing for personalized search. Toggle available to disable.

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#memories) for complete endpoint list.
