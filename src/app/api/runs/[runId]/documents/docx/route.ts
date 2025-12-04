/**
 * DOCX Download API
 * GET /api/runs/:runId/documents/docx - Download generated DOCX
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/lib/documents/document-generator';
import type { Run, FirmProfile, Clause } from '@/lib/policies/types';

// Mock data (same as generate route - in production, fetch from database)
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
    body_md: `## Enhanced Due Diligence for Domestic Politically Exposed Persons

{{ firm_name }} has identified that it serves clients who are Domestic Politically Exposed Persons (PEPs).

### Requirements

The firm must apply enhanced due diligence (EDD) measures for all Domestic PEP clients, including:

- Enhanced identity verification procedures
- Source of wealth and source of funds verification
- Ongoing monitoring with increased frequency
- Senior management approval for establishing business relationships

### Approval Authority

All Domestic PEP relationships must be approved by: **{{ approver_role }}**

### Review Frequency

EDD reviews for Domestic PEPs must be conducted at least **quarterly**.`,
    tags: ['aml', 'pep', 'edd'],
    risk_refs: ['AML-001', 'PEP-DOM'],
    is_mandatory: false,
    display_order: 1,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    policy_id: 'aml',
    code: 'aml_retail_cdd',
    title: 'Customer Due Diligence for Retail Clients',
    body_md: `## Customer Due Diligence for Retail Clients

{{ firm_name }} serves retail clients and must apply appropriate customer due diligence (CDD) measures.

### Standard CDD Requirements

For all retail clients, the firm must:

- Verify identity using reliable, independent source documents
- Understand the nature and purpose of the business relationship
- Conduct ongoing monitoring of the business relationship
- Keep records of all CDD measures for at least 5 years

### Risk-Based Approach

CDD measures must be applied on a risk-sensitive basis, with enhanced measures for higher-risk clients.`,
    tags: ['aml', 'cdd', 'retail'],
    risk_refs: ['AML-002', 'CDD-RET'],
    is_mandatory: true,
    display_order: 2,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    policy_id: 'aml',
    code: 'aml_enhanced_monitoring',
    title: 'Enhanced Transaction Monitoring',
    body_md: `## Enhanced Transaction Monitoring

Based on {{ firm_name }}'s risk assessment (Risk Score: **{{ risk_score }}**), enhanced transaction monitoring procedures are recommended.

### Enhanced Monitoring Triggers

The firm must implement automated monitoring for:

- Transactions exceeding £10,000
- Unusual patterns or behaviors
- Transactions involving high-risk jurisdictions
- Multiple transactions just below reporting thresholds

### Alert Investigation

All monitoring alerts must be:

1. Reviewed within 24 hours
2. Investigated by trained compliance staff
3. Escalated to the MLRO if suspicious
4. Documented with investigation findings`,
    tags: ['aml', 'monitoring', 'transaction'],
    risk_refs: ['AML-003', 'TM-ENH'],
    is_mandatory: false,
    display_order: 3,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// =====================================================
// GET - Download DOCX
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    // In production, check if document already exists in storage
    // If yes, return signed URL or stream from storage
    // If no, generate on-demand

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

    // Generate document
    const result = await generateDocument({
      run,
      policy,
      firmProfile,
      clauses,
      rulesResult,
    });

    // Return DOCX as downloadable file
    return new NextResponse(result.docx_buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${result.filename}.docx"`,
        'Content-Length': result.docx_buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading DOCX:', error);
    return NextResponse.json(
      {
        error: 'Failed to download DOCX',
        code: 'DOWNLOAD_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
