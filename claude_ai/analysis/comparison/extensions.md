# Extension Ecosystem Comparison: ChatGPT vs Claude.ai

## Summary

| Aspect | ChatGPT | Claude.ai | Winner |
|--------|---------|-----------|--------|
| **Total integrations** | ~40+ connectors | 52 extensions + 5 sync | Claude.ai |
| **Protocol** | Proprietary | MCP (open) | Claude.ai |
| **Desktop control** | None native | Windows-MCP, chrome-control | Claude.ai |
| **Enterprise connectors** | Salesforce, Snowflake, etc. | Limited | ChatGPT |
| **Marketplace maturity** | GPT Store (older) | Directory (newer) | ChatGPT |
| **Developer tooling** | Custom GPTs | MCP servers | Different models |

---

## Extension Architecture

### ChatGPT: Connectors (AIP System)

**Model**: OAuth-based cloud integrations

```
┌─────────────┐     OAuth      ┌─────────────┐
│   ChatGPT   │ ◄────────────► │  Connector  │
│  (Server)   │                │  (GitHub,   │
│             │                │   Box, etc) │
└─────────────┘                └─────────────┘
```

**API Endpoints**:
```
/backend-api/aip/connectors/list_accessible
/backend-api/aip/connectors/{id}
/backend-api/aip/connectors/{id}/logo
/backend-api/aip/connectors/{id}/mfa_requirement
/backend-api/aip/connectors/{id}/tos
```

**ID Format**: `connector_{32-char-hex}`

### Claude.ai: MCP Extensions

**Model**: Local MCP servers + OAuth sync

```
┌─────────────┐     MCP/stdio  ┌─────────────┐
│  Claude.ai  │ ◄────────────► │  Extension  │
│  (Client)   │                │  (Local)    │
└─────────────┘                └─────────────┘
       │
       │  OAuth (Sync only)
       ▼
┌─────────────────┐
│  Google/GitHub  │
└─────────────────┘
```

**API Endpoints**:
```
/api/dxt/extensions (190KB payload)
/api/skills/list-skills
/api/mcp/v2/bootstrap (SSE)
```

**ID Format**: `ant.dir.gh.{author}.{extension}`

---

## Connector/Extension Inventory

### ChatGPT Connectors (Captured)

| Category | Count | Examples |
|----------|-------|----------|
| **Developer** | ~10 | GitHub, Vercel, Netlify, Sentry, Hugging Face |
| **Enterprise** | ~10 | Salesforce, Snowflake, Databricks, NetSuite |
| **Productivity** | ~10 | Notion, Asana, ClickUp, Atlassian, monday.com |
| **Finance** | ~5 | Stripe, PayPal, Square, Ramp, Plaid |
| **Research** | ~3 | PubMed, Scholar Gateway, Synapse.org |
| **Automation** | ~3 | Zapier, Workato, n8n |

**Built-in toggles** (per-session):
- Web search
- GitHub (if connected)
- Google Drive, Gmail, Google Calendar (connect)
- Box, Dropbox, OneDrive (connect)

### Claude.ai Extensions (Captured)

**First-Party (Anthropic)** - 8 extensions, 444K downloads:

| Extension | Downloads | Tools | Category |
|-----------|-----------|-------|----------|
| Filesystem | 226,903 | 11 | System |
| chrome-control | 105,192 | 10 | Browser |
| Notes | 53,069 | 4 | Productivity |
| iMessage | 28,514 | 4 | Communication |
| Spotify | 16,435 | 16 | Media |
| Excel | 5,680 | 11 | Office |
| Word | 4,466 | 9 | Office |
| PowerPoint | 3,781 | 11 | Office |

**Top Third-Party** - 44 extensions, 1.1M downloads:

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

**Sync Integrations** (OAuth):
- Google Drive (with indexing)
- Gmail
- Google Calendar
- GitHub

**Note**: Both platforms offer similar Google Workspace integrations (Drive, Gmail, Calendar). The integration depth and indexing behavior may differ, but neither is "more native" to Google services.

---

## Feature Comparison

### Computer Use Capabilities

| Capability | ChatGPT | Claude.ai |
|------------|---------|-----------|
| **Desktop control** | None | Windows-MCP (3rd party), chrome-control (1st party) |
| **Browser automation** | None | chrome-control (105K downloads) |
| **File system access** | None | Filesystem (227K downloads) |
| **Office automation** | None | Excel, Word, PowerPoint |
| **Screenshot capture** | None | kapture extension |

**Key Insight**: Claude.ai has full computer-use capability via extensions. ChatGPT has none.

### Enterprise Integration

| Capability | ChatGPT | Claude.ai |
|------------|---------|-----------|
| **CRM** | Salesforce | None |
| **Data warehouse** | Snowflake, Databricks | None |
| **ERP** | NetSuite | None |
| **BI tools** | None | Tableau |
| **Design** | None | Figma |

**Key Insight**: ChatGPT targets enterprise SaaS. Claude.ai targets desktop power users.

### Developer Tools

| Capability | ChatGPT | Claude.ai |
|------------|---------|-----------|
| **Code hosting** | GitHub | GitHub |
| **Deployment** | Vercel, Netlify | None |
| **Monitoring** | Sentry | None |
| **PDF manipulation** | None | pdf-toolkit |
| **Local development** | None | Filesystem, desktop-commander |

---

## Technical Differences

### Protocol

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| **Standard** | Proprietary | MCP (Model Context Protocol) |
| **Transport** | HTTPS (OAuth) | stdio/SSE |
| **Location** | Cloud-to-cloud | Local machine |
| **Latency** | Network-bound | Low (local) |
| **Security model** | OAuth scopes | Local permissions |

### Manifest Schema

**ChatGPT Connector** (inferred from APIs):
- Connector ID
- Logo URL
- MFA requirements
- Terms of Service
- OAuth configuration

**Claude.ai Extension**:
```json
{
  "id": "ant.dir.gh.author.extension",
  "download_count": 12500,
  "signature_info": { "verified": true },
  "manifest": {
    "name": "Extension Name",
    "version": "1.2.0",
    "author": { "name": "..." },
    "tools": [
      { "name": "tool_name", "input_schema": {...} }
    ],
    "server": { "command": "npx", "args": [...] }
  }
}
```

---

## Market Dynamics

### Download Distribution

**Claude.ai Extension Downloads**:
```
Windows-MCP:     737,689  (46% of third-party)
Rest of field:   850,261  (44 extensions)
Average (excl.): ~19,324
```

**Power law**: Single extension dominates the ecosystem.

### Platform Coverage

| Platform | ChatGPT | Claude.ai |
|----------|---------|-----------|
| **Windows** | Limited | Windows-MCP (737K) |
| **macOS** | Limited | chrome-control, Control your Mac |
| **Linux** | Limited | Filesystem, MCP servers |
| **Web apps** | Enterprise connectors | Limited |

---

## Strategic Observations

### ChatGPT Strategy

1. **Enterprise-first**: Salesforce, Snowflake, Databricks integrations
2. **Cloud-native**: All connectors are SaaS-to-SaaS
3. **Controlled ecosystem**: Connectors are OpenAI-managed
4. **GPT Store**: Custom GPTs as primary extension model

### Claude.ai Strategy

1. **Desktop-first**: Filesystem, Office apps, browser control
2. **Open protocol**: MCP enables community development
3. **Computer use focus**: Full agentic desktop control
4. **Power users**: Technical users with local tool needs

### Gap Analysis

**ChatGPT should add**:
- Desktop control (computer use)
- Local file access
- MCP or equivalent open protocol

**Claude.ai should add**:
- Enterprise SaaS connectors
- More OAuth integrations
- Better connector discovery UI

---

## Sources

### ChatGPT

- deep-dive-modes.md (connector APIs)
- deep-dive-settings.md (Apps tab)
- Network captures: `/backend-api/aip/connectors/*`

### Claude.ai

- product-analysis.md (extension inventory)
- Network captures: `/api/dxt/extensions`
- Extension manifest schemas
