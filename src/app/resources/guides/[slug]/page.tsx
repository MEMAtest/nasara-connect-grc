import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RESOURCE_GUIDES } from "@/lib/seo/marketing-data";
import { GuidePageClient } from "./GuidePageClient";

type PageProps = { params: Promise<{ slug: string }> };

const RELATED_LINKS: Record<
  string,
  {
    feature: { label: string; href: string };
    solution: { label: string; href: string };
    audience: { label: string; href: string };
  }
> = {
  "fca-authorisation-checklist": {
    feature: { label: "Authorization Pack", href: "/features/authorization-pack" },
    solution: { label: "FCA Authorisation", href: "/solutions/fca-authorisation" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
  "compliance-monitoring-plan-template": {
    feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
    solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
    audience: { label: "Banks & Credit", href: "/audience/banks" },
  },
  "safeguarding-reconciliation-guide": {
    feature: { label: "Safeguarding", href: "/features/safeguarding" },
    solution: { label: "Safeguarding", href: "/solutions/safeguarding" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
};

function getGuideContent(slug: string) {
  switch (slug) {
    case "fca-authorisation-checklist":
      return {
        overview: "A comprehensive guide to preparing your FCA authorisation application. This checklist covers all key areas the FCA assesses, from governance and ownership through to systems, controls, and consumer protection. Designed to help applicants avoid common pitfalls and reduce time to authorisation.",
        chapters: [
          {
            title: "Scoping Your Application",
            description: "Identify the regulated activities and permissions you need based on your business model.",
            content: [
              "Before any substantive work begins on an authorisation application, firms must carefully scope the permissions they need. This involves mapping your proposed business activities against the Financial Services and Markets Act 2000 (Regulated Activities) Order 2001 (RAO) to identify which regulated activities you'll be conducting.",
              "The consequences of incorrectly scoping permissions can be severe. Apply for too few permissions and you risk conducting unauthorised business. Apply for too many and you'll face unnecessary capital requirements, reporting obligations, and regulatory scrutiny.",
              "Consider not just your initial business model but your medium-term growth plans. Adding permissions later through a Variation of Permission (VoP) application takes time and creates regulatory overhead. However, don't apply for speculative permissions you may never use.",
            ],
            keyPoints: [
              "Map your business activities precisely to RAO permissions",
              "Consider adjacent activities that may fall outside regulatory scope",
              "Engage with FCA Perimeter Enquiries if scope is ambiguous",
              "Balance current needs against realistic future growth plans",
            ],
            nasaraFeature: "authorization-pack",
          },
          {
            title: "Governance Framework",
            description: "Structure your board, committees, and reporting lines to meet FCA expectations.",
            content: [
              "The FCA expects all authorised firms to have governance arrangements appropriate to the nature, scale, and complexity of their business. For new applicants, this means demonstrating that you have, or will have in place, robust governance structures before you begin conducting regulated business.",
              "At minimum, the FCA expects a clear board structure with defined roles and responsibilities, appropriate committees (such as audit and risk committees for larger firms), documented terms of reference, and clear reporting lines between the board, senior management, and operational functions.",
              "Your governance framework should enable effective challenge and oversight. Non-executive directors, where appointed, should have genuine independence and the experience to provide meaningful scrutiny of executive decisions.",
            ],
            keyPoints: [
              "Define clear roles and responsibilities at board level",
              "Establish appropriate committee structures for your firm size",
              "Document terms of reference and reporting lines",
              "Ensure genuine independence where non-executives are appointed",
            ],
            nasaraFeature: "authorization-pack",
          },
          {
            title: "Senior Management",
            description: "Prepare SM&CR documentation including Statements of Responsibilities.",
            content: [
              "The Senior Managers and Certification Regime (SM&CR) requires firms to allocate clear responsibilities to their senior managers and ensure they are fit and proper to hold their positions. For new authorisation applications, you must identify who will hold each required Senior Management Function (SMF).",
              "At minimum, most firms need to appoint individuals to the SMF1 (Chief Executive), SMF3 (Executive Director), SMF16 (Compliance Oversight), SMF17 (Money Laundering Reporting Officer), and SMF9 (Chair) functions. The specific requirements depend on your firm type and permissions.",
              "Each senior manager needs a Statement of Responsibilities (SoR) that clearly describes their individual accountability. These statements should be specific enough to identify who is responsible for what, avoiding vague or overlapping descriptions.",
            ],
            keyPoints: [
              "Identify required Senior Management Functions for your firm type",
              "Prepare detailed Statements of Responsibilities for each SMF holder",
              "Ensure all proposed senior managers meet fit and proper requirements",
              "Document management responsibilities maps showing accountability",
            ],
            nasaraFeature: "smcr-management",
          },
          {
            title: "Policies and Procedures",
            description: "Develop the core policies required for your regulated activities.",
            content: [
              "The FCA requires authorised firms to have written policies and procedures covering all aspects of their regulated business. These documents should be proportionate to the firm's size and complexity but must address the key risk areas relevant to your business model.",
              "Core policies typically include: compliance monitoring programme, anti-money laundering and counter-terrorist financing procedures, conflicts of interest policy, complaints handling procedures, data protection policy, business continuity planning, and operational resilience frameworks.",
              "Your policies must be more than templates. They should reflect your actual business operations, risk profile, and the specific regulatory requirements that apply to your permissions. Generic policies that don't address your firm's reality are a common cause of FCA feedback and delays.",
            ],
            keyPoints: [
              "Develop policies tailored to your specific business model",
              "Ensure policies address all regulatory requirements for your permissions",
              "Build in review and update mechanisms from the start",
              "Create practical procedures staff can actually follow",
            ],
            nasaraFeature: "policy-management",
          },
          {
            title: "Financial Resources",
            description: "Calculate capital requirements and demonstrate ongoing adequacy.",
            content: [
              "Financial resource requirements vary significantly depending on your firm type and permissions. At minimum, all FCA-authorised firms must maintain adequate resources to meet their liabilities as they fall due. Many firm types have specific minimum capital requirements.",
              "Payment institutions and e-money institutions must calculate their capital requirements based on payment volumes and safeguarding obligations. Investment firms have specific prudential requirements under the Investment Firms Prudential Regime (IFPR).",
              "Beyond meeting minimum requirements, firms must demonstrate they have realistic financial projections showing how they will remain adequately capitalised during the initial years of operation, typically covering at least three years of forecasts.",
            ],
            keyPoints: [
              "Calculate specific capital requirements for your firm type",
              "Prepare realistic three-year financial projections",
              "Demonstrate adequate buffers above minimum requirements",
              "Document your approach to ongoing capital monitoring",
            ],
            nasaraFeature: "authorization-pack",
          },
          {
            title: "Systems and Controls",
            description: "Document your operational, technology, and financial crime controls.",
            content: [
              "The FCA's Principles for Business require firms to take reasonable care to organise and control their affairs responsibly and effectively, with adequate risk management systems. Your application must demonstrate you have appropriate systems and controls for your regulated activities.",
              "Key areas include: operational controls covering day-to-day business processes, technology systems and cybersecurity, financial crime prevention including AML, sanctions, and fraud, record keeping and documentation, and management information and reporting.",
              "Controls should be designed around your specific risk profile. A payment service provider processing high volumes needs different controls than a small advice firm. The FCA assesses whether your controls are proportionate and effective, not just whether they exist.",
            ],
            keyPoints: [
              "Design controls proportionate to your business risks",
              "Document technology systems and cybersecurity measures",
              "Establish robust financial crime prevention frameworks",
              "Create management information that enables oversight",
            ],
            nasaraFeature: "compliance-monitoring",
          },
          {
            title: "Consumer Protection",
            description: "Address Consumer Duty requirements and customer outcome considerations.",
            content: [
              "The Consumer Duty requires firms to act to deliver good outcomes for retail customers. For new authorisation applications submitted after the Duty came into force, you must demonstrate how your business model and operations will meet these requirements from day one.",
              "The four outcomes under the Duty cover: products and services (ensuring they meet customers' needs), price and value (fair pricing relative to benefits), consumer understanding (clear communications), and consumer support (accessible and effective service).",
              "Your application should show how you've designed your products, processes, and communications with the Duty in mind. This isn't about adding compliance processes after the fact but embedding customer outcomes thinking into your business design.",
            ],
            keyPoints: [
              "Design products and services to meet genuine customer needs",
              "Demonstrate fair value in your pricing approach",
              "Create clear, understandable customer communications",
              "Build accessible and effective customer support",
            ],
            nasaraFeature: "authorization-pack",
          },
          {
            title: "Application Submission",
            description: "Navigate the Connect portal and manage the assessment process.",
            content: [
              "FCA authorisation applications are submitted through the Connect portal. Before beginning your submission, ensure you have all required documents prepared, all proposed senior managers identified and ready to submit their individual applications, and a clear understanding of the applicable fees.",
              "The FCA aims to assess complete applications within statutory timeframes: 6 months for most firm types, 12 months for certain complex applications. However, incomplete applications or those requiring significant clarification can take considerably longer.",
              "Once submitted, expect the FCA to request additional information or clarification. Respond promptly and comprehensively to these requests. The assessment team may also request meetings to discuss aspects of your application, particularly for novel or complex business models.",
            ],
            keyPoints: [
              "Prepare all documentation before beginning the Connect submission",
              "Submit complete applications to avoid delays",
              "Respond promptly to FCA information requests",
              "Prepare for potential assessment meetings",
            ],
            nasaraFeature: "authorization-pack",
          },
        ],
        useCases: [
          {
            persona: "Fintech founders preparing for FCA authorisation",
            icon: "Rocket",
            scenario: "You're building a payments app or financial product and need FCA authorisation to launch in the UK market.",
            workflow: [
              "Use the readiness assessment to identify gaps in your application preparation",
              "Generate governance documentation with AI-assisted policy drafting",
              "Track evidence collection across all application areas with progress checkpoints",
              "Export FCA-ready documentation pack for your Connect submission",
            ],
            features: [
              { slug: "authorization-pack", label: "Authorization Pack" },
              { slug: "policy-management", label: "Policy Management" },
              { slug: "ai-assistant", label: "AI Assistant" },
            ],
            testimonialQuote: "From gap analysis to submission in 8 weeks",
          },
          {
            persona: "Compliance consultants supporting application projects",
            icon: "Scale",
            scenario: "You're advising clients on FCA authorisation applications and need structured project management tools.",
            workflow: [
              "Create client workspaces with pre-populated regulatory requirements",
              "Assign tasks and track deliverables across multiple stakeholders",
              "Use AI assistance to review and enhance client documentation",
              "Generate progress reports and board-ready summaries",
            ],
            features: [
              { slug: "authorization-pack", label: "Authorization Pack" },
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "reporting", label: "MI Reporting" },
            ],
            testimonialQuote: "Manage multiple client applications from one platform",
          },
          {
            persona: "Existing firms applying for variation of permission",
            icon: "Shield",
            scenario: "Your firm needs additional permissions to expand into new regulated activities or markets.",
            workflow: [
              "Assess current compliance framework against new permission requirements",
              "Identify gaps in policies, controls, and governance for the new activities",
              "Update existing documentation to cover expanded scope",
              "Prepare VoP application with supporting evidence",
            ],
            features: [
              { slug: "authorization-pack", label: "Authorization Pack" },
              { slug: "policy-management", label: "Policy Management" },
              { slug: "gap-analysis", label: "Gap Analysis" },
            ],
          },
          {
            persona: "Legal teams advising on regulatory strategy",
            icon: "Briefcase",
            scenario: "You're providing legal advice on regulatory perimeter questions and authorisation strategy.",
            workflow: [
              "Map proposed activities against RAO permissions with regulatory guidance",
              "Access up-to-date FCA rules and guidance for legal analysis",
              "Document regulatory advice with clear audit trails",
              "Collaborate with compliance teams on practical implementation",
            ],
            features: [
              { slug: "authorization-pack", label: "Authorization Pack" },
              { slug: "policy-management", label: "Policy Library" },
              { slug: "audit-trail", label: "Audit Trail" },
            ],
          },
          {
            persona: "Investors conducting regulatory due diligence",
            icon: "Target",
            scenario: "You're assessing a portfolio company's regulatory readiness as part of investment due diligence.",
            workflow: [
              "Review regulatory status and authorisation progress",
              "Assess compliance framework maturity against best practices",
              "Identify regulatory risks and remediation requirements",
              "Generate due diligence reports for investment committees",
            ],
            features: [
              { slug: "reporting", label: "MI Reporting" },
              { slug: "compliance-monitoring", label: "Compliance Assessment" },
              { slug: "gap-analysis", label: "Gap Analysis" },
            ],
          },
        ],
      };
    case "compliance-monitoring-plan-template":
      return {
        overview: "A practical framework for building and running an effective Compliance Monitoring Plan (CMP). This guide helps compliance teams design monitoring activities that provide genuine assurance, create defensible evidence, and support governance reporting across the firm.",
        chapters: [
          {
            title: "Monitoring Universe",
            description: "Map regulatory obligations to business activities requiring monitoring.",
            content: [
              "An effective Compliance Monitoring Plan starts with a comprehensive understanding of your regulatory obligations and how they map to your business activities. This 'monitoring universe' forms the foundation for all subsequent monitoring work.",
              "Begin by identifying all applicable regulatory requirements: FCA rules, relevant EU-retained legislation, industry codes, and internal policies that go beyond minimum regulatory requirements. Then map these obligations to specific business functions, processes, and teams.",
              "Your monitoring universe should be dynamic, not static. Build in mechanisms to capture new obligations arising from regulatory change, new products or services, or changes to your business model. A monitoring plan that doesn't evolve with your business quickly becomes ineffective.",
            ],
            keyPoints: [
              "Catalogue all applicable regulatory obligations",
              "Map obligations to specific business activities and owners",
              "Build in processes to capture regulatory change",
              "Review and update the monitoring universe at least annually",
            ],
            nasaraFeature: "compliance-monitoring",
          },
          {
            title: "Risk Assessment",
            description: "Prioritise monitoring activities based on inherent risk and control effectiveness.",
            content: [
              "Not all compliance risks are equal. Your monitoring plan should allocate resources based on a risk assessment that considers both the inherent risk of different activities and the effectiveness of existing controls.",
              "Inherent risk factors include: regulatory severity (potential enforcement outcomes), customer impact, reputational sensitivity, complexity of the underlying activity, and historical issues. Control effectiveness considers: design adequacy, operating effectiveness, automation vs manual processes, and previous monitoring findings.",
              "Use your risk assessment to determine monitoring frequency and depth. High-risk areas with less effective controls need more frequent, deeper monitoring. Lower-risk areas with strong controls may only need periodic light-touch reviews.",
            ],
            keyPoints: [
              "Assess inherent risk for each monitoring area",
              "Evaluate existing control effectiveness",
              "Calibrate monitoring frequency based on risk levels",
              "Document your risk assessment methodology",
            ],
            nasaraFeature: "risk-assessment",
          },
          {
            title: "Testing Design",
            description: "Create monitoring procedures that generate meaningful compliance evidence.",
            content: [
              "Effective compliance testing requires carefully designed procedures that will detect control failures and compliance breaches. Poor test design produces either false comfort (missing real issues) or excessive noise (flagging non-issues that waste investigation time).",
              "For each monitoring area, define: what you're testing (specific controls, processes, or outcomes), how you'll test (methodology and sampling approach), what evidence you'll gather, and what constitutes a finding requiring action.",
              "Consider a mix of testing approaches: detective testing (identifying issues after the fact), preventive testing (checking controls are operating correctly), and analytical monitoring (using data to identify patterns or anomalies).",
            ],
            keyPoints: [
              "Define clear testing objectives for each monitoring area",
              "Design appropriate sampling methodologies",
              "Specify evidence requirements and finding criteria",
              "Balance detective, preventive, and analytical approaches",
            ],
            nasaraFeature: "compliance-monitoring",
          },
          {
            title: "Execution Framework",
            description: "Establish cadence, ownership, and quality assurance processes.",
            content: [
              "A monitoring plan only creates value if it's actually executed. Establish a realistic annual monitoring schedule that allocates activities across the year, assigns clear ownership for each review, and includes quality assurance mechanisms.",
              "Consider resource constraints when building your schedule. Don't front-load the plan with ambitious Q1 activities that slip as the year progresses. Spread work evenly and build in contingency for unexpected demands on compliance resource.",
              "Quality assurance is essential. This might include: review of testing workpapers by senior compliance staff, periodic internal audit assessment of the monitoring function, and calibration exercises to ensure consistent application of finding ratings.",
            ],
            keyPoints: [
              "Create a realistic annual monitoring schedule",
              "Assign clear ownership for each monitoring activity",
              "Build in quality assurance review processes",
              "Track execution against plan throughout the year",
            ],
            nasaraFeature: "compliance-monitoring",
          },
          {
            title: "Evidence Management",
            description: "Document monitoring work to support audit and regulatory engagement.",
            content: [
              "Compliance monitoring generates evidence that serves multiple purposes: demonstrating the effectiveness of your compliance framework to regulators, supporting internal audit assurance, and providing the basis for management action on findings.",
              "Your evidence should be sufficient to demonstrate: what you tested, how you tested it, what you found, and what actions resulted. Maintain workpapers that would allow an independent reviewer to understand and replicate your testing.",
              "Build an organised evidence repository. Whether using specialised GRC software or simpler solutions, ensure evidence is easily retrievable, properly version controlled, and retained for appropriate periods.",
            ],
            keyPoints: [
              "Maintain complete workpapers for all monitoring activities",
              "Ensure evidence would withstand independent review",
              "Build organised, searchable evidence repositories",
              "Define appropriate retention periods",
            ],
            nasaraFeature: "compliance-monitoring",
          },
          {
            title: "Issue Tracking",
            description: "Manage findings through classification, remediation, and escalation.",
            content: [
              "When monitoring identifies issues, you need robust processes to track them through to resolution. This includes: consistent classification of finding severity, clear ownership for remediation, escalation pathways for significant issues, and tracking of overdue actions.",
              "Develop a finding classification framework. Typical approaches distinguish between: critical findings requiring immediate remediation and board escalation, significant findings needing prompt action and executive visibility, and minor findings that can be addressed through normal business processes.",
              "Track remediation actions to closure. Don't consider findings closed simply because actions were taken; verify that the actions were effective in addressing the underlying issue.",
            ],
            keyPoints: [
              "Establish consistent finding classification criteria",
              "Assign clear ownership for remediation actions",
              "Define escalation pathways for significant issues",
              "Verify remediation effectiveness before closure",
            ],
            nasaraFeature: "compliance-monitoring",
          },
          {
            title: "Governance Reporting",
            description: "Present monitoring results to committees and the board effectively.",
            content: [
              "Compliance monitoring should inform governance. Regular reporting to appropriate committees and the board provides assurance that the compliance framework is operating effectively and flags areas requiring management attention.",
              "Tailor reporting to your audience. Board reporting should focus on key messages, significant issues, and trends rather than operational detail. Committee reporting can go deeper into specific areas within the committee's remit.",
              "Use monitoring data to tell a coherent story about your compliance position. This isn't just about listing findings; it's about providing insight into control effectiveness, risk trends, and the overall health of your compliance framework.",
            ],
            keyPoints: [
              "Establish regular reporting cadence to governance forums",
              "Tailor content and detail to different audiences",
              "Focus on insight and trends, not just finding lists",
              "Track governance actions arising from monitoring reports",
            ],
            nasaraFeature: "reporting",
          },
          {
            title: "Continuous Improvement",
            description: "Review and enhance your CMP based on experience and regulatory change.",
            content: [
              "Your Compliance Monitoring Plan should improve over time. Build in mechanisms to capture lessons learned, incorporate feedback from stakeholders, and adapt to changes in your business and regulatory environment.",
              "Conduct an annual review of your monitoring plan effectiveness. Consider: Did monitoring identify issues that mattered? Were resources allocated appropriately? Has the regulatory landscape changed? Are there new risks that should be in scope?",
              "Seek feedback from across the business. First line teams being monitored often have insights into where controls are genuinely weak versus where your testing methodology might be missing the point.",
            ],
            keyPoints: [
              "Conduct annual reviews of monitoring plan effectiveness",
              "Incorporate lessons learned from the year's monitoring",
              "Adapt to regulatory and business changes",
              "Seek feedback from monitored business areas",
            ],
            nasaraFeature: "compliance-monitoring",
          },
        ],
        useCases: [
          {
            persona: "Compliance monitoring teams",
            icon: "ClipboardList",
            scenario: "You're responsible for executing the firm's compliance monitoring programme and need efficient tools to plan, execute, and report on monitoring activities.",
            workflow: [
              "Build your monitoring universe from regulatory obligations and business activities",
              "Create risk-based monitoring schedules with clear ownership",
              "Execute testing with standardised workpapers and evidence capture",
              "Track findings through to verified remediation",
            ],
            features: [
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "risk-assessment", label: "Risk Assessment" },
              { slug: "reporting", label: "MI Reporting" },
            ],
            testimonialQuote: "Reduced monitoring administration by 40%",
          },
          {
            persona: "Second line oversight functions",
            icon: "Shield",
            scenario: "You provide independent oversight and need visibility across the firm's compliance monitoring activities.",
            workflow: [
              "Access consolidated view of monitoring activity across business areas",
              "Review testing quality and finding consistency",
              "Track remediation progress and escalate overdue actions",
              "Generate oversight reporting for governance committees",
            ],
            features: [
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "reporting", label: "MI Reporting" },
              { slug: "audit-trail", label: "Audit Trail" },
            ],
          },
          {
            persona: "Risk and compliance managers",
            icon: "BarChart3",
            scenario: "You need to ensure the compliance monitoring programme is effective and appropriately resourced.",
            workflow: [
              "Assess monitoring coverage against regulatory obligations",
              "Allocate resources based on risk assessment outcomes",
              "Monitor programme execution against annual plan",
              "Report programme effectiveness to senior management",
            ],
            features: [
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "risk-assessment", label: "Risk Assessment" },
              { slug: "reporting", label: "MI Reporting" },
            ],
          },
          {
            persona: "Internal audit teams reviewing compliance",
            icon: "FileCheck",
            scenario: "You're auditing the compliance function and need to assess the effectiveness of the monitoring programme.",
            workflow: [
              "Review monitoring plan design and risk coverage",
              "Test sample of monitoring workpapers for quality",
              "Assess finding classification consistency",
              "Evaluate governance reporting effectiveness",
            ],
            features: [
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "audit-trail", label: "Audit Trail" },
              { slug: "reporting", label: "MI Reporting" },
            ],
          },
          {
            persona: "Board members overseeing compliance effectiveness",
            icon: "Users",
            scenario: "You need assurance that the firm's compliance monitoring is providing effective oversight of regulatory risks.",
            workflow: [
              "Receive clear, insightful board reporting on compliance status",
              "Understand key risks and control effectiveness trends",
              "Track significant findings and remediation progress",
              "Challenge compliance effectiveness with informed questions",
            ],
            features: [
              { slug: "reporting", label: "MI Reporting" },
              { slug: "compliance-monitoring", label: "Compliance Dashboards" },
            ],
          },
        ],
      };
    case "safeguarding-reconciliation-guide":
      return {
        overview: "An operational guide to safeguarding reconciliation for electronic money institutions and payment service providers. This guide covers the daily reconciliation process, common causes of breaks, resolution procedures, and the evidence required to demonstrate compliance to the FCA.",
        chapters: [
          {
            title: "Regulatory Framework",
            description: "Understand EMD2 and PSR safeguarding requirements for your firm.",
            content: [
              "Safeguarding requirements exist to protect customer funds in the event that a payment institution (PI) or electronic money institution (EMI) becomes insolvent. The regulatory framework is set out in the Payment Services Regulations 2017 (PSRs) and Electronic Money Regulations 2011 (EMRs).",
              "At its core, safeguarding requires firms to segregate customer funds from the firm's own money and hold them in a way that ensures they remain available for customers if the firm fails. This typically means holding funds in designated safeguarding accounts at authorised credit institutions.",
              "The FCA has published detailed guidance on safeguarding in its Approach Document for payment services and electronic money, supplemented by supervisory statements and Dear CEO letters. Understanding these requirements in detail is essential for designing compliant reconciliation processes.",
            ],
            keyPoints: [
              "Safeguarding protects customer funds in firm insolvency",
              "Requirements come from PSRs 2017 and EMRs 2011",
              "FCA Approach Document provides detailed guidance",
              "Keep up to date with FCA supervisory statements",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Account Structure",
            description: "Design safeguarding account arrangements that meet regulatory expectations.",
            content: [
              "Your safeguarding account structure must enable clear segregation of customer funds and support effective reconciliation. Most firms use dedicated safeguarding accounts at one or more authorised credit institutions, clearly designated as holding customer funds.",
              "Consider: the number and location of safeguarding accounts, banking partners' ability to support your operational needs, currency requirements, and how your account structure supports your reconciliation processes.",
              "Document your safeguarding arrangements clearly. This includes written acknowledgment from your banking partners that the accounts are designated for safeguarding purposes and that the bank has no rights of set-off against the funds.",
            ],
            keyPoints: [
              "Use dedicated, clearly designated safeguarding accounts",
              "Obtain written acknowledgments from banking partners",
              "Consider operational needs in account structure design",
              "Document safeguarding arrangements comprehensively",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Daily Reconciliation",
            description: "Implement processes to identify breaks within required timeframes.",
            content: [
              "The PSRs and EMRs require firms to perform reconciliation of safeguarded funds at least daily (or, where circumstances require, as frequently as is necessary). This means comparing the funds you should be safeguarding against the funds actually held in your safeguarding accounts.",
              "Your reconciliation process should: calculate the safeguarding requirement (funds received from customers for payment services or in exchange for electronic money), compare this to funds held in safeguarding accounts, identify any differences (breaks), and trigger investigation and resolution processes for material breaks.",
              "Timing matters. Reconciliation should be completed close to the start of each business day, using position data from the previous day's close. Some firms perform multiple intraday reconciliations for higher-risk areas.",
            ],
            keyPoints: [
              "Perform reconciliation at least daily",
              "Compare safeguarding requirement to actual funds held",
              "Complete reconciliation close to start of business",
              "Consider intraday reconciliation for higher-risk areas",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Break Classification",
            description: "Categorise breaks by cause and priority for appropriate resolution.",
            content: [
              "When reconciliation identifies differences between safeguarding requirements and funds held, you need a systematic approach to classifying and prioritising these breaks. Not all breaks are equal in terms of risk or urgency.",
              "Common break classifications include: timing differences (transactions in flight that will self-correct), operational errors (incorrect postings requiring correction), system issues (data quality problems requiring investigation), and genuine shortfalls (requiring immediate funding action).",
              "Establish thresholds and escalation triggers. Small timing differences may be noted and monitored but not actively investigated. Larger breaks or those showing unusual patterns should trigger immediate escalation.",
            ],
            keyPoints: [
              "Classify breaks by type and underlying cause",
              "Distinguish timing differences from genuine shortfalls",
              "Establish thresholds for investigation and escalation",
              "Genuine shortfalls require immediate funding action",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Resolution Procedures",
            description: "Address different break types through defined operational processes.",
            content: [
              "Each break type needs a defined resolution procedure. Timing differences may resolve automatically and need only monitoring. Operational errors need correction processes. System issues require root cause investigation. Shortfalls need immediate funding.",
              "For genuine shortfalls, your procedures must ensure funds are transferred to safeguarding accounts promptly. The FCA expects firms to fund any shortfalls from their own resources without delay. Having pre-established processes and authorities for emergency funding is essential.",
              "Track all breaks through to resolution. Even timing differences that self-correct should be monitored to ensure they do actually resolve and to identify any patterns that might indicate underlying issues.",
            ],
            keyPoints: [
              "Define resolution procedures for each break type",
              "Fund genuine shortfalls from own resources without delay",
              "Pre-establish emergency funding processes and authorities",
              "Track all breaks through to resolution",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Automation Options",
            description: "Evaluate technology solutions for reconciliation efficiency.",
            content: [
              "As transaction volumes grow, manual reconciliation processes become increasingly unsustainable. Technology solutions can improve both accuracy and efficiency, though they require careful implementation to ensure they actually improve control rather than creating new risks.",
              "Reconciliation automation typically involves: automated data feeds from core banking and safeguarding account systems, matching algorithms that identify corresponding transactions, exception reporting for unmatched items, and workflow tools for break investigation and resolution.",
              "When implementing automation, don't assume technology eliminates control requirements. You still need manual oversight of exception items, regular validation of matching logic, and human judgment for unusual situations.",
            ],
            keyPoints: [
              "Automation improves efficiency as volumes grow",
              "Implement automated data feeds and matching logic",
              "Maintain human oversight of exceptions",
              "Regularly validate automated processes",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Evidence and Records",
            description: "Maintain documentation that demonstrates control effectiveness.",
            content: [
              "Your reconciliation records serve multiple purposes: supporting daily operational control, enabling internal audit and compliance review, and demonstrating compliance to the FCA if requested. Records should be comprehensive enough to support all these uses.",
              "At minimum, retain: daily reconciliation outputs showing positions and any breaks, investigation records for material breaks, documentation of resolution actions taken, and sign-off records showing management review.",
              "Consider how long to retain records. While regulatory requirements vary, best practice is to retain safeguarding reconciliation records for at least six years, consistent with general FCA record-keeping expectations.",
            ],
            keyPoints: [
              "Retain comprehensive reconciliation records",
              "Document investigation and resolution of breaks",
              "Maintain sign-off records showing management review",
              "Retain records for at least six years",
            ],
            nasaraFeature: "safeguarding",
          },
          {
            title: "Governance and Reporting",
            description: "Report safeguarding status to appropriate oversight forums.",
            content: [
              "Safeguarding is a critical control area that requires appropriate governance oversight. Regular reporting to senior management and the board should cover: overall safeguarding position and any material changes, reconciliation breaks and resolution status, control issues or incidents, and regulatory developments.",
              "The frequency and depth of reporting should reflect the materiality of safeguarding to your business. Firms with large customer fund balances need more frequent and detailed reporting than those with minimal safeguarding requirements.",
              "Don't wait for formal reporting cycles to escalate significant issues. Material safeguarding incidents should be escalated to senior management immediately and reported to the board at the first opportunity.",
            ],
            keyPoints: [
              "Report safeguarding status regularly to senior management and board",
              "Cover position, breaks, control issues, and regulatory developments",
              "Calibrate reporting frequency to materiality of safeguarding",
              "Escalate significant issues immediately",
            ],
            nasaraFeature: "reporting",
          },
        ],
        useCases: [
          {
            persona: "Safeguarding officers at EMIs and PIs",
            icon: "Shield",
            scenario: "You're responsible for ensuring the firm meets its safeguarding obligations and need efficient tools for daily reconciliation and oversight.",
            workflow: [
              "Configure safeguarding account structures and reconciliation rules",
              "Perform daily automated reconciliation with exception flagging",
              "Investigate and resolve breaks with documented audit trails",
              "Generate governance reporting on safeguarding status",
            ],
            features: [
              { slug: "safeguarding", label: "Safeguarding Module" },
              { slug: "reconciliation", label: "Reconciliation Tools" },
              { slug: "reporting", label: "MI Reporting" },
            ],
            testimonialQuote: "Daily reconciliation completed in minutes, not hours",
          },
          {
            persona: "Finance and treasury teams",
            icon: "BarChart3",
            scenario: "You manage cash positions and need visibility into safeguarding requirements to ensure adequate funding.",
            workflow: [
              "Monitor real-time safeguarding position against funds held",
              "Receive alerts when positions approach trigger levels",
              "Execute funding transfers with appropriate authorities",
              "Reconcile treasury activities against safeguarding movements",
            ],
            features: [
              { slug: "safeguarding", label: "Safeguarding Module" },
              { slug: "reconciliation", label: "Reconciliation Tools" },
            ],
          },
          {
            persona: "Compliance teams with safeguarding oversight",
            icon: "FileCheck",
            scenario: "You provide second line oversight of safeguarding controls and need to monitor compliance across the firm.",
            workflow: [
              "Review reconciliation completion and break resolution",
              "Monitor control effectiveness metrics and trends",
              "Assess compliance with regulatory requirements",
              "Report safeguarding status to governance committees",
            ],
            features: [
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "safeguarding", label: "Safeguarding Oversight" },
              { slug: "reporting", label: "MI Reporting" },
            ],
          },
          {
            persona: "Internal auditors reviewing safeguarding controls",
            icon: "ClipboardList",
            scenario: "You're auditing safeguarding controls and need access to reconciliation records and evidence.",
            workflow: [
              "Access historical reconciliation records and break logs",
              "Review investigation and resolution documentation",
              "Test reconciliation accuracy with independent data",
              "Assess control design and operating effectiveness",
            ],
            features: [
              { slug: "audit-trail", label: "Audit Trail" },
              { slug: "safeguarding", label: "Safeguarding Records" },
              { slug: "reporting", label: "Audit Reporting" },
            ],
          },
          {
            persona: "Operations managers responsible for reconciliation",
            icon: "Users",
            scenario: "You manage the team performing daily reconciliation and need tools to ensure consistent, efficient execution.",
            workflow: [
              "Assign and track daily reconciliation tasks",
              "Monitor completion status and escalate delays",
              "Review and approve break resolutions",
              "Manage team workload and training needs",
            ],
            features: [
              { slug: "safeguarding", label: "Safeguarding Module" },
              { slug: "workflow", label: "Task Management" },
              { slug: "reporting", label: "Operations Reporting" },
            ],
          },
        ],
      };
    default:
      return {
        overview: "A practical compliance guide for FCA-regulated firms, covering regulatory expectations and evidence requirements.",
        chapters: [
          {
            title: "Introduction",
            description: "Overview of the regulatory context and purpose of this guide.",
            content: [
              "This guide provides practical guidance for FCA-regulated firms on meeting their compliance obligations. It covers key regulatory expectations and provides frameworks for building effective compliance processes.",
              "The guidance is designed to be practical and actionable. Rather than simply restating regulatory requirements, it focuses on how firms can implement effective compliance programmes that meet regulatory expectations while remaining proportionate to their business.",
            ],
            keyPoints: [
              "Understand the regulatory expectations for your firm type",
              "Build proportionate compliance processes",
              "Focus on practical implementation",
            ],
          },
          {
            title: "Requirements",
            description: "Key compliance obligations and regulatory expectations.",
            content: [
              "FCA-regulated firms must comply with the requirements set out in the FCA Handbook, including the Principles for Business, the Senior Managers and Certification Regime, and specific rules applicable to their regulated activities.",
              "Beyond rulebook compliance, the FCA expects firms to maintain appropriate systems and controls, treat customers fairly, and manage risks effectively. These expectations are assessed through ongoing supervision.",
            ],
            keyPoints: [
              "Comply with applicable FCA Handbook requirements",
              "Maintain appropriate systems and controls",
              "Demonstrate fair treatment of customers",
            ],
          },
          {
            title: "Implementation",
            description: "Practical guidance for meeting compliance requirements.",
            content: [
              "Effective compliance implementation requires: clear understanding of applicable requirements, appropriate policies and procedures, trained staff, effective monitoring, and robust governance oversight.",
              "Build compliance into business processes from the start rather than adding it as an afterthought. This is more effective and often more efficient than retrofitting compliance controls.",
            ],
            keyPoints: [
              "Build compliance into business processes",
              "Train staff on compliance requirements",
              "Monitor compliance effectiveness",
            ],
          },
        ],
        useCases: [
          {
            persona: "Compliance professionals",
            icon: "Shield",
            scenario: "You're responsible for ensuring your firm meets its regulatory obligations.",
            workflow: [
              "Understand applicable regulatory requirements",
              "Implement appropriate policies and procedures",
              "Monitor compliance and address issues",
              "Report to governance on compliance status",
            ],
            features: [
              { slug: "compliance-monitoring", label: "Compliance Monitoring" },
              { slug: "policy-management", label: "Policy Management" },
            ],
          },
          {
            persona: "Regulatory teams",
            icon: "Scale",
            scenario: "You manage regulatory relationships and need to demonstrate compliance.",
            workflow: [
              "Prepare for regulatory engagements",
              "Document compliance evidence",
              "Respond to regulatory requests",
              "Track regulatory developments",
            ],
            features: [
              { slug: "reporting", label: "MI Reporting" },
              { slug: "audit-trail", label: "Audit Trail" },
            ],
          },
          {
            persona: "Governance functions",
            icon: "Users",
            scenario: "You provide oversight of the firm's compliance framework.",
            workflow: [
              "Review compliance reporting",
              "Challenge compliance effectiveness",
              "Approve compliance policies",
              "Oversee significant compliance matters",
            ],
            features: [
              { slug: "reporting", label: "Board Reporting" },
              { slug: "compliance-monitoring", label: "Compliance Dashboards" },
            ],
          },
        ],
      };
  }
}

export function generateStaticParams() {
  return RESOURCE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = RESOURCE_GUIDES.find((item) => item.slug === slug);
  if (!guide) {
    return {
      title: "Guide",
      description: "Nasara Connect compliance guide.",
    };
  }

  return {
    title: guide.seoTitle,
    description: guide.seoDescription,
    alternates: { canonical: `/resources/guides/${guide.slug}` },
    openGraph: {
      title: guide.seoTitle,
      description: guide.seoDescription,
      url: `/resources/guides/${guide.slug}`,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = RESOURCE_GUIDES.find((item) => item.slug === slug);
  if (!guide) {
    notFound();
  }

  const content = getGuideContent(guide.slug);
  const relatedLinks = RELATED_LINKS[guide.slug];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Guides", path: "/resources/guides" },
          { name: guide.title, path: `/resources/guides/${guide.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      {/* Hero Section */}
      <section className="relative px-4 pb-12 pt-32 overflow-hidden">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Guide
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{guide.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{guide.seoDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a walkthrough</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/resources">Back to resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content - Client Component */}
      <GuidePageClient
        chapters={content.chapters}
        useCases={content.useCases}
        overview={content.overview}
        guideTitle={guide.title}
        relatedLinks={relatedLinks}
      />

      <Footer />
    </div>
  );
}
