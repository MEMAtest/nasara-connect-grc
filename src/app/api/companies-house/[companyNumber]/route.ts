import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

const BASE_URL = "https://api.company-information.service.gov.uk";

function getAuthHeader() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) return null;
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ companyNumber: string }> }) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return NextResponse.json({ error: "Companies House API key not configured" }, { status: 501 });
    }

    const { companyNumber } = await context.params;
    if (!companyNumber) {
      return NextResponse.json({ error: "Company number required" }, { status: 400 });
    }

    // Validate and pad company number
    const cleanNumber = companyNumber.trim().toUpperCase();
    let paddedNumber = cleanNumber;
    const prefixedMatch = cleanNumber.match(/^([A-Z]{1,2})(\d+)$/);
    if (prefixedMatch) {
      const [, prefix, digits] = prefixedMatch;
      paddedNumber = `${prefix}${digits.padStart(6, "0")}`;
    } else if (/^\d+$/.test(cleanNumber)) {
      paddedNumber = cleanNumber.padStart(8, "0");
    }

    const response = await fetch(`${BASE_URL}/company/${encodeURIComponent(paddedNumber)}`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Companies House API error: ${response.status} - ${errorText}`);

      if (response.status === 404) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      // Return mock data for 401 (invalid API key) only in development
      if (response.status === 401) {
        console.warn("Companies House API key invalid");
        if (process.env.NODE_ENV === "development") {
          return NextResponse.json({
            company_name: `Company ${paddedNumber}`,
            company_number: paddedNumber,
            company_status: "active",
            date_of_creation: "2020-01-15",
            registered_office_address: {
              address_line_1: "123 Example Street",
              locality: "London",
              postal_code: "EC1A 1BB",
              country: "United Kingdom",
            },
            sic_codes: ["62012"],
            type: "ltd",
            _mock: true,
            _message: "Mock data - set a valid COMPANIES_HOUSE_API_KEY for live results",
          });
        }
        return NextResponse.json(
          { error: "Companies House API authentication failed. Please contact support." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Companies House request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Companies House lookup error:", error);
    return NextResponse.json({ error: "Failed to lookup company" }, { status: 500 });
  }
}
