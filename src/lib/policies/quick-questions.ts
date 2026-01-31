import type { QuickQuestion } from "./quick-types";

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
  description: "Yes if you receive complaints from EEA customers or passported activities.",
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

const ANTI_BRIBERY_RISK_OPTIONS = [
  "Gifts and hospitality",
  "Sales commissions",
  "Third-party introducers",
  "Public sector engagements",
  "Charitable donations",
  "Sponsorships",
];

const SMCR_POPULATION_OPTIONS = [
  "Senior Managers (SMFs)",
  "Certification staff",
  "Conduct Rules staff",
  "Non-executive directors",
];

const SMCR_EVIDENCE_OPTIONS = [
  "Statements of Responsibilities",
  "Responsibility map",
  "Fit and proper assessments",
  "Regulatory references",
  "Training and competence logs",
];

const WHISTLEBLOWING_CHANNEL_OPTIONS = [
  "Hotline",
  "Online portal",
  "Email",
  "Line manager",
  "Compliance mailbox",
  "External provider",
];

const WHISTLEBLOWING_CONCERN_OPTIONS = [
  "Financial crime",
  "Customer harm",
  "Market abuse",
  "Data or security breaches",
  "Workplace misconduct",
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
  "Select every channel customers use (including partners). This drives channel-specific controls.",
);

const CUSTOMER_SEGMENTS_QUESTION = multiQuestion(
  "policyCustomers",
  "Customer segments in scope",
  CUSTOMER_SEGMENT_OPTIONS,
  "Select all customer types covered by the policy. This influences scope and Consumer Duty content.",
);

const PRODUCT_SCOPE_QUESTION = multiQuestion(
  "policyProducts",
  "Products/services in scope",
  PRODUCT_OPTIONS,
  "Select the products or services this policy should reference for scope and examples.",
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
      "Select the sectors you treat as higher AML/CTF risk. These drive enhanced due diligence content.",
    ),
    {
      id: "amlCrossBorder",
      label: "Cross-border payments in scope?",
      type: "boolean",
      description: "Yes if you send or receive funds across borders or serve non-UK customers.",
    },
    {
      id: "amlCashHandling",
      label: "Handle cash or cash-like instruments?",
      type: "boolean",
      description: "Yes if you accept cash, cash equivalents, or cash-heavy business models.",
    },
  ],
  CONSUMER_DUTY: [
    CUSTOMER_SEGMENTS_QUESTION,
    CHANNELS_QUESTION,
    multiQuestion(
      "consumerDutyRole",
      "Role under Consumer Duty",
      PROD_ROLE_OPTIONS,
      "Select your role in the distribution chain. If you both design and distribute products, select both.",
    ),
    {
      id: "consumerDutyVulnerableFocus",
      label: "Enhanced support for vulnerable customers?",
      type: "boolean",
      description: "Yes if you provide dedicated processes or teams for vulnerable customers.",
    },
  ],
  COMPLAINTS: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "complaintChannels",
      "Complaint intake channels",
      COMPLAINT_CHANNEL_OPTIONS,
      "Select all channels customers use to submit complaints. This shapes the intake workflow.",
    ),
    EEA_COMPLAINTS_QUESTION,
    {
      id: "complaintsThirdParty",
      label: "Handle complaints for third-party distributors?",
      type: "boolean",
      description: "Yes if you accept or resolve complaints for partners, ARs, or introducers.",
    },
  ],
  VULNERABLE_CUST: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "vulnerableSupportChannels",
      "Support channels offered",
      CHANNEL_OPTIONS,
      "Select channels where vulnerable customers can access support.",
    ),
    multiQuestion(
      "vulnerableAdjustments",
      "Accessibility adjustments offered",
      SUPPORT_ADJUSTMENT_OPTIONS,
      "Select reasonable adjustments you can provide on request.",
    ),
    {
      id: "vulnerableSpecialistTeam",
      label: "Dedicated vulnerable customer team?",
      type: "boolean",
      description: "Yes if a dedicated vulnerable customer team or champion exists.",
    },
  ],
  SAFEGUARDING: [
    PRODUCT_SCOPE_QUESTION,
    multiQuestion(
      "safeguardingMethod",
      "Safeguarding method",
      SAFEGUARDING_METHOD_OPTIONS,
      "Select the primary safeguarding approach used for relevant funds.",
    ),
    {
      id: "safeguardingDailyRecon",
      label: "Daily reconciliations performed?",
      type: "boolean",
      description: "Yes if you perform daily reconciliations of safeguarded funds.",
    },
  ],
  SUITABILITY_ADVICE: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "suitabilityAdviceScope",
      "Advice scope",
      ADVICE_SCOPE_OPTIONS,
      "Select the advice types you provide so suitability obligations align.",
    ),
    {
      id: "suitabilityOngoing",
      label: "Ongoing advice service offered?",
      type: "boolean",
      description: "Yes if you provide periodic reviews or ongoing suitability assessments.",
    },
    {
      id: "suitabilityExecutionOnly",
      label: "Execution-only services in scope?",
      type: "boolean",
      description: "Yes if you allow execution-only or non-advised flows.",
    },
  ],
  FIN_PROMOTIONS: [
    multiQuestion(
      "finPromChannels",
      "Promotion channels",
      PROMO_CHANNEL_OPTIONS,
      "Select where promotions are issued (owned and partner channels).",
    ),
    {
      id: "finPromThirdParty",
      label: "Approve promotions for unauthorised persons?",
      type: "boolean",
      description: "Yes if you approve or sign off promotions for unauthorised firms or ARs.",
    },
    {
      id: "finPromHighRisk",
      label: "High-risk promotions in scope?",
      type: "boolean",
      description: "Yes if promotions include high-risk investments, complex products, or high-risk incentives.",
    },
  ],
  BCP_RESILIENCE: [
    multiQuestion(
      "bcpImportantServices",
      "Important business services",
      IBS_OPTIONS,
      "Select services that would cause intolerable harm if disrupted.",
    ),
    {
      id: "bcpOutsourcingDependency",
      label: "Material outsourcing dependencies?",
      type: "boolean",
      description: "Yes if any important service relies on third parties.",
    },
    {
      id: "bcpAnnualTesting",
      label: "Annual resilience testing performed?",
      type: "boolean",
      description: "Yes if you run annual resilience or impact tolerance testing.",
    },
  ],
  CONFLICTS: [
    multiQuestion(
      "conflictSources",
      "Typical conflict sources",
      CONFLICT_SOURCE_OPTIONS,
      "Select common conflict sources in your business (e.g. commissions, gifts, outside business).",
    ),
    {
      id: "conflictsRegister",
      label: "Maintain a conflicts register?",
      type: "boolean",
      description: "Yes if you maintain a formal conflicts register and review process.",
    },
  ],
  BEST_EXECUTION: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "bestExVenues",
      "Execution venue types",
      EXECUTION_VENUE_OPTIONS,
      "Select where orders are executed to tailor best execution controls.",
    ),
    {
      id: "bestExRetailFlow",
      label: "Retail order flow in scope?",
      type: "boolean",
      description: "Yes if you execute orders for retail clients.",
    },
  ],
  RESPONSIBLE_LENDING: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "lendingProducts",
      "Credit products in scope",
      CREDIT_PRODUCT_OPTIONS,
      "Select the credit products you underwrite or broker.",
    ),
    {
      id: "lendingIncomeVerification",
      label: "Income verification required?",
      type: "boolean",
      description: "Yes if you verify income or affordability before lending.",
    },
    {
      id: "lendingAutomatedDecisioning",
      label: "Automated decisioning used?",
      type: "boolean",
      description: "Yes if credit decisions are automated or rely on algorithms.",
    },
  ],
  ARREARS_MANAGEMENT: [
    CUSTOMER_SEGMENTS_QUESTION,
    multiQuestion(
      "arrearsForbearance",
      "Forbearance tools offered",
      FORBEARANCE_OPTIONS,
      "Select the tools you offer to customers in arrears.",
    ),
    {
      id: "arrearsThirdPartyCollections",
      label: "Use third-party collections?",
      type: "boolean",
      description: "Yes if debt collection is outsourced to a third party.",
    },
    {
      id: "arrearsVulnerableTriggers",
      label: "Vulnerable customer triggers in arrears?",
      type: "boolean",
      description: "Yes if vulnerability indicators trigger adjusted treatment.",
    },
  ],
  PROD: [
    multiQuestion(
      "prodRole",
      "Role in distribution chain",
      PROD_ROLE_OPTIONS,
      "Select your role for PROD responsibilities (manufacturer/distributor).",
    ),
    multiQuestion(
      "prodTargetMarket",
      "Target market segments",
      TARGET_MARKET_OPTIONS,
      "Select the intended target market for the product.",
    ),
    CHANNELS_QUESTION,
  ],
  PRODUCT_GOV: [
    multiQuestion(
      "prodGovRole",
      "Role in distribution chain",
      PROD_ROLE_OPTIONS,
      "Select your role for product governance responsibilities.",
    ),
    multiQuestion(
      "prodGovTargetMarket",
      "Target market segments",
      TARGET_MARKET_OPTIONS,
      "Select the intended target market for the product.",
    ),
    CHANNELS_QUESTION,
  ],
  TARGET_MARKET: [
    multiQuestion(
      "targetMarketSegments",
      "Target market segments",
      TARGET_MARKET_OPTIONS,
      "Select who the product is designed for.",
    ),
    CHANNELS_QUESTION,
    multiQuestion(
      "targetMarketExclusions",
      "Excluded segments",
      TARGET_MARKET_OPTIONS,
      "Select segments explicitly out of scope or unsuitable.",
    ),
  ],
  RISK_MGMT: [
    multiQuestion(
      "riskCategories",
      "Risk categories covered",
      ["Operational", "Compliance", "Financial", "Conduct", "Cyber", "Strategic"],
      "Select the risk categories covered by your framework.",
    ),
    {
      id: "riskAppetiteDocumented",
      label: "Risk appetite statement documented?",
      type: "boolean",
      description: "Yes if you maintain a documented risk appetite and limits.",
    },
    multiQuestion(
      "riskReportingCadence",
      "Risk reporting cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select how often formal risk reporting is produced.",
    ),
  ],
  COMPLIANCE_MON: [
    multiQuestion(
      "compMonCadence",
      "Monitoring cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select how often compliance monitoring is performed.",
    ),
    multiQuestion(
      "compMonThemes",
      "Monitoring themes",
      MONITORING_THEME_OPTIONS,
      "Select the themes covered in your monitoring plan.",
    ),
  ],
  OUTSOURCING: [
    multiQuestion(
      "outsourcingTypes",
      "Third-party types",
      OUTSOURCING_TYPE_OPTIONS,
      "Select the third-party services in scope (technology, operations, compliance).",
    ),
    {
      id: "outsourcingMaterial",
      label: "Material outsourcing in scope?",
      type: "boolean",
      description: "Yes if any outsourced service is material or critical to delivery.",
    },
    {
      id: "outsourcingExitPlans",
      label: "Exit plans documented?",
      type: "boolean",
      description: "Yes if you document exit plans, step-in rights, or contingency options.",
    },
  ],
  INFO_SECURITY: [
    multiQuestion(
      "infoSecDataTypes",
      "Data types handled",
      DATA_TYPE_OPTIONS,
      "Select the data types you store or process (customer PII, payment data, credentials).",
    ),
    {
      id: "infoSecCloudHosting",
      label: "Cloud hosting in scope?",
      type: "boolean",
      description: "Yes if you use cloud infrastructure or SaaS providers for core systems or data.",
    },
    multiQuestion(
      "infoSecTestingCadence",
      "Security testing cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select how often you run security testing (pen tests, vulnerability scans).",
    ),
  ],
  OP_SEC_RISK: [
    {
      id: "opSecSCA",
      label: "Strong customer authentication required?",
      type: "boolean",
      description: "Yes if SCA applies to your customer authentication flows.",
    },
    multiQuestion(
      "opSecFraudControls",
      "Fraud controls in place",
      FRAUD_CONTROL_OPTIONS,
      "Select the controls you use to prevent or detect fraud.",
    ),
    {
      id: "opSecIncidentReporting",
      label: "Report major incidents to regulator?",
      type: "boolean",
      description: "Yes if you report major operational or security incidents.",
    },
  ],
  MARKET_ABUSE: [
    multiQuestion(
      "marketAbuseActivities",
      "Trading activities in scope",
      TRADING_ACTIVITY_OPTIONS,
      "Select the trading activities covered by market abuse controls.",
    ),
    {
      id: "marketAbuseSurveillance",
      label: "Surveillance monitoring in place?",
      type: "boolean",
      description: "Yes if you operate surveillance or alert review processes.",
    },
  ],
  INDUCEMENTS: [
    {
      id: "inducementsThirdPartyFees",
      label: "Receive third-party fees or commissions?",
      type: "boolean",
      description: "Yes if you receive or pay third-party fees or commissions.",
    },
    multiQuestion(
      "inducementsNonMonetary",
      "Non-monetary benefits",
      NON_MONETARY_BENEFIT_OPTIONS,
      "Select the non-monetary benefits received in scope.",
    ),
  ],
  CASS: [
    multiQuestion(
      "cassAssetTypes",
      "Client asset types",
      CASS_ASSET_OPTIONS,
      "Select which CASS asset types you hold or control.",
    ),
    {
      id: "cassDailyRecon",
      label: "Daily reconciliations performed?",
      type: "boolean",
      description: "Yes if daily client money or asset reconciliations are performed.",
    },
    {
      id: "cassExternalAudit",
      label: "External CASS audit required?",
      type: "boolean",
      description: "Yes if external CASS audits are required or commissioned.",
    },
  ],
  CASS_RESOLUTION: [
    multiQuestion(
      "cassResolutionPackLocation",
      "Resolution pack location",
      RESOLUTION_PACK_OPTIONS,
      "Select where the CASS resolution pack is stored.",
    ),
    multiQuestion(
      "cassResolutionTesting",
      "Testing cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select how often the resolution pack is tested.",
    ),
  ],
  ANTI_BRIBERY: [
    multiQuestion(
      "abcRiskAreas",
      "Bribery risk exposure areas",
      ANTI_BRIBERY_RISK_OPTIONS,
      "Select where bribery or corruption risk is most likely in your business.",
    ),
    {
      id: "abcPublicOfficials",
      label: "Deal with public officials or public tenders?",
      type: "boolean",
      description: "Yes if you interact with public officials, SOEs, or public tenders.",
    },
    {
      id: "abcThirdParties",
      label: "Use agents, introducers, or distributors?",
      type: "boolean",
      description: "Yes if you use agents, intermediaries, introducers, or third-party sales.",
    },
    {
      id: "abcGiftsRegister",
      label: "Maintain a gifts and hospitality register?",
      type: "boolean",
      description: "Yes if gifts and hospitality are recorded with thresholds and approvals.",
    },
  ],
  SMCR: [
    multiQuestion(
      "smcrPopulations",
      "SMCR populations in scope",
      SMCR_POPULATION_OPTIONS,
      "Select the staff groups covered by SMCR at your firm.",
    ),
    multiQuestion(
      "smcrEvidence",
      "SMCR evidence maintained",
      SMCR_EVIDENCE_OPTIONS,
      "Select the evidence you maintain (SoRs, certificates, training, assessments).",
    ),
    multiQuestion(
      "smcrCertificationCadence",
      "Certification assessment cadence",
      MONITORING_CADENCE_OPTIONS,
      "Select how often fit and proper assessments are completed for certification staff.",
    ),
    {
      id: "smcrNonFinancialMisconduct",
      label: "Non-financial misconduct impacts fitness and propriety?",
      type: "boolean",
      description: "Yes if non-financial misconduct is considered in fitness and propriety decisions.",
    },
  ],
  WHISTLEBLOWING: [
    multiQuestion(
      "whistleChannels",
      "Whistleblowing channels",
      WHISTLEBLOWING_CHANNEL_OPTIONS,
      "Select channels staff can use to raise concerns.",
    ),
    {
      id: "whistleAnonymous",
      label: "Allow anonymous reporting?",
      type: "boolean",
      description: "Yes if anonymous reports are accepted.",
    },
    {
      id: "whistleChampion",
      label: "Whistleblowing champion appointed?",
      type: "boolean",
      description: "Yes if an SMF whistleblowing champion is appointed.",
    },
    multiQuestion(
      "whistleConcernTypes",
      "Common concern types",
      WHISTLEBLOWING_CONCERN_OPTIONS,
      "Select the concern types most relevant (fraud, conduct, AML, etc.).",
    ),
  ],
};

export { DEFAULT_QUESTIONS };
