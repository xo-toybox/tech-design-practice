# GPTs vs Projects Comparison

Custom bot/workspace systems compared.

---

## Overview

| Dimension | ChatGPT GPTs | Claude Projects |
|-----------|--------------|-----------------|
| Custom instructions | Yes | Yes |
| Knowledge files | Yes | Yes |
| External actions | Yes (Actions API) | No |
| Marketplace | Yes (GPT Store) | No |
| Memory scoping | GPT-specific + global | Project-scoped |

---

## Custom Instructions

### ChatGPT GPTs

- System prompt editable by creator
- `system_hints` API for delivery
- Can include starter prompts
- Instructions private (but extractable)

### Claude Projects

- Project-level custom instructions
- Applied to all conversations in project
- Files can be attached for context

---

## Knowledge Files

### ChatGPT GPTs

- Upload files to GPT
- Referenced during conversation
- Stored in GPT configuration
- File size limits apply

### Claude Projects

- Upload files to project
- Referenced across conversations
- Project-scoped storage

---

## External Actions (ChatGPT Only)

ChatGPT GPTs support external API calls:

| Capability | Description |
|------------|-------------|
| Actions | Custom API endpoints |
| Web Search | Built-in capability |
| Code Interpreter | Python execution |
| DALL-E | Image generation |

Claude Projects do not support external actions.

---

## Marketplace

### ChatGPT GPT Store

| Feature | Details |
|---------|---------|
| Categories | Top Picks, Writing, Productivity, etc. |
| Metrics | Ratings, rankings, conversation counts |
| Discovery | Public API (`/public-api/gizmos/discovery`) |
| Revenue sharing | Available for creators |

### Claude

No public marketplace. Skills are curated by Anthropic.

---

## ID Formats

| Platform | Format |
|----------|--------|
| ChatGPT GPT | `g-{11-char}` or `g-{32-char-hex}` |
| Claude Project | UUID |

---

## Coverage Status

| Item | ChatGPT | Claude.ai |
|------|---------|-----------|
| Creation flow | Partial | Needs capture |
| Conversation initialization | Yes | Needs capture |
| File upload limits | Needs capture | Needs capture |
| Action API structure | Partial | N/A |
