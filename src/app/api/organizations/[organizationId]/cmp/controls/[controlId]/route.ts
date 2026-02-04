import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { getCmpControl } from "@/lib/server/cmp-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { auth, error } = await requireAuth();
  if (error) return error;
  const { organizationId, controlId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const control = await getCmpControl(organizationId, controlId);
  if (!control) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  return NextResponse.json(control);
}
