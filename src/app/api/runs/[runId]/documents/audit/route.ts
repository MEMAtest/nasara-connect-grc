/**
 * Audit Bundle Download API
 * GET /api/runs/:runId/documents/audit - Download audit bundle JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDocument, generateAuditBundleBuffer } from '@/lib/documents/document-generator';
import type { Run, FirmProfile, Clause } from '@/lib/policies/types';
import { requireAuth } from '@/lib/auth-utils';

// Mock data (same as other routes)
const MOCK_RUN: Run = {
  id: 'run-001',
  firm_id: '00000000-0000-0000-0000-000000000001',
  policy_id: 'aml',
  status: 'draft',
  answers: {
    firm_role: 'principal',
    pep_domestic: true,
    client_types: ['retail', 'professional'],
    risk_score: 75,
    firm_name: 'Acme Financial Services Ltd',
  },
  selected_clause_codes: ['aml_edd_domestic_pep', 'aml_retail_cdd', 'aml_enhanced_monitoring'],
  variables: {
    approver_role: 'SMF17',
  },
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_FIRM_PROFILE: FirmProfile = {
  firm_id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Financial Services Ltd',
  attributes: {
    permissions: ['credit_broking', 'insurance_mediation'],
    client_types: ['retail', 'professional'],
    channels: ['online', 'telephone'],
    ar_or_principal: 'principal',
    size: 'medium',
    outsourcing: ['kyc_vendor'],
  },
  branding: {
    logo_url: '',
    primary_color: '#4F46E5',
    secondary_color: '#10B981',
    font: 'Calibri',
    watermark_drafts: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_CLAUSES: Clause[] = [
  {
    id: '1',
    policy_id: 'aml',
    code: 'aml_edd_domestic_pep',
    title: 'Enhanced Due Diligence for Domestic PEPs',
    body_md: '...',
    tags: ['aml', 'pep', 'edd'],
    risk_refs: ['AML-001', 'PEP-DOM'],
    is_mandatory: false,
    display_order: 1,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// =====================================================
// GET - Download Audit Bundle
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const { runId } = await params;

    const run = { ...MOCK_RUN, id: runId };
    const policy = { id: 'aml', name: 'AML/CTF Policy', version: '1.0.0' };
    const firmProfile = MOCK_FIRM_PROFILE;
    const clauses = MOCK_CLAUSES;

    const rulesResult = {
      included_clauses: run.selected_clause_codes,
      excluded_clauses: [],
      suggested_clauses: [],
      variables: run.variables || {},
      rules_fired: [],
    };

    // Generate document to get audit bundle
    const result = await generateDocument({
      run,
      policy,
      firmProfile,
      clauses,
      rulesResult,
    });

    // Convert audit bundle to buffer
    const auditBuffer = generateAuditBundleBuffer(result.audit_bundle);

    // Return JSON as downloadable file
    return new NextResponse(auditBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${result.filename}_audit.json"`,
        'Content-Length': auditBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading audit bundle:', error);
    return NextResponse.json(
      {
        error: 'Failed to download audit bundle',
        code: 'DOWNLOAD_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
