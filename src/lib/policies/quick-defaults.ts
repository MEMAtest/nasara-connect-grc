import type { DetailLevel } from "@/lib/policies/clause-tiers";
import type { FirmPermissions } from "@/lib/policies/permissions";
import type { PolicyTemplate } from "@/lib/policies/templates";
import type { FirmProfile, WizardApprovals } from "@/components/policies/policy-wizard/types";
import {
  DEFAULT_PERMISSIONS,
} from "@/lib/policies/permissions";
import {
  DEFAULT_COMPLAINTS_ANSWERS,
  assembleComplaintsPolicy,
  type ComplaintsAssemblerAnswers,
} from "@/lib/policies/assemblers/complaints";
import { getTemplateByCode } from "@/lib/policies/templates";

export type QuickAnswer = string | boolean | string[];
export type QuickAnswers = Record<string, QuickAnswer>;

export interface QuickQuestion {
  id: string;
  label: string;
  type: "text" | "boolean" | "multi";
  options?: string[];
  required?: boolean;
  description?: string;
}

const multiQuestion = (
  id: string,
  label: string,
  options: string[],
  description?: string,
): QuickQuestion => ({
  id,
  label,
  type: "multi",
  options,
  description,
});

const DEFAULT_DETAIL_LEVEL: DetailLevel = "standard";

const DEFAULT_APPROVALS: WizardApprovals = {
  requiresSMF: true,
  smfRole: "SMF16 - Compliance Oversight",
  requiresBoard: true,
  boardFrequency: "annual",
  additionalApprovers: [],
};

const FIRM_NAME_QUESTION: QuickQuestion = {
  id: "firmName",
  label: "Firm name",
  type: "text",
  required: true,
  description: "Used on the policy cover and document headers.",
};

const RETAIL_QUESTION: QuickQuestion = {
  id: "retailClients",
  label: "Serve retail customers?",
  type: "boolean",
  description: "Include retail consumer-facing obligations.",
};

const PROFESSIONAL_QUESTION: QuickQuestion = {
  id: "professionalClients",
  label: "Serve professional clients?",
  type: "boolean",
  description: "Include professional and wholesale client expectations.",
};

const PAYMENT_QUESTION: QuickQuestion = {
  id: "paymentServices",
  label: "Regulated for payment services?",
  type: "boolean",
  description: "Includes PSD/PSRs permissions and safeguarding controls.",
};

const EMONEY_QUESTION: QuickQuestion = {
  id: "eMoney",
  label: "Issue or distribute e-money?",
  type: "boolean",
  description: "Cover e-money issuance and safeguarding scope.",
};

const INVESTMENT_QUESTION: QuickQuestion = {
  id: "investmentServices",
  label: "Provide investment services?",
  type: "boolean",
  description: "Advising, arranging, or dealing in investments.",
};

const CREDIT_QUESTION: QuickQuestion = {
  id: "creditBroking",
  label: "Provide consumer credit or lending?",
  type: "boolean",
  description: "Include credit broking or lending permissions.",
};

const CLIENT_MONEY_QUESTION: QuickQuestion = {
  id: "clientMoney",
  label: "Hold client money?",
  type: "boolean",
  description: "Include client money safeguarding and reconciliation requirements.",
};

const CLIENT_ASSETS_QUESTION: QuickQuestion = {
  id: "clientAssets",
  label: "Hold client assets?",
  type: "boolean",
  description: "Include client asset safeguarding and custody requirements.",
};

const INSURANCE_QUESTION: QuickQuestion = {
  id: "insuranceMediation",
  label: "Carry out insurance mediation?",
  type: "boolean",
  description: "Relevant for distribution oversight and PROD requirements.",
};

const COMPLEX_PRODUCTS_QUESTION: QuickQuestion = {
  id: "complexProducts",
  label: "Offer complex products?",
  type: "boolean",
  description: "Include enhanced governance and suitability controls.",
};

const EEA_COMPLAINTS_QUESTION: QuickQuestion = {
  id: "eeaPassporting",
  label: "Handle EEA passporting complaints?",
  type: "boolean",
  description: "Include cross-border complaint obligations.",
};

const CHANNEL_OPTIONS = [
  "Online portal",
  "Mobile app",
  "API / partners",
  "Branch",
  "Telephone",
  "Brokers / ARs",
  "Third-party platforms",
];

const CUSTOMER_SEGMENT_OPTIONS = [
  "Retail customers",
  "Professional clients",
  "Eligible counterparties",
  "SMEs / micro-enterprises",
  "High net worth",
];

const PRODUCT_OPTIONS = [
  "Payment services",
  "E-money",
  "Investments",
  "Consumer credit",
  "Insurance mediation",
  "Mortgages",
  "Remittances",
];

const HIGH_RISK_SECTOR_OPTIONS = [
  "Crypto assets",
  "Gambling",
  "MSBs / PSPs",
  "Charities",
  "High-risk jurisdictions",
  "PEPs",
];

const SUPPORT_ADJUSTMENT_OPTIONS = [
  "Large print / accessible formats",
  "Translations / language support",
  "Call-backs / extra time",
  "Third-party support",
];

const SAFEGUARDING_METHOD_OPTIONS = [
  "Segregated accounts",
  "Insurance / guarantee",
  "Trust status",
  "Daily reconciliations",
];

const ADVICE_SCOPE_OPTIONS = ["Investments", "Pensions", "Mortgages", "Insurance"];

const PROMO_CHANNEL_OPTIONS = [
  "Website",
  "Email",
  "Social media",
  "Paid advertising",
  "Affiliates",
  "In-branch / events",
];

const IBS_OPTIONS = [
  "Customer onboarding",
  "Payments processing",
  "Customer support",
  "Trading / execution",
  "Regulatory reporting",
];

const CONFLICT_SOURCE_OPTIONS = [
  "Staff personal trading",
  "Gifts / hospitality",
  "Supplier incentives",
  "Group conflicts",
  "Related parties",
];

const EXECUTION_VENUE_OPTIONS = [
  "RM / exchanges",
  "MTF / OTF",
  "Systematic internaliser",
  "Broker / dealer",
  "Market maker",
];

const CREDIT_PRODUCT_OPTIONS = ["Loans", "Credit cards", "Overdrafts", "BNPL", "Mortgages"];

const FORBEARANCE_OPTIONS = [
  "Payment holidays",
  "Term extensions",
  "Interest freezes",
  "Reduced payments",
  "Debt advice referrals",
];

const PROD_ROLE_OPTIONS = ["Manufacturer", "Co-manufacturer", "Distributor"];

const TARGET_MARKET_OPTIONS = [
  "Retail customers",
  "Professional clients",
  "SMEs / micro-enterprises",
  "High net worth",
  "Vulnerable customers",
];

const MONITORING_CADENCE_OPTIONS = ["Monthly", "Quarterly", "Semi-annual", "Annual"];

const MONITORING_THEME_OPTIONS = [
  "Financial promotions",
  "Complaints",
  "AML / CTF",
  "CASS",
  "Outsourcing",
  "Consumer Duty",
];

const OUTSOURCING_TYPE_OPTIONS = [
  "Cloud hosting",
  "Payments processors",
  "KYC / KYB vendors",
  "Customer support",
  "Data providers",
  "Marketing",
];

const DATA_TYPE_OPTIONS = [
  "Personal data",
  "Payment card data",
  "Transaction data",
  "ID documents",
  "Sensitive financial data",
];

const FRAUD_CONTROL_OPTIONS = [
  "Velocity checks",
  "Device fingerprinting",
  "Behavioural analytics",
  "Manual reviews",
];

const TRADING_ACTIVITY_OPTIONS = [
  "Agency execution",
  "Principal trading",
  "Market making",
  "Corporate finance",
];

const NON_MONETARY_BENEFIT_OPTIONS = [
  "Research",
  "Hospitality",
  "Events",
  "Training",
  "Software tools",
];

const CASS_ASSET_OPTIONS = [
  "Client money",
  "Custody assets",
  "Title transfer collateral",
];

const RESOLUTION_PACK_OPTIONS = ["Shared drive", "Cloud repository", "Third-party escrow"];

const COMPLAINT_CHANNEL_OPTIONS = [
  "Phone",
  "Email",
  "Webform",
  "Mobile app",
  "Post",
  "In person",
];

const CHANNELS_QUESTION = multiQuestion(
  "policyChannels",
  "Delivery channels in scope",
  CHANNEL_OPTIONS,
  "Select the customer access channels covered by this policy.",
);

const CUSTOMER_SEGMENTS_QUESTION = multiQuestion(
  "policyCustomers",
  "Customer segments in scope",
  CUSTOMER_SEGMENT_OPTIONS,
  "Select the client segments covered by this policy.",
);

const PRODUCT_SCOPE_QUESTION = multiQuestion(
  "policyProducts",
  "Products/services in scope",
  PRODUCT_OPTIONS,
  "Select the products or services this policy should reference.",
);

const DEFAULT_QUESTIONS: QuickQuestion[] = [CHANNELS_QUESTION, CUSTOMER_SEGMENTS_QUESTION];

export const QUICK_QUESTIONS: Record<string, QuickQuestion[]> = {
  AML_CTF: [
    PRODUCT_SCOPE_QUESTION,
    CHANNELS_QUESTION,
    multiQuestion(
      "amlHighRiskSectors",
      "High-risk sectors to monitor",
      HIGH_RISK_SECTOR_OPTIONS,
      "Select the high-risk sectors you monitor closely.",
    ),
    {
      id: "amlCrossBorder",
      label: "Cross-border payments in scope?",
      type: "boolean",
      description: "Include cross-border risk factors and controls.",
    },
    {
      id: "amlCashHandling",
      label: "Handle cash or cash-like instruments?",
      type: "boolean",
      description: "Include cash-specific controls and reporting.",
    },
  ],
  CONSUMER_DUTY: [
    CUSTOMER_SEGMENTS_QUESTION,
    CHANNELS_QUESTION,
    multiQuestion(
      "consumerDutyRole",
      "Role under Consumer Duty",
      PROD_ROLE_OPTIONS,
      "Select how you participate in the distribution chain.",
    ),
    {
      id: "consumerDutyVulnerableFocus",
      label: "Enhanced support for vulnerable customers?",
      type: "boolean",
      description: "Include dedicated support considerations.",
    },
  ],
  COMPLAINTS: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "complaintChannels",
      "Complaint intake channels",
      COMPLAINT_CHANNEL_OPTIONS,
      "Select the channels used for complaint intake.",
    ),
    EEA_COMPLAINTS_QUESTION,
    {
      id: "complaintsThirdParty",
      label: "Handle complaints for third-party distributors?",
      type: "boolean",
      description: "Include oversight for complaints from partners.",
    },
  ],
  VULNERABLE_CUST: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "vulnerableSupportChannels",
      "Support channels offered",
      CHANNEL_OPTIONS,
      "Select how vulnerable customers can reach support.",
    ),
    multiQuestion(
      "vulnerableAdjustments",
      "Accessibility adjustments offered",
      SUPPORT_ADJUSTMENT_OPTIONS,
      "Select adjustments that are available on request.",
    ),
    {
      id: "vulnerableSpecialistTeam",
      label: "Dedicated vulnerable customer team?",
      type: "boolean",
      description: "Include escalation to a specialist team.",
    },
  ],
  SAFEGUARDING: [
    PRODUCT_SCOPE_QUESTION,
    multiQuestion(
      "safeguardingMethod",
      "Safeguarding method",
      SAFEGUARDING_METHOD_OPTIONS,
      "Select how relevant funds are safeguarded.",
    ),
    {
      id: "safeguardingDailyRecon",
      label: "Daily reconciliations performed?",
      type: "boolean",
      description: "Include daily reconciliation requirements.",
    },
  ],
  SUITABILITY_ADVICE: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "suitabilityAdviceScope",
      "Advice scope",
      ADVICE_SCOPE_OPTIONS,
      "Select the advice types covered.",
    ),
    {
      id: "suitabilityOngoing",
      label: "Ongoing advice service offered?",
      type: "boolean",
      description: "Include review and ongoing suitability controls.",
    },
    {
      id: "suitabilityExecutionOnly",
      label: "Execution-only services in scope?",
      type: "boolean",
      description: "Include carve-outs for execution-only business.",
    },
  ],
  FIN_PROMOTIONS: [
    multiQuestion(
      "finPromChannels",
      "Promotion channels",
      PROMO_CHANNEL_OPTIONS,
      "Select where promotions are issued.",
    ),
    {
      id: "finPromThirdParty",
      label: "Approve promotions for unauthorised persons?",
      type: "boolean",
      description: "Include oversight of third-party approvals.",
    },
    {
      id: "finPromHighRisk",
      label: "High-risk promotions in scope?",
      type: "boolean",
      description: "Include enhanced risk warnings and sign-off.",
    },
  ],
  BCP_RESILIENCE: [
    multiQuestion(
      "bcpImportantServices",
      "Important business services",
      IBS_OPTIONS,
      "Select the services considered critical.",
    ),
    {
      id: "bcpOutsourcingDependency",
      label: "Material outsourcing dependencies?",
      type: "boolean",
      description: "Include third-party dependency planning.",
    },
    {
      id: "bcpAnnualTesting",
      label: "Annual resilience testing performed?",
      type: "boolean",
      description: "Include testing and remediation expectations.",
    },
  ],
  CONFLICTS: [
    multiQuestion(
      "conflictSources",
      "Typical conflict sources",
      CONFLICT_SOURCE_OPTIONS,
      "Select the conflict sources you monitor.",
    ),
    {
      id: "conflictsRegister",
      label: "Maintain a conflicts register?",
      type: "boolean",
      description: "Include register ownership and review.",
    },
  ],
  BEST_EXECUTION: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "bestExVenues",
      "Execution venue types",
      EXECUTION_VENUE_OPTIONS,
      "Select the venue types used for execution.",
    ),
    {
      id: "bestExRetailFlow",
      label: "Retail order flow in scope?",
      type: "boolean",
      description: "Include retail execution factor weighting.",
    },
  ],
  RESPONSIBLE_LENDING: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "lendingProducts",
      "Credit products in scope",
      CREDIT_PRODUCT_OPTIONS,
      "Select the credit products covered.",
    ),
    {
      id: "lendingIncomeVerification",
      label: "Income verification required?",
      type: "boolean",
      description: "Include income verification expectations.",
    },
    {
      id: "lendingAutomatedDecisioning",
      label: "Automated decisioning used?",
      type: "boolean",
      description: "Include controls for automated decisioning.",
    },
  ],
  ARREARS_MANAGEMENT: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "arrearsForbearance",
      "Forbearance tools offered",
      FORBEARANCE_OPTIONS,
      "Select forbearance options available to customers.",
    ),
    {
      id: "arrearsThirdPartyCollections",
      label: "Use third-party collections?",
      type: "boolean",
      description: "Include oversight of third-party collections.",
    },
    {
      id: "arrearsVulnerableTriggers",
      label: "Vulnerable customer triggers in arrears?",
      type: "boolean",
      description: "Include enhanced support for vulnerable customers.",
    },
  ],
  PROD: [
    multiQuestion("prodRole", "Role in distribution chain", PROD_ROLE_OPTIONS, "Select your PROD role."),
    multiQuestion(
      "prodTargetMarket",
      "Target market segments",
      TARGET_MARKET_OPTIONS,
      "Select the intended target market.",
    ),
    CHANNELS_QUESTION,
  ],
  PRODUCT_GOV: [
    multiQuestion("prodGovRole", "Role in distribution chain", PROD_ROLE_OPTIONS, "Select your PROD role."),
    multiQuestion(
      "prodGovTargetMarket",
      "Target market segments",
      TARGET_MARKET_OPTIONS,
      "Select the intended target market.",
    ),
    CHANNELS_QUESTION,
  ],
  TARGET_MARKET: [
    multiQuestion(
      "targetMarketSegments",
      "Target market segments",
      TARGET_MARKET_OPTIONS,
      "Select the intended target market.",
    ),
    CHANNELS_QUESTION,
    multiQuestion(
      "targetMarketExclusions",
      "Excluded segments",
      TARGET_MARKET_OPTIONS,
      "Select any customers or segments explicitly out of scope.",
    ),
  ],
  RISK_MGMT: [
    multiQuestion(
      "riskCategories",
      "Risk categories covered",
      ["Operational", "Compliance", "Financial", "Conduct", "Cyber", "Strategic"],
      "Select the risk categories included in the framework.",
    ),
    {
      id: "riskAppetiteDocumented",
      label: "Risk appetite statement documented?",
      type: "boolean",
      description: "Include appetite governance and approvals.",
    },
    multiQuestion(
      "riskReportingCadence",
      "Risk reporting cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select how often risk reporting is produced.",
    ),
  ],
  COMPLIANCE_MON: [
    multiQuestion(
      "compMonCadence",
      "Monitoring cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select the monitoring cycle.",
    ),
    multiQuestion(
      "compMonThemes",
      "Monitoring themes",
      MONITORING_THEME_OPTIONS,
      "Select the monitoring themes included.",
    ),
  ],
  OUTSOURCING: [
    multiQuestion(
      "outsourcingTypes",
      "Third-party types",
      OUTSOURCING_TYPE_OPTIONS,
      "Select the third-party services in scope.",
    ),
    {
      id: "outsourcingMaterial",
      label: "Material outsourcing in scope?",
      type: "boolean",
      description: "Include material outsourcing governance.",
    },
    {
      id: "outsourcingExitPlans",
      label: "Exit plans documented?",
      type: "boolean",
      description: "Include exit planning and contingency controls.",
    },
  ],
  INFO_SECURITY: [
    multiQuestion(
      "infoSecDataTypes",
      "Data types handled",
      DATA_TYPE_OPTIONS,
      "Select the data types covered by the policy.",
    ),
    {
      id: "infoSecCloudHosting",
      label: "Cloud hosting in scope?",
      type: "boolean",
      description: "Include cloud security and shared responsibility.",
    },
    multiQuestion(
      "infoSecTestingCadence",
      "Security testing cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select the testing cadence.",
    ),
  ],
  OP_SEC_RISK: [
    {
      id: "opSecSCA",
      label: "Strong customer authentication required?",
      type: "boolean",
      description: "Include SCA and secure communication controls.",
    },
    multiQuestion(
      "opSecFraudControls",
      "Fraud controls in place",
      FRAUD_CONTROL_OPTIONS,
      "Select the fraud controls used.",
    ),
    {
      id: "opSecIncidentReporting",
      label: "Report major incidents to regulator?",
      type: "boolean",
      description: "Include incident reporting expectations.",
    },
  ],
  MARKET_ABUSE: [
    multiQuestion(
      "marketAbuseActivities",
      "Trading activities in scope",
      TRADING_ACTIVITY_OPTIONS,
      "Select the trading activities covered.",
    ),
    {
      id: "marketAbuseSurveillance",
      label: "Surveillance monitoring in place?",
      type: "boolean",
      description: "Include surveillance and alert review controls.",
    },
  ],
  INDUCEMENTS: [
    {
      id: "inducementsThirdPartyFees",
      label: "Receive third-party fees or commissions?",
      type: "boolean",
      description: "Include assessment and disclosure controls.",
    },
    multiQuestion(
      "inducementsNonMonetary",
      "Non-monetary benefits",
      NON_MONETARY_BENEFIT_OPTIONS,
      "Select the benefits received in scope.",
    ),
  ],
  CASS: [
    multiQuestion(
      "cassAssetTypes",
      "Client asset types",
      CASS_ASSET_OPTIONS,
      "Select the client asset types held.",
    ),
    {
      id: "cassDailyRecon",
      label: "Daily reconciliations performed?",
      type: "boolean",
      description: "Include daily reconciliation expectations.",
    },
    {
      id: "cassExternalAudit",
      label: "External CASS audit required?",
      type: "boolean",
      description: "Include external audit arrangements.",
    },
  ],
  CASS_RESOLUTION: [
    multiQuestion(
      "cassResolutionPackLocation",
      "Resolution pack location",
      RESOLUTION_PACK_OPTIONS,
      "Select where the resolution pack is stored.",
    ),
    multiQuestion(
      "cassResolutionTesting",
      "Testing cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select the pack testing cadence.",
    ),
  ],
  ANTI_BRIBERY: [],
  SMCR: [],
  WHISTLEBLOWING: [],
};

const PERMISSION_KEYS: Array<keyof FirmPermissions> = [
  "investmentServices",
  "paymentServices",
  "eMoney",
  "creditBroking",
  "clientMoney",
  "clientAssets",
  "insuranceMediation",
  "mortgageMediation",
  "dealingAsAgent",
  "dealingAsPrincipal",
  "arrangingDeals",
  "advising",
  "managing",
  "safeguarding",
  "retailClients",
  "professionalClients",
  "eligibleCounterparties",
  "complexProducts",
];

function toComplaintsDetailLevel(level: DetailLevel): ComplaintsAssemblerAnswers["detailLevel"] {
  if (level === "essential") return "focused";
  if (level === "comprehensive") return "enterprise";
  return "standard";
}

function buildSectionClauses(template: PolicyTemplate): Record<string, string[]> {
  return template.sections.reduce<Record<string, string[]>>((acc, section) => {
    acc[section.id] = [...section.suggestedClauses];
    return acc;
  }, {});
}

function buildComplaintsAnswers(answers: QuickAnswers, detailLevel: DetailLevel): ComplaintsAssemblerAnswers {
  const complaintsAnswers: ComplaintsAssemblerAnswers = {
    ...DEFAULT_COMPLAINTS_ANSWERS,
    detailLevel: toComplaintsDetailLevel(detailLevel),
  };

  if (answers.eeaPassporting === true) {
    complaintsAnswers.jurisdiction = "uk-eea";
  }

  return complaintsAnswers;
}

function applyAnswersToPermissions(base: FirmPermissions, answers: QuickAnswers): FirmPermissions {
  const next = { ...base };
  PERMISSION_KEYS.forEach((key) => {
    const value = answers[key];
    if (typeof value === "boolean") {
      next[key] = value;
    }
  });
  return next;
}

export function getQuickQuestions(templateCode?: string): QuickQuestion[] {
  if (!templateCode) return DEFAULT_QUESTIONS;
  return QUICK_QUESTIONS[templateCode] ?? DEFAULT_QUESTIONS;
}

export function generateQuickPolicy(input: {
  templateCode: string;
  answers: QuickAnswers;
  basePermissions?: FirmPermissions;
  firmProfile?: Partial<FirmProfile> & Record<string, unknown>;
  sectionNotes?: Record<string, string>;
  clauseVariables?: Record<string, Record<string, string>>;
  governance?: Record<string, unknown>;
  approvals?: WizardApprovals;
  detailLevel?: DetailLevel;
}) {
  const template = getTemplateByCode(input.templateCode);
  if (!template) {
    throw new Error("Template not found");
  }

  const permissions = applyAnswersToPermissions(
    { ...DEFAULT_PERMISSIONS, ...(input.basePermissions ?? {}) },
    input.answers,
  );

  const detailLevel = input.detailLevel ?? DEFAULT_DETAIL_LEVEL;
  const firmProfile = { ...(input.firmProfile ?? {}) };
  const firmName =
    typeof firmProfile.name === "string" && firmProfile.name.trim().length
      ? firmProfile.name.trim()
      : typeof input.answers.firmName === "string"
        ? input.answers.firmName.trim()
        : "";
  if (firmName && !firmProfile.name) {
    firmProfile.name = firmName;
  }

  const sectionClauses =
    template.code === "COMPLAINTS"
      ? assembleComplaintsPolicy(template, buildComplaintsAnswers(input.answers, detailLevel)).sectionClauses
      : buildSectionClauses(template);

  return {
    templateCode: template.code,
    permissions,
    sectionClauses,
    sectionOptions: {},
    sectionNotes: input.sectionNotes ?? {},
    policyInputs: input.answers ?? {},
    clauseVariables: input.clauseVariables ?? {},
    firmProfile,
    governance: input.governance,
    approvals: input.approvals ?? DEFAULT_APPROVALS,
    detailLevel,
  };
}
