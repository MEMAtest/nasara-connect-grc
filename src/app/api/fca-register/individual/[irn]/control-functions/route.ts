import { NextRequest, NextResponse } from "next/server";
import { createFCAClient, isFCAApiError } from "@/lib/fca-register";
import type { FCAControlFunctionEntry } from "@/lib/fca-register/types";
import { requireAuth } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ irn: string }>;
}

/**
 * GET /api/fca-register/individual/[irn]/control-functions
 * Get control functions (SMF approvals) for an individual
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const { irn } = await params;

    // IRN format: typically alphanumeric, 3-10 characters
    if (!irn || !/^[A-Z0-9]{3,10}$/i.test(irn)) {
      return NextResponse.json(
        { error: "Invalid IRN format. IRN must be 3-10 alphanumeric characters." },
        { status: 400 }
      );
    }

    const client = createFCAClient();
    const response = await client.getIndividualControlFunctions(irn);

    // FCA API returns { Data: [{ Current: { "(1)Name": {...} }, Previous: { ... } }] }
    const rawData = response.Data?.[0] || {};
    const currentRoles = rawData.Current || {};
    const previousRoles = rawData.Previous || {};

    function extractFRN(url?: string): string {
      if (!url) return "";
      const match = url.match(/Firm\/(\d+)/);
      return match ? match[1] : "";
    }

    function parseRoles(roles: Record<string, FCAControlFunctionEntry>, isCurrent: boolean) {
      return Object.entries(roles).map(([key, value]) => {
        const functionName = value["Name"] || key.replace(/^\(\d+\)/, "");
        return {
          firmName: value["Firm Name"] || "",
          frn: extractFRN(value["URL"]),
          function: functionName,
          status: isCurrent ? "Current" : "Previous",
          effectiveFrom: value["Effective Date"] || "",
          effectiveTo: isCurrent ? "" : (value["End Date"] || ""),
        };
      });
    }

    const controlFunctions = [
      ...parseRoles(currentRoles, true),
      ...parseRoles(previousRoles, false),
    ];

    // Identify active SMF roles (current roles starting with "SMF")
    const activeSMFs = controlFunctions.filter(
      (cf) => cf.function.startsWith("SMF") && cf.status === "Current"
    );

    // Get unique firms where individual has roles
    const firms = [...new Set(controlFunctions.map((cf) => cf.frn).filter(Boolean))];

    return NextResponse.json({
      irn,
      controlFunctions,
      activeSMFs,
      total: controlFunctions.length,
      activeSMFCount: activeSMFs.length,
      associatedFirms: firms,
    });
  } catch (error) {
    if (isFCAApiError(error)) {
      if (error.status === 404) {
        console.warn(`FCA Register: Control functions not found for ${(await params).irn}`);
      } else {
        console.error("FCA Register control functions lookup error:", error);
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("FCA Register control functions lookup error:", error);

    return NextResponse.json(
      { error: "Unable to fetch control functions" },
      { status: 500 }
    );
  }
}
