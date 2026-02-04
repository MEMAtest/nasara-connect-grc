import { NextResponse } from "next/server";
import {
  screenBatch,
  ScreeningRecord,
  ScreeningOptions,
  validateThreshold,
  getAvailableLists,
  getDataSourceStatus,
} from "@/lib/screening/engine";
import { logError } from "@/lib/logger";
import { requireRole } from "@/lib/rbac";

interface BatchScreeningRequest {
  records: Array<{
    id?: string;
    name: string;
    type?: "individual" | "company";
    dob?: string;
    country?: string;
    idNumber?: string;
    aliases?: string[];
  }>;
  options?: Partial<ScreeningOptions>;
}

export async function POST(request: Request) {
  // Require authentication
  const { auth, error } = await requireRole("member");
  if (error) return error;

  try {
    const body = await request.json() as BatchScreeningRequest;

    if (!body.records || !Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json(
        { error: "No records provided for screening" },
        { status: 400 }
      );
    }

    // Validate record count (limit for performance)
    if (body.records.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 records per batch" },
        { status: 400 }
      );
    }

    // Transform and validate records
    const records: ScreeningRecord[] = body.records.map((record, index) => ({
      id: record.id || `batch-${index}`,
      name: record.name.trim(),
      type: record.type || "individual",
      dob: record.dob || null,
      country: record.country || null,
      idNumber: record.idNumber || null,
      aliases: record.aliases || [],
    }));

    // Validate required fields
    const invalidRecords = records.filter(r => !r.name || r.name.length < 2);
    if (invalidRecords.length > 0) {
      return NextResponse.json(
        { error: `${invalidRecords.length} records have invalid names (min 2 characters)` },
        { status: 400 }
      );
    }

    // Build options with defaults
    // Allow demo data in non-production environments
    const allowDemoData = process.env.NODE_ENV !== "production" ||
                          process.env.ALLOW_DEMO_SCREENING === "true";

    const options: Partial<ScreeningOptions> = {
      threshold: validateThreshold(body.options?.threshold ?? 0.7),
      lists: body.options?.lists ?? ["ofac", "eu", "uk", "un"],
      includeAliases: body.options?.includeAliases ?? true,
      checkDob: body.options?.checkDob ?? true,
      checkCountry: body.options?.checkCountry ?? true,
      allowDemoData,
    };

    // Run screening
    const { results, isDemoData, warning } = await screenBatch(records, options);

    // Calculate summary
    const summary = {
      total: results.length,
      clear: results.filter(r => r.status === "clear").length,
      potentialMatches: results.filter(r => r.status === "potential_match").length,
      confirmedMatches: results.filter(r => r.status === "confirmed_match").length,
      totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
      screenedAt: new Date().toISOString(),
      options,
      // Include warning about demo data
      isDemoData,
      warning,
      // Include user info for audit trail
      screenedBy: {
        userId: auth.userId,
        userEmail: auth.userEmail,
        organizationId: auth.organizationId,
      },
    });
  } catch (error) {
    logError(error, "Batch screening error");

    // Check if it's a "no data sources" error
    if (error instanceof Error && error.message.includes("No real data sources configured")) {
      return NextResponse.json(
        {
          error: "Screening not available",
          details: error.message,
          isDemoData: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Screening failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Require authentication
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { auth, error } = await requireRole("member");
  if (error) return error;

  // Return available screening lists and data source status
  const dataSourceStatus = getDataSourceStatus();

  return NextResponse.json({
    lists: getAvailableLists(),
    defaultThreshold: 0.7,
    maxBatchSize: 1000,
    dataSourceStatus,
  });
}
