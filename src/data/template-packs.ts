import type { TemplateItem } from '@/components/templates/types'

// Type-safe icon names that match the ICON_MAP
export type IconName = 'Rocket' | 'Scale' | 'Shield' | 'Briefcase' | 'Target' | 'Users' | 'FileCheck' | 'ClipboardList' | 'BarChart3'

export type UseCaseData = {
  persona: string
  icon: IconName
  scenario: string
  workflow: string[]
  features: Array<{ slug: string; label: string }>
  testimonialQuote?: string
}

export type ImplementationPhase = {
  phase: string
  items: string[]
}

export type TemplatePackContent = {
  overview: string
  keyBenefits: string[]
  items: TemplateItem[]
  useCases: UseCaseData[]
  implementationSequence: ImplementationPhase[]
  relatedLinks: {
    feature: { label: string; href: string }
    solution: { label: string; href: string }
    audience: { label: string; href: string }
  }
}

export const TEMPLATE_PACKS: Record<string, TemplatePackContent> = {
  "complaints-response-pack": {
    overview: "A comprehensive pack of response letter templates designed for FCA-regulated firms handling customer complaints under the Dispute Resolution (DISP) rules. Each template includes the required regulatory language, appropriate timelines, and guidance notes to ensure consistent, compliant responses across your organisation. Whether dealing with straightforward or complex complaints, this pack provides the structured framework your team needs.",
    keyBenefits: [
      "Reduce response drafting time with pre-approved templates",
      "Ensure regulatory compliance with built-in DISP requirements",
      "Maintain consistency across your complaints handling team",
      "Streamline quality assurance with standardised formats",
      "Demonstrate good practice during FCA supervisory reviews",
      "Support vulnerable customer considerations in every response",
    ],
    items: [
      {
        id: "crp-1",
        title: "Acknowledgment Letter (5 Business Days)",
        category: "document",
        description: "Standard acknowledgment letter confirming receipt of complaint within 5 business days as required by DISP.",
        purpose: "Ensures timely acknowledgment of complaints, sets expectations for the customer, and demonstrates compliance with DISP 1.6.2R requirements.",
        sequence: 1,
        customizationNotes: [
          "Insert firm-specific contact details and reference numbers",
          "Adjust expected resolution timeframe based on complaint complexity",
          "Include PSR-specific timelines for payment service complaints",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "crp-2",
        title: "Holding Letter for Complex Complaints",
        category: "document",
        description: "Letter to update customers on progress when complaints require extended investigation beyond 8 weeks.",
        purpose: "Maintains customer communication during complex investigations, explains delays, and preserves FOS rights information.",
        sequence: 2,
        customizationNotes: [
          "Explain specific reasons for delay without admitting liability",
          "Provide realistic updated timeframes",
          "Include FOS referral rights at the 8-week mark",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "crp-3",
        title: "Final Response - Upheld",
        category: "document",
        description: "Comprehensive final response letter for complaints where the firm accepts fault and offers redress.",
        purpose: "Provides clear acceptance of complaint, explains findings, details redress offered, and includes required regulatory signposting.",
        sequence: 3,
        customizationNotes: [
          "Detail specific redress calculations and methodology",
          "Include tax implications where relevant",
          "Ensure FOS rights are clearly explained",
          "Add goodwill gestures where appropriate",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "crp-4",
        title: "Final Response - Partially Upheld",
        category: "document",
        description: "Balanced final response for complaints where some aspects are upheld and others are not.",
        purpose: "Clearly distinguishes upheld elements from rejected ones, explains reasoning, and details partial redress.",
        sequence: 4,
        customizationNotes: [
          "Clearly separate upheld vs not upheld elements",
          "Provide detailed reasoning for each decision",
          "Calculate partial redress appropriately",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "crp-5",
        title: "Final Response - Not Upheld",
        category: "document",
        description: "Professional final response for complaints where investigation finds no fault or breach.",
        purpose: "Provides clear explanation of investigation findings, demonstrates fair consideration, and preserves customer relationship.",
        sequence: 5,
        customizationNotes: [
          "Provide thorough explanation of investigation process",
          "Reference relevant policies and procedures followed",
          "Maintain professional and empathetic tone",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "crp-6",
        title: "Summary Resolution Communication",
        category: "document",
        description: "Simplified response for straightforward complaints resolved within 3 business days.",
        purpose: "Enables efficient resolution of simple complaints while meeting DISP 1.5.4R requirements for summary resolution.",
        sequence: 6,
        customizationNotes: [
          "Only use for complaints resolved to customer satisfaction",
          "Ensure complaint is genuinely straightforward",
          "Include FOS rights information",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "crp-7",
        title: "FOS Referral Letter",
        category: "document",
        description: "Template letter explaining Financial Ombudsman Service referral rights and process.",
        purpose: "Ensures customers understand their escalation options and timeframes for FOS referral.",
        sequence: 7,
        customizationNotes: [
          "Include accurate 6-month referral timeframe",
          "Provide FOS contact details",
          "Explain FOS process in plain language",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "crp-8",
        title: "Goodwill Gesture Letter",
        category: "document",
        description: "Template for offering goodwill gestures without admission of liability.",
        purpose: "Enables commercial resolution of complaints while protecting the firm from liability admissions.",
        sequence: 8,
        customizationNotes: [
          "Clearly state no admission of fault",
          "Specify gesture is ex-gratia",
          "Include acceptance terms",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "crp-9",
        title: "Quality Assurance Review Checklist",
        category: "checklist",
        description: "Comprehensive QA checklist for reviewing complaint responses before sending.",
        purpose: "Ensures all responses meet regulatory requirements and firm standards before customer communication.",
        sequence: 9,
        customizationNotes: [
          "Add firm-specific quality criteria",
          "Include tone and empathy checks",
          "Track QA outcomes for MI reporting",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "crp-10",
        title: "Root Cause Analysis Tracker",
        category: "checklist",
        description: "Template for capturing and tracking root causes of complaints for trend analysis.",
        purpose: "Supports identification of systemic issues and feeds into Consumer Duty outcome monitoring.",
        sequence: 10,
        customizationNotes: [
          "Align categories to your product/service lines",
          "Link to remediation tracking",
          "Feed into board MI reporting",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "crp-11",
        title: "Complaints Escalation Procedure",
        category: "governance",
        description: "Structured procedure for escalating complex or high-risk complaints.",
        purpose: "Ensures appropriate oversight of significant complaints and timely escalation to senior management.",
        sequence: 11,
        customizationNotes: [
          "Define escalation triggers specific to your firm",
          "Include senior management notification thresholds",
          "Link to regulatory reporting requirements",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        id: "crp-12",
        title: "Vulnerable Customer Consideration Guide",
        category: "governance",
        description: "Guidance for handlers on identifying and supporting vulnerable complainants.",
        purpose: "Ensures vulnerable customers receive appropriate adjustments and support throughout the complaints process.",
        sequence: 12,
        customizationNotes: [
          "Include TEXAS vulnerability indicators",
          "List reasonable adjustments options",
          "Link to specialist support resources",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
    ],
    useCases: [
      {
        persona: "Complaints Handlers at Banks",
        icon: "Briefcase",
        scenario: "Managing high volumes of diverse complaints while maintaining DISP compliance and quality standards.",
        workflow: [
          "Use acknowledgment template immediately upon receiving complaint",
          "Select appropriate final response template based on investigation findings",
          "Apply QA checklist before sending any customer communication",
          "Log root cause data for MI reporting",
        ],
        features: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Consumer Credit Firms",
        icon: "Scale",
        scenario: "Handling complaints related to lending decisions, affordability assessments, and collections practices.",
        workflow: [
          "Reference CONC requirements in investigation process",
          "Use partially upheld template for affordability complaints",
          "Document root cause analysis for trend identification",
          "Apply vulnerable customer guidance for financial difficulty cases",
        ],
        features: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Insurance Companies",
        icon: "Shield",
        scenario: "Responding to claims disputes, policy coverage questions, and pricing complaints.",
        workflow: [
          "Adapt templates for claims-specific complaints",
          "Include technical policy explanation sections",
          "Reference ICOBS requirements where relevant",
          "Track complaints by product line for governance reporting",
        ],
        features: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        persona: "Investment Firms with Retail Customers",
        icon: "BarChart3",
        scenario: "Addressing complaints about investment performance, suitability, and advisory services.",
        workflow: [
          "Apply suitability framework to investigation",
          "Calculate redress using FCA methodology",
          "Document investment advice review process",
          "Escalate systemic issues to compliance",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        persona: "Payment Service Providers",
        icon: "Rocket",
        scenario: "Managing complaints about transaction failures, fraud claims, and service outages.",
        workflow: [
          "Apply PSR-specific timelines for payment complaints",
          "Use expedited summary resolution for simple issues",
          "Document fraud investigation outcomes",
          "Track operational incidents linked to complaints",
        ],
        features: [
          { slug: "safeguarding", label: "Safeguarding" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
    ],
    implementationSequence: [
      {
        phase: "Setup & Configuration",
        items: [
          "Customise templates with firm-specific branding and contact details",
          "Configure complaint categories and escalation thresholds",
          "Set up QA review workflows and approval chains",
        ],
      },
      {
        phase: "Team Training",
        items: [
          "Train complaints handlers on template selection and customisation",
          "Brief QA reviewers on checklist usage",
          "Communicate escalation procedures to all relevant staff",
        ],
      },
      {
        phase: "Go-Live & Monitoring",
        items: [
          "Launch templates for new complaints",
          "Monitor response quality through QA process",
          "Track root cause data for trend analysis",
        ],
      },
      {
        phase: "Continuous Improvement",
        items: [
          "Review template effectiveness quarterly",
          "Update based on FOS feedback and regulatory changes",
          "Feed insights into Consumer Duty outcome monitoring",
        ],
      },
    ],
    relatedLinks: {
      feature: { label: "Policy Management", href: "/features/policy-management" },
      solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
      audience: { label: "Consumer Finance", href: "/audience/consumer" },
    },
  },

  "consumer-duty-mi-pack": {
    overview: "A structured MI pack designed to evidence Consumer Duty compliance through outcome-focused metrics. This template provides a comprehensive framework for tracking, analysing, and reporting on customer outcomes across products and services, with board-ready summary views that demonstrate your firm's commitment to delivering good outcomes.",
    keyBenefits: [
      "Demonstrate Consumer Duty compliance to the FCA with structured evidence",
      "Identify outcome gaps before they become regulatory issues",
      "Provide clear governance reporting to board and committees",
      "Track fair value across product portfolios systematically",
      "Enable proactive remediation through trend analysis",
      "Support annual Consumer Duty review requirements",
    ],
    items: [
      {
        id: "cdmi-1",
        title: "Executive Summary Dashboard",
        category: "reporting",
        description: "High-level dashboard showing Consumer Duty performance across all four outcomes with RAG status.",
        purpose: "Provides board and senior management with at-a-glance view of Consumer Duty compliance status and areas requiring attention.",
        sequence: 1,
        customizationNotes: [
          "Align RAG thresholds to your risk appetite",
          "Include trend indicators for key metrics",
          "Highlight actions required for amber/red ratings",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "cdmi-2",
        title: "Products & Services Outcome Tracker",
        category: "reporting",
        description: "Detailed tracker for monitoring whether products and services meet customer needs and are fit for purpose.",
        purpose: "Evidences that products are designed to meet identified customer needs and perform as expected.",
        sequence: 2,
        customizationNotes: [
          "Map products to target markets",
          "Track distribution channel performance",
          "Monitor product lifecycle outcomes",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cdmi-3",
        title: "Price & Value Assessment Matrix",
        category: "reporting",
        description: "Framework for assessing whether products and services represent fair value for customers.",
        purpose: "Demonstrates systematic assessment of value across product features, pricing, and customer segments.",
        sequence: 3,
        customizationNotes: [
          "Include manufacturing and distribution cost analysis",
          "Compare against market benchmarks",
          "Document value assessment rationale",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "cdmi-4",
        title: "Consumer Understanding Metrics",
        category: "reporting",
        description: "Template for tracking how well customers understand products, including communications testing outcomes.",
        purpose: "Provides evidence that communications are clear and customers can make informed decisions.",
        sequence: 4,
        customizationNotes: [
          "Include readability score tracking",
          "Monitor customer comprehension testing results",
          "Track communication channel effectiveness",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cdmi-5",
        title: "Consumer Support Performance Tracker",
        category: "reporting",
        description: "Metrics template for monitoring customer support quality and accessibility.",
        purpose: "Demonstrates that customers receive support that meets their needs throughout the product lifecycle.",
        sequence: 5,
        customizationNotes: [
          "Track response times by channel",
          "Monitor first-contact resolution rates",
          "Include accessibility metrics for vulnerable customers",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cdmi-6",
        title: "Quarterly Trend Analysis Template",
        category: "reporting",
        description: "Template for analysing Consumer Duty metrics over time to identify emerging issues.",
        purpose: "Enables early identification of declining outcomes and supports proactive remediation.",
        sequence: 6,
        customizationNotes: [
          "Set up automated trend calculations",
          "Include statistical significance thresholds",
          "Link trends to action plans",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "cdmi-7",
        title: "Board Report Structure",
        category: "governance",
        description: "Structured template for presenting Consumer Duty outcomes to the board.",
        purpose: "Supports board oversight responsibilities and demonstrates governance engagement with Consumer Duty.",
        sequence: 7,
        customizationNotes: [
          "Align to board meeting cadence",
          "Include escalation recommendations",
          "Document board challenges and decisions",
        ],
        relatedFeatures: [
          { slug: "smcr-management", label: "SM&CR Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cdmi-8",
        title: "Committee MI Pack",
        category: "governance",
        description: "Detailed MI pack for risk, audit, and product governance committees.",
        purpose: "Provides committees with detailed information to discharge their Consumer Duty oversight responsibilities.",
        sequence: 8,
        customizationNotes: [
          "Tailor detail level to committee requirements",
          "Include deep-dive sections for areas of concern",
          "Track committee action items",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        id: "cdmi-9",
        title: "Fair Value Assessment Framework",
        category: "governance",
        description: "Documented framework for conducting and evidencing fair value assessments.",
        purpose: "Provides structured approach to fair value assessment that can be evidenced to regulators.",
        sequence: 9,
        customizationNotes: [
          "Define assessment criteria and methodology",
          "Include approval workflows",
          "Document remediation requirements",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cdmi-10",
        title: "Vulnerable Customer Outcome Analysis",
        category: "governance",
        description: "Framework for analysing outcomes specifically for vulnerable customer segments.",
        purpose: "Demonstrates that vulnerable customers achieve outcomes as good as other customers.",
        sequence: 10,
        customizationNotes: [
          "Segment by vulnerability type",
          "Compare outcomes against general population",
          "Identify and address outcome gaps",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cdmi-11",
        title: "Consumer Duty Evidence Checklist",
        category: "checklist",
        description: "Comprehensive checklist of evidence required to demonstrate Consumer Duty compliance.",
        purpose: "Ensures all required evidence is captured and maintained for regulatory scrutiny.",
        sequence: 11,
        customizationNotes: [
          "Map to FCA expectations",
          "Include document retention requirements",
          "Track evidence availability by outcome",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "cdmi-12",
        title: "Annual Review Preparation Guide",
        category: "checklist",
        description: "Checklist and guide for preparing the annual Consumer Duty compliance review.",
        purpose: "Supports systematic preparation of the annual review required by Consumer Duty rules.",
        sequence: 12,
        customizationNotes: [
          "Align timing to fiscal year",
          "Include board presentation requirements",
          "Document year-on-year comparisons",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
    ],
    useCases: [
      {
        persona: "Compliance Teams",
        icon: "Shield",
        scenario: "Building and maintaining Consumer Duty MI framework and coordinating evidence capture.",
        workflow: [
          "Set up MI templates aligned to four outcomes",
          "Coordinate data collection from business areas",
          "Analyse trends and identify gaps",
          "Prepare board and committee reports",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        persona: "Product Governance Functions",
        icon: "Target",
        scenario: "Ensuring products deliver fair value and meet target market needs throughout lifecycle.",
        workflow: [
          "Use fair value framework for product assessments",
          "Track products & services outcomes",
          "Feed MI into product review processes",
          "Document remediation actions",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        persona: "Board Members",
        icon: "Users",
        scenario: "Discharging Consumer Duty oversight responsibilities with clear, actionable information.",
        workflow: [
          "Review executive summary dashboard",
          "Challenge management on amber/red areas",
          "Approve remediation plans",
          "Sign off annual review",
        ],
        features: [
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        persona: "Risk & Conduct Teams",
        icon: "Scale",
        scenario: "Integrating Consumer Duty outcomes into conduct risk framework and monitoring.",
        workflow: [
          "Map Consumer Duty metrics to conduct risk indicators",
          "Analyse trends for emerging risks",
          "Escalate significant issues",
          "Support thematic reviews",
        ],
        features: [
          { slug: "risk-assessment", label: "Risk Assessment" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "MI Analysts",
        icon: "BarChart3",
        scenario: "Collecting, validating, and presenting Consumer Duty data from multiple sources.",
        workflow: [
          "Configure data collection from source systems",
          "Apply validation and quality checks",
          "Calculate metrics and trends",
          "Produce reports for various audiences",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
    ],
    implementationSequence: [
      {
        phase: "Framework Design",
        items: [
          "Define metrics for each Consumer Duty outcome",
          "Identify data sources and collection methods",
          "Set RAG thresholds aligned to risk appetite",
        ],
      },
      {
        phase: "Data Integration",
        items: [
          "Connect to source systems for automated data feeds",
          "Establish data quality controls",
          "Build calculation logic for derived metrics",
        ],
      },
      {
        phase: "Reporting Setup",
        items: [
          "Configure dashboard visualisations",
          "Set up committee and board report templates",
          "Establish reporting calendar",
        ],
      },
      {
        phase: "Governance Integration",
        items: [
          "Train committees on MI interpretation",
          "Embed MI into decision-making processes",
          "Set up escalation and action tracking",
        ],
      },
    ],
    relatedLinks: {
      feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
      solution: { label: "Consumer Duty", href: "/solutions/consumer-duty" },
      audience: { label: "Banks & Credit", href: "/audience/banks" },
    },
  },

  "vulnerable-customers-framework-pack": {
    overview: "A comprehensive framework pack for identifying, supporting, and monitoring outcomes for vulnerable customers. This pack provides the tools, checklists, and templates needed to embed vulnerable customer considerations across your organisation, from frontline staff interactions through to board-level reporting on outcomes.",
    keyBenefits: [
      "Systematically identify vulnerability indicators using proven frameworks",
      "Equip frontline staff with practical conversation guidance",
      "Track and evidence reasonable adjustments for regulatory scrutiny",
      "Monitor outcomes for vulnerable customers vs general population",
      "Support Consumer Duty compliance for cross-cutting rules",
      "Build staff competency through structured training assessment",
    ],
    items: [
      {
        id: "vcf-1",
        title: "Customer Needs Assessment Form",
        category: "document",
        description: "Structured form for capturing customer needs, circumstances, and support requirements.",
        purpose: "Enables systematic capture of customer information to inform appropriate adjustments and support.",
        sequence: 1,
        customizationNotes: [
          "Adapt questions to your product/service context",
          "Include consent capture for sensitive information",
          "Link to CRM systems for customer record updates",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "vcf-2",
        title: "Reasonable Adjustments Agreement",
        category: "document",
        description: "Template agreement documenting adjustments made for individual customers.",
        purpose: "Provides clear record of adjustments agreed, ensuring consistency and evidencing support provided.",
        sequence: 2,
        customizationNotes: [
          "List standard adjustment options",
          "Include review date triggers",
          "Document customer agreement",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "vcf-3",
        title: "Specialist Referral Request Form",
        category: "document",
        description: "Form for referring vulnerable customers to specialist support teams or external services.",
        purpose: "Ensures appropriate escalation and handover when specialist support is needed.",
        sequence: 3,
        customizationNotes: [
          "Include internal and external referral options",
          "Capture urgency indicators",
          "Track referral outcomes",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "vcf-4",
        title: "Outcome Review Documentation",
        category: "document",
        description: "Template for documenting periodic review of outcomes for vulnerable customers.",
        purpose: "Supports ongoing monitoring of whether adjustments are achieving intended outcomes.",
        sequence: 4,
        customizationNotes: [
          "Set appropriate review frequencies",
          "Include customer feedback capture",
          "Link to outcome metrics",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "vcf-5",
        title: "Vulnerability Identification Indicators (TEXAS)",
        category: "checklist",
        description: "Checklist based on TEXAS model for identifying potential vulnerability indicators.",
        purpose: "Provides structured approach to recognising vulnerability across health, life events, resilience, and capability.",
        sequence: 5,
        customizationNotes: [
          "Add industry-specific indicators",
          "Include training examples",
          "Link to conversation prompts",
        ],
        relatedFeatures: [
          { slug: "training-library", label: "Training Library" },
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "vcf-6",
        title: "Conversation Prompt Cards",
        category: "checklist",
        description: "Practical conversation prompts for frontline staff when speaking with potentially vulnerable customers.",
        purpose: "Equips staff with appropriate language and questions to explore vulnerability sensitively.",
        sequence: 6,
        customizationNotes: [
          "Tailor language to your brand voice",
          "Include scenario-specific variations",
          "Provide do's and don'ts guidance",
        ],
        relatedFeatures: [
          { slug: "training-library", label: "Training Library" },
        ],
      },
      {
        id: "vcf-7",
        title: "Reasonable Adjustments Options Matrix",
        category: "checklist",
        description: "Matrix of available adjustments mapped to vulnerability types and customer needs.",
        purpose: "Helps staff quickly identify appropriate adjustments for different vulnerability scenarios.",
        sequence: 7,
        customizationNotes: [
          "Map adjustments to your service capabilities",
          "Include technology-enabled options",
          "Document approval requirements",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "vcf-8",
        title: "Quality Assurance Review Checklist",
        category: "checklist",
        description: "QA checklist for reviewing handling of vulnerable customer interactions.",
        purpose: "Ensures consistent quality standards in vulnerable customer support across the organisation.",
        sequence: 8,
        customizationNotes: [
          "Include empathy and tone assessment",
          "Check adjustment implementation",
          "Track QA outcomes for training needs",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "vcf-9",
        title: "Vulnerable Customer Policy Summary",
        category: "governance",
        description: "One-page policy summary for quick reference on vulnerable customer requirements.",
        purpose: "Provides accessible summary of firm's vulnerable customer approach for all staff.",
        sequence: 9,
        customizationNotes: [
          "Include key principles and escalation routes",
          "Make available across all channels",
          "Update with regulatory changes",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "vcf-10",
        title: "Escalation & Specialist Referral Procedure",
        category: "governance",
        description: "Documented procedure for escalating complex vulnerability cases.",
        purpose: "Ensures appropriate cases reach specialist support and senior oversight.",
        sequence: 10,
        customizationNotes: [
          "Define escalation triggers",
          "Include timeframe requirements",
          "Document specialist team capabilities",
        ],
        relatedFeatures: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        id: "vcf-11",
        title: "Board Reporting Template (Vulnerable Customer Outcomes)",
        category: "governance",
        description: "Board report template focused on vulnerable customer outcomes and risk indicators.",
        purpose: "Supports board oversight of vulnerable customer treatment and Consumer Duty compliance.",
        sequence: 11,
        customizationNotes: [
          "Include outcome comparisons",
          "Highlight areas of concern",
          "Track improvement actions",
        ],
        relatedFeatures: [
          { slug: "smcr-management", label: "SM&CR Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "vcf-12",
        title: "Outcome Monitoring Dashboard Template",
        category: "reporting",
        description: "Dashboard template for tracking vulnerable customer outcomes across key metrics.",
        purpose: "Enables systematic monitoring of whether vulnerable customers achieve good outcomes.",
        sequence: 12,
        customizationNotes: [
          "Compare against non-vulnerable baseline",
          "Track by vulnerability type",
          "Include early warning indicators",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "vcf-13",
        title: "Training Competency Tracker",
        category: "reporting",
        description: "Template for tracking staff completion of vulnerable customer training and competency assessments.",
        purpose: "Ensures all relevant staff are trained and competent in vulnerable customer handling.",
        sequence: 13,
        customizationNotes: [
          "Set role-based training requirements",
          "Include refresher training triggers",
          "Track assessment scores",
        ],
        relatedFeatures: [
          { slug: "training-library", label: "Training Library" },
        ],
      },
      {
        id: "vcf-14",
        title: "Quarterly Trend Analysis (by Vulnerability Type)",
        category: "reporting",
        description: "Template for analysing vulnerable customer trends and emerging issues.",
        purpose: "Identifies patterns and emerging risks to enable proactive response.",
        sequence: 14,
        customizationNotes: [
          "Segment by vulnerability driver",
          "Include external factor correlation",
          "Link to action planning",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
    ],
    useCases: [
      {
        persona: "Customer Service Teams & Frontline Staff",
        icon: "Users",
        scenario: "Identifying vulnerability indicators and providing appropriate support during customer interactions.",
        workflow: [
          "Use TEXAS checklist to identify potential vulnerability",
          "Refer to conversation prompt cards for sensitive discussions",
          "Complete needs assessment form",
          "Document reasonable adjustments agreed",
        ],
        features: [
          { slug: "training-library", label: "Training Library" },
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        persona: "Complaints Handlers",
        icon: "FileCheck",
        scenario: "Managing complaints from vulnerable customers with appropriate adjustments and support.",
        workflow: [
          "Check for existing vulnerability flags on customer record",
          "Apply reasonable adjustments to complaints process",
          "Use QA checklist for vulnerable customer cases",
          "Escalate complex cases to specialist support",
        ],
        features: [
          { slug: "policy-management", label: "Policy Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Product Governance Teams",
        icon: "Target",
        scenario: "Assessing product impact on vulnerable customers and ensuring fair value.",
        workflow: [
          "Include vulnerability assessment in product reviews",
          "Analyse outcome data by customer segment",
          "Identify features that may disadvantage vulnerable customers",
          "Document remediation actions",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Compliance Teams",
        icon: "Shield",
        scenario: "Monitoring Consumer Duty compliance for vulnerable customer outcomes.",
        workflow: [
          "Configure outcome monitoring dashboard",
          "Analyse trends by vulnerability type",
          "Prepare board and committee reports",
          "Coordinate regulatory responses",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        persona: "Training Managers",
        icon: "ClipboardList",
        scenario: "Ensuring staff competency in vulnerable customer identification and support.",
        workflow: [
          "Assign role-appropriate training modules",
          "Track completion using competency tracker",
          "Analyse QA data for training gaps",
          "Update training based on emerging issues",
        ],
        features: [
          { slug: "training-library", label: "Training Library" },
        ],
      },
    ],
    implementationSequence: [
      {
        phase: "Foundation",
        items: [
          "Adopt TEXAS framework and customise indicators",
          "Set up vulnerability flagging in customer records",
          "Document available reasonable adjustments",
        ],
      },
      {
        phase: "Staff Enablement",
        items: [
          "Roll out training with conversation prompts",
          "Deploy needs assessment forms",
          "Brief specialist support teams",
        ],
      },
      {
        phase: "Process Integration",
        items: [
          "Embed vulnerability checks in key journeys",
          "Implement QA processes for vulnerable customer cases",
          "Set up escalation procedures",
        ],
      },
      {
        phase: "Monitoring & Reporting",
        items: [
          "Configure outcome monitoring dashboard",
          "Establish board reporting cadence",
          "Track and act on outcome disparities",
        ],
      },
    ],
    relatedLinks: {
      feature: { label: "Policy Management", href: "/features/policy-management" },
      solution: { label: "Consumer Duty", href: "/solutions/consumer-duty" },
      audience: { label: "Consumer Finance", href: "/audience/consumer" },
    },
  },

  "compliance-monitoring-plan-pack": {
    overview: "A complete toolkit for designing, executing, and reporting on your Compliance Monitoring Plan. This pack provides templates and frameworks for the full CMP lifecycle - from mapping your regulatory universe through to effectiveness reviews. Built for second line compliance teams who need to demonstrate robust monitoring of first line controls.",
    keyBenefits: [
      "Map your complete regulatory universe to monitoring activities",
      "Prioritise monitoring effort using risk-based approach",
      "Standardise testing procedures across control types",
      "Capture and classify findings consistently",
      "Track remediation through to closure",
      "Demonstrate CMP effectiveness to regulators",
    ],
    items: [
      {
        id: "cmp-1",
        title: "Monitoring Universe Template",
        category: "document",
        description: "Template for mapping regulatory obligations to business activities and monitoring requirements.",
        purpose: "Ensures comprehensive coverage of all relevant obligations in the monitoring plan.",
        sequence: 1,
        customizationNotes: [
          "Map to your regulatory permissions and activities",
          "Include cross-references to policies",
          "Document obligation owners",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "policy-management", label: "Policy Management" },
        ],
      },
      {
        id: "cmp-2",
        title: "Testing Procedure Library",
        category: "document",
        description: "Library of standardised testing procedures for common control types and compliance areas.",
        purpose: "Provides consistent, repeatable testing methodology across the compliance team.",
        sequence: 2,
        customizationNotes: [
          "Adapt procedures to your control environment",
          "Include sample selection guidance",
          "Document expected evidence",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-3",
        title: "Evidence Capture Workpaper Templates",
        category: "document",
        description: "Standardised workpaper templates for documenting testing procedures, samples, and conclusions.",
        purpose: "Ensures audit-ready documentation of all monitoring activities.",
        sequence: 3,
        customizationNotes: [
          "Include cross-references to test procedures",
          "Document sample selection rationale",
          "Capture review and approval",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-4",
        title: "Finding Write-up Templates",
        category: "document",
        description: "Templates for documenting findings at different severity levels with appropriate detail.",
        purpose: "Ensures findings are communicated clearly with appropriate context and recommendations.",
        sequence: 4,
        customizationNotes: [
          "Align to your finding classification framework",
          "Include root cause analysis prompts",
          "Document management response requirements",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "cmp-5",
        title: "Remediation Action Plan Template",
        category: "document",
        description: "Template for documenting agreed remediation actions, owners, and timescales.",
        purpose: "Tracks remediation from finding to closure with appropriate evidence.",
        sequence: 5,
        customizationNotes: [
          "Include escalation triggers for overdue actions",
          "Document evidence requirements for closure",
          "Track action dependencies",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-6",
        title: "Risk Assessment Scoring Matrix",
        category: "checklist",
        description: "Matrix for scoring inherent and residual risk to prioritise monitoring activities.",
        purpose: "Enables risk-based prioritisation of monitoring effort and resource allocation.",
        sequence: 6,
        customizationNotes: [
          "Calibrate scoring to your risk appetite",
          "Include impact and likelihood criteria",
          "Document scoring rationale requirements",
        ],
        relatedFeatures: [
          { slug: "risk-assessment", label: "Risk Assessment" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-7",
        title: "Testing Quality Assurance Checklist",
        category: "checklist",
        description: "QA checklist for reviewing completed monitoring work before finalisation.",
        purpose: "Ensures testing quality and consistency across the compliance team.",
        sequence: 7,
        customizationNotes: [
          "Include methodology compliance checks",
          "Verify evidence sufficiency",
          "Check conclusion consistency",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-8",
        title: "Finding Classification Framework",
        category: "checklist",
        description: "Framework for classifying finding severity and regulatory significance.",
        purpose: "Ensures consistent finding classification to support appropriate escalation and reporting.",
        sequence: 8,
        customizationNotes: [
          "Define severity criteria specific to your firm",
          "Include regulatory breach indicators",
          "Document escalation requirements by severity",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        id: "cmp-9",
        title: "Annual CMP Review Checklist",
        category: "checklist",
        description: "Checklist for conducting annual review of CMP coverage, methodology, and effectiveness.",
        purpose: "Supports systematic annual review and refresh of the compliance monitoring approach.",
        sequence: 9,
        customizationNotes: [
          "Include regulatory change impact assessment",
          "Review coverage against risk profile",
          "Document methodology improvements",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-10",
        title: "CMP Governance Framework Document",
        category: "governance",
        description: "Document setting out CMP governance, roles, responsibilities, and reporting lines.",
        purpose: "Establishes clear accountability and governance for compliance monitoring activities.",
        sequence: 10,
        customizationNotes: [
          "Align to three lines of defence model",
          "Document committee reporting requirements",
          "Include SMF accountability mapping",
        ],
        relatedFeatures: [
          { slug: "smcr-management", label: "SM&CR Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-11",
        title: "Committee Reporting Pack Template",
        category: "governance",
        description: "Template for quarterly CMP progress reporting to risk and audit committees.",
        purpose: "Provides consistent, comprehensive committee reporting on monitoring activities.",
        sequence: 11,
        customizationNotes: [
          "Include progress against plan",
          "Summarise significant findings",
          "Track remediation status",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        id: "cmp-12",
        title: "Board Annual Compliance Report Structure",
        category: "governance",
        description: "Structure for the annual compliance report to the board covering CMP outcomes.",
        purpose: "Supports board oversight with comprehensive annual view of compliance monitoring.",
        sequence: 12,
        customizationNotes: [
          "Include year-on-year comparisons",
          "Highlight key themes and trends",
          "Document forward-looking priorities",
        ],
        relatedFeatures: [
          { slug: "smcr-management", label: "SM&CR Management" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-13",
        title: "Monthly Monitoring Tracker Dashboard",
        category: "reporting",
        description: "Dashboard template for tracking CMP execution progress and key metrics.",
        purpose: "Enables real-time visibility of monitoring progress and emerging issues.",
        sequence: 13,
        customizationNotes: [
          "Track plan completion percentage",
          "Monitor finding trends",
          "Flag overdue testing",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-14",
        title: "Quarterly Governance MI Template",
        category: "reporting",
        description: "MI template for quarterly governance reporting on CMP activities and outcomes.",
        purpose: "Provides management with actionable information on compliance monitoring performance.",
        sequence: 14,
        customizationNotes: [
          "Include resource utilisation metrics",
          "Track finding resolution rates",
          "Highlight areas of concern",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        id: "cmp-15",
        title: "CMP Effectiveness Metrics Template",
        category: "reporting",
        description: "Template for measuring and reporting on overall CMP effectiveness.",
        purpose: "Demonstrates value of compliance monitoring and supports continuous improvement.",
        sequence: 15,
        customizationNotes: [
          "Define effectiveness KPIs",
          "Include leading and lagging indicators",
          "Benchmark against prior periods",
        ],
        relatedFeatures: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "risk-assessment", label: "Risk Assessment" },
        ],
      },
    ],
    useCases: [
      {
        persona: "Compliance Monitoring Teams",
        icon: "ClipboardList",
        scenario: "Planning, executing, and documenting day-to-day compliance monitoring activities.",
        workflow: [
          "Reference monitoring universe for test selection",
          "Use procedure library for testing methodology",
          "Document work in standardised workpapers",
          "Classify and report findings consistently",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Head of Compliance",
        icon: "Shield",
        scenario: "Overseeing CMP design, resource allocation, and regulatory relationships.",
        workflow: [
          "Review risk-based prioritisation annually",
          "Monitor progress through dashboard",
          "Approve significant findings and escalations",
          "Present to board and committees",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
      {
        persona: "Second Line Risk Functions",
        icon: "Scale",
        scenario: "Providing independent challenge to compliance monitoring approach and findings.",
        workflow: [
          "Review CMP coverage and methodology",
          "Challenge finding classifications",
          "Assess remediation adequacy",
          "Input to effectiveness reviews",
        ],
        features: [
          { slug: "risk-assessment", label: "Risk Assessment" },
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Internal Audit Teams",
        icon: "FileCheck",
        scenario: "Assessing CMP design and operating effectiveness as part of audit universe.",
        workflow: [
          "Review CMP governance framework",
          "Test sample of monitoring workpapers",
          "Assess finding classification consistency",
          "Evaluate effectiveness metrics",
        ],
        features: [
          { slug: "compliance-monitoring", label: "Compliance Monitoring" },
        ],
      },
      {
        persona: "Board Risk Committees",
        icon: "Users",
        scenario: "Providing oversight of compliance monitoring programme and outcomes.",
        workflow: [
          "Review quarterly committee packs",
          "Challenge significant findings",
          "Monitor remediation progress",
          "Approve annual compliance report",
        ],
        features: [
          { slug: "smcr-management", label: "SM&CR Management" },
        ],
      },
    ],
    implementationSequence: [
      {
        phase: "Foundation",
        items: [
          "Map regulatory universe to monitoring requirements",
          "Complete risk assessment and prioritisation",
          "Document CMP governance framework",
        ],
      },
      {
        phase: "Methodology Development",
        items: [
          "Develop testing procedure library",
          "Create workpaper templates",
          "Establish finding classification framework",
        ],
      },
      {
        phase: "Execution Setup",
        items: [
          "Build annual monitoring plan",
          "Configure tracking dashboard",
          "Train team on procedures and templates",
        ],
      },
      {
        phase: "Reporting & Review",
        items: [
          "Implement governance reporting cadence",
          "Establish QA review process",
          "Schedule annual effectiveness review",
        ],
      },
    ],
    relatedLinks: {
      feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
      solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
      audience: { label: "Banks & Credit", href: "/audience/banks" },
    },
  },
}

export function getTemplateContent(slug: string): TemplatePackContent | null {
  return TEMPLATE_PACKS[slug] || null
}
