import { NextRequest, NextResponse } from "next/server";
import { getFCAConfig, isFCAApiError } from "@/lib/fca-register";
import { requireRole } from "@/lib/rbac";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

/**
 * GET /api/fca-register/firm/[frn]/permissions
 * Get authorized permissions for a firm
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole("member");
    if (error) return error;
    const { frn } = await params;

    if (!frn || !/^\d{1,10}$/.test(frn)) {
      return NextResponse.json(
        { error: "Invalid FRN format. FRN must be 1-10 digits." },
        { status: 400 }
      );
    }

    const config = getFCAConfig();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${config.baseUrl}/Firm/${frn}/Permissions`, {
        headers: {
          "X-AUTH-EMAIL": config.email,
          "X-AUTH-KEY": config.apiKey,
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

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
          status: "Granted",
        };
      });

      return NextResponse.json({
        frn,
        permissions,
        total: permissions.length,
        message: data.Message,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("FCA Register permissions lookup error:", error);

    if (isFCAApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch firm permissions" },
      { status: 500 }
    );
  }
}
