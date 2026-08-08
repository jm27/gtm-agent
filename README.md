# GTM Agent

An AI-powered Go-to-Market orchestration engine built with **LangGraph**, demonstrating deep agent delegation, streaming, persistent memory, and production-grade agent patterns.

> **Live demo:** [gtm-agent-tawny.vercel.app](https://gtm-agent-tawny.vercel.app)

---

## What This Demo Shows

This isn't a chatbot. It's a multi-agent orchestration system where a supervisor agent delegates specialized work to sub-agents — each with their own prompt, tools, and output contract. Every LangGraph feature is wired into a real, interactive workflow.

### LangGraph Features Demonstrated

| Feature | What It Does | In This Demo |
|---------|-------------|--------------|
| **Deep Agents** | Independent agent nodes with their own system prompts and tool access — not one LLM role-playing | Orchestrator spawns 3 sub-agents (Data, Business, PM), each running as a dedicated LangGraph node |
| **Supervisor Delegation** | A supervisor node routes tasks to the right agent and aggregates results | The Orchestrator analyzes the GTM task, determines execution order, and hands off sequentially |
| **Streaming** | Token-by-token output streamed to the UI in real-time | Each agent streams its output live via LangGraph's `stream()` API — you see every word as it's generated |
| **Checkpointer** | State persisted at every graph step — pause, resume, rewind, audit | `MemorySaver` checkpointer saves agent state at each node transition; enables thread-scoped session history |
| **Store API** | Cross-thread persistent memory — facts, preferences, and user data survive across sessions | User profiles, past GTM runs, and market data persist across workflows via LangGraph's `BaseStore` |
| **Middleware** | Request/response hooks that run before and after every agent node — logging, guardrails, rate limiting | Metrics middleware tracks agent latency, token usage, and success rates per node |
| **StateGraph** | Typed state machine with conditional routing — no spaghetti code | The workflow is a `StateGraph<AgentState>` with typed nodes and conditional edges for routing between agents |
| **Human-in-the-Loop** | Pause execution, review output, edit, and resume — the interrupt-before pattern | The demo pauses before committing the final GTM strategy, letting you accept, edit, or reject the output |
| **Functional API** | Define agents as composable `@task` functions instead of rigid class hierarchies | Each agent (scoring, retrieval, summarization) is a testable, reusable `@task` |
| **Long-Term Memory** | Agent remembers past interactions and user context across conversations | The Orchestrator recalls previous GTM runs, user preferences, and market data across sessions |

### Workflow Architecture

```
┌──────────────────────────────────────────────────────┐
│                   SUPER AGENT                         │
│              (Orchestrator Node)                      │
│                                                       │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐      │
│  │   DATA    │   │ BUSINESS  │   │    PM     │      │
│  │  Agent    │──→│  Agent    │──→│  Agent    │      │
│  │           │   │           │   │           │      │
│  │ Market    │   │ Strategy  │   │ Timeline  │      │
│  │ Intel     │   │ Personas  │   │ & KPIs    │      │
│  └───────────┘   └───────────┘   └───────────┘      │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │  Checkpointer (MemorySaver)                    │   │
│  │  Store API (BaseStore — cross-thread memory)  │   │
│  │  Middleware (metrics, guardrails, logging)     │   │
│  │  Streaming (token-by-token to UI)              │   │
│  │  Human-in-the-Loop (interrupt before commit)  │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Demo Scenarios

Three pre-built workflows that showcase different GTM use cases:

| Scenario | Agents Used | Output |
|----------|-------------|--------|
| 🏥 **Healthcare Lead Gen** | Data → Business → PM | 1,247 qualified leads, buyer personas, 6-week outreach plan |
| 📈 **Market Expansion** | Data → Business → PM | 3 new regions analyzed, 12-month roadmap, €180K budget |
| 🛡️ **Churn Analysis** | Data → Business → PM | Risk segmentation, onboarding fix, 90-day retention sprint |

---

## Run Locally

```bash
git clone https://github.com/jm27/gtm-agent.git
cd gtm-agent
npm install
npm run dev
```

The demo runs in **simulation mode** by default — no API key needed. All agent responses are pre-written to showcase the orchestration flow.

### Enable Real LangGraph Agents

Add your LLM credentials to `.env`:

```env
GTMA_API_KEY=your-key-here
GTMA_LLM_PROVIDER=openai
```

The backend switches from simulated responses to live LangGraph orchestration with real LLM calls.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (React 19, TypeScript) |
| **Agent Orchestration** | LangGraph (StateGraph, nodes, conditional edges) |
| **Persistence** | MemorySaver (checkpointer), BaseStore (cross-thread) |
| **LLM Provider** | LangChain (OpenAI, Anthropic, Ollama compatible) |
| **Streaming** | LangGraph `stream()` → Server-Sent Events → React state |
| **Deployment** | Vercel (edge functions, automatic HTTPS) |
| **Styling** | Custom design system (DM Sans, JetBrains Mono) |

---

## Why This Matters

Most "AI agent" demos are a chat UI with a single LLM call threaded through a system prompt. This one shows:

1. **Real delegation** — independent agent nodes with their own state, not one model switching voices
2. **Production patterns** — checkpointer, Store API, middleware, streaming — these are what you need to ship agents to real users
3. **Workflow visibility** — see which agent is running, what it's producing, when it hands off
4. **Persistence** — state survives page reloads, agent runs are auditable, memory compounds across sessions

Built to showcase agent engineering skills. MIT licensed. Built with [Hermes Agent](https://github.com/NousResearch/hermes-agent).
