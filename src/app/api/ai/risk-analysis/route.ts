import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

const fallbackAnalysis = (title: string, category: string) => ({
  drivers: `Key factors increasing ${title.toLowerCase()} exposure include manual processes and third-party dependencies`,
  impacts: `Potential customer detriment, regulatory scrutiny, and financial loss if ${title.toLowerCase()} materialises`,
  similar: `${category} risks logged in the past quarter show comparable characteristics`,
  controls: "Strengthen preventative controls, formalise monitoring dashboards, and ensure rapid escalation pathways",
});

function extractJson(content: string) {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    category?: string;
  };

  const title = body.title ?? "risk";
  const description = body.description ?? "";
  const category = body.category ?? "operational";

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(fallbackAnalysis(title, category));
  }

  try {
    const prompt = [
      "You are a compliance risk analyst for FCA-regulated firms.",
      "Return a JSON object with keys: drivers, impacts, similar, controls.",
      "Each value should be a short, plain-English sentence.",
      `Risk title: ${title}`,
      description ? `Risk description: ${description}` : null,
      `Risk category: ${category}`,
    ]
      .filter(Boolean)
      .join("\n");

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect Risk Analysis",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "Respond ONLY with JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json(fallbackAnalysis(title, category));
    }

    const data = (await upstream.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) {
      return NextResponse.json(fallbackAnalysis(title, category));
    }

    return NextResponse.json({
      drivers: parsed.drivers ?? fallbackAnalysis(title, category).drivers,
      impacts: parsed.impacts ?? fallbackAnalysis(title, category).impacts,
      similar: parsed.similar ?? fallbackAnalysis(title, category).similar,
      controls: parsed.controls ?? fallbackAnalysis(title, category).controls,
    });
  } catch (error) {
    return NextResponse.json(fallbackAnalysis(title, category));
  }
}
