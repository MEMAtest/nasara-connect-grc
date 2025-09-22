export interface QuestionOption {
  value: string;
  label: string;
  score: number;
  description?: string;
}

export interface Question {
  id: string;
  section: string;
  title: string;
  description: string;
  type: "single-choice" | "multiple-choice" | "text" | "scale";
  options?: QuestionOption[];
  required: boolean;
  weight: number;
  regulatoryContext?: string;
}

export const questionBank: Question[] = [
  // BUSINESS MODEL & STRATEGY SECTION
  {
    id: "bm-001",
    section: "business-model",
    title: "What type of financial services will you provide?",
    description: "Select the primary regulated activities you plan to conduct",
    type: "single-choice",
    required: true,
    weight: 3,
    regulatoryContext: "PERG 2.7 - Regulated Activities",
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
    regulatoryContext: "GENPRU 2.1 - Capital Resources Requirements",
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
    regulatoryContext: "COND 1.1.1R - Financial Projections",
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

// Helper function to get questions by section
export function getQuestionsBySection(sectionId: string): Question[] {
  return questionBank.filter(q => q.section === sectionId);
}

// Helper function to get all sections with question counts
export function getSectionSummary() {
  const sections = [
    { id: "business-model", name: "Business Model & Strategy", description: "Define your business activities and target market" },
    { id: "governance", name: "Governance & Management", description: "Senior management and organizational structure" },
    { id: "risk-management", name: "Risk Management Framework", description: "Risk appetite, controls, and mitigation strategies" },
    { id: "financial-resources", name: "Financial Resources", description: "Capital adequacy and financial projections" },
    { id: "systems-controls", name: "Systems & Controls", description: "IT systems, data protection, and operational controls" }
  ];

  return sections.map(section => ({
    ...section,
    questionCount: getQuestionsBySection(section.id).length,
    totalWeight: getQuestionsBySection(section.id).reduce((sum, q) => sum + q.weight, 0)
  }));
}