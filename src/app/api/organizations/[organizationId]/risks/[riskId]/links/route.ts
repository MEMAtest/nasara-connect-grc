import { NextResponse } from "next/server";
import { listBackLinks } from "@/lib/server/entity-link-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  const { organizationId, riskId } = await params;
  const links = await listBackLinks({ organizationId, toType: "risk", toId: riskId });
  const policyLinks = links.filter((link) => link.fromType === "policy");
  return NextResponse.json({ links: policyLinks });
}

