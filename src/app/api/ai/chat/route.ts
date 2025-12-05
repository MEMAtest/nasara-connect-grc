import { NextResponse } from "next/server";
import { buildAssistantContext } from "@/lib/ai/context";
import { fetchPolicyContext } from "@/lib/ai/policies";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

type Mode = "qa" | "draft" | "explain" | "insights";

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  mode?: Mode;
  context?: {
    path?: string;
    firmId?: string;
    policyId?: string;
    runId?: string;
    cmpId?: string;
    selection?: string;
  };
  stream?: boolean;
}

type UpstreamStreamChunk =
  | { choices?: Array<{ delta?: { content?: string } }> }
  | { choices?: Array<{ message?: { content?: string } }> };

function buildSystemPrompt(mode: Mode, context?: ChatRequestBody["context"]): string {
  const base = `You are Nasara Connect's AI Compliance Assistant.
- Be concise, structured, and action-oriented (bullets are fine).
- Ground answers in FCA/UK financial services practice. If unsure, ask clarifying questions.
- When drafting, keep it professional and ready to paste.
- Always prefer practical next steps, evidence to retain, and control suggestions when relevant.
- Do NOT invent data; if context is missing, ask for it.`;

  const modeDirectives: Record<Mode, string> = {
    qa: "Answer compliance questions with short, direct guidance and optional next steps.",
    draft: "Draft policy or clause text; keep headings and bullet formatting clean.",
    explain: "Explain clearly: what it is, why it matters, required actions, and evidence to keep.",
    insights:
      "Generate concise insights, risks, and next best actions based on the provided context.",
  };

  const contextLine = context
    ? `Context:
- path: ${context.path ?? "unknown"}
- firm: ${context.firmId ?? "unknown"}
- policy: ${context.policyId ?? "unknown"}
- run: ${context.runId ?? "unknown"}
- cmp: ${context.cmpId ?? "unknown"}
- selection: ${context.selection ?? "none"}`
    : "Context: not provided";

  return `${base}

Mode: ${modeDirectives[mode]}

${contextLine}`;
}

export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY. Add it to your environment." },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode: Mode = body.mode ?? "qa";
  const lastUserMessage =
    [...(body.messages ?? [])].reverse().find((m) => m.role === "user")?.content ?? "";
  const storedPolicy = body.context?.policyId
    ? await fetchPolicyContext(body.context.policyId)
    : null;

  const retrievedContext = buildAssistantContext(
    lastUserMessage,
    body.context?.selection,
    storedPolicy?.code ?? body.context?.policyId,
    body.context?.runId,
    storedPolicy ?? undefined
  );
  const systemPrompt = [buildSystemPrompt(mode, body.context), retrievedContext.text].filter(Boolean).join("\n\n");

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...(body.messages ?? []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  const wantsStream = body.stream ?? true;

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect AI Assistant",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 800,
        top_p: 1,
        stream: wantsStream,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error("OpenRouter error", upstream.status, errorText);
      return NextResponse.json(
        { error: "Upstream model call failed", details: errorText },
        { status: 502 }
      );
    }

    // Non-streaming path (used by tests or explicit stream:false)
    if (!wantsStream) {
      const data = (await upstream.json()) as {
        choices?: Array<{ message?: { role: string; content: string } }>;
      };
      const assistantMessage = data.choices?.[0]?.message;
      if (!assistantMessage?.content) {
        return NextResponse.json(
          { error: "No content returned from model" },
          { status: 502 }
        );
      }
      return NextResponse.json({
        message: {
          role: "assistant",
          content: assistantMessage.content,
        },
        citations: retrievedContext.citations,
      });
    }

    // Streaming path: proxy the model's streamed chunks to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader();
        const decoder = new TextDecoder();
        let content = "";

        if (!reader) {
          controller.error(new Error("No stream from upstream"));
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data:")) continue;
              const json = trimmed.replace(/^data:\s*/, "");
              try {
                const parsed = JSON.parse(json) as UpstreamStreamChunk;
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  content += delta;
                  controller.enqueue(delta);
                }
              } catch {
                // ignore malformed chunk
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Assistant-Citations": JSON.stringify(retrievedContext.citations),
      },
    });
  } catch (error) {
    console.error("AI chat route error", error);
    return NextResponse.json(
      { error: "Failed to contact model", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
