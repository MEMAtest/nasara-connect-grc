
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
import { upsertEntityLink } from "@/lib/server/entity-link-store";
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
  customContent: Record<string, unknown>;
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

  const sectionClauses = (body.sectionClauses ?? {}) as Record<string, string[]>;
  const requestedClauseIds: string[] = [];
  Object.values(sectionClauses).forEach((ids) => {
    if (!Array.isArray(ids)) return;
    ids.forEach((id) => {
      if (typeof id === "string") requestedClauseIds.push(id);
    });
  });

  const mandatoryClauseIds = Array.isArray(template.mandatoryClauses) ? template.mandatoryClauses : [];
  const clauseIdsInOrder = Array.from(new Set([...requestedClauseIds, ...mandatoryClauseIds]));
  const selectedClauses = clauseIdsInOrder
    .map((id) => primaryClauses.find((clause) => clause.id === id))
    .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));

  const approvals = body.approvals;
  if (!approvals) {
    return NextResponse.json({ error: "Approvals payload missing" }, { status: 400 });
  }

  const detailLevel = typeof body.detailLevel === "string" ? body.detailLevel : undefined;

  const customContent = {
    firmProfile: body.firmProfile ?? {},
    sectionClauses,
    sectionOptions: body.sectionOptions ?? {},
    sectionNotes: body.sectionNotes ?? {},
    clauseVariables: body.clauseVariables ?? {},
    detailLevel,
    approvals,
  };

  const suggestedMappings = Array.isArray((template as PolicyTemplate & { suggestedMappings?: unknown }).suggestedMappings)
    ? ((template as PolicyTemplate & { suggestedMappings?: Array<{ toType: string; toId: string; metadata?: Record<string, unknown> }> })
        .suggestedMappings ?? [])
    : [];

  const persistSuggestedMappings = async (policyId: string) => {
    if (!suggestedMappings.length) return;
    const allowed = new Set(["risk", "control", "training", "evidence"]);
    await Promise.all(
      suggestedMappings
        .filter((mapping) => allowed.has(mapping.toType) && typeof mapping.toId === "string" && mapping.toId.trim().length > 0)
        .map((mapping) =>
          upsertEntityLink({
            organizationId: DEFAULT_ORGANIZATION_ID,
            fromType: "policy",
            fromId: policyId,
            toType: mapping.toType as "risk" | "control" | "training" | "evidence",
            toId: mapping.toId.trim(),
            metadata: mapping.metadata ?? {},
          }),
        ),
    );
  };

  try {
    const created = await createPolicy(DEFAULT_ORGANIZATION_ID, {
      id: body.id,
      code: template.code,
      name: template.name,
      description: template.description,
      permissions,
      template,
      clauses: selectedClauses,
      customContent,
      approvals,
      status: "draft",
    });
    try {
      await persistSuggestedMappings(created.id);
    } catch (linkError) {
      console.error("Failed to persist suggested policy mappings (non-blocking):", linkError);
    }
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating policy, falling back to mock store:", error);
    const fallback = buildFallbackPolicy({
      id: body.id,
      template,
      permissions,
      clauses: selectedClauses,
      customContent,
      approvals,
    });
    fallbackPolicies.unshift(fallback);
    try {
      await persistSuggestedMappings(fallback.id);
    } catch (linkError) {
      console.error("Failed to persist suggested policy mappings for fallback (non-blocking):", linkError);
    }
    return NextResponse.json(fallback, { status: 201 });
  }
}
