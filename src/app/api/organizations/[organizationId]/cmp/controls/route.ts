import { NextResponse } from "next/server";
import { getCmpControls } from "@/lib/server/cmp-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params;
  const controls = await getCmpControls(organizationId);
  return NextResponse.json(controls);
}
