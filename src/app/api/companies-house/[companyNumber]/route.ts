import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.company-information.service.gov.uk";

function getAuthHeader() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) return null;
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ companyNumber: string }> }) {
  try {
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
