import { getPolicyById, getPoliciesForOrganization, type StoredPolicy } from "@/lib/server/policy-store";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

export async function fetchPolicyContext(policyId?: string): Promise<StoredPolicy | null> {
  if (!policyId) return null;
  try {
    const policy = await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);
    return policy;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch policy context", error);
    }
    return null;
  }
}

export async function fetchAnyPolicy(): Promise<StoredPolicy | null> {
  try {
    const policies = await getPoliciesForOrganization(DEFAULT_ORGANIZATION_ID);
    return policies[0] ?? null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch policies", error);
    }
    return null;
  }
}
