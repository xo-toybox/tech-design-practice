# {Chatbot} - Future Explorations

Tests and deep dives for future analysis sessions.

---

## [Feature/Area Name]

**Goal**: [What you want to understand]

**What we know**:
-
-

**To explore**:
1.
2.
3.

**Test**:
```
1. [Step]
2. [Step]
3. [Capture]
4. [Analyze]
```

---

## [Feature/Area Name]

**Goal**:

**What we know**:
-

**To explore**:
1.

**Test**:
```
```

---

## Additional Candidates

### [Area]
- Question 1
- Question 2

### [Area]
- Question 1
- Question 2

---

## Test Methodology

**Capture setup**:
1. Open DevTools Network tab
2. Enable "Preserve log"
3. Filter to target domain
4. Execute test
5. Export HAR or copy as cURL

**Timing analysis**:
```javascript
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/'))
  .map(r => ({ url: r.name, duration: r.duration }))
```

**SSE parsing**:
```javascript
// Intercept and log SSE events
const events = [];
// ... capture during test
events.map(e => ({ type: e.type, time: e.timestamp }))
```

---

## Constraints

- **Live account**: Be conservative with server requests
- **Error testing**: Requires careful design to avoid rate limits
- **Auth flows**: May disrupt session
