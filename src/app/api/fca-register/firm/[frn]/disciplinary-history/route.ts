import { NextRequest, NextResponse } from "next/server";
import { getFCAConfig, isFCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

/**
 * GET /api/fca-register/firm/[frn]/disciplinary-history
 * Get disciplinary actions and enforcement history for a firm
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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
      const response = await fetch(`${config.baseUrl}/Firm/${frn}/DisciplinaryHistory`, {
        headers: {
          "X-AUTH-EMAIL": config.email,
          "X-AUTH-KEY": config.apiKey,
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        // 404 might mean no disciplinary history - that's okay
        if (response.status === 404) {
          return NextResponse.json({
            frn,
            actions: [],
            total: 0,
            hasEnforcementHistory: false,
          });
        }
        return NextResponse.json(
          { error: "Unable to fetch disciplinary history" },
          { status: response.status }
        );
      }

      const data = await response.json();

      const actions = (data.Data || []).map((action: Record<string, string>) => {
        const description = action["TypeofDescription"] || "";
        return {
          actionType: action["TypeofAction"],
          enforcementType: action["EnforcementType"],
          date: action["ActionEffectiveFrom"],
          summary: description.length > 500
            ? description.slice(0, 500) + "..."
            : description,
        };
      });

      return NextResponse.json({
        frn,
        actions,
        total: data.ResultInfo?.total_count ? parseInt(data.ResultInfo.total_count) : actions.length,
        hasEnforcementHistory: actions.length > 0,
        message: data.Message,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("FCA Register disciplinary history lookup error:", error);

    if (isFCAApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch disciplinary history" },
      { status: 500 }
    );
  }
}
