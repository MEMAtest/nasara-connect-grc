import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.company-information.service.gov.uk";

function getAuthHeader() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) return null;
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ companyNumber: string }> }) {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return NextResponse.json({ error: "Companies House API key not configured" }, { status: 501 });
  }

  const { companyNumber } = await context.params;
  if (!companyNumber) {
    return NextResponse.json({ error: "Company number required" }, { status: 400 });
  }

  const response = await fetch(`${BASE_URL}/company/${encodeURIComponent(companyNumber)}`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Companies House request failed" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
