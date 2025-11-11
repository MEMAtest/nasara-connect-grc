
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";
import { getApplicableClauses, getTemplateByCode } from "@/lib/policies/templates";
import {
  createPolicy,
  getPoliciesForOrganization,
  type StoredPolicy,
} from "@/lib/server/policy-store";
import type { FirmPermissions } from "@/lib/policies";
import type { PolicyClause, PolicyTemplate } from "@/lib/policies/templates";

const fallbackPolicies: StoredPolicy[] = [];

function nowIso() {
  return new Date().toISOString();
}

function buildFallbackPolicy(input: {
  id?: string;
  template: PolicyTemplate;
  permissions: FirmPermissions;
  clauses: PolicyClause[];
  customContent: Record<string, string>;
  approvals: StoredPolicy["approvals"];
}): StoredPolicy {
  const timestamp = nowIso();
  return {
    id: input.id ?? randomUUID(),
    organizationId: DEFAULT_ORGANIZATION_ID,
    code: input.template.code,
    name: input.template.name,
    description: input.template.description,
    permissions: input.permissions,
    template: input.template,
    clauses: input.clauses,
    customContent: input.customContent,
    approvals: {
      requiresSMF: input.approvals.requiresSMF,
      smfRole: input.approvals.smfRole ?? null,
      requiresBoard: input.approvals.requiresBoard,
      boardFrequency: input.approvals.boardFrequency,
      additionalApprovers: input.approvals.additionalApprovers ?? [],
    },
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function GET() {
  try {
    const policies = await getPoliciesForOrganization(DEFAULT_ORGANIZATION_ID);
    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching policies, returning fallback:", error);
    return NextResponse.json(fallbackPolicies);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const templateCode: string | undefined = body.templateCode;
  const template = templateCode ? getTemplateByCode(templateCode) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 400 });
  }

  const permissions = { ...DEFAULT_PERMISSIONS, ...(body.permissions ?? {}) };
  const primaryClauses = getApplicableClauses(template.code, permissions);
  const selectedClauses = Array.isArray(body.clauses) && body.clauses.length
    ? primaryClauses.filter((clause) => body.clauses.includes(clause.id))
    : primaryClauses.filter((clause) => clause.isMandatory);

  const approvals = body.approvals;
  if (!approvals) {
    return NextResponse.json({ error: "Approvals payload missing" }, { status: 400 });
  }

  try {
    const created = await createPolicy(DEFAULT_ORGANIZATION_ID, {
      id: body.id,
      code: template.code,
      name: template.name,
      description: template.description,
      permissions,
      template,
      clauses: selectedClauses,
      customContent: body.customContent ?? {},
      approvals,
      status: "draft",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating policy, falling back to mock store:", error);
    const fallback = buildFallbackPolicy({
      id: body.id,
      template,
      permissions,
      clauses: selectedClauses,
      customContent: body.customContent ?? {},
      approvals,
    });
    fallbackPolicies.unshift(fallback);
    return NextResponse.json(fallback, { status: 201 });
  }
}
