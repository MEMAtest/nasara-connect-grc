import { NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { updatePolicy, getPolicyById, deletePolicy } from "@/lib/server/policy-store";

const ALLOWED_STATUSES = new Set(["draft", "in_review", "approved"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const { policyId } = await params;
  const policy = await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);
  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }
  return NextResponse.json(policy);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const { policyId } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    updates.name = body.name;
  }

  if (body.description !== undefined) {
    updates.description = body.description;
  }

  if (body.permissions !== undefined) {
    updates.permissions = body.permissions;
  }

  if (body.clauses !== undefined) {
    updates.clauses = body.clauses;
  }

  if (body.customContent !== undefined) {
    updates.customContent = body.customContent;
  }

  if (body.approvals !== undefined) {
    updates.approvals = body.approvals;
  }

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    const current = await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);
    if (!current) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }
    return NextResponse.json(current);
  }

  const updated = await updatePolicy(DEFAULT_ORGANIZATION_ID, policyId, updates);
  if (!updated) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const { policyId } = await params;
  const deleted = await deletePolicy(DEFAULT_ORGANIZATION_ID, policyId);
  if (!deleted) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
