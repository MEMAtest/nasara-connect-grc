import { PACK_TEMPLATES } from "@/lib/authorization-pack-templates";

export const PROFILE_PERMISSION_CODES = ["payments", "consumer-credit", "investments"] as const;
export type ProfilePermissionCode = (typeof PROFILE_PERMISSION_CODES)[number];

export const isProfilePermissionCode = (value?: string | null): value is ProfilePermissionCode =>
  PROFILE_PERMISSION_CODES.includes(value as ProfilePermissionCode);

export type ProfileQuestionType = "single-choice" | "multi-choice" | "text" | "number" | "boolean";

export interface ProfileOption {
  value: string;
  label: string;
  score: number;
  implication?: string;
}

export interface ProfileQuestionThreshold {
  value: number;
  comparison: "gt" | "lt" | "gte" | "lte" | "eq";
  message: string;
}

export interface ProfileQuestion {
  id: string;
  sectionId: string;
  prompt: string;
  description?: string;
  placeholder?: string;
  type: ProfileQuestionType;
  options?: ProfileOption[];
  maxSelections?: number;
  required?: boolean;
  weight?: number;
  regulatoryRefs?: string[];
  packSectionKeys?: string[];
  appliesTo?: ProfilePermissionCode[];
  aiHint?: string;
  impact?: string;
  allowOther?: boolean;
  threshold?: ProfileQuestionThreshold;
}

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  appliesTo?: ProfilePermissionCode[];
  packSectionKeys?: string[];
}

export type ProfileResponse = string | string[] | number | boolean;

export interface BusinessPlanProfile {
  version: number;
  responses: Record<string, ProfileResponse>;
  updatedAt?: string;
}

export interface ProfileSectionScore {
  id: string;
  label: string;
  percent: number;
  score: number;
  maxScore: number;
}

export interface PackSectionScore {
  key: string;
  label: string;
  percent: number;
  score: number;
  maxScore: number;
}

export interface RegulatorySignal {
  label: string;
  count: number;
}

export type PerimeterVerdict = "in-scope" | "possible-exemption" | "out-of-scope" | "unknown";

export interface PerimeterOpinion {
  verdict: PerimeterVerdict;
  summary: string;
  rationale: string[];
  obligations: string[];
}

export interface ValidationConflict {
  id: string;
  severity: "error" | "warning";
  message: string;
  questionIds: string[];
  suggestion?: string;
}

export interface CapitalEstimate {
  method: "A" | "B" | "C" | null;
  minimumCapital: number;
  methodAEstimate: number | null;
  methodBEstimate: number | null;
  recommendation: string;
  breakdown?: string[];
}

export interface SectionDependency {
  sectionId: string;
  dependsOn: string[];
  reason: string;
}

export const SECTION_DEPENDENCIES: SectionDependency[] = [
  { sectionId: "model", dependsOn: ["scope"], reason: "Define regulated activities before describing business model" },
  { sectionId: "operations", dependsOn: ["scope", "model"], reason: "Scope and model inform operational requirements" },
  { sectionId: "governance", dependsOn: ["scope"], reason: "Governance structure depends on regulatory scope" },
  { sectionId: "financials", dependsOn: ["scope", "model"], reason: "Financial projections need scope and model clarity" },
  { sectionId: "payments", dependsOn: ["scope"], reason: "Complete scope section to unlock payments questions" },
  { sectionId: "consumer-credit", dependsOn: ["scope"], reason: "Complete scope section to unlock consumer credit questions" },
  { sectionId: "investments", dependsOn: ["scope"], reason: "Complete scope section to unlock investments questions" },
];

export interface ProfileInsights {
  completionPercent: number;
  sectionScores: ProfileSectionScore[];
  packSectionScores: PackSectionScore[];
  regulatorySignals: RegulatorySignal[];
  activityHighlights: string[];
  perimeterOpinion: PerimeterOpinion;
  focusAreas: string[];
  conflicts: ValidationConflict[];
  capitalEstimate: CapitalEstimate | null;
}

const PACK_SECTION_LABELS = (() => {
  const labels: Record<string, string> = {};
  for (const template of PACK_TEMPLATES) {
    for (const section of template.sections) {
      if (!labels[section.key]) {
        labels[section.key] = section.title;
      }
    }
  }
  return labels;
})();

export const getPackSectionLabel = (key: string) => PACK_SECTION_LABELS[key] || key;

const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: "scope",
    title: "Regulatory Scope and Perimeter",
    description: "Define regulated activities, permissions, and out-of-scope boundaries.",
    packSectionKeys: ["product-scope", "executive-summary", "schedule-2"],
  },
  {
    id: "model",
    title: "Business Model and Customers",
    description: "Who you serve, how you reach them, and how revenue is generated.",
    packSectionKeys: ["business-model", "customer-lifecycle", "consumer-duty"],
  },
  {
    id: "operations",
    title: "Operations and Technology",
    description: "Operating model, technology stack, outsourcing, and resilience controls.",
    packSectionKeys: ["operational-resilience", "third-party-risk", "cyber-security", "sensitive-data", "data-quality"],
  },
  {
    id: "governance",
    title: "Governance and Controls",
    description: "Governance model, SMCR accountability, and compliance monitoring.",
    packSectionKeys: [
      "governance",
      "risk-compliance",
      "compliance-monitoring",
      "mi-board-reporting",
      "threshold-conditions",
      "change-management",
    ],
  },
  {
    id: "financials",
    title: "Financials and Wind-Down",
    description: "Funding runway, projections, and orderly wind-down planning.",
    packSectionKeys: ["financials", "wind-down"],
  },
  {
    id: "payments",
    title: "Payments and E-Money Scope",
    description: "Payment services, safeguarding model, agents, and PSD2 security obligations.",
    appliesTo: ["payments"],
    packSectionKeys: ["product-architecture", "client-asset-protection", "security-policy", "flow-of-funds", "regulatory-reporting", "app-fraud"],
  },
  {
    id: "consumer-credit",
    title: "Consumer Credit Operations",
    description: "Credit activities, affordability checks, promotions, and forbearance controls.",
    appliesTo: ["consumer-credit"],
    packSectionKeys: ["customer-lifecycle", "consumer-duty", "risk-compliance"],
  },
  {
    id: "investments",
    title: "Investment Services Scope",
    description: "Investment activities, client categorisation, and client asset safeguarding.",
    appliesTo: ["investments"],
    packSectionKeys: ["product-scope", "client-asset-protection", "risk-compliance", "business-model"],
  },
];

const PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: "core-regulated-activities",
    sectionId: "scope",
    prompt: "Summarize the regulated activities in scope for the firm.",
    description: "List the services that require FCA authorisation and why.",
    placeholder: "Describe your services in plain language. We will map this to FCA permissions.",
    type: "text",
    required: true,
    weight: 3,
    regulatoryRefs: ["PERG 2 - Regulated activities"],
    aiHint:
      "Cover: customer journey, services delivered, PSP-of-record status, where money or client assets move, key third parties, permissions expected, and what is explicitly out of scope.",
    packSectionKeys: ["product-scope", "executive-summary"],
  },
  {
    id: "core-perimeter-clarity",
    sectionId: "scope",
    prompt: "Have you documented which activities are out of scope?",
    description: "Capture any perimeter assumptions and exclusions.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PERG 2 - Regulated activities"],
    options: [
      { value: "documented", label: "Yes, documented and reviewed", score: 3 },
      { value: "partial", label: "Partially documented", score: 2 },
      { value: "review", label: "Under review", score: 1 },
      { value: "unknown", label: "Not yet defined", score: 0 },
    ],
    packSectionKeys: ["product-scope"],
  },
  {
    id: "core-customer-segments",
    sectionId: "model",
    prompt: "Primary customer segments",
    description: "Select the core client groups you will serve.",
    type: "multi-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PRIN 2A - Consumer Duty"],
    options: [
      { value: "retail", label: "Retail consumers", score: 2 },
      { value: "sme", label: "SMEs", score: 2 },
      { value: "enterprise", label: "Enterprise / corporates", score: 2 },
      { value: "regulated-firms", label: "Regulated firms", score: 2 },
      { value: "platforms", label: "Platforms / marketplaces", score: 1 },
    ],
    packSectionKeys: ["business-model", "consumer-duty"],
  },
  {
    id: "core-distribution",
    sectionId: "model",
    prompt: "Distribution channels",
    description: "How will customers access the service?",
    type: "multi-choice",
    required: true,
    weight: 2,
    options: [
      { value: "direct", label: "Direct to customer", score: 2 },
      { value: "agents", label: "Agents / introducers", score: 2 },
      { value: "brokers", label: "Brokers / intermediaries", score: 2 },
      { value: "api", label: "Embedded API partnerships", score: 2 },
      { value: "white-label", label: "White label / partnerships", score: 1 },
    ],
    packSectionKeys: ["business-model"],
    allowOther: true,
    impact: "Distribution through agents requires FCA notification and due diligence on each agent. API partnerships may trigger 'principal arrangement' considerations.",
  },
  {
    id: "core-revenue-model",
    sectionId: "model",
    prompt: "Primary revenue model",
    description: "Select the main drivers of revenue.",
    type: "multi-choice",
    required: true,
    weight: 2,
    options: [
      { value: "transaction-fees", label: "Transaction fees", score: 2 },
      { value: "subscription", label: "Subscription fees", score: 2 },
      { value: "commission", label: "Commission / referral", score: 2 },
      { value: "interest", label: "Interest margin", score: 2 },
      { value: "fx", label: "FX spread", score: 2 },
      { value: "other", label: "Other", score: 1 },
    ],
    packSectionKeys: ["business-model", "financials"],
    allowOther: true,
  },
  {
    id: "core-geography",
    sectionId: "model",
    prompt: "Customer geography at launch",
    description: "Where will customers be located?",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "uk", label: "UK only", score: 3 },
      { value: "uk-eea", label: "UK + EEA", score: 2 },
      { value: "global", label: "Global", score: 1 },
    ],
    packSectionKeys: ["product-scope"],
  },
  {
    id: "core-outsourcing",
    sectionId: "operations",
    prompt: "Material outsourcing or third parties",
    description: "Select any critical outsourced functions.",
    type: "multi-choice",
    required: true,
    weight: 2,
    options: [
      { value: "cloud-hosting", label: "Cloud hosting / infrastructure", score: 2 },
      { value: "kyc-aml", label: "KYC / AML tooling", score: 2 },
      { value: "payments-processor", label: "Payment processor", score: 2 },
      { value: "credit-scoring", label: "Credit scoring", score: 2 },
      { value: "customer-support", label: "Customer support", score: 1 },
      { value: "fraud", label: "Fraud monitoring", score: 2 },
      { value: "other", label: "Other", score: 1 },
    ],
    allowOther: true,
    regulatoryRefs: ["FCA outsourcing expectations"],
    packSectionKeys: ["third-party-risk", "operational-resilience"],
  },
  {
    id: "core-hosting-model",
    sectionId: "operations",
    prompt: "Hosting model",
    description: "Primary hosting approach for core systems.",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "aws", label: "AWS", score: 2 },
      { value: "azure", label: "Microsoft Azure", score: 2 },
      { value: "gcp", label: "Google Cloud Platform", score: 2 },
      { value: "hybrid", label: "Hybrid / multi-cloud", score: 2 },
      { value: "on-prem", label: "On-premise / private data center", score: 1 },
      { value: "other", label: "Other", score: 1 },
    ],
    allowOther: true,
    packSectionKeys: ["operational-resilience", "cyber-security"],
  },
  {
    id: "core-tech-stack",
    sectionId: "operations",
    prompt: "Core technology stack",
    description: "Select the core systems that power your service.",
    type: "multi-choice",
    required: true,
    weight: 2,
    options: [
      { value: "core-ledger", label: "Core ledger / banking platform", score: 2 },
      { value: "payment-gateway", label: "Payment gateway / orchestration", score: 2 },
      { value: "card-issuing", label: "Card issuing / processing", score: 2 },
      { value: "kyc-aml", label: "KYC / AML platform", score: 2 },
      { value: "fraud", label: "Fraud monitoring", score: 2 },
      { value: "data-warehouse", label: "Data warehouse / BI", score: 1 },
      { value: "crm", label: "CRM / customer support", score: 1 },
      { value: "other", label: "Other", score: 1 },
    ],
    allowOther: true,
    packSectionKeys: ["operational-resilience", "cyber-security", "sensitive-data"],
  },
  {
    id: "core-tech-stack-notes",
    sectionId: "operations",
    prompt: "Technology stack notes",
    description: "Describe build vs buy decisions, critical vendors, and data flows.",
    placeholder: "e.g., SaaS core banking, in-house payments API, data residency in UK.",
    type: "text",
    required: false,
    weight: 1,
    packSectionKeys: ["operational-resilience", "cyber-security", "sensitive-data"],
    aiHint:
      "Highlight build vs buy, core vendors, hosting regions, key integrations (KYC/AML, payments, card processing), and data residency.",
  },
  {
    id: "core-governance",
    sectionId: "governance",
    prompt: "Governance readiness",
    description: "Board and SMF roles, committees, and accountability.",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "appointed", label: "Board and SMF roles appointed", score: 3 },
      { value: "identified", label: "Roles identified, onboarding in progress", score: 2 },
      { value: "review", label: "Roles under review", score: 1 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["governance", "mi-board-reporting"],
  },
  {
    id: "core-risk-theme",
    sectionId: "governance",
    prompt: "Top operational and compliance risks identified",
    description: "Select up to three risks that are most material to your model.",
    type: "multi-choice",
    required: true,
    weight: 2,
    maxSelections: 3,
    options: [
      {
        value: "safeguarding-breach",
        label: "Safeguarding shortfall or reconciliation failure",
        score: 2,
        implication: "Risk of client money shortfall due to reconciliation errors or commingling; requires daily reconciliation, segregation, and audit trail.",
      },
      {
        value: "financial-crime-failure",
        label: "Financial crime control failure (KYC/AML/sanctions)",
        score: 2,
        implication: "Risk of onboarding illicit actors or missing suspicious activity; requires risk assessment, screening, monitoring, and SAR escalation.",
      },
      {
        value: "operational-outage",
        label: "Operational outage or resilience breach",
        score: 2,
        implication: "Risk of service disruption or missed payment deadlines; requires impact tolerances, testing, incident response, and comms playbooks.",
      },
      {
        value: "data-cyber-incident",
        label: "Data breach or cyber incident",
        score: 2,
        implication: "Risk of data loss or compromised credentials; requires security controls, monitoring, and incident response.",
      },
      {
        value: "outsourcing-failure",
        label: "Outsourcing or critical vendor failure",
        score: 2,
        implication: "Risk from third-party outages or control gaps; requires due diligence, contracts, oversight, and exit planning.",
      },
      {
        value: "conduct-harm",
        label: "Customer harm / Consumer Duty breach",
        score: 2,
        implication: "Risk of poor outcomes or unfair value; requires outcome monitoring, MI, and governance.",
      },
      {
        value: "other",
        label: "Other",
        score: 1,
        implication: "Describe any additional material risks.",
      },
    ],
    packSectionKeys: ["risk-compliance"],
    allowOther: true,
    impact: "Selected risks drive the risk narrative and evidence plan.",
    aiHint: "Select the top risks, then capture mitigation notes below.",
  },
  {
    id: "core-risk-mitigation",
    sectionId: "governance",
    prompt: "Risk mitigation notes",
    description: "For each selected risk, outline controls, owners, and evidence.",
    placeholder: "e.g., Safeguarding: daily reconciliation owned by Finance; evidence in weekly MI pack.",
    type: "text",
    required: false,
    weight: 1,
    packSectionKeys: ["risk-compliance"],
    aiHint: "List each risk, the key control, accountable owner, and how you evidence effectiveness (MI, testing, audits).",
  },
  {
    id: "core-capital",
    sectionId: "financials",
    prompt: "Capital and funding position",
    description: "Confirm funding status and buffer expectations.",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "funded-buffer", label: "Fully funded with buffer", score: 3 },
      { value: "committed", label: "Funding committed, not drawn", score: 2 },
      { value: "in-progress", label: "Funding in progress", score: 1 },
      { value: "not-secured", label: "Funding not secured", score: 0 },
    ],
    packSectionKeys: ["financials"],
  },
  {
    id: "core-projections",
    sectionId: "financials",
    prompt: "Three-year financial projections",
    description: "Status of the core financial model and stress testing.",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "full", label: "Full model with stress testing", score: 3 },
      { value: "base", label: "Base case model only", score: 2 },
      { value: "outline", label: "High-level outline", score: 1 },
      { value: "none", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["financials"],
  },
  {
    id: "core-winddown",
    sectionId: "financials",
    prompt: "Wind-down planning",
    description: "Status of exit strategy, triggers, and costed execution plan.",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "draft", label: "Draft plan complete (costed & reviewed)", score: 3 },
      { value: "outline", label: "Outline in progress", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["wind-down"],
  },
  {
    id: "core-winddown-trigger",
    sectionId: "financials",
    prompt: "Wind-down triggers",
    description: "Select events that would trigger a wind-down decision.",
    type: "multi-choice",
    required: true,
    weight: 1,
    regulatoryRefs: ["FCA Approach to Payment Services and E-Money (2017) - Wind-down planning"],
    options: [
      {
        value: "capital-shortfall",
        label: "Capital falls below minimum requirement",
        score: 2,
        implication: "Requires a documented trigger tied to own funds thresholds and board escalation.",
      },
      {
        value: "safeguarding-failure",
        label: "Safeguarding breach or reconciliation failure",
        score: 2,
        implication: "Requires immediate incident response and safeguarding remediation steps.",
      },
      {
        value: "regulatory-action",
        label: "Regulatory intervention or permissions risk",
        score: 2,
        implication: "Requires governance escalation and controlled exit plan.",
      },
      {
        value: "critical-vendor",
        label: "Critical vendor or sponsor failure",
        score: 2,
        implication: "Requires vendor exit plan and contingency operations.",
      },
      {
        value: "strategic-exit",
        label: "Strategic exit or board decision",
        score: 1,
        implication: "Requires customer communications and orderly closure plan.",
      },
      {
        value: "other",
        label: "Other",
        score: 1,
        implication: "Describe any additional wind-down triggers.",
      },
    ],
    allowOther: true,
    packSectionKeys: ["wind-down", "risk-compliance"],
    aiHint: "Include capital triggers, safeguarding issues, regulatory action, or critical vendor failure.",
  },
  {
    id: "core-winddown-plan",
    sectionId: "financials",
    prompt: "Wind-down execution plan",
    description: "Describe how you would protect customers and close services in an orderly manner.",
    placeholder: "Cover customer communications, safeguarding actions, settlement timelines, data retention, and exit steps.",
    type: "text",
    required: true,
    weight: 1,
    packSectionKeys: ["wind-down"],
    aiHint: "Include customer communications, safeguarding account actions, outstanding payments, data retention, and expected timeline.",
  },
  {
    id: "pay-psp-record",
    sectionId: "payments",
    prompt: "Will the firm be the PSP of record for the payment services it provides?",
    description: "Confirm whether the firm is the contracting PSP responsible for service outcomes.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["PERG 15 - PSP responsibility", "PSR 2017"],
    options: [
      { value: "psp-of-record", label: "Yes, the firm is PSP of record", score: 3 },
      { value: "shared", label: "Shared with a sponsor/partner PSP", score: 1 },
      { value: "no", label: "No, another PSP is PSP of record", score: 0 },
      { value: "review", label: "Under review", score: 0 },
    ],
    packSectionKeys: ["product-scope", "governance", "flow-of-funds"],
    appliesTo: ["payments"],
    aiHint: "If shared or no, document the sponsor/partner PSP and accountability split.",
  },
  {
    id: "pay-operate-accounts",
    sectionId: "payments",
    prompt: "Will you provide or operate payment accounts?",
    description: "Includes balances, statements, access controls, and account administration.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 Sch 1 Pt 1 para 1(a)", "PERG 15"],
    options: [
      { value: "yes", label: "Yes, we operate payment accounts", score: 3 },
      { value: "no", label: "No, accounts are held with another PSP", score: 0 },
      { value: "review", label: "Under review", score: 1 },
    ],
    packSectionKeys: ["product-scope", "product-architecture"],
    appliesTo: ["payments"],
    aiHint: "Describe whether accounts are in the firm's name and how customer access is managed.",
  },
  {
    id: "pay-credit-line",
    sectionId: "payments",
    prompt: "Will any payment execution be funded by credit or overdraft?",
    description: "Indicate whether payments can be executed without prefunded balances.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 Sch 1 Pt 1 para 1(d)", "PERG 15"],
    options: [
      { value: "prefunded", label: "Prefunded balances only", score: 3 },
      { value: "credit", label: "Credit/overdraft funded execution", score: 0 },
      { value: "both", label: "Both prefunded and credit execution", score: 1 },
      { value: "review", label: "Under review", score: 1 },
    ],
    packSectionKeys: ["financials", "risk-compliance"],
    appliesTo: ["payments"],
    aiHint: "If credit-funded execution is planned, explain limits and underwriting controls.",
  },
  {
    id: "pay-payment-instruments",
    sectionId: "payments",
    prompt: "Do you provide the payment initiation procedure or instrument?",
    description: "Includes authenticated approval workflows and submission procedures used by customers.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 Sch 1 Pt 1 para 1(e)", "PERG 15"],
    options: [
      { value: "yes", label: "Yes, we provide the initiation procedure/instrument", score: 2 },
      { value: "no", label: "No, the PSP provides the initiation procedure", score: 0 },
      { value: "review", label: "Under review", score: 1 },
    ],
    packSectionKeys: ["product-architecture", "security-policy"],
    appliesTo: ["payments"],
    aiHint: "Clarify whether your workflow is the mechanism that initiates payment orders.",
  },
  {
    id: "pay-services",
    sectionId: "payments",
    prompt: "Payment services in scope (PSR 2017)",
    description: "Select all payment services you plan to provide.",
    type: "multi-choice",
    required: true,
    weight: 3,
    regulatoryRefs: [
      "PERG 15 Annex 2 - Payment services",
      "PSD2 Annex I - Payment services",
      "PSR 2017",
    ],
    options: [
      { value: "cash-deposit", label: "Cash deposit to payment account", score: 2 },
      { value: "cash-withdrawal", label: "Cash withdrawal from payment account", score: 2 },
      { value: "execution-transfers", label: "Execution of payment transactions (credit transfer, direct debit, card)", score: 2 },
      { value: "execution-telecom", label: "Execution via telecom or IT device", score: 1 },
      { value: "issuing-acquiring", label: "Issuing or acquiring payment instruments", score: 2 },
      { value: "money-remittance", label: "Money remittance", score: 2 },
    ],
    packSectionKeys: ["product-scope", "product-architecture", "schedule-2"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-exemptions",
    sectionId: "payments",
    prompt: "Potential exemptions relied upon",
    description: "Select any PSR exemptions that may apply.",
    type: "multi-choice",
    required: false,
    weight: 1,
    regulatoryRefs: [
      "PERG 15 Annex 3 - Payment services exclusions",
      "PSD2 Article 3 - Exemptions",
    ],
    options: [
      { value: "limited-network", label: "Limited network exemption", score: 1 },
      { value: "commercial-agent", label: "Commercial agent exemption", score: 1 },
      { value: "technical-service", label: "Technical service provider", score: 1 },
      { value: "none", label: "No exemptions expected", score: 1 },
    ],
    packSectionKeys: ["product-scope"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-emoney",
    sectionId: "payments",
    prompt: "Will you issue electronic money?",
    description: "Confirm whether e-money issuance is part of the model.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: [
      "EMRs 2011",
      "FCA Approach to Payment Services and E-Money (2017)",
      "PSD2",
    ],
    options: [
      {
        value: "yes",
        label: "Yes, issuing e-money",
        score: 3,
        implication: "Selecting YES means you need EMI authorization (not just PI). This requires higher capital (€350k vs €125k), client money safeguarding, and additional FCA permissions.",
      },
      {
        value: "no",
        label: "No e-money issuance",
        score: 1,
        implication: "You can proceed as a Payment Institution (PI) which has lower capital requirements.",
      },
      { value: "review", label: "Under review", score: 0 },
    ],
    packSectionKeys: ["product-scope"],
    appliesTo: ["payments"],
    impact: "Determines whether you need EMI or PI authorization, affecting capital requirements and regulatory obligations.",
  },
  {
    id: "pay-safeguarding",
    sectionId: "payments",
    prompt: "Safeguarding approach",
    description: "How will customer funds be safeguarded?",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: [
      "PSR 2017 - Safeguarding",
      "FCA Approach to Payment Services and E-Money (2017) - Safeguarding",
    ],
    options: [
      { value: "segregated", label: "Segregated safeguarding account", score: 3 },
      { value: "insurance", label: "Insurance or comparable guarantee", score: 2 },
      { value: "undecided", label: "Not decided yet", score: 0 },
    ],
    packSectionKeys: ["client-asset-protection"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-funds-flow-touchpoints",
    sectionId: "payments",
    prompt: "Funds flow touchpoints",
    description: "Select where customer funds sit or move through in the lifecycle.",
    type: "multi-choice",
    required: false,
    weight: 1,
    regulatoryRefs: ["PSR 2017 - Safeguarding", "FCA Approach to Payment Services and E-Money (2017)"],
    options: [
      {
        value: "customer-wallet",
        label: "Customer wallet / e-money account",
        score: 1,
        implication: "Requires clear e-money issuance and redemption controls.",
      },
      {
        value: "safeguarding-account",
        label: "Segregated safeguarding account",
        score: 2,
        implication: "Requires reconciliation, segregation, and safeguarding policy evidence.",
      },
      {
        value: "partner-bank",
        label: "Partner/settlement bank account",
        score: 1,
        implication: "Clarify settlement timing and safeguarding separation from own funds.",
      },
      {
        value: "psp",
        label: "Third-party PSP / acquirer",
        score: 1,
        implication: "Clarify contractual responsibilities and safeguarding responsibilities.",
      },
      {
        value: "card-scheme",
        label: "Card scheme / issuer processor",
        score: 1,
        implication: "Document scheme settlement flows and chargeback handling.",
      },
      {
        value: "other",
        label: "Other",
        score: 1,
        implication: "Add any additional funds flow touchpoints.",
      },
    ],
    allowOther: true,
    packSectionKeys: ["flow-of-funds", "product-architecture", "client-asset-protection"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-funds-flow",
    sectionId: "payments",
    prompt: "Describe the flow of funds",
    description: "Summarize how funds move between customers, partners, and safeguarding accounts.",
    placeholder: "Outline each step: payer -> wallet/account -> safeguarding -> settlement -> merchant, incl. timing.",
    type: "text",
    required: true,
    weight: 2,
    regulatoryRefs: ["FCA Approach to Payment Services and E-Money (2017) - Safeguarding"],
    packSectionKeys: ["flow-of-funds", "product-architecture"],
    appliesTo: ["payments"],
    aiHint:
      "Include who holds funds at each step, settlement timing, prefunding vs credit, reconciliation cadence, safeguarding segregation, refunds/chargebacks, and any third-party PSPs.",
  },
  {
    id: "pay-agents",
    sectionId: "payments",
    prompt: "Will you use agents or distributors?",
    description: "Confirm if third-party agents will act on your behalf.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 - Agent registration"],
    options: [
      { value: "yes", label: "Yes, agents or distributors", score: 2 },
      { value: "no", label: "No agents", score: 3 },
      { value: "review", label: "Under review", score: 1 },
    ],
    packSectionKeys: ["business-model", "governance"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-volume",
    sectionId: "payments",
    prompt: "Expected monthly transaction volume (GBP)",
    description: "Estimate monthly transaction volume at launch. Note: Volume above £3m/month means you cannot register as a Small Payment Institution (SPI).",
    placeholder: "e.g., 1500000",
    type: "number",
    required: false,
    weight: 1,
    regulatoryRefs: ["PSR 2017 - Reporting and notifications"],
    packSectionKeys: ["financials"],
    appliesTo: ["payments"],
    impact: "Transaction volume above £3m/month means you CANNOT register as a Small Payment Institution (SPI). You must apply for full PI/EMI authorization, which requires more capital and governance.",
    threshold: {
      value: 3000000,
      comparison: "gt",
      message: "Volume above £3m/month: You cannot register as a Small Payment Institution (SPI). Full PI/EMI authorization is required.",
    },
  },
  {
    id: "pay-security",
    sectionId: "payments",
    prompt: "Security and incident readiness",
    description: "Status of operational security, SCA, and incident reporting.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: [
      "FCA Approach to Payment Services and E-Money (2017) - Operational and security risk",
      "PSD2 RTS on SCA and CSC",
    ],
    options: [
      { value: "mature", label: "Controls designed and tested", score: 3 },
      { value: "draft", label: "Controls drafted", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["security-policy", "operational-resilience"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-headcount",
    sectionId: "payments",
    prompt: "Planned headcount at launch",
    description: "Indicate the expected number of employees at launch. This impacts own funds requirements.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 - Own funds calculation"],
    options: [
      { value: "1-5", label: "1-5 employees", score: 1 },
      { value: "6-10", label: "6-10 employees", score: 2 },
      { value: "11-25", label: "11-25 employees", score: 2 },
      { value: "26-50", label: "26-50 employees", score: 3 },
      { value: "50+", label: "50+ employees", score: 3 },
    ],
    packSectionKeys: ["financials", "governance"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-monthly-opex",
    sectionId: "payments",
    prompt: "Estimated monthly operating expenditure (GBP)",
    description: "Enter your projected monthly operating costs. Used to calculate own funds requirement under Method A.",
    placeholder: "e.g., 120000",
    type: "number",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 - Own funds requirement", "EMRs 2011 - Capital requirements"],
    packSectionKeys: ["financials"],
    appliesTo: ["payments"],
    aiHint: "Include staff, technology, compliance, rent, and professional services. Use your most recent forecast.",
  },
  {
    id: "pay-capital-method",
    sectionId: "payments",
    prompt: "Capital calculation method",
    description: "Select the own funds calculation method you intend to use for regulatory capital.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 - Own funds calculation", "FCA Approach to Payment Services and E-Money (2017)"],
    options: [
      {
        value: "method-a",
        label: "Method A - Fixed overheads",
        score: 2,
        implication: "10% of fixed overheads from previous year. Best for stable businesses with predictable costs. Simple to calculate but may result in higher capital for businesses with significant overheads.",
      },
      {
        value: "method-b",
        label: "Method B - Scalable method",
        score: 2,
        implication: "Based on payment volume tiers (0.5%-4% sliding scale). Better for high-volume, low-margin businesses. Capital requirement grows with transaction volume.",
      },
      {
        value: "method-c",
        label: "Method C - Hybrid",
        score: 2,
        implication: "Based on interest income, fees, and operating income. Suited for businesses with significant fee income. More complex calculation but may result in lower capital requirement for certain business models.",
      },
      { value: "unsure", label: "Not yet determined", score: 0 },
    ],
    packSectionKeys: ["financials"],
    appliesTo: ["payments"],
    impact: "The calculation method you choose affects your ongoing capital requirement. Choose based on your business model - overheads-heavy vs volume-heavy vs fee-income-heavy.",
    aiHint: "Method A = 10% of fixed overheads. Method B = volume tiers. Method C = income-based.",
  },
  {
    id: "cc-activities",
    sectionId: "consumer-credit",
    prompt: "Consumer credit activities in scope",
    description: "Select all consumer credit activities you will undertake.",
    type: "multi-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["PERG 17 - Consumer credit regime", "CONC 1 - Application"],
    options: [
      { value: "lending", label: "Consumer lending", score: 2 },
      { value: "credit-broking", label: "Credit broking", score: 2 },
      { value: "debt-adjusting", label: "Debt adjusting", score: 2 },
      { value: "debt-counselling", label: "Debt counselling", score: 2 },
      { value: "debt-collecting", label: "Debt collecting", score: 2 },
      { value: "credit-info", label: "Credit information services", score: 1 },
    ],
    packSectionKeys: ["product-scope", "schedule-2"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-products",
    sectionId: "consumer-credit",
    prompt: "Consumer credit products",
    description: "Select the products you will offer.",
    type: "multi-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["CONC 5 - Responsible lending"],
    options: [
      { value: "unsecured-loans", label: "Unsecured loans", score: 2 },
      { value: "hire-purchase", label: "Hire purchase / conditional sale", score: 2 },
      { value: "bnpl", label: "BNPL / short-term credit", score: 2 },
      { value: "overdraft", label: "Credit card / overdraft", score: 2 },
      { value: "logbook", label: "Logbook / pawn lending", score: 1 },
      { value: "other", label: "Other", score: 1 },
    ],
    allowOther: true,
    packSectionKeys: ["business-model"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-affordability",
    sectionId: "consumer-credit",
    prompt: "Affordability assessment framework",
    description: "Status of affordability and creditworthiness checks.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["CONC 5.2A - Creditworthiness and affordability"],
    options: [
      { value: "documented", label: "Documented and tested", score: 3 },
      { value: "draft", label: "Draft framework in progress", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["customer-lifecycle", "consumer-duty"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-forbearance",
    sectionId: "consumer-credit",
    prompt: "Arrears and forbearance strategy",
    description: "Status of arrears management and forbearance policies.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["CONC 7 - Arrears, default and recovery"],
    options: [
      { value: "documented", label: "Documented and tested", score: 3 },
      { value: "draft", label: "Draft framework in progress", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["customer-lifecycle", "consumer-duty"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-pre-contract",
    sectionId: "consumer-credit",
    prompt: "Pre-contract disclosures and explanations",
    description: "Status of pre-contract credit information and adequate explanations.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["CONC 4 - Pre-contractual information and explanations"],
    options: [
      { value: "implemented", label: "Implemented and tested", score: 3 },
      { value: "draft", label: "Drafted", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["customer-lifecycle", "consumer-duty"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-collections",
    sectionId: "consumer-credit",
    prompt: "Collections model",
    description: "How will collections and recoveries be handled?",
    type: "single-choice",
    required: true,
    weight: 1,
    regulatoryRefs: ["CONC 7 - Debt collection"],
    options: [
      { value: "in-house", label: "In-house collections", score: 3 },
      { value: "outsourced", label: "Outsourced to third party", score: 2 },
      { value: "hybrid", label: "Hybrid model", score: 2 },
    ],
    packSectionKeys: ["risk-compliance", "third-party-risk"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-vulnerability",
    sectionId: "consumer-credit",
    prompt: "Vulnerable customer treatment",
    description: "Status of vulnerable customer policy and training.",
    type: "single-choice",
    required: true,
    weight: 1,
    regulatoryRefs: ["CONC 2.10 - Vulnerable customers"],
    options: [
      { value: "implemented", label: "Implemented", score: 3 },
      { value: "draft", label: "Drafted", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["consumer-duty"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "cc-promotions",
    sectionId: "consumer-credit",
    prompt: "Financial promotions approval",
    description: "Status of promotions approval and governance.",
    type: "single-choice",
    required: true,
    weight: 1,
    regulatoryRefs: ["CONC 3 - Financial promotions"],
    options: [
      { value: "approved", label: "Approval process in place", score: 3 },
      { value: "draft", label: "Draft process", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["risk-compliance", "business-model"],
    appliesTo: ["consumer-credit"],
  },
  {
    id: "inv-activities",
    sectionId: "investments",
    prompt: "Investment activities in scope",
    description: "Select all investment activities you will undertake.",
    type: "multi-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["PERG 2 - Investment activities", "MiFID II"],
    options: [
      { value: "advice", label: "Investment advice", score: 2 },
      { value: "portfolio-management", label: "Portfolio management", score: 2 },
      { value: "arranging", label: "Arranging deals", score: 2 },
      { value: "dealing-agent", label: "Dealing as agent", score: 2 },
      { value: "dealing-principal", label: "Dealing as principal", score: 2 },
      { value: "custody", label: "Safeguarding and administration (custody)", score: 2 },
    ],
    packSectionKeys: ["product-scope", "schedule-2"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-client-types",
    sectionId: "investments",
    prompt: "Client categories",
    description: "Select the client categories you will serve.",
    type: "multi-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["COBS 3 - Client categorisation"],
    options: [
      { value: "retail", label: "Retail", score: 2 },
      { value: "professional", label: "Professional", score: 2 },
      { value: "eligible", label: "Eligible counterparties", score: 1 },
    ],
    packSectionKeys: ["business-model", "consumer-duty"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-products",
    sectionId: "investments",
    prompt: "Investment products",
    description: "Select the products you will advise on or trade.",
    type: "multi-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["COBS 4 - Communicating with clients"],
    options: [
      { value: "equities", label: "Listed equities", score: 2 },
      { value: "funds", label: "Funds / ETFs", score: 2 },
      { value: "bonds", label: "Fixed income", score: 2 },
      { value: "derivatives", label: "Derivatives", score: 1 },
      { value: "structured", label: "Structured products", score: 1 },
      { value: "other", label: "Other", score: 1 },
    ],
    allowOther: true,
    packSectionKeys: ["business-model"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-promotions",
    sectionId: "investments",
    prompt: "Financial promotions governance",
    description: "Approval, review cadence, and record-keeping for investment promotions.",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryRefs: ["COBS 4 - Communicating with clients"],
    options: [
      { value: "implemented", label: "Approval process in place", score: 3 },
      { value: "draft", label: "Draft process", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["business-model", "risk-compliance"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-client-assets",
    sectionId: "investments",
    prompt: "Will you hold client money or assets?",
    description: "Confirm if client assets will be held or controlled.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["COBS 6 - Disclosure", "CASS"],
    options: [
      { value: "yes", label: "Yes, client assets will be held", score: 3 },
      { value: "no", label: "No client assets held", score: 2 },
      { value: "review", label: "Under review", score: 1 },
    ],
    packSectionKeys: ["client-asset-protection"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-best-execution",
    sectionId: "investments",
    prompt: "Best execution arrangements",
    description: "Status of best execution policy and monitoring.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["COBS 11.2A - Best execution"],
    options: [
      { value: "implemented", label: "Implemented and monitored", score: 3 },
      { value: "draft", label: "Drafted", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["risk-compliance"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-suitability",
    sectionId: "investments",
    prompt: "Suitability and appropriateness",
    description: "Status of suitability/appropriateness framework.",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryRefs: ["COBS 9 - Suitability", "COBS 10 - Appropriateness"],
    options: [
      { value: "implemented", label: "Implemented and tested", score: 3 },
      { value: "draft", label: "Drafted", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["customer-lifecycle", "consumer-duty"],
    appliesTo: ["investments"],
  },
  {
    id: "inv-conflicts",
    sectionId: "investments",
    prompt: "Conflicts of interest framework",
    description: "Status of conflicts identification and mitigation.",
    type: "single-choice",
    required: true,
    weight: 1,
    regulatoryRefs: ["COBS 2.3 - Inducements and conflicts"],
    options: [
      { value: "implemented", label: "Implemented", score: 3 },
      { value: "draft", label: "Drafted", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["risk-compliance", "governance"],
    appliesTo: ["investments"],
  },
];

const QUESTION_INDEX = new Map(PROFILE_QUESTIONS.map((question) => [question.id, question]));

export const getProfileSections = (permission?: ProfilePermissionCode | null) =>
  PROFILE_SECTIONS.filter(
    (section) => !section.appliesTo || (permission ? section.appliesTo.includes(permission) : false)
  );

export const getProfileQuestions = (permission?: ProfilePermissionCode | null) =>
  PROFILE_QUESTIONS.filter(
    (question) => !question.appliesTo || (permission ? question.appliesTo.includes(permission) : false)
  );

const isAnswered = (
  question: ProfileQuestion,
  value: ProfileResponse | undefined,
  responses: Record<string, ProfileResponse>
) => {
  if (
    question.allowOther &&
    ((Array.isArray(value) && value.includes("other")) || value === "other")
  ) {
    const otherText = responses[`${question.id}_other_text`];
    if (typeof otherText !== "string" || otherText.trim().length === 0) {
      return false;
    }
  }
  if (value === undefined || value === null) return false;
  if (question.type === "multi-choice") {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === "text") {
    return String(value).trim().length > 0;
  }
  if (question.type === "number") {
    if (typeof value === "number") return !isNaN(value);
    if (typeof value === "string") {
      const parsed = Number(value);
      return value.trim().length > 0 && !Number.isNaN(parsed);
    }
    return false;
  }
  if (question.type === "boolean") {
    return typeof value === "boolean";
  }
  return String(value).trim().length > 0;
};

const scoreQuestion = (
  question: ProfileQuestion,
  value: ProfileResponse | undefined,
  responses: Record<string, ProfileResponse>
) => {
  const weight = question.weight ?? 1;
  const answered = isAnswered(question, value, responses);
  if (!answered) {
    return { score: 0, maxScore: weight };
  }

  if (question.type === "single-choice" && question.options?.length) {
    const maxOption = Math.max(...question.options.map((opt) => opt.score), 1);
    const optionScore = question.options.find((opt) => opt.value === value)?.score ?? 0;
    return { score: (optionScore / maxOption) * weight, maxScore: weight };
  }

  if (question.type === "multi-choice" && question.options?.length) {
    return { score: weight, maxScore: weight };
  }

  if (question.type === "boolean") {
    return { score: value === true ? weight : 0, maxScore: weight };
  }

  return { score: weight, maxScore: weight };
};

const getActivityHighlights = (
  permission: ProfilePermissionCode | null | undefined,
  responses: Record<string, ProfileResponse>
) => {
  if (!permission) return [];
  const activityQuestionId: Record<ProfilePermissionCode, string> = {
    payments: "pay-services",
    "consumer-credit": "cc-activities",
    investments: "inv-activities",
  };
  const questionId = activityQuestionId[permission];
  const question = QUESTION_INDEX.get(questionId);
  if (!question || !question.options) return [];
  const selected = responses[questionId];
  if (!Array.isArray(selected)) return [];
  return question.options.filter((opt) => selected.includes(opt.value)).map((opt) => opt.label);
};

const buildPaymentsOpinion = (responses: Record<string, ProfileResponse>): PerimeterOpinion => {
  const services = Array.isArray(responses["pay-services"]) ? responses["pay-services"] : [];
  const exemptions = Array.isArray(responses["pay-exemptions"]) ? responses["pay-exemptions"] : [];
  const filteredExemptions = exemptions.filter((value) => value !== "none");
  const issuesEmoney = responses["pay-emoney"] === "yes";

  if (!services.length && !filteredExemptions.length) {
    return {
      verdict: "unknown",
      summary: "Payment services scope not confirmed.",
      rationale: ["Confirm the payment services and perimeter assumptions."],
      obligations: [],
    };
  }

  if (!services.length && filteredExemptions.length) {
    return {
      verdict: "possible-exemption",
      summary: "Potential exemption from full authorisation.",
      rationale: [
        "Exemptions selected may apply depending on the exact model.",
        "Confirm scope against PERG 15 exclusions.",
      ],
      obligations: ["Document exemption rationale and evidence of fit."],
    };
  }

  const obligations = [
    "Safeguarding and segregation of customer funds",
    "Operational and security risk management",
    "Incident reporting and notification processes",
    "Financial crime and AML controls",
  ];

  if (issuesEmoney) {
    obligations.push("E-money issuance controls and redemption obligations");
  }

  obligations.push("Strong customer authentication and secure communications (PSD2 RTS)");

  return {
    verdict: filteredExemptions.length ? "possible-exemption" : "in-scope",
    summary: issuesEmoney
      ? "Likely in scope of PSR 2017 and EMRs 2011."
      : "Likely in scope of PSR 2017 payment services.",
    rationale: [
      "Payment services selected indicate regulated activity.",
      filteredExemptions.length ? "Some exemptions selected require confirmation." : "No exemptions selected.",
    ],
    obligations,
  };
};

const buildConsumerCreditOpinion = (responses: Record<string, ProfileResponse>): PerimeterOpinion => {
  const activities = Array.isArray(responses["cc-activities"]) ? responses["cc-activities"] : [];
  if (!activities.length) {
    return {
      verdict: "unknown",
      summary: "Consumer credit scope not confirmed.",
      rationale: ["Confirm the consumer credit activities in scope."],
      obligations: [],
    };
  }
  return {
    verdict: "in-scope",
    summary: "Likely in scope of regulated consumer credit activity.",
    rationale: ["Selected activities indicate consumer credit permissions are required."],
    obligations: [
      "Affordability and creditworthiness assessment (CONC 5)",
      "Arrears, forbearance, and vulnerable customer support (CONC 7)",
      "Financial promotions governance (CONC 3)",
    ],
  };
};

const buildInvestmentOpinion = (responses: Record<string, ProfileResponse>): PerimeterOpinion => {
  const activities = Array.isArray(responses["inv-activities"]) ? responses["inv-activities"] : [];
  if (!activities.length) {
    return {
      verdict: "unknown",
      summary: "Investment scope not confirmed.",
      rationale: ["Confirm investment activities and client categories."],
      obligations: [],
    };
  }
  return {
    verdict: "in-scope",
    summary: "Likely in scope of regulated investment services.",
    rationale: ["Selected activities indicate investment permissions are required."],
    obligations: [
      "Client categorisation (COBS 3) and suitability checks (COBS 9/10)",
      "Best execution monitoring (COBS 11.2A)",
      "Conflicts of interest management (COBS 2.3/SYSC 10)",
      "Client assets protections where applicable (CASS)",
    ],
  };
};

const detectConflicts = (
  permission: ProfilePermissionCode | null | undefined,
  responses: Record<string, ProfileResponse>
): ValidationConflict[] => {
  const conflicts: ValidationConflict[] = [];

  if (permission === "payments") {
    // Conflict: No e-money but e-money wallet in funds flow
    const emoney = responses["pay-emoney"];
    const fundsFlow = Array.isArray(responses["pay-funds-flow-touchpoints"])
      ? responses["pay-funds-flow-touchpoints"]
      : [];
    if (emoney === "no" && fundsFlow.includes("customer-wallet")) {
      conflicts.push({
        id: "emoney-wallet-conflict",
        severity: "error",
        message: "You selected 'No e-money issuance' but included 'Customer wallet / e-money account' in funds flow.",
        questionIds: ["pay-emoney", "pay-funds-flow-touchpoints"],
        suggestion: "If you hold customer balances in wallets, this likely constitutes e-money issuance.",
      });
    }

    // Conflict: PSP of record but no payment account operation
    const pspRecord = responses["pay-psp-record"];
    const operateAccounts = responses["pay-operate-accounts"];
    if (pspRecord === "psp-of-record" && operateAccounts === "no") {
      conflicts.push({
        id: "psp-account-conflict",
        severity: "warning",
        message: "You are PSP of record but don't operate payment accounts. Clarify the operating model.",
        questionIds: ["pay-psp-record", "pay-operate-accounts"],
        suggestion: "If another PSP holds accounts, document the principal arrangement clearly.",
      });
    }

    // Conflict: High volume but no safeguarding decision
    const rawVolume = responses["pay-volume"];
    const parsedVolume = typeof rawVolume === "number"
      ? rawVolume
      : typeof rawVolume === "string"
      ? parseFloat(rawVolume.replace(/,/g, ""))
      : 0;
    const volume = Number.isFinite(parsedVolume) ? parsedVolume : 0;
    const safeguarding = responses["pay-safeguarding"];
    if (volume > 1000000 && safeguarding === "undecided") {
      conflicts.push({
        id: "volume-safeguarding-conflict",
        severity: "warning",
        message: "High transaction volume (>£1m/month) but safeguarding approach undecided.",
        questionIds: ["pay-volume", "pay-safeguarding"],
        suggestion: "Safeguarding is critical for volumes of this size. Decide on segregated accounts or insurance.",
      });
    }

    // Conflict: Agents but no agent oversight in risks
    const agents = responses["pay-agents"];
    const risks = Array.isArray(responses["core-risk-theme"]) ? responses["core-risk-theme"] : [];
    if (agents === "yes" && !risks.includes("outsourcing-failure")) {
      conflicts.push({
        id: "agents-risk-conflict",
        severity: "warning",
        message: "You use agents but haven't identified outsourcing/vendor failure as a key risk.",
        questionIds: ["pay-agents", "core-risk-theme"],
        suggestion: "Agent oversight is a regulatory focus area. Consider adding outsourcing risk.",
      });
    }

    // Conflict: Credit-funded execution without credit documentation
    const creditLine = responses["pay-credit-line"];
    if (creditLine === "credit" || creditLine === "both") {
      const activities = responses["core-regulated-activities"];
      // Handle both string and array types for activities
      const activitiesText = typeof activities === "string"
        ? activities.toLowerCase()
        : Array.isArray(activities)
        ? activities.join(" ").toLowerCase()
        : "";
      if (!activitiesText.includes("credit")) {
        conflicts.push({
          id: "credit-execution-conflict",
          severity: "warning",
          message: "Credit/overdraft-funded execution may trigger consumer credit permissions.",
          questionIds: ["pay-credit-line", "core-regulated-activities"],
          suggestion: "Document credit terms clearly - this could require additional CONC permissions.",
        });
      }
    }
  }

  // General conflicts
  const governance = responses["core-governance"];
  const winddown = responses["core-winddown"];
  if (governance === "not-started" && winddown === "draft") {
    conflicts.push({
      id: "governance-winddown-conflict",
      severity: "warning",
      message: "Wind-down plan drafted but governance not started. Wind-down requires board oversight.",
      questionIds: ["core-governance", "core-winddown"],
      suggestion: "Ensure board/SMF roles are in place to own the wind-down plan.",
    });
  }

  // Capital vs projections conflict
  const capital = responses["core-capital"];
  const projections = responses["core-projections"];
  if (capital === "not-secured" && projections === "full") {
    conflicts.push({
      id: "capital-projections-conflict",
      severity: "warning",
      message: "Full financial projections but funding not secured.",
      questionIds: ["core-capital", "core-projections"],
      suggestion: "Projections should align with realistic funding expectations.",
    });
  }

  return conflicts;
};

// Currency conversion rate (as of 2024, for indicative calculations only)
const GBP_TO_EUR = 1.17;
const EUR_TO_GBP = 1 / GBP_TO_EUR; // ~0.855

const calculateCapitalEstimate = (
  permission: ProfilePermissionCode | null | undefined,
  responses: Record<string, ProfileResponse>
): CapitalEstimate | null => {
  if (permission !== "payments") return null;

  const method = responses["pay-capital-method"];
  const rawOpex = responses["pay-monthly-opex"];
  const rawVolume = responses["pay-volume"];

  const monthlyOpex = typeof rawOpex === "number"
    ? rawOpex
    : typeof rawOpex === "string"
    ? parseFloat(rawOpex.replace(/,/g, ""))
    : null;
  const monthlyVolume = typeof rawVolume === "number"
    ? rawVolume
    : typeof rawVolume === "string"
    ? parseFloat(rawVolume.replace(/,/g, ""))
    : null;
  const emoney = responses["pay-emoney"] === "yes";

  // Minimum capital requirements in EUR, converted to GBP
  // PI: €125k, EMI: €350k
  const PI_MINIMUM_EUR = emoney ? 350000 : 125000;
  const minimumCapitalGbp = Math.round(PI_MINIMUM_EUR * EUR_TO_GBP);

  let methodAEstimate: number | null = null;
  let methodBEstimate: number | null = null;

  // Method A: 10% of fixed overheads (already in GBP)
  if (monthlyOpex !== null && Number.isFinite(monthlyOpex) && monthlyOpex > 0) {
    const annualOverheads = monthlyOpex * 12;
    methodAEstimate = annualOverheads * 0.1;
  }

  // Method B: Volume-based tiers (PSR 2017)
  // Tiers are in EUR: 4% of first €5m, 2.5% of €5m-€10m, 1% of €10m-€100m, 0.5% of €100m-€250m, 0.25% above
  if (monthlyVolume !== null && Number.isFinite(monthlyVolume) && monthlyVolume > 0) {
    const annualVolume = monthlyVolume * 12;
    // Convert GBP volume to EUR for tier calculation
    const volumeEur = annualVolume * GBP_TO_EUR;

    let methodBEur = 0;
    const tiers = [
      { threshold: 5000000, rate: 0.04 },
      { threshold: 10000000, rate: 0.025 },
      { threshold: 100000000, rate: 0.01 },
      { threshold: 250000000, rate: 0.005 },
      { threshold: Infinity, rate: 0.0025 },
    ];

    let remaining = volumeEur;
    let prevThreshold = 0;
    for (const tier of tiers) {
      const tierAmount = Math.min(remaining, tier.threshold - prevThreshold);
      if (tierAmount <= 0) break;
      methodBEur += tierAmount * tier.rate;
      remaining -= tierAmount;
      prevThreshold = tier.threshold;
    }

    // Convert result back to GBP using consistent rate
    methodBEstimate = methodBEur * EUR_TO_GBP;
  }

  // Determine recommendation
  let recommendation = "";
  const breakdown: string[] = [];

  if (methodAEstimate !== null && methodBEstimate !== null) {
    const methodATotal = Math.max(methodAEstimate, minimumCapitalGbp);
    const methodBTotal = Math.max(methodBEstimate, minimumCapitalGbp);

    breakdown.push(`Method A (10% fixed overheads): £${Math.round(methodAEstimate).toLocaleString()}`);
    breakdown.push(`Method B (volume tiers): £${Math.round(methodBEstimate).toLocaleString()}`);
    breakdown.push(`Minimum capital (${emoney ? "EMI €350k" : "PI €125k"}): £${minimumCapitalGbp.toLocaleString()}`);

    if (methodATotal < methodBTotal) {
      recommendation = `Method A results in lower capital (£${Math.round(methodATotal).toLocaleString()} vs £${Math.round(methodBTotal).toLocaleString()}). Better for overhead-light, high-volume models.`;
    } else if (methodBTotal < methodATotal) {
      recommendation = `Method B results in lower capital (£${Math.round(methodBTotal).toLocaleString()} vs £${Math.round(methodATotal).toLocaleString()}). Better for low-volume or high-overhead models.`;
    } else {
      recommendation = `Both methods result in similar capital (£${Math.round(methodATotal).toLocaleString()}). Choose based on future growth expectations.`;
    }
  } else if (methodAEstimate !== null) {
    breakdown.push(`Method A (10% fixed overheads): £${Math.round(methodAEstimate).toLocaleString()}`);
    breakdown.push(`Minimum capital (${emoney ? "EMI €350k" : "PI €125k"}): £${minimumCapitalGbp.toLocaleString()}`);
    recommendation = "Enter transaction volume to compare with Method B calculation.";
  } else if (methodBEstimate !== null) {
    breakdown.push(`Method B (volume tiers): £${Math.round(methodBEstimate).toLocaleString()}`);
    breakdown.push(`Minimum capital (${emoney ? "EMI €350k" : "PI €125k"}): £${minimumCapitalGbp.toLocaleString()}`);
    recommendation = "Enter monthly OpEx to compare with Method A calculation.";
  } else {
    recommendation = "Enter monthly OpEx and transaction volume to calculate capital requirements.";
  }

  return {
    method: method === "method-a" ? "A" : method === "method-b" ? "B" : method === "method-c" ? "C" : null,
    minimumCapital: minimumCapitalGbp,
    methodAEstimate,
    methodBEstimate,
    recommendation,
    breakdown,
  };
};

export const buildProfileInsights = (
  permission: ProfilePermissionCode | null | undefined,
  responses: Record<string, ProfileResponse>
): ProfileInsights => {
  const applicableSections = getProfileSections(permission);
  const applicableQuestions = getProfileQuestions(permission);

  const sectionScoreMap = new Map<string, { score: number; maxScore: number }>();
  const packScoreMap = new Map<string, { score: number; maxScore: number }>();
  const regulatoryMap = new Map<string, number>();

  let requiredTotal = 0;
  let requiredAnswered = 0;

  for (const question of applicableQuestions) {
    const response = responses[question.id];
    const answered = isAnswered(question, response, responses);
    if (question.required) {
      requiredTotal += 1;
      if (answered) requiredAnswered += 1;
    }

    const { score, maxScore } = scoreQuestion(question, response, responses);

    const sectionStats = sectionScoreMap.get(question.sectionId) ?? { score: 0, maxScore: 0 };
    sectionStats.score += score;
    sectionStats.maxScore += maxScore;
    sectionScoreMap.set(question.sectionId, sectionStats);

    for (const sectionKey of question.packSectionKeys ?? []) {
      const packStats = packScoreMap.get(sectionKey) ?? { score: 0, maxScore: 0 };
      packStats.score += score;
      packStats.maxScore += maxScore;
      packScoreMap.set(sectionKey, packStats);
    }

    if (answered && question.regulatoryRefs) {
      for (const ref of question.regulatoryRefs) {
        regulatoryMap.set(ref, (regulatoryMap.get(ref) ?? 0) + 1);
      }
    }
  }

  const completionPercent = requiredTotal
    ? Math.round((requiredAnswered / requiredTotal) * 100)
    : 0;

  const sectionScores = applicableSections.map((section) => {
    const stats = sectionScoreMap.get(section.id) ?? { score: 0, maxScore: 0 };
    const percent = stats.maxScore ? Math.round((stats.score / stats.maxScore) * 100) : 0;
    return {
      id: section.id,
      label: section.title,
      score: stats.score,
      maxScore: stats.maxScore,
      percent,
    };
  });

  const packSectionScores = Array.from(packScoreMap.entries()).map(([key, stats]) => {
    const label = PACK_SECTION_LABELS[key] || key;
    const percent = stats.maxScore ? Math.round((stats.score / stats.maxScore) * 100) : 0;
    return {
      key,
      label,
      percent,
      score: stats.score,
      maxScore: stats.maxScore,
    };
  });

  const regulatorySignals = Array.from(regulatoryMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const activityHighlights = getActivityHighlights(permission, responses);

  let perimeterOpinion: PerimeterOpinion = {
    verdict: "unknown",
    summary: "Perimeter opinion pending.",
    rationale: ["Complete the scope section to generate a perimeter view."],
    obligations: [],
  };

  if (permission === "payments") {
    perimeterOpinion = buildPaymentsOpinion(responses);
  } else if (permission === "consumer-credit") {
    perimeterOpinion = buildConsumerCreditOpinion(responses);
  } else if (permission === "investments") {
    perimeterOpinion = buildInvestmentOpinion(responses);
  }

  const focusAreas = packSectionScores
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 4)
    .map((item) => item.label);

  const conflicts = detectConflicts(permission, responses);
  const capitalEstimate = calculateCapitalEstimate(permission, responses);

  return {
    completionPercent,
    sectionScores,
    packSectionScores,
    regulatorySignals,
    activityHighlights,
    perimeterOpinion,
    focusAreas,
    conflicts,
    capitalEstimate,
  };
};
