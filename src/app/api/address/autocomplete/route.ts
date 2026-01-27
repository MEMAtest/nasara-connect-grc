import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface AddressSuggestion {
  id: string;
  text: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

// Sanitize external API data to prevent XSS
const sanitize = (str: unknown): string => {
  if (typeof str !== "string") return "";
  return str.replace(/[<>'"&]/g, "").trim();
};

/**
 * GET /api/address/autocomplete
 * Search for UK addresses by postcode or partial address
 *
 * Query params:
 * - q: Search query (postcode or partial address)
 * - country: Country filter (default: GB)
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const country = searchParams.get("country") || "GB";

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        message: "Please enter at least 2 characters",
      });
    }

    // Prevent ReDoS: UK postcodes are max 8 chars including space
    if (query.length > 10) {
      return NextResponse.json({
        suggestions: [],
        message: "Query too long for postcode lookup",
      });
    }

    // UK Postcode regex patterns (safe after length check)
    const ukPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    const ukPostcodePartialPattern = /^[A-Z]{1,2}\d/i;

    // Check if this looks like a UK postcode
    const isUkPostcode = ukPostcodePattern.test(query) || ukPostcodePartialPattern.test(query);

    if (isUkPostcode && country === "GB") {
      // Use postcodes.io for UK postcode lookups (free, no API key required)
      const normalizedPostcode = query.replace(/\s+/g, "").toUpperCase();

      try {
        // Try exact postcode lookup first (with 5s timeout)
        const exactResponse = await fetchWithTimeout(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`,
          { headers: { Accept: "application/json" }, timeoutMs: 5000, dedupe: false }
        );

        if (exactResponse.ok) {
          const exactData = await exactResponse.json();
          if (exactData.status === 200 && exactData.result) {
            const result = exactData.result;
            const suggestion: AddressSuggestion = {
              id: sanitize(result.postcode),
              text: `${sanitize(result.postcode)}, ${sanitize(result.admin_ward) || sanitize(result.parish)}, ${sanitize(result.admin_district)}`.replace(/,\s*,/g, ",").replace(/,\s*$/, ""),
              line1: "",
              city: sanitize(result.admin_district) || sanitize(result.parliamentary_constituency),
              county: sanitize(result.admin_county) || sanitize(result.region),
              postcode: sanitize(result.postcode),
              country: "United Kingdom",
            };
            return NextResponse.json({
              suggestions: [suggestion],
              source: "postcodes.io",
            });
          }
        }

        // Try autocomplete for partial postcodes (with 5s timeout)
        const autocompleteResponse = await fetchWithTimeout(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}/autocomplete`,
          { headers: { Accept: "application/json" }, timeoutMs: 5000, dedupe: false }
        );

        if (autocompleteResponse.ok) {
          const autocompleteData = await autocompleteResponse.json();
          if (autocompleteData.status === 200 && autocompleteData.result) {
            // Lookup details for each suggested postcode (limit to 5)
            const postcodes = autocompleteData.result.slice(0, 5);
            const bulkResponse = await fetchWithTimeout(
              "https://api.postcodes.io/postcodes",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ postcodes }),
                timeoutMs: 5000,
                dedupe: false,
              }
            );

            if (bulkResponse.ok) {
              const bulkData = await bulkResponse.json();
              if (bulkData.status === 200 && bulkData.result) {
                const suggestions: AddressSuggestion[] = bulkData.result
                  .filter((item: { result: unknown }) => item.result)
                  .map((item: { result: { postcode: string; admin_ward?: string; parish?: string; admin_district?: string; parliamentary_constituency?: string; admin_county?: string; region?: string } }) => {
                    const r = item.result;
                    return {
                      id: sanitize(r.postcode),
                      text: `${sanitize(r.postcode)}, ${sanitize(r.admin_ward) || sanitize(r.parish)}, ${sanitize(r.admin_district)}`.replace(/,\s*,/g, ",").replace(/,\s*$/, ""),
                      line1: "",
                      city: sanitize(r.admin_district) || sanitize(r.parliamentary_constituency),
                      county: sanitize(r.admin_county) || sanitize(r.region),
                      postcode: sanitize(r.postcode),
                      country: "United Kingdom",
                    };
                  });

                return NextResponse.json({
                  suggestions,
                  source: "postcodes.io",
                });
              }
            }
          }
        }
      } catch (postcodeError) {
        console.error("Postcodes.io lookup failed:", postcodeError);
        // Fall through to return empty suggestions
      }
    }

    // For non-postcode queries or failures, return empty with a hint
    return NextResponse.json({
      suggestions: [],
      message: "Enter a UK postcode for address lookup (e.g., EC1A 1BB)",
      source: "none",
    });
  } catch (error) {
    logError(error, "Address autocomplete failed");
    return NextResponse.json(
      { error: "Failed to search addresses", suggestions: [] },
      { status: 500 }
    );
  }
}
