export const SITE_URL = "https://nasaraconnect.com";

export type MarketingCard = {
  title: string;
  description: string;
};

export type MarketingPage = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  summary: string;
  highlights: MarketingCard[];
  steps: MarketingCard[];
  outcomes: string[];
  audiences: string[];
  ctaLabel: string;
  ctaHref: string;
};

export const FEATURE_PAGES: MarketingPage[] = [
  {
    slug: "authorization-pack",
    title: "Authorization Pack",
    seoTitle: "FCA Authorisation Pack Builder Software",
    seoDescription:
      "Build FCA-ready authorisation applications with guided checklists, document templates, gap analysis and review workflows.",
    h1: "Build Your FCA Authorisation Pack Faster",
    summary:
      "Assemble every FCA-required document with guided workflows, pre-built templates, and readiness checks that reduce rework.",
    highlights: [
      { title: "Complete application coverage", description: "Structured document list aligned to FCA expectations." },
      { title: "Gap analysis", description: "Spot missing evidence early and resolve it before submission." },
      { title: "Review workflows", description: "Track ownership, approvals, and sign-off readiness." },
    ],
    steps: [
      { title: "Assess scope", description: "Select permissions and activities to shape the pack." },
      { title: "Generate documents", description: "Draft required policies and supporting evidence." },
      { title: "Validate readiness", description: "Run completeness checks and capture approval sign-offs." },
    ],
    outcomes: ["Faster submission timelines", "Clear audit trail", "Reduced resubmissions"],
    audiences: ["Fintech and payments applicants", "Compliance teams preparing for FCA review"],
    ctaLabel: "Request a demo",
    ctaHref: "/request-demo",
  },
  {
    slug: "smcr-management",
    title: "SM&CR Management",
    seoTitle: "SM&CR Software: Responsibilities Maps & SoRs",
    seoDescription:
      "Manage SM&CR with Statements of Responsibilities, responsibilities maps, certification tracking, and conduct rules attestations.",
    h1: "SM&CR Management Made Simple",
    summary:
      "Centralise Statements of Responsibilities, certification tracking, and conduct rules evidence in one workflow.",
    highlights: [
      { title: "Responsibilities mapping", description: "Keep SoRs and maps aligned to FCA requirements." },
      { title: "Certification tracking", description: "Automate renewals and evidence checks." },
      { title: "Conduct rules attestation", description: "Record training and breach workflows." },
    ],
    steps: [
      { title: "Define roles", description: "Capture SMFs, responsibilities, and governance owners." },
      { title: "Monitor fitness", description: "Track certifications and assessments." },
      { title: "Report breaches", description: "Maintain a complete audit trail of issues." },
    ],
    outcomes: ["Clear accountability", "Improved regulator readiness", "Fewer manual spreadsheets"],
    audiences: ["Banks, investment firms, consumer finance teams"],
    ctaLabel: "Explore SM&CR workflows",
    ctaHref: "/request-demo",
  },
  {
    slug: "compliance-monitoring",
    title: "Compliance Monitoring",
    seoTitle: "Compliance Monitoring Plan (CMP) Software",
    seoDescription:
      "Build and run your Compliance Monitoring Plan with scheduling, testing workflows, evidence capture and board-ready reports.",
    h1: "Run a Stronger Compliance Monitoring Plan",
    summary:
      "Design, schedule, and evidence your CMP with structured testing, evidence capture, and reporting packs.",
    highlights: [
      { title: "CMP builder", description: "Create monitoring plans aligned to FCA priorities." },
      { title: "Evidence capture", description: "Log findings, remediation, and approvals." },
      { title: "Board reporting", description: "Generate pack-ready summaries for governance forums." },
    ],
    steps: [
      { title: "Plan", description: "Define outcomes, tests, and cadence." },
      { title: "Execute", description: "Run tests and capture evidence." },
      { title: "Report", description: "Share insights with risk and board committees." },
    ],
    outcomes: ["Consistent testing", "Defensible audit trail", "Board-ready reporting"],
    audiences: ["Compliance monitoring teams", "Risk oversight functions"],
    ctaLabel: "See CMP in action",
    ctaHref: "/request-demo",
  },
  {
    slug: "policy-management",
    title: "Policy Management",
    seoTitle: "Policy Management & Attestations Software",
    seoDescription:
      "Create, review, and evidence policies with version control, attestations, templates, and audit trails built for FCA firms.",
    h1: "Policy Management Built for FCA Compliance",
    summary:
      "Launch structured policies with templates, attestations, and audit-ready version control.",
    highlights: [
      { title: "Template library", description: "Start from FCA-aligned policy templates." },
      { title: "Attestations", description: "Collect staff acknowledgements and evidence." },
      { title: "Version control", description: "Track approvals and changes across versions." },
    ],
    steps: [
      { title: "Assemble", description: "Select clauses and firm-specific modules." },
      { title: "Review", description: "Capture approvals and governance checks." },
      { title: "Publish", description: "Distribute and track attestations." },
    ],
    outcomes: ["Fewer policy gaps", "Clear ownership", "Audit-ready outputs"],
    audiences: ["Compliance leaders", "Operational risk teams"],
    ctaLabel: "Build a policy pack",
    ctaHref: "/request-demo",
  },
  {
    slug: "risk-assessment",
    title: "Risk Assessment",
    seoTitle: "Risk Assessment & Controls Testing Software",
    seoDescription:
      "Centralise risk registers, controls testing, scoring, and dashboards to spot issues early and stay audit-ready.",
    h1: "Make Risk Reviews Faster and More Consistent",
    summary:
      "Standardise risk assessments with structured scoring, control testing, and executive-level reporting.",
    highlights: [
      { title: "Risk register", description: "Capture inherent and residual risk in one place." },
      { title: "Controls testing", description: "Map controls to outcomes and evidence." },
      { title: "Dashboards", description: "Visualise risk trends and remediation progress." },
    ],
    steps: [
      { title: "Identify", description: "Define key risk themes and ownership." },
      { title: "Assess", description: "Score and validate controls." },
      { title: "Monitor", description: "Track remediation and reporting cadence." },
    ],
    outcomes: ["Earlier issue detection", "Consistent scoring", "Better oversight"],
    audiences: ["Risk analysts", "Compliance monitoring teams"],
    ctaLabel: "Explore risk workflows",
    ctaHref: "/request-demo",
  },
  {
    slug: "ai-assistant",
    title: "AI Assistant",
    seoTitle: "AI Compliance Assistant for FCA-Regulated Firms",
    seoDescription:
      "Get instant answers on FCA rules, draft policies and documents, and receive proactive compliance guidance powered by AI.",
    h1: "Your 24/7 AI Compliance Assistant",
    summary:
      "Ask questions, draft documents, and get FCA-aligned guidance at the moment you need it.",
    highlights: [
      { title: "Instant answers", description: "Clarify FCA rules without hunting across sources." },
      { title: "Drafting support", description: "Generate policy text and checklists quickly." },
      { title: "Proactive alerts", description: "Surface compliance gaps before audits." },
    ],
    steps: [
      { title: "Ask", description: "Query rules, expectations, and evidence needs." },
      { title: "Draft", description: "Generate policies, letters, and workflows." },
      { title: "Verify", description: "Validate outputs and track updates." },
    ],
    outcomes: ["Faster drafting", "Clear guidance", "Reduced compliance risk"],
    audiences: ["Compliance teams", "Operations teams"],
    ctaLabel: "See AI guidance",
    ctaHref: "/request-demo",
  },
  {
    slug: "training-library",
    title: "Training Library",
    seoTitle: "Compliance Training Library for FCA Firms",
    seoDescription:
      "Deliver FCA training modules with assessments, tracking, and certifications across conduct, SM&CR, and financial crime.",
    h1: "Compliance Training That Scales",
    summary:
      "Deliver FCA-aligned training with assessments, certifications, and reporting built for regulated teams.",
    highlights: [
      { title: "Structured modules", description: "Cover SM&CR, AML, Consumer Duty, and more." },
      { title: "Tracking & reporting", description: "Monitor completion and policy attestations." },
      { title: "Assessments", description: "Validate learning outcomes with exams." },
    ],
    steps: [
      { title: "Assign", description: "Deliver training by role or department." },
      { title: "Assess", description: "Capture scores and evidence." },
      { title: "Report", description: "Surface completion gaps quickly." },
    ],
    outcomes: ["Higher completion rates", "Clear evidence", "Less admin work"],
    audiences: ["HR and compliance teams", "Operational leaders"],
    ctaLabel: "Explore training modules",
    ctaHref: "/request-demo",
  },
  {
    slug: "safeguarding",
    title: "Safeguarding",
    seoTitle: "Safeguarding Reconciliation Software for EMIs & PIs",
    seoDescription:
      "Automate safeguarding calculations, daily reconciliation, and audit trails for payment and e-money firms.",
    h1: "Safeguarding Made Auditable",
    summary:
      "Automate safeguarding calculations, daily reconciliations, and evidence logging for EMI and PI firms.",
    highlights: [
      { title: "Daily reconciliation", description: "Track safeguarding funds with precision." },
      { title: "Evidence capture", description: "Maintain audit-ready documentation." },
      { title: "Exception alerts", description: "Spot breaks early and resolve fast." },
    ],
    steps: [
      { title: "Connect", description: "Integrate to transaction sources." },
      { title: "Reconcile", description: "Run daily safeguarding checks." },
      { title: "Report", description: "Produce regulatory evidence." },
    ],
    outcomes: ["Lower reconciliation risk", "Cleaner audits", "Faster oversight"],
    audiences: ["Payments and e-money firms", "Safeguarding officers"],
    ctaLabel: "See safeguarding controls",
    ctaHref: "/request-demo",
  },
  {
    slug: "financial-promotions",
    title: "Financial Promotions",
    seoTitle: "Financial Promotions Compliance Workflow Software",
    seoDescription:
      "Streamline review, approval, and evidence for compliant financial promotions with versioning and audit trails.",
    h1: "Control Financial Promotions with Clear Approval Trails",
    summary:
      "Manage promotion approvals with versioning, sign-offs, and evidence trails to meet FCA requirements.",
    highlights: [
      { title: "Approval workflows", description: "Route promotions to the right approvers." },
      { title: "Version control", description: "Track iterations and approvals." },
      { title: "Audit evidence", description: "Keep a defensible history of changes." },
    ],
    steps: [
      { title: "Submit", description: "Capture promotion requests with context." },
      { title: "Review", description: "Approve, reject, or request changes." },
      { title: "Publish", description: "Lock final versions with evidence." },
    ],
    outcomes: ["Reduced compliance risk", "Clear approvals", "Improved governance"],
    audiences: ["Marketing compliance teams", "Crypto and investment firms"],
    ctaLabel: "Review promotions",
    ctaHref: "/request-demo",
  },
];

export const SOLUTION_PAGES: MarketingPage[] = [
  {
    slug: "fca-authorisation",
    title: "FCA Authorisation",
    seoTitle: "FCA Authorisation Software & Application Support",
    seoDescription:
      "Plan, build, and evidence your FCA authorisation application with guided workflows, templates, and readiness checks.",
    h1: "Get FCA Authorised with Less Rework",
    summary:
      "Align your application with FCA expectations through structured evidence gathering and review-ready documentation.",
    highlights: [
      { title: "Regulatory expectations", description: "Understand what the FCA expects at each stage." },
      { title: "Evidence tracking", description: "Capture documents, approvals, and ownership." },
      { title: "Submission readiness", description: "Reduce delays by closing gaps early." },
    ],
    steps: [
      { title: "Plan", description: "Map permissions and activities." },
      { title: "Build", description: "Generate required policies and procedures." },
      { title: "Validate", description: "Confirm readiness before submission." },
    ],
    outcomes: ["Shorter authorisation timelines", "Reduced FCA queries", "Clear compliance narrative"],
    audiences: ["Fintech founders", "Compliance leads preparing applications"],
    ctaLabel: "Start authorisation planning",
    ctaHref: "/request-demo",
  },
  {
    slug: "smcr",
    title: "SM&CR Compliance",
    seoTitle: "SM&CR Compliance Software",
    seoDescription:
      "Deliver SM&CR requirements with mapped responsibilities, certification tracking, conduct rules attestations, and breach workflows.",
    h1: "SM&CR Compliance You Can Evidence",
    summary:
      "Align responsibilities maps, certifications, and conduct rules evidence in one control plane.",
    highlights: [
      { title: "SoR workflows", description: "Maintain Statements of Responsibilities." },
      { title: "Certification tracking", description: "Monitor renewal dates and evidence." },
      { title: "Conduct rules", description: "Capture attestations and breaches." },
    ],
    steps: [
      { title: "Map", description: "Define responsibilities and accountability." },
      { title: "Certify", description: "Run fitness and propriety checks." },
      { title: "Monitor", description: "Track breaches and remediation." },
    ],
    outcomes: ["Stronger accountability", "Consistent reporting", "Audit-ready records"],
    audiences: ["Banks and investment firms", "SM&CR program owners"],
    ctaLabel: "See SM&CR workflows",
    ctaHref: "/request-demo",
  },
  {
    slug: "compliance-monitoring-plan",
    title: "Compliance Monitoring Plan",
    seoTitle: "Compliance Monitoring Plan (CMP) Management",
    seoDescription:
      "Design, schedule, and evidence compliance monitoring with testing workflows, evidence capture, and board reporting packs.",
    h1: "Build a CMP You Can Defend",
    summary:
      "Turn your monitoring plan into a structured, evidence-led workflow aligned to FCA expectations.",
    highlights: [
      { title: "Plan structure", description: "Align monitoring themes to risk priorities." },
      { title: "Testing workflows", description: "Schedule tests and capture findings." },
      { title: "Board reporting", description: "Generate governance-ready outputs." },
    ],
    steps: [
      { title: "Design", description: "Define scope, cadence, and owners." },
      { title: "Execute", description: "Run tests and capture evidence." },
      { title: "Report", description: "Share insights across governance forums." },
    ],
    outcomes: ["Consistent monitoring", "Better oversight", "Clear remediation plans"],
    audiences: ["Compliance monitoring teams", "Risk committees"],
    ctaLabel: "Plan your CMP",
    ctaHref: "/request-demo",
  },
  {
    slug: "consumer-duty",
    title: "Consumer Duty",
    seoTitle: "Consumer Duty Compliance Software",
    seoDescription:
      "Track Consumer Duty outcomes, fair value evidence, policy controls, and MI dashboards built for FCA expectations.",
    h1: "Evidence Consumer Duty Outcomes",
    summary:
      "Track outcomes, MI, and fair value evidence to demonstrate Consumer Duty compliance.",
    highlights: [
      { title: "Outcome tracking", description: "Monitor outcomes across products and channels." },
      { title: "Fair value evidence", description: "Capture pricing and value assessments." },
      { title: "Governance MI", description: "Report to boards and committees." },
    ],
    steps: [
      { title: "Assess", description: "Capture value and outcome metrics." },
      { title: "Evidence", description: "Log supporting documents and decisions." },
      { title: "Report", description: "Share insights to governance forums." },
    ],
    outcomes: ["Clear Duty evidence", "Reduced regulatory risk", "Improved customer outcomes"],
    audiences: ["Consumer finance firms", "Product governance teams"],
    ctaLabel: "Explore Consumer Duty",
    ctaHref: "/request-demo",
  },
  {
    slug: "safeguarding",
    title: "Safeguarding Compliance",
    seoTitle: "Safeguarding Compliance for EMIs & PIs",
    seoDescription:
      "Safeguarding calculations, reconciliations, audit trails, and reporting built for payments and e-money firms.",
    h1: "Safeguarding Controls You Can Prove",
    summary:
      "Deliver safeguarding compliance with reconciliations, evidence capture, and exception handling.",
    highlights: [
      { title: "Reconciliation", description: "Run daily safeguarding checks." },
      { title: "Exception tracking", description: "Investigate breaks quickly." },
      { title: "Audit trail", description: "Maintain regulator-ready records." },
    ],
    steps: [
      { title: "Capture", description: "Ingest transactions and balances." },
      { title: "Reconcile", description: "Match safeguarding balances daily." },
      { title: "Evidence", description: "Report on controls and exceptions." },
    ],
    outcomes: ["Reduced safeguarding risk", "Clear regulator evidence", "Improved control ownership"],
    audiences: ["Payments firms", "Safeguarding officers"],
    ctaLabel: "Talk safeguarding",
    ctaHref: "/request-demo",
  },
  {
    slug: "cass-compliance",
    title: "CASS Compliance",
    seoTitle: "CASS Compliance Software for Client Assets",
    seoDescription:
      "Support CASS oversight with monitoring workflows, reconciliations, evidence management, and reporting for investment firms.",
    h1: "CASS Monitoring Made Practical",
    summary:
      "Deliver CASS compliance with structured reconciliations, controls, and evidence logging.",
    highlights: [
      { title: "Client money oversight", description: "Track CASS 7 compliance." },
      { title: "Control testing", description: "Validate controls and record evidence." },
      { title: "Governance reporting", description: "Report to CASS oversight." },
    ],
    steps: [
      { title: "Monitor", description: "Track client money and assets." },
      { title: "Test", description: "Validate control effectiveness." },
      { title: "Report", description: "Provide oversight packs." },
    ],
    outcomes: ["Reduced breaches", "Improved oversight", "Audit-ready records"],
    audiences: ["Investment firms", "CASS oversight teams"],
    ctaLabel: "Explore CASS support",
    ctaHref: "/request-demo",
  },
  {
    slug: "operational-resilience",
    title: "Operational Resilience",
    seoTitle: "Operational Resilience Compliance",
    seoDescription:
      "Map important business services, track controls, and evidence resilience testing with audit-ready reporting.",
    h1: "Operational Resilience You Can Evidence",
    summary:
      "Map important business services and evidence resilience testing with structured reporting.",
    highlights: [
      { title: "Service mapping", description: "Identify critical services and dependencies." },
      { title: "Testing", description: "Capture impact tolerances and outcomes." },
      { title: "Governance", description: "Report findings and remediation." },
    ],
    steps: [
      { title: "Map", description: "Define important business services." },
      { title: "Test", description: "Run resilience scenarios." },
      { title: "Improve", description: "Track remediation and updates." },
    ],
    outcomes: ["Stronger resilience evidence", "Clear governance view", "Reduced disruption risk"],
    audiences: ["Banks and fintechs", "Operational resilience teams"],
    ctaLabel: "See resilience workflows",
    ctaHref: "/request-demo",
  },
  {
    slug: "financial-promotions-compliance",
    title: "Financial Promotions Compliance",
    seoTitle: "Financial Promotions Compliance Workflows",
    seoDescription:
      "Control promotion creation, review, approval, and evidence with versioning, sign-offs, and audit trails.",
    h1: "A Clear Approval Trail for Every Promotion",
    summary:
      "Manage financial promotions with approval workflows, version control, and evidence trails.",
    highlights: [
      { title: "Approval controls", description: "Route promotions to compliant approvers." },
      { title: "Evidence trails", description: "Record changes and approvals." },
      { title: "Regulatory alignment", description: "Stay aligned to FCA expectations." },
    ],
    steps: [
      { title: "Submit", description: "Capture promotion requirements." },
      { title: "Approve", description: "Review and sign off changes." },
      { title: "Evidence", description: "Archive approvals and history." },
    ],
    outcomes: ["Reduced promotion risk", "Faster approvals", "Clear accountability"],
    audiences: ["Marketing compliance teams", "Crypto firms"],
    ctaLabel: "Review promotions",
    ctaHref: "/request-demo",
  },
];

export const AUDIENCE_PAGES = [
  {
    slug: "fintech",
    seoTitle: "Compliance Software for Fintech & Payments",
    seoDescription:
      "Compliance workflows for EMIs, PIs, and payment firms covering safeguarding, PSD2, and transaction monitoring.",
  },
  {
    slug: "banks",
    seoTitle: "Compliance Software for Banks & Credit",
    seoDescription:
      "Regulatory workflows for banks and credit institutions across governance, risk, and SM&CR obligations.",
  },
  {
    slug: "investment",
    seoTitle: "Compliance Software for Investment Firms",
    seoDescription:
      "CASS oversight, suitability, and governance workflows built for investment managers and advisers.",
  },
  {
    slug: "insurance",
    seoTitle: "Compliance Software for Insurance Firms",
    seoDescription:
      "Compliance monitoring, conduct risk, and policy governance tailored for insurers and brokers.",
  },
  {
    slug: "crypto",
    seoTitle: "Compliance Software for Crypto & Digital Assets",
    seoDescription:
      "Financial promotions, AML, and risk monitoring workflows for crypto and digital asset firms.",
  },
  {
    slug: "consumer",
    seoTitle: "Compliance Software for Consumer Finance",
    seoDescription:
      "Consumer Duty outcomes, complaints, and policy management for consumer finance providers.",
  },
];

export const RESOURCE_GUIDES = [
  {
    slug: "fca-authorisation-checklist",
    title: "FCA Authorisation Checklist",
    seoTitle: "FCA Authorisation Checklist (Free)",
    seoDescription:
      "Download a practical FCA authorisation checklist: documents, governance, controls, and common gaps.",
  },
  {
    slug: "compliance-monitoring-plan-template",
    title: "Compliance Monitoring Plan Template",
    seoTitle: "Compliance Monitoring Plan Template",
    seoDescription:
      "A CMP template covering scope, testing, evidence capture, and board reporting requirements.",
  },
  {
    slug: "safeguarding-reconciliation-guide",
    title: "Safeguarding Reconciliation Guide",
    seoTitle: "Safeguarding Reconciliation Guide for EMIs & PIs",
    seoDescription:
      "Understand safeguarding reconciliation requirements and common break controls for payments firms.",
  },
];

export const RESOURCE_TEMPLATES = [
  {
    slug: "complaints-response-pack",
    title: "Complaints Response Pack",
    seoTitle: "Complaints Response Letter Pack",
    seoDescription:
      "Editable response letters aligned to DISP and PSR timelines for complaints handling teams.",
  },
  {
    slug: "consumer-duty-mi-pack",
    title: "Consumer Duty MI Pack",
    seoTitle: "Consumer Duty MI Pack",
    seoDescription:
      "Board-ready MI template for Consumer Duty outcomes and fair value evidence.",
  },
  {
    slug: "vulnerable-customers-framework-pack",
    title: "Vulnerable Customers Framework Pack",
    seoTitle: "Vulnerable Customers Framework Pack",
    seoDescription:
      "Complete toolkit for identifying, supporting, and monitoring outcomes for vulnerable customers with TEXAS model checklists and staff guidance.",
  },
  {
    slug: "compliance-monitoring-plan-pack",
    title: "Compliance Monitoring Plan Pack",
    seoTitle: "Compliance Monitoring Plan (CMP) Template Pack",
    seoDescription:
      "End-to-end CMP templates covering monitoring universe mapping, testing procedures, findings, remediation tracking, and governance reporting.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "fca-authorisation-checklist",
    title: "FCA Authorisation: A Practical Checklist",
    seoTitle: "FCA Authorisation Checklist for Fintechs",
    seoDescription:
      "A practical checklist for FCA authorisation applications, covering governance, controls, and evidence.",
  },
  {
    slug: "smcr-responsibilities-map",
    title: "SM&CR Responsibilities Maps: What Good Looks Like",
    seoTitle: "SM&CR Responsibilities Maps: What Good Looks Like",
    seoDescription:
      "How to build responsibilities maps that meet FCA expectations and support accountability.",
  },
  {
    slug: "compliance-monitoring-plan",
    title: "How to Build a Compliance Monitoring Plan That Scales",
    seoTitle: "Compliance Monitoring Plan That Scales",
    seoDescription:
      "Design a CMP that supports testing, evidence capture, and governance reporting.",
  },
  {
    slug: "consumer-duty-evidence",
    title: "Consumer Duty Evidence: Outcomes, MI, and Governance",
    seoTitle: "Consumer Duty Evidence and MI",
    seoDescription:
      "Track Consumer Duty outcomes with MI, governance, and fair value evidence.",
  },
  {
    slug: "safeguarding-reconciliation-controls",
    title: "Safeguarding Reconciliation: Common Breaks and Controls",
    seoTitle: "Safeguarding Reconciliation Controls",
    seoDescription:
      "Common safeguarding breaks and how to evidence reconciliations.",
  },
  {
    slug: "crypto-financial-promotions",
    title: "Crypto Financial Promotions: Workflow and Evidence Pack",
    seoTitle: "Crypto Financial Promotions Compliance",
    seoDescription:
      "Build a compliant promotion workflow with approvals, versioning, and evidence.",
  },
  {
    slug: "smcr-compliance-without-spreadsheets",
    title: "SM&CR Compliance Without Spreadsheets: A Modern Approach",
    seoTitle: "SM&CR Compliance Without Spreadsheets in 2026",
    seoDescription:
      "Why Excel-based SM&CR solutions create risk and how purpose-built software delivers better outcomes for FCA-regulated firms.",
  },
  {
    slug: "payment-services-authorization-guide",
    title: "Payment Services Authorization: EMI and PI Licensing Guide",
    seoTitle: "EMI and PI Authorization Guide 2026",
    seoDescription:
      "Complete guide to FCA authorization for payment institutions, EMIs, and money remittance firms including timelines, requirements, and common pitfalls.",
  },
  {
    slug: "aml-risk-assessment-payment-firms",
    title: "AML Risk Assessment for Payment Firms: A Practical Framework",
    seoTitle: "AML Risk Assessment for Payment and EMI Firms",
    seoDescription:
      "Build a compliant AML risk assessment framework for payment institutions and EMIs that satisfies FCA and JMLSG requirements.",
  },
  {
    slug: "consumer-duty-payment-firms",
    title: "Consumer Duty for Payment Firms: Implementation Guide 2026",
    seoTitle: "Consumer Duty for Payment Firms and Fintechs 2026",
    seoDescription:
      "Complete guide to FCA Consumer Duty implementation for payment institutions, EMIs, and fintechs including outcomes monitoring, fair value, and governance requirements.",
  },
  {
    slug: "operational-resilience-fca-requirements",
    title: "Operational Resilience: FCA Requirements and Implementation",
    seoTitle: "FCA Operational Resilience Requirements 2026",
    seoDescription:
      "Meet FCA operational resilience requirements with practical guidance on important business services, impact tolerances, scenario testing, and self-assessment.",
  },
];

export const CASE_STUDIES = [
  {
    slug: "emi-authorisation-pack",
    title: "EMI Authorisation Pack",
    seoTitle: "Case Study: EMI Authorisation Pack Delivery",
    seoDescription:
      "How an EMI reduced FCA application delays with guided authorisation workflows.",
  },
  {
    slug: "smcr-implementation",
    title: "SM&CR Implementation",
    seoTitle: "Case Study: SM&CR Implementation",
    seoDescription:
      "How a mid-size firm mapped responsibilities and improved SM&CR evidence.",
  },
  {
    slug: "cmp-automation",
    title: "CMP Automation",
    seoTitle: "Case Study: CMP Automation",
    seoDescription:
      "How a compliance team automated testing and reporting for their CMP.",
  },
];

export const TOOLS = [
  {
    slug: "smcr-responsibilities-map",
    title: "SM&CR Responsibilities Map Tool",
    seoTitle: "SM&CR Responsibilities Map Tool",
    seoDescription:
      "Build an SM&CR responsibilities map faster with a guided, audit-ready workflow.",
  },
  {
    slug: "fos-scraper",
    title: "FOS Scraper Monitor",
    seoTitle: "FOS Scraper Monitor",
    seoDescription:
      "Track FOS scraping progress, windows, and parsed coverage in real time.",
  },
];
