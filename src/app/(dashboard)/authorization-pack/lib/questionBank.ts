export interface QuestionOption {
  value: string | number;
  label: string;
  score?: number;
  description?: string;
}

export type QuestionType =
  | "single-choice"
  | "multiple-choice"
  | "text"
  | "scale"
  | "single-select"
  | "multi-select"
  | "numeric-table";

export interface QuestionDefinition {
  id: string;
  type: QuestionType;
  required: boolean;
  weight: number;
  title?: string;
  description?: string;
  question?: string;
  helpText?: string;
  options?: QuestionOption[];
  regulatoryContext?: string;
  critical?: boolean;
  hardGate?: boolean;
  hardGateThreshold?: number;
  hardGateMessage?: string;
  evidenceRequired?: string[];
  fcaReference?: string;
  triggers?: Record<string, string[]>;
  capitalImplications?: Record<
    string,
    { method: string; minimum: number; liquidAssets?: boolean }
  >;
  conditionalOn?: { questionId: string; values?: string[]; notValues?: string[] };
  columns?: string[];
  rows?: string[];
}

export interface Question extends QuestionDefinition {
  section: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  applicableTo?: string[];
  questions: QuestionDefinition[];
}

const legacyQuestionBank: Question[] = [
  // BUSINESS MODEL & STRATEGY SECTION
  {
    id: "bm-001",
    section: "business-model",
    title: "What type of financial services will you provide?",
    description: "Select the primary regulated activities you plan to conduct",
    type: "single-choice",
    required: true,
    weight: 3,
    critical: true,
    regulatoryContext: "PERG 2.7 - Regulated Activities",
    fcaReference: "COND 2.5 - Business Model Suitability",
    options: [
      {
        value: "payment-services",
        label: "Payment Services (PSRs 2017)",
        score: 3,
        description: "Money remittance, payment initiation, account information services"
      },
      {
        value: "e-money",
        label: "Electronic Money Issuance (EMRs 2011)",
        score: 3,
        description: "Issuing electronic money and related services"
      },
      {
        value: "investment-services",
        label: "Investment Services (MiFID II)",
        score: 2,
        description: "Investment advice, portfolio management, execution of orders"
      },
      {
        value: "deposit-taking",
        label: "Deposit Taking",
        score: 1,
        description: "Accepting deposits from the general public"
      }
    ]
  },
  {
    id: "bm-002",
    section: "business-model",
    title: "Have you clearly defined your target customer segments?",
    description: "Customer segmentation is crucial for Consumer Duty compliance",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryContext: "PRIN 2A.3 - Consumer Duty",
    options: [
      {
        value: "fully-defined",
        label: "Fully defined with detailed personas",
        score: 3,
        description: "Clear customer segments with needs analysis"
      },
      {
        value: "partially-defined",
        label: "Partially defined",
        score: 2,
        description: "Basic segmentation without detailed analysis"
      },
      {
        value: "high-level",
        label: "High-level understanding only",
        score: 1,
        description: "General target market identified"
      },
      {
        value: "not-defined",
        label: "Not yet defined",
        score: 0,
        description: "Customer segments not identified"
      }
    ]
  },
  {
    id: "bm-003",
    section: "business-model",
    title: "How will you generate revenue?",
    description: "Describe your revenue model and fee structure",
    type: "text",
    required: true,
    weight: 2,
    regulatoryContext: "SUP 15.3 - Business Model Description"
  },
  {
    id: "bm-004",
    section: "business-model",
    title: "Rate your readiness for Consumer Duty implementation",
    description: "Consumer Duty requires firms to act to deliver good outcomes for retail customers",
    type: "scale",
    required: true,
    weight: 3,
    regulatoryContext: "PRIN 2A - Consumer Duty",
    options: [
      { value: "0", label: "Not started", score: 0 },
      { value: "1", label: "Initial planning", score: 1 },
      { value: "2", label: "Policies drafted", score: 2 },
      { value: "3", label: "Fully implemented", score: 3 }
    ]
  },
  {
    id: "bm-005",
    section: "business-model",
    title: "Do you have a detailed business plan covering the next 3 years?",
    description: "The FCA requires a comprehensive business plan showing viability",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryContext: "COND 1.1.1R - Business Plan Requirements",
    options: [
      { value: "comprehensive", label: "Comprehensive 3-year plan with stress testing", score: 3 },
      { value: "basic", label: "Basic plan covering main elements", score: 2 },
      { value: "outline", label: "High-level outline only", score: 1 },
      { value: "none", label: "No formal business plan", score: 0 }
    ]
  },

  // GOVERNANCE & MANAGEMENT SECTION
  {
    id: "gov-001",
    section: "governance",
    title: "Have you identified all required Senior Manager Functions (SMFs)?",
    description: "SMFs are mandatory roles under the Senior Managers and Certification Regime",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 25 - Senior Managers and Certification Regime",
    options: [
      { value: "all-identified", label: "All SMFs identified with appointed individuals", score: 3 },
      { value: "partially-identified", label: "Some SMFs identified", score: 2 },
      { value: "under-review", label: "Currently reviewing SMF requirements", score: 1 },
      { value: "not-started", label: "Not yet started SMF identification", score: 0 }
    ]
  },
  {
    id: "gov-002",
    section: "governance",
    title: "Do your proposed SMF holders meet fit and proper requirements?",
    description: "All SMF holders must be assessed as fit and proper persons",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "FIT 1 - Fit and Proper Test for Employees",
    options: [
      { value: "all-meet", label: "All SMF holders fully meet requirements", score: 3 },
      { value: "mostly-meet", label: "Most meet requirements, minor gaps", score: 2 },
      { value: "some-concerns", label: "Some potential fit and proper concerns", score: 1 },
      { value: "not-assessed", label: "Fit and proper assessments not completed", score: 0 }
    ]
  },
  {
    id: "gov-003",
    section: "governance",
    title: "Describe your governance structure and decision-making processes",
    description: "Detail how the board/management committee will operate and make decisions",
    type: "text",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 3 - Systems and Controls"
  },
  {
    id: "gov-004",
    section: "governance",
    title: "Do you have a clear organizational structure with defined reporting lines?",
    description: "Clear reporting lines are essential for accountability and oversight",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 2.1 - General Organizational Requirements",
    options: [
      { value: "fully-defined", label: "Complete org chart with clear reporting lines", score: 3 },
      { value: "mostly-defined", label: "Main structure defined, some details pending", score: 2 },
      { value: "basic", label: "Basic structure only", score: 1 },
      { value: "undefined", label: "Organizational structure not yet defined", score: 0 }
    ]
  },
  {
    id: "gov-005",
    section: "governance",
    title: "Have you established a board or management committee?",
    description: "Effective governance requires appropriate board oversight",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 4.1 - Management Body",
    options: [
      { value: "established", label: "Board/committee established with regular meetings", score: 3 },
      { value: "planned", label: "Structure planned, not yet operational", score: 2 },
      { value: "considering", label: "Considering governance structure", score: 1 },
      { value: "no-plans", label: "No formal governance plans", score: 0 }
    ]
  },

  // RISK MANAGEMENT SECTION
  {
    id: "risk-001",
    section: "risk-management",
    title: "Do you have a comprehensive risk appetite statement?",
    description: "Risk appetite defines the level of risk the firm is willing to accept",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 7.1.2R - Risk Management Policy",
    options: [
      { value: "comprehensive", label: "Board-approved comprehensive risk appetite statement", score: 3 },
      { value: "draft", label: "Draft risk appetite statement prepared", score: 2 },
      { value: "developing", label: "Currently developing risk appetite", score: 1 },
      { value: "none", label: "No risk appetite statement", score: 0 }
    ]
  },
  {
    id: "risk-002",
    section: "risk-management",
    title: "Have you identified and assessed all material risks to your business?",
    description: "Comprehensive risk identification is fundamental to risk management",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 7.1.3R - Risk Assessment",
    options: [
      { value: "comprehensive", label: "Comprehensive risk register with assessments", score: 3 },
      { value: "main-risks", label: "Main risks identified and assessed", score: 2 },
      { value: "basic", label: "Basic risk identification completed", score: 1 },
      { value: "not-done", label: "Risk identification not yet completed", score: 0 }
    ]
  },
  {
    id: "risk-003",
    section: "risk-management",
    title: "Do you have appropriate risk controls and mitigation measures?",
    description: "Controls must be proportionate to the risks faced by the business",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 7.1.5R - Risk Controls",
    options: [
      { value: "comprehensive", label: "Comprehensive controls framework implemented", score: 3 },
      { value: "key-controls", label: "Key controls identified and planned", score: 2 },
      { value: "basic", label: "Basic controls in place", score: 1 },
      { value: "minimal", label: "Minimal or no risk controls", score: 0 }
    ]
  },
  {
    id: "risk-004",
    section: "risk-management",
    title: "How will you monitor and report on risks?",
    description: "Describe your risk monitoring and reporting procedures",
    type: "text",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 7.1.6R - Risk Monitoring"
  },
  {
    id: "risk-005",
    section: "risk-management",
    title: "Do you have appropriate operational risk management procedures?",
    description: "Operational risk includes risks from inadequate or failed processes, people, and systems",
    type: "scale",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 7.1.7R - Operational Risk",
    options: [
      { value: "0", label: "No procedures", score: 0 },
      { value: "1", label: "Basic procedures", score: 1 },
      { value: "2", label: "Good procedures", score: 2 },
      { value: "3", label: "Comprehensive procedures", score: 3 }
    ]
  },

  // FINANCIAL RESOURCES SECTION
  {
    id: "fin-001",
    section: "financial-resources",
    title: "Do you meet the minimum capital requirements for your proposed activities?",
    description: "Different activities have different minimum capital requirements",
    type: "single-choice",
    required: true,
    weight: 3,
    critical: true,
    hardGate: true,
    hardGateThreshold: 1,
    hardGateMessage: "Adequate capital resources is a threshold condition (COND 2.4). Insufficient capital will result in refusal.",
    regulatoryContext: "GENPRU 2.1 - Capital Resources Requirements",
    fcaReference: "COND 2.4 - Appropriate Resources",
    options: [
      { value: "exceed", label: "Exceed minimum requirements with buffer", score: 3 },
      { value: "meet", label: "Meet minimum requirements", score: 2 },
      { value: "close", label: "Close to meeting requirements", score: 1 },
      { value: "insufficient", label: "Insufficient capital currently", score: 0 }
    ]
  },
  {
    id: "fin-002",
    section: "financial-resources",
    title: "Have you prepared realistic financial projections for the next 3 years?",
    description: "Financial projections must demonstrate ongoing viability",
    type: "single-choice",
    required: true,
    weight: 3,
    critical: true,
    hardGate: true,
    hardGateThreshold: 1,
    hardGateMessage: "Financial projections demonstrating viability are required under COND 2.4. Inadequate projections will result in refusal.",
    regulatoryContext: "COND 1.1.1R - Financial Projections",
    fcaReference: "COND 2.4 - Appropriate Resources",
    options: [
      { value: "comprehensive", label: "Detailed projections with stress testing", score: 3 },
      { value: "good", label: "Good projections covering main scenarios", score: 2 },
      { value: "basic", label: "Basic projections prepared", score: 1 },
      { value: "none", label: "No financial projections", score: 0 }
    ]
  },
  {
    id: "fin-003",
    section: "financial-resources",
    title: "What is your funding strategy?",
    description: "Describe how you will fund your business operations and growth",
    type: "text",
    required: true,
    weight: 2,
    regulatoryContext: "COND 1.1.2R - Funding Strategy"
  },
  {
    id: "fin-004",
    section: "financial-resources",
    title: "Do you have appropriate professional indemnity insurance?",
    description: "PI insurance is required for most regulated activities",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryContext: "COMP 1.4 - Professional Indemnity Insurance",
    options: [
      { value: "appropriate", label: "Appropriate PI insurance in place", score: 3 },
      { value: "arranged", label: "PI insurance arranged, pending start", score: 2 },
      { value: "sourcing", label: "Currently sourcing PI insurance", score: 1 },
      { value: "none", label: "No PI insurance arrangements", score: 0 }
    ]
  },

  // SYSTEMS & CONTROLS SECTION
  {
    id: "sys-001",
    section: "systems-controls",
    title: "Do you have adequate IT systems to support your business activities?",
    description: "IT systems must be robust, secure, and scalable",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 8.1 - General IT Requirements",
    options: [
      { value: "comprehensive", label: "Comprehensive IT systems fully implemented", score: 3 },
      { value: "adequate", label: "Adequate systems for initial operations", score: 2 },
      { value: "basic", label: "Basic systems in place", score: 1 },
      { value: "inadequate", label: "IT systems inadequate or not ready", score: 0 }
    ]
  },
  {
    id: "sys-002",
    section: "systems-controls",
    title: "Have you implemented appropriate data protection and cyber security measures?",
    description: "Data protection and cyber security are critical regulatory requirements",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 8.1.3R - Data Security",
    options: [
      { value: "comprehensive", label: "Comprehensive data protection and cyber security", score: 3 },
      { value: "good", label: "Good data protection measures in place", score: 2 },
      { value: "basic", label: "Basic data protection measures", score: 1 },
      { value: "insufficient", label: "Insufficient data protection measures", score: 0 }
    ]
  },
  {
    id: "sys-003",
    section: "systems-controls",
    title: "Do you have appropriate record keeping systems?",
    description: "Comprehensive record keeping is required for regulatory compliance",
    type: "single-choice",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 9 - Record Keeping",
    options: [
      { value: "comprehensive", label: "Comprehensive electronic record keeping", score: 3 },
      { value: "adequate", label: "Adequate record keeping systems", score: 2 },
      { value: "basic", label: "Basic record keeping in place", score: 1 },
      { value: "none", label: "No formal record keeping systems", score: 0 }
    ]
  },
  {
    id: "sys-004",
    section: "systems-controls",
    title: "Describe your business continuity and disaster recovery plans",
    description: "Detail how you will maintain operations during disruptions",
    type: "text",
    required: true,
    weight: 2,
    regulatoryContext: "SYSC 3.2.11R - Business Continuity"
  },
  {
    id: "sys-005",
    section: "systems-controls",
    title: "Do you have appropriate internal controls and compliance monitoring?",
    description: "Internal controls are essential for preventing regulatory breaches",
    type: "scale",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 6.1 - Compliance Function",
    options: [
      { value: "0", label: "No formal controls", score: 0 },
      { value: "1", label: "Basic controls planned", score: 1 },
      { value: "2", label: "Good controls framework", score: 2 },
      { value: "3", label: "Comprehensive controls and monitoring", score: 3 }
    ]
  },
  {
    id: "sys-006",
    section: "systems-controls",
    title: "Have you established appropriate anti-money laundering (AML) procedures?",
    description: "AML procedures are mandatory for most financial services firms",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "SYSC 6.3 - Money Laundering Reporting",
    options: [
      { value: "comprehensive", label: "Comprehensive AML procedures and training", score: 3 },
      { value: "adequate", label: "Adequate AML procedures in place", score: 2 },
      { value: "basic", label: "Basic AML procedures prepared", score: 1 },
      { value: "none", label: "No AML procedures yet", score: 0 }
    ]
  }
];

export const questionSections: QuestionSection[] = [
  {
    id: "people-capability",
    title: "People & Capability",
    description: "Assessment of key personnel, UK presence, and organizational capability",
    questions: [
      {
        id: "pc-001",
        question:
          "Do you have at least two UK-resident directors who will dedicate 50%+ of their time to the firm?",
        helpText:
          "FCA requires 'mind and management' exercised in the UK. Directors must be genuinely UK-based with decision-making authority, not just on paper.",
        type: "scale",
        options: [
          { value: 0, label: "No UK-resident directors identified" },
          { value: 1, label: "One UK director, or directors with <50% time commitment" },
          { value: 2, label: "Two UK directors identified but time allocation unclear" },
          { value: 3, label: "Two+ UK directors with documented 50%+ time commitment" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "UK presence is a threshold condition. Failure here will result in automatic refusal.",
        evidenceRequired: [
          "Director CVs with UK address confirmation",
          "Employment contracts showing time allocation",
          "Board meeting schedule (must be UK-based)"
        ],
        fcaReference: "COND 2.3 - Location of Offices"
      },
      {
        id: "pc-002",
        question:
          "Have suitability assessments (fit and proper) been completed for all proposed SMF holders?",
        helpText:
          "Each Senior Management Function holder needs documented assessment of honesty/integrity, competence/capability, and financial soundness.",
        type: "scale",
        options: [
          { value: 0, label: "No assessments started" },
          { value: 1, label: "Assessments in progress for some SMFs" },
          { value: 2, label: "Assessments complete but gaps in evidence" },
          { value: 3, label: "Full assessments with evidence for all SMFs" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "Suitability of SMF holders is a threshold condition (COND 2.5). The FCA must be satisfied that persons with significant influence are fit and proper.",
        evidenceRequired: [
          "Fit and proper assessment forms for each SMF",
          "DBS checks (or equivalent)",
          "Regulatory references from previous employers",
          "Credit checks",
          "CV verification documentation"
        ],
        fcaReference: "FIT 1.3 - Criteria for assessing fitness and propriety"
      },
      {
        id: "tc-001",
        question:
          "Can the FCA effectively supervise your firm given its structure and activities?",
        helpText:
          "FCA must be able to supervise effectively. Complex group structures, overseas dependencies, or opaque arrangements may impede supervision.",
        type: "scale",
        options: [
          { value: 0, label: "Complex structure with overseas control, limited UK visibility" },
          { value: 1, label: "Some complexity, working to simplify reporting lines" },
          { value: 2, label: "Straightforward structure, some documentation gaps" },
          { value: 3, label: "Clear UK-based structure with transparent reporting" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "Effective supervision is a threshold condition (COND 2.4). The FCA must be able to supervise your firm.",
        evidenceRequired: [
          "Group structure chart showing all entities",
          "Description of overseas dependencies and mitigation",
          "UK regulatory reporting arrangements",
          "Communication and escalation procedures with FCA"
        ],
        fcaReference: "COND 2.4 - Effective Supervision"
      },
      {
        id: "pc-003",
        question:
          "Is your ownership and controllers chart complete with all persons with >10% control identified?",
        helpText:
          "Include all shareholders, beneficial owners, and anyone with significant influence. Controllers need FCA approval.",
        type: "scale",
        options: [
          { value: 0, label: "Not started" },
          { value: 1, label: "Draft structure, gaps in beneficial ownership" },
          { value: 2, label: "Complete chart, controller applications not submitted" },
          { value: 3, label: "Complete chart with all controller applications ready" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Group structure chart",
          "Controller application forms (if applicable)",
          "Beneficial ownership declarations",
          "Companies House confirmations"
        ],
        fcaReference: "SUP 11 - Controllers and Close Links"
      },
      {
        id: "pc-004",
        question: "Do you have a resourcing plan addressing skills and capacity gaps?",
        helpText:
          "Identify gaps in compliance, finance, operations, technology. Include recruitment timeline or upskilling plans.",
        type: "scale",
        options: [
          { value: 0, label: "No resourcing plan" },
          { value: 1, label: "Gaps identified but no plan to address" },
          { value: 2, label: "Plan exists but timelines unclear" },
          { value: 3, label: "Detailed plan with timelines and budget" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Resourcing plan document",
          "Job descriptions for key hires",
          "Training plan for existing staff"
        ]
      },
      {
        id: "pc-005",
        question:
          "Are staff incentive structures aligned to good customer outcomes (not purely volume-driven)?",
        helpText:
          "Consumer Duty requires that remuneration doesn't incentivize poor customer outcomes. Sales-only targets are problematic.",
        type: "scale",
        options: [
          { value: 0, label: "Incentives purely volume/sales driven" },
          { value: 1, label: "Mix of volume and quality metrics" },
          { value: 2, label: "Quality metrics included, weighting unclear" },
          { value: 3, label: "Balanced incentives with customer outcome metrics" }
        ],
        weight: 1,
        required: false,
        evidenceRequired: [
          "Remuneration policy",
          "Sales incentive structure documentation"
        ],
        fcaReference: "SYSC 19D - Remuneration Code"
      }
    ]
  },
  {
    id: "financial-crime",
    title: "Financial Crime Prevention",
    description: "AML/CTF framework, MLRO appointment, and financial crime controls",
    questions: [
      {
        id: "fc-001",
        question:
          "Has an MLRO been appointed with a firm-wide risk assessment and documented AML procedures?",
        helpText:
          "MLRO must have sufficient seniority, time allocation (typically 20%+ for small firms), and independence. Risk assessment must be tailored to YOUR business model.",
        type: "scale",
        options: [
          { value: 0, label: "No MLRO identified" },
          { value: 1, label: "MLRO identified but no risk assessment" },
          { value: 2, label: "MLRO and draft risk assessment" },
          { value: 3, label: "MLRO appointed with complete risk assessment and procedures" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "MLRO appointment and AML framework is a regulatory requirement under MLR 2017. Failure to have adequate AML arrangements will result in refusal.",
        evidenceRequired: [
          "MLRO appointment letter with time allocation",
          "Firm-wide ML/TF risk assessment",
          "AML/CTF policy and procedures manual",
          "SAR reporting procedures"
        ],
        fcaReference: "SYSC 6.3.9R - Money laundering reporting function"
      },
      {
        id: "fc-002",
        question: "Are CDD/EDD procedures documented with clear escalation criteria?",
        helpText:
          "Must define when standard CDD applies vs enhanced due diligence. PEPs, high-risk jurisdictions, complex structures require EDD.",
        type: "scale",
        options: [
          { value: 0, label: "No CDD procedures" },
          { value: 1, label: "Basic CDD only, no EDD triggers defined" },
          { value: 2, label: "CDD/EDD defined but escalation unclear" },
          { value: 3, label: "Complete CDD/EDD with decision trees and escalation" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "CDD procedures document",
          "EDD trigger criteria",
          "PEP screening process",
          "High-risk jurisdiction list"
        ],
        fcaReference: "MLR 2017 Regulation 28-33"
      },
      {
        id: "fc-003",
        question:
          "Are screening tools and transaction monitoring calibrated to your products and customer base?",
        helpText:
          "Generic thresholds won't work. Must be risk-based: cross-border remittance to high-risk countries needs different rules than domestic payments.",
        type: "scale",
        options: [
          { value: 0, label: "No screening or monitoring tools" },
          { value: 1, label: "Tools in place but generic configuration" },
          { value: 2, label: "Some customization but gaps in coverage" },
          { value: 3, label: "Fully calibrated to business model with documented rationale" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Transaction monitoring rules with thresholds",
          "Rationale document for threshold calibration",
          "Sanctions screening provider details",
          "Sample alert investigation procedures"
        ],
        fcaReference: "FCG 3 - Financial crime systems and controls"
      },
      {
        id: "fc-004",
        question: "Is there a documented staff AML/CTF training program with completion records?",
        helpText:
          "All staff need baseline training. Customer-facing and compliance staff need role-specific training. Annual refreshers required.",
        type: "scale",
        options: [
          { value: 0, label: "No training program" },
          { value: 1, label: "Ad-hoc training, no records" },
          { value: 2, label: "Training program exists, incomplete records" },
          { value: 3, label: "Comprehensive program with completion tracking" }
        ],
        weight: 1,
        required: true,
        evidenceRequired: [
          "AML training materials",
          "Training completion records",
          "Assessment/testing results"
        ],
        fcaReference: "MLR 2017 Regulation 24"
      }
    ]
  },
  {
    id: "operational-resilience",
    title: "Operational Resilience",
    description:
      "Business continuity, important business services, and third-party risk management",
    questions: [
      {
        id: "or-001",
        question:
          "Have you identified your Important Business Services (IBS) with impact tolerances?",
        helpText:
          "IBS = services that if disrupted would cause intolerable harm to customers or market integrity. Must define maximum tolerable disruption period.",
        type: "scale",
        options: [
          { value: 0, label: "IBS not identified" },
          { value: 1, label: "IBS identified but no impact tolerances" },
          { value: 2, label: "Impact tolerances set but not tested" },
          { value: 3, label: "IBS mapped with tested impact tolerances" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "IBS identification document",
          "Impact tolerance statements",
          "Scenario testing results",
          "Mapping of IBS to underlying resources"
        ],
        fcaReference: "PS21/3 - Building operational resilience"
      },
      {
        id: "or-002",
        question:
          "Do critical outsourcing arrangements have due diligence, contracts with exit plans, and oversight KPIs?",
        helpText:
          "Cloud providers, payment processors, KYC vendors = critical. Need right to audit, data portability, termination rights, and regular performance reviews.",
        type: "scale",
        options: [
          { value: 0, label: "No outsourcing register or due diligence" },
          { value: 1, label: "Register exists, contracts incomplete" },
          { value: 2, label: "Contracts in place, no ongoing oversight" },
          { value: 3, label: "Full due diligence, contracts, exit plans, and oversight" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Outsourcing register with criticality ratings",
          "Due diligence reports for critical providers",
          "Contract summaries showing key terms",
          "Exit plan for each critical provider"
        ],
        fcaReference: "SYSC 8 - Outsourcing"
      },
      {
        id: "or-003",
        question:
          "Are IT security controls documented (access management, logging, vulnerability management, incident response)?",
        helpText:
          "Must cover: MFA for all systems, RBAC, security logging/SIEM, regular vulnerability scanning, penetration testing, and incident response playbooks.",
        type: "scale",
        options: [
          { value: 0, label: "No IT security documentation" },
          { value: 1, label: "Basic controls, not documented" },
          { value: 2, label: "Documented but gaps in coverage" },
          { value: 3, label: "Comprehensive IT security framework documented" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "IT Security Policy",
          "Access management procedures",
          "Vulnerability management process",
          "Incident response playbook",
          "Penetration test reports (if available)"
        ],
        fcaReference: "SYSC 13.7 - Information security"
      },
      {
        id: "or-004",
        question: "Is there a tested Business Continuity Plan (BCP) and Disaster Recovery (DR) capability?",
        helpText:
          "BCP must cover key scenarios: office inaccessible, key person unavailable, system failure, cyber incident. DR must have defined RTOs and RPOs.",
        type: "scale",
        options: [
          { value: 0, label: "No BCP or DR" },
          { value: 1, label: "Draft BCP, no testing" },
          { value: 2, label: "BCP exists, tested >12 months ago" },
          { value: 3, label: "Current BCP with annual testing and DR capability" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Business Continuity Plan",
          "Disaster Recovery Plan",
          "BCP test results",
          "RTO/RPO definitions"
        ],
        fcaReference: "SYSC 4.1.6R - Business continuity"
      }
    ]
  },
  {
    id: "consumer-duty",
    title: "Consumer Duty & Conduct",
    description: "Consumer Duty compliance, fair value, and customer outcomes monitoring",
    questions: [
      {
        id: "cd-001",
        question:
          "Have you defined your target market and completed a fair value assessment for each product?",
        helpText:
          "Must identify who the product IS and ISN'T for. Fair value = price is reasonable relative to benefits. Document the assessment.",
        type: "scale",
        options: [
          { value: 0, label: "No target market or fair value work" },
          { value: 1, label: "Target market drafted, no fair value assessment" },
          { value: 2, label: "Both drafted but not board-approved" },
          { value: 3, label: "Complete target market and fair value assessments approved" }
        ],
        weight: 3,
        required: true,
        evidenceRequired: [
          "Target market definition for each product",
          "Fair value assessment document",
          "Board approval minutes"
        ],
        fcaReference: "PRIN 2A - Consumer Duty"
      },
      {
        id: "cd-002",
        question:
          "Do you have a process for financial promotions approval with record-keeping?",
        helpText:
          "All promotions must be clear, fair, not misleading. Need approval workflow, sign-off authority, and retention of all versions.",
        type: "scale",
        options: [
          { value: 0, label: "No promotions approval process" },
          { value: 1, label: "Informal review, no documentation" },
          { value: 2, label: "Process exists, gaps in record-keeping" },
          { value: 3, label: "Full approval workflow with version control and audit trail" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Financial promotions policy",
          "Approval workflow documentation",
          "Sample approved promotions with sign-off"
        ],
        fcaReference: "BCOBS 2.1 - Communications with banking customers"
      },
      {
        id: "cd-003",
        question: "Is there a vulnerable customer policy with staff training and accommodation procedures?",
        helpText:
          "Must identify vulnerability characteristics, train staff to recognize signs, and have procedures to provide appropriate support.",
        type: "scale",
        options: [
          { value: 0, label: "No vulnerable customer policy" },
          { value: 1, label: "Draft policy, no training" },
          { value: 2, label: "Policy and training, no accommodation procedures" },
          { value: 3, label: "Complete policy, training, and accommodation procedures" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Vulnerable customer policy",
          "Staff training materials",
          "Accommodation procedures (e.g., large print, extended time)"
        ],
        fcaReference:
          "FG21/1 - Guidance for firms on the fair treatment of vulnerable customers"
      },
      {
        id: "cd-004",
        question: "Do you have a complaints handling procedure aligned to DISP with root-cause analysis?",
        helpText:
          "8-week resolution deadline, final response letters, FOS signposting, MI on complaint trends, root-cause analysis to fix systemic issues.",
        type: "scale",
        options: [
          { value: 0, label: "No complaints procedure" },
          { value: 1, label: "Basic procedure, not DISP-compliant" },
          { value: 2, label: "DISP-compliant but no root-cause analysis" },
          { value: 3, label: "Full DISP compliance with MI and root-cause tracking" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Complaints handling procedure",
          "Final response letter templates",
          "Complaints MI template",
          "Root-cause analysis process"
        ],
        fcaReference: "DISP 1 - Treating complainants fairly"
      }
    ]
  },
  {
    id: "data-protection",
    title: "Data Protection",
    description: "GDPR compliance, data processing, and privacy controls",
    questions: [
      {
        id: "dp-001",
        question:
          "Have you documented lawful bases for all processing activities with a Record of Processing Activities (ROPA)?",
        helpText:
          "Each processing activity needs a lawful basis (consent, contract, legal obligation, etc.). ROPA is mandatory for most firms.",
        type: "scale",
        options: [
          { value: 0, label: "No data mapping or ROPA" },
          { value: 1, label: "Partial data mapping, no ROPA" },
          { value: 2, label: "ROPA drafted, lawful bases unclear" },
          { value: 3, label: "Complete ROPA with documented lawful bases" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Record of Processing Activities (ROPA)",
          "Lawful basis documentation for each processing activity",
          "Privacy notice"
        ],
        fcaReference: "GDPR Article 30"
      },
      {
        id: "dp-002",
        question:
          "Are technical and organizational measures (TOMs) documented with a breach response plan?",
        helpText:
          "TOMs = encryption, access controls, pseudonymization, etc. Breach plan must enable 72-hour ICO notification.",
        type: "scale",
        options: [
          { value: 0, label: "No TOMs documentation or breach plan" },
          { value: 1, label: "Basic security controls, no breach plan" },
          { value: 2, label: "TOMs documented, breach plan incomplete" },
          { value: 3, label: "Comprehensive TOMs and tested breach response plan" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "TOMs documentation",
          "Data breach response plan",
          "72-hour notification procedure"
        ],
        fcaReference: "GDPR Article 32-34"
      },
      {
        id: "dp-003",
        question: "Do data retention schedules exist with documented deletion procedures?",
        helpText:
          "Balance regulatory retention requirements (e.g., 5 years for AML) with GDPR minimization. Must have defensible deletion process.",
        type: "scale",
        options: [
          { value: 0, label: "No retention schedules" },
          { value: 1, label: "Informal retention, no deletion process" },
          { value: 2, label: "Schedules exist, deletion not implemented" },
          { value: 3, label: "Complete retention schedules with automated/manual deletion" }
        ],
        weight: 1,
        required: true,
        evidenceRequired: [
          "Data retention schedule",
          "Deletion procedures",
          "Evidence of deletion (logs)"
        ],
        fcaReference: "GDPR Article 5(1)(e) - Storage limitation"
      }
    ]
  },
  {
    id: "payments-specific",
    title: "Payment Services Specific",
    description:
      "Questions specific to Payment Institution and E-Money Institution authorization",
    applicableTo: ["payments-emi", "payments-pi"],
    questions: [
      {
        id: "ps-001",
        question: "What payment services will you provide?",
        helpText:
          "Select all that apply. Each service has different capital and safeguarding requirements.",
        type: "multi-select",
        options: [
          { value: "money-remittance", label: "Money Remittance" },
          { value: "payment-initiation", label: "Payment Initiation Services (PISP)" },
          { value: "account-information", label: "Account Information Services (AISP)" },
          { value: "payment-accounts", label: "Payment Accounts (execution, acquiring)" },
          { value: "card-issuing", label: "Card Issuing" },
          { value: "merchant-acquiring", label: "Merchant Acquiring" }
        ],
        weight: 3,
        required: true,
        triggers: {
          "money-remittance": ["ps-safeguarding", "ps-agent-network"],
          "payment-initiation": ["ps-sca", "ps-psd2-api"],
          "account-information": ["ps-psd2-api"],
          "payment-accounts": ["ps-safeguarding", "ps-operational-account"],
          "card-issuing": ["ps-scheme-membership"],
          "merchant-acquiring": ["ps-scheme-membership", "ps-settlement"]
        },
        fcaReference: "PSRs 2017 Schedule 1"
      },
      {
        id: "ps-002",
        question: "Are you applying as a Payment Institution (PI) or E-Money Institution (EMI)?",
        helpText:
          "EMI if you issue e-money (stored value). PI if you only execute payments. EMI has higher capital requirements (EUR 350k vs EUR 125k for payment accounts).",
        type: "single-select",
        options: [
          { value: "pi", label: "Payment Institution (PI)" },
          { value: "emi", label: "E-Money Institution (EMI)" },
          { value: "small-pi", label: "Small Payment Institution (under EUR 3m/month)" },
          { value: "small-emi", label: "Small EMI (under EUR 5m outstanding)" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "Authorization type must be clearly defined. This determines your capital requirements and regulatory obligations.",
        capitalImplications: {
          pi: { method: "A/B/C", minimum: 125000 },
          emi: { method: "D", minimum: 350000, liquidAssets: true },
          "small-pi": { method: "none", minimum: 0 },
          "small-emi": { method: "none", minimum: 0 }
        },
        fcaReference: "PSRs 2017 Regulation 6-7"
      },
      {
        id: "ps-003",
        question: "What is your safeguarding approach for customer funds?",
        helpText:
          "Segregation = separate account at credit institution. Insurance = must cover 100% of customer funds. Mixed approach possible but complex.",
        type: "single-select",
        options: [
          {
            value: "segregation",
            label: "Segregation in separate account at credit institution"
          },
          {
            value: "insurance",
            label: "Insurance or guarantee from authorized insurer/credit institution"
          },
          { value: "mixed", label: "Combination of segregation and insurance" },
          { value: "not-applicable", label: "Not applicable (AISP only)" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "Safeguarding customer funds is a fundamental requirement under PSRs 2017. Inadequate safeguarding arrangements will result in refusal.",
        conditionalOn: { questionId: "ps-001", notValues: ["account-information"] },
        evidenceRequired: [
          "Safeguarding account agreement (if segregation)",
          "Insurance policy (if insurance approach)",
          "Safeguarding procedures document",
          "Daily reconciliation process"
        ],
        fcaReference: "PSRs 2017 Regulation 23"
      },
      {
        id: "ps-004",
        question:
          "Do you have daily safeguarding reconciliation procedures with documented shortfall/excess handling?",
        helpText:
          "Must reconcile daily. Shortfall = top up within same business day. Excess = return to operational account. Records must be auditable.",
        type: "scale",
        options: [
          { value: 0, label: "No reconciliation procedures" },
          { value: 1, label: "Reconciliation planned but not documented" },
          { value: 2, label: "Procedures documented, shortfall handling unclear" },
          { value: 3, label: "Full daily reconciliation with shortfall/excess procedures" }
        ],
        weight: 3,
        required: true,
        critical: true,
        hardGate: true,
        hardGateThreshold: 1,
        hardGateMessage:
          "Daily safeguarding reconciliation is required under PSRs 2017. Inadequate reconciliation procedures will result in refusal.",
        conditionalOn: { questionId: "ps-003", notValues: ["not-applicable"] },
        evidenceRequired: [
          "Safeguarding reconciliation procedure",
          "Sample reconciliation report",
          "Shortfall notification procedure",
          "Safeguarding audit arrangements"
        ],
        fcaReference: "CASS 7.13 / Approach Document Chapter 10"
      },
      {
        id: "ps-005",
        question:
          "Have you implemented Strong Customer Authentication (SCA) for payment initiation and account access?",
        helpText:
          "SCA = 2 of 3 factors (knowledge, possession, inherence). Exemptions available for low-value, recurring, trusted beneficiaries - must document usage.",
        type: "scale",
        options: [
          { value: 0, label: "No SCA implementation" },
          { value: 1, label: "SCA planned, not implemented" },
          { value: 2, label: "SCA implemented, exemptions not documented" },
          { value: 3, label: "Full SCA with documented exemption usage" }
        ],
        weight: 2,
        required: true,
        conditionalOn: { questionId: "ps-001", values: ["payment-initiation", "payment-accounts"] },
        evidenceRequired: [
          "SCA implementation documentation",
          "Exemption usage policy",
          "Transaction risk analysis for exemptions"
        ],
        fcaReference: "PSRs 2017 Regulation 100 / PSD2 RTS on SCA"
      },
      {
        id: "ps-006",
        question:
          "Do you have an agent/distributor network, and if so, is there a due diligence and oversight framework?",
        helpText:
          "Agents act on your behalf - you're responsible for their actions. Need robust onboarding, ongoing monitoring, and termination procedures.",
        type: "scale",
        options: [
          { value: 0, label: "Agents planned with no framework" },
          { value: 1, label: "Basic agent agreements, no due diligence" },
          { value: 2, label: "Due diligence process, no ongoing monitoring" },
          { value: 3, label: "Full agent framework: DD, training, monitoring, termination" }
        ],
        weight: 2,
        required: true,
        conditionalOn: { questionId: "ps-001", values: ["money-remittance", "payment-accounts"] },
        evidenceRequired: [
          "Agent due diligence procedure",
          "Agent agreement template",
          "Agent monitoring framework",
          "Agent training materials"
        ],
        fcaReference: "PSRs 2017 Regulation 34-37"
      },
      {
        id: "ps-007",
        question: "What are your projected monthly payment volumes for the first 3 years?",
        helpText:
          "Needed for capital calculation (Method B uses payment volume). Be realistic - FCA will scrutinize projections.",
        type: "numeric-table",
        columns: ["Year 1", "Year 2", "Year 3"],
        rows: [
          "Monthly Payment Volume (GBP)",
          "Number of Transactions",
          "Average Transaction Value"
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Financial projections with assumptions",
          "Market analysis supporting volumes",
          "Sensitivity analysis"
        ],
        fcaReference: "PSRs 2017 Regulation 8"
      },
      {
        id: "ps-008",
        question:
          "Do you have fraud prevention and transaction monitoring systems appropriate to your payment services?",
        helpText:
          "Must detect: unusual patterns, velocity checks, geo anomalies, device fingerprinting. Real-time for high-risk transactions.",
        type: "scale",
        options: [
          { value: 0, label: "No fraud prevention systems" },
          { value: 1, label: "Basic checks only (e.g., amount limits)" },
          { value: 2, label: "Rule-based monitoring, not real-time" },
          { value: 3, label: "Comprehensive real-time fraud monitoring" }
        ],
        weight: 2,
        required: true,
        evidenceRequired: [
          "Fraud prevention framework",
          "Transaction monitoring rules",
          "Alert investigation procedures",
          "Fraud MI/reporting"
        ],
        fcaReference: "PSRs 2017 Regulation 98"
      },
      {
        id: "ps-009",
        question: "Have you defined execution times and cut-off times compliant with PSRs requirements?",
        helpText:
          "D+1 for UK/EEA payments. Must clearly communicate cut-off times. Different rules for different payment types.",
        type: "scale",
        options: [
          { value: 0, label: "Execution times not defined" },
          { value: 1, label: "Defined but not compliant with PSRs" },
          { value: 2, label: "Compliant but not clearly communicated" },
          { value: 3, label: "Compliant execution times with clear customer communication" }
        ],
        weight: 1,
        required: true,
        evidenceRequired: [
          "Execution time policy",
          "Cut-off time schedule",
          "Customer communication (T&Cs)"
        ],
        fcaReference: "PSRs 2017 Regulation 86"
      },
      {
        id: "ps-010",
        question: "Do you have arrangements for authorized push payment (APP) fraud reimbursement?",
        helpText:
          "From Oct 2024: mandatory reimbursement for APP fraud victims (with exceptions). Must have processes and funding for reimbursement.",
        type: "scale",
        options: [
          { value: 0, label: "No APP fraud arrangements" },
          { value: 1, label: "Aware of requirements, not implemented" },
          { value: 2, label: "Procedures drafted, funding unclear" },
          { value: 3, label: "Full APP fraud reimbursement process with funding" }
        ],
        weight: 2,
        required: true,
        conditionalOn: { questionId: "ps-001", values: ["payment-accounts", "money-remittance"] },
        evidenceRequired: [
          "APP fraud reimbursement policy",
          "Investigation procedures",
          "Funding/provisioning for reimbursement",
          "Consumer standard caution wording"
        ],
        fcaReference: "PSR PS23/3 - APP Fraud Reimbursement"
      },
      {
        id: "ps-011",
        question: "Do you have payment scheme memberships or sponsorship arrangements in place?",
        helpText:
          "Direct membership (Visa, Mastercard, BACS, FPS) or sponsor bank arrangement. Each has different requirements and costs.",
        type: "single-select",
        options: [
          { value: "direct", label: "Direct scheme membership" },
          { value: "sponsored", label: "Sponsored access via bank" },
          { value: "both", label: "Mix of direct and sponsored" },
          { value: "not-required", label: "Not required for my services" }
        ],
        weight: 2,
        required: true,
        conditionalOn: {
          questionId: "ps-001",
          values: ["payment-accounts", "card-issuing", "merchant-acquiring"]
        },
        evidenceRequired: [
          "Scheme membership documentation (or application status)",
          "Sponsor bank agreement",
          "Scheme compliance certification"
        ]
      },
      {
        id: "ps-012",
        question: "Do you have arrangements for safeguarding audits (annual for EMIs, as needed for PIs)?",
        helpText:
          "EMIs must have annual safeguarding audit by external accountant. PIs should have capability to produce audit on request.",
        type: "scale",
        options: [
          { value: 0, label: "No audit arrangements" },
          { value: 1, label: "Auditor identified, scope not defined" },
          { value: 2, label: "Audit scope defined, not scheduled" },
          { value: 3, label: "Full audit arrangements with auditor engaged" }
        ],
        weight: 2,
        required: true,
        conditionalOn: { questionId: "ps-002", values: ["emi"] },
        evidenceRequired: [
          "Auditor engagement letter",
          "Safeguarding audit scope",
          "First audit timeline"
        ],
        fcaReference: "SUP 16.12 - Integrated Regulatory Reporting"
      }
    ]
  }
];

const specQuestions: Question[] = questionSections.flatMap((section) =>
  section.questions.map((question) => ({
    ...question,
    section: section.id,
    title: question.title ?? question.question ?? "",
    description: question.description ?? question.helpText ?? "",
  }))
);

export const questionBank: Question[] = [...legacyQuestionBank, ...specQuestions];

// Helper function to get questions by section
export function getQuestionsBySection(sectionId: string): Question[] {
  return questionBank.filter((q) => q.section === sectionId);
}

// Helper function to get all sections with question counts
export function getSectionSummary() {
  const sections = [
    {
      id: "business-model",
      name: "Business Model & Strategy",
      description: "Define your business activities and target market"
    },
    {
      id: "governance",
      name: "Governance & Management",
      description: "Senior management and organizational structure"
    },
    {
      id: "risk-management",
      name: "Risk Management Framework",
      description: "Risk appetite, controls, and mitigation strategies"
    },
    {
      id: "financial-resources",
      name: "Financial Resources",
      description: "Capital adequacy and financial projections"
    },
    {
      id: "systems-controls",
      name: "Systems & Controls",
      description: "IT systems, data protection, and operational controls"
    },
    ...questionSections.map((section) => ({
      id: section.id,
      name: section.title,
      description: section.description
    }))
  ];

  const seen = new Set<string>();
  const uniqueSections = sections.filter((section) => {
    if (seen.has(section.id)) return false;
    seen.add(section.id);
    return true;
  });

  return uniqueSections.map((section) => ({
    ...section,
    questionCount: getQuestionsBySection(section.id).length,
    totalWeight: getQuestionsBySection(section.id).reduce((sum, q) => sum + q.weight, 0)
  }));
}
