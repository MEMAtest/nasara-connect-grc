import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getOrganizationById, updateOrganization } from "@/lib/server/organization-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { error } = await requireRole("member", organizationId);
  if (error) return error;

  const organization = await getOrganizationById(organizationId);
  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json(organization);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { error } = await requireRole("admin", organizationId);
  if (error) return error;

  const body = await request.json();
  const updates = {
    name: typeof body?.name === "string" ? body.name : undefined,
    plan: typeof body?.plan === "string" ? body.plan : undefined,
    settings: body?.settings && typeof body.settings === "object" ? body.settings : undefined,
  };

  const updated = await updateOrganization(organizationId, updates);
  if (!updated) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
