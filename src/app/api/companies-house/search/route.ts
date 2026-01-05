import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.company-information.service.gov.uk";

function getAuthHeader() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) return null;
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(request: NextRequest) {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return NextResponse.json({ error: "Companies House API key not configured" }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const response = await fetch(`${BASE_URL}/search/companies?q=${encodeURIComponent(query)}`,
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
  return NextResponse.json({ items: data.items ?? [] });
}
