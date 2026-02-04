import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getPolicyFirmProfile, upsertPolicyFirmProfile } from "@/lib/server/policy-firm-profile";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { organizationId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const profile = await getPolicyFirmProfile(organizationId);
  if (!profile) {
    return NextResponse.json({ error: "Policy firm profile not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { organizationId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const body = await request.json();
  const profile = await upsertPolicyFirmProfile(organizationId, {
    firmProfile: body.firmProfile ?? body.firm_profile,
    governanceDefaults: body.governanceDefaults ?? body.governance_defaults,
    linkedProjectIds: body.linkedProjectIds ?? body.linked_project_ids,
  });
  return NextResponse.json(profile);
}
