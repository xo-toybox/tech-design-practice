# Extensions: MCP, DXT & OAuth Connectors

## Overview

Claude.ai has three distinct extension systems:

| System | Count | Mechanism | Payload |
|--------|-------|-----------|---------|
| **Web Connectors** | ~40+ | OAuth flows | Dynamic |
| **DXT Extensions** | 52 | MCP protocol | ~190KB |
| **Skills** | 10 | Anthropic-only | ~5KB |

---

## Key Tradeoffs

| Decision | Choice | Cost |
|----------|--------|------|
| Full manifest payload | 190KB on every load | Could lazy-load or paginate |
| MCP open standard | Third-party ecosystem | Less control over quality |
| First-party Mac focus | 8 Mac extensions | Windows gap (3rd-party fills) |
| Signature verification | Security | Unclear review process |

---

## Web Connectors (OAuth)

OAuth-based integrations for cloud services:

| Category | Examples |
|----------|----------|
| **Developer** | Vercel, Netlify, Hugging Face, Sentry, GitHub |
| **Enterprise** | Snowflake, Databricks, NetSuite, Salesforce |
| **Productivity** | Notion, Asana, ClickUp, Atlassian, monday.com |
| **Finance** | Stripe, PayPal, Square, Ramp, Plaid |
| **Research** | PubMed, Scholar Gateway, Synapse.org |
| **Automation** | Zapier, Workato, n8n |

**Sync-enabled connectors** (OAuth with indexing):
- Google Calendar (`/sync/gcal/*`)
- Gmail (`/sync/gmail/*`)
- Google Drive (`/sync/drive/*`)
- GitHub (`/sync/github/*`)

**Sync API pattern**:
```
GET /api/.../sync/{service}/status    → OAuth connection status
GET /api/.../sync/ingestion/{id}/progress → Sync progress (polling)
```

Note: Both Claude.ai and ChatGPT have similar OAuth-based Google integrations. 

---

## DXT Extensions (MCP Protocol)

Desktop tool integrations via Model Context Protocol.

### Distribution

| Category | Count | Downloads | Avg Downloads |
|----------|-------|-----------|---------------|
| **Total** | 52 | 1,587,990 | 30,538 |
| **Anthropic** | 8 | 444,040 | 55,505 |
| **Third-party** | 44 | 1,143,950 | 25,999 |

### First-party Extensions (Anthropic)

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

### Top Third-party Extensions

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

### Extension Schema

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

---

## Windows-MCP Deep Dive

Windows-MCP (by CursorTouch) has 46% of all third-party downloads. It provides computer use capabilities on Windows.

### Tools

| Tool | Function |
|------|----------|
| **Click-Tool** | Click at screen coordinates |
| **Type-Tool** | Type text (with optional clear) |
| **Scroll-Tool** | Vertical/horizontal scroll |
| **Drag-Tool** | Drag from A to B |
| **Move-Tool** | Move mouse pointer |
| **Shortcut-Tool** | Keyboard shortcuts |
| **Wait-Tool** | Pause for duration |
| **State-Tool** | Capture snapshot (apps, elements, screenshot) |
| **App-Tool** | Launch/resize/switch apps |
| **Shell-Tool** | Execute PowerShell |

### Performance

- 0.7-2.5 second latency between actions
- Supports `use_dom=True` for browser content
- Supports `use_vision=True` for screenshots

### Strategic Implications

1. **Platform Gap**: Anthropic builds Mac-first; Windows filled by third-party
2. **Research-to-Product Gap**: Windows-MCP productizes Anthropic's computer use research
3. **Security Questions**: Shell-Tool enables PowerShell (admin access)
4. **Model-Agnostic**: Works with any LLM, not Claude-specific
5. **Ecosystem Distortion**: Remove Windows-MCP and avg downloads drop from 30K to ~17K

---

## Skills System

### Available Skills (10 total, 3 enabled by default)

| Status | Skill | Purpose |
|--------|-------|---------|
| ON | `web-artifacts-builder` | Multi-component HTML artifacts |
| ON | `skill-creator` | Guide for creating skills |
| ON | `mcp-builder` | Build MCP servers |
| OFF | `doc-coauthoring` | Structured documentation |
| OFF | `theme-factory` | Artifact themes |
| OFF | `internal-comms` | Internal communications |
| OFF | `canvas-design` | Canvas design tools |
| OFF | `brand-guidelines` | Brand design |
| OFF | `slack-gif-creator` | GIF creation |
| OFF | `algorithmic-art` | Generative art |

### Skills vs Extensions

| Aspect | Skills | DXT Extensions |
|--------|--------|----------------|
| Provider | Anthropic only | Anthropic + third-party |
| Payload | ~5KB metadata | ~190KB with manifests |
| Marketplace | No | Yes |
| Tool definitions | No | Yes (10-30 per extension) |

---

## API Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/dxt/extensions` | List extensions | 190KB paginated JSON |
| `/skills/list-skills` | List skills | 5KB JSON array |
| `/mcp/v2/bootstrap` | MCP server list | SSE stream |

---

## Ecosystem Observations

1. **Windows-MCP dominance**: Single extension has 46% of third-party downloads
2. **Enterprise interest**: Tableau, Figma, Airwallex building integrations
3. **Power law distribution**: Early movers dominate nascent marketplace
4. **Agentic demand**: Users want Claude to *do things*, not just chat
