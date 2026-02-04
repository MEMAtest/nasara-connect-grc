import { NextResponse } from "next/server";
import type { PolicyMetrics } from "@/lib/policies";
import { getPoliciesForOrganization } from "@/lib/server/policy-store";
import { getRequiredPolicies, DEFAULT_PERMISSIONS } from "@/lib/policies/permissions";
import { requireRole } from "@/lib/rbac";

// Fallback metrics when database is unavailable
const FALLBACK_METRICS: PolicyMetrics = {
  totalPolicies: 0,
  overduePolicies: 0,
  policyGaps: 0,
  completionRate: 0,
  reviewsDueSoon: 0,
  underReview: 0,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    // Get all policies for the organization
    const policies = await getPoliciesForOrganization(auth.organizationId);

    // Get required policies based on default permissions
    // TODO: In future, fetch actual firm permissions from database
    const requiredPolicies = getRequiredPolicies(DEFAULT_PERMISSIONS);
    const requiredCodes = new Set(requiredPolicies.map(p => p.code));

    // Calculate metrics
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const tenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 10, now.getDate());

    // Count policies by status and age
    let approvedCount = 0;
    let overdueCount = 0;
    let reviewsDueSoonCount = 0;
    let underReviewCount = 0;
    const existingCodes = new Set<string>();

    for (const policy of policies) {
      existingCodes.add(policy.code);
      const updatedAt = new Date(policy.updatedAt);

      // Count by status
      if (policy.status === "approved") {
        approvedCount++;

        // Check if overdue for review (not updated in > 1 year)
        if (updatedAt < oneYearAgo) {
          overdueCount++;
        }
        // Check if review due soon (updated 10-12 months ago)
        else if (updatedAt < tenMonthsAgo) {
          reviewsDueSoonCount++;
        }
      } else if (policy.status === "in_review") {
        underReviewCount++;
      }
      // Draft policies don't count toward completion
    }

    // Calculate policy gaps (required but not created)
    let gapCount = 0;
    for (const code of requiredCodes) {
      if (!existingCodes.has(code)) {
        gapCount++;
      }
    }

    // Calculate completion rate
    // If there are required policies, completion = approved / required * 100
    // If no required policies, completion = approved / total * 100
    const totalPolicies = policies.length;
    let completionRate = 0;

    if (requiredPolicies.length > 0) {
      // Count how many required policies are approved
      const approvedRequiredCount = policies.filter(
        p => requiredCodes.has(p.code) && p.status === "approved"
      ).length;
      completionRate = Math.round((approvedRequiredCount / requiredPolicies.length) * 100);
    } else if (totalPolicies > 0) {
      completionRate = Math.round((approvedCount / totalPolicies) * 100);
    }

    const metrics: PolicyMetrics = {
      totalPolicies,
      overduePolicies: overdueCount,
      policyGaps: gapCount,
      completionRate,
      reviewsDueSoon: reviewsDueSoonCount,
      underReview: underReviewCount,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    // Log error for debugging
    console.error("Failed to fetch policy metrics:", error);

    // Return fallback metrics on error
    return NextResponse.json(FALLBACK_METRICS);
  }
}
