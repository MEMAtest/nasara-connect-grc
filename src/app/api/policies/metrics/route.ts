import { NextResponse } from "next/server";
import type { PolicyMetrics } from "@/lib/policies";

const MOCK_POLICY_METRICS: PolicyMetrics = {
  totalPolicies: 18,
  overduePolicies: 2,
  policyGaps: 3,
  completionRate: 72,
  reviewsDueSoon: 4,
  underReview: 1,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(MOCK_POLICY_METRICS);
}
