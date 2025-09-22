import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    description?: string;
    category?: string;
  };

  const title = body.title ?? "risk";
  const category = body.category ?? "operational";

  return NextResponse.json({
    drivers: `Key factors increasing ${title.toLowerCase()} exposure include manual processes and third-party dependencies`,
    impacts: `Potential customer detriment, regulatory scrutiny, and financial loss if ${title.toLowerCase()} materialises`,
    similar: `${category} risks logged in the past quarter show comparable characteristics`,
    controls: "Strengthen preventative controls, formalise monitoring dashboards, and ensure rapid escalation pathways",
  });
}
