import { NextRequest, NextResponse } from "next/server";
import { createFCAClient, FCAApiError } from "@/lib/fca-register";

interface RouteParams {
  params: Promise<{ irn: string }>;
}

/**
 * GET /api/fca-register/individual/[irn]
 * Look up an individual by their IRN (Individual Reference Number)
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
    const response = await client.getIndividual(irn);

    if (!response.Data || response.Data.length === 0) {
      return NextResponse.json(
        { error: "Individual not found" },
        { status: 404 }
      );
    }

    const individual = response.Data[0];
    const normalized = {
      irn: individual["IRN"],
      name: individual["Name"],
      status: individual["Status"],
    };

    return NextResponse.json({
      individual: normalized,
      raw: individual,
    });
  } catch (error) {
    console.error("FCA Register individual lookup error:", error);

    if ((error as FCAApiError).status) {
      const fcaError = error as FCAApiError;
      return NextResponse.json(
        { error: fcaError.message },
        { status: fcaError.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch individual details" },
      { status: 500 }
    );
  }
}
