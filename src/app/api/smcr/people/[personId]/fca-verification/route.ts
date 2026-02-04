/**
 * FCA Verification API Routes
 * POST /api/smcr/people/:personId/fca-verification - Save verification data
 * GET  /api/smcr/people/:personId/fca-verification - Get verification data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFirm,
  getPerson,
  updatePerson,
  initSmcrDatabase,
} from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

const MAX_CONTROL_FUNCTIONS = 200;

interface ControlFunctionInput {
  function: string;
  firmName: string;
  frn: string;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

function isValidISODate(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  // Reject dates unreasonably far in the future
  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) return false;
  return true;
}

function sanitizeControlFunction(cf: unknown): ControlFunctionInput | null {
  if (!cf || typeof cf !== 'object') return null;
  const obj = cf as Record<string, unknown>;
  if (typeof obj.function !== 'string' || typeof obj.status !== 'string') return null;
  return {
    function: String(obj.function).slice(0, 200),
    firmName: String(obj.firmName ?? '').slice(0, 200),
    frn: String(obj.frn ?? '').slice(0, 20),
    status: String(obj.status).slice(0, 50),
    effectiveFrom: String(obj.effectiveFrom ?? '').slice(0, 30),
    effectiveTo: obj.effectiveTo ? String(obj.effectiveTo).slice(0, 30) : undefined,
  };
}

function validateAndSanitizeBody(body: unknown): {
  valid: boolean;
  error?: string;
  sanitized?: {
    status: string;
    lastChecked: string;
    controlFunctions: ControlFunctionInput[];
    hasEnforcementHistory: boolean;
    irn?: string;
  };
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.status !== 'string' || obj.status.length === 0) {
    return { valid: false, error: 'Missing or invalid field: status (string required)' };
  }

  if (!isValidISODate(obj.lastChecked)) {
    return { valid: false, error: 'Missing or invalid field: lastChecked (valid ISO date required)' };
  }

  const rawFunctions = Array.isArray(obj.controlFunctions) ? obj.controlFunctions : [];
  if (rawFunctions.length > MAX_CONTROL_FUNCTIONS) {
    return { valid: false, error: `controlFunctions exceeds maximum of ${MAX_CONTROL_FUNCTIONS} entries` };
  }

  const controlFunctions: ControlFunctionInput[] = [];
  for (const cf of rawFunctions) {
    const sanitized = sanitizeControlFunction(cf);
    if (sanitized) controlFunctions.push(sanitized);
  }

  return {
    valid: true,
    sanitized: {
      status: String(obj.status).slice(0, 50),
      lastChecked: String(obj.lastChecked),
      controlFunctions,
      hasEnforcementHistory: Boolean(obj.hasEnforcementHistory),
      irn: typeof obj.irn === 'string' ? obj.irn.slice(0, 20) : undefined,
    },
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('POST', `/api/smcr/people/${personId}/fca-verification`);

  try {
    const { auth, error: authError } = await requireRole("member");
    if (authError) return authError;
    await initSmcrDatabase();

    const body = await request.json();
    const { valid, error: validationError, sanitized } = validateAndSanitizeBody(body);

    if (!valid || !sanitized) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const person = await getPerson(personId);
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    const firm = await getFirm(person.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const verificationPayload = {
      status: sanitized.status,
      lastChecked: sanitized.lastChecked,
      controlFunctions: sanitized.controlFunctions,
      hasEnforcementHistory: sanitized.hasEnforcementHistory,
    };

    const updates: Record<string, unknown> = {
      fca_verification: verificationPayload,
    };

    if (sanitized.irn) {
      updates.irn = sanitized.irn;
    }

    const updated = await updatePerson(personId, updates);

    return NextResponse.json({
      success: true,
      irn: updated?.irn ?? person.irn,
      fcaVerification: updated?.fca_verification ?? verificationPayload,
    });
  } catch (error) {
    logError(error, 'Failed to save FCA verification', { personId });
    return NextResponse.json(
      { error: 'Failed to save FCA verification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('GET', `/api/smcr/people/${personId}/fca-verification`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const person = await getPerson(personId);
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    const firm = await getFirm(person.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      irn: person.irn,
      fcaVerification: person.fca_verification,
    });
  } catch (error) {
    logError(error, 'Failed to fetch FCA verification', { personId });
    return NextResponse.json(
      { error: 'Failed to fetch FCA verification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
