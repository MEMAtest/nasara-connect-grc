import { NextRequest, NextResponse } from "next/server";
import { requireRole, type OrganizationRole } from "@/lib/rbac";
import {
  countOrganizationOwners,
  getOrganizationById,
  getOrganizationMemberById,
  getUserById,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/lib/server/organization-store";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { roleChangeEmailTemplate, memberRemovedEmailTemplate } from "@/lib/email-templates";

const ROLE_VALUES: OrganizationRole[] = ["owner", "admin", "member", "viewer"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  const { organizationId, memberId } = await params;
  const { auth, role: callerRole, error } = await requireRole("admin", organizationId);
  if (error) return error;

  const body = await request.json();
  const role = body?.role as OrganizationRole;
  if (!ROLE_VALUES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Only owners can assign "owner" or "admin" roles — prevents privilege escalation
  if ((role === "owner" || role === "admin") && callerRole !== "owner") {
    return NextResponse.json(
      { error: "Only owners can assign owner or admin roles" },
      { status: 403 },
    );
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

  // Send role change email (fire-and-forget)
  if (isEmailConfigured()) {
    void (async () => {
      try {
        const [user, org] = await Promise.all([
          getUserById(existing.user_id),
          getOrganizationById(organizationId),
        ]);
        if (user?.email) {
          const template = roleChangeEmailTemplate({
            organizationName: org?.name ?? "your organization",
            newRole: role,
          });
          await sendEmail({ to: user.email, ...template });
        }
      } catch {
        // Email sending is best-effort — don't block role update
      }
    })();
  }

  await logAuditEvent(pool, {
    entityType: 'organization_member',
    entityId: memberId,
    action: 'updated',
    actorId: auth.userId ?? 'unknown',
    organizationId: organizationId,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  const { organizationId, memberId } = await params;
  const { auth, error } = await requireRole("admin", organizationId);
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

  // Send removal email (fire-and-forget)
  if (isEmailConfigured()) {
    void (async () => {
      try {
        const [user, org] = await Promise.all([
          getUserById(existing.user_id),
          getOrganizationById(organizationId),
        ]);
        if (user?.email) {
          const template = memberRemovedEmailTemplate({
            organizationName: org?.name ?? "your organization",
          });
          await sendEmail({ to: user.email, ...template });
        }
      } catch {
        // Email sending is best-effort — don't block member removal
      }
    })();
  }

  await logAuditEvent(pool, {
    entityType: 'organization_member',
    entityId: memberId,
    action: 'deleted',
    actorId: auth.userId ?? 'unknown',
    organizationId: organizationId,
  });

  return NextResponse.json({ success: true });
}
