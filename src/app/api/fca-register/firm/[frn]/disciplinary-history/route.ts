import { NextRequest, NextResponse } from "next/server";
import { FCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

const FCA_API_BASE = "https://register.fca.org.uk/services/V0.1";

/**
 * GET /api/fca-register/firm/[frn]/disciplinary-history
 * Get disciplinary actions and enforcement history for a firm
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

    const response = await fetch(`${FCA_API_BASE}/Firm/${frn}/DisciplinaryHistory`, {
      headers: {
        "X-AUTH-EMAIL": process.env.FCA_REGISTER_EMAIL!,
        "X-AUTH-KEY": process.env.FCA_REGISTER_API_KEY!,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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

    const actions = (data.Data || []).map((action: Record<string, string>) => ({
      actionType: action["TypeofAction"],
      enforcementType: action["EnforcementType"],
      date: action["ActionEffectiveFrom"],
      summary: action["TypeofDescription"]?.substring(0, 500) + (action["TypeofDescription"]?.length > 500 ? "..." : ""),
    }));

    return NextResponse.json({
      frn,
      actions,
      total: data.ResultInfo?.total_count ? parseInt(data.ResultInfo.total_count) : actions.length,
      hasEnforcementHistory: actions.length > 0,
      message: data.Message,
    });
  } catch (error) {
    console.error("FCA Register disciplinary history lookup error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch disciplinary history" },
      { status: 500 }
    );
  }
}
