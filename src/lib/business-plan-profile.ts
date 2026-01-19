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

export interface ProfileInsights {
  completionPercent: number;
  sectionScores: ProfileSectionScore[];
  packSectionScores: PackSectionScore[];
  regulatorySignals: RegulatorySignal[];
  activityHighlights: string[];
  perimeterOpinion: PerimeterOpinion;
  focusAreas: string[];
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
    aiHint: "Describe what you do in plain language. The AI will convert this into FCA-ready regulatory narrative.",
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
    description: "Summarize the top 3 risks and mitigation approach.",
    type: "text",
    required: true,
    weight: 2,
    packSectionKeys: ["risk-compliance"],
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
    description: "Status of exit strategy, triggers, and cost model.",
    type: "single-choice",
    required: true,
    weight: 2,
    options: [
      { value: "draft", label: "Draft plan complete", score: 3 },
      { value: "outline", label: "Outline in progress", score: 2 },
      { value: "not-started", label: "Not started", score: 0 },
    ],
    packSectionKeys: ["wind-down"],
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
      { value: "payment-initiation", label: "Payment initiation service (PIS)", score: 2 },
      { value: "account-information", label: "Account information service (AIS)", score: 2 },
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
    id: "pay-funds-flow",
    sectionId: "payments",
    prompt: "Describe the flow of funds",
    description: "Summarize how funds move between customers, partners, and safeguarding accounts.",
    type: "text",
    required: true,
    weight: 2,
    regulatoryRefs: ["FCA Approach to Payment Services and E-Money (2017) - Safeguarding"],
    packSectionKeys: ["flow-of-funds", "product-architecture"],
    appliesTo: ["payments"],
  },
  {
    id: "pay-pis-ais",
    sectionId: "payments",
    prompt: "Open banking services",
    description: "Select if PIS or AIS is offered.",
    type: "multi-choice",
    required: false,
    weight: 1,
    regulatoryRefs: [
      "FCA Approach to Payment Services and E-Money (2017) - Authentication",
      "PSD2 RTS on SCA and CSC",
    ],
    options: [
      { value: "pis", label: "Payment initiation service", score: 1 },
      { value: "ais", label: "Account information service", score: 1 },
    ],
    packSectionKeys: ["security-policy", "operational-resilience"],
    appliesTo: ["payments"],
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
    type: "number",
    required: true,
    weight: 2,
    regulatoryRefs: ["PSR 2017 - Own funds requirement", "EMRs 2011 - Capital requirements"],
    packSectionKeys: ["financials"],
    appliesTo: ["payments"],
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

const isAnswered = (question: ProfileQuestion, value: ProfileResponse | undefined) => {
  if (value === undefined || value === null) return false;
  if (question.type === "multi-choice") {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === "text") {
    return String(value).trim().length > 0;
  }
  if (question.type === "number") {
    return typeof value === "number" && !isNaN(value);
  }
  if (question.type === "boolean") {
    return typeof value === "boolean";
  }
  return String(value).trim().length > 0;
};

const scoreQuestion = (question: ProfileQuestion, value: ProfileResponse | undefined) => {
  const weight = question.weight ?? 1;
  const answered = isAnswered(question, value);
  if (!answered) {
    return { score: 0, maxScore: weight };
  }

  if (question.type === "single-choice" && question.options?.length) {
    const maxOption = Math.max(...question.options.map((opt) => opt.score), 1);
    const optionScore = question.options.find((opt) => opt.value === value)?.score ?? 0;
    return { score: (optionScore / maxOption) * weight, maxScore: weight };
  }

  if (question.type === "multi-choice" && question.options?.length) {
    const values = Array.isArray(value) ? value : [];
    const totalScore = question.options.reduce((sum, opt) => sum + opt.score, 0) || 1;
    const selectedScore = question.options
      .filter((opt) => values.includes(opt.value))
      .reduce((sum, opt) => sum + opt.score, 0);
    return { score: (selectedScore / totalScore) * weight, maxScore: weight };
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
    const answered = isAnswered(question, response);
    if (question.required) {
      requiredTotal += 1;
      if (answered) requiredAnswered += 1;
    }

    const { score, maxScore } = scoreQuestion(question, response);

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

  return {
    completionPercent,
    sectionScores,
    packSectionScores,
    regulatorySignals,
    activityHighlights,
    perimeterOpinion,
    focusAreas,
  };
};
