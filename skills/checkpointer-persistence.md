# Skill: LangGraph Checkpointer & State Persistence

**Demonstrated in:** [GTM Agent](https://gtm-agent-tawny.vercel.app)  
**Stack:** LangGraph MemorySaver, StateGraph, thread-scoped checkpoints

---

## What This Shows

Persistent agent state using LangGraph's **checkpointer** — every node transition is saved, enabling pause/resume, audit trails, and state rehydration. Paired with the **Store API** for cross-thread memory.

## Checkpointer Architecture

```
┌─────────────────────────────────────────────────────┐
│                  StateGraph Run                      │
│                                                       │
│  orchestrator ──► data ──► business ──► pm ──► summary│
│       │              │         │          │           │
│       ▼              ▼         ▼          ▼           │
│  ┌──────────────────────────────────────────────┐    │
│  │            MemorySaver                        │    │
│  │                                               │    │
│  │  Thread: gtm-1623456789                       │    │
│  │  ├── Step 0: orchestrator → { currentAgent }  │    │
│  │  ├── Step 1: data → { dataOutput }           │    │
│  │  ├── Step 2: business → { businessOutput }    │    │
│  │  ├── Step 3: pm → { pmOutput }               │    │
│  │  └── Step 4: orchestrator → { summary }       │    │
│  │                                               │    │
│  │  Thread: gtm-1623456790                       │    │
│  │  └── (separate thread, separate state)        │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Implementation

### 1. Graph Compilation with Checkpointer

```typescript
const checkpointer = new MemorySaver();

const graph = new StateGraph(AgentState)
  .addNode("orchestrator", orchestratorNode)
  .addNode("data", dataAgentNode)
  // ...
  .compile({ checkpointer });
```

### 2. Thread-Scoped Invocation

Each workflow run gets a unique `thread_id`:

```typescript
const config = { configurable: { thread_id: `gtm-${Date.now()}` } };
const result = await graph.invoke({ query }, config);
```

This means:
- State from different runs never collide
- You can resume a paused thread with the same `thread_id`
- Audit: replay any thread to see exactly what happened

### 3. Cross-Thread Memory (Store API)

For user-level persistence across threads (preferences, past GTM runs, saved strategies), LangGraph's **BaseStore** provides namespaced key-value storage:

```typescript
import { InMemoryStore } from "@langchain/langgraph";

const store = new InMemoryStore();

// Save user preference
await store.put(
  ["users", "user-123", "preferences"],
  "target_region",
  { region: "DACH", language: "de" }
);

// Retrieve in a later session
const pref = await store.get(
  ["users", "user-123", "preferences"],
  "target_region"
);
```

### 4. Middleware Integration

Every node transition can be instrumented:

```typescript
// Metrics middleware — track latency per node
const start = Date.now();
// ... node execution ...
console.log(`[${nodeName}] ${Date.now() - start}ms, tokens: ${count}`);

// Guardrail middleware — validate output schema
if (!output.match(/^## Market Overview/)) {
  throw new Error("Data agent output missing required section");
}
```

## Why This Matters

| Without Persistence | With Checkpointer |
|---------------------|-------------------|
| State lost on page refresh | State survives reloads |
| No audit trail | Every node transition recorded |
| Can't resume interrupted runs | Resume from last checkpoint |
| Agent has no memory between sessions | Store API remembers user context |
| Bugs are invisible | Middleware logs latency + errors |

## Production Considerations

- **MemorySaver** is for development. For production, swap to `SqliteSaver` or `PostgresSaver`
- Thread IDs should be user-scoped, not timestamp-based, for real multi-tenant apps
- Store API works with any database backend (SQLite, Postgres, Redis)
- Middleware should be extracted to a shared module, not inline in node functions
