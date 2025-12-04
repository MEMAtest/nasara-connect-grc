/**
 * Document Generation Service
 * Orchestrates the complete document generation workflow
 */

import { Packer } from 'docx';
import { renderClause } from '../policies/liquid-renderer';
import { generateDocx } from './docx-generator';
import type {
  Clause,
  Run,
  FirmProfile,
  RulesEngineResult,
  JsonValue,
} from '../policies/types';

// =====================================================
// TYPES
// =====================================================

export interface GenerateDocumentInput {
  run: Run;
  policy: {
    id: string;
    name: string;
    version: string;
  };
  firmProfile: FirmProfile;
  clauses: Clause[];
  rulesResult: RulesEngineResult;
  metadata?: {
    generated_by?: string;
    approved_by?: string;
    approved_at?: string;
    effective_date?: string;
  };
}

export interface GeneratedDocument {
  docx_buffer: Buffer;
  pdf_buffer?: Buffer;
  audit_bundle: AuditBundle;
  filename: string;
}

export interface AuditBundle {
  run_id: string;
  policy_id: string;
  policy_name: string;
  policy_version: string;
  firm_id: string;
  firm_name: string;
  generated_at: string;
  generated_by?: string;
  answers: Record<string, JsonValue>;
  visible_questions: string[];
  rules_fired: Array<{
    rule_name: string;
    condition_met: boolean;
  }>;
  included_clauses: string[];
  excluded_clauses: string[];
  suggested_clauses: Array<{
    code: string;
    reason: string;
  }>;
  variables: Record<string, JsonValue>;
  metadata?: Record<string, JsonValue>;
}

// =====================================================
// DOCUMENT GENERATION
// =====================================================

/**
 * Generate complete policy document package
 */
export async function generateDocument(
  input: GenerateDocumentInput
): Promise<GeneratedDocument> {
  const { run, policy, firmProfile, clauses, rulesResult, metadata } = input;

  // Step 1: Filter and sort clauses based on rules result
  const selectedClauses = clauses
    .filter((clause) => rulesResult.included_clauses.includes(clause.code))
    .sort((a, b) => a.display_order - b.display_order);

  // Step 2: Render each clause with Liquid variables
  const renderedClauses = selectedClauses.map((clause) => ({
    title: clause.title,
    code: clause.code,
    rendered_body: renderClause(clause.body_md, rulesResult.variables, run.answers),
    is_mandatory: clause.is_mandatory,
  }));

  // Step 3: Generate DOCX
  const docxDocument = generateDocx({
    policyTitle: policy.name,
    policyVersion: policy.version,
    firmName: firmProfile.name,
    branding: firmProfile.branding,
    clauses: renderedClauses,
    metadata: {
      generated_at: new Date().toISOString(),
      ...metadata,
    },
    watermark: run.status === 'draft' && firmProfile.branding.watermark_drafts,
  });

  // Step 4: Convert DOCX to buffer
  const docxBuffer = await Packer.toBuffer(docxDocument);

  // Step 5: Generate audit bundle
  const auditBundle: AuditBundle = {
    run_id: run.id,
    policy_id: policy.id,
    policy_name: policy.name,
    policy_version: policy.version,
    firm_id: run.firm_id,
    firm_name: firmProfile.name,
    generated_at: new Date().toISOString(),
    generated_by: metadata?.generated_by,
    answers: run.answers,
    visible_questions: [], // Would be populated from wizard state
    rules_fired: rulesResult.rules_fired,
    included_clauses: rulesResult.included_clauses,
    excluded_clauses: rulesResult.excluded_clauses,
    suggested_clauses: rulesResult.suggested_clauses,
    variables: rulesResult.variables,
    metadata: run.metadata,
  };

  // Step 6: Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedPolicyName = policy.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${sanitizedPolicyName}_v${policy.version}_${timestamp}`;

  return {
    docx_buffer: docxBuffer,
    audit_bundle: auditBundle,
    filename,
  };
}

/**
 * Generate audit bundle JSON
 */
export function generateAuditBundleJson(bundle: AuditBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Generate audit bundle as downloadable buffer
 */
export function generateAuditBundleBuffer(bundle: AuditBundle): Buffer {
  const json = generateAuditBundleJson(bundle);
  return Buffer.from(json, 'utf-8');
}

// =====================================================
// PDF GENERATION (Placeholder)
// =====================================================

/**
 * Convert DOCX buffer to PDF
 *
 * NOTE: This is a placeholder. In production, you would:
 * 1. Use a service like LibreOffice headless (soffice --headless --convert-to pdf)
 * 2. Use a cloud service like DocRaptor, CloudConvert, or PDFShift
 * 3. Use Puppeteer to render HTML → PDF (requires converting DOCX → HTML first)
 *
 * For now, this returns null. Implement based on your infrastructure.
 */
export async function convertDocxToPdf(
  docxBuffer: Buffer,
  options?: {
    libreOfficePath?: string;
    cloudServiceApiKey?: string;
  }
): Promise<Buffer | null> {
  // TODO: Implement PDF conversion
  //
  // Example using LibreOffice (requires libreoffice installed):
  //
  // import { exec } from 'child_process';
  // import { promisify } from 'util';
  // import { writeFile, readFile, unlink } from 'fs/promises';
  // import { tmpdir } from 'os';
  // import { join } from 'path';
  //
  // const execAsync = promisify(exec);
  //
  // const tempDir = tmpdir();
  // const tempDocxPath = join(tempDir, `temp_${Date.now()}.docx`);
  // const tempPdfPath = tempDocxPath.replace('.docx', '.pdf');
  //
  // try {
  //   // Write DOCX to temp file
  //   await writeFile(tempDocxPath, docxBuffer);
  //
  //   // Convert using LibreOffice
  //   await execAsync(
  //     `soffice --headless --convert-to pdf --outdir ${tempDir} ${tempDocxPath}`
  //   );
  //
  //   // Read PDF
  //   const pdfBuffer = await readFile(tempPdfPath);
  //
  //   // Cleanup
  //   await unlink(tempDocxPath);
  //   await unlink(tempPdfPath);
  //
  //   return pdfBuffer;
  // } catch (error) {
  //   console.error('PDF conversion failed:', error);
  //   return null;
  // }

  void docxBuffer;
  void options;
  console.warn('PDF conversion not implemented. Returning null.');
  return null;
}

/**
 * Generate complete document package with PDF
 */
export async function generateDocumentWithPdf(
  input: GenerateDocumentInput
): Promise<GeneratedDocument> {
  const result = await generateDocument(input);

  // Optionally convert to PDF
  try {
    const pdfBuffer = await convertDocxToPdf(result.docx_buffer);
    if (pdfBuffer) {
      result.pdf_buffer = pdfBuffer;
    }
  } catch (error) {
    console.error('PDF conversion failed, continuing without PDF:', error);
  }

  return result;
}
