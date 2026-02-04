import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { getPoliciesForOrganization } from "@/lib/server/policy-store";
import { getLinkCountsForPolicies } from "@/lib/server/entity-link-store";

export async function GET() {
  const { auth, error } = await requireAuth();
  if (error) return error;
  const policies = await getPoliciesForOrganization(auth.organizationId);
  const counts = await getLinkCountsForPolicies({
    organizationId: auth.organizationId,
    policyIds: policies.map((policy) => policy.id),
  });

  return NextResponse.json({ counts });
}
