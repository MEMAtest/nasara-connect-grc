/**
 * SMCR Firms API Routes
 * GET /api/smcr/firms - List all firms
 * POST /api/smcr/firms - Create a new firm
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFirm, getFirms, initSmcrDatabase } from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/smcr/firms');

  try {
    await initSmcrDatabase();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || undefined;

    const firms = await getFirms(organizationId);
    return NextResponse.json(firms);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR firms');
    return NextResponse.json(
      { error: 'Failed to fetch firms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/smcr/firms');

  try {
    await initSmcrDatabase();

    const body = await request.json();
    const { name, organizationId } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Firm name is required' },
        { status: 400 }
      );
    }

    const firm = await createFirm(name.trim(), organizationId);
    return NextResponse.json(firm, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR firm');
    return NextResponse.json(
      { error: 'Failed to create firm', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
