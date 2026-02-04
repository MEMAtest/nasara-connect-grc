import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initDatabase,
  getAuthorizationPack,
  updateAuthorizationPack,
  getPackSections,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/auth-utils";

// Allowed fields for pack updates
const ALLOWED_UPDATE_FIELDS = new Set([
  'name', 'status', 'target_submission_date', 'assessment_data', 'project_plan'
]);

// Valid pack statuses
const VALID_STATUSES = new Set(['draft', 'in_progress', 'review', 'submitted', 'approved']);

// Verify pack belongs to user's organization
async function verifyPackOwnership(packId: string, organizationId: string): Promise<{ pack: Awaited<ReturnType<typeof getAuthorizationPack>> | null; hasAccess: boolean }> {
  const pack = await getAuthorizationPack(packId);
  if (!pack) return { pack: null, hasAccess: false };
  return { pack, hasAccess: pack.organization_id === organizationId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const { pack, hasAccess } = await verifyPackOwnership(packId, auth.organizationId);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get sections for additional context
    const sections = await getPackSections(packId);

    return NextResponse.json({
      ...pack,
      sections: sections.map((s) => ({
        id: s.id,
        code: s.template.code,
        name: s.template.name,
        status: s.status,
        progress: s.progress_percentage,
        orderIndex: s.template.order_index,
      })),
    });
  } catch (error) {
    logError(error, "Failed to fetch pack");
    return NextResponse.json({ error: "Failed to fetch pack" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const { pack, hasAccess } = await verifyPackOwnership(packId, auth.organizationId);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();

    // Filter to only allowed fields
    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_UPDATE_FIELDS.has(key)) {
        safeUpdates[key] = value;
      }
    }

    // Validate status if provided
    if (safeUpdates.status && !VALID_STATUSES.has(safeUpdates.status as string)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Validate name if provided
    if (safeUpdates.name !== undefined) {
      if (typeof safeUpdates.name !== 'string' || (safeUpdates.name as string).trim().length === 0) {
        return NextResponse.json({ error: "Pack name cannot be empty" }, { status: 400 });
      }
      if ((safeUpdates.name as string).length > 255) {
        return NextResponse.json({ error: "Pack name too long (max 255 characters)" }, { status: 400 });
      }
    }

    const updated = await updateAuthorizationPack(packId, safeUpdates);

    if (!updated) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, "Failed to update pack");
    return NextResponse.json({ error: "Failed to update pack" }, { status: 500 });
  }
}
