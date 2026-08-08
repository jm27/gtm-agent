# GTM Agent

An AI-powered Go-to-Market orchestration engine built with **LangGraph**, demonstrating deep agent delegation, streaming, and checkpointed state management.

> **Live demo:** [gtm-agent-tawny.vercel.app](https://gtm-agent-tawny.vercel.app)

---

## What This Demo Shows

This isn't a chatbot. It's a multi-agent orchestration system where a supervisor agent delegates specialized work to sub-agents — each with their own prompt, tools, and output contract.

### LangGraph Features Demonstrated

| Feature | How It's Used |
|---------|---------------|
| **Deep Agents** | The Orchestrator spawns 3 specialized sub-agents (Data, Business, PM), each running as an independent LangGraph node with its own system prompt |
| **Supervisor Delegation** | The Orchestrator node analyzes the task, determines the execution order, and hands off to the appropriate agent — then aggregates results |
| **Streaming** | Each agent streams its output token-by-token to the UI in real-time via LangGraph's `stream()` API, showing live progress |
| **Checkpointer** | Agent state (which agent is running, intermediate outputs, final results) is persisted through LangGraph's `MemorySaver` checkpointer — enabling pause/resume and audit trails |
| **StateGraph** | The workflow is defined as a `StateGraph` with typed state (`AgentState`) — nodes for each agent, conditional edges for routing |
| **Human-in-the-Loop** | The demo pauses before the final commit step, letting you review and edit the generated output (interrupt before commit pattern) |

### Workflow Architecture

```
┌─────────────────────────────────────────────┐
│              SUPER AGENT                     │
│         (Orchestrator Node)                  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   DATA   │  │ BUSINESS │  │    PM    │  │
│  │  Agent   │→ │  Agent   │→ │  Agent   │  │
│  │          │  │          │  │          │  │
│  │ Market   │  │ Strategy │  │ Timeline │  │
│  │ Intel    │  │ Personas │  │ & KPIs   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│         Checkpointer (MemorySaver)           │
│         Streaming (token-by-token)           │
└─────────────────────────────────────────────┘
```

Each agent is a LangGraph node with:
- **System prompt** — defines its role, output format, and constraints
- **Tools** — access to data retrieval, enrichment, and formatting tools
- **Output contract** — structured response parsed by the supervisor

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

- **Next.js 16** — React framework, static + server-rendered pages
- **LangGraph** — Agent orchestration, state management, streaming
- **LangChain** — LLM provider abstraction, tool integration
- **TypeScript** — End-to-end type safety
- **Vercel** — Deployment, edge functions

---

## Why This Matters

Most "AI agent" demos are just a chat UI with a single LLM call. This one shows:

1. **Real delegation** — not one agent typing in different voices, but independent nodes with their own state
2. **Workflow visibility** — you see which agent is running, what it's producing, and when it hands off
3. **Production patterns** — checkpointer, streaming, human-in-the-loop — these aren't demo gimmicks, they're what you need to ship agents to users

Built to showcase agent engineering skills. MIT licensed.
