/**
 * Network Request Capture Script
 *
 * Captures fetch, WebSocket, and gRPC-Web requests for protocol analysis.
 * Outputs NDJSON format (one JSON object per line).
 *
 * Usage:
 *   1. Load config first: paste contents of configs/claude-ai.js
 *   2. Then paste this script
 *   3. Interact with the page
 *   4. Call downloadCaptures() or getCaptures()
 */

(function() {
  'use strict';

  const config = window.CAPTURE_CONFIG || {
    name: 'default',
    tier1Patterns: ['/api/'],
    tier2Domains: [],
    skipPatterns: ['favicon', '.woff', '.png', '.jpg', '.css'],
    sanitizeHeaders: ['cookie', 'authorization'],
    sanitizeBodyKeys: ['prompt', 'content', 'message', 'password'],
    sseConfig: { maxEventsPerType: 3 }
  };

  // Storage
  const captures = [];
  let requestId = 0;

  // Helpers
  function shouldSkip(url) {
    return config.skipPatterns.some(p => url.includes(p));
  }

  function getTier(url) {
    if (config.tier1Patterns.some(p => url.includes(p))) return 1;
    if (config.tier2Domains.some(d => url.includes(d))) return 2;
    return 3; // discovery tier - capture minimal metadata for unknown domains
  }

  function extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  function sanitizeValue(key, value) {
    const lowerKey = key.toLowerCase();
    if (config.sanitizeHeaders.includes(lowerKey)) {
      return '[REDACTED]';
    }
    return value;
  }

  function sanitizeBody(body) {
    if (!body || typeof body !== 'object') return body;
    const result = {};
    for (const [key, value] of Object.entries(body)) {
      if (config.sanitizeBodyKeys.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeBody(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  function headersToObject(headers) {
    const obj = {};
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        obj[key] = sanitizeValue(key, value);
      });
    } else if (headers && typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        obj[key] = sanitizeValue(key, value);
      }
    }
    return obj;
  }

  function extractPath(url) {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch {
      return url;
    }
  }

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async function(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || (input.method) || 'GET';
    const startTime = Date.now();
    const id = 'req_' + (++requestId);

    if (shouldSkip(url)) {
      return originalFetch.apply(this, arguments);
    }

    const tier = getTier(url);

    const capture = {
      id,
      timestamp: new Date().toISOString(),
      tier,
      type: 'fetch',
      request: {
        url: url,
        path: extractPath(url),
        method
      }
    };

    // Tier 3 (discovery): add domain for easy grouping
    if (tier === 3) {
      capture.request.domain = extractDomain(url);
    }

    // Tier 1: full details
    if (tier === 1) {
      capture.request.headers = headersToObject(init.headers || (input.headers));

      if (init.body) {
        try {
          const bodyText = typeof init.body === 'string' ? init.body : await init.body;
          capture.request.body = sanitizeBody(JSON.parse(bodyText));
        } catch {
          capture.request.body = '[non-JSON body]';
        }
      }
    }

    try {
      const response = await originalFetch.apply(this, arguments);
      const duration = Date.now() - startTime;

      capture.response = {
        status: response.status,
        statusText: response.statusText,
        duration_ms: duration
      };

      if (tier === 1) {
        capture.response.headers = headersToObject(response.headers);

        const contentType = response.headers.get('content-type') || '';
        capture.response.contentType = contentType;

        // Detect SSE
        if (contentType.includes('text/event-stream')) {
          capture.response.isSSE = true;
          capture.response.sseEvents = [];

          // Clone and read SSE stream
          const clone = response.clone();
          const reader = clone.body.getReader();
          const decoder = new TextDecoder();
          const eventCounts = {};

          (async () => {
            try {
              let buffer = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.startsWith('event:')) {
                    const eventType = line.slice(6).trim();
                    eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;

                    if (eventCounts[eventType] <= (config.sseConfig?.maxEventsPerType || 3)) {
                      capture.response.sseEvents.push({
                        type: eventType,
                        sample: true
                      });
                    }
                  }
                }
              }
              capture.response.sseEventCounts = eventCounts;
            } catch (e) {
              capture.response.sseError = e.message;
            }
          })();
        }

        // Detect gRPC-Web
        if (contentType.includes('application/grpc-web')) {
          capture.response.isGrpcWeb = true;
        }
      }

      captures.push(capture);
      console.log('[Capture]', tier === 1 ? 'FULL' : 'META', method, extractPath(url));

      return response;
    } catch (error) {
      capture.error = error.message;
      captures.push(capture);
      throw error;
    }
  };

  // Intercept WebSocket
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    const id = 'ws_' + (++requestId);
    const startTime = Date.now();

    const capture = {
      id,
      timestamp: new Date().toISOString(),
      tier: 1,
      type: 'websocket',
      request: {
        url,
        path: extractPath(url),
        protocols: protocols
      },
      messages: {
        sent: [],
        received: []
      }
    };

    const ws = new OriginalWebSocket(url, protocols);

    ws.addEventListener('open', () => {
      capture.connectedAt = new Date().toISOString();
      capture.connectionTime_ms = Date.now() - startTime;
      console.log('[Capture] WebSocket OPEN', extractPath(url));
    });

    ws.addEventListener('close', (event) => {
      capture.closedAt = new Date().toISOString();
      capture.closeCode = event.code;
      capture.closeReason = event.reason;
      captures.push(capture);
      console.log('[Capture] WebSocket CLOSE', extractPath(url));
    });

    ws.addEventListener('error', () => {
      capture.error = true;
    });

    // Sample messages (first 5 each direction)
    const maxMessages = 5;

    const originalSend = ws.send.bind(ws);
    ws.send = function(data) {
      if (capture.messages.sent.length < maxMessages) {
        capture.messages.sent.push({
          timestamp: new Date().toISOString(),
          size: typeof data === 'string' ? data.length : data.byteLength,
          sample: typeof data === 'string' ? data.slice(0, 200) : '[binary]'
        });
      }
      return originalSend(data);
    };

    ws.addEventListener('message', (event) => {
      if (capture.messages.received.length < maxMessages) {
        capture.messages.received.push({
          timestamp: new Date().toISOString(),
          size: typeof event.data === 'string' ? event.data.length : event.data.byteLength,
          sample: typeof event.data === 'string' ? event.data.slice(0, 200) : '[binary]'
        });
      }
    });

    return ws;
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  window.WebSocket.OPEN = OriginalWebSocket.OPEN;
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

  // Export functions
  window.getCaptures = function() {
    return captures;
  };

  window.getCapturesNDJSON = function() {
    return captures.map(c => JSON.stringify(c)).join('\n');
  };

  window.downloadCaptures = function(filename) {
    const name = filename || (config.name + '-capture-' + new Date().toISOString().slice(0,10) + '.ndjson');
    const blob = new Blob([window.getCapturesNDJSON()], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    console.log('[Capture] Downloaded', captures.length, 'requests to', name);
  };

  window.clearCaptures = function() {
    captures.length = 0;
    requestId = 0;
    console.log('[Capture] Cleared');
  };

  window.captureStats = function() {
    const tier1 = captures.filter(c => c.tier === 1).length;
    const tier2 = captures.filter(c => c.tier === 2).length;
    const tier3 = captures.filter(c => c.tier === 3).length;
    const sse = captures.filter(c => c.response?.isSSE).length;
    const ws = captures.filter(c => c.type === 'websocket').length;
    console.log('[Capture Stats]', {
      total: captures.length,
      tier1_full: tier1,
      tier2_known: tier2,
      tier3_discovery: tier3,
      sse_streams: sse,
      websockets: ws
    });
    return { total: captures.length, tier1, tier2, tier3, sse, ws };
  };

  window.discoveredDomains = function() {
    const domains = {};
    captures.filter(c => c.tier === 3).forEach(c => {
      const domain = c.request.domain || extractDomain(c.request.url);
      domains[domain] = (domains[domain] || 0) + 1;
    });
    console.log('[Discovered Domains]', domains);
    return domains;
  };

  console.log('[Capture] Script loaded for:', config.name);
  console.log('[Capture] Tier 1 (full):', config.tier1Patterns);
  console.log('[Capture] Tier 2 (known):', config.tier2Domains);
  console.log('[Capture] Tier 3: discovery (all other domains)');
  console.log('[Capture] Commands: getCaptures(), getCapturesNDJSON(), downloadCaptures(), clearCaptures(), captureStats(), discoveredDomains()');
})();
