import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

const BASE_URL = "https://api.company-information.service.gov.uk";

function getAuthHeader() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) return null;
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const authHeader = getAuthHeader();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    if (!authHeader) {
      return NextResponse.json({
        items: [
          {
            company_number: "00000000",
            title: `${query.toUpperCase()} LTD`,
            address_snippet: "London",
          },
        ],
        source: "mock",
        message: "Set COMPANIES_HOUSE_API_KEY for live search results.",
      });
    }

    const response = await fetch(`${BASE_URL}/search/companies?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Companies House search error: ${response.status} - ${errorText}`);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later.", items: [] },
          { status: 429 }
        );
      }

      // Return mock data for 401 (invalid API key) only in development
      if (response.status === 401) {
        console.warn("Companies House API key invalid");
        if (process.env.NODE_ENV === "development") {
          return NextResponse.json({
            items: [
              {
                company_number: "12345678",
                title: `${query.toUpperCase()} LTD`,
                address_snippet: "123 Example Street, London, EC1A 1BB",
                company_status: "active",
              },
              {
                company_number: "87654321",
                title: `${query.toUpperCase()} HOLDINGS LTD`,
                address_snippet: "456 Business Park, Manchester, M1 1AA",
                company_status: "active",
              },
            ],
            source: "mock",
            _message: "Mock data - set a valid COMPANIES_HOUSE_API_KEY for live results",
          });
        }
        return NextResponse.json(
          { error: "Companies House API authentication failed. Please contact support.", items: [] },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Companies House request failed", items: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ items: data.items ?? [], source: "companies_house" });
  } catch (error) {
    console.error("Companies House search error:", error);
    return NextResponse.json({ error: "Failed to search companies", items: [] }, { status: 500 });
  }
}
