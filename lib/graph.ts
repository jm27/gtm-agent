import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// ── State ──────────────────────────────────────────
export const AgentState = Annotation.Root({
  query: Annotation<string>(),
  scenario: Annotation<string>(),
  dataOutput: Annotation<string>(),
  businessOutput: Annotation<string>(),
  pmOutput: Annotation<string>(),
  summary: Annotation<string>(),
  currentAgent: Annotation<string>(),
  messages: Annotation<any[]>({
    reducer: (a, b) => (b ? b : a),
    default: () => [],
  }),
});

// ── Agent Prompts ──────────────────────────────────
const DATA_PROMPT = `You are a market intelligence agent. Your output feeds directly into business strategy — be precise, data-heavy, and actionable.

Given a GTM scenario, produce a structured market analysis with these sections:

## Market Overview
- TAM (total addressable market) in USD with current year estimate
- YoY growth rate (percentage)
- 1-2 key trends driving the market

## Competitive Landscape
- Top 3-5 competitors with estimated market share percentages
- 1-sentence positioning for each (e.g., "enterprise-focused, legacy")
- White space / gap you can exploit

## Target Decision Makers
- Count of reachable decision makers in the target segment
- Primary job titles (CTO, VP Engineering, etc.)
- Where they spend time (conferences, communities, publications)

## Key Insights
- 2-3 actionable takeaways that the Business Agent can use

Be specific with numbers. If you must estimate, use ranges (e.g., "$5-8B"). No fluff. Every section should earn its space.`;

const BUSINESS_PROMPT = `You are a business strategy agent. You receive market intelligence from the Data Agent. Your job is to turn raw data into a sharp, executable GTM strategy.

Given the market intelligence, produce:

## Primary Target
- Exactly who to sell to first — company size, industry, geography
- Why this segment (cite specific data from the market intel)
- ICP (Ideal Customer Profile) in one sentence

## Buyer Persona
- Job title, typical background, what keeps them up at night
- Their decision trigger (compliance deadline? budget cycle? new initiative?)
- How they buy (RFP? referral? pilot first?)

## Channel Strategy
- 2-3 channels ranked by expected ROI
- Why each channel works for this persona
- Specific tactics (e.g., "LinkedIn InMail with compliance angle", not just "LinkedIn")

## Competitive Positioning
- Your wedge against the top 2 competitors
- One sentence value prop that differentiates you
- Objection handling for the most common pushback

Be specific. Cite the data. This strategy will be handed to a PM to build a sprint plan.`;

const PM_PROMPT = `You are a project management agent. You receive a business strategy from the Business Agent. Your job is to build a concrete, week-by-week execution plan that a team can start on Monday.

Given the strategy, produce:

## 6-Week Sprint Plan
- Week 1-2: Foundation (list building, tooling setup, initial outreach prep)
- Week 3-4: Active outreach (campaign launch, first responses, pipeline build)
- Week 5-6: Conversion (demos, proposals, pilot agreements)
- Each week: 3-5 specific activities, not vague goals

## Resources & Budget
- People needed (roles, not names)
- Tools & software required
- Total estimated budget with line items

## Success Metrics
- 3-5 KPIs with specific target numbers (e.g., "15% InMail reply rate")
- Leading indicators to watch weekly
- Go/no-go criteria after week 4

## Risk Register
- Top 3 risks with likelihood and mitigation

Be concrete. Include dollar amounts, counts, dates. This is the plan someone executes — not a PowerPoint slide.`;

const ORCHESTRATOR_PROMPT = `You are a GTM orchestrator. You have received completed outputs from three specialized agents: Data (market intelligence), Business (strategy), and PM (execution plan).

Your ONLY job is to synthesize these into a tight executive summary. Do not add new information. Do not re-analyze. Summarize what was produced.

## Executive Summary (max 5 sentences)
1. Market opportunity — what's the prize? (1 sentence, cite TAM/growth from Data)
2. Strategy — how will we win? (1-2 sentences, cite target segment and channel from Business)
3. Execution & timeline — when and what result? (1-2 sentences, cite timeline and KPIs from PM)
4. Bottom line — one sentence on why this works

Be punchy. This is for a CEO who reads 50 of these a day. No bullet points — flowing prose. Start with the opportunity, end with conviction.`;

// ── Model Factory ─────────────────────────────────
function createModel() {
  const provider = process.env.GTMA_LLM_PROVIDER || "openai";
  const apiKey = process.env.GTMA_API_KEY;

  if (provider === "ollama") {
    // Use OpenAI-compatible with local Ollama
    return new ChatOpenAI({
      modelName: process.env.GTMA_MODEL || "llama-3.2-3b",
      openAIApiKey: "ollama",
      configuration: {
        baseURL: process.env.GTMA_BASE_URL || "http://localhost:11434/v1",
      },
      temperature: 0.3,
    });
  }

  return new ChatOpenAI({
    modelName: process.env.GTMA_MODEL || "gpt-4o-mini",
    openAIApiKey: apiKey,
    temperature: 0.3,
  });
}

// ── Agent Nodes ───────────────────────────────────
async function orchestratorNode(state: typeof AgentState.State) {
  const model = createModel();
  const output = state.dataOutput && state.businessOutput && state.pmOutput;

  if (output) {
    const response = await model.invoke([
      new SystemMessage(ORCHESTRATOR_PROMPT),
      new HumanMessage(`Data Agent:\n${state.dataOutput}\n\nBusiness Agent:\n${state.businessOutput}\n\nPM Agent:\n${state.pmOutput}\n\nWrite an executive summary.`),
    ]);
    return { summary: typeof response.content === "string" ? response.content : JSON.stringify(response.content) };
  }

  return { currentAgent: "data" };
}

function routeAfterOrchestrator(state: typeof AgentState.State): string {
  if (state.summary) return END;
  return state.currentAgent;
}

async function dataAgentNode(state: typeof AgentState.State) {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(DATA_PROMPT),
    new HumanMessage(`Analyze this GTM scenario:\n\n${state.query}`),
  ]);
  return {
    dataOutput: typeof response.content === "string" ? response.content : JSON.stringify(response.content),
    currentAgent: "business",
  };
}

async function businessAgentNode(state: typeof AgentState.State) {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(BUSINESS_PROMPT),
    new HumanMessage(`Market intelligence:\n${state.dataOutput}\n\nOriginal scenario: ${state.query}\n\nBuild a GTM strategy.`),
  ]);
  return {
    businessOutput: typeof response.content === "string" ? response.content : JSON.stringify(response.content),
    currentAgent: "pm",
  };
}

async function pmAgentNode(state: typeof AgentState.State) {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(PM_PROMPT),
    new HumanMessage(`Business strategy:\n${state.businessOutput}\n\nOriginal scenario: ${state.query}\n\nBuild an execution plan.`),
  ]);
  return {
    pmOutput: typeof response.content === "string" ? response.content : JSON.stringify(response.content),
    currentAgent: "orchestrator",
  };
}

// ── Graph Builder ─────────────────────────────────
export function createGraph() {
  const checkpointer = new MemorySaver();

  const graph = new StateGraph(AgentState)
    .addNode("orchestrator", orchestratorNode)
    .addNode("data", dataAgentNode)
    .addNode("business", businessAgentNode)
    .addNode("pm", pmAgentNode)
    .addEdge(START, "orchestrator")
    .addConditionalEdges("orchestrator", routeAfterOrchestrator, {
      data: "data",
      business: "business",
      pm: "pm",
      [END]: END,
    })
    .addEdge("data", "business")
    .addEdge("business", "pm")
    .addEdge("pm", "orchestrator")
    .compile({ checkpointer });

  return graph;
}

// ── Streaming Helper ──────────────────────────────
export async function* streamWorkflow(query: string) {
  const graph = createGraph();
  const config = { configurable: { thread_id: `gtm-${Date.now()}` } };

  // Emit initial state
  yield { event: "orchestrator_start", data: { query } };

  for await (const chunk of await graph.stream(
    { query },
    { ...config, streamMode: "updates" as const }
  )) {
    // chunk is { nodeName: { ...stateUpdates } }
    const [nodeName, update] = Object.entries(chunk)[0];
    yield {
      event: `${nodeName}_update`,
      data: update,
    };
  }

  // Get final state for summary
  const finalState = await graph.invoke({ query }, config);
  yield {
    event: "workflow_complete",
    data: {
      summary: finalState.summary,
      dataOutput: finalState.dataOutput,
      businessOutput: finalState.businessOutput,
      pmOutput: finalState.pmOutput,
    },
  };
}
