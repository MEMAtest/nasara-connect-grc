import { RegisterDefinition, RegisterCategory } from "@/lib/types/register-hub";

// All 22 register definitions
export const REGISTER_DEFINITIONS: Omit<RegisterDefinition, "id" | "createdAt">[] = [
  // ============================================
  // AML & FINANCIAL CRIME REGISTERS
  // ============================================
  {
    code: "pep",
    name: "PEP Register",
    shortDescription: "Track politically exposed persons and high-risk relationships",
    description:
      "Maintain a comprehensive register of Politically Exposed Persons (PEPs), their relatives, and close associates. Track enhanced due diligence requirements, source of wealth/funds documentation, and ongoing monitoring activities in compliance with MLR 2017.",
    category: "aml",
    iconKey: "Users",
    href: "/registers/pep",
    regulatoryReferences: ["MLR 2017 Reg 35", "JMLSG Guidance 5.5", "FCA FC Guide 3.2"],
    useCases: [
      "Log and categorize PEPs, RCAs, and family members",
      "Document source of wealth and source of funds",
      "Schedule and track EDD reviews",
      "Record senior management approval for PEP relationships",
    ],
    relatedTraining: ["AML Fundamentals", "PEP Identification & EDD"],
    relatedPolicies: ["AML Policy", "Customer Due Diligence Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 1,
  },
  {
    code: "sanctions",
    name: "Sanctions Screening Log",
    shortDescription: "Document sanctions screening results and alerts",
    description:
      "Record all sanctions screening activities, matches, false positives, and escalations. Maintain an audit trail of screening against UK, EU, UN, and OFAC sanctions lists to demonstrate compliance with sanctions regulations.",
    category: "aml",
    iconKey: "Shield",
    href: "/registers/sanctions",
    regulatoryReferences: ["UK Sanctions Act 2018", "OFSI Guidance", "FCA FC Guide"],
    useCases: [
      "Log screening results for customers and transactions",
      "Track potential matches and false positive clearances",
      "Document escalations to MLRO",
      "Record real-time screening of payments",
    ],
    relatedTraining: ["Sanctions Compliance", "AML Fundamentals"],
    relatedPolicies: ["Sanctions Policy", "AML Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 2,
  },
  {
    code: "aml-cdd",
    name: "AML CDD Register",
    shortDescription: "Track customer due diligence status and reviews",
    description:
      "Centralized register of customer due diligence activities including identification, verification, risk assessment, and ongoing monitoring. Track CDD refresh cycles and maintain evidence of regulatory compliance.",
    category: "aml",
    iconKey: "FileSearch",
    href: "/registers/aml-cdd",
    regulatoryReferences: ["MLR 2017 Reg 28-30", "JMLSG Guidance Ch 5", "FCA SYSC 6.3"],
    useCases: [
      "Track CDD completion status for all customers",
      "Schedule periodic CDD reviews based on risk",
      "Document verification methods and evidence",
      "Monitor for changes in customer risk profile",
    ],
    relatedTraining: ["CDD & KYC Training", "AML Fundamentals"],
    relatedPolicies: ["Customer Due Diligence Policy", "AML Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 3,
  },
  {
    code: "edd-cases",
    name: "EDD Cases Register",
    shortDescription: "Manage enhanced due diligence cases and approvals",
    description:
      "Track all enhanced due diligence cases triggered by high-risk factors. Document additional measures taken, senior management approvals, and ongoing monitoring requirements for EDD customers.",
    category: "aml",
    iconKey: "FileCheck",
    href: "/registers/edd-cases",
    regulatoryReferences: ["MLR 2017 Reg 33-37", "JMLSG Guidance 5.5-5.7", "FCA FC Guide"],
    useCases: [
      "Log EDD triggers and justifications",
      "Document enhanced measures applied",
      "Track senior management approval",
      "Schedule enhanced monitoring activities",
    ],
    relatedTraining: ["EDD & High-Risk Customers", "AML Fundamentals"],
    relatedPolicies: ["EDD Policy", "AML Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 4,
  },
  {
    code: "sar-nca",
    name: "SAR - NCA Reports",
    shortDescription: "Track suspicious activity reports to the NCA",
    description:
      "Maintain a confidential register of all Suspicious Activity Reports (SARs) submitted to the National Crime Agency. Track consent requests, NCA responses, and ensure compliance with tipping-off provisions.",
    category: "aml",
    iconKey: "AlertTriangle",
    href: "/registers/sar-nca",
    regulatoryReferences: ["POCA 2002 s330-332", "MLR 2017 Reg 21", "NCA SAR Guidance"],
    useCases: [
      "Log internal suspicious activity referrals",
      "Track SAR submissions to NCA",
      "Manage Defence Against Money Laundering (DAML) requests",
      "Monitor consent status and expiry",
    ],
    relatedTraining: ["SAR Reporting", "AML for Staff"],
    relatedPolicies: ["SAR Policy", "AML Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 5,
  },
  {
    code: "tx-monitoring",
    name: "TX Monitoring Alerts",
    shortDescription: "Manage transaction monitoring alerts and investigations",
    description:
      "Track transaction monitoring alerts, investigation outcomes, and escalations. Document rule performance, false positive ratios, and ensure timely resolution of genuine alerts.",
    category: "aml",
    iconKey: "Activity",
    href: "/registers/tx-monitoring",
    regulatoryReferences: ["MLR 2017 Reg 20", "FCA FC Guide 6", "JMLSG Guidance 5.6"],
    useCases: [
      "Log and triage transaction monitoring alerts",
      "Document investigation findings",
      "Track escalations to MLRO",
      "Analyze rule effectiveness and tune thresholds",
    ],
    relatedTraining: ["Transaction Monitoring", "AML Investigations"],
    relatedPolicies: ["Transaction Monitoring Policy", "AML Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 6,
  },

  // ============================================
  // CONDUCT & CUSTOMER REGISTERS
  // ============================================
  {
    code: "complaints",
    name: "Complaints Register",
    shortDescription: "Track FCA-regulated complaints and outcomes",
    description:
      "Comprehensive complaints management system with FCA DISP compliance. Track 8-week deadlines, generate FCA-compliant letters, manage FOS referrals, and analyze root causes to improve customer outcomes.",
    category: "conduct",
    iconKey: "MessageSquareWarning",
    href: "/registers/complaints",
    regulatoryReferences: ["FCA DISP 1.3-1.10", "FCA Consumer Duty", "FOS Guidance"],
    useCases: [
      "Log complaints with categorization and prioritization",
      "Track 8-week FCA deadline with automated alerts",
      "Generate acknowledgement and final response letters",
      "Manage FOS referrals and outcomes",
    ],
    relatedTraining: ["Complaints Handling", "Consumer Duty Training"],
    relatedPolicies: ["Complaints Policy", "Consumer Duty Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 10,
  },
  {
    code: "conflicts",
    name: "Conflicts of Interest",
    shortDescription: "Declare and manage conflicts of interest",
    description:
      "Register for declaring, assessing, and managing conflicts of interest. Track mitigation measures, approvals, and ensure ongoing monitoring of potential conflicts in line with FCA SYSC requirements.",
    category: "conduct",
    iconKey: "Scale",
    href: "/registers/conflicts",
    regulatoryReferences: ["FCA SYSC 10.1", "FCA COBS 6.1", "MiFID II Article 23"],
    useCases: [
      "Log personal and organizational conflicts",
      "Document mitigation measures",
      "Track management approvals",
      "Schedule periodic reviews",
    ],
    relatedTraining: ["Conflicts of Interest", "Ethics & Conduct"],
    relatedPolicies: ["Conflicts of Interest Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 11,
  },
  {
    code: "gifts-hospitality",
    name: "Gifts & Hospitality Log",
    shortDescription: "Track gifts given and received",
    description:
      "Record all gifts and hospitality given to or received from third parties. Implement approval workflows, monitor aggregate values, and ensure compliance with anti-bribery requirements.",
    category: "conduct",
    iconKey: "Gift",
    href: "/registers/gifts-hospitality",
    regulatoryReferences: ["UK Bribery Act 2010", "FCA SYSC 3.2", "FCA Principles 1 & 3"],
    useCases: [
      "Log gifts received and given",
      "Track hospitality events",
      "Implement approval thresholds",
      "Monitor aggregate values per relationship",
    ],
    relatedTraining: ["Anti-Bribery & Corruption", "Ethics Training"],
    relatedPolicies: ["Gifts & Hospitality Policy", "Anti-Bribery Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 12,
  },
  {
    code: "fin-prom",
    name: "FinProm Tracker",
    shortDescription: "Track financial promotions approvals and reviews",
    description:
      "Manage the full lifecycle of financial promotions including drafting, compliance review, approval, publication, and withdrawal. Ensure all promotions are fair, clear, and not misleading.",
    category: "conduct",
    iconKey: "Megaphone",
    href: "/registers/fin-prom",
    regulatoryReferences: ["FCA COBS 4", "FCA Consumer Duty", "FCA PS22/10"],
    useCases: [
      "Log all financial promotions for approval",
      "Track compliance review and sign-off",
      "Monitor promotion expiry dates",
      "Document withdrawal of non-compliant materials",
    ],
    relatedTraining: ["Financial Promotions", "Consumer Duty"],
    relatedPolicies: ["Financial Promotions Policy", "Marketing Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 13,
  },
  {
    code: "vulnerable-customers",
    name: "Vulnerable Customers Log",
    shortDescription: "Track vulnerable customer identification and support",
    description:
      "Register for identifying, supporting, and monitoring vulnerable customers. Document vulnerability indicators, reasonable adjustments made, and outcomes in line with FCA Consumer Duty requirements.",
    category: "conduct",
    iconKey: "Heart",
    href: "/registers/vulnerable-customers",
    regulatoryReferences: ["FCA FG21/1", "FCA Consumer Duty", "Equality Act 2010"],
    useCases: [
      "Log vulnerability indicators identified",
      "Document reasonable adjustments made",
      "Track customer outcomes",
      "Monitor trends and training needs",
    ],
    relatedTraining: ["Vulnerable Customers", "Consumer Duty"],
    relatedPolicies: ["Vulnerable Customers Policy", "Consumer Duty Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 14,
  },
  {
    code: "product-governance",
    name: "Product Governance & Fair Value",
    shortDescription: "Track product reviews and fair value assessments",
    description:
      "Manage product governance reviews, target market assessments, and fair value analyses. Ensure products deliver good outcomes for customers throughout their lifecycle.",
    category: "conduct",
    iconKey: "Package",
    href: "/registers/product-governance",
    regulatoryReferences: ["FCA PROD", "FCA Consumer Duty PS22/9", "MiFID II POG"],
    useCases: [
      "Document target market assessments",
      "Conduct fair value analyses",
      "Track product review cycles",
      "Monitor distribution strategy compliance",
    ],
    relatedTraining: ["Product Governance", "Consumer Duty"],
    relatedPolicies: ["Product Governance Policy", "Pricing Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 15,
  },

  // ============================================
  // GOVERNANCE & TRAINING REGISTERS
  // ============================================
  {
    code: "tc-record",
    name: "T&C Record",
    shortDescription: "Track training and competence for regulated staff",
    description:
      "Comprehensive training and competence register for staff performing regulated activities. Track qualifications, competency assessments, CPD requirements, and supervision arrangements.",
    category: "governance",
    iconKey: "GraduationCap",
    href: "/registers/tc-record",
    regulatoryReferences: ["FCA TC Sourcebook", "FCA SYSC 5.1", "MiFID II"],
    useCases: [
      "Track regulatory qualifications",
      "Log competency assessments",
      "Monitor CPD completion",
      "Document supervision arrangements",
    ],
    relatedTraining: ["T&C Framework", "CPD Requirements"],
    relatedPolicies: ["Training & Competence Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 20,
  },
  {
    code: "smcr-certification",
    name: "SM&CR Certification Tracker",
    shortDescription: "Manage certification regime compliance",
    description:
      "Track certification function holders, annual fitness and propriety assessments, and conduct rule breaches. Ensure compliance with SM&CR certification regime requirements.",
    category: "governance",
    iconKey: "BadgeCheck",
    href: "/registers/smcr-certification",
    regulatoryReferences: ["FCA SYSC 27", "FCA SUP 10C", "SM&CR Rules"],
    useCases: [
      "Maintain certification function holder register",
      "Schedule annual fit and proper assessments",
      "Track conduct rule training completion",
      "Log conduct rule breaches",
    ],
    relatedTraining: ["SM&CR Overview", "Conduct Rules"],
    relatedPolicies: ["SM&CR Policy", "Fitness & Propriety Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 21,
  },
  {
    code: "regulatory-returns",
    name: "Regulatory Returns Calendar",
    shortDescription: "Track regulatory reporting deadlines",
    description:
      "Centralized calendar of regulatory reporting obligations. Track submission deadlines, assign owners, and monitor completion status for all FCA, PRA, and other regulatory returns.",
    category: "governance",
    iconKey: "Calendar",
    href: "/registers/regulatory-returns",
    regulatoryReferences: ["FCA SUP 16", "PRA Reporting Rules", "RegData Guidance"],
    useCases: [
      "Track all regulatory return deadlines",
      "Assign submission owners",
      "Monitor preparation progress",
      "Log submission confirmations",
    ],
    relatedTraining: ["Regulatory Reporting"],
    relatedPolicies: ["Regulatory Reporting Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 22,
  },

  // ============================================
  // MARKET ABUSE REGISTERS
  // ============================================
  {
    code: "pa-dealing",
    name: "PA Dealing Log",
    shortDescription: "Track personal account dealing by staff",
    description:
      "Register for pre-clearance requests and reporting of personal account transactions by relevant staff. Monitor for potential conflicts and market abuse risks.",
    category: "market_abuse",
    iconKey: "TrendingUp",
    href: "/registers/pa-dealing",
    regulatoryReferences: ["FCA COBS 11.7", "MAR Article 19", "MiFID II"],
    useCases: [
      "Process pre-clearance requests",
      "Log personal transactions",
      "Monitor restricted securities",
      "Track holding period compliance",
    ],
    relatedTraining: ["Personal Account Dealing", "Market Abuse"],
    relatedPolicies: ["Personal Account Dealing Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 30,
  },
  {
    code: "insider-list",
    name: "Insider List (MAR)",
    shortDescription: "Maintain MAR-compliant insider lists",
    description:
      "Create and maintain insider lists as required by the Market Abuse Regulation. Track access to inside information, document acknowledgements, and manage list retention.",
    category: "market_abuse",
    iconKey: "Lock",
    href: "/registers/insider-list",
    regulatoryReferences: ["MAR Article 18", "EU Implementing Regulation 2016/347"],
    useCases: [
      "Create project-specific insider lists",
      "Track insider acknowledgements",
      "Log access to inside information",
      "Manage list updates and closures",
    ],
    relatedTraining: ["Market Abuse Regulation", "Insider Dealing"],
    relatedPolicies: ["Market Abuse Policy", "Insider Dealing Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 31,
  },
  {
    code: "outside-business",
    name: "Outside Business Interests",
    shortDescription: "Track staff external activities and directorships",
    description:
      "Register of outside business interests, directorships, and secondary employment held by staff. Assess potential conflicts and monitor ongoing appropriateness.",
    category: "market_abuse",
    iconKey: "Briefcase",
    href: "/registers/outside-business",
    regulatoryReferences: ["FCA SYSC 10.1", "SM&CR Conduct Rules", "FCA COCON"],
    useCases: [
      "Log external directorships",
      "Track secondary employment",
      "Assess conflict potential",
      "Document management approval",
    ],
    relatedTraining: ["Conflicts of Interest", "SM&CR Conduct Rules"],
    relatedPolicies: ["Outside Business Policy", "Conflicts Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 32,
  },

  // ============================================
  // OPERATIONAL RISK REGISTERS
  // ============================================
  {
    code: "incidents",
    name: "Incident Register",
    shortDescription: "Track operational incidents and remediation",
    description:
      "Comprehensive incident management register for operational, security, and compliance incidents. Track root cause analysis, remediation actions, and regulatory notifications.",
    category: "operational",
    iconKey: "AlertOctagon",
    href: "/registers/incidents",
    regulatoryReferences: ["FCA SYSC 3", "FCA Principle 3", "GDPR Article 33"],
    useCases: [
      "Log operational incidents",
      "Document root cause analysis",
      "Track remediation actions",
      "Manage regulatory notifications",
    ],
    relatedTraining: ["Incident Management", "Operational Risk"],
    relatedPolicies: ["Incident Management Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 40,
  },
  {
    code: "third-party",
    name: "Outsourcing & 3rd Parties",
    shortDescription: "Manage outsourcing arrangements and third-party risk",
    description:
      "Register of all outsourcing arrangements and material third-party relationships. Track due diligence, contracts, performance monitoring, and exit strategies.",
    category: "operational",
    iconKey: "Building2",
    href: "/registers/third-party",
    regulatoryReferences: ["FCA SYSC 8", "EBA Outsourcing Guidelines", "PRA SS2/21"],
    useCases: [
      "Log outsourcing arrangements",
      "Track due diligence completion",
      "Monitor service performance",
      "Maintain exit strategies",
    ],
    relatedTraining: ["Third-Party Risk Management", "Outsourcing"],
    relatedPolicies: ["Outsourcing Policy", "Vendor Management Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 41,
  },
  {
    code: "data-breach-dsar",
    name: "Data Breach & DSAR Log",
    shortDescription: "Track data breaches and subject access requests",
    description:
      "Combined register for data protection incidents and data subject rights requests. Track breach notifications, DSAR responses, and ensure GDPR compliance.",
    category: "operational",
    iconKey: "Database",
    href: "/registers/data-breach-dsar",
    regulatoryReferences: ["UK GDPR Article 33-34", "ICO Guidance", "DPA 2018"],
    useCases: [
      "Log personal data breaches",
      "Track ICO notification requirements",
      "Manage DSAR responses within 30 days",
      "Document data subject communications",
    ],
    relatedTraining: ["Data Protection", "GDPR Fundamentals"],
    relatedPolicies: ["Data Protection Policy", "DSAR Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 42,
  },
  {
    code: "op-resilience",
    name: "Op Resilience Register",
    shortDescription: "Track important business services and impact tolerances",
    description:
      "Register of important business services, impact tolerances, and scenario testing results. Ensure compliance with FCA/PRA operational resilience requirements.",
    category: "operational",
    iconKey: "Shield",
    href: "/registers/op-resilience",
    regulatoryReferences: ["FCA PS21/3", "PRA PS6/21", "FCA SYSC 15A"],
    useCases: [
      "Map important business services",
      "Set impact tolerances",
      "Log scenario testing results",
      "Track remediation of vulnerabilities",
    ],
    relatedTraining: ["Operational Resilience", "Business Continuity"],
    relatedPolicies: ["Operational Resilience Policy", "BCP Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 43,
  },
  {
    code: "regulatory-breach",
    name: "Regulatory Breach Log",
    shortDescription: "Track regulatory breaches and remediation",
    description:
      "Register of identified regulatory breaches, near-misses, and compliance failures. Track root cause analysis, remediation actions, and FCA notifications where required.",
    category: "operational",
    iconKey: "AlertCircle",
    href: "/registers/regulatory-breach",
    regulatoryReferences: ["FCA SUP 15.3", "FCA Principle 11", "FCA ENF Guide"],
    useCases: [
      "Log identified breaches",
      "Assess materiality and impact",
      "Track remediation actions",
      "Manage FCA notifications",
    ],
    relatedTraining: ["Regulatory Compliance", "Breach Management"],
    relatedPolicies: ["Breach Management Policy", "Escalation Policy"],
    isActive: true,
    isImplemented: true,
    sortOrder: 44,
  },
];

// Helper to get register by code
export function getRegisterDefinition(code: string): Omit<RegisterDefinition, "id" | "createdAt"> | undefined {
  return REGISTER_DEFINITIONS.find((r) => r.code === code);
}

// Helper to get registers by category
export function getRegistersByCategory(
  category: RegisterCategory
): Omit<RegisterDefinition, "id" | "createdAt">[] {
  return REGISTER_DEFINITIONS.filter((r) => r.category === category).sort((a, b) => a.sortOrder - b.sortOrder);
}

// Helper to get implemented registers only
export function getImplementedRegisters(): Omit<RegisterDefinition, "id" | "createdAt">[] {
  return REGISTER_DEFINITIONS.filter((r) => r.isImplemented);
}
