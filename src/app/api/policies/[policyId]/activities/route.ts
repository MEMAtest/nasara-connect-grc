import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { getPolicyById } from "@/lib/server/policy-store";
import {
  initDatabase,
  getPolicyActivities,
  createPolicyActivity,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  POLICY_ACTIVITY_TYPES,
} from "@/lib/validation";

// GET /api/policies/[policyId]/activities - Get all activities for a policy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Verify policy exists
    const policy = await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const activities = await getPolicyActivities(policyId);
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching policy activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch policy activities" },
      { status: 500 }
    );
  }
}

// POST /api/policies/[policyId]/activities - Create a new activity record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Verify policy exists
    const policy = await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.activity_type) {
      return NextResponse.json(
        { error: "activity_type is required" },
        { status: 400 }
      );
    }

    if (!isValidEnum(body.activity_type, POLICY_ACTIVITY_TYPES)) {
      return NextResponse.json(
        {
          error: `Invalid activity_type. Must be one of: ${POLICY_ACTIVITY_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const activity = await createPolicyActivity({
      policy_id: policyId,
      activity_type: body.activity_type,
      description: sanitizeText(body.description),
      old_value: body.old_value ? sanitizeString(body.old_value) : null,
      new_value: body.new_value ? sanitizeString(body.new_value) : null,
      metadata: body.metadata || {},
      performed_by: sanitizeString(body.performed_by) || "System",
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating policy activity:", error);
    return NextResponse.json(
      { error: "Failed to create policy activity" },
      { status: 500 }
    );
  }
}
