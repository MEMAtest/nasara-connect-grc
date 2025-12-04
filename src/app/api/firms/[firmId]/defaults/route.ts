/**
 * Firm Defaults API Route
 * GET /api/firms/:firmId/defaults - Get default answers for wizard based on firm attributes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirmDefaults } from '@/lib/server/firm-profile-store';
import type { JsonValue } from '@/lib/policies/types';

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
    const { firmId } = await params;

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
        firm_id: 'demo-firm',
        defaults: fallbackDefaults,
        warning: 'Using fallback firm defaults (database unavailable)',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
