# Styles & Personalization

## Overview

Claude.ai provides response style customization through style presets, allowing users to adjust how Claude responds.

---

## Style Presets

5 default styles available:

| Style | Purpose | Default |
|-------|---------|---------|
| **Normal** | Balanced conversation style | Yes |
| **Learning** | Educational focus, more explanation | Yes |
| **Concise** | Brief, to-the-point responses | Yes |
| **Explanatory** | Detailed, thorough explanations | Yes |
| **Formal** | Professional, business tone | Yes |

### Custom Styles

Users can create custom styles:
- `is_default: true` for system presets
- `is_default: false` for user-created

---

## Feature Flags & Codenames

Observed in conversation settings and Statsig:

| Codename | Meaning | Status |
|----------|---------|--------|
| `paprika_mode` | Extended thinking | Active ("extended") |
| `saffron` | Unknown | Flag exists |
| `turmeric` | Unknown | Flag exists |
| `monkeys_in_a_barrel` | Unknown | Flag exists |
| `bananagrams` | Unknown | Flag exists |
| `sourdough` | Unknown | Flag exists |
| `foccacia` | Unknown | Flag exists |

**Pattern**: Food/spice themed codenames.

---

## In-App Messaging (Experiences)

### Placements

| Placement | Purpose | Rate Limited |
|-----------|---------|--------------|
| `home-nudge` | Home page nudge | Yes |
| `spotlight` | Featured promotion | Yes |
| `home-banner` | Home page banner | Yes |

### Active Experiences

- `claude-code-seat-upgrade-nudge` - Upsell for Claude Code seats

**Schema**: Rate limits with `remaining` and `reset_at` fields per placement.

---

## Subscription & Billing

### Observed Tiers

| Tier | Mechanism |
|------|-----------|
| Free | Usage limited |
| Pro | Stripe subscription |
| Prepaid | Credit-based |

### Usage Windows

From `message_limit` SSE event:
- 5-hour usage window
- 7-day usage window
- `remaining` and `utilization` metrics

```json
{
  "type": "message_limit",
  "message_limit": {
    "type": "within_limit",
    "windows": {
      "5h": { "utilization": 0.04 },
      "7d": { "utilization": 0.09 }
    }
  }
}
```

---

## Input UI: Attachment Menu

The "+" button reveals input extensions:

| Option | Function | Backend |
|--------|----------|---------|
| **Add files or photos** | Upload attachments | Wiggle API |
| **Take a screenshot** | Capture screen | Browser API |
| **Add to project** | Link to project | Projects API |
| **Add from GitHub** | Import code | GitHub OAuth |
| **Research** | Deep research mode | Unknown |
| **Web search** | Enable search | Search API |
| **Use style** | Apply response style | Styles API |
| **Add connectors** | Third-party integrations | Connectors |

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/style-presets` | List style presets |
| `/feature_settings` | Feature flags |
| `/experiences` | In-app messaging |
| `/payment_method` | Payment info |
| `/prepaid/credits` | Credit balance |
