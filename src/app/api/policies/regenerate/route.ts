import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { initDatabase } from "@/lib/database";
import { getPoliciesForOrganization, updatePolicy } from "@/lib/server/policy-store";
import { enhanceClausesWithAi, DEFAULT_POLICY_MODEL, type PolicyAiDetailLevel } from "@/lib/policies/ai-policy-writer";

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: Request) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  await initDatabase();
  const url = new URL(request.url);
  const detail = (url.searchParams.get("detail") ?? "detailed") as PolicyAiDetailLevel;
  const limitParam = url.searchParams.get("limit");
  const policyIdFilter = url.searchParams.get("policyId");

  const limit = limitParam ? Number(limitParam) : undefined;

  try {
    let policies = await getPoliciesForOrganization(auth.organizationId);
    if (policyIdFilter) {
      policies = policies.filter((policy) => policy.id === policyIdFilter);
    }
    if (typeof limit === "number" && !Number.isNaN(limit)) {
      policies = policies.slice(0, Math.max(0, limit));
    }

    const results: Array<{ id: string; name: string; updated: boolean; failures: string[] }> = [];

    for (const policy of policies) {
      const customContent = (policy.customContent ?? {}) as Record<string, unknown>;
      const sectionClauses = (customContent.sectionClauses ?? {}) as Record<string, string[]>;
      const firmProfile = (customContent.firmProfile ?? {}) as Record<string, unknown>;
      const policyInputs = (customContent.policyInputs ?? {}) as Record<string, unknown>;
      const sectionNotes = (customContent.sectionNotes ?? {}) as Record<string, string>;

      const aiResult = await enhanceClausesWithAi({
        clauses: policy.clauses,
        template: policy.template,
        sectionClauses,
        firmProfile,
        policyInputs,
        sectionNotes,
        detailLevel: detail,
      });

      if (!aiResult.used) {
        results.push({ id: policy.id, name: policy.name, updated: false, failures: aiResult.failures });
        continue;
      }

      const nextContent = {
        ...customContent,
        aiEnhanced: {
          enabled: true,
          model: DEFAULT_POLICY_MODEL,
          detailLevel: detail,
          generatedAt: nowIso(),
          failures: aiResult.failures,
        },
      };

      await updatePolicy(auth.organizationId, policy.id, {
        clauses: aiResult.clauses,
        customContent: nextContent,
      });

      results.push({ id: policy.id, name: policy.name, updated: true, failures: aiResult.failures });
    }

    return NextResponse.json({
      updated: results.filter((entry) => entry.updated).length,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("Policy AI regeneration failed:", error);
    return NextResponse.json(
      {
        error: "Failed to regenerate policies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
