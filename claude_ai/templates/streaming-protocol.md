# {Chatbot} Streaming Protocol Analysis

## Protocol Summary

| Aspect | Value | Evidence |
|--------|-------|----------|
| Streaming Mechanism | SSE / WebSocket / gRPC-Web | |
| HTTP Version | 1.1 / 2 / 3 (QUIC) | |
| Compression | br / gzip / zstd | |
| Connection Model | Long-polling / Persistent / Multiplexed | |

## HTTP Version Analysis

### Primary Protocol
<!-- Which HTTP version is used? Evidence from alt-svc, protocol column -->

### Fallback Behavior
<!-- Does it fall back to older versions? When? -->

### QUIC/HTTP3 Considerations
<!-- If using HTTP/3: connection migration, 0-RTT, head-of-line blocking -->

## Streaming Mechanism Deep Dive

### Protocol Choice
<!-- SSE vs WebSocket vs gRPC-Web - which and why? -->

### Why This Protocol?
<!-- Trade-offs: unidirectional vs bidirectional, browser support, firewall traversal -->

### Implementation Details
<!-- fetch() vs EventSource, ReadableStream usage, reconnection logic -->

## Connection Lifecycle

```
Client                     Server
  │                          │
  │  [Document the actual    │
  │   request/response flow  │
  │   observed]              │
  │                          │
```

### Handshake
<!-- Initial connection setup -->

### Message Flow
<!-- How tokens/chunks are transmitted -->

### Keepalive / Heartbeat
<!-- How connection stays alive -->

### Termination
<!-- Normal close vs error handling -->

## Compression

### Algorithm
<!-- br / gzip / zstd - which layer applies it? -->

### Observed Ratios
<!-- If measurable -->

## Multiplexing

### Stream Management
<!-- How multiple requests share connections -->

### Priority / Ordering
<!-- Any observed prioritization -->

## Evidence

### Headers
```
<!-- Relevant headers from capture -->
```

### Request/Response Samples
<!-- Key samples with file references -->

## Freeform Observations

<!--
Anything not covered above:
- Unexpected behaviors
- Questions to investigate
- Anomalies observed
- Performance characteristics
- Comparison notes with other implementations
-->
