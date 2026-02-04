import { NextRequest, NextResponse } from "next/server";
import { requireRole, type OrganizationRole } from "@/lib/rbac";
import {
  countOrganizationOwners,
  getOrganizationMemberById,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/lib/server/organization-store";

const ROLE_VALUES: OrganizationRole[] = ["owner", "admin", "member", "viewer"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  const { organizationId, memberId } = await params;
  const { error } = await requireRole("admin", organizationId);
  if (error) return error;

  const body = await request.json();
  const role = body?.role as OrganizationRole;
  if (!ROLE_VALUES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await getOrganizationMemberById(organizationId, memberId);
  if (!existing) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (existing.role === "owner" && role !== "owner") {
    const ownerCount = await countOrganizationOwners(organizationId);
    if (ownerCount <= 1) {
      return NextResponse.json({ error: "At least one owner is required" }, { status: 400 });
    }
  }

  const updated = await updateOrganizationMemberRole(organizationId, memberId, role);
  if (!updated) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  const { organizationId, memberId } = await params;
  const { error } = await requireRole("admin", organizationId);
  if (error) return error;

  const existing = await getOrganizationMemberById(organizationId, memberId);
  if (!existing) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (existing.role === "owner") {
    const ownerCount = await countOrganizationOwners(organizationId);
    if (ownerCount <= 1) {
      return NextResponse.json({ error: "Cannot remove the last owner" }, { status: 400 });
    }
  }

  const removed = await removeOrganizationMember(organizationId, memberId);
  if (!removed) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
