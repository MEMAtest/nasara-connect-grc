import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

const fallbackMitigation = (title: string, category: string) => ({
  preventiveControls: [
    `Enhance ${category} control testing cadence`,
    `Introduce guardrails to minimise ${title.toLowerCase()} likelihood`,
    "Embed automated alerts for leading indicators",
  ],
  detectiveControls: [
    "Deploy real-time dashboards with threshold alerts",
    "Expand sampling of high-risk scenarios",
  ],
  correctiveActions: [
    "Activate incident response playbook and notify stakeholders",
    "Conduct root-cause analysis and capture lessons learned",
  ],
  regulatoryReferences: ["SYSC 4", "SYSC 6"],
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

  const { risk } = (await request.json()) as { risk: { title?: string; category?: string; description?: string } };
  const title = risk?.title ?? "risk";
  const category = risk?.category ?? "operational";
  const description = risk?.description ?? "";

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(fallbackMitigation(title, category));
  }

  try {
    const prompt = [
      "You are a compliance risk advisor for FCA-regulated firms.",
      "Return JSON with keys: preventiveControls, detectiveControls, correctiveActions, regulatoryReferences.",
      "Each list should contain 2-4 short items.",
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
        "X-Title": "Nasara Connect Risk Mitigation",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "Respond ONLY with JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 320,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json(fallbackMitigation(title, category));
    }

    const data = (await upstream.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) {
      return NextResponse.json(fallbackMitigation(title, category));
    }

    return NextResponse.json({
      preventiveControls: Array.isArray(parsed.preventiveControls)
        ? parsed.preventiveControls
        : fallbackMitigation(title, category).preventiveControls,
      detectiveControls: Array.isArray(parsed.detectiveControls)
        ? parsed.detectiveControls
        : fallbackMitigation(title, category).detectiveControls,
      correctiveActions: Array.isArray(parsed.correctiveActions)
        ? parsed.correctiveActions
        : fallbackMitigation(title, category).correctiveActions,
      regulatoryReferences: Array.isArray(parsed.regulatoryReferences)
        ? parsed.regulatoryReferences
        : fallbackMitigation(title, category).regulatoryReferences,
    });
  } catch (error) {
    return NextResponse.json(fallbackMitigation(title, category));
  }
}
