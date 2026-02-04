import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegisterSubscriptions,
  setRegisterSubscription,
} from "@/lib/database";
import { requireRole } from "@/lib/rbac";

// GET /api/register-hub/subscriptions - Get organization's subscriptions
export async function GET() {
  // Require authentication
  const { auth, error } = await requireRole("member");
  if (error) return error;

  try {
    await initDatabase();

    const organizationId = auth.organizationId;

    const subscriptions = await getRegisterSubscriptions(organizationId);
    return NextResponse.json({ subscriptions });
  } catch (err) {
    console.error("Error fetching register subscriptions:", err);
    return NextResponse.json(
      { error: "Failed to fetch register subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/register-hub/subscriptions - Enable/disable a register
export async function POST(request: NextRequest) {
  // Require authentication
  const { auth, error } = await requireRole("admin");
  if (error) return error;

  try {
    await initDatabase();

    const body = await request.json();
    const {
      registerCode,
      enabled,
    } = body;

    const organizationId = auth.organizationId;
    const enabledBy = auth.userEmail ?? auth.userId ?? undefined;

    if (!registerCode) {
      return NextResponse.json(
        { error: "registerCode is required" },
        { status: 400 }
      );
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 }
      );
    }

    const subscription = await setRegisterSubscription(
      organizationId,
      registerCode,
      enabled,
      enabledBy
    );

    return NextResponse.json({
      subscription,
      message: enabled ? "Register enabled" : "Register disabled",
    });
  } catch (error) {
    console.error("Error updating register subscription:", error);
    return NextResponse.json(
      { error: "Failed to update register subscription" },
      { status: 500 }
    );
  }
}

// PATCH /api/register-hub/subscriptions - Bulk enable registers
export async function PATCH(request: NextRequest) {
  // Require authentication
  const { auth, error } = await requireRole("admin");
  if (error) return error;

  try {
    await initDatabase();

    const body = await request.json();
    const {
      registerCodes,
      enabled,
    } = body;

    const organizationId = auth.organizationId;
    const enabledBy = auth.userEmail ?? auth.userId ?? undefined;

    if (!Array.isArray(registerCodes) || registerCodes.length === 0) {
      return NextResponse.json(
        { error: "registerCodes must be a non-empty array" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      registerCodes.map((code: string) =>
        setRegisterSubscription(organizationId, code, enabled ?? true, enabledBy)
      )
    );

    return NextResponse.json({
      subscriptions: results,
      message: `${results.length} registers ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error("Error bulk updating register subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to bulk update register subscriptions" },
      { status: 500 }
    );
  }
}
