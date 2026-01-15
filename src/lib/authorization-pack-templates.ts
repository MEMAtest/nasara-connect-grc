export type PackType =
  | "payments-emi"
  | "investment"
  | "consumer-credit"
  | "insurance-distribution"
  | "crypto-registration";

export type PromptInputType = "rich-text" | "short-text" | "number" | "date";

export interface PromptTemplate {
  key: string;
  title: string;
  guidance?: string;
  exampleAnswer?: string;
  inputType: PromptInputType;
  required?: boolean;
  weight?: number;
}

export interface EvidenceTemplate {
  name: string;
  description?: string;
  fileTypes?: string;
  isMandatory?: boolean;
}

export interface SectionTemplate {
  key: string;
  title: string;
  description: string;
  prompts?: PromptTemplate[];
  evidence?: EvidenceTemplate[];
  isAddon?: boolean;
  addonTrigger?: PackType;
}

export interface PackTemplate {
  type: PackType;
  name: string;
  description: string;
  sections: SectionTemplate[];
}

const sectionOutlines: Record<string, string[]> = {
  "executive-summary": ["Submission overview", "Regulatory scope", "Readiness summary"],
  "business-model": [
    "Market opportunity and customer need",
    "Value proposition",
    "Competitive positioning",
    "Distribution strategy and growth model",
    "Agent structure overview",
    "Strategic rationale and future approach",
  ],
  "product-scope": [
    "Regulatory permission framework",
    "Permission rationale",
    "Regulatory boundaries and operational constraints",
    "Compliance architecture and risk management",
  ],
  governance: [
    "Ownership structure and corporate form",
    "Board composition and responsibilities",
    "Time allocation and commitment",
    "Management structure and operational organisation",
    "Decision-making framework and accountability",
    "Skills assessment and board competencies",
    "Decision authority matrix",
  ],
  "operational-resilience": [
    "Platform architecture and service delivery model",
    "Incident reporting policies and procedures",
    "Incident classification and initial assessment",
    "Reporting structure (4-hour initial, 3-day intermediate, 2-week final)",
    "Operational reporting framework",
  ],
  "risk-compliance": ["Risk identification and assessment methodology", "Control design and operating effectiveness"],
  "customer-lifecycle": ["Customer onboarding journey and risk assessment", "Ongoing monitoring and relationship management"],
  "product-architecture": [
    "Service design and operational model",
    "Payment processing and settlement mechanics",
    "FX risk approach",
    "Operational implementation",
    "Risk monitoring framework",
    "Governance and oversight",
    "Customer protection framework",
    "Continuous enhancement",
  ],
  "client-asset-protection": [
    "Client money identification and segregation",
    "Record-keeping and reconciliation procedures",
    "Oversight framework and governance",
    "Client money calculation and reporting",
    "Service level management and performance standards",
  ],
  financials: ["Capital adequacy", "Stress testing and scenario analysis"],
  "wind-down": ["Wind-down execution and cost management"],
  "aml-ctf": [
    "Risk-based approach and threat assessment",
    "Customer due diligence and risk profiling",
    "B2B money remittance typologies and detection",
    "Transaction monitoring and alert management",
    "Suspicious activity reporting and regulatory engagement",
    "Training, culture, and continuous improvement",
    "Conduct risk framework",
  ],
  "regulatory-reporting": ["Reporting cadence, FCA engagement, and supervisory contacts"],
  "data-quality": ["Data lineage, validation controls, and exception handling"],
  "consumer-duty": [
    "Consumer Duty philosophy and B2B application",
    "Four outcomes compliance framework",
    "Products and services outcome",
    "Price and value outcome",
    "Consumer understanding outcome",
    "Consumer support outcome",
    "Outcome monitoring",
    "Complaints handling and rules",
  ],
  "compliance-monitoring": ["Risk-based monitoring approach", "Annual monitoring schedule", "Findings management and remediation"],
  "threshold-conditions": [
    "Continuous assessment framework",
    "Location and physical presence requirements",
    "Supervision effectiveness and regulatory engagement",
    "Resource adequacy and operational sustainability",
    "Suitability and fitness",
    "Business model viability",
  ],
  "app-fraud": ["Real-time detection and intervention mechanisms", "Reimbursement framework and liability allocation"],
  "operational-resilience-framework": ["Important business services identification", "Impact tolerance setting and validation"],
  "mi-board-reporting": ["Risk indicator integration and predictive analytics", "Management information governance"],
  "change-management": ["Regulatory change intake, assessment, and tracking"],
  "third-party-risk": ["Dependency mapping and criticality assessment", "Vendor performance management and assurance"],
  "cyber-security": [
    "Threat landscape and defence architecture",
    "Incident response execution and recovery protocols",
    "Regulatory notification and stakeholder management",
    "Security testing programme",
  ],
  "sensitive-data": [
    "Data flow architecture and classification",
    "Access control and authorisation framework",
    "Monitoring and security controls",
    "Technical security measures",
    "Compliance and oversight",
  ],
  "security-policy": [
    "Risk assessment of payment services",
    "Security control framework",
    "Encryption standards and implementation",
    "Backup and recovery procedures",
    "Transaction analysis and suspicious activity detection",
  ],
  "vulnerability-management": [
    "Understanding business vulnerability",
    "Proactive identification mechanisms",
    "Outcome monitoring and continuous improvement",
    "Governance and quality assurance",
  ],
  "flow-of-funds": ["Transaction timeline and service standards"],
  "schedule-2": ["Schedule 2 mapping and confirmation of completeness"],
  "supporting-documents": ["Annex index and supporting references"],
  "appendix-technical-diagram": ["Technical architecture diagrams and data flow maps"],
};

const buildNarrativeGuidance = (outline?: string[]) => {
  const base = "Paste or draft the section narrative from the gold standard plan.";
  if (!outline?.length) return base;
  return `${base} Include: ${outline.join("; ")}.`;
};

const toPromptKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const buildOutlinePrompts = (outline?: string[]): PromptTemplate[] => {
  if (!outline?.length) return [];
  return outline.map((item, index) => {
    const slug = toPromptKey(item);
    const suffix = slug ? `-${slug}` : "";
    return {
      key: `outline-${index + 1}${suffix}`,
      title: item,
      guidance: "Summarize coverage or paste the relevant excerpt from the gold standard plan.",
      inputType: "rich-text",
      required: true,
      weight: 1,
    };
  });
};

const basePrompts = (title: string, outline?: string[]): PromptTemplate[] => {
  const outlinePrompts = buildOutlinePrompts(outline);
  return [
    {
      key: "narrative",
      title: `${title} narrative`,
      guidance: buildNarrativeGuidance(outline),
      inputType: "rich-text",
      required: true,
      weight: 3,
    },
    ...outlinePrompts,
    {
      key: "controls",
      title: "Key controls and decisions",
      guidance: "Summarize controls, owners, and decision points for this section.",
      inputType: "rich-text",
      required: true,
      weight: 2,
    },
    {
      key: "evidence-map",
      title: "Evidence mapping",
      guidance: "Link supporting evidence and annex references for this section.",
      inputType: "rich-text",
      required: false,
      weight: 1,
    },
  ];
};

const makeSection = (
  key: string,
  title: string,
  description: string,
  evidence: EvidenceTemplate[] = [],
  prompts?: PromptTemplate[]
): SectionTemplate => ({
  key,
  title,
  description,
  prompts: prompts ?? basePrompts(title, sectionOutlines[key]),
  evidence,
});

const coreSpine: SectionTemplate[] = [
  makeSection(
    "business-model",
    "Business Model and Market Analysis",
    "Target market, customer need, value proposition, and growth model.",
    [
      { name: "Market opportunity and customer need", description: "Target market, segment sizing, and customer pain points." },
      { name: "Value proposition and positioning", description: "Differentiation, pricing approach, and competitive positioning." },
      { name: "Distribution and growth strategy", description: "Distribution model, agent structure, and growth plan." },
    ]
  ),
  makeSection(
    "product-scope",
    "Regulatory Permissions and Operational Scope",
    "Permission framework, regulatory boundaries, and operational constraints.",
    [
      { name: "Permission framework and rationale", description: "Permissions mapped to activities and justification." },
      { name: "Regulatory boundaries and constraints", description: "In-scope vs out-of-scope activities." },
      { name: "Compliance architecture and risk management", description: "Control ownership and compliance structure." },
    ]
  ),
  makeSection(
    "governance",
    "Corporate Structure and Governance Framework",
    "Ownership, board composition, accountability framework, and decision authority.",
    [
      { name: "Ownership structure and corporate form", description: "Group structure, shareholding, and legal entities." },
      { name: "Board composition and responsibilities", description: "Board roles, committees, and oversight duties." },
      { name: "Management structure and time commitments", description: "Key management roles and allocation of time." },
      { name: "Decision authority matrix", description: "Decision rights and escalation structure." },
    ]
  ),
  makeSection(
    "risk-compliance",
    "Operational Risk Framework and Control Environment",
    "Risk identification methodology, control design, and operating effectiveness.",
    [
      { name: "Risk identification methodology", description: "Risk taxonomy, assessment approach, and ownership." },
      { name: "Control design and effectiveness", description: "Key controls mapped to risks and testing evidence." },
      { name: "Risk appetite and indicators", description: "Risk appetite statement and key indicators." },
    ]
  ),
  makeSection(
    "operational-resilience",
    "Technology Infrastructure and Operational Resilience",
    "Platform architecture, incident reporting, and operational reporting controls.",
    [
      { name: "Platform architecture and service delivery", description: "Architecture diagrams and service model." },
      { name: "Incident reporting procedures", description: "Incident classification, escalation, and reporting." },
      { name: "Operational reporting framework", description: "Operational reporting cadence and governance." },
    ]
  ),
  makeSection(
    "financials",
    "Financial Projections and Business Economics",
    "Financial model, capital adequacy, and stress testing.",
    [
      { name: "Financial projections and assumptions", description: "Three-year projections with key assumptions." },
      { name: "Capital adequacy analysis", description: "Capital buffer and liquidity coverage." },
      { name: "Stress testing and scenarios", description: "Downside cases and sensitivity analysis." },
    ]
  ),
  makeSection(
    "wind-down",
    "Wind-Down Planning and Resolution Strategy",
    "Exit plan, execution triggers, and cost management.",
    [
      { name: "Wind-down execution plan", description: "Orderly wind-down strategy and triggers." },
      { name: "Cost and timing model", description: "Funding and timeline for wind-down." },
      { name: "Customer protection plan", description: "Customer communications and service continuity." },
    ]
  ),
];

const paymentsAddons: SectionTemplate[] = [
  makeSection(
    "executive-summary",
    "Executive Summary",
    "High-level summary of the submission narrative, scope, and readiness.",
    [
      { name: "Executive summary draft", description: "Board-approved summary and positioning statement." },
    ]
  ),
  makeSection(
    "regulatory-reporting",
    "Regulatory Reporting and Supervisory Engagement",
    "Regulatory reporting cadence, FCA engagement approach, and reporting governance.",
    [
      { name: "Regulatory reporting calendar", description: "Reporting obligations, cadence, and ownership." },
      { name: "Supervisory engagement plan", description: "Engagement approach, contacts, and escalation routes." },
    ]
  ),
  makeSection(
    "data-quality",
    "Data Quality and Validation Framework",
    "Data lineage, validation controls, and quality assurance for regulatory reporting.",
    [
      { name: "Data quality framework", description: "Quality controls, ownership, and monitoring." },
      { name: "Validation rules and exceptions", description: "Validation logic, exceptions, and remediation." },
    ]
  ),
  makeSection(
    "customer-lifecycle",
    "Customer Lifecycle Management",
    "Onboarding journey, risk assessment, and ongoing monitoring.",
    [
      { name: "Customer journey map", description: "Onboarding flow and customer touchpoints." },
      { name: "CDD/EDD procedures", description: "Customer due diligence and risk profiling." },
      { name: "Ongoing monitoring plan", description: "Ongoing monitoring and relationship management." },
    ]
  ),
  makeSection(
    "product-architecture",
    "Product Architecture and Fund Flow Management",
    "Service design, payment processing, settlement mechanics, and fund flow governance.",
    [
      { name: "Service design and operating model", description: "Service design and operational responsibilities." },
      { name: "Payment processing and settlement mechanics", description: "Processing flow and settlement design." },
      { name: "Fund flow governance", description: "Controls for fund movement and oversight." },
    ]
  ),
  makeSection(
    "client-asset-protection",
    "Client Asset Protection - Principle 10 Compliance",
    "Client money segregation, reconciliation, governance, and reporting.",
    [
      { name: "Client money identification and segregation", description: "Segregation policy and account structure." },
      { name: "Reconciliation procedures", description: "Record-keeping and reconciliation evidence." },
      { name: "Safeguarding oversight framework", description: "Governance and reporting for client money." },
    ]
  ),
  makeSection(
    "aml-ctf",
    "Anti-Money Laundering and Counter-Terrorist Financing Framework",
    "Risk-based approach, monitoring, SARs, training, and conduct risk.",
    [
      { name: "AML/CTF policy", description: "Risk assessment, monitoring, and SAR workflow." },
      { name: "Transaction monitoring and alerts", description: "Rules, thresholds, and alert handling." },
      { name: "SAR workflow and training records", description: "Regulatory engagement and training evidence." },
    ]
  ),
  makeSection(
    "consumer-duty",
    "Consumer Duty Implementation and Customer Outcomes",
    "Customer outcomes, monitoring, and complaints handling.",
    [
      { name: "Consumer duty framework", description: "Outcomes and governance model." },
      { name: "Outcome monitoring", description: "Monitoring indicators and review cadence." },
      { name: "Complaints handling", description: "Complaints process and root-cause analysis." },
    ]
  ),
  makeSection(
    "compliance-monitoring",
    "Compliance Monitoring Programme",
    "Risk-based monitoring schedule and remediation tracking.",
    [
      { name: "Monitoring plan", description: "Annual monitoring schedule and scope." },
      { name: "Findings and remediation tracker", description: "Findings register and remediation status." },
    ]
  ),
  makeSection(
    "threshold-conditions",
    "Threshold Conditions and Ongoing Compliance",
    "Continuous assessment of resources, location, governance, and sustainability.",
    [
      { name: "Threshold conditions mapping", description: "Evidence mapped to FCA thresholds." },
      { name: "Resource adequacy assessment", description: "Resources, capital, and operational sustainability." },
      { name: "Business model viability assessment", description: "Viability analysis and assumptions." },
    ]
  ),
  makeSection(
    "app-fraud",
    "APP Fraud Prevention and Reimbursement",
    "Detection, intervention, reimbursement framework, and governance.",
    [
      { name: "Detection and intervention controls", description: "Detection, intervention, and escalation." },
      { name: "Reimbursement framework", description: "Liability allocation and reimbursement process." },
    ]
  ),
  makeSection(
    "operational-resilience-framework",
    "Operational Resilience Framework",
    "Important business services, impact tolerances, and resilience testing.",
    [
      { name: "Important business services register", description: "IBS identification and impact tolerances." },
      { name: "Resilience testing plan", description: "Scenario tests and remediation actions." },
    ]
  ),
  makeSection(
    "mi-board-reporting",
    "Management Information and Board Reporting Framework",
    "MI governance, risk indicators, and board reporting cadence.",
    [
      { name: "MI reporting pack", description: "Board reporting dashboard and cadence." },
      { name: "Board reporting cadence", description: "Schedule and governance for MI review." },
    ]
  ),
  makeSection(
    "change-management",
    "Change Management and Regulatory Horizon Scanning",
    "Regulatory change workflow, governance, and tracking.",
    [
      { name: "Regulatory change log", description: "Change intake, assessment, and tracking." },
      { name: "Horizon scanning workflow", description: "Regulatory monitoring and ownership." },
    ]
  ),
  makeSection(
    "third-party-risk",
    "Third-Party Risk Management and Vendor Governance",
    "Vendor governance, criticality assessments, and oversight.",
    [
      { name: "Vendor register", description: "Critical vendors and risk assessments." },
      { name: "Criticality assessment", description: "Dependency mapping and tiering evidence." },
      { name: "Ongoing assurance plan", description: "Performance monitoring and oversight." },
    ]
  ),
  makeSection(
    "cyber-security",
    "Cyber Security Incident Response and Digital Resilience",
    "Threat landscape, incident response, and recovery protocol.",
    [
      { name: "Cyber incident response plan", description: "Playbooks and escalation routes." },
      { name: "Security testing programme", description: "Testing cadence and remediation actions." },
      { name: "Regulatory notification workflow", description: "Notification triggers and stakeholder updates." },
    ]
  ),
  makeSection(
    "sensitive-data",
    "Sensitive Payment Data Management",
    "Data classification, access controls, and monitoring.",
    [
      { name: "Data flow architecture and classification", description: "Data flows, classification, and ownership." },
      { name: "Access control framework", description: "Authorisation, access reviews, and monitoring." },
      { name: "Monitoring and security controls", description: "Monitoring coverage and alerts." },
    ]
  ),
  makeSection(
    "security-policy",
    "Security Policy and Risk Assessment Framework",
    "Security controls, encryption standards, and backups.",
    [
      { name: "Security policy and control framework", description: "Security standards and governance." },
      { name: "Encryption standards and implementation", description: "Encryption approach and key management." },
      { name: "Backup and recovery procedures", description: "Backup cadence and recovery testing." },
    ]
  ),
  makeSection(
    "vulnerability-management",
    "Vulnerability Management Programme",
    "Identification, remediation, and assurance cadence.",
    [
      { name: "Vulnerability management plan", description: "Scanning, remediation, and reporting." },
      { name: "Remediation tracking", description: "Remediation log and closure evidence." },
    ]
  ),
  makeSection(
    "flow-of-funds",
    "Flow of Funds",
    "Transaction timeline, service standards, and reconciliation.",
    [
      { name: "Transaction timeline", description: "Transaction lifecycle and settlement." },
      { name: "Service standards and reconciliation", description: "Service levels and reconciliation evidence." },
    ]
  ),
  makeSection(
    "schedule-2",
    "Schedule 2 Compliance Mapping",
    "FCA Schedule 2 mapping and completeness confirmation.",
    [
      { name: "Schedule 2 mapping workbook", description: "Mapping of requirements to evidence." },
      { name: "Completeness confirmation", description: "Confirmation of completeness and sign-off." },
    ]
  ),
  makeSection(
    "supporting-documents",
    "Supporting Documents",
    "Reference materials, annex list, and supporting evidence.",
    [
      { name: "Annex register", description: "Annex index and cross references." },
      { name: "Supporting document index", description: "Supporting documents and ownership." },
    ]
  ),
  makeSection(
    "appendix-technical-diagram",
    "Appendix - Technical Diagram",
    "Technical architecture diagrams and integration maps.",
    [
      { name: "Technical architecture diagram", description: "System architecture and data flow." },
      { name: "Integration and data flow maps", description: "Integration touchpoints and dependencies." },
    ]
  ),
];

const paymentsTemplate: PackTemplate = {
  type: "payments-emi",
  name: "Payments and EMI Authorization Pack",
  description: "Vanta-style workspace aligned to FCA expectations for payment services and e-money institutions.",
  sections: (() => {
    const sectionMap = new Map<string, SectionTemplate>(
      [...paymentsAddons, ...coreSpine].map((section) => [section.key, section])
    );
    const order = [
      "executive-summary",
      "business-model",
      "product-scope",
      "governance",
      "operational-resilience",
      "risk-compliance",
      "customer-lifecycle",
      "product-architecture",
      "client-asset-protection",
      "financials",
      "wind-down",
      "aml-ctf",
      "regulatory-reporting",
      "data-quality",
      "consumer-duty",
      "compliance-monitoring",
      "threshold-conditions",
      "app-fraud",
      "operational-resilience-framework",
      "mi-board-reporting",
      "change-management",
      "third-party-risk",
      "cyber-security",
      "sensitive-data",
      "security-policy",
      "vulnerability-management",
      "flow-of-funds",
      "schedule-2",
      "supporting-documents",
      "appendix-technical-diagram",
    ];
    return order.map((key) => sectionMap.get(key)).filter((section): section is SectionTemplate => Boolean(section));
  })(),
};

const investmentTemplate: PackTemplate = {
  type: "investment",
  name: "Investment Firm Authorization Pack",
  description: "Core spine plus investment-specific modules (suitability, conflicts, best execution).",
  sections: [
    ...coreSpine,
    makeSection(
      "suitability",
      "Suitability and Appropriateness",
      "Suitability framework, target market, and ongoing monitoring.",
      [
        { name: "Suitability policy", description: "Target market and suitability tests." },
        { name: "Client suitability records", description: "Sample client file evidence." },
      ],
      basePrompts("Suitability and Appropriateness")
    ),
    makeSection(
      "conflicts",
      "Conflicts of Interest",
      "Conflicts register and mitigation strategy.",
      [
        { name: "Conflicts register", description: "Identified conflicts and controls." },
      ],
      basePrompts("Conflicts of Interest")
    ),
    makeSection(
      "best-execution",
      "Best Execution",
      "Execution policy and monitoring evidence.",
      [
        { name: "Best execution policy", description: "Monitoring and oversight evidence." },
      ],
      basePrompts("Best Execution")
    ),
  ],
};

const consumerCreditTemplate: PackTemplate = {
  type: "consumer-credit",
  name: "Consumer Credit Authorization Pack",
  description: "Core spine plus affordability, forbearance, and vulnerable customer modules.",
  sections: [
    ...coreSpine,
    makeSection(
      "affordability",
      "Affordability and Creditworthiness",
      "Affordability assessment methodology and governance.",
      [
        { name: "Affordability policy", description: "Assessment criteria and monitoring." },
      ],
      basePrompts("Affordability and Creditworthiness")
    ),
    makeSection(
      "forbearance",
      "Forbearance and Arrears",
      "Forbearance policy, escalation, and controls.",
      [
        { name: "Forbearance procedures", description: "Arrears handling evidence." },
      ],
      basePrompts("Forbearance and Arrears")
    ),
    makeSection(
      "vulnerability",
      "Vulnerable Customer Framework",
      "Identification, support, and outcomes monitoring.",
      [
        { name: "Vulnerable customer policy", description: "Support framework and outcomes." },
      ],
      basePrompts("Vulnerable Customer Framework")
    ),
  ],
};

const insuranceTemplate: PackTemplate = {
  type: "insurance-distribution",
  name: "Insurance Distribution Authorization Pack",
  description: "Core spine plus PROD, distribution oversight, and appointed representative controls.",
  sections: [
    ...coreSpine,
    makeSection(
      "prod",
      "PROD and Product Governance",
      "Product oversight and approval process.",
      [
        { name: "PROD policy", description: "Product governance and target market evidence." },
      ],
      basePrompts("PROD and Product Governance")
    ),
    makeSection(
      "distribution-oversight",
      "Distribution Oversight",
      "Distributor controls and oversight metrics.",
      [
        { name: "Distribution oversight plan", description: "Monitoring and reporting evidence." },
      ],
      basePrompts("Distribution Oversight")
    ),
    makeSection(
      "ar-controls",
      "Appointed Representative Controls",
      "AR onboarding, supervision, and reporting.",
      [
        { name: "AR oversight framework", description: "Due diligence and monitoring evidence." },
      ],
      basePrompts("Appointed Representative Controls")
    ),
  ],
};

const cryptoTemplate: PackTemplate = {
  type: "crypto-registration",
  name: "Cryptoasset Registration Pack",
  description: "Core spine with AML/CTF emphasis and cryptoasset specific controls.",
  sections: [
    ...coreSpine,
    makeSection(
      "crypto-aml",
      "AML/CTF Controls for Cryptoassets",
      "Risk-based AML controls for cryptoasset activities.",
      [
        { name: "Crypto AML policy", description: "Source of funds and blockchain analytics." },
      ],
      basePrompts("AML/CTF Controls for Cryptoassets")
    ),
    makeSection(
      "wallet-controls",
      "Wallet and Transaction Controls",
      "Wallet governance, transaction monitoring, and screening.",
      [
        { name: "Wallet governance controls", description: "Key management and monitoring." },
      ],
      basePrompts("Wallet and Transaction Controls")
    ),
  ],
};

export const PACK_TEMPLATES: PackTemplate[] = [
  paymentsTemplate,
  investmentTemplate,
  consumerCreditTemplate,
  insuranceTemplate,
  cryptoTemplate,
];

export const packTypeLabels: Record<PackType, string> = {
  "payments-emi": "Payments / EMI",
  investment: "Investment Firm",
  "consumer-credit": "Consumer Credit",
  "insurance-distribution": "Insurance Distribution",
  "crypto-registration": "Crypto Registration",
};
