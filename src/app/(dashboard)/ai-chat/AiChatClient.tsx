"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, Sparkles, FileText, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssistantCitations } from "@/components/dashboard/AssistantCitations";
import { useAssistantContext } from "@/components/dashboard/useAssistantContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ type: "cmp" | "policy" | "clause" | "run"; label: string }>;
};

type Mode = "qa" | "draft" | "explain" | "insights";

const MODES: Array<{ id: Mode; label: string; helper: string }> = [
  { id: "qa", label: "Q&A", helper: "Direct answers + next steps" },
  { id: "draft", label: "Drafting", helper: "Policy, clause, or comms text" },
  { id: "explain", label: "Explain", helper: "Reg interpretation & actions" },
  { id: "insights", label: "Insights", helper: "Risks, controls, next-best actions" },
];

const QUICK_PROMPTS = [
  "Summarise Consumer Duty outcomes and key actions for a retail firm.",
  "Draft a monitoring control for high-risk jurisdiction onboarding.",
  "Explain SMCR reasonable steps evidence for SMF16/17.",
  "Generate a remediation plan for a failed KYC sample review.",
];

export function AiChatClient() {
  const pathname = usePathname();
  const assistantCtx = useAssistantContext();
  const [mode, setMode] = useState<Mode>("qa");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I’m your compliance assistant. Ask a question or pick a mode (Q&A, drafting, explain, insights) and I’ll tailor the response.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [extraContext, setExtraContext] = useState("");
  const [policyId, setPolicyId] = useState(assistantCtx.context.policyId ?? "");
  const [runId, setRunId] = useState(assistantCtx.context.runId ?? "");
  const [useContext, setUseContext] = useState(true);

  const stats = useMemo(
    () => ({
      sessions: Math.max(1, Math.ceil(messages.length / 4)),
      resolved: messages.filter((m) => m.role === "assistant").length,
    }),
    [messages]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: nextMessages,
          context: useContext
            ? {
                path: pathname,
                selection: extraContext || undefined,
                policyId: policyId || undefined,
                runId: runId || undefined,
              }
            : undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || "Assistant unavailable");
      }

      const contentType = response.headers.get("content-type") ?? "";
      const citationsHeader = response.headers.get("x-assistant-citations");
      const headerCitations =
        citationsHeader && citationsHeader.startsWith("[")
          ? (JSON.parse(citationsHeader) as ChatMessage["citations"])
          : undefined;
      // Streaming path (text/plain)
      if (contentType.includes("text/plain")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const id = `stream-${Date.now()}`;
        setStreamingId(id);
        // seed empty assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        if (!reader) {
          throw new Error("No response body");
        }
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
              const lastAssistantIndex = updated.findLastIndex((m) => m.role === "assistant");
            if (lastAssistantIndex >= 0) {
              updated[lastAssistantIndex] = { role: "assistant", content: acc };
            } else {
              updated.push({ role: "assistant", content: acc });
            }
            return updated;
          });
        }
        setStreamingId(null);
        if (headerCitations?.length) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastAssistantIndex = updated.findLastIndex((m) => m.role === "assistant");
            if (lastAssistantIndex >= 0) {
              updated[lastAssistantIndex] = {
                ...updated[lastAssistantIndex],
                citations: headerCitations,
              };
            }
            return updated;
          });
        }
      } else {
        // Non-streaming fallback
        const data = (await response.json()) as { message?: ChatMessage; citations?: ChatMessage["citations"] };
        if (data.message) {
          const msg: ChatMessage = data.citations ? { ...data.message, citations: data.citations } : (data.message as ChatMessage);
          setMessages((prev) => [...prev, msg]);
        } else {
          throw new Error("No response from assistant");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask natural language queries, draft docs, get regulatory explanations, and surface insights.
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Live
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessions}</div>
            <p className="text-xs text-muted-foreground">Active this view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Delivered in this session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mode</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{mode}</div>
            <p className="text-xs text-muted-foreground">Tailored responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Context</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{pathname}</div>
            <p className="text-xs text-muted-foreground">Route passed to assistant</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Compliance Assistant
            </CardTitle>
            <CardDescription>
              Natural language queries, drafting, regulatory interpretation, and productivity insights.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {MODES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={item.id === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            {QUICK_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="ghost"
                className="justify-start text-left"
                onClick={() => sendMessage(prompt)}
                disabled={isSending}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 space-y-3 max-h-[520px] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}-${msg.content.slice(0, 10)}`}
                className={`flex gap-3 ${msg.role === "assistant" ? "items-start" : "items-start justify-end"}`}
              >
                {msg.role === "assistant" ? (
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Bot className="h-4 w-4" />
                  </div>
                ) : null}
                <div className="space-y-1">
                  <div
                    className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      msg.role === "assistant"
                        ? "bg-white text-slate-800 border border-slate-200"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && msg.citations ? (
                    <AssistantCitations citations={msg.citations} />
                  ) : null}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                {streamingId ? "Streaming…" : "Thinking…"}
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex items-start gap-2">
            <Input
              placeholder="Ask about regulations, draft a control, or request an insight..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isSending}
              className="flex-1"
            />
            <Button onClick={() => sendMessage()} disabled={isSending || input.trim().length === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-100">
                Path: {pathname}
              </span>
              <label className="flex items-center gap-2 rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                <input
                  type="checkbox"
                  checked={useContext}
                  onChange={(e) => setUseContext(e.target.checked)}
                  className="h-3 w-3"
                />
                Include page context
              </label>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                placeholder="Optional: Policy code/ID (e.g., AML_CTF)"
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <input
                value={runId}
                onChange={(e) => setRunId(e.target.value)}
                placeholder="Optional: Run ID (e.g., run-demo-aml)"
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Optional: add specific context, clauses, or facts to ground the answer."
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-200"
              rows={2}
            />
            <div>
              Mode selected: <span className="font-semibold">{mode.toUpperCase()}</span>. Context chips help ground answers; no data is persisted server-side.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
