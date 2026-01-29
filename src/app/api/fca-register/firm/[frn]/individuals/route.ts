import { NextRequest, NextResponse } from "next/server";
import { FCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

const FCA_API_BASE = "https://register.fca.org.uk/services/V0.1";

/**
 * GET /api/fca-register/firm/[frn]/individuals
 * Get approved persons (individuals) at a firm
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

    const response = await fetch(`${FCA_API_BASE}/Firm/${frn}/Individuals`, {
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
  } catch (error) {
    console.error("FCA Register individuals lookup error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch firm individuals" },
      { status: 500 }
    );
  }
}
