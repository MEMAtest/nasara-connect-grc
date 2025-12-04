import { NextResponse } from "next/server";
import { getCmpControl } from "@/lib/server/cmp-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { organizationId, controlId } = await params;
  const control = await getCmpControl(organizationId, controlId);
  if (!control) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  return NextResponse.json(control);
}
