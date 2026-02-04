import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireRole } from "@/lib/rbac";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";
import { getApplicableClauses, getTemplateByCode } from "@/lib/policies/templates";
import {
  createPolicy,
  getPoliciesForOrganization,
  updatePolicy,
  type StoredPolicy,
} from "@/lib/server/policy-store";
import { upsertEntityLink } from "@/lib/server/entity-link-store";
import { initDatabase, createPolicyActivity, pool } from "@/lib/database";
import { sanitizeString } from "@/lib/validation";
import { enhanceClausesWithAi, DEFAULT_POLICY_MODEL } from "@/lib/policies/ai-policy-writer";
import type { FirmPermissions } from "@/lib/policies";
import type { PolicyClause, PolicyTemplate } from "@/lib/policies/templates";
import { createNotification } from "@/lib/server/notifications-store";
import { logAuditEvent } from "@/lib/api-utils";

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
  organizationId: string;
}): StoredPolicy {
  const timestamp = nowIso();
  return {
    id: input.id ?? randomUUID(),
    organizationId: input.organizationId,
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
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initDatabase();
    const policies = await getPoliciesForOrganization(auth.organizationId);
    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching policies, returning fallback:", error);
    return NextResponse.json(fallbackPolicies);
  }
}

export async function POST(request: Request) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  await initDatabase();
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
  const aiEnhanceRequested = body.aiEnhance !== false;
  const aiDetailLevel: "detailed" | "standard" =
    body.aiDetail === "standard" ? "standard" : "detailed";

  const governance = typeof body.governance === "object" && body.governance !== null ? body.governance : undefined;
  const customContent: Record<string, unknown> = {
    firmProfile: body.firmProfile ?? {},
    policyInputs: body.policyInputs ?? {},
    sectionClauses,
    sectionOptions: body.sectionOptions ?? {},
    sectionNotes: body.sectionNotes ?? {},
    clauseVariables: body.clauseVariables ?? {},
    detailLevel,
    approvals,
    ...(governance ? { governance } : {}),
  };

  // If AI enhancement is requested, mark the policy as pending enhancement.
  // The actual LLM calls run in the background after the 201 is returned.
  if (aiEnhanceRequested) {
    customContent.aiEnhanced = {
      enabled: true,
      model: DEFAULT_POLICY_MODEL,
      detailLevel: aiDetailLevel,
      generatedAt: null,
      failures: [],
      status: "pending",
    };
  }

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
            organizationId: auth.organizationId,
            fromType: "policy",
            fromId: policyId,
            toType: mapping.toType as "risk" | "control" | "training" | "evidence",
            toId: mapping.toId.trim(),
            metadata: mapping.metadata ?? {},
          }),
        ),
    );
  };

  // Background job: enhance clauses with AI and update the persisted policy.
  const runAiEnhancement = (policyId: string, orgId: string) => {
    if (!aiEnhanceRequested) return;

    enhanceClausesWithAi({
      clauses: selectedClauses,
      template,
      sectionClauses,
      firmProfile: body.firmProfile ?? {},
      policyInputs: body.policyInputs ?? {},
      sectionNotes: body.sectionNotes ?? {},
      detailLevel: aiDetailLevel,
    })
      .then(async (aiResult) => {
        const aiMeta = {
          enabled: aiResult.used,
          model: aiResult.used ? DEFAULT_POLICY_MODEL : null,
          detailLevel: aiDetailLevel,
          generatedAt: aiResult.used ? nowIso() : null,
          failures: aiResult.failures,
          status: "complete" as const,
        };
        await updatePolicy(orgId, policyId, {
          clauses: aiResult.clauses,
          customContent: { ...customContent, aiEnhanced: aiMeta },
        });
      })
      .catch((err) => {
        console.error(`Background AI enhancement failed for policy ${policyId}:`, err);
        // Mark enhancement as failed so the UI can show the state.
        updatePolicy(orgId, policyId, {
          customContent: {
            ...customContent,
            aiEnhanced: {
              enabled: false,
              model: null,
              detailLevel: aiDetailLevel,
              generatedAt: null,
              failures: ["background enhancement failed"],
              status: "failed",
            },
          },
        }).catch((updateErr) => {
          console.error(`Failed to record AI enhancement failure for policy ${policyId}:`, updateErr);
        });
      });
  };

  try {
    const created = await createPolicy(auth.organizationId, {
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

    // Fire-and-forget: AI enhancement runs in the background
    runAiEnhancement(created.id, auth.organizationId);

    // Create initial activity record for policy creation
    try {
      const performedBy = sanitizeString(body._performedBy) || "System";
      await createPolicyActivity({
        policy_id: created.id,
        activity_type: "status_change",
        description: `Policy "${template.name}" created from template`,
        old_value: null,
        new_value: "draft",
        performed_by: performedBy,
      });
    } catch (activityError) {
      console.error("Failed to create initial policy activity (non-blocking):", activityError);
    }

    try {
      await persistSuggestedMappings(created.id);
    } catch (linkError) {
      console.error("Failed to persist suggested policy mappings (non-blocking):", linkError);
    }
    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "Policy created",
        message: `Draft "${created.name}" created from template.`,
        severity: "success",
        source: "policies",
        link: `/policies/${created.id}`,
        metadata: { policyId: created.id, status: created.status },
      });
    } catch {
      // Non-blocking notification failures
    }

    await logAuditEvent(pool, {
      entityType: 'policy',
      entityId: created.id,
      action: 'created',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

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
      organizationId: auth.organizationId,
    });
    fallbackPolicies.unshift(fallback);

    // Fire-and-forget: AI enhancement for fallback path
    runAiEnhancement(fallback.id, auth.organizationId);

    try {
      await persistSuggestedMappings(fallback.id);
    } catch (linkError) {
      console.error("Failed to persist suggested policy mappings for fallback (non-blocking):", linkError);
    }
    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "Policy created",
        message: `Draft "${fallback.name}" created from template.`,
        severity: "success",
        source: "policies",
        link: `/policies/${fallback.id}`,
        metadata: { policyId: fallback.id, status: fallback.status },
      });
    } catch {
      // Non-blocking notification failures
    }
    return NextResponse.json(fallback, { status: 201 });
  }
}
