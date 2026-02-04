import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { listOrganizationMembers } from "@/lib/server/organization-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { error } = await requireRole("member", organizationId);
  if (error) return error;

  const members = await listOrganizationMembers(organizationId);
  return NextResponse.json(members);
}
