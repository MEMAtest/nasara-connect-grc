import type { PolicyTemplate } from "@/lib/policies/templates";

export type ComplaintsDetailLevel = "focused" | "standard" | "enterprise";
export type ComplaintsJurisdiction = "uk" | "uk-eea";
export type ComplaintsIdMethod = "manual" | "hybrid" | "ai";
export type ComplaintsOversight = "standard" | "enhanced";
export type ComplaintsVulnerabilityFocus = "standard" | "high";

export type ComplaintsChannel = "web" | "email" | "social" | "phone" | "branch";
export type ComplaintsPaymentRail = "stripe" | "thunes" | "swift" | "other";

export interface ComplaintsAssemblerAnswers {
  detailLevel: ComplaintsDetailLevel;
  jurisdiction: ComplaintsJurisdiction;
  paymentRails: ComplaintsPaymentRail[];
  idMethod: ComplaintsIdMethod;
  oversight: ComplaintsOversight;
  vulnerabilityFocus: ComplaintsVulnerabilityFocus;
  vulnerabilityChampion: boolean;
  channels: ComplaintsChannel[];
  includeAppendices: boolean;
}

export interface ComplaintsModule {
  id: string;
  title: string;
  summary: string;
  sectionId: string;
  sectionType: "policy" | "procedure" | "appendix";
  kind: "static" | "dynamic";
  clauseIds: string[];
  reasons: string[];
}

export interface ComplaintsAssemblyResult {
  modules: ComplaintsModule[];
  sectionClauses: Record<string, string[]>;
}

export const DEFAULT_COMPLAINTS_ANSWERS: ComplaintsAssemblerAnswers = {
  detailLevel: "focused",
  jurisdiction: "uk",
  paymentRails: ["stripe"],
  idMethod: "manual",
  oversight: "standard",
  vulnerabilityFocus: "standard",
  vulnerabilityChampion: false,
  channels: ["web", "email"],
  includeAppendices: false,
};

const DYNAMIC_CLAUSES = {
  eeaPassporting: "complaints-fragment-eea-passporting",
  stripe: "complaints-fragment-stripe-rail",
  thunes: "complaints-fragment-thunes-rail",
  swift: "complaints-fragment-swift-rail",
  manualId: "complaints-fragment-manual-id-triage",
  aiId: "complaints-fragment-ai-id-triage",
  hybridId: "complaints-fragment-hybrid-id-triage",
  enhancedOversight: "complaints-fragment-enhanced-oversight",
  vulnerabilityChampion: "complaints-fragment-vulnerability-champion",
  vulnerabilityHigh: "complaints-fragment-high-vulnerability-support",
};

const SECTION_LIMITS: Record<string, { focused: number; standard: number }> = {
  process: { focused: 12, standard: 22 },
  governance: { focused: 8, standard: 12 },
  digital: { focused: 3, standard: 5 },
};

function applyTier(clauseIds: string[], level: ComplaintsDetailLevel, sectionId: string) {
  if (level === "enterprise") return clauseIds;
  const limits = SECTION_LIMITS[sectionId];
  if (!limits) return clauseIds;
  const max = level === "focused" ? limits.focused : limits.standard;
  return clauseIds.slice(0, Math.min(max, clauseIds.length));
}

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

function getSectionMeta(template: PolicyTemplate, sectionId: string) {
  const section = template.sections.find((item) => item.id === sectionId);
  return {
    title: section?.title ?? sectionId,
    summary: section?.summary ?? "",
    sectionType: section?.sectionType ?? "policy",
    clauseIds: section?.suggestedClauses ?? [],
  };
}

function buildModule(
  input: Omit<ComplaintsModule, "sectionType" | "sectionId"> & { sectionId: string; sectionType: ComplaintsModule["sectionType"] },
) {
  return input as ComplaintsModule;
}

export function assembleComplaintsPolicy(
  template: PolicyTemplate,
  answers: ComplaintsAssemblerAnswers,
): ComplaintsAssemblyResult {
  const modules: ComplaintsModule[] = [];

  const overviewMeta = getSectionMeta(template, "overview");
  modules.push(
    buildModule({
      id: "overview-core",
      title: "Regulatory scope & principles",
      summary: "Core DISP/PSR scope, Consumer Duty alignment, and complaints principles.",
      sectionId: "overview",
      sectionType: overviewMeta.sectionType,
      kind: "static",
      clauseIds: overviewMeta.clauseIds,
      reasons: ["Baseline FCA DISP and PSR obligations"],
    }),
  );

  if (answers.jurisdiction === "uk-eea") {
    modules.push(
      buildModule({
        id: "overview-eea",
        title: "EEA passporting overlay",
        summary: "EBA-aligned handling, local ADR signposting, and cross-border reporting.",
        sectionId: "overview",
        sectionType: overviewMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.eeaPassporting],
        reasons: ["Jurisdiction includes EEA passporting"],
      }),
    );
  }

  const processMeta = getSectionMeta(template, "process");
  modules.push(
    buildModule({
      id: "process-core",
      title: "Complaints handling workflow",
      summary: "Intake, investigation, SRC, and final response workflows with DISP/PSR timelines.",
      sectionId: "process",
      sectionType: processMeta.sectionType,
      kind: "static",
      clauseIds: applyTier(processMeta.clauseIds, answers.detailLevel, "process"),
      reasons: ["Core complaints handling flow"],
    }),
  );

  if (answers.paymentRails.includes("stripe")) {
    modules.push(
      buildModule({
        id: "process-stripe",
        title: "Stripe rail reconciliation",
        summary: "Monthly reconciliation, dispute handling, and settlement evidence for Stripe.",
        sectionId: "process",
        sectionType: processMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.stripe],
        reasons: ["Payment rail selected: Stripe"],
      }),
    );
  }

  if (answers.paymentRails.includes("thunes")) {
    modules.push(
      buildModule({
        id: "process-thunes",
        title: "Thunes corridor handling",
        summary: "Corridor triage, partner escalation, and payout tracking for Thunes corridors.",
        sectionId: "process",
        sectionType: processMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.thunes],
        reasons: ["Payment rail selected: Thunes"],
      }),
    );
  }

  if (answers.paymentRails.includes("swift")) {
    modules.push(
      buildModule({
        id: "process-swift",
        title: "SWIFT transfer investigations",
        summary: "Trace, repair, and evidence workflows for SWIFT transfers.",
        sectionId: "process",
        sectionType: processMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.swift],
        reasons: ["Payment rail selected: SWIFT"],
      }),
    );
  }

  if (answers.idMethod === "manual") {
    modules.push(
      buildModule({
        id: "process-manual-id",
        title: "Manual KYC triage",
        summary: "Manual agent review checklist and documented overrides for onboarding complaints.",
        sectionId: "process",
        sectionType: processMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.manualId],
        reasons: ["ID method: Manual agent review"],
      }),
    );
  }

  if (answers.idMethod === "ai") {
    modules.push(
      buildModule({
        id: "process-ai-id",
        title: "AI-assisted identity review",
        summary: "Model output capture, explainability checks, and human override controls.",
        sectionId: "process",
        sectionType: processMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.aiId],
        reasons: ["ID method: AI-assisted review"],
      }),
    );
  }

  if (answers.idMethod === "hybrid") {
    modules.push(
      buildModule({
        id: "process-hybrid-id",
        title: "Hybrid identity review",
        summary: "Hybrid triage with automated triggers and manual escalation tracking.",
        sectionId: "process",
        sectionType: processMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.hybridId],
        reasons: ["ID method: Hybrid review"],
      }),
    );
  }

  const digitalMeta = getSectionMeta(template, "digital");
  const hasDigitalChannel = answers.channels.some((channel) => ["web", "email", "social"].includes(channel));
  if (hasDigitalChannel) {
    modules.push(
      buildModule({
        id: "digital-core",
        title: "Digital complaints handling",
        summary: "Digital channel handling, QA, and response expectations.",
        sectionId: "digital",
        sectionType: digitalMeta.sectionType,
        kind: "static",
        clauseIds: applyTier(digitalMeta.clauseIds, answers.detailLevel, "digital"),
        reasons: ["Digital channels selected"],
      }),
    );
  }

  const vulnerableMeta = getSectionMeta(template, "vulnerable");
  modules.push(
    buildModule({
      id: "vulnerable-core",
      title: "Vulnerable customer handling",
      summary: "Identification, adjustments, and enhanced support for vulnerable customers.",
      sectionId: "vulnerable",
      sectionType: vulnerableMeta.sectionType,
      kind: "static",
      clauseIds: vulnerableMeta.clauseIds,
      reasons: ["Consumer Duty vulnerability expectations"],
    }),
  );

  if (answers.vulnerabilityFocus === "high") {
    modules.push(
      buildModule({
        id: "vulnerable-high",
        title: "High vulnerability support",
        summary: "Non-digital channels, carers, and enhanced communications.",
        sectionId: "vulnerable",
        sectionType: vulnerableMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.vulnerabilityHigh],
        reasons: ["Target market includes high vulnerability segments"],
      }),
    );
  }

  if (answers.vulnerabilityChampion) {
    modules.push(
      buildModule({
        id: "vulnerable-champion",
        title: "Vulnerability champion governance",
        summary: "Board-level oversight and accountability for vulnerable outcomes.",
        sectionId: "vulnerable",
        sectionType: vulnerableMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.vulnerabilityChampion],
        reasons: ["Board-level vulnerability champion selected"],
      }),
    );
  }

  const fosMeta = getSectionMeta(template, "fos");
  modules.push(
    buildModule({
      id: "fos-core",
      title: "FOS escalation",
      summary: "FOS escalation routes, time limits, and co-operation requirements.",
      sectionId: "fos",
      sectionType: fosMeta.sectionType,
      kind: "static",
      clauseIds: fosMeta.clauseIds,
      reasons: ["Mandatory FOS escalation handling"],
    }),
  );

  const governanceMeta = getSectionMeta(template, "governance");
  modules.push(
    buildModule({
      id: "governance-core",
      title: "Governance, MI & review",
      summary: "RCA, MI reporting, training, and policy review governance.",
      sectionId: "governance",
      sectionType: governanceMeta.sectionType,
      kind: "static",
      clauseIds: applyTier(governanceMeta.clauseIds, answers.detailLevel, "governance"),
      reasons: ["Governance and MI expectations"],
    }),
  );

  if (answers.oversight === "enhanced") {
    modules.push(
      buildModule({
        id: "governance-enhanced",
        title: "Enhanced oversight",
        summary: "Quarterly audit sampling, independent QA, and board reporting.",
        sectionId: "governance",
        sectionType: governanceMeta.sectionType,
        kind: "dynamic",
        clauseIds: [DYNAMIC_CLAUSES.enhancedOversight],
        reasons: ["Oversight level: Enhanced"],
      }),
    );
  }

  if (answers.includeAppendices || answers.detailLevel === "enterprise") {
    ["appendix-1", "appendix-2", "appendix-3", "appendix-4", "appendix-5"].forEach((sectionId) => {
      const appendixMeta = getSectionMeta(template, sectionId);
      if (!appendixMeta.clauseIds.length) return;
      modules.push(
        buildModule({
          id: `appendix-${sectionId}`,
          title: appendixMeta.title,
          summary: appendixMeta.summary,
          sectionId,
          sectionType: appendixMeta.sectionType,
          kind: "static",
          clauseIds: appendixMeta.clauseIds,
          reasons: ["Appendices included for templates and letters"],
        }),
      );
    });
  }

  const sectionClauses: Record<string, string[]> = {};
  modules.forEach((module) => {
    sectionClauses[module.sectionId] = uniq([...(sectionClauses[module.sectionId] ?? []), ...module.clauseIds]);
  });

  return { modules, sectionClauses };
}
