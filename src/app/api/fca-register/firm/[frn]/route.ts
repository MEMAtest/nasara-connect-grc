import { NextRequest, NextResponse } from "next/server";
import { FCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ frn: string }>;
}

const FCA_API_BASE = "https://register.fca.org.uk/services/V0.1";

async function fcaFetch(endpoint: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${FCA_API_BASE}${endpoint}`, {
      headers: {
        "X-AUTH-EMAIL": process.env.FCA_REGISTER_EMAIL!,
        "X-AUTH-KEY": process.env.FCA_REGISTER_API_KEY!,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * GET /api/fca-register/firm/[frn]
 * Look up a firm by its FRN (Firm Reference Number)
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

    // Fetch firm basic info and address in parallel
    const [firmResponse, addressResponse] = await Promise.all([
      fcaFetch(`/Firm/${frn}`),
      fcaFetch(`/Firm/${frn}/Address`),
    ]);

    if (!firmResponse?.Data || firmResponse.Data.length === 0) {
      return NextResponse.json(
        { error: "Firm not found" },
        { status: 404 }
      );
    }

    const firm = firmResponse.Data[0];

    // Get principal place of business address
    const addresses = addressResponse?.Data || [];
    const principalAddress = addresses.find(
      (a: Record<string, string>) => a["Address Type"] === "Principal Place of Business"
    ) || addresses[0];

    const normalized = {
      frn: firm["FRN"],
      name: firm["Organisation Name"],
      status: firm["Status"],
      statusEffectiveDate: firm["Status Effective Date"],
      businessType: firm["Business Type"],
      companiesHouseNumber: firm["Companies House Number"],
      psdStatus: firm["PSD / EMD Status"],
      mlrsStatus: firm["MLRs Status"],
      address: principalAddress ? {
        line1: principalAddress["Address Line 1"],
        line2: principalAddress["Address Line 2"],
        town: principalAddress["Town"],
        county: principalAddress["County"],
        country: principalAddress["Country"],
        postcode: principalAddress["Postcode"],
      } : null,
      phone: principalAddress?.["Phone Number"],
      website: principalAddress?.["Website Address"],
    };

    return NextResponse.json({
      firm: normalized,
      raw: firm,
    });
  } catch (error) {
    console.error("FCA Register firm lookup error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch firm details" },
      { status: 500 }
    );
  }
}
