import { getPolicyById, getPoliciesForOrganization, type StoredPolicy } from "@/lib/server/policy-store";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

export async function fetchPolicyContext(
  policyId?: string,
  organizationId: string = DEFAULT_ORGANIZATION_ID
): Promise<StoredPolicy | null> {
  if (!policyId) return null;
  try {
    const policy = await getPolicyById(organizationId, policyId);
    if (policy) return policy;
    if (organizationId !== DEFAULT_ORGANIZATION_ID) {
      return await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch policy context", error);
    }
    return null;
  }
}

export async function fetchAnyPolicy(
  organizationId: string = DEFAULT_ORGANIZATION_ID
): Promise<StoredPolicy | null> {
  try {
    const policies = await getPoliciesForOrganization(organizationId);
    if (policies.length) return policies[0];
    if (organizationId !== DEFAULT_ORGANIZATION_ID) {
      const fallback = await getPoliciesForOrganization(DEFAULT_ORGANIZATION_ID);
      return fallback[0] ?? null;
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch policies", error);
    }
    return null;
  }
}
