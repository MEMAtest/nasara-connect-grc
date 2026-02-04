import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { getCmpControls } from "@/lib/server/cmp-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { auth, error } = await requireAuth();
  if (error) return error;
  const { organizationId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const controls = await getCmpControls(organizationId);
  return NextResponse.json(controls);
}
