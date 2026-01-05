# Conversation Modes & Connectors

Specialized modes and third-party integrations.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Mode switching via menu | Single "+" menu for all modes | Discovery may be unclear |
| Connectors as toggles | OAuth per-session toggles | Setup friction |
| Mode-specific UI hints | Different greetings/placeholders | Mode detection logic |

---

## Available Modes

| Mode | Badge | Greeting | Globe |
|------|-------|----------|-------|
| **Agent** | "Agent" | "What can I do for you?" | Yes |
| **Deep Research** | "Research" | "What are you researching?" | Yes |
| **Shopping Research** | "Shopping research" | "Good to see you, {name}" | No |

All accessed via "+" menu in input area.

---

## Agent Mode

**Purpose**: Autonomous task execution

| Element | Value |
|---------|-------|
| Header | "ChatGPT" (no model version) |
| Input placeholder | "Describe a task" |
| Connectors | Web search, GitHub, Box, etc. |

Badge: "Agent, click to remove"

---

## Deep Research Mode

**Purpose**: Detailed report generation

| Element | Value |
|---------|-------|
| Header | Model selector visible |
| Input placeholder | "Get a detailed report" |
| Connectors | Web search control |

Multi-source synthesis, longer responses.

---

## Shopping Research Mode

**Purpose**: Product research and comparisons

| Element | Value |
|---------|-------|
| Header | Model selector visible |
| Input placeholder | "Ask anything" |
| Connectors | None visible |

---

## Connectors (AIP System)

### Available Connectors

| Connector | Type | Status |
|-----------|------|--------|
| Web search | Built-in | Toggle (default ON) |
| GitHub | OAuth | Toggle (requires install) |
| Box | OAuth | Connect |
| Dropbox | OAuth | Connect |
| Gmail | OAuth | Connect |
| Google Calendar | OAuth | Connect |

### Connector ID Format

```
connector_{32-char-hex}
```

### OAuth Flow

1. User clicks "Connect" → Modal opens
2. Modal shows privacy policy, data control info
3. User clicks "Continue to {Service}"
4. OAuth redirect → grant permissions
5. Connector enabled in globe dropdown

### Privacy Model

- Data accessed may provide relevant info
- No training on connector data (unless feedback)
- Delete conversations to delete connector data

---

## URL Parameters

Mode activation via URL:

```
?system_hints=agent
&system-hint-type=agent
```

Settings redirect:
```
/#settings/Connectors?add-connector-link=true&connector=connector_{id}
```

---

## Mode Comparison

| Aspect | Agent | Deep Research | Shopping |
|--------|-------|---------------|----------|
| Model selector | No | Yes | Yes |
| Globe dropdown | Yes | Yes | No |
| Connectors | Yes | Web only | No |

---

## API Reference

See [API-REFERENCE.md](../API-REFERENCE.md#connectors) for connector endpoints.
