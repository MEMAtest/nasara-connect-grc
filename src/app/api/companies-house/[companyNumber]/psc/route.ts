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

type PscItem = {
  id: string;
  name: string;
  kind?: string;
  natureOfControl: string[];
  notifiedOn?: string;
  ceasedOn?: string;
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
      `${BASE_URL}/company/${encodeURIComponent(paddedNumber)}/persons-with-significant-control?items_per_page=100`,
      {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Companies House PSC error: ${response.status} - ${errorText}`);
      if (response.status === 404) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Companies House request failed" }, { status: response.status });
    }

    const data = await response.json();
    const items = (Array.isArray(data.items) ? data.items : []).map((item: any): PscItem => {
      const nameElements = item?.name_elements;
      const fallbackName = nameElements
        ? [nameElements.title, nameElements.forename, nameElements.surname]
            .filter(Boolean)
            .join(" ")
            .trim()
        : "";
      return {
        id: item?.etag || item?.links?.self || `${item?.name || fallbackName}-${item?.notified_on || ""}`,
        name: item?.name || fallbackName || "Unknown PSC",
        kind: item?.kind,
        natureOfControl: Array.isArray(item?.natures_of_control) ? item.natures_of_control : [],
        notifiedOn: item?.notified_on,
        ceasedOn: item?.ceased_on,
      };
    });

    return NextResponse.json({ items, total: data.total_results ?? items.length });
  } catch (error) {
    console.error("Companies House PSC lookup error:", error);
    return NextResponse.json({ error: "Failed to fetch PSC data" }, { status: 500 });
  }
}
