/**
 * Firm Defaults API Route
 * GET /api/firms/:firmId/defaults - Get default answers for wizard based on firm attributes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirmDefaults } from '@/lib/server/firm-profile-store';

// =====================================================
// GET - Get default wizard answers from firm profile
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
  try {
    const firmId = params.firmId;

    const defaults = await getFirmDefaults(firmId);

    return NextResponse.json(
      {
        firm_id: firmId,
        defaults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching firm defaults:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch firm defaults',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
