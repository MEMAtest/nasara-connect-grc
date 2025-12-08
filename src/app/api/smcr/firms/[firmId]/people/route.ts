/**
 * SMCR People API Routes
 * GET /api/smcr/firms/:firmId/people - List all people in firm
 * POST /api/smcr/firms/:firmId/people - Create a new person
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createPerson,
  getPeople,
  initSmcrDatabase,
  CreatePersonInput,
} from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/people`);

  try {
    await initSmcrDatabase();

    const people = await getPeople(firmId);
    return NextResponse.json(people);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR people', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch people', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('POST', `/api/smcr/firms/${firmId}/people`);

  try {
    await initSmcrDatabase();

    const body = await request.json();
    const { name, email, department, title, phone, address, lineManager, startDate, hireDate, endDate } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      );
    }

    const input: CreatePersonInput = {
      firm_id: firmId,
      name: name.trim(),
      email,
      department,
      title,
      phone,
      address,
      line_manager: lineManager,
      start_date: startDate,
      hire_date: hireDate,
      end_date: endDate,
    };

    const person = await createPerson(input);
    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR person', { firmId });
    return NextResponse.json(
      { error: 'Failed to create person', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
