# Tech Design Practice

Learning projects for system design patterns.

Chrome explorations.

## Projects

| Project | Description | Links |
|---------|-------------|-------|
| [saga](./saga) | Temporal workflow patterns (sync vs async, saga compensation) | [Frontend](http://localhost:5173) · [API](http://localhost:8001/docs) · [Temporal](http://localhost:8233) |
| [streaming-protocols](./streaming-protocols) | Protocol comparison (SSE, WebSocket, gRPC, HTTP/3) | [Compare](http://localhost:8100/compare) · [API](http://localhost:8100/docs) |

## Port Allocation

```
Port    Project      Service
------  ----------   ---------------------------
5173    saga         Vite frontend
7233    saga         Temporal server
8001    saga         FastAPI (order API)
8100    streaming-protocols    FastAPI (SSE, WebSocket, HTTP/2)
8143    streaming-protocols    HTTP/3 streaming (QUIC)
50051   streaming-protocols    gRPC over HTTP/2
50052   streaming-protocols    gRPC over HTTP/3 (experimental)
```

## Quick Start

```bash
# Saga (Temporal workflows)
cd saga && ./init.sh

# Streaming Protocols (Protocol comparison)
cd streaming-protocols && ./init.sh
```
