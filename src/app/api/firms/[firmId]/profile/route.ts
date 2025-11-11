/**
 * Firm Profile API Routes
 * GET /api/firms/:firmId/profile - Get firm profile
 * POST /api/firms/:firmId/profile - Create/update firm profile
 * PATCH /api/firms/:firmId/profile - Partial update
 * DELETE /api/firms/:firmId/profile - Delete firm profile
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFirmProfile,
  upsertFirmProfile,
  updateFirmAttributes,
  updateFirmBranding,
  deleteFirmProfile,
} from '@/lib/server/firm-profile-store';
import type { FirmProfileCreate } from '@/lib/policies/types';

// =====================================================
// GET - Retrieve firm profile
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
  try {
    const firmId = params.firmId;

    const profile = await getFirmProfile(firmId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Firm profile not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching firm profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch firm profile',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create or fully update firm profile
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
  try {
    const firmId = params.firmId;
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: [{ field: 'name', message: 'Name is required', code: 'REQUIRED' }],
        },
        { status: 400 }
      );
    }

    const profileData: FirmProfileCreate = {
      firm_id: firmId,
      name: body.name,
      attributes: body.attributes || {},
      branding: body.branding || {},
    };

    const profile = await upsertFirmProfile(profileData);

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating firm profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to save firm profile',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Partial update (attributes or branding)
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
  try {
    const firmId = params.firmId;
    const body = await request.json();

    let profile;

    if (body.attributes) {
      profile = await updateFirmAttributes(firmId, body.attributes);
    } else if (body.branding) {
      profile = await updateFirmBranding(firmId, body.branding);
    } else {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'attributes',
              message: 'Either attributes or branding must be provided',
              code: 'REQUIRED',
            },
          ],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error updating firm profile:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update firm profile',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete firm profile
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
  try {
    const firmId = params.firmId;

    const deleted = await deleteFirmProfile(firmId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Firm profile not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting firm profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete firm profile',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
