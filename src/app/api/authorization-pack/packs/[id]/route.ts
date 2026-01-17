import { NextRequest, NextResponse } from "next/server";
import {
  deletePack,
  getPack,
  getPackReadiness,
  updatePack,
} from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const readiness = await getPackReadiness(id);

    return NextResponse.json({
      pack: {
        id: pack.id,
        name: pack.name,
        status: pack.status,
        target_submission_date: pack.target_submission_date,
        created_at: pack.created_at,
        updated_at: pack.updated_at,
        template_type: pack.template_type,
        template_name: pack.template_name,
      },
      readiness,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const deleted = await deletePack(id);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete pack" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Pack deleted successfully" });
  } catch (error) {
    logError(error, "Failed to delete authorization pack");
    return NextResponse.json(
      { error: "Failed to delete pack" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const status = body.status as string | undefined;
    const targetSubmissionDate = body.targetSubmissionDate as string | null | undefined;

    const updated = await updatePack(id, {
      status,
      targetSubmissionDate,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update pack" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    logError(error, "Failed to update authorization pack");
    return NextResponse.json(
      { error: "Failed to update pack" },
      { status: 500 }
    );
  }
}
