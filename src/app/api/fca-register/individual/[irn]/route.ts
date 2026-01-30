import { NextRequest, NextResponse } from "next/server";
import { createFCAClient, isFCAApiError } from "@/lib/fca-register";

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

    // IRN format: typically alphanumeric, 3-10 characters
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

    const raw = response.Data[0];
    // FCA API nests individual fields under "Details"
    const details = (raw.Details || raw) as Record<string, string | undefined>;
    const normalized = {
      irn: details["IRN"] || irn,
      name: details["Full Name"] || details["Name"] || "",
      status: details["Status"] || "",
    };

    return NextResponse.json({
      individual: normalized,
      raw,
    });
  } catch (error) {
    if (isFCAApiError(error)) {
      if (error.status === 404) {
        console.warn(`FCA Register: Individual ${(await params).irn} not found`);
      } else {
        console.error("FCA Register individual lookup error:", error);
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("FCA Register individual lookup error:", error);

    return NextResponse.json(
      { error: "Unable to fetch individual details" },
      { status: 500 }
    );
  }
}
