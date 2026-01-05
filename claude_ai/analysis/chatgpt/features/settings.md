# Settings System

Centralized configuration with 10 tabs.

---

## Key Tradeoffs

| Tradeoff | Choice | Cost |
|----------|--------|------|
| Tab-based modal | 10 tabs in modal dialog | Dense UI, requires scrolling |
| Hash-based routing | `/#settings/{Tab}` URLs | Deep-linkable, not SEO-friendly |
| Centralized settings | All settings in one modal | Discoverability vs feature-specific |

---

## Tab Overview

| Tab | URL | Purpose |
|-----|-----|---------|
| **General** | `/#settings` | Appearance, language, voice |
| **Notifications** | `/#settings/Notifications` | Push/email preferences |
| **Personalization** | `/#settings/Personalization` | Style, traits, custom instructions |
| **Apps** | `/#settings/Apps` | Third-party integrations |
| **Schedules** | `/#settings/Schedules` | Scheduled tasks |
| **Orders** | `/#settings/Orders` | Purchase history |
| **Data controls** | `/#settings/DataControls` | Privacy, training, export |
| **Security** | `/#settings/Security` | MFA, passkeys, sessions |
| **Parental controls** | `/#settings/ParentalControls` | Family linking |
| **Account** | `/#settings/Account` | Subscription, payment |

---

## General

| Setting | Type | Default |
|---------|------|---------|
| Appearance | Dropdown | System |
| Accent color | Dropdown | Default |
| Language | Dropdown | Auto-detect |
| Voice | Dropdown + Play | Maple |
| Show additional models | Toggle | OFF |

---

## Notifications

| Category | Options |
|----------|---------|
| Responses | Push / Email / Both / Off |
| Group chats | Push / Email / Both / Off |
| Tasks | Push / Email / Both / Off |
| Projects | Email / Off |
| Recommendations | Push+Email / Off |

---

## Personalization

See [features/memories.md](memories.md) for detailed coverage.

| Section | Description |
|---------|-------------|
| Base style | Nerdy, Formal, Friendly, etc. |
| Characteristics | Warm, Enthusiastic, Headers, Emoji |
| Custom instructions | Free-text preferences |
| About you | Nickname, occupation, background |

---

## Apps (formerly Connectors)

UI notice: "Looking for Connectors? Connectors are now called Apps."

See [features/modes.md](modes.md) for connector details.

---

## Schedules

Links to dedicated `/schedules` page.

See [features/tasks.md](tasks.md) for automation details.

---

## Orders

Empty state: "No orders yet"

Indicates e-commerce functionality exists or is planned.

---

## Data Controls

| Setting | Type |
|---------|------|
| Improve model for everyone | Toggle (OFF) |
| Remote browser data | Toggle (ON) |
| Shared links | Link |
| Archived chats | Link |
| Archive all | Button |
| Delete all | Button (destructive) |
| Export data | Button |

---

## Security

| Section | Features |
|---------|----------|
| Passkeys | Add passkey for MFA |
| MFA | Authenticator, Push, SMS |
| Trusted Devices | Count + manage |
| Log out | This device / All devices |
| Secure sign in | OAuth provider for external apps |
| Codex CLI | Connected status |

**Key discovery**: ChatGPT as OAuth identity provider for external apps.

---

## Parental Controls

Family account linking for parents and teens.

---

## Account

| Section | Content |
|---------|---------|
| Subscription | Plan name, renewal date |
| Plus features | Capability list |
| Payment | Manage button |
| Delete account | Destructive action |
| GPT builder profile | Public profile for shared GPTs |

---

## URL Routing

| Pattern | Example |
|---------|---------|
| Default tab | `/#settings` → General |
| Named tab | `/#settings/Security` |
| Case-sensitive | `ParentalControls` not `parental-controls` |

Hash-based routing allows deep linking without full page reload.

---

## Control Types

| Control | Used For |
|---------|----------|
| Toggle | Boolean settings |
| Dropdown | Multi-option selection |
| Button | Actions |
| Link | Navigation |
| Text input | Free-form input |

Destructive actions use red styling.
