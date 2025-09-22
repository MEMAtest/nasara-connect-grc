import { NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";
import { getPolicyPermissions, upsertPolicyPermissions } from "@/lib/server/policy-permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId: paramOrgId } = await params;
  const organizationId = paramOrgId ?? DEFAULT_ORGANIZATION_ID;
  const permissions = await getPolicyPermissions(organizationId);
  return NextResponse.json(permissions);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId: paramOrgId } = await params;
  const organizationId = paramOrgId ?? DEFAULT_ORGANIZATION_ID;
  const body = await request.json();
  const permissions = { ...DEFAULT_PERMISSIONS, ...body };
  const updated = await upsertPolicyPermissions(organizationId, permissions);
  return NextResponse.json(updated);
}
