/**
 * Guidance Content Library
 *
 * Plain English explainers, tips, and common mistakes for each FCA requirement.
 * Content is keyed to match guidanceKey in requirements-by-permission.ts
 */

export interface GuidanceTip {
  title: string;
  content: string;
}

export interface GuidanceContent {
  key: string;
  title: string;
  plainEnglish: string; // What this really means in simple terms
  whatGoodLooksLike: string[]; // Examples of what good looks like
  commonMistakes: string[]; // Things firms often get wrong
  tips: GuidanceTip[]; // Practical tips
  fcaExpectation: string; // What the FCA is really looking for
  timeToComplete?: string; // Typical time to prepare this
}

export const guidanceLibrary: Record<string, GuidanceContent> = {
  // Governance Requirements
  "corporate-structure": {
    key: "corporate-structure",
    title: "Corporate Structure & Ownership",
    plainEnglish:
      "The FCA wants to understand who owns your company, how it fits into any group structure, and whether there are any concerns about the people behind the business. They need to know the chain of ownership so they can assess fitness and propriety of controllers.",
    whatGoodLooksLike: [
      "Clear group structure chart showing all legal entities and ownership percentages",
      "Shareholder register that matches Companies House filings",
      "Explanation of any complex ownership arrangements (trusts, nominee holdings)",
      "Source of initial capital clearly documented",
    ],
    commonMistakes: [
      "Incomplete ownership chains - showing immediate shareholders but not ultimate beneficial owners",
      "Outdated structure charts that don't match current Companies House records",
      "Missing explanations for why the structure is designed as it is",
      "Failing to disclose controllers who own 10%+ indirectly",
    ],
    tips: [
      {
        title: "Start with Companies House",
        content: "Download your current filing and use it as the basis for your structure chart. The FCA will cross-check.",
      },
      {
        title: "Go to the top",
        content: "Show ownership all the way up to individuals or publicly traded companies. Don't stop at intermediate holding companies.",
      },
      {
        title: "Explain complexity",
        content: "If your structure is complex, add a brief narrative explaining why. The FCA is suspicious of unnecessarily complicated arrangements.",
      },
    ],
    fcaExpectation:
      "The FCA expects complete transparency about who controls the firm. They will verify against Companies House and may request additional information about any controllers. Complex structures without clear rationale raise red flags.",
    timeToComplete: "1-2 days",
  },

  "board-composition": {
    key: "board-composition",
    title: "Board Composition & Responsibilities",
    plainEnglish:
      "The FCA wants to see that you have the right people overseeing the business, with appropriate skills and enough time to do the job properly. They're checking that governance isn't just a paper exercise.",
    whatGoodLooksLike: [
      "Board with relevant financial services experience",
      "Clear division of responsibilities between executive and oversight roles",
      "Documented time commitments showing directors have capacity",
      "Skills matrix demonstrating coverage of key competencies",
    ],
    commonMistakes: [
      "Directors with too many other commitments to give proper attention",
      "No non-executive oversight or challenge",
      "Board that rubber-stamps management decisions without genuine discussion",
      "Missing skills in key areas like risk, compliance, or technology",
    ],
    tips: [
      {
        title: "Document time commitments",
        content: "List all directorships and significant commitments for each board member. The FCA checks this.",
      },
      {
        title: "Show the challenge",
        content: "Include evidence of board discussions and challenge in your application - meeting minutes extracts work well.",
      },
      {
        title: "Skills gaps are okay",
        content: "If you have gaps, acknowledge them and explain your plan to address them (e.g., planned NED recruitment).",
      },
    ],
    fcaExpectation:
      "The FCA expects boards to provide genuine oversight, not just governance theatre. They look for evidence that directors understand the business, have capacity to engage, and provide real challenge to management.",
    timeToComplete: "2-3 days",
  },

  "mind-management": {
    key: "mind-management",
    title: "Mind & Management in UK",
    plainEnglish:
      "This is about proving that your business is genuinely run from the UK, not just registered here. The FCA wants to see that key decisions are made in the UK by people based here, and that the UK isn't just a 'brass plate' for an overseas operation.",
    whatGoodLooksLike: [
      "Key decision-makers physically located in the UK",
      "Board meetings held in the UK with UK-based quorum",
      "UK-based compliance and risk functions",
      "Clear decision authority matrix showing UK control",
    ],
    commonMistakes: [
      "Claiming UK control when key staff actually work from overseas",
      "Having a UK 'representative' but real decisions made by overseas parent",
      "Unable to demonstrate that UK staff have genuine authority",
      "Compliance function that reports to overseas head office rather than UK board",
    ],
    tips: [
      {
        title: "Map your decisions",
        content: "Create a decision authority matrix showing where different types of decisions are made. This demonstrates UK control.",
      },
      {
        title: "Document physical presence",
        content: "Provide evidence like employment contracts, office leases, and travel records showing key people are genuinely UK-based.",
      },
      {
        title: "Be honest about group dynamics",
        content: "If you're part of a larger group, explain how UK governance works within that structure. The FCA understands group structures but needs to see UK autonomy on regulated matters.",
      },
    ],
    fcaExpectation:
      "The FCA will verify mind and management claims through site visits and interviews. They're looking for genuine UK control, not just legal or administrative presence. This is a threshold condition for authorization.",
    timeToComplete: "1-2 days",
  },

  "smcr-allocation": {
    key: "smcr-allocation",
    title: "SMCR Allocation",
    plainEnglish:
      "The Senior Managers and Certification Regime makes specific people accountable for specific things. You need to assign the required senior manager functions (SMFs) and show that each person understands what they're responsible for.",
    whatGoodLooksLike: [
      "All required SMF roles filled with suitable individuals",
      "Clear statements of responsibilities for each senior manager",
      "No gaps in the responsibilities map",
      "Logical allocation based on actual roles and expertise",
    ],
    commonMistakes: [
      "Allocating responsibilities to people without the expertise to fulfil them",
      "Spreading responsibilities too thin (one person holding too many functions)",
      "Gaps in the overall responsibilities map",
      "Generic statements of responsibilities that don't reflect the actual business",
    ],
    tips: [
      {
        title: "Use FCA templates",
        content: "The FCA provides template statements of responsibilities. Use these as your starting point and customize.",
      },
      {
        title: "Think about cover",
        content: "What happens when someone is away? Build in deputy arrangements from the start.",
      },
      {
        title: "Match reality",
        content: "The responsibilities you document must match what people actually do. Don't create a paper structure that doesn't reflect how the business operates.",
      },
    ],
    fcaExpectation:
      "The FCA expects a complete and logical allocation of responsibilities with no gaps. They will hold individuals accountable under SMCR, so allocations must be genuine and understood by the individuals concerned.",
    timeToComplete: "2-3 days",
  },

  // Financial Requirements
  "capital-requirements": {
    key: "capital-requirements",
    title: "Capital Requirements",
    plainEnglish:
      "You need enough money to run the business safely and protect customers. The FCA sets minimum capital requirements, but you should hold more than the minimum to provide a buffer against things going wrong.",
    whatGoodLooksLike: [
      "Capital clearly exceeds regulatory minimum",
      "Own funds calculation properly documented",
      "Capital held in liquid, accessible form",
      "Clear explanation of capital adequacy approach",
    ],
    commonMistakes: [
      "Calculating capital incorrectly (wrong components or deductions)",
      "Not maintaining adequate headroom above minimums",
      "Capital tied up in illiquid assets",
      "Projections showing capital falling below requirements",
    ],
    tips: [
      {
        title: "Build in buffer",
        content: "Hold at least 20% more than the regulatory minimum. This gives you room to absorb losses and grow.",
      },
      {
        title: "Get the calculation right",
        content: "Work through the MIPRU requirements carefully. If in doubt, get professional advice on your capital calculation.",
      },
      {
        title: "Keep it liquid",
        content: "Capital should be in cash or near-cash. The FCA may query capital held in property or other illiquid assets.",
      },
    ],
    fcaExpectation:
      "The FCA expects firms to maintain capital above regulatory minimums at all times. They will scrutinize your calculation and may require additional capital if they have concerns about your risk profile.",
    timeToComplete: "1-2 days",
  },

  "financial-projections": {
    key: "financial-projections",
    title: "Financial Projections",
    plainEnglish:
      "Show the FCA your business plan in numbers. They want to see that you've thought carefully about how you'll make money, what it will cost to run the business, and whether the economics work. Unrealistic projections are a red flag.",
    whatGoodLooksLike: [
      "Realistic revenue assumptions based on market evidence",
      "Comprehensive cost base including compliance costs",
      "Sensitivity analysis showing impact of different scenarios",
      "Clear path to profitability with realistic timelines",
    ],
    commonMistakes: [
      "Hockey-stick growth projections without supporting evidence",
      "Underestimating compliance and operational costs",
      "No sensitivity analysis or stress testing",
      "Projections that don't reconcile with the business plan narrative",
    ],
    tips: [
      {
        title: "Be conservative",
        content: "The FCA is skeptical of aggressive projections. Better to present conservative numbers and over-deliver.",
      },
      {
        title: "Show your workings",
        content: "Document all assumptions clearly. If you project 10,000 customers, explain where they come from.",
      },
      {
        title: "Include compliance costs",
        content: "Firms consistently underestimate compliance costs. Budget for compliance staff, systems, and regulatory fees.",
      },
    ],
    fcaExpectation:
      "The FCA expects realistic, well-supported projections. They will challenge aggressive assumptions and are particularly focused on ensuring firms have viable business models and adequate resources.",
    timeToComplete: "3-5 days",
  },

  "wind-down-planning": {
    key: "wind-down-planning",
    title: "Wind-Down Planning",
    plainEnglish:
      "If things go wrong and you need to close the business, how would you do it without harming customers? The FCA wants to see that you've thought this through and have the resources to exit in an orderly way.",
    whatGoodLooksLike: [
      "Step-by-step wind-down plan with clear triggers",
      "Realistic timeline for orderly closure",
      "Costed wind-down with funding identified",
      "Customer protection measures during wind-down",
    ],
    commonMistakes: [
      "Wind-down costs significantly underestimated",
      "No consideration of customer communication and migration",
      "Assuming wind-down can happen faster than realistic",
      "Not holding adequate wind-down resources",
    ],
    tips: [
      {
        title: "Think through the steps",
        content: "Map out every step from decision to close to final customer migration. Don't skip the messy details.",
      },
      {
        title: "Be realistic on timing",
        content: "Wind-downs typically take 6-12 months minimum. Don't assume you can close in weeks.",
      },
      {
        title: "Cost it properly",
        content: "Include staff retention, system costs, legal fees, and customer communication costs. These add up quickly.",
      },
    ],
    fcaExpectation:
      "The FCA expects a credible wind-down plan with adequate funding. They will particularly scrutinize customer protection arrangements and whether you have resources to complete an orderly exit.",
    timeToComplete: "2-3 days",
  },

  // Operational Requirements
  "business-model": {
    key: "business-model",
    title: "Business Model",
    plainEnglish:
      "Explain clearly what your business does, who your customers are, how you make money, and why you'll succeed. The FCA needs to understand your business to assess whether it's viable and appropriate for authorization.",
    whatGoodLooksLike: [
      "Clear articulation of products and services",
      "Well-defined target market with evidence of demand",
      "Credible competitive positioning",
      "Logical revenue model with realistic pricing",
    ],
    commonMistakes: [
      "Vague or overly technical descriptions",
      "No evidence of market demand or customer research",
      "Unrealistic market share assumptions",
      "Unclear how the business actually makes money",
    ],
    tips: [
      {
        title: "Write for a non-expert",
        content: "The FCA reviewer may not be an expert in your niche. Explain things clearly without jargon.",
      },
      {
        title: "Show evidence of demand",
        content: "Include customer research, letters of intent, or pilot results that demonstrate real market interest.",
      },
      {
        title: "Be specific",
        content: "Don't say 'SMEs in the UK'. Say 'import/export businesses with annual turnover of $500k-$5m'.",
      },
    ],
    fcaExpectation:
      "The FCA expects a clear, viable business model. They will assess whether the business makes sense commercially and whether it's appropriate for the permissions you're seeking.",
    timeToComplete: "2-3 days",
  },

  "operational-resilience": {
    key: "operational-resilience",
    title: "Operational Resilience",
    plainEnglish:
      "When things go wrong (systems fail, suppliers have problems, cyber attacks happen), can you keep serving customers? The FCA wants to see that you've identified your critical services and have plans to maintain them.",
    whatGoodLooksLike: [
      "Important business services clearly identified",
      "Impact tolerances set for each critical service",
      "Tested recovery plans for plausible scenarios",
      "Third-party dependencies mapped and managed",
    ],
    commonMistakes: [
      "Focusing on technology recovery without considering end-to-end service",
      "Impact tolerances that are unrealistic or untested",
      "Not considering third-party dependencies",
      "Plans that exist on paper but have never been tested",
    ],
    tips: [
      {
        title: "Think customer impact",
        content: "Start with 'what services can't my customers do without?' rather than 'what systems do I have?'",
      },
      {
        title: "Test your tolerances",
        content: "If you say you can recover in 4 hours, prove it. Run a test.",
      },
      {
        title: "Include suppliers",
        content: "Your resilience is only as good as your critical suppliers. Map and manage those dependencies.",
      },
    ],
    fcaExpectation:
      "The FCA expects firms to identify important business services, set realistic impact tolerances, and be able to demonstrate they can recover within those tolerances. This is a growing area of regulatory focus.",
    timeToComplete: "3-5 days",
  },

  "outsourcing-arrangements": {
    key: "outsourcing-arrangements",
    title: "Outsourcing Arrangements",
    plainEnglish:
      "Using third parties for important functions is fine, but you're still responsible for what they do. The FCA wants to see that you've chosen suppliers carefully, have proper contracts, and are monitoring their performance.",
    whatGoodLooksLike: [
      "Comprehensive outsourcing policy",
      "Due diligence on critical suppliers documented",
      "Contracts with appropriate regulatory clauses",
      "Ongoing monitoring and governance arrangements",
    ],
    commonMistakes: [
      "Treating outsourcing as 'set and forget'",
      "Contracts without FCA access and audit rights",
      "No ongoing performance monitoring",
      "Unclear accountability for outsourced functions",
    ],
    tips: [
      {
        title: "Know your critical suppliers",
        content: "Create a register of all suppliers and assess which are critical to your regulated activities.",
      },
      {
        title: "Get the contract right",
        content: "Include FCA access rights, audit rights, and clear SLAs. Get legal advice on critical contracts.",
      },
      {
        title: "Monitor continuously",
        content: "Set up regular performance reviews and escalation triggers for your critical suppliers.",
      },
    ],
    fcaExpectation:
      "The FCA expects firms to maintain responsibility for outsourced activities. They want to see proper due diligence, strong contracts, and active ongoing oversight. Outsourcing doesn't mean outsourcing accountability.",
    timeToComplete: "2-3 days",
  },

  // Compliance Requirements
  "compliance-monitoring": {
    key: "compliance-monitoring",
    title: "Compliance Monitoring Programme",
    plainEnglish:
      "You need a plan to check that your business is following the rules. This isn't just about ticking boxes - it's about identifying risks and testing that your controls actually work.",
    whatGoodLooksLike: [
      "Risk-based monitoring plan covering key obligations",
      "Clear methodology for testing controls",
      "Process for tracking and remediating findings",
      "Regular reporting to board/senior management",
    ],
    commonMistakes: [
      "Generic checklists not tailored to your business",
      "Monitoring that never finds anything (suspicious)",
      "Findings not tracked to closure",
      "No escalation to senior management",
    ],
    tips: [
      {
        title: "Prioritize by risk",
        content: "Focus monitoring effort on your highest risk areas. Not everything needs the same level of scrutiny.",
      },
      {
        title: "Finding issues is good",
        content: "A monitoring programme that never finds issues isn't working. It's okay to identify problems - what matters is fixing them.",
      },
      {
        title: "Close the loop",
        content: "Every finding needs an owner, a deadline, and follow-up to confirm it's fixed.",
      },
    ],
    fcaExpectation:
      "The FCA expects a proportionate, risk-based monitoring programme. They want to see that you're actively testing compliance, not just assuming everything is fine. Evidence of issues identified and resolved is positive.",
    timeToComplete: "2-3 days",
  },

  "risk-management": {
    key: "risk-management",
    title: "Risk Management Framework",
    plainEnglish:
      "Identify what could go wrong, assess how bad it would be, and put controls in place. The FCA wants to see that you understand your risks and are managing them actively, not just hoping for the best.",
    whatGoodLooksLike: [
      "Documented risk appetite aligned to business strategy",
      "Comprehensive risk register with clear ownership",
      "Controls mapped to risks with testing evidence",
      "Regular risk reporting to board",
    ],
    commonMistakes: [
      "Risk register that's just a list with no analysis",
      "Controls that aren't actually tested",
      "Risk appetite statement that's meaningless in practice",
      "Risks owned by 'the compliance team' rather than the business",
    ],
    tips: [
      {
        title: "Make risk appetite meaningful",
        content: "Translate risk appetite into specific limits and triggers that drive decisions.",
      },
      {
        title: "Own your risks",
        content: "Risks should be owned by the business, not compliance. The business creates and manages risk; compliance provides oversight.",
      },
      {
        title: "Test your controls",
        content: "A control that's never been tested might not work. Include control testing in your monitoring plan.",
      },
    ],
    fcaExpectation:
      "The FCA expects a proportionate risk framework that genuinely informs business decisions. They're skeptical of firms that claim to have low risk without evidence, or have elaborate frameworks that don't actually influence behavior.",
    timeToComplete: "3-4 days",
  },

  "regulatory-reporting": {
    key: "regulatory-reporting",
    title: "Regulatory Reporting",
    plainEnglish:
      "The FCA needs regular reports from you about your business. You need to know what reports are required, when they're due, and have processes to produce accurate data on time.",
    whatGoodLooksLike: [
      "Calendar of all reporting obligations",
      "Clear process ownership for each report",
      "Data quality controls and validation",
      "Escalation process for reporting issues",
    ],
    commonMistakes: [
      "Not knowing all your reporting obligations",
      "Last-minute scramble to produce reports",
      "Errors in submitted data",
      "No audit trail for reported figures",
    ],
    tips: [
      {
        title: "Map your obligations early",
        content: "As soon as you know your permission profile, map out all the required FCA returns.",
      },
      {
        title: "Build in lead time",
        content: "Aim to have reports ready a week before deadline. Last-minute reports have more errors.",
      },
      {
        title: "Validate before submission",
        content: "Build validation checks into your reporting process. The FCA notices persistent errors.",
      },
    ],
    fcaExpectation:
      "The FCA expects accurate, timely reporting. Late or inaccurate reports are a regulatory red flag and may trigger increased supervision. Building good reporting processes early is essential.",
    timeToComplete: "1-2 days",
  },

  // Customer Protection Requirements
  safeguarding: {
    key: "safeguarding",
    title: "Safeguarding Arrangements",
    plainEnglish:
      "Customer money must be kept separate from your business money and protected if you fail. This is fundamental to payment services - customers need to trust that their money is safe with you.",
    whatGoodLooksLike: [
      "Clear segregation of customer funds in designated accounts",
      "Daily reconciliation of customer money",
      "Safeguarding account properly documented with bank",
      "Auditor acknowledgment letter in place",
    ],
    commonMistakes: [
      "Using customer funds for operational purposes",
      "Reconciliation not performed daily",
      "Safeguarding account terms not properly documented",
      "Not segregating on receipt (delays in moving to safeguarded account)",
    ],
    tips: [
      {
        title: "Segregate immediately",
        content: "Customer funds should hit a safeguarded account by the end of the business day following receipt.",
      },
      {
        title: "Reconcile daily",
        content: "Daily reconciliation is a regulatory requirement. Set up automated processes where possible.",
      },
      {
        title: "Document everything",
        content: "Keep clear records of safeguarding calculations and reconciliations. You'll need these for audit.",
      },
    ],
    fcaExpectation:
      "Safeguarding is a fundamental requirement for payment firms. The FCA expects robust segregation, daily reconciliation, and clear audit trails. Safeguarding failures are serious and can result in enforcement action.",
    timeToComplete: "2-3 days",
  },

  "consumer-duty": {
    key: "consumer-duty",
    title: "Consumer Duty",
    plainEnglish:
      "You must act to deliver good outcomes for customers across four areas: products and services, price and value, consumer understanding, and consumer support. This is about putting customers first, not just avoiding harm.",
    whatGoodLooksLike: [
      "Clear framework for assessing customer outcomes",
      "Evidence of products designed with target market in mind",
      "Monitoring of customer outcomes with action on poor results",
      "Board-level accountability for consumer duty",
    ],
    commonMistakes: [
      "Treating Consumer Duty as a compliance exercise not a business priority",
      "No outcome metrics or monitoring",
      "Products that aren't right for the target market",
      "Customer support that creates barriers rather than helping",
    ],
    tips: [
      {
        title: "Think outcomes",
        content: "Focus on customer outcomes, not just process compliance. Are customers actually getting good results?",
      },
      {
        title: "Monitor what matters",
        content: "Set up metrics that genuinely measure customer outcomes, not just activity.",
      },
      {
        title: "Act on evidence",
        content: "When monitoring shows poor outcomes, take action. The FCA expects firms to be proactive.",
      },
    ],
    fcaExpectation:
      "Consumer Duty is a priority for the FCA. They expect firms to genuinely focus on customer outcomes, with evidence of monitoring and action. This isn't box-ticking - the FCA will look at actual customer outcomes.",
    timeToComplete: "3-4 days",
  },

  "complaints-handling": {
    key: "complaints-handling",
    title: "Complaints Handling",
    plainEnglish:
      "When customers complain, handle it fairly and quickly. Learn from complaints to improve your business. The FCA sees complaints as a valuable source of information about how firms treat customers.",
    whatGoodLooksLike: [
      "Clear, accessible complaints process",
      "Timely responses within regulatory deadlines",
      "Root cause analysis to identify patterns",
      "Changes made as a result of complaints insights",
    ],
    commonMistakes: [
      "Making it hard for customers to complain",
      "Missing regulatory deadlines",
      "Treating complaints as problems to close rather than insights to learn from",
      "Not analyzing complaints for trends and root causes",
    ],
    tips: [
      {
        title: "Make it easy",
        content: "Customers should be able to complain through multiple channels. Don't hide the process.",
      },
      {
        title: "Track your deadlines",
        content: "Set up systems to track regulatory deadlines (8 weeks, etc.) and escalate before they're breached.",
      },
      {
        title: "Learn from patterns",
        content: "Regular analysis of complaints can reveal systemic issues before they become bigger problems.",
      },
    ],
    fcaExpectation:
      "The FCA monitors complaints data and expects firms to learn from complaints. High complaint volumes, poor resolution rates, or failure to address root causes will attract regulatory attention.",
    timeToComplete: "1-2 days",
  },

  // Technology Requirements
  "it-systems": {
    key: "it-systems",
    title: "IT Systems & Architecture",
    plainEnglish:
      "Your technology needs to support your business reliably and securely. The FCA wants to see that you've designed systems appropriately, have proper controls, and can maintain service to customers.",
    whatGoodLooksLike: [
      "Clear architecture documentation",
      "Appropriate access controls and change management",
      "Monitoring and alerting for critical systems",
      "Disaster recovery and backup procedures",
    ],
    commonMistakes: [
      "Architecture that's grown organically without proper design",
      "Weak access controls (shared accounts, excessive privileges)",
      "No change management process",
      "Backups that have never been tested",
    ],
    tips: [
      {
        title: "Document your architecture",
        content: "Create clear diagrams showing how systems interact and where customer data flows.",
      },
      {
        title: "Control access",
        content: "Implement least-privilege access and regular access reviews. This is a common audit finding.",
      },
      {
        title: "Test your backups",
        content: "A backup that's never been restored isn't proven. Test recovery regularly.",
      },
    ],
    fcaExpectation:
      "The FCA expects IT systems to be appropriately designed and controlled for the nature and scale of your business. Technology failures that impact customers are a growing regulatory concern.",
    timeToComplete: "2-3 days",
  },

  "cyber-security": {
    key: "cyber-security",
    title: "Cyber Security",
    plainEnglish:
      "Protect your systems and customer data from cyber threats. The FCA expects firms to have security proportionate to their risk profile and to be able to respond effectively to incidents.",
    whatGoodLooksLike: [
      "Risk-based security controls",
      "Regular security testing (pen tests, vulnerability scans)",
      "Incident response plan that's been tested",
      "Security awareness training for staff",
    ],
    commonMistakes: [
      "Security treated as an IT problem not a business risk",
      "No regular security testing",
      "Incident response plan that's never been practiced",
      "Staff unaware of security threats (phishing, social engineering)",
    ],
    tips: [
      {
        title: "Know your threats",
        content: "Understand the threats relevant to your business. Payment firms face specific risks around transaction fraud and account takeover.",
      },
      {
        title: "Test regularly",
        content: "Annual penetration testing is a minimum. Continuous vulnerability scanning is better.",
      },
      {
        title: "Practice your response",
        content: "Run tabletop exercises so people know what to do when an incident happens.",
      },
    ],
    fcaExpectation:
      "The FCA expects firms to manage cyber risk proportionately. They're particularly focused on incident response - can you detect, respond, and recover from cyber incidents? This is a growing area of regulatory focus.",
    timeToComplete: "3-4 days",
  },

  // AML/CTF Requirements
  "aml-framework": {
    key: "aml-framework",
    title: "AML/CTF Framework",
    plainEnglish:
      "You must have systems to prevent your business being used for money laundering or terrorist financing. This means understanding your risks, knowing your customers, and monitoring for suspicious activity.",
    whatGoodLooksLike: [
      "Documented business-wide risk assessment",
      "Policies and procedures tailored to your risk profile",
      "Trained staff who understand their responsibilities",
      "Regular review and update of the framework",
    ],
    commonMistakes: [
      "Generic policies not tailored to your business",
      "Risk assessment that's a box-ticking exercise",
      "Staff training that's just an online module once a year",
      "Framework that's not updated as the business changes",
    ],
    tips: [
      {
        title: "Start with risk",
        content: "Your AML framework should be built on a genuine understanding of your ML/TF risks. Generic frameworks don't work.",
      },
      {
        title: "Train your people",
        content: "Staff need to understand the risks relevant to their roles, not just pass an annual quiz.",
      },
      {
        title: "Keep it current",
        content: "Review and update your risk assessment when the business changes or new threats emerge.",
      },
    ],
    fcaExpectation:
      "The FCA expects a genuinely risk-based AML framework. They're critical of firms with generic policies that don't reflect actual risks. Payment firms face particular scrutiny given the inherent ML risks in the sector.",
    timeToComplete: "3-5 days",
  },

  "customer-due-diligence": {
    key: "customer-due-diligence",
    title: "Customer Due Diligence",
    plainEnglish:
      "Know who your customers are. Verify their identity, understand what they're trying to do, and assess the risk they pose. Higher-risk customers need more scrutiny.",
    whatGoodLooksLike: [
      "Clear CDD procedures for different customer types",
      "Risk-based approach with enhanced due diligence for higher-risk customers",
      "Ongoing monitoring and periodic reviews",
      "Clear records of CDD performed",
    ],
    commonMistakes: [
      "One-size-fits-all CDD regardless of risk",
      "ID verification but no understanding of customer purpose",
      "CDD at onboarding but no ongoing monitoring",
      "Poor record-keeping making it hard to demonstrate compliance",
    ],
    tips: [
      {
        title: "Understand the customer",
        content: "CDD isn't just ID verification. Understand who the customer is, what they're doing, and whether it makes sense.",
      },
      {
        title: "Risk-rate from the start",
        content: "Assess customer risk at onboarding and adjust your approach accordingly.",
      },
      {
        title: "Keep monitoring",
        content: "CDD is ongoing. Regular reviews should confirm the customer still matches what you expected.",
      },
    ],
    fcaExpectation:
      "The FCA expects robust, risk-based CDD. They will sample customer files during supervisory visits. Weak CDD is a common enforcement finding, particularly failure to apply enhanced due diligence to higher-risk customers.",
    timeToComplete: "2-3 days",
  },

  "transaction-monitoring": {
    key: "transaction-monitoring",
    title: "Transaction Monitoring",
    plainEnglish:
      "Watch what your customers do with their accounts. Look for unusual or suspicious patterns. When you find something concerning, investigate and report if necessary.",
    whatGoodLooksLike: [
      "Monitoring rules calibrated to your risk profile",
      "Alert triage process with clear escalation",
      "Investigation procedures for suspicious activity",
      "Regular tuning of rules based on effectiveness",
    ],
    commonMistakes: [
      "Generic rules that generate too many false positives",
      "Alerts not reviewed in a timely manner",
      "No clear process for escalating to SAR",
      "Rules not updated as patterns change",
    ],
    tips: [
      {
        title: "Calibrate to your business",
        content: "Your monitoring rules should reflect your actual customer base and risk profile, not generic scenarios.",
      },
      {
        title: "Manage your alerts",
        content: "If you're drowning in alerts, tune your rules. A system that generates thousands of false positives isn't effective.",
      },
      {
        title: "Document decisions",
        content: "Keep clear records of alert investigations and decisions. You need to show your thinking.",
      },
    ],
    fcaExpectation:
      "The FCA expects effective transaction monitoring proportionate to your risk. They will look at your alert volumes, investigation quality, and SAR submission patterns. Monitoring that never finds anything is a red flag.",
    timeToComplete: "3-4 days",
  },

  "mlro-appointment": {
    key: "mlro-appointment",
    title: "MLRO Appointment",
    plainEnglish:
      "You need a Money Laundering Reporting Officer - a senior person responsible for your AML systems and making SAR decisions. They need the authority and resources to do the job properly.",
    whatGoodLooksLike: [
      "MLRO with appropriate seniority and experience",
      "Clear authority and reporting line to board",
      "Adequate time and resources to fulfil the role",
      "Deputy arrangements for when MLRO is unavailable",
    ],
    commonMistakes: [
      "MLRO role given to someone too junior",
      "MLRO doesn't have time to do the job properly",
      "No deputy arrangements",
      "MLRO reporting line creates conflicts of interest",
    ],
    tips: [
      {
        title: "Choose someone senior",
        content: "The MLRO needs authority to escalate issues to the board and make difficult decisions.",
      },
      {
        title: "Allocate proper time",
        content: "The MLRO role takes time. Don't assume it can be added to someone's existing full-time job.",
      },
      {
        title: "Plan for absence",
        content: "Have a trained deputy who can act as MLRO when the primary is unavailable.",
      },
    ],
    fcaExpectation:
      "The FCA expects an MLRO with appropriate seniority, expertise, and resources. They will assess whether the MLRO has genuine authority and capacity to fulfil the role effectively.",
    timeToComplete: "1 day",
  },
};

// Helper functions
export function getGuidanceByKey(key: string): GuidanceContent | undefined {
  return guidanceLibrary[key];
}

export function getAllGuidanceKeys(): string[] {
  return Object.keys(guidanceLibrary);
}

export function searchGuidance(query: string): GuidanceContent[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(guidanceLibrary).filter(
    (guidance) =>
      guidance.title.toLowerCase().includes(lowerQuery) ||
      guidance.plainEnglish.toLowerCase().includes(lowerQuery) ||
      guidance.tips.some((tip) => tip.title.toLowerCase().includes(lowerQuery) || tip.content.toLowerCase().includes(lowerQuery))
  );
}
