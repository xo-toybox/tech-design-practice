# Chatbot Protocol & Architecture Analysis Framework

Reusable framework for analyzing chatbot streaming protocols and system architectures.

## Analysis Tracks

### Track 1: Streaming Protocol Deep Dive
- HTTP versions: 1.1 / 2 / 3 (QUIC)
- Streaming mechanisms: SSE / WebSocket / gRPC-Web
- Connection lifecycle, multiplexing, compression

### Track 2: System Architecture Analysis
- Edge/Gateway/Service/Data layers
- Consistency, storage, durability tradeoffs
- Third-party integrations

## Directory Structure

```
.data/{chatbot}/           # Raw capture data (NDJSON)
  raw-capture.ndjson
  CAPTURE.md               # Capture methodology

analysis/{chatbot}/        # Analysis documents
  streaming-protocol.md    # Track 1
  system-architecture.md   # Track 2
  samples/                 # Supporting evidence

scripts/
  capture-requests.js      # Main capture script
  configs/{chatbot}.js     # Per-chatbot config

templates/                 # Reusable templates
  streaming-protocol.md
  system-architecture.md
```

## Capture Tiers

| Tier | Scope | Data Captured |
|------|-------|---------------|
| 1 | API endpoints | Full: headers, body, timing, SSE events |
| 2 | Known domains | Metadata: domain, path, status, timing |
| 3 | Discovery | Minimal: domain, status, timing (find unknowns) |

## Quick Start

### 1. Capture Data

```javascript
// In DevTools Console on target chatbot:
// 1. Paste config: scripts/configs/claude-ai.js
// 2. Paste script: scripts/capture-requests.js
// 3. Refresh page
// 4. Interact (send message)
// 5. Export:
downloadCaptures()
```

### 2. Analyze

```bash
# Count requests
wc -l .data/claude-ai/raw-capture.ndjson

# List unique endpoints
jq -r '.req.url' .data/claude-ai/raw-capture.ndjson | \
  sed 's/[a-f0-9-]\{36\}/{uuid}/g' | sort -u

# Find SSE streams
jq -r 'select(.res.sse == true) | .req.url' .data/claude-ai/raw-capture.ndjson

# Discover unknown domains (tier 3)
jq -r 'select(.tier == 3) | .req.domain' .data/claude-ai/raw-capture.ndjson | sort | uniq -c
```

### 3. Document

Use templates to structure analysis:
- `templates/streaming-protocol.md` - Protocol deep dive
- `templates/system-architecture.md` - Architecture analysis

## Adding a New Chatbot

1. Create config: `scripts/configs/{name}.js`
2. Create directories: `.data/{name}/`, `analysis/{name}/samples/`
3. Copy templates to `analysis/{name}/`
4. Capture and analyze

## Current Analyses

- **claude-ai**: Claude.ai (Anthropic) - SSE over HTTP/3, Cloudflare + Google Cloud + Envoy
