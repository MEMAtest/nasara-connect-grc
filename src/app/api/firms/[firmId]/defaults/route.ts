/**
 * Firm Defaults API Route
 * GET /api/firms/:firmId/defaults - Get default answers for wizard based on firm attributes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirmDefaults } from '@/lib/server/firm-profile-store';
import type { JsonValue } from '@/lib/policies/types';
import { logError } from '@/lib/logger';
import { requireAuth } from '@/lib/auth-utils';

const fallbackDefaults: Record<string, JsonValue> = {
  firm_role: 'principal',
  permissions: ['investment_advice', 'retail_distribution'],
  client_types: ['retail', 'professional'],
  channels: ['online', 'branch'],
  firm_size: 'medium',
  outsourcing: ['kyc_vendor'],
  high_risk_jurisdictions: ['None'],
  products: ['investment_portfolios'],
};

// =====================================================
// GET - Get default wizard answers from firm profile
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    const { firmId } = await params;

    if (firmId !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const defaults = await getFirmDefaults(firmId);

    return NextResponse.json(
      {
        firm_id: firmId,
        defaults,
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'Failed to fetch firm defaults');
    return NextResponse.json(
      {
        firm_id: 'unknown',
        defaults: fallbackDefaults,
        warning: 'Using fallback firm defaults (database unavailable)',
      },
      { status: 200 }
    );
  }
}
