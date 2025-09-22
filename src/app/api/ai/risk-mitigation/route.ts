import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { risk } = (await request.json()) as { risk: { title?: string; category?: string } };
  const title = risk?.title ?? "risk";
  const category = risk?.category ?? "operational";

  return NextResponse.json({
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
}
