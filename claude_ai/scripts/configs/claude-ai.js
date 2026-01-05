/**
 * Capture configuration for claude.ai
 */
window.CAPTURE_CONFIG = {
  name: 'claude-ai',

  // Tier 1: Full capture (headers, body, timing, SSE events)
  tier1Patterns: [
    '/api/'
  ],

  // Tier 2: Metadata only (domain, path, method, status, timing)
  tier2Domains: [
    'anthropic.com',
    'googleapis.com',
    'gstatic.com',
    'google.com',
    'firebaseio.com'
  ],

  // Skip entirely (noise)
  skipPatterns: [
    'favicon',
    '.woff',
    '.woff2',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.css',
    'hot-update',
    '__webpack'
  ],

  // Header sanitization
  sanitizeHeaders: [
    'cookie',
    'authorization',
    'x-api-key',
    'set-cookie'
  ],

  // Body field sanitization (redact values, keep keys)
  sanitizeBodyKeys: [
    'prompt',
    'content',
    'message',
    'text',
    'api_key',
    'token',
    'password',
    'secret'
  ],

  // SSE event sampling
  sseConfig: {
    maxEventsPerType: 3,  // Sample first N events of each type
    captureEventTypes: ['message_start', 'content_block_start', 'content_block_delta', 'message_delta', 'message_stop']
  }
};
