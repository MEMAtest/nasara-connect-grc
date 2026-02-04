import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getOpenRouterApiKey } from "@/lib/openrouter";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export async function GET(request: NextRequest) {
  const { success, headers: rlHeaders } = await checkRateLimit(request, { requests: 10, window: "60 s" });
  if (!success) return rateLimitExceeded(rlHeaders);

  const { error } = await requireRole("member");
  if (error) return error;

  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect AI Assistant Health",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: "system", content: "healthcheck" }, { role: "user", content: "ping" }],
        max_tokens: 4,
        temperature: 0,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      return NextResponse.json({ ok: false, error: "Upstream failed", details }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
