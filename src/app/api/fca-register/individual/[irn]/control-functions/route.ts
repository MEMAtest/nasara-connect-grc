import { NextRequest, NextResponse } from "next/server";
import { createFCAClient, FCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ irn: string }>;
}

/**
 * GET /api/fca-register/individual/[irn]/control-functions
 * Get control functions (SMF approvals) for an individual
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { irn } = await params;

    // IRN format: typically alphanumeric, 6-10 characters
    if (!irn || !/^[A-Z0-9]{3,10}$/i.test(irn)) {
      return NextResponse.json(
        { error: "Invalid IRN format. IRN must be 3-10 alphanumeric characters." },
        { status: 400 }
      );
    }

    const client = createFCAClient();
    const response = await client.getIndividualControlFunctions(irn);

    const controlFunctions = (response.Data || []).map((cf) => ({
      firmName: cf["Firm Name"],
      frn: cf["FRN"],
      function: cf["Function"],
      status: cf["Status"],
      effectiveFrom: cf["Effective From"],
      effectiveTo: cf["Effective To"],
    }));

    // Identify active SMF roles
    const activeSMFs = controlFunctions.filter(
      (cf) => cf.function.startsWith("SMF") && !cf.effectiveTo
    );

    // Get unique firms where individual has roles
    const firms = [...new Set(controlFunctions.map((cf) => cf.frn))];

    return NextResponse.json({
      irn,
      controlFunctions,
      activeSMFs,
      total: controlFunctions.length,
      activeSMFCount: activeSMFs.length,
      associatedFirms: firms,
    });
  } catch (error) {
    console.error("FCA Register control functions lookup error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch control functions" },
      { status: 500 }
    );
  }
}
