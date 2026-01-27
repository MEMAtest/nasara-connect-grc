import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegisterRecommendations,
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/lib/database";
import { getRecommendationsForFirmType } from "@/lib/register-hub/recommendations";
import { FirmType } from "@/lib/types/register-hub";
import { requireAuth, isAuthDisabled } from "@/lib/auth-utils";

// GET /api/register-hub/recommendations - Get recommendations for a firm type
export async function GET(request: NextRequest) {
  // Require authentication
  const { auth, error } = await requireAuth();
  if (error) return error;

  try {
    await initDatabase();

    const { searchParams } = new URL(request.url);
    const firmType = searchParams.get("firmType") as FirmType | null;
    // Use legacy default-org for register hub in auth-disabled mode.
    const organizationId = isAuthDisabled() ? "default-org" : auth.organizationId;

    // If no firm type provided, try to get from organization settings
    let effectiveFirmType = firmType;
    if (!effectiveFirmType) {
      const settings = await getOrganizationSettings(organizationId);
      effectiveFirmType = settings?.firm_type as FirmType | null;
    }

    // Get recommendations from database
    const dbRecommendations = await getRegisterRecommendations(effectiveFirmType || undefined);

    // Also get computed recommendations
    const computed = getRecommendationsForFirmType(effectiveFirmType);

    return NextResponse.json({
      firmType: effectiveFirmType,
      recommendations: dbRecommendations,
      computed,
    });
  } catch (error) {
    console.error("Error fetching register recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch register recommendations" },
      { status: 500 }
    );
  }
}

// POST /api/register-hub/recommendations - Set organization's firm type
export async function POST(request: NextRequest) {
  // Require authentication
  const { auth, error } = await requireAuth();
  if (error) return error;

  try {
    await initDatabase();

    const body = await request.json();
    const { firmType } = body;
    // Use legacy default-org for register hub in auth-disabled mode.
    const organizationId = isAuthDisabled() ? "default-org" : auth.organizationId;

    if (!firmType) {
      return NextResponse.json(
        { error: "firmType is required" },
        { status: 400 }
      );
    }

    const validFirmTypes: FirmType[] = [
      "payment_services",
      "consumer_credit",
      "investment",
      "insurance",
      "mortgage",
      "wealth_management",
      "crypto",
    ];

    if (!validFirmTypes.includes(firmType)) {
      return NextResponse.json(
        { error: `Invalid firm type. Must be one of: ${validFirmTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const settings = await updateOrganizationSettings(organizationId, { firm_type: firmType });

    // Get recommendations for the new firm type
    const computed = getRecommendationsForFirmType(firmType);

    return NextResponse.json({
      settings,
      recommendations: computed,
      message: `Firm type set to ${firmType}`,
    });
  } catch (error) {
    console.error("Error setting firm type:", error);
    return NextResponse.json(
      { error: "Failed to set firm type" },
      { status: 500 }
    );
  }
}
