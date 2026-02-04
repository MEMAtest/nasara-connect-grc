import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import type { EntityType } from "@/lib/server/entity-link-store";
import { deleteEntityLink, listEntityLinks, upsertEntityLink } from "@/lib/server/entity-link-store";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";

const ALLOWED_ENTITY_TYPES: ReadonlySet<EntityType> = new Set(["policy", "risk", "control", "training", "evidence"]);

function isEntityType(value: unknown): value is EntityType {
  return typeof value === "string" && ALLOWED_ENTITY_TYPES.has(value as EntityType);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { policyId } = await params;
  const links = await listEntityLinks({
    organizationId: auth.organizationId,
    fromType: "policy",
    fromId: policyId,
  });
  return NextResponse.json({ links });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { policyId } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  if (!isEntityType(body.toType) || typeof body.toId !== "string" || body.toId.trim().length === 0) {
    return NextResponse.json({ error: "Invalid link payload" }, { status: 400 });
  }

  const metadata = typeof body.metadata === "object" && body.metadata !== null ? (body.metadata as Record<string, unknown>) : {};

  const link = await upsertEntityLink({
    organizationId: auth.organizationId,
    fromType: "policy",
    fromId: policyId,
    toType: body.toType,
    toId: body.toId.trim(),
    metadata,
  });

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const { auth, error } = await requireRole("admin");
  if (error) return error;
  const { policyId } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  if (!isEntityType(body.toType) || typeof body.toId !== "string" || body.toId.trim().length === 0) {
    return NextResponse.json({ error: "Invalid link payload" }, { status: 400 });
  }

  const deleted = await deleteEntityLink({
    organizationId: auth.organizationId,
    fromType: "policy",
    fromId: policyId,
    toType: body.toType,
    toId: body.toId.trim(),
  });

  await logAuditEvent(pool, {
    entityType: 'policy_link',
    entityId: policyId,
    action: 'deleted',
    actorId: auth.userId ?? 'unknown',
    organizationId: auth.organizationId,
  });

  return NextResponse.json({ success: deleted });
}
