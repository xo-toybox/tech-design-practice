# {Chatbot} Frontend Overview

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Framework    │  │    Rendering    │  │    Bundler      │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Third-party Services                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │    │
│  │  │         │  │         │  │         │  │         │     │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Framework

### Detection Method
- Window globals:
- Bundle analysis:

| Feature | Evidence |
|---------|----------|
| Framework | |
| Rendering | SSR / CSR / Hybrid |
| Bundler | |

---

## Third-party Services

### Detected via Window Globals

| Global | Service | Purpose |
|--------|---------|---------|
| | | |

### External Domains

| Domain | Purpose |
|--------|---------|
| | |

---

## State Management

### Observations
- Redux / MobX / Context:
- Evidence:

### Caching
- Client-side caching:
- Cache headers observed:

---

## Feature Flags

### Provider
-

### Loading Pattern
1.
2.
3.

### Known Flags

| Flag | Purpose |
|------|---------|
| | |

---

## Analytics

### Provider
-

### Event Structure
```json
{
  // Sample event
}
```

---

## Push Notifications

### Provider
-

### Registration Flow
1.
2.
3.

---

## Performance Patterns

### Bundle Loading
- Chunking:
- Code splitting:

### Network Optimization
- Protocol:
- Compression:
- CDN:

---

## Unknown / Future Investigation

| Item | Status |
|------|--------|
| | |
