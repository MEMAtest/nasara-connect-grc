import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getPolicyById } from "@/lib/server/policy-store";
import {
  initDatabase,
  getPolicyVersions,
  createPolicyVersion,
  createPolicyActivity,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  POLICY_STATUSES,
} from "@/lib/validation";

// GET /api/policies/[policyId]/versions - Get all versions for a policy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Verify policy exists
    const policy = await getPolicyById(auth.organizationId, policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const versions = await getPolicyVersions(policyId);
    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Error fetching policy versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch policy versions" },
      { status: 500 }
    );
  }
}

// POST /api/policies/[policyId]/versions - Create a new version (snapshot current policy state)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Get current policy
    const policy = await getPolicyById(auth.organizationId, policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate status if provided
    if (body.status && !isValidEnum(body.status, POLICY_STATUSES)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${POLICY_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create new version snapshot (version number is assigned atomically)
    const version = await createPolicyVersion({
      policy_id: policyId,
      name: policy.name,
      description: policy.description,
      clauses: policy.clauses || [],
      custom_content: policy.customContent || {},
      status: body.status || policy.status,
      published_at: body.publish ? new Date() : null,
      published_by: body.publish ? sanitizeString(body.published_by) || "System" : null,
      change_summary: sanitizeText(body.change_summary) || null,
    });

    // Create activity record for version creation
    const previousVersion = version.version_number > 1 ? version.version_number - 1 : 0;
    await createPolicyActivity({
      policy_id: policyId,
      activity_type: "version_created",
      description: `Version ${version.version_number} created${body.change_summary ? `: ${body.change_summary}` : ""}`,
      old_value: previousVersion > 0 ? `v${previousVersion}` : null,
      new_value: `v${version.version_number}`,
      performed_by: sanitizeString(body.published_by) || "System",
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error("Error creating policy version:", error);
    return NextResponse.json(
      { error: "Failed to create policy version" },
      { status: 500 }
    );
  }
}
