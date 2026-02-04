import { NextRequest, NextResponse } from "next/server";
import { completeWizardSetup } from "@/lib/database";
import { FirmType, FIRM_TYPES } from "@/lib/types/register-hub";
import { requireRole } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  // Require authentication
  const { auth, error } = await requireRole("admin");
  if (error) return error;

  try {
    const body = await request.json();
    const { firmType, selectedRegisters } = body;

    // Validate firm type
    if (!firmType || !Object.keys(FIRM_TYPES).includes(firmType)) {
      return NextResponse.json(
        { error: "Invalid firm type" },
        { status: 400 }
      );
    }

    // Validate selected registers
    if (!selectedRegisters || !Array.isArray(selectedRegisters) || selectedRegisters.length === 0) {
      return NextResponse.json(
        { error: "At least one register must be selected" },
        { status: 400 }
      );
    }

    const organizationId = auth.organizationId;

    const result = await completeWizardSetup(
      organizationId,
      firmType as FirmType,
      selectedRegisters,
      auth.userEmail ?? auth.userId ?? undefined
    );

    return NextResponse.json({
      success: true,
      settings: result.settings,
      subscriptions: result.subscriptions,
    });
  } catch (error) {
    console.error("Error completing wizard setup:", error);
    return NextResponse.json(
      { error: "Failed to complete wizard setup" },
      { status: 500 }
    );
  }
}
