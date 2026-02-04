/**
 * Clause Tiering System
 * Controls document length by limiting clauses per section based on detail level
 */

import type { PolicyTemplate, PolicyClause, PolicyTemplateSection } from './templates';

export type DetailLevel = 'essential' | 'standard' | 'comprehensive';

/**
 * Clause limits per section by detail level
 * Essential: 8-12 pages total (1-2 clauses per section)
 * Standard: 15-20 pages total (2-4 clauses per section)
 * Comprehensive: 25-30 pages total (4-6 clauses per section)
 */
export const SECTION_LIMITS: Record<DetailLevel, { min: number; max: number; appendixMax: number }> = {
  essential: { min: 1, max: 2, appendixMax: 1 },
  standard: { min: 2, max: 4, appendixMax: 2 },
  comprehensive: { min: 3, max: 6, appendixMax: 4 },
};

/**
 * Priority keywords for clause selection
 * Clauses containing these keywords are prioritized
 */
const PRIORITY_KEYWORDS = {
  essential: [
    'purpose',
    'scope',
    'definition',
    'mandatory',
    'requirement',
    'compliance',
    'fca',
    'regulatory',
    'principle',
    'obligation',
  ],
  standard: [
    'procedure',
    'process',
    'responsible',
    'governance',
    'oversight',
    'monitoring',
    'reporting',
    'escalation',
    'timeline',
  ],
  comprehensive: [
    'appendix',
    'template',
    'checklist',
    'example',
    'case study',
    'detailed',
    'enhanced',
    'additional',
  ],
};

/**
 * Standard FCA policy sections
 * Maps template sections to standard document structure
 */
export const STANDARD_SECTIONS = [
  { id: 'purpose', title: 'Purpose & Objectives', sectionType: 'policy' as const },
  { id: 'scope', title: 'Scope & Applicability', sectionType: 'policy' as const },
  { id: 'definitions', title: 'Definitions', sectionType: 'policy' as const },
  { id: 'policy', title: 'Policy Statements', sectionType: 'policy' as const },
  { id: 'procedures', title: 'Procedures & Processes', sectionType: 'procedure' as const },
  { id: 'roles', title: 'Roles & Responsibilities', sectionType: 'policy' as const },
  { id: 'governance', title: 'Governance & Oversight', sectionType: 'policy' as const },
  { id: 'monitoring', title: 'Monitoring & Reporting', sectionType: 'procedure' as const },
  { id: 'training', title: 'Training Requirements', sectionType: 'policy' as const },
  { id: 'related', title: 'Related Policies', sectionType: 'policy' as const },
] as const;

/**
 * Calculate clause priority score
 * Higher score = more important clause
 */
function calculateClausePriority(
  clause: PolicyClause,
  detailLevel: DetailLevel,
  isMandatory: boolean
): number {
  let score = 0;

  // Mandatory clauses get highest priority
  if (isMandatory || clause.isMandatory) {
    score += 100;
  }

  // Check for priority keywords based on detail level
  const titleLower = clause.title.toLowerCase();
  const contentLower = (clause.content || '').toLowerCase().substring(0, 500);

  // Essential keywords always prioritized
  PRIORITY_KEYWORDS.essential.forEach((keyword) => {
    if (titleLower.includes(keyword)) score += 20;
    if (contentLower.includes(keyword)) score += 5;
  });

  // Standard keywords for standard+ levels
  if (detailLevel !== 'essential') {
    PRIORITY_KEYWORDS.standard.forEach((keyword) => {
      if (titleLower.includes(keyword)) score += 15;
      if (contentLower.includes(keyword)) score += 3;
    });
  }

  // Comprehensive keywords only for comprehensive level
  if (detailLevel === 'comprehensive') {
    PRIORITY_KEYWORDS.comprehensive.forEach((keyword) => {
      if (titleLower.includes(keyword)) score += 10;
      if (contentLower.includes(keyword)) score += 2;
    });
  }

  // Penalize very long clauses for essential/standard
  const contentLength = (clause.content || '').length;
  if (detailLevel === 'essential' && contentLength > 2000) {
    score -= 20;
  } else if (detailLevel === 'standard' && contentLength > 4000) {
    score -= 10;
  }

  return score;
}

/**
 * Select top N clauses from a list based on priority
 */
function selectTopClauses(
  clauses: PolicyClause[],
  mandatoryIds: string[],
  detailLevel: DetailLevel,
  limit: number
): PolicyClause[] {
  // Score all clauses
  const scored = clauses.map((clause) => ({
    clause,
    score: calculateClausePriority(clause, detailLevel, mandatoryIds.includes(clause.id)),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top N
  return scored.slice(0, limit).map((s) => s.clause);
}

/**
 * Map template section to standard section
 */
function mapToStandardSection(sectionTitle: string): (typeof STANDARD_SECTIONS)[number] | null {
  const titleLower = sectionTitle.toLowerCase();

  // Purpose/objectives
  if (titleLower.includes('purpose') || titleLower.includes('objective') || titleLower.includes('overview')) {
    return STANDARD_SECTIONS[0];
  }

  // Scope
  if (titleLower.includes('scope') || titleLower.includes('applicab')) {
    return STANDARD_SECTIONS[1];
  }

  // Definitions
  if (titleLower.includes('definition') || titleLower.includes('glossar') || titleLower.includes('terminolog')) {
    return STANDARD_SECTIONS[2];
  }

  // Policy statements
  if (
    titleLower.includes('policy') ||
    titleLower.includes('principle') ||
    titleLower.includes('statement') ||
    titleLower.includes('requirement')
  ) {
    return STANDARD_SECTIONS[3];
  }

  // Procedures
  if (
    titleLower.includes('procedure') ||
    titleLower.includes('process') ||
    titleLower.includes('handling') ||
    titleLower.includes('workflow')
  ) {
    return STANDARD_SECTIONS[4];
  }

  // Roles
  if (titleLower.includes('role') || titleLower.includes('responsibilit') || titleLower.includes('owner')) {
    return STANDARD_SECTIONS[5];
  }

  // Governance
  if (titleLower.includes('governance') || titleLower.includes('oversight') || titleLower.includes('approval')) {
    return STANDARD_SECTIONS[6];
  }

  // Monitoring
  if (
    titleLower.includes('monitor') ||
    titleLower.includes('report') ||
    titleLower.includes('mi') ||
    titleLower.includes('metric')
  ) {
    return STANDARD_SECTIONS[7];
  }

  // Training
  if (titleLower.includes('training') || titleLower.includes('competenc') || titleLower.includes('awareness')) {
    return STANDARD_SECTIONS[8];
  }

  // Related/appendix
  if (titleLower.includes('related') || titleLower.includes('reference') || titleLower.includes('appendix')) {
    return STANDARD_SECTIONS[9];
  }

  return null;
}

export interface TieredSection {
  id: string;
  title: string;
  sectionType: 'policy' | 'procedure' | 'appendix';
  clauses: PolicyClause[];
  originalSectionId?: string;
}

/**
 * Apply tiering to template sections
 * Returns sections with limited clauses based on detail level
 */
export function applyTiering(
  template: PolicyTemplate,
  allClauses: PolicyClause[],
  detailLevel: DetailLevel,
  sectionClauseOverrides?: Record<string, string[]>
): TieredSection[] {
  const limits = SECTION_LIMITS[detailLevel];
  const tieredSections: TieredSection[] = [];

  // Create a map of clause IDs to clauses for quick lookup
  const clauseMap = new Map<string, PolicyClause>();
  allClauses.forEach((c) => clauseMap.set(c.id, c));

  // Group template sections by standard section type
  const sectionGroups = new Map<string, PolicyTemplateSection[]>();

  template.sections.forEach((section) => {
    const standardSection = mapToStandardSection(section.title);
    const groupKey = standardSection?.id || section.id;

    if (!sectionGroups.has(groupKey)) {
      sectionGroups.set(groupKey, []);
    }
    sectionGroups.get(groupKey)!.push(section);
  });

  // Process each standard section
  STANDARD_SECTIONS.forEach((standardSection) => {
    const templateSections = sectionGroups.get(standardSection.id) || [];

    if (templateSections.length === 0) {
      return; // Skip sections with no matching template content
    }

    // Collect all clauses for this section group
    const sectionClauses: PolicyClause[] = [];

    templateSections.forEach((templateSection) => {
      // Use override if provided, otherwise use suggested clauses
      const clauseIds = sectionClauseOverrides?.[templateSection.id] || templateSection.suggestedClauses || [];

      clauseIds.forEach((id) => {
        const clause = clauseMap.get(id);
        if (clause && !sectionClauses.find((c) => c.id === clause.id)) {
          sectionClauses.push(clause);
        }
      });
    });

    if (sectionClauses.length === 0) {
      return; // Skip empty sections
    }

    // Determine limit based on section type
    const isAppendix = (standardSection.sectionType as string) === 'appendix' || standardSection.id === 'related';
    const maxClauses = isAppendix ? limits.appendixMax : limits.max;

    // Select top clauses based on priority
    const selectedClauses = selectTopClauses(
      sectionClauses,
      template.mandatoryClauses || [],
      detailLevel,
      maxClauses
    );

    if (selectedClauses.length > 0) {
      tieredSections.push({
        id: standardSection.id,
        title: standardSection.title,
        sectionType: isAppendix ? 'appendix' : standardSection.sectionType,
        clauses: selectedClauses,
        originalSectionId: templateSections[0]?.id,
      });
    }
  });

  // Handle any template sections that didn't map to standard sections
  const mappedSectionIds = new Set(
    Array.from(sectionGroups.entries())
      .filter(([key]) => STANDARD_SECTIONS.some((s) => s.id === key))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .flatMap(([_key, sections]) => sections.map((s) => s.id))
  );

  template.sections.forEach((section) => {
    if (mappedSectionIds.has(section.id)) {
      return; // Already processed
    }

    const clauseIds = sectionClauseOverrides?.[section.id] || section.suggestedClauses || [];
    const sectionClauses = clauseIds
      .map((id) => clauseMap.get(id))
      .filter((c): c is PolicyClause => c !== undefined);

    if (sectionClauses.length === 0) {
      return;
    }

    const isAppendix = section.sectionType === 'appendix';
    const maxClauses = isAppendix ? limits.appendixMax : limits.max;

    const selectedClauses = selectTopClauses(
      sectionClauses,
      template.mandatoryClauses || [],
      detailLevel,
      maxClauses
    );

    if (selectedClauses.length > 0) {
      tieredSections.push({
        id: section.id,
        title: section.title,
        sectionType: section.sectionType || 'policy',
        clauses: selectedClauses,
        originalSectionId: section.id,
      });
    }
  });

  return tieredSections;
}

/**
 * Estimate page count based on clause content
 * Rough estimate: ~400 words per page, ~6 chars per word
 */
export function estimatePageCount(sections: TieredSection[]): number {
  const totalChars = sections.reduce((acc, section) => {
    return (
      acc +
      section.clauses.reduce((clauseAcc, clause) => {
        return clauseAcc + (clause.content?.length || 0) + (clause.title?.length || 0) * 2;
      }, 0)
    );
  }, 0);

  // ~2400 chars per page (400 words * 6 chars)
  // Add ~3 pages for cover, document control, TOC
  const contentPages = Math.ceil(totalChars / 2400);
  return contentPages + 3;
}

/**
 * Get recommended detail level based on firm size
 */
export function getRecommendedDetailLevel(firmSize: 'small' | 'medium' | 'large'): DetailLevel {
  switch (firmSize) {
    case 'small':
      return 'essential';
    case 'medium':
      return 'standard';
    case 'large':
      return 'comprehensive';
    default:
      return 'standard';
  }
}

/**
 * Detail level descriptions for UI
 */
export const DETAIL_LEVEL_INFO: Record<
  DetailLevel,
  { label: string; description: string; pageEstimate: string; recommended?: string }
> = {
  essential: {
    label: 'Essential',
    description: 'Minimum FCA compliance requirements',
    pageEstimate: '8-12 pages',
    recommended: 'Small firms, limited resources',
  },
  standard: {
    label: 'Standard',
    description: 'Balanced coverage for most firms',
    pageEstimate: '15-20 pages',
    recommended: 'Most FCA-regulated firms',
  },
  comprehensive: {
    label: 'Comprehensive',
    description: 'Enterprise-grade detail',
    pageEstimate: '25-30 pages',
    recommended: 'Large firms, complex operations',
  },
};
