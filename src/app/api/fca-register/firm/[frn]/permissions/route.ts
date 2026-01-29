import { NextRequest, NextResponse } from "next/server";
import { FCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

const FCA_API_BASE = "https://register.fca.org.uk/services/V0.1";

/**
 * GET /api/fca-register/firm/[frn]/permissions
 * Get authorized permissions for a firm
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { frn } = await params;

    if (!frn || !/^\d+$/.test(frn)) {
      return NextResponse.json(
        { error: "Invalid FRN format. FRN must be numeric." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${FCA_API_BASE}/Firm/${frn}/Permissions`, {
      headers: {
        "X-AUTH-EMAIL": process.env.FCA_REGISTER_EMAIL!,
        "X-AUTH-KEY": process.env.FCA_REGISTER_API_KEY!,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to fetch permissions" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // FCA returns permissions as object with permission names as keys
    const permissionsData = data.Data || {};
    const permissions = Object.entries(permissionsData).map(([name, details]) => {
      const detailsArray = details as Array<Record<string, string[]>>;
      const customerTypes: string[] = [];
      const investmentTypes: string[] = [];
      const limitations: string[] = [];

      detailsArray.forEach((detail) => {
        if (detail["Customer Type"]) customerTypes.push(...detail["Customer Type"]);
        if (detail["Investment Type"]) investmentTypes.push(...detail["Investment Type"]);
        if (detail["Limitation"]) limitations.push(...detail["Limitation"]);
      });

      return {
        permission: name,
        customerTypes,
        investmentTypes,
        limitations,
        status: "Granted", // All returned permissions are granted
      };
    });

    return NextResponse.json({
      frn,
      permissions,
      total: permissions.length,
      message: data.Message,
    });
  } catch (error) {
    console.error("FCA Register permissions lookup error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch firm permissions" },
      { status: 500 }
    );
  }
}
