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
const DATA_PROMPT = `You are a market intelligence agent. Given a GTM scenario, produce a structured market analysis:

1. TAM (total addressable market) estimate with growth rate
2. Top 3-5 competitors with market share
3. Key decision makers identified (count and roles)
4. Relevant industry trends

Format in clear sections. Be specific with numbers when possible.`;

const BUSINESS_PROMPT = `You are a business strategy agent. Given market intelligence data, produce a strategic GTM plan:

1. Primary target segment — who to sell to first and why
2. Buyer persona — title, pain points, motivation, decision triggers
3. Channel strategy — which channels to use and why
4. Competitive positioning — how to differentiate

Focus on actionable, specific recommendations.`;

const PM_PROMPT = `You are a project management agent. Given a business strategy, produce an execution plan:

1. 4-6 week sprint timeline with weekly milestones
2. Key activities per week
3. Resource requirements and budget estimate
4. Success metrics and KPIs

Be concrete. Include numbers. This should feel like a real project plan.`;

const ORCHESTRATOR_PROMPT = `You are a GTM orchestrator. Given the outputs from Data, Business, and PM agents, produce a concise executive summary (3-4 sentences) that captures:

1. The market opportunity
2. The strategic approach
3. The expected timeline and outcome

Make it punchy — this is what the CEO reads.`;

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
