import { NextResponse } from "next/server";
import { listBackLinks } from "@/lib/server/entity-link-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { organizationId, controlId } = await params;
  const links = await listBackLinks({ organizationId, toType: "control", toId: controlId });
  const policyLinks = links.filter((link) => link.fromType === "policy");
  return NextResponse.json({ links: policyLinks });
}

