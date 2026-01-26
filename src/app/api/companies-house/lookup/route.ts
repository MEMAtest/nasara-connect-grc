import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

const COMPANIES_HOUSE_API = "https://api.company-information.service.gov.uk";

interface CompanyProfile {
  company_name: string;
  company_number: string;
  company_status: string;
  date_of_creation: string;
  sic_codes?: string[];
  accounts?: {
    next_due?: string;
    next_made_up_to?: string;
  };
  confirmation_statement?: {
    next_due?: string;
    next_made_up_to?: string;
  };
  registered_office_address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
    region?: string;
  };
  type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const companyNumber = searchParams.get("number");

    if (!companyNumber) {
      return NextResponse.json({ error: "Company number is required" }, { status: 400 });
    }

    // Validate company number format (1-8 characters, letters or digits)
    const cleanNumber = companyNumber.trim().toUpperCase();
    if (!/^[A-Z0-9]{1,8}$/.test(cleanNumber)) {
      return NextResponse.json({ error: "Invalid company number format" }, { status: 400 });
    }

    // Check for API key
    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
    if (!apiKey) {
      // Return mock data for development if no API key is configured
      return NextResponse.json({
        company: {
          name: "Demo Company Ltd",
          number: cleanNumber,
          status: "active",
          incorporationDate: "2020-01-15",
          sicCodes: ["64999"],
          filings: {
            confirmationStatementDue: "2025-12-31",
            confirmationStatementMadeUpTo: "2024-12-31",
            accountsDue: "2025-09-30",
            accountsMadeUpTo: "2024-09-30",
          },
          address: {
            line1: "123 Example Street",
            line2: "",
            city: "London",
            postcode: "EC1A 1BB",
            country: "United Kingdom",
          },
        },
        source: "mock",
        message: "Using mock data. Set COMPANIES_HOUSE_API_KEY for real lookups.",
      });
    }

    // Make request to Companies House API
    let paddedNumber = cleanNumber;
    const prefixedMatch = cleanNumber.match(/^([A-Z]{1,2})(\d+)$/);
    if (prefixedMatch) {
      const [, prefix, digits] = prefixedMatch;
      paddedNumber = `${prefix}${digits.padStart(6, "0")}`;
    } else if (/^\d+$/.test(cleanNumber)) {
      paddedNumber = cleanNumber.padStart(8, "0");
    }
    const response = await fetch(`${COMPANIES_HOUSE_API}/company/${paddedNumber}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      const errorText = await response.text();
      logError(new Error(`Companies House API error: ${response.status} - ${errorText}`), "Companies House lookup failed");
      return NextResponse.json({ error: "Failed to lookup company" }, { status: 502 });
    }

    const data = (await response.json()) as CompanyProfile;

    // Transform the response to a cleaner format
    const company = {
      name: data.company_name,
      number: data.company_number,
      status: data.company_status,
      incorporationDate: data.date_of_creation,
      sicCodes: data.sic_codes || [],
      type: data.type,
      filings: {
        confirmationStatementDue: data.confirmation_statement?.next_due || "",
        confirmationStatementMadeUpTo: data.confirmation_statement?.next_made_up_to || "",
        accountsDue: data.accounts?.next_due || "",
        accountsMadeUpTo: data.accounts?.next_made_up_to || "",
      },
      address: {
        line1: data.registered_office_address?.address_line_1 || "",
        line2: data.registered_office_address?.address_line_2 || "",
        city: data.registered_office_address?.locality || "",
        postcode: data.registered_office_address?.postal_code || "",
        country: data.registered_office_address?.country || "United Kingdom",
        region: data.registered_office_address?.region || "",
      },
    };

    return NextResponse.json({ company, source: "companies_house" });
  } catch (error) {
    logError(error, "Companies House lookup error");
    return NextResponse.json({ error: "Failed to lookup company" }, { status: 500 });
  }
}
