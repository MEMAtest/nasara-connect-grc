import { NextResponse } from "next/server";
import { Packer } from "docx";
import { requireRole } from "@/lib/rbac";
import { getPolicyById } from "@/lib/server/policy-store";
import { renderClause, renderLiquidTemplate } from "@/lib/policies/liquid-renderer";
import { resolveNotePlaceholders } from "@/lib/policies/section-notes";
import { generateDocx, type PolicySection } from "@/lib/documents/docx-generator";
import { applyTiering, type DetailLevel, type TieredSection } from "@/lib/policies/clause-tiers";
import { applyOptionSelections } from "@/lib/policies/section-options";
import type { JsonValue } from "@/lib/policies/types";

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function isTocClause(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 6) return false;
  const tocLines = lines.filter((line) => /\d{1,3}$/.test(line) && !/[.!?]$/.test(line));
  return tocLines.length / lines.length >= 0.7;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { policyId } = await params;
    const policy = await getPolicyById(auth.organizationId, policyId);

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Parse URL params for detail level override
    const url = new URL(request.url);
    const detailLevelParam = url.searchParams.get('detailLevel') as DetailLevel | null;

    const customContent = (policy.customContent ?? {}) as {
      firmProfile?: Record<string, unknown>;
      policyInputs?: Record<string, unknown>;
      sectionClauses?: Record<string, string[]>;
      sectionNotes?: Record<string, string>;
      clauseVariables?: Record<string, Record<string, string>>;
      governance?: Record<string, unknown>;
      detailLevel?: DetailLevel;
      approvals?: Record<string, unknown>;
      sectionOptions?: Record<string, Record<string, string>>;
    };

    const firmProfile = (customContent.firmProfile ?? {}) as Record<string, unknown>;
    const policyInputs = (customContent.policyInputs ?? {}) as Record<string, unknown>;
    const firmName = typeof firmProfile.name === "string" && firmProfile.name.trim().length > 0
      ? firmProfile.name.trim()
      : "Firm";

    const governance = customContent.governance ?? {};
    const policyVersion = typeof governance.version === "string" && governance.version.trim().length > 0
      ? governance.version.trim()
      : "1.0";

    // Get detail level from params, policy customContent, or default to standard
    const detailLevel: DetailLevel = detailLevelParam
      || customContent.detailLevel
      || 'standard';

    const sectionClauses = customContent.sectionClauses ?? {};
    const sectionNotes = customContent.sectionNotes ?? {};
    const clauseVariables = customContent.clauseVariables ?? {};
    const approvals = {
      ...(policy.approvals ?? {}),
      ...(customContent.approvals ?? {}),
    };
    const sectionOptions = customContent.sectionOptions ?? {};

    // Values originate from JSON storage so are inherently JsonValue-shaped
    const renderContext = {
      firm: firmProfile,
      firm_name: firmName,
      permissions: policy.permissions,
      ...policyInputs,
    } as unknown as Record<string, JsonValue>;

    // Apply tiering to get limited, organized sections
    const tieredSections = applyTiering(
      policy.template,
      policy.clauses,
      detailLevel,
      Object.keys(sectionClauses).length > 0 ? sectionClauses : undefined
    );

    // Convert tiered sections to document sections with rendered content
    const documentSections: PolicySection[] = (tieredSections
      .map((tieredSection: TieredSection) => {
        // Filter out TOC-like clauses and render content
        const renderedClauses = tieredSection.clauses
          .filter((clause) => !isTocClause(clause.content))
          .map((clause) => {
            const rendered = renderClause(
              clause.content,
              renderContext,
              clauseVariables[clause.id] ?? {}
            );
            return {
              title: clause.title,
              code: clause.id,
              rendered_body: rendered,
              is_mandatory: clause.isMandatory ?? false,
            };
          });

        // Apply section options content if available
        const sectionId = tieredSection.originalSectionId || tieredSection.id;
        const optionsForSection = sectionOptions[sectionId];
        if (optionsForSection && Object.keys(optionsForSection).length > 0) {
          const optionContent = applyOptionSelections(
            optionsForSection,
            policy.template.code,
            sectionId
          );
          if (optionContent) {
            // Add options content as a special clause at the start of the section
            renderedClauses.unshift({
              title: '',
              code: `${sectionId}-options`,
              rendered_body: optionContent,
              is_mandatory: false,
            });
          }
        }

        if (renderedClauses.length === 0) {
          return null;
        }

        const rawNotes = tieredSection.originalSectionId
          ? sectionNotes[tieredSection.originalSectionId]
          : undefined;
        const renderedNotes =
          typeof rawNotes === "string" && rawNotes.trim().length > 0
            ? renderLiquidTemplate(rawNotes, renderContext)
            : rawNotes;
        const resolvedNotes =
          typeof renderedNotes === "string" && renderedNotes.trim().length > 0
            ? resolveNotePlaceholders(renderedNotes, firmName)
            : renderedNotes;

        return {
          id: tieredSection.id,
          title: tieredSection.title,
          sectionType: tieredSection.sectionType,
          clauses: renderedClauses,
          customNotes: resolvedNotes,
        };
      })
      .filter(Boolean)) as PolicySection[];

    // Build version history from governance data
    const versionHistory = [];
    if (policyVersion) {
      versionHistory.push({
        version: policyVersion,
        date: new Date().toLocaleDateString('en-GB'),
        author: typeof approvals.smfRole === 'string' ? approvals.smfRole : 'Policy Team',
        changes: 'Initial version generated',
      });
    }

    // Generate the professional document
    const docxDocument = generateDocx({
      policyTitle: policy.name,
      policyVersion,
      firmName,
      branding: {
        primary_color: "#4F46E5",
        secondary_color: "#14B8A6",
        font: "Calibri",
        watermark_drafts: policy.status === "draft",
      },
      sections: documentSections,
      metadata: {
        generated_at: new Date().toISOString(),
        effective_date: typeof governance.effectiveDate === "string"
          ? governance.effectiveDate
          : new Date().toISOString(),
        next_review_date: typeof governance.nextReviewAt === "string"
          ? governance.nextReviewAt
          : undefined,
        owner: typeof governance.owner === "string"
          ? governance.owner
          : typeof approvals.smfRole === "string"
            ? approvals.smfRole
            : "Compliance",
        approved_by: typeof approvals.smfRole === "string"
          ? approvals.smfRole
          : undefined,
        classification: "Internal Use Only",
      },
      watermark: policy.status === "draft",
      versionHistory: versionHistory.length > 0 ? versionHistory : undefined,
    });

    const docxBuffer = await Packer.toBuffer(docxDocument);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${sanitizeFilename(policy.name)}_v${sanitizeFilename(policyVersion)}_${timestamp}.docx`;

    return new NextResponse(docxBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating policy DOCX:", error);
    return NextResponse.json(
      {
        error: "Failed to generate policy DOCX",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
