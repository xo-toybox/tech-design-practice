# Product Strategy

## Extension Ecosystem Strategy

### Platform Dynamics

| Metric | Value | Implication |
|--------|-------|-------------|
| Total extensions | 52 | Growing marketplace |
| Anthropic extensions | 8 (15%) | Light first-party footprint |
| Third-party extensions | 44 (85%) | Ecosystem-driven growth |
| Windows-MCP dominance | 46% of 3P downloads | Platform gap filled by community |

### Power Law Distribution

Remove Windows-MCP and average extension downloads drop from 30K to ~17K.

Early movers dominate:
1. Windows-MCP: 737K (46%)
2. pdf-toolkit: 69K (4%)
3. context7: 50K (3%)
4. Tableau: 47K (3%)

### Platform Gap Analysis

| Platform | Anthropic | Third-party | Gap |
|----------|-----------|-------------|-----|
| **Mac** | 8 extensions | ~10 | Covered |
| **Windows** | 0 extensions | Windows-MCP (737K) | Massive gap |

**Implication**: Anthropic builds Mac-first. Third-parties fill Windows demand.

---

## Build vs Buy Signals

### Windows-MCP Dependency Risk

- CursorTouch (third-party) owns critical Windows experience
- 737K downloads = significant user dependency
- If CursorTouch abandons, user pain is immediate
- Security exposure (Shell-Tool = PowerShell access)

**Options**:
1. Acquire Windows-MCP / hire CursorTouch
2. Build first-party Windows control
3. Accept dependency (current state)

### Research-to-Product Gap

Windows-MCP productizes Anthropic's "computer use" research for Windows.

| Anthropic | Windows-MCP |
|-----------|-------------|
| Research demos | Consumer product |
| Mac focus | Windows focus |
| Controlled release | Open ecosystem |

---

## Feature Velocity Indicators

### Codename Pattern (Food/Spice Themed)

| Observed | Status |
|----------|--------|
| `paprika_mode` | Active (extended thinking) |
| `saffron`, `turmeric` | Unknown flags |
| `monkeys_in_a_barrel` | Unknown flag |
| `bananagrams`, `sourdough`, `foccacia` | Unknown flags |

### FCM Channels (Unknown Features)

| Channel | Purpose |
|---------|---------|
| `completion` | Response complete |
| `compass` | Unknown |
| `bogosort` | Unknown |
| `tiny_pancakes` | Unknown |

---

## Monetization Signals

### Observed Tiers

| Tier | Mechanism | Evidence |
|------|-----------|----------|
| Free | Usage limits | `message_limit` events |
| Pro | Stripe subscription | `/payment_method` |
| Prepaid | Credits | `/prepaid/credits` |

### Usage Windows

- 5-hour utilization window
- 7-day utilization window
- Real-time tracking in SSE stream

### Upsell Experiences

- `claude-code-seat-upgrade-nudge` - Upsell for Claude Code seats
- Rate-limited placements: `home-nudge`, `spotlight`, `home-banner`

---

## Competitive Positioning vs ChatGPT

### Feature Coverage

| Feature | ChatGPT | Claude.ai | Gap |
|---------|---------|-----------|-----|
| **Web connectors** | ~40+ OAuth | ~40+ OAuth | Parity |
| **Desktop extensions** | GPT Store | 52 MCP | Different model |
| **Protocol** | Proprietary | MCP (open) | Claude more open |
| **Download visibility** | Hidden | Visible | Claude more transparent |
| **Anti-abuse** | Sentinel (prepare/finalize) | Not documented | ChatGPT documented |
| **Group chat** | Calpico (rooms) | Not observed | ChatGPT ahead |
| **Scheduled tasks** | Automations | Not observed | ChatGPT ahead |
| **Image generation** | DALL-E | Not observed | ChatGPT ahead |

### Architectural Differences

| Aspect | ChatGPT | Claude.ai |
|--------|---------|-----------|
| Protocol | HTTP/1.1, HTTP/2 | HTTP/3 (86%) |
| Service mesh | Not observed | Envoy |
| Tracing | Not observed | Honeycomb |
| Consistency | Not documented | Eventually consistent |

---

## Strategic Observations

### 1. Agentic Demand

Windows-MCP downloads (737K) signal: users want Claude to *do things*, not just chat.

### 2. Enterprise Angle

Notable enterprise publishers building integrations:
- Tableau (47K downloads)
- Figma (42K downloads)
- Airwallex
- Snowflake, Databricks (OAuth connectors)

### 3. Developer Experience

MCP is an open standard. Claude.ai is more developer-friendly than ChatGPT's proprietary GPT protocol.

### 4. Consistency Trade-offs

Claude.ai explicitly trades consistency for availability:
- Eventually consistent reads
- ~2s replication lag
- Data loss possible on re-submit

This is a product-level choice, not just infrastructure.
