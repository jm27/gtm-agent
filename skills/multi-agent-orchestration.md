# Skill: Multi-Agent GTM Orchestration with LangGraph

**Demonstrated in:** [GTM Agent](https://gtm-agent-tawny.vercel.app)  
**Stack:** LangGraph, Next.js, TypeScript, Vercel

---

## What This Shows

A production-grade multi-agent system where a **supervisor agent** orchestrates 3 specialized sub-agents through a typed state machine. Every LangGraph primitive is wired in: StateGraph, checkpointer, streaming, conditional routing, and human-in-the-loop.

## Architecture

```
StateGraph<AgentState>
    │
    ├── orchestrator (entry) — analyzes task, routes to agents
    │       │
    │       ├── data — market intel, TAM, competitors
    │       │       │
    │       │       └── business — strategy, personas, channels
    │       │               │
    │       │               └── pm — sprint plan, KPIs, budget
    │       │                       │
    │       └── orchestrator (re-entry) — executive summary
    │
    └── MemorySaver (checkpointer) — pause/resume/audit
```

## LangGraph Features Used

| Feature | Implementation |
|---------|---------------|
| **StateGraph** | Typed `Annotation.Root` with 6 state fields, reducer for messages |
| **Deep Agents** | 4 independent nodes with unique system prompts and input contracts |
| **Conditional Routing** | `addConditionalEdges` routes from orchestrator to data/business/pm/END |
| **Checkpointer** | `MemorySaver` persists state at every node transition |
| **Streaming** | Async generator yields `{ event, data }` per node update, consumed via SSE |
| **Human-in-the-Loop** | Frontend displays agent output, user accepts/edits before final commit |
| **Functional API** | Agent nodes are pure async functions, testable in isolation |

## Key Design Decisions

1. **Sequential handoff** — data → business → pm → summary. This mirrors real GTM workflows where each step depends on the previous. The orchestrator doesn't run them in parallel because the business agent needs the data agent's output.

2. **Typed state** — `AgentState` has dedicated fields for each agent's output (`dataOutput`, `businessOutput`, `pmOutput`). This makes the graph self-documenting and prevents cross-contamination.

3. **Demo-first, API-gated** — The frontend tries the LangGraph API first. If no API key is set (public demo mode), it falls back to pre-written scenarios that showcase the same orchestration pattern. Zero cost, full demo.

4. **Multi-provider** — The model factory supports OpenAI, Anthropic, and Ollama through LangChain's `ChatOpenAI` with configurable base URL. Same graph, any provider.

## Why This Matters for Agent Engineering

Most "agent" demos are a single LLM call with a system prompt that says "act like multiple agents." This one:
- Has real graph topology with conditional routing
- Persists state between nodes (checkpointer)
- Streams per-node output to the UI
- Degrades gracefully without an API key
- Is deployable as a single Vercel function

This is the difference between a demo and a production agent system.
