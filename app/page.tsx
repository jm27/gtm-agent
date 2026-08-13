"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { scenarios, type Scenario, type AgentOutput } from "@/lib/scenarios";

type Step = "idle" | "orchestrating" | "running" | "done";

interface AgentState {
  id: string;
  label: string;
  icon: string;
  color: string;
  status: "queued" | "active" | "done";
  output: string;
  streaming: boolean;
}

const AGENTS = [
  { id: "data", label: "Data Agent", icon: "📊", color: "data" },
  { id: "business", label: "Business Agent", icon: "💼", color: "business" },
  { id: "pm", label: "Project Agent", icon: "📋", color: "pm" },
];

function MarkdownOutput({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [selectedId, setSelectedId] = useState<string>("healthcare");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [orchestratorMessage, setOrchestratorMessage] = useState("");
  const [summary, setSummary] = useState("");

  const reset = useCallback(() => {
    setStep("idle");
    setAgents([]);
    setOrchestratorMessage("");
    setSummary("");
    setSelectedScenario(null);
  }, []);

  const streamText = useCallback((fullText: string, callback: (partial: string) => void, onDone: () => void) => {
    let i = 0;
    const chars = fullText.split("");
    const interval = setInterval(() => {
      i += Math.floor(Math.random() * 3) + 1;
      if (i >= chars.length) {
        clearInterval(interval);
        callback(fullText);
        onDone();
        return;
      }
      callback(chars.slice(0, i).join(""));
    }, 15);
  }, []);

  const useCustom = !!customPrompt.trim();

  const runWorkflow = useCallback(async () => {
    const scenario = scenarios.find(s => s.id === selectedId) || scenarios[0];
    const query = useCustom ? customPrompt.trim() : scenario.title;
    setSelectedScenario(scenario);
    setStep("orchestrating");
    setAgents(AGENTS.map(a => ({ ...a, status: "queued" as const, output: "", streaming: false })));
    setSummary("");

    // Try live LangGraph backend first
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        // Live mode — stream SSE from LangGraph
        setOrchestratorMessage(`Analyzing: "${query}" — LangGraph orchestrator initializing...`);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (!reader) throw new Error("No stream");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "done") continue;

            try {
              const parsed = JSON.parse(data);
              const { event, data: eventData } = parsed;

              if (event === "orchestrator_start") {
                setOrchestratorMessage(`Orchestrator initialized — delegating to agents...`);
              }

              if (event === "orchestrator_update") {
                setStep("running");
              }

              // Map LangGraph node updates to agent cards
              const agentMap: Record<string, string> = {
                data_update: "data",
                business_update: "business",
                pm_update: "pm",
              };

              const agentId = agentMap[event];
              if (agentId && eventData) {
                const content = eventData.dataOutput || eventData.businessOutput || eventData.pmOutput || "";
                setAgents(prev => prev.map(a => {
                  if (a.id === agentId) {
                    const isNew = a.status === "queued";
                    return { ...a, status: "active", output: "", streaming: true };
                  }
                  if (a.id === agentId) {
                    const done = Object.values(eventData).some((v: any) => typeof v === "string" && v.length > 200);
                    return { ...a, status: done ? "done" : "active", output: "", streaming: !done };
                  }
                  return a;
                }));
              }

              if (event === "error") {
                const msg = eventData?.message || "Workflow failed";
                console.error("[GTM-Agent] Frontend received error:", msg);
                setOrchestratorMessage(`❌ Error: ${msg}`);
                setStep("done");
              }

              if (event === "workflow_complete") {
                const { summary: ws, dataOutput, businessOutput, pmOutput } = eventData;
                setAgents([
                  { id: "data", label: "Data Agent", icon: "📊", color: "data", status: "done", output: dataOutput || "", streaming: false },
                  { id: "business", label: "Business Agent", icon: "💼", color: "business", status: "done", output: businessOutput || "", streaming: false },
                  { id: "pm", label: "Project Agent", icon: "📋", color: "pm", status: "done", output: pmOutput || "", streaming: false },
                ]);
                setSummary(ws || "");
                setStep("done");
                setOrchestratorMessage("Workflow complete — all agents finished ✓");
              }
            } catch { /* skip parse errors */ }
          }
        }
        return;
      }
    } catch {
      // API not available — fall through to demo mode
    }

    // Demo mode — simulated responses
    setOrchestratorMessage(`Analyzing: "${scenario.title}" — delegating to specialized agents...`);

    await new Promise(r => setTimeout(r, 500));

    setOrchestratorMessage(`Analyzing: "${scenario.title}" — delegating to specialized agents... ✓`);
    setStep("running");

    // Run agents sequentially with streaming
    const runAgent = (index: number) => {
        if (index >= AGENTS.length) {
          // All done — orchestrator summarizes
          setTimeout(() => {
            setStep("done");
            setSummary(scenario.summary);
          }, 600);
          return;
        }

        const agentDef = AGENTS[index];
        const output = scenario.outputs.find(o => o.agent === agentDef.id) as AgentOutput;

        setAgents(prev => prev.map(a => a.id === agentDef.id ? { ...a, status: "active", output: "" } : a));

        setTimeout(() => {
          streamText(
            output.content,
            (partial) => {
              setAgents(prev => prev.map(a => a.id === agentDef.id ? { ...a, output: partial, streaming: true } : a));
            },
            () => {
              setAgents(prev => prev.map(a => a.id === agentDef.id ? { ...a, status: "done", streaming: false, output: output.content } : a));
              setTimeout(() => runAgent(index + 1), 500);
            }
          );
        }, 600);
      };

      runAgent(0);
  }, [selectedId, customPrompt, useCustom, streamText]);

  return (
    <div className="app-container">
      <header className="app-header">
        <span className="tagline">Multi-Agent Orchestration</span>
        <h1>GTM Agent</h1>
        <p className="subtitle text-body-lg">An AI-powered orchestration engine that coordinates specialized agents to build go-to-market strategies — market intel, personas, channel plans, and execution roadmaps.</p>
      </header>

      {step === "idle" && (
        <>
          <div className="scenario-grid">
            {scenarios.map(s => (
              <div
                key={s.id}
                className={`scenario-card ${selectedId === s.id && !useCustom ? "selected" : ""}`}
                onClick={() => { setSelectedId(s.id); setCustomPrompt(""); }}
              >
                <div className="scenario-icon">{s.icon}</div>
                <div className="scenario-title">{s.title}</div>
                <div className="scenario-desc">{s.description}</div>
              </div>
            ))}
          </div>

          <div className="custom-input-area">
            <textarea
              value={customPrompt}
              onChange={(e) => { setCustomPrompt(e.target.value); if (e.target.value.trim()) setSelectedId(""); }}
              placeholder='Or describe your own: "I need to find leads for a developer tool targeting mid-market fintech companies in Europe..."'
            />
          </div>

          <button className="run-btn" onClick={runWorkflow}>
            {useCustom ? "⚡ Run Custom Workflow" : `▶ Run "${scenarios.find(s => s.id === selectedId)?.title}"`}
          </button>
        </>
      )}

      {(step === "orchestrating" || step === "running" || step === "done") && (
        <>
          {/* Orchestrator status */}
          {orchestratorMessage && (
            <div className="workflow-status">
              <div className="workflow-step">
                <div className={`step-indicator ${step === "orchestrating" ? "active" : "done"}`}>
                  {step === "orchestrating" ? "⚡" : "✓"}
                </div>
                <div>
                  <strong style={{ color: "var(--orchestrator)" }}>Orchestrator</strong>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{orchestratorMessage}</div>
                </div>
              </div>

              {agents.map((agent) => (
                <div key={agent.id} className="workflow-step">
                  <div className={`step-indicator ${agent.status === "active" ? "active" : agent.status === "done" ? "done" : "queued"}`}>
                    {agent.status === "done" ? "✓" : agent.status === "active" ? agent.icon : "○"}
                  </div>
                  <div>
                    <strong style={{ color: agent.status === "active" ? `var(--agent-${agent.color})` : agent.status === "done" ? `var(--agent-${agent.color})` : "var(--text-muted)" }}>
                      {agent.label}
                    </strong>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {agent.status === "queued" ? "Waiting..." : agent.status === "active" ? "Working..." : "Complete"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agent output cards */}
          <div className="agent-output">
            {agents.filter(a => a.status === "active" || a.status === "done").map((agent) => (
              <div key={agent.id} className="agent-card">
                <div className={`agent-card-header ${agent.color}`}>
                  <span>{agent.icon}</span>
                  <span>{agent.label}</span>
                  {agent.status === "active" && <span className="streaming-label">streaming<span className="streaming-cursor" /></span>}
                </div>
                <div className="agent-card-body">
                  {agent.output ? (
                    <div>
                      <MarkdownOutput content={agent.output} />
                      {agent.streaming && <span className="streaming-cursor" aria-hidden="true" />}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)" }}>Generating...</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Done state */}
          {step === "done" && summary && (
            <div className="agent-card" style={{ marginBottom: "1rem" }}>
              <div className="agent-card-header orchestrator">
                <span>🧠</span>
                <span>Orchestrator Summary</span>
              </div>
              <div className="agent-card-body">
                <MarkdownOutput content={summary} />
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="done-actions">
              <button className="primary" onClick={reset}>↩ Try Another Scenario</button>
              <button onClick={reset}>🔄 Re-run</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
