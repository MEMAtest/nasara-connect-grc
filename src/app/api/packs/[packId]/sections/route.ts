import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPackSections,
  updatePackSection,
  getAuthorizationPack,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

// Valid section statuses
const VALID_STATUSES = new Set(['not_started', 'in_progress', 'draft', 'review', 'approved']);

// Verify pack belongs to user's organization
async function verifyPackOwnership(packId: string, organizationId: string): Promise<boolean> {
  const pack = await getAuthorizationPack(packId);
  return pack !== null && pack.organization_id === organizationId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sections = await getPackSections(packId);

    // Transform to client-friendly format
    const formattedSections = sections.map((s) => ({
      id: s.id,
      packId: s.pack_id,
      code: s.template.code,
      name: s.template.name,
      guidanceText: s.template.guidance_text,
      regulatoryReference: s.template.regulatory_reference,
      orderIndex: s.template.order_index,
      status: s.status,
      progressPercentage: s.progress_percentage,
      narrativeContent: s.narrative_content,
      definitionOfDone: s.template.definition_of_done,
      definitionOfDoneStatus: s.definition_of_done_status,
      evidenceRequirements: s.template.evidence_requirements,
      submittedAt: s.submitted_at,
      reviewedBy: s.reviewed_by,
      approvedBy: s.approved_by,
      approvedAt: s.approved_at,
    }));

    return NextResponse.json({ sections: formattedSections });
  } catch (error) {
    logError(error, "Failed to fetch sections");
    return NextResponse.json({ error: "Failed to fetch sections", sections: [] }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { sectionId, ...updates } = body;

    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    }

    if (!isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    // Validate status if provided
    if (updates.status && !VALID_STATUSES.has(updates.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Validate progressPercentage if provided
    if (updates.progressPercentage !== undefined) {
      const progress = Number(updates.progressPercentage);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return NextResponse.json({ error: "Progress percentage must be between 0 and 100" }, { status: 400 });
      }
    }

    // Validate UUID fields if provided
    if (updates.reviewedBy && !isValidUUID(updates.reviewedBy)) {
      return NextResponse.json({ error: "Invalid reviewer ID format" }, { status: 400 });
    }
    if (updates.approvedBy && !isValidUUID(updates.approvedBy)) {
      return NextResponse.json({ error: "Invalid approver ID format" }, { status: 400 });
    }

    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progressPercentage !== undefined) dbUpdates.progress_percentage = updates.progressPercentage;
    if (updates.narrativeContent !== undefined) dbUpdates.narrative_content = updates.narrativeContent;
    if (updates.definitionOfDoneStatus !== undefined) dbUpdates.definition_of_done_status = updates.definitionOfDoneStatus;
    if (updates.submittedAt !== undefined) dbUpdates.submitted_at = updates.submittedAt;
    if (updates.reviewedBy !== undefined) dbUpdates.reviewed_by = updates.reviewedBy;
    if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
    if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;

    const updated = await updatePackSection(sectionId, dbUpdates);

    if (!updated) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, section: updated });
  } catch (error) {
    logError(error, "Failed to update section");
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}
