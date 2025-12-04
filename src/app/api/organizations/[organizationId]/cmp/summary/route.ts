import { NextResponse } from "next/server";
import { getCmpSummary } from "@/lib/server/cmp-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params;
  const summary = await getCmpSummary(organizationId);
  return NextResponse.json(summary);
}
