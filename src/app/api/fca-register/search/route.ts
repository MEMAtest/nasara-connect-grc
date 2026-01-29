import { NextRequest, NextResponse } from "next/server";
import { FCAApiError } from "@/lib/fca-register";

const FCA_API_BASE = "https://register.fca.org.uk/services/V0.1";

interface SearchResult {
  type: "Firm" | "Individual";
  name: string;
  reference: string;
  status: string;
}

async function searchFCA(query: string, type: "firm" | "individual"): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${FCA_API_BASE}/Search?q=${encodeURIComponent(query)}&type=${type}`,
      {
        headers: {
          "X-AUTH-EMAIL": process.env.FCA_REGISTER_EMAIL!,
          "X-AUTH-KEY": process.env.FCA_REGISTER_API_KEY!,
          "Accept": "application/json",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Parse results from FCA API format
    return (data.Data || []).map((result: Record<string, string>) => ({
      type: type === "firm" ? "Firm" : "Individual",
      name: result["Name"] || "Unknown",
      reference: result["Reference Number"] || "",
      status: result["Status"] || "Unknown",
    }));
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * GET /api/fca-register/search?q={query}&type={firm|individual|all}
 * Search for firms or individuals in the FCA Register
 *
 * The FCA Search API requires both q (query) and type (firm/individual/fund) parameters.
 * When type=all (default), we search for both firms and individuals in parallel.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const searchType = searchParams.get("type") || "all";

    const trimmedQuery = query?.trim() || "";
    if (trimmedQuery.length < 2 || trimmedQuery.length > 100) {
      return NextResponse.json(
        { error: "Search query must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    let firms: SearchResult[] = [];
    let individuals: SearchResult[] = [];

    if (searchType === "firm") {
      firms = await searchFCA(trimmedQuery, "firm");
    } else if (searchType === "individual") {
      individuals = await searchFCA(trimmedQuery, "individual");
    } else {
      // Search both firms and individuals in parallel
      const [firmResults, individualResults] = await Promise.all([
        searchFCA(trimmedQuery, "firm"),
        searchFCA(trimmedQuery, "individual"),
      ]);
      firms = firmResults;
      individuals = individualResults;
    }

    // Combine results
    const results = [...firms, ...individuals];

    return NextResponse.json({
      query: trimmedQuery,
      results,
      firms,
      individuals,
      total: results.length,
      firmCount: firms.length,
      individualCount: individuals.length,
      message: results.length > 0 ? "Search successful" : "No results found",
    });
  } catch (error) {
    console.error("FCA Register search error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to perform search" },
      { status: 500 }
    );
  }
}
