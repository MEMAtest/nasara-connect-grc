import { NextRequest, NextResponse } from "next/server";
import { getFCAConfig, isFCAApiError } from "@/lib/fca-register";
import { requireRole } from "@/lib/rbac";

interface SearchResult {
  type: "Firm" | "Individual";
  name: string;
  reference: string;
  status: string;
}

async function searchFCA(
  query: string,
  type: "firm" | "individual",
  config: { email: string; apiKey: string; baseUrl: string }
): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${config.baseUrl}/Search?q=${encodeURIComponent(query)}&type=${type}`,
      {
        headers: {
          "X-AUTH-EMAIL": config.email,
          "X-AUTH-KEY": config.apiKey,
          "Accept": "application/json",
        },
        signal: controller.signal,
      }
    );

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
    return [];
  } finally {
    clearTimeout(timeoutId);
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
    const { error } = await requireRole("member");
    if (error) return error;
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

    const config = getFCAConfig();

    let firms: SearchResult[] = [];
    let individuals: SearchResult[] = [];

    if (searchType === "firm") {
      firms = await searchFCA(trimmedQuery, "firm", config);
    } else if (searchType === "individual") {
      individuals = await searchFCA(trimmedQuery, "individual", config);
    } else {
      // Search both firms and individuals in parallel
      const [firmResults, individualResults] = await Promise.all([
        searchFCA(trimmedQuery, "firm", config),
        searchFCA(trimmedQuery, "individual", config),
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

    if (isFCAApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to perform search" },
      { status: 500 }
    );
  }
}
