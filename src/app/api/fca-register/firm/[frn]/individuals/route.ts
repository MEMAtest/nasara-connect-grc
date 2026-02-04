import { NextRequest, NextResponse } from "next/server";
import { getFCAConfig, isFCAApiError } from "@/lib/fca-register";
import { requireAuth } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

/**
 * GET /api/fca-register/firm/[frn]/individuals
 * Get approved persons (individuals) at a firm
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireAuth();
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
      const response = await fetch(`${config.baseUrl}/Firm/${frn}/Individuals`, {
        headers: {
          "X-AUTH-EMAIL": config.email,
          "X-AUTH-KEY": config.apiKey,
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Unable to fetch individuals" },
          { status: response.status }
        );
      }

      const data = await response.json();

      const individuals = (data.Data || []).map((ind: Record<string, string>) => ({
        irn: ind["IRN"],
        name: ind["Name"],
        status: ind["Status"],
        url: ind["URL"],
      }));

      return NextResponse.json({
        frn,
        individuals,
        total: data.ResultInfo?.total_count ? parseInt(data.ResultInfo.total_count) : individuals.length,
        page: data.ResultInfo?.page ? parseInt(data.ResultInfo.page) : 1,
        message: data.Message,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("FCA Register individuals lookup error:", error);

    if (isFCAApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch firm individuals" },
      { status: 500 }
    );
  }
}
