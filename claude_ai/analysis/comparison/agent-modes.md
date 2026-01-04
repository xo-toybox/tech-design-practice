# Agent Modes Comparison

## Summary

| Aspect | ChatGPT | Claude.ai | Notes |
|--------|---------|-----------|-------|
| **Explicit agent mode** | Yes (toggle) | No | ChatGPT has dedicated agent UI |
| **Browser automation** | Computer Use (API) | Claude in Chrome (Max plan) | Different access patterns |
| **Code execution** | Codex, Canvas | Claude Code (Research preview) | ChatGPT more mature |
| **Scheduled tasks** | Tasks feature | None observed | ChatGPT has background automation |
| **Custom agents** | GPTs (marketplace) | Skills (Preview) | ChatGPT has ecosystem |
| **Extended reasoning** | Selective | Always-on (Opus 4.5) | Claude.ai applies to all prompts |

---

## Architecture Comparison

### ChatGPT: Modular Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ChatGPT Interface                     │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Deep        │ Canvas      │ Codex       │ Tasks         │
│ Research    │ (Documents) │ (Code)      │ (Scheduled)   │
├─────────────┴─────────────┴─────────────┴───────────────┤
│              Agent Mode (autonomous execution)           │
├─────────────────────────────────────────────────────────┤
│              GPTs (custom agents marketplace)            │
├─────────────────────────────────────────────────────────┤
│              Computer Use API (desktop automation)       │
└─────────────────────────────────────────────────────────┘
```

**Key characteristics**:
- Explicit agent mode toggle in UI
- Multiple specialized agent types
- GPTs marketplace for community agents
- Tasks feature for scheduled automation
- Computer Use API for desktop control

### Claude.ai: Capability-Based Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Claude.ai Interface                    │
├─────────────────────────────────────────────────────────┤
│          Extended Thinking (always-on for Opus 4.5)      │
├─────────────┬─────────────┬─────────────────────────────┤
│ Claude Code │ Artifacts   │ Code Execution              │
│ (GitHub)    │ (AI-powered)│ (sandboxed)                 │
├─────────────┴─────────────┴─────────────────────────────┤
│              Connectors (Google integrations)            │
├─────────────────────────────────────────────────────────┤
│              Skills (Preview - custom instructions)      │
├─────────────────────────────────────────────────────────┤
│              Claude in Chrome (browser automation)       │
└─────────────────────────────────────────────────────────┘
```

**Key characteristics**:
- No explicit agent mode toggle
- Capabilities enabled via Settings
- Skills (Preview) for custom workflows
- Claude in Chrome for browser automation (Max plan)
- Extended thinking integrated into model

---

## Feature Deep-Dive

### Browser Automation

| Aspect | ChatGPT Computer Use | Claude in Chrome |
|--------|---------------------|------------------|
| **Access** | API only | Max plan ($100-200/mo) |
| **Interface** | Programmatic | Chrome extension |
| **Control** | Desktop screenshots + mouse/keyboard | Browser tabs + DOM |
| **Safety** | Beta header required | Permission prompts |
| **Status** | Beta | Beta (after 3-month research preview) |

**Evidence (2026-01-04)**:
- Claude in Chrome: Available to Max plan subscribers
- Multi-tab workflows and scheduled tasks added since research preview

### Code Execution

| Aspect | ChatGPT Codex | Claude Code (Web) |
|--------|---------------|-------------------|
| **GitHub integration** | Yes | Yes (GitHub App) |
| **Status** | Production | Research preview |
| **Interface** | Dedicated UI | Sidebar link |
| **Capabilities** | PR creation, code review | Connect repos |

**Evidence (2026-01-04)**:
- Claude Code onboarding at `/code/onboarding`
- Shows GitHub App installation flow
- Repos: anthropic/claude-code, anthropic/claude-code-ide, anthropic/claude-code-cloude

### Custom Agents

| Aspect | ChatGPT GPTs | Claude.ai Skills |
|--------|--------------|------------------|
| **Status** | Production | Preview |
| **Marketplace** | Yes (Explore GPTs) | No |
| **Creation** | GPT Builder | Settings > Capabilities |
| **Sharing** | Public/Private/Link | Unknown |

**Evidence (2026-01-04)**:
- Skills section in Settings > Capabilities
- "Repeatable, customizable instructions that Claude can follow in any chat"
- "No skills added by you yet" - empty state observed

### Scheduled Tasks

| Aspect | ChatGPT Tasks | Claude.ai |
|--------|---------------|-----------|
| **Feature** | Yes | None observed |
| **Scheduling** | Natural language | N/A |
| **Notifications** | WebSocket push | N/A |
| **Use cases** | Daily summaries, reminders | N/A |

**Key difference**: ChatGPT has autonomous background task execution. Claude.ai does not have equivalent feature in web interface.

---

## Capability Settings (Claude.ai)

Observed in Settings > Capabilities:

| Setting | Default | Description |
|---------|---------|-------------|
| **Artifacts** | OFF | Generate code/docs in dedicated window |
| **AI-powered artifacts** | ON | Apps/prototypes using Claude API |
| **Code execution** | ON | Execute code, create files |
| **Network egress** | ON | Install packages/libraries |
| **Domain allowlist** | Package managers only | Sandbox network access |
| **Search past chats** | ON | Reference prior conversations |
| **Generate memory** | ON | Remember context from chats |
| **Skills** | Preview | Custom instructions |

---

## Design Philosophy

### ChatGPT: Explicit Agent Modes

**Approach**: Dedicated modes for different agent behaviors
- Users explicitly select agent type (Deep Research, Canvas, etc.)
- Clear boundaries between chat and agent execution
- Marketplace ecosystem for community agents
- Background task scheduling

**Tradeoffs**:
- More complex UI
- Better user control over agent behavior
- Established ecosystem

### Claude.ai: Integrated Capabilities

**Approach**: Capabilities as settings, not modes
- No explicit "agent mode" toggle
- Extended thinking always-on for Opus 4.5
- Browser automation via separate extension
- Skills for custom workflows (Preview)

**Tradeoffs**:
- Simpler UI
- Less granular control
- Newer/less mature ecosystem

---

## Open Questions

| Question | ChatGPT | Claude.ai |
|----------|---------|-----------|
| Task scheduling API? | Unknown | N/A |
| Skills sharing mechanism? | N/A | Unknown |
| Computer Use availability? | API beta | Extension only |
| Agent execution limits? | Unknown | Unknown |

---

## Evidence Sources

### Web Search (2026-01-04)
- Claude Opus 4.5 announcement: 30-minute autonomous coding sessions
- Claude in Chrome: Available to Max plan after 3-month preview
- Multi-tab workflows added since research preview

### Browser Capture (2026-01-04)
- Settings > Capabilities page showing all toggles
- Claude Code onboarding at `/code/onboarding`
- Skills (Preview) section with empty state
- Model selector: Opus 4.5, Sonnet 4.5, Haiku 4.5, plus legacy models

---

## Recommendations

1. **Test Claude in Chrome** - Requires Max plan subscription
2. **Compare Skills vs GPTs** - Create equivalent workflows on both platforms
3. **Test Codex vs Claude Code** - Compare GitHub integration depth
4. **Monitor Skills GA** - Track when Skills exits Preview
