# claude.ai Product Analysis

## Overview

This document captures product-level insights from the claude.ai analysis - features, ecosystem health, user-facing capabilities, and strategic observations.

---

## Input UI: Attachment Menu

The "+" button in the input area reveals the input extension architecture:

| Option | Function | Backend |
|--------|----------|---------|
| **Add files or photos** | Upload attachments | Wiggle API |
| **Take a screenshot** | Capture screen | Browser API |
| **Add to project** | Link to project | Projects API |
| **Add from GitHub** | Import code | GitHub OAuth |
| **Research** | Deep research mode | Unknown |
| **Web search** | Enable search | Search API |
| **Use style** | Apply response style | Styles API |
| **Add connectors** | Third-party integrations | See [Integration Ecosystem](#integration-ecosystem) |

**Observations**:
- Multiple input modalities (files, screenshots, code, web)
- Project integration for context persistence
- Style presets accessible from input

---

## Integration Ecosystem

The Connectors (`/directory` endpoint) page reveals two distinct integration models:

| Type | Count | Mechanism | Examples |
|------|-------|-----------|----------|
| **Web Connectors** | ~40+ | OAuth flows | Notion, Salesforce, GitHub |
| **Desktop Extensions** | 52 | MCP protocol | Filesystem, Windows-MCP |

### Web Connectors

OAuth-based integrations for cloud services:

| Category | Examples |
|----------|----------|
| **Developer** | Vercel, Netlify, Hugging Face, Sentry, GitHub |
| **Enterprise** | Snowflake, Databricks, NetSuite, Salesforce |
| **Productivity** | Notion, Asana, ClickUp, Atlassian, monday.com |
| **Finance** | Stripe, PayPal, Square, Ramp, Plaid |
| **Research** | PubMed, Scholar Gateway, Synapse.org |
| **Automation** | Zapier, Workato, n8n |

**Observed OAuth flows** (sync-capable):
- Google Calendar, Gmail, Google Drive (with indexing)
- GitHub

### Desktop Extensions (MCP Servers)

Local tool integrations via Model Context Protocol:

| Category | Count | Downloads | Avg Downloads |
|----------|-------|-----------|---------------|
| **Total** | 52 | 1,587,990 | 30,538 |
| **Anthropic** | 8 | 444,040 | 55,505 |
| **Third-party** | 44 | 1,143,950 | 25,999 |

**First-party extensions** (Anthropic):

| Extension | Downloads | Tools | Category |
|-----------|-----------|-------|----------|
| Filesystem | 226,903 | 11 | System |
| chrome-control | 105,192 | 10 | Browser |
| Notes | 53,069 | 4 | Productivity |
| iMessage | 28,514 | 4 | Communication |
| Spotify (AppleScript) | 16,435 | 16 | Media |
| Excel | 5,680 | 11 | Office |
| Word | 4,466 | 9 | Office |
| PowerPoint | 3,781 | 11 | Office |

**Top third-party extensions**:

| Extension | Author | Downloads |
|-----------|--------|-----------|
| Windows-MCP | CursorTouch | 737,689 |
| pdf-toolkit | Mat Silverstein | 68,786 |
| context7 | Upstash | 50,213 |
| Tableau | Tableau | 47,298 |
| Control your Mac | Kenneth Lien | 46,600 |
| Figma | Figma | 42,098 |
| kapture | William Kapke | 24,120 |
| desktop-commander | Desktop Commander Team | 17,370 |

**Notable publishers**: Figma, Tableau, Upstash, Cloudinary, Socket, Airwallex

#### Extension Schema

**DXT Entry Structure**:
```json
{
  "id": "ant.dir.gh.wonderwhy-er.desktopcommandermcp",
  "icon_url": "https://...",
  "download_count": 12500,
  "signature_info": { "verified": true },
  "is_blocklisted": false,
  "is_internal": false,
  "is_allowlisted": true,
  "manifest": {
    "name": "Desktop Commander MCP",
    "version": "1.2.0",
    "author": { "name": "wonderwhy-er" },
    "tools": [
      {
        "name": "execute_command",
        "description": "Execute shell commands",
        "input_schema": { "type": "object", "properties": {...} }
      }
    ],
    "server": { "command": "npx", "args": [...] }
  }
}
```

**Manifest Fields**:
- `tools[]`: Array of 10-30 tool definitions with input schemas
- `server`: Server configuration for MCP connection
- `author`, `version`, `description`, `keywords`
- `compatibility`, `documentation`, `privacy_policies`

**Skill Schema**:
```json
{
  "id": "web-artifacts-builder",
  "name": "web-artifacts-builder",
  "description": "Suite of tools for creating...",
  "enabled": true,
  "creator_type": "anthropic",
  "partition_by": "account",
  "is_public_provisioned": true,
  "updated_at": "2025-12-19T20:16:14.200452Z"
}
```

#### Ecosystem Observations

1. **Windows-MCP dominance**: Single extension has 46% of all third-party downloads
2. **Enterprise interest**: Tableau, Figma, Airwallex building integrations
3. **Developer tools**: pdf-toolkit, context7, desktop-commander popular
4. **Platform parity**: Mac tools (Control your Mac) balancing Windows-MCP

#### Windows-MCP Deep Dive

Windows-MCP (by CursorTouch) provides **computer use capabilities on Windows** - the desktop extension that lets Claude interact with Windows UI natively. It essentially democratizes Anthropic's computer use research for Windows users.

**Tools Exposed**:

| Tool | Function |
|------|----------|
| **Click-Tool** | Click at given screen coordinates |
| **Type-Tool** | Type text into elements (with optional clear-first) |
| **Scroll-Tool** | Vertical/horizontal scroll on windows or regions |
| **Drag-Tool** | Drag from point A to B |
| **Move-Tool** | Move mouse pointer |
| **Shortcut-Tool** | Execute keyboard shortcuts (Ctrl+C, Alt+Tab, etc.) |
| **Wait-Tool** | Pause for specified duration |
| **State-Tool** | Capture combined snapshot: default language, active browser, running apps, interactive/textual/scrollable elements, plus desktop screenshot. Supports `use_dom=True` for browser content extraction and `use_vision=True` for screenshots |
| **App-Tool** | Launch apps from Start menu, resize/move windows, switch between apps |
| **Shell-Tool** | Execute PowerShell commands |

**Technical Notes**:
- Works with any LLM (vision optional via `use_vision` flag)
- 0.7-2.5 second latency between actions (depends on system load and inference speed)
- Combines screen capture, DOM extraction, and input simulation

**Why 46% Market Share**:
- Windows is majority desktop OS (~70% market share)
- Canonical way to get agentic control over Windows machines
- No first-party Anthropic equivalent (unlike Mac which has Anthropic's chrome-control, iMessage, etc.)
- Full computer use capability vs single-purpose tools

**Strategic Implications**:
- **Dependency risk**: Third-party (CursorTouch) owns critical user experience for Windows users
- **First-mover advantage**: Power law distribution indicates nascent marketplace - early movers dominate
- **Agentic demand signal**: Users want Claude to *do things* on their computer, not just chat
- **Enterprise angle**: Windows dominates corporate desktops - this extension enables enterprise automation
- **Build vs buy question**: Should Anthropic acquire or build first-party Windows control?

**Deeper Insights**:

1. **Platform Strategy Gap**: Anthropic builds Mac-first (chrome-control, iMessage, Notes, Spotify via AppleScript). Third-parties fill the Windows gap. The 16x download ratio (737K vs 46K for Mac equivalent) reflects either larger Windows user base or unmet demand.

2. **Research-to-Product Gap**: Anthropic demos "computer use" as research capability. Windows-MCP productizes it for consumers. Shows friction in translating research demos into product features.

3. **Security Model Questions**: Shell-Tool enables PowerShell execution (effectively admin access). Extensions are signature-verified (`signature_info.verified`), but trust model for arbitrary code execution unclear. What's the review process?

4. **Model-Agnostic Architecture**: Windows-MCP explicitly supports "any LLM" with optional vision. It's a portable abstraction layer - could work with GPT-4V, Gemini, etc. This is a platform play, not Claude-specific.

5. **Hybrid Perception Strategy**: State-Tool combines structured data (DOM, app list) with vision (screenshots). The `use_dom` and `use_vision` flags allow trading accuracy vs token cost. Smart architecture for varying model capabilities.

6. **Latency Economics**: At 0.7-2.5s per action, a 10-step workflow takes 7-25 seconds. Humans are faster for simple tasks. Value is in:
   - Automation of repetitive sequences
   - Tasks requiring precision (exact coordinates)
   - Unattended/scheduled operations
   - Complex multi-app workflows

7. **Ecosystem Economics**: Remove Windows-MCP from the marketplace and average extension downloads drop from 30K to ~17K. Single extension distorts the entire distribution.

---

## Skills System

### Available Skills (10 total, 3 enabled)

| Status | Skill | Purpose |
|--------|-------|---------|
| ON | `web-artifacts-builder` | Multi-component HTML artifacts (React, Tailwind, shadcn) |
| ON | `skill-creator` | Guide for creating new skills |
| ON | `mcp-builder` | Build MCP servers |
| OFF | `doc-coauthoring` | Structured documentation workflow |
| OFF | `theme-factory` | Styling artifacts with themes |
| OFF | `internal-comms` | Internal communications |
| OFF | `canvas-design` | Canvas design tools |
| OFF | `brand-guidelines` | Brand design guidelines |
| OFF | `slack-gif-creator` | GIF creation for Slack |
| OFF | `algorithmic-art` | Generative algorithmic art |

**Key Insight**: All skills are Anthropic-provided (no third-party skills marketplace yet).

### Skills vs Extensions

| Aspect | Skills | DXT Extensions |
|--------|--------|----------------|
| Provider | Anthropic only | Anthropic + third-party |
| Payload | ~5KB metadata | ~190KB with full manifests |
| Marketplace | No | Yes |
| Tool definitions | No | Yes (10-30 per extension) |
| User toggle | Per-account | Per-account |

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

**Push notification channels** (FCM-based):
- `completion` - Response complete
- `compass`, `bogosort`, `tiny_pancakes` - Unknown
- `project_sharing` - Collaboration events

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

**Schema**: Experiences have rate limits per placement with `remaining` and `reset_at` fields.

---

## Subscription & Billing

### Observed Tiers

- Free tier (usage limited)
- Pro subscription (Stripe-based)
- Prepaid credits option

### Usage Tracking

From `message_limit` SSE event:
- 5-hour usage window
- 7-day usage window
- `remaining` and `utilization` metrics

---

## Style Presets

5 default styles:
1. **Normal** - Default conversation style
2. **Learning** - Educational focus
3. **Concise** - Brief responses
4. **Explanatory** - Detailed explanations
5. **Formal** - Professional tone

Users can create custom styles.
