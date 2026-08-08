# Skill: Streaming Agent Output with Server-Sent Events

**Demonstrated in:** [GTM Agent](https://gtm-agent-tawny.vercel.app)  
**Stack:** LangGraph stream(), Next.js API Routes, SSE, React

---

## What This Shows

Token-by-token streaming from a LangGraph `StateGraph` to a React UI via Server-Sent Events (SSE). Each agent node's output appears in real-time as it's generated — not after the entire workflow completes.

## The Pipeline

```
LangGraph StateGraph
    │
    ├── graph.stream({ query }, { streamMode: "updates" })
    │       │
    │       └── Async generator yields { event, data } per node
    │
    ▼
Next.js API Route (/api/run)
    │
    ├── Wraps generator in ReadableStream
    ├── Encodes each event as SSE: data: { event, data }\n\n
    └── Returns Response with text/event-stream header
    │
    ▼
React Frontend
    │
    ├── fetch("/api/run") → response.body.getReader()
    ├── Decodes SSE chunks, parses JSON
    ├── Updates agent cards in real-time per event
    └── Falls back to simulated streaming in demo mode
```

## Key Implementation Details

### 1. Async Generator in LangGraph

```typescript
export async function* streamWorkflow(query: string) {
  const graph = createGraph();
  const config = { configurable: { thread_id: `gtm-${Date.now()}` } };
  
  yield { event: "orchestrator_start", data: { query } };
  
  for await (const chunk of await graph.stream(
    { query },
    { ...config, streamMode: "updates" }
  )) {
    const [nodeName, update] = Object.entries(chunk)[0];
    yield { event: `${nodeName}_update`, data: update };
  }
  
  const finalState = await graph.invoke({ query }, config);
  yield { event: "workflow_complete", data: { summary, outputs } };
}
```

### 2. SSE Route Handler

```typescript
const stream = new ReadableStream({
  async start(controller) {
    const send = (data) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };
    for await (const event of streamWorkflow(query)) {
      send(event);
    }
  }
});

return new Response(stream, {
  headers: { "Content-Type": "text/event-stream" }
});
```

### 3. React SSE Consumer

```typescript
const reader = res.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Parse SSE lines, map events to agent state
  // e.g., "data_update" → update Data Agent card
  //       "workflow_complete" → show summary, enable actions
}
```

## Why SSE Over WebSockets

- **Vercel-compatible** — SSE works on serverless functions; WebSockets don't
- **Simpler** — no handshake, no connection management, no reconnection logic
- **Sufficient** — the client only receives; it doesn't need bidirectional communication
- **Standard** — every browser supports `EventSource` and `ReadableStream`

## Streaming Modes Used

- `streamMode: "updates"` — emits state deltas per node. We map these to the three agent cards (Data, Business, PM)
- Final `graph.invoke()` — retrieves the complete summarized state for the executive summary

## Demo Mode Fallback

When no API key is set, the frontend uses `setTimeout` + character-by-character text rendering to simulate the same streaming experience. The visual effect is identical — users see a live "agent at work" experience regardless of backend availability.
