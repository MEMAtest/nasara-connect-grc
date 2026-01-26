import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

const BASE_URL = "https://api.company-information.service.gov.uk";

function getAuthHeader() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) return null;
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

function normalizeCompanyNumber(raw: string) {
  const cleanNumber = raw.trim().toUpperCase();
  let paddedNumber = cleanNumber;
  const prefixedMatch = cleanNumber.match(/^([A-Z]{1,2})(\d+)$/);
  if (prefixedMatch) {
    const [, prefix, digits] = prefixedMatch;
    paddedNumber = `${prefix}${digits.padStart(6, "0")}`;
  } else if (/^\d+$/.test(cleanNumber)) {
    paddedNumber = cleanNumber.padStart(8, "0");
  }
  return paddedNumber;
}

type OfficerItem = {
  id: string;
  name: string;
  role?: string;
  appointedOn?: string;
  resignedOn?: string;
};

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

    const paddedNumber = normalizeCompanyNumber(companyNumber);
    const response = await fetch(
      `${BASE_URL}/company/${encodeURIComponent(paddedNumber)}/officers?items_per_page=100`,
      {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Companies House officers error: ${response.status} - ${errorText}`);
      if (response.status === 404) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Companies House request failed" }, { status: response.status });
    }

    const data = await response.json();
    const items = (Array.isArray(data.items) ? data.items : []).map((item: any): OfficerItem => {
      return {
        id: item?.links?.self || `${item?.name}-${item?.appointed_on || ""}`,
        name: item?.name || "Unknown officer",
        role: item?.officer_role,
        appointedOn: item?.appointed_on,
        resignedOn: item?.resigned_on,
      };
    });

    return NextResponse.json({ items, total: data.total_results ?? items.length });
  } catch (error) {
    console.error("Companies House officers lookup error:", error);
    return NextResponse.json({ error: "Failed to fetch officers data" }, { status: 500 });
  }
}
