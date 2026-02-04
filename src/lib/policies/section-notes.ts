import type { PolicyTemplate, PolicyTemplateSection } from "./templates";

export type NoteOptionConfig = {
  helper: string;
  options: string[];
  required?: boolean;
};

export type NoteSectionInput = Pick<
  PolicyTemplateSection,
  "id" | "title" | "summary" | "sectionType" | "requiresFirmNotes"
>;

export type NoteSectionConfig = {
  id: string;
  title: string;
  summary: string;
  required: boolean;
  helper: string;
  options: string[];
};

const DEFAULT_HELPER = "Select the statements that apply to your firm.";

const NOTE_OPTIONS_OVERRIDES: Record<string, Record<string, NoteOptionConfig>> = {
  COMPLAINTS: {
    overview: {
      helper: "Select statements that reflect how your complaints policy applies firm-wide.",
      options: [
        "Applies to all complaints relating to regulated products and services.",
        "Includes DISP, PSR/EMR, and Consumer Duty complaint standards.",
        "Complaints can be submitted by customers, eligible third parties, or authorised representatives.",
        "We commit to fair, prompt, and consistent resolution.",
      ],
    },
    process: {
      helper: "Select the operational steps that match your complaints workflow.",
      options: [
        "All complaints are logged in a central case management system.",
        "Acknowledgements are issued promptly with clear next steps.",
        "Summary resolution within 3 business days where appropriate.",
        "Final response within DISP/PSR time limits with outcome and redress.",
        "Root cause analysis completed for upheld complaints.",
        "Complaint outcomes are tracked in MI and actioned.",
      ],
    },
    digital: {
      helper: "Select how digital complaints are captured and handled.",
      options: [
        "Webform and email complaints are routed into the same workflow.",
        "Social media complaints are redirected to formal channels.",
        "Digital channels are monitored daily with ownership assigned.",
        "Standard digital response templates are used.",
      ],
    },
    vulnerable: {
      helper: "Select the adjustments or safeguards you provide for vulnerable customers.",
      options: [
        "Vulnerability indicators are recorded at intake.",
        "Alternative formats or channels are offered on request.",
        "Complaints from vulnerable customers are prioritised or escalated.",
        "Additional time and support is provided where needed.",
      ],
    },
    fos: {
      helper: "Select how you manage FOS escalation and cooperation.",
      options: [
        "Final responses include FOS contact details and time limits.",
        "FOS referrals are handled by Compliance within required timeframes.",
        "We cooperate fully with FOS investigations and information requests.",
        "Internal review is completed before escalation where appropriate.",
      ],
    },
    governance: {
      helper: "Select the governance and MI practices in place.",
      options: [
        "Complaints MI is reported to Compliance and senior management regularly.",
        "Training is provided at induction and refreshed annually.",
        "Policy reviewed at least annually or after material change.",
        "Root cause trends drive product or process improvements.",
      ],
    },
  },
};

const KEYWORD_OPTIONS: Array<{ match: RegExp; options: string[] }> = [
  {
    match: /scope|applicability|coverage/i,
    options: [
      "Applies to all products, services, and channels in scope.",
      "Out-of-scope activities are excluded from this policy.",
    ],
  },
  {
    match: /governance|oversight|committee|board|review/i,
    options: [
      "Accountable owner and oversight forum are defined.",
      "Reviewed at least annually or after material change.",
    ],
  },
  {
    match: /training|competence/i,
    options: ["Training is delivered at induction and refreshed annually."],
  },
  {
    match: /monitor|mi|report|metrics|kpi/i,
    options: [
      "Monitoring and MI are reported on a regular cadence.",
      "Issues are tracked with owners and remediation dates.",
    ],
  },
  {
    match: /risk|assessment|appetite/i,
    options: ["Risks are assessed and documented when exposures change."],
  },
  {
    match: /kyc|kyb|customer due diligence|cdd/i,
    options: [
      "Customer due diligence is completed before onboarding.",
      "Enhanced due diligence is applied to higher-risk customers.",
      "Ongoing monitoring and periodic refresh are in place.",
    ],
  },
  {
    match: /escalation|incident|breach|complaint/i,
    options: [
      "Escalation triggers and timelines are defined.",
      "Incidents are logged and investigated with documented outcomes.",
    ],
  },
  {
    match: /record|log|evidence|documentation|register/i,
    options: ["Records are retained in line with regulatory retention requirements."],
  },
  {
    match: /third[- ]party|outsourcing|supplier|vendor/i,
    options: ["Due diligence and ongoing monitoring are applied to third parties."],
  },
  {
    match: /data|privacy|information security|cyber|security/i,
    options: ["Access controls and data protection measures are applied to sensitive data."],
  },
  {
    match: /promotion|marketing|communication|disclosure|risk warning/i,
    options: [
      "Promotions are approved by Compliance before release.",
      "Risk warnings are clear, fair, and not misleading.",
    ],
  },
  {
    match: /consumer duty|vulnerable/i,
    options: ["Customer outcomes and vulnerability support are embedded in delivery."],
  },
  {
    match: /conflict|bribery|corruption|gift|hospitality/i,
    options: ["Conflicts and bribery risks are identified, disclosed, and managed."],
  },
  {
    match: /smcr|senior manager|certification/i,
    options: ["Responsibilities and certification population are documented and maintained."],
  },
  {
    match: /whistle|speaking up/i,
    options: ["Reporting channels are confidential and protect against retaliation."],
  },
  {
    match: /approval|sign[- ]off/i,
    options: ["Approvals are recorded with evidence of review."],
  },
];

const MAX_OPTIONS = 8;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const normalizeSentence = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
};

const normalizeNoteValue = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.]+$/, "")
    .toLowerCase();

export const resolveNotePlaceholders = (value: string, firmName?: string) => {
  const replacement = firmName && firmName.trim().length ? firmName.trim() : "the firm";
  return value
    .replace(/{{\s*firm\.name\s*}}/gi, replacement)
    .replace(/{{\s*firm_name\s*}}/gi, replacement);
};

const stripListMarker = (line: string) =>
  line.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "");

const isAppendixSection = (section: NoteSectionInput) =>
  section.sectionType === "appendix" ||
  section.id.startsWith("appendix") ||
  /^appendix/i.test(section.title);

const buildDefaultNoteConfig = (section: NoteSectionInput): NoteOptionConfig => {
  const summary = section.summary ?? "";
  const helper = DEFAULT_HELPER;
  const options: string[] = [];

  const haystack = `${section.title} ${summary}`.toLowerCase();
  KEYWORD_OPTIONS.forEach((entry) => {
    if (entry.match.test(haystack)) {
      options.push(...entry.options);
    }
  });

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const option of options) {
    const trimmed = option.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    unique.push(trimmed);
    if (unique.length >= MAX_OPTIONS) break;
  }

  if (!unique.length) {
    unique.push("Firm-specific detail is documented for this area.");
  }

  return { helper, options: unique };
};

export function getNoteSections(
  template: Pick<PolicyTemplate, "code"> & { sections: NoteSectionInput[] },
  options: { includeAppendix?: boolean } = {},
): NoteSectionConfig[] {
  const includeAppendix = options.includeAppendix ?? false;
  return template.sections
    .filter((section) => (includeAppendix ? true : !isAppendixSection(section)))
    .map((section) => {
      const override = NOTE_OPTIONS_OVERRIDES[template.code]?.[section.id];
      const baseConfig = override ?? buildDefaultNoteConfig(section);
      const required = override?.required ?? Boolean(section.requiresFirmNotes);
      return {
        id: section.id,
        title: section.title,
        summary: section.summary,
        required,
        helper: baseConfig.helper,
        options: baseConfig.options,
      };
    });
}

export function getRequiredNoteSectionIds(
  template: Pick<PolicyTemplate, "code"> & { sections: NoteSectionInput[] },
): string[] {
  return getNoteSections(template).filter((section) => section.required).map((section) => section.id);
}

export const parseNoteValue = (
  value?: string,
  options: string[] = [],
  firmName?: string,
): { selections: string[]; customText: string } => {
  const optionMap = new Map<string, string>();
  options.forEach((option) => {
    const normalized = normalizeNoteValue(option);
    if (normalized) optionMap.set(normalized, option);
    const resolved = resolveNotePlaceholders(option, firmName);
    const resolvedNormalized = normalizeNoteValue(resolved);
    if (resolvedNormalized) optionMap.set(resolvedNormalized, option);
  });

  const selections = new Set<string>();
  const customLines: string[] = [];

  const lines = (value ?? "").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (customLines.length) customLines.push("");
      return;
    }
    const candidate = stripListMarker(trimmed).trim();
    const normalized = normalizeNoteValue(candidate);
    const matched = normalized ? optionMap.get(normalized) : undefined;
    if (matched) {
      selections.add(matched);
    } else {
      customLines.push(candidate);
    }
  });

  return { selections: Array.from(selections), customText: customLines.join("\n").trim() };
};

export const parseNoteSelections = (value?: string, options?: string[], firmName?: string) => {
  if (options && options.length) {
    return parseNoteValue(value, options, firmName).selections;
  }
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => stripListMarker(line).trim())
    .filter(Boolean);
};

export const parseNoteCustomText = (value?: string, options?: string[], firmName?: string) => {
  if (!options || options.length === 0) {
    return (value ?? "").trim();
  }
  return parseNoteValue(value, options, firmName).customText;
};

export const formatNoteValue = (selections: string[], customText?: string) => {
  const lines: string[] = selections.length ? selections.map((entry) => `- ${entry}`) : [];
  const trimmedCustom = customText?.trim();
  if (trimmedCustom) {
    if (lines.length) lines.push("");
    lines.push(trimmedCustom);
  }
  return lines.join("\n");
};

export const mergeNoteOptions = (baseOptions: string[], selections: string[]) => {
  const merged: string[] = [];
  const seen = new Set<string>();
  baseOptions.forEach((option) => {
    const trimmed = option.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    merged.push(trimmed);
  });
  selections.forEach((option) => {
    const trimmed = option.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    merged.push(trimmed);
  });
  return merged;
};
