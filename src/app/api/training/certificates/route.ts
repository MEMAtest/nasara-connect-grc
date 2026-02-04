/**
 * Training Certificate API Routes
 * POST /api/training/certificates - Log certificate download event
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { logError, logApiRequest } from "@/lib/logger";
import { getCertificateDownloads, initTrainingDatabase, logCertificateDownload } from "@/lib/training-database";

export async function GET() {
  logApiRequest("GET", "/api/training/certificates");

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    if (!auth.userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initTrainingDatabase();
    const certificates = await getCertificateDownloads(auth.userEmail);

    return NextResponse.json({ certificates });
  } catch (error) {
    logError(error, "Failed to fetch certificate downloads");
    return NextResponse.json(
      { error: "Failed to fetch certificate downloads", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest("POST", "/api/training/certificates");

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    if (!auth.userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { moduleId, score } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    await initTrainingDatabase();
    await logCertificateDownload(auth.userEmail, moduleId, typeof score === "number" ? score : undefined);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    logError(error, "Failed to log certificate download");
    return NextResponse.json(
      { error: "Failed to log certificate download", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
