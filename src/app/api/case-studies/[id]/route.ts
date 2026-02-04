import { NextRequest, NextResponse } from 'next/server';
import {
  getCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  initDatabase,
  pool,
} from '@/lib/database';
import { requireRole } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/api-utils";

// GET: Fetch a single case study by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole("member");
    if (error) return error;
    await initDatabase();

    const { id } = await params;
    const caseStudy = await getCaseStudy(id);

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching case study:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    );
  }
}

// PUT: Update a case study (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole("member");
    if (error) return error;
    await initDatabase();

    const { id } = await params;
    const body = await request.json();

    const updated = await updateCaseStudy(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating case study:', error);
    }
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a case study (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("admin");
    if (error) return error;
    await initDatabase();

    const { id } = await params;
    const deleted = await deleteCaseStudy(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    await logAuditEvent(pool, {
      entityType: 'case_study',
      entityId: id,
      action: 'deleted',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting case study:', error);
    }
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    );
  }
}
