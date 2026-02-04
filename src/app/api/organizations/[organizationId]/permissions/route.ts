import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";
import { getPolicyPermissions, upsertPolicyPermissions } from "@/lib/server/policy-permissions";

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
  const permissions = await getPolicyPermissions(organizationId);
  return NextResponse.json(permissions);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { auth, error } = await requireAuth();
  if (error) return error;
  const { organizationId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const body = await request.json();
  const permissions = { ...DEFAULT_PERMISSIONS, ...body };
  const updated = await upsertPolicyPermissions(organizationId, permissions);
  return NextResponse.json(updated);
}
