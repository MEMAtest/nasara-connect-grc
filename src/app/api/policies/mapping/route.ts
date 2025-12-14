import { NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { getPoliciesForOrganization } from "@/lib/server/policy-store";
import { getLinkCountsForPolicies } from "@/lib/server/entity-link-store";

export async function GET() {
  const policies = await getPoliciesForOrganization(DEFAULT_ORGANIZATION_ID);
  const counts = await getLinkCountsForPolicies({
    organizationId: DEFAULT_ORGANIZATION_ID,
    policyIds: policies.map((policy) => policy.id),
  });

  return NextResponse.json({ counts });
}

