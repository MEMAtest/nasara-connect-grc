// ============================================================================
// PAYMENTS REGULATORY INTELLIGENCE LIBRARY
// ============================================================================

export interface ThresholdCondition {
  code: string;
  name: string;
  requirement: string;
  evidenceNeeded: string[];
  commonFailures: string[];
  fcaExpectation: string;
  redFlags: string[];
  passIndicators: string[];
}

export interface CapitalRequirement {
  firmType: "PI" | "EMI" | "Small-PI" | "Small-EMI";
  minimumOwnFunds: { eur: number; gbp: number };
  calculationMethod: string;
  tier1Instruments: string[];
  tier2Instruments: string[];
  liquidAssetsRequirement?: {
    percentage: number;
    basis: string;
    formula: string;
    example: string;
  };
  commonMistakes: string[];
  fcaBuffer: string;
}

export interface SectionGuidance {
  sectionKey: string;
  fcaExpectations: string[];
  requiredComponents: Array<{
    component: string;
    description: string;
    example: string;
  }>;
  commonDeficiencies: string[];
  successCriteria: string[];
  handbookReferences: string[];
  templatePhrases: string[];
}

export interface PerimeterGuidance {
  activity: string;
  pergReference: string;
  isRegulated: boolean;
  rationale: string;
  exemptions: Array<{
    name: string;
    conditions: string[];
    documentation: string[];
  }>;
  scenarios: Array<{
    description: string;
    conclusion: string;
    reasoning: string;
  }>;
}

// ============================================================================
// THRESHOLD CONDITIONS FOR PAYMENTS
// ============================================================================

export const THRESHOLD_CONDITIONS: Record<string, ThresholdCondition> = {
  "COND_2_3_LOCATION": {
    code: "COND 2.3",
    name: "Location of Offices",
    requirement: "The firm's mind and management must be exercised in the United Kingdom",
    evidenceNeeded: [
      "At least 2 UK-resident directors with documented 50%+ time commitment",
      "Board meeting minutes showing strategic decisions made in UK",
      "UK office lease agreement (not virtual office)",
      "Employment contracts for UK-based key function holders",
      "Organizational chart showing UK-based reporting lines",
      "Evidence of UK-based operations (not just registered address)"
    ],
    commonFailures: [
      "Directors based overseas with minimal UK presence",
      "Strategic decisions referred to non-UK parent company",
      "Virtual office only with no operational presence",
      "Key function holders (CFO, CRO, MLRO) based outside UK",
      "Board meetings held via video from overseas",
      "Substance appears to be 'brass plate' operation"
    ],
    fcaExpectation: "FCA must be able to effectively supervise the firm. This requires genuine UK presence with decision-making authority, not a token arrangement. Directors must have real authority, not just be nominees for an overseas parent.",
    redFlags: [
      "Single UK director with other directors overseas",
      "No UK-based compliance function",
      "All technology/operations outsourced overseas",
      "Parent company approval required for day-to-day decisions"
    ],
    passIndicators: [
      "2+ UK-resident directors with clear authority",
      "UK-based MLRO, Compliance Officer, and Finance",
      "Regular physical board meetings in UK",
      "Operational staff based in UK"
    ]
  },

  "COND_2_4_CLOSE_LINKS": {
    code: "COND 2.4",
    name: "Close Links",
    requirement: "Close links must not prevent effective supervision",
    evidenceNeeded: [
      "Complete group structure chart to ultimate beneficial owner",
      "Controller applications for all persons with >10% control",
      "Explanation of any non-UK entities in the group",
      "Assessment of whether close links impede supervision",
      "Details of any complex ownership structures"
    ],
    commonFailures: [
      "Incomplete disclosure of group structure",
      "Controllers in non-cooperative jurisdictions",
      "Complex structures designed to obscure ownership",
      "Failure to submit controller applications",
      "Changes to controllers not notified promptly"
    ],
    fcaExpectation: "Complete transparency on ownership and control. FCA needs to understand who ultimately controls the firm and whether there are any factors (jurisdictional, structural) that would impede supervision.",
    redFlags: [
      "Ultimate beneficial owner in high-risk jurisdiction",
      "Nominee shareholders obscuring true ownership",
      "Frequent changes to ownership structure",
      "Multiple layers of holding companies without clear purpose"
    ],
    passIndicators: [
      "Clear, simple ownership structure",
      "All controllers identified and application-ready",
      "Transparent explanation of group rationale",
      "UK-based or cooperative jurisdiction controllers"
    ]
  },

  "COND_2_5_ADEQUATE_RESOURCES": {
    code: "COND 2.5",
    name: "Adequate Resources",
    requirement: "The firm must have adequate resources (financial and non-financial) for the activities it proposes to carry on",
    evidenceNeeded: [
      "Capital adequacy calculation with supporting workings",
      "3-year financial projections with assumptions",
      "Sensitivity/stress testing analysis",
      "Funding plan (how capital will be maintained)",
      "Evidence of committed funding (bank letters, shareholder commitments)",
      "Non-financial resources: staffing plan, IT systems, premises"
    ],
    commonFailures: [
      "Capital calculations at bare minimum with no buffer",
      "Unrealistic revenue projections",
      "No stress testing or downside scenarios",
      "Shareholder funding not committed/documented",
      "Insufficient staffing for proposed activities",
      "IT systems not ready for launch"
    ],
    fcaExpectation: "FCA expects firms to hold 130-150% of minimum capital requirement at authorization. Projections must be realistic with documented assumptions. Stress testing should show firm can survive 12+ months in adverse scenario.",
    redFlags: [
      "Projecting profitability from month 1",
      "Capital exactly at minimum requirement",
      "Single customer dependency in projections",
      "No contingency funding plan",
      "Key hires not yet made"
    ],
    passIndicators: [
      "Capital at 150%+ of minimum requirement",
      "Conservative projections with clear assumptions",
      "Multiple stress scenarios tested",
      "Committed funding documented",
      "Key team already in place or contracted"
    ]
  },

  "COND_2_6_SUITABILITY": {
    code: "COND 2.6",
    name: "Suitability",
    requirement: "The firm must be fit and proper to be authorized",
    evidenceNeeded: [
      "Fit and proper assessments for all SMF holders",
      "DBS checks (or equivalent) for all approved persons",
      "Regulatory references from previous employers",
      "CV verification and qualification checks",
      "Credit checks for relevant individuals",
      "Disclosure of any previous regulatory issues"
    ],
    commonFailures: [
      "Incomplete fit and proper assessments",
      "Undisclosed regulatory history",
      "Insufficient experience for proposed role",
      "Criminal convictions not declared",
      "CCJs or bankruptcy not disclosed",
      "Lack of relevant payments/financial services experience"
    ],
    fcaExpectation: "Full transparency on background of key individuals. Genuine relevant experience required - not just 'financial services' but specific payments experience for a payments firm. Any issues from the past must be disclosed with explanation of what has changed.",
    redFlags: [
      "Gaps in CV/employment history",
      "Evasive answers about previous roles",
      "No direct payments industry experience",
      "Previous firm disciplinary action",
      "Undisclosed directorship of failed company"
    ],
    passIndicators: [
      "Clear relevant experience (payments, banking, fintech)",
      "Clean regulatory history or full disclosure with remediation",
      "Strong references from known institutions",
      "Professional qualifications in compliance/finance"
    ]
  }
};

// ============================================================================
// CAPITAL REQUIREMENTS FOR PAYMENTS
// ============================================================================

export const CAPITAL_REQUIREMENTS: Record<string, CapitalRequirement> = {
  "PI_PAYMENT_ACCOUNTS": {
    firmType: "PI",
    minimumOwnFunds: { eur: 125000, gbp: 108000 },
    calculationMethod: "Higher of: EUR 125,000 OR Method A/B/C calculation",
    tier1Instruments: [
      "Fully paid-up share capital (ordinary shares)",
      "Share premium account",
      "Retained earnings (audited)",
      "Other reserves (verified by external audit)"
    ],
    tier2Instruments: [
      "Subordinated loans (minimum 5-year term, FCA-approved subordination)",
      "Revaluation reserves (for tangible fixed assets only)"
    ],
    commonMistakes: [
      "Including shareholder loans without subordination agreement",
      "Counting forecast profits (must be audited retained earnings)",
      "Using market value of investments (use book value)",
      "Including goodwill or intangible assets",
      "Deducting pending dividends but not from own funds"
    ],
    fcaBuffer: "FCA expects 130-150% of minimum at authorization. Firms should plan for 200% in first year to absorb losses."
  },

  "EMI_FULL": {
    firmType: "EMI",
    minimumOwnFunds: { eur: 350000, gbp: 302000 },
    calculationMethod: "Higher of: EUR 350,000 OR 2% of average outstanding e-money",
    tier1Instruments: [
      "Fully paid-up share capital (ordinary shares)",
      "Share premium account",
      "Retained earnings (audited)",
      "Other reserves (verified by external audit)"
    ],
    tier2Instruments: [
      "Subordinated loans (minimum 5-year term, FCA-approved)",
      "Revaluation reserves (limited)"
    ],
    liquidAssetsRequirement: {
      percentage: 2,
      basis: "Average outstanding e-money",
      formula: "Liquid Assets = MAX(Own Funds Requirement, 2% x Average Outstanding E-Money)",
      example: "If average outstanding e-money is GBP 10m: 2% x GBP 10m = GBP 200k. If own funds requirement is EUR 350k (GBP 302k), liquid assets must be at least GBP 302k (the higher amount)."
    },
    commonMistakes: [
      "Confusing own funds with liquid assets (separate requirements)",
      "Not calculating 2% on average outstanding correctly",
      "Forgetting liquid assets must be unencumbered",
      "Including deposits at non-credit institutions",
      "Not maintaining separate safeguarding account"
    ],
    fcaBuffer: "EMIs should target 200% of minimum own funds at authorization due to the additional liquid assets requirements and safeguarding obligations."
  },

  "PI_MONEY_REMITTANCE": {
    firmType: "PI",
    minimumOwnFunds: { eur: 20000, gbp: 17000 },
    calculationMethod: "EUR 20,000 minimum (Method A/B/C not required for money remittance only)",
    tier1Instruments: [
      "Fully paid-up share capital",
      "Share premium account",
      "Retained earnings (audited)"
    ],
    tier2Instruments: [
      "Subordinated loans (with conditions)"
    ],
    commonMistakes: [
      "Assuming EUR 20k is sufficient if also doing other payment services",
      "Not considering agent network capital needs",
      "Forgetting professional indemnity insurance"
    ],
    fcaBuffer: "Even though minimum is low, FCA expects realistic capital for operations. Typical money remitters need GBP 50-100k+ working capital."
  },

  "PI_AISP_ONLY": {
    firmType: "PI",
    minimumOwnFunds: { eur: 0, gbp: 0 },
    calculationMethod: "No capital requirement, but must have Professional Indemnity Insurance",
    tier1Instruments: [],
    tier2Instruments: [],
    commonMistakes: [
      "Assuming no costs means no capital needed",
      "Insufficient PI insurance coverage",
      "Not maintaining adequate operational funds"
    ],
    fcaBuffer: "While no capital requirement, FCA expects sufficient resources for operations. PI insurance must cover EUR 1m per claim, EUR 1.5m aggregate."
  }
};

// ============================================================================
// CAPITAL CALCULATION METHODS
// ============================================================================

export interface CapitalCalculation {
  methodA: {
    name: "Method A - Fixed Overheads";
    formula: "10% of fixed overheads for previous year";
    applicableTo: string[];
    example: string;
  };
  methodB: {
    name: "Method B - Payment Volume";
    formula: string;
    tiers: Array<{ threshold: number; rate: number }>;
    example: string;
  };
  methodC: {
    name: "Method C - Relevant Income";
    formula: string;
    multiplier: number;
    example: string;
  };
}

export const CAPITAL_CALCULATION_METHODS: CapitalCalculation = {
  methodA: {
    name: "Method A - Fixed Overheads",
    formula: "10% of fixed overheads from previous financial year",
    applicableTo: ["PI with payment accounts", "PI with card issuing", "PI with acquiring"],
    example: "If fixed overheads (rent, salaries, admin, depreciation) were GBP 500k last year: Method A = GBP 500k x 10% = GBP 50k"
  },
  methodB: {
    name: "Method B - Payment Volume",
    formula: "Tiered calculation based on monthly payment volume",
    tiers: [
      { threshold: 5000000, rate: 0.04 },      // 4% of first EUR 5m
      { threshold: 10000000, rate: 0.025 },    // 2.5% of EUR 5m-EUR 10m
      { threshold: 100000000, rate: 0.01 },    // 1% of EUR 10m-EUR 100m
      { threshold: 250000000, rate: 0.005 },   // 0.5% of EUR 100m-EUR 250m
      { threshold: Infinity, rate: 0.0025 }    // 0.25% above EUR 250m
    ],
    example: `Monthly volume EUR 8m:
    First EUR 5m x 4% = EUR 200k
    Next EUR 3m x 2.5% = EUR 75k
    Total = EUR 275k
    Monthly average = EUR 275k / 12 = EUR 22,917`
  },
  methodC: {
    name: "Method C - Relevant Income",
    formula: "10% x Relevant Income x k-factor",
    multiplier: 0.1,
    example: "If relevant income (interest, fees, commissions) is GBP 1m: Method C = GBP 1m x 10% = GBP 100k (k-factor adjustments may apply)"
  }
};

// ============================================================================
// SECTION-SPECIFIC GUIDANCE FOR PAYMENTS
// ============================================================================

export const SECTION_GUIDANCE: Record<string, SectionGuidance> = {
  "business-model": {
    sectionKey: "business-model",
    fcaExpectations: [
      "Clear description of payment services to be offered",
      "Target customer segments with rationale",
      "Revenue model with realistic pricing assumptions",
      "Competitive positioning and differentiation",
      "Path to profitability with realistic timeline (typically 18-36 months)",
      "Scalability considerations"
    ],
    requiredComponents: [
      {
        component: "Service Description",
        description: "Detailed explanation of each payment service",
        example: "We will offer domestic and international money remittance services, enabling customers to send funds from the UK to 45 countries in Africa and Asia. Transactions are initiated via mobile app or web portal, with funds available for cash pickup or bank deposit within 24-48 hours."
      },
      {
        component: "Target Market",
        description: "Who your customers are and why",
        example: "Our target market is the UK diaspora population originating from Sub-Saharan Africa (estimated 1.2m individuals), primarily aged 25-55, who regularly send remittances to family members. Average transaction size: GBP 200-500, frequency: monthly."
      },
      {
        component: "Revenue Model",
        description: "How you make money",
        example: "Revenue comprises: (1) Transaction fees averaging 3% of transfer value, (2) FX margin of 1.5-2% on currency conversion. At projected volumes of GBP 2m monthly by Year 2, this yields monthly revenue of approximately GBP 100k."
      },
      {
        component: "Competitive Analysis",
        description: "How you compare to alternatives",
        example: "Compared to incumbent banks (5-7% total cost), traditional MTOs (4-6%), and digital competitors (2-4%), our target pricing of 4-5% positions us competitively while maintaining margins. Our differentiation is: (1) Superior corridor coverage to underserved markets, (2) Mobile-first UX, (3) Faster payout times."
      }
    ],
    commonDeficiencies: [
      "Vague service descriptions without operational detail",
      "Unrealistic volume projections without supporting evidence",
      "No clear path to profitability",
      "Ignoring regulatory costs in financial model",
      "Claiming differentiation without substance",
      "Not explaining why customers would switch from incumbents"
    ],
    successCriteria: [
      "Services clearly mapped to PSR schedule permissions",
      "Target market sized with credible data sources",
      "Revenue assumptions tested with sensitivity analysis",
      "Break-even timeline of 18-36 months with clear milestones",
      "Realistic customer acquisition costs and strategy"
    ],
    handbookReferences: [
      "PSRs 2017 Schedule 1 - Payment services",
      "Approach Document Chapter 4 - Business model requirements"
    ],
    templatePhrases: [
      "The firm will provide [payment services] to [target customers] via [channels].",
      "Revenue will be generated through [fee structure], with projected margins of [X]%.",
      "We anticipate reaching break-even by [month/year], based on the following assumptions...",
      "Our competitive advantage lies in [specific differentiators]."
    ]
  },

  "safeguarding": {
    sectionKey: "safeguarding",
    fcaExpectations: [
      "Clear choice of safeguarding method (segregation, insurance, or both)",
      "Designated safeguarding account at authorized credit institution",
      "Daily reconciliation procedures with documented process",
      "Clear handling of shortfalls and excesses",
      "Arrangements for annual safeguarding audit (EMIs)",
      "Records demonstrating ability to identify customer funds at all times"
    ],
    requiredComponents: [
      {
        component: "Safeguarding Method",
        description: "How customer funds are protected",
        example: "We will safeguard customer funds through the segregation method. All funds received from customers will be deposited into a designated safeguarding account at [Bank Name], a PRA-authorized credit institution, by close of business on the day of receipt or next business day at latest."
      },
      {
        component: "Reconciliation Process",
        description: "How you ensure funds match liabilities",
        example: "Daily reconciliation will be performed by the Finance team by 10am each business day. The process compares: (1) Safeguarding account balance per bank statement, (2) Customer liability per transaction system, (3) Any timing differences documented. Reconciliation is reviewed and signed off by the Finance Manager."
      },
      {
        component: "Shortfall Handling",
        description: "What happens if safeguarding account is short",
        example: "If daily reconciliation identifies a shortfall (safeguarding account balance < customer liability), the Finance Manager must: (1) Investigate cause within 2 hours, (2) Transfer funds from operational account to cover shortfall same day, (3) Notify MLRO and Compliance if shortfall exceeds GBP 5,000 or occurs >2 times per month, (4) Document root cause and remedial action."
      },
      {
        component: "Audit Arrangements",
        description: "External verification of safeguarding",
        example: "As an EMI, we will engage [Audit Firm] to perform annual safeguarding audits in accordance with SUP 3.10. The audit scope includes: verification of safeguarding account existence, testing of reconciliation procedures, sample testing of customer fund identification, and assessment of controls."
      }
    ],
    commonDeficiencies: [
      "Safeguarding account at non-credit institution",
      "No documented reconciliation procedure",
      "Reconciliation less frequent than daily",
      "No clear escalation for shortfalls",
      "Commingling customer funds with operational funds",
      "No audit arrangements (EMIs)"
    ],
    successCriteria: [
      "Named safeguarding bank with account agreement",
      "Written reconciliation procedure with frequency and sign-off",
      "Shortfall threshold and escalation documented",
      "Sample reconciliation report provided",
      "Audit firm engaged (EMIs)"
    ],
    handbookReferences: [
      "PSRs 2017 Regulation 23 - Safeguarding requirements",
      "Approach Document Chapter 10 - Safeguarding",
      "CASS 7 - Client money rules (for reference)"
    ],
    templatePhrases: [
      "Customer funds are safeguarded through [method] at [credit institution].",
      "Reconciliation is performed [daily/end of business day] by [role].",
      "Any shortfall is remedied by [process] within [timeframe].",
      "Annual safeguarding audits are conducted by [firm] covering [scope]."
    ]
  },

  "aml-ctf": {
    sectionKey: "aml-ctf",
    fcaExpectations: [
      "Firm-wide ML/TF risk assessment tailored to YOUR business model",
      "MLRO appointment with adequate seniority and time allocation",
      "Risk-based CDD/EDD procedures with clear triggers",
      "Transaction monitoring calibrated to payment types and corridors",
      "SAR decision-making process with MLRO oversight",
      "Staff training program with testing and records"
    ],
    requiredComponents: [
      {
        component: "Firm-Wide Risk Assessment",
        description: "Assessment of ML/TF risks across your specific business",
        example: "Our firm-wide risk assessment identifies the following inherent risks:\n\n**Customer Risk**: Medium-High - Diaspora customers may have limited UK credit footprint, making verification challenging. Mitigated by: Enhanced ID verification, proof of address alternatives accepted.\n\n**Product Risk**: High - Money remittance to high-risk jurisdictions (Nigeria, Ghana rated FATF grey/monitored). Mitigated by: Enhanced DD for all transactions to these corridors, lower thresholds for enhanced monitoring.\n\n**Geographic Risk**: High - Corridors include jurisdictions with weak AML regimes. Mitigated by: Correspondent due diligence, PEP/sanctions screening, transaction limits.\n\n**Channel Risk**: Medium - Mobile/online channel limits face-to-face verification. Mitigated by: Electronic ID verification, liveness checks, device fingerprinting."
      },
      {
        component: "CDD/EDD Procedures",
        description: "Customer due diligence with escalation triggers",
        example: "**Standard CDD** (all customers): Name, DOB, address verification via electronic ID check, sanctions/PEP screening.\n\n**Enhanced DD triggers**:\n- Transaction >GBP 5,000\n- Cumulative monthly >GBP 15,000\n- High-risk jurisdiction (list attached)\n- PEP match\n- Adverse media hit\n\n**EDD measures**: Source of funds documentation, enhanced ongoing monitoring, senior management sign-off."
      },
      {
        component: "Transaction Monitoring",
        description: "Rules and thresholds for detecting suspicious activity",
        example: "Transaction monitoring rules (automated via [System Name]):\n\n1. **Velocity**: >3 transactions in 24 hours -> Alert\n2. **Value**: Single transaction >GBP 3,000 -> Review\n3. **Cumulative**: Monthly total >GBP 10,000 -> Enhanced review\n4. **Pattern**: Round amounts (GBP 500, GBP 1000) repeatedly -> Alert\n5. **Geographic**: High-risk corridor + new customer -> Alert\n6. **Behavioral**: Deviation from stated transaction profile -> Alert\n\nAlert investigation: Compliance team review within 24 hours, escalate to MLRO if suspicious."
      },
      {
        component: "SAR Process",
        description: "How suspicious activity reports are handled",
        example: "SAR Process:\n1. Suspicion identified by staff/system -> Report to Compliance\n2. Compliance investigates within 24 hours, documents findings\n3. MLRO reviews and decides: File SAR / No SAR with rationale\n4. SAR filed via NCA portal within 24 hours of MLRO decision\n5. Customer relationship: Continue monitoring / Exit (MLRO decision)\n6. All decisions documented in SAR register with rationale"
      }
    ],
    commonDeficiencies: [
      "Generic risk assessment not tailored to actual business model",
      "No rationale for transaction monitoring thresholds",
      "MLRO role given inadequate time allocation",
      "No evidence of training completion or testing",
      "CDD procedures don't differentiate risk levels",
      "No documented SAR decision-making process"
    ],
    successCriteria: [
      "Risk assessment references specific products/customers/corridors",
      "MLRO has minimum 20% time allocation documented",
      "Transaction monitoring rules have documented rationale",
      "Sample alert investigations available",
      "SAR register template shows decision tracking",
      "Training records with test scores available"
    ],
    handbookReferences: [
      "SYSC 6.3 - Financial crime systems and controls",
      "FCG - Financial crime guide",
      "JMLSG Guidance",
      "MLR 2017"
    ],
    templatePhrases: [
      "Our firm-wide risk assessment identifies [X] as our highest ML/TF risk due to [reason].",
      "Enhanced due diligence is triggered when [conditions].",
      "Transaction monitoring thresholds are calibrated to [rationale].",
      "The MLRO has authority to [decisions] without escalation."
    ]
  },

  "governance": {
    sectionKey: "governance",
    fcaExpectations: [
      "Clear board composition with relevant experience",
      "Documented committee structure (Risk, Audit if applicable)",
      "SMF responsibilities clearly allocated",
      "Decision-making authority documented",
      "Management information (MI) framework",
      "Conflicts of interest policy"
    ],
    requiredComponents: [
      {
        component: "Board Composition",
        description: "Who is on the board and their roles",
        example: "The Board comprises:\n- CEO (SMF1) - [Name], 15 years payments/fintech experience\n- CFO (SMF2) - [Name], qualified accountant, 10 years financial services\n- Non-Executive Director - [Name], independent, former bank compliance director\n- Non-Executive Director - [Name], independent, payments technology background\n\nThe board meets monthly, with quorum requiring CEO + CFO + 1 NED."
      },
      {
        component: "SMF Allocation",
        description: "Senior Management Functions and responsibilities",
        example: "SMF Allocation:\n- SMF1 (CEO): Overall responsibility, strategy, culture\n- SMF2 (CFO): Financial resources, prudential requirements, reporting\n- SMF16 (Compliance Oversight): Regulatory compliance, FCA relationship\n- SMF17 (MLRO): Financial crime, SAR decisions, AML framework\n- SMF24 (Chief Operations): Operational resilience, BCP, technology\n\nStatements of Responsibilities attached for each SMF."
      },
      {
        component: "Management Information",
        description: "What the board monitors",
        example: "Monthly Board MI Pack includes:\n- Financial performance vs budget\n- Capital adequacy and safeguarding status\n- Transaction volumes and values\n- Complaints summary and trends\n- Risk register updates\n- Compliance monitoring findings\n- Incident log\n- Customer outcomes metrics"
      }
    ],
    commonDeficiencies: [
      "Board lacks payments/financial services experience",
      "No independent non-executive directors",
      "SMF responsibilities overlap or have gaps",
      "No documented decision-making authority",
      "MI not tailored to payment services risks",
      "Conflicts of interest not managed"
    ],
    successCriteria: [
      "Board has demonstrable payments experience",
      "Clear SMF allocation with no gaps",
      "Committee terms of reference documented",
      "MI covers all key risk areas",
      "Conflicts policy with register"
    ],
    handbookReferences: [
      "SYSC 4 - General organizational requirements",
      "SYSC 25 - Senior managers and certification regime",
      "SUP 10C - Senior managers"
    ],
    templatePhrases: [
      "The Board has collective experience of [X] years in payments/financial services.",
      "SMF responsibilities are allocated to ensure no single point of failure.",
      "The Board receives MI covering [areas] on a [frequency] basis.",
      "Conflicts of interest are managed through [process]."
    ]
  },

  "operational-resilience": {
    sectionKey: "operational-resilience",
    fcaExpectations: [
      "Important Business Services (IBS) identified",
      "Impact tolerances set for each IBS",
      "Scenario testing completed",
      "Third-party dependencies mapped",
      "Business continuity and disaster recovery plans",
      "Incident management procedures"
    ],
    requiredComponents: [
      {
        component: "Important Business Services",
        description: "Services critical to customers/market",
        example: "We have identified the following Important Business Services:\n\n1. **Payment Execution** - Ability for customers to send remittances\n   - Impact tolerance: Maximum 4-hour disruption\n   - Dependencies: Core banking API, FX provider, payout partners\n\n2. **Customer Onboarding** - Ability to verify and onboard new customers\n   - Impact tolerance: Maximum 24-hour disruption\n   - Dependencies: ID verification provider, sanctions screening\n\n3. **Customer Access** - Ability for customers to access accounts/transaction history\n   - Impact tolerance: Maximum 8-hour disruption\n   - Dependencies: Mobile app infrastructure, web hosting"
      },
      {
        component: "Scenario Testing",
        description: "How you test resilience",
        example: "Annual scenario testing program:\n\n1. **Cyber attack** - Simulated ransomware, tested Q1\n2. **Third-party failure** - Core banking outage, tested Q2\n3. **Key person unavailability** - MLRO absence, tested Q3\n4. **Office inaccessibility** - Remote working activation, tested Q4\n\nTest results documented with lessons learned and remediation actions."
      },
      {
        component: "Incident Management",
        description: "How incidents are handled",
        example: "Incident Response Process:\n1. Detection -> Alert to on-call team (24/7 monitoring)\n2. Triage -> Severity assessment (P1-P4)\n3. Response -> Invoke playbook, assemble response team\n4. Communication -> Customer notification if impact >2 hours\n5. Resolution -> Restore service within impact tolerance\n6. Review -> Post-incident review within 5 business days\n7. Reporting -> FCA notification if material (SUP 15.3)"
      }
    ],
    commonDeficiencies: [
      "IBS not properly identified",
      "Impact tolerances not defined",
      "No evidence of scenario testing",
      "Third-party resilience not assessed",
      "BCP exists but never tested",
      "No incident management process"
    ],
    successCriteria: [
      "IBS mapped to underlying resources",
      "Impact tolerances documented with rationale",
      "Scenario test results available",
      "Third-party due diligence includes resilience",
      "BCP tested within last 12 months"
    ],
    handbookReferences: [
      "PS21/3 - Building operational resilience",
      "SYSC 15A - Operational resilience",
      "SS1/21 - Operational resilience"
    ],
    templatePhrases: [
      "Our Important Business Services are [X, Y, Z] with impact tolerances of [hours].",
      "We conduct scenario testing [frequency] covering [scenarios].",
      "Third-party resilience is assessed through [due diligence process].",
      "Incidents are managed through a [X]-stage process with [escalation]."
    ]
  },

  "capital-financial": {
    sectionKey: "capital-financial",
    fcaExpectations: [
      "Capital requirement calculation with workings",
      "Own funds composition clearly documented",
      "3-year financial projections",
      "Stress testing/sensitivity analysis",
      "Funding plan and commitments",
      "Wind-down planning"
    ],
    requiredComponents: [
      {
        component: "Capital Calculation",
        description: "How minimum capital is determined",
        example: "**Capital Requirement Calculation (PI with Payment Accounts)**\n\nMethod A (Fixed Overheads): GBP 400k x 10% = GBP 40k\nMethod B (Payment Volume): Based on projected Year 1 volume of GBP 2m/month\n- GBP 2m x 12 = GBP 24m annual\n- Tiered calculation: EUR 5m x 4% = EUR 200k, remainder = EUR 0\n- EUR 200k / 12 = EUR 16.7k monthly\n\n**Result**: Higher of EUR 125k minimum or Method A/B = EUR 125k (GBP 108k)\n\n**Buffer**: We will maintain 150% = GBP 162k"
      },
      {
        component: "Own Funds Composition",
        description: "What makes up your capital",
        example: "Own Funds Composition:\n- Share capital: GBP 100,000 (ordinary shares, fully paid)\n- Share premium: GBP 50,000\n- Retained earnings: GBP 12,000 (audited)\n- **Total Own Funds: GBP 162,000**\n\nNo Tier 2 instruments or deductions."
      },
      {
        component: "Financial Projections",
        description: "3-year P&L and cash flow",
        example: "Summary Projections:\n\n| | Year 1 | Year 2 | Year 3 |\n|---|---|---|---|\n| Revenue | GBP 240k | GBP 720k | GBP 1.4m |\n| Costs | GBP 500k | GBP 650k | GBP 900k |\n| Net | (GBP 260k) | GBP 70k | GBP 500k |\n| Cumulative | (GBP 260k) | (GBP 190k) | GBP 310k |\n\nBreak-even: Month 18\nCash runway: 24 months at current burn"
      },
      {
        component: "Stress Testing",
        description: "What happens if things go wrong",
        example: "Stress Scenarios:\n\n**Scenario 1 - Volume 50% below plan**:\n- Revenue impact: -GBP 120k Year 1\n- Cost reduction: -GBP 50k (variable costs)\n- Cash runway: 18 months (vs 24 base case)\n- Mitigation: Reduce marketing spend, delay hires\n\n**Scenario 2 - Major corridor closure**:\n- Revenue impact: -30% if Nigeria corridor closed\n- Mitigation: Diversify corridors, maintain reserve\n\n**Scenario 3 - Key partner failure**:\n- Impact: 2-week service disruption\n- Mitigation: Backup payout partners in key corridors"
      },
      {
        component: "Wind-Down Plan",
        description: "How you would exit the market",
        example: "Wind-Down Plan Summary:\n\n**Trigger**: Board decision based on: (1) Capital below 110% of requirement, (2) Sustained losses >12 months, (3) Regulatory instruction\n\n**Timeline**: 6-month orderly wind-down\n\n**Key Steps**:\n1. Cease new customer onboarding\n2. Complete in-flight transactions (max 5 days)\n3. Return customer funds within 30 days\n4. Notify FCA, customers, partners\n5. Retain records per regulatory requirements\n\n**Wind-Down Reserve**: GBP 150k (6 months fixed costs)"
      }
    ],
    commonDeficiencies: [
      "Capital at bare minimum with no buffer",
      "Projections unrealistically optimistic",
      "No stress testing or single scenario only",
      "Funding not committed/documented",
      "No wind-down plan or underfunded"
    ],
    successCriteria: [
      "Capital at 130-150% of minimum",
      "Projections have documented assumptions",
      "Multiple stress scenarios tested",
      "Funding commitments in writing",
      "Wind-down reserve of 6-12 months costs"
    ],
    handbookReferences: [
      "PSRs 2017 Regulations 6-8 - Capital requirements",
      "Approach Document Chapter 8 - Capital",
      "WDPG - Wind-down planning guide"
    ],
    templatePhrases: [
      "Our capital requirement is calculated as [method] resulting in [amount].",
      "We will maintain own funds at [X]% of the minimum requirement.",
      "Financial projections assume [key assumptions].",
      "Under stress scenario [X], the firm remains viable for [Y] months."
    ]
  }
};

// ============================================================================
// PERIMETER GUIDANCE FOR PAYMENTS
// ============================================================================

export const PERIMETER_GUIDANCE: PerimeterGuidance[] = [
  {
    activity: "Holding customer funds pending payment execution",
    pergReference: "PERG 15.3 - Payment services",
    isRegulated: true,
    rationale: "Operating a payment account and executing payment transactions are regulated payment services under PSRs 2017 Schedule 1.",
    exemptions: [
      {
        name: "Commercial Agent Exemption",
        conditions: [
          "Acting as agent for payer OR payee (not both)",
          "Authority to negotiate/conclude sale of goods/services",
          "Not handling funds (or if handling, acting for one party only)"
        ],
        documentation: [
          "Agency agreement",
          "Evidence of negotiation authority",
          "Fund flow diagram showing one-sided relationship"
        ]
      },
      {
        name: "Limited Network Exemption",
        conditions: [
          "Payment instrument for limited range of goods/services",
          "Limited network of service providers",
          "OR limited geographic area",
          "Must notify FCA if >EUR 1m in 12 months"
        ],
        documentation: [
          "Description of limited network/goods",
          "Transaction volume monitoring",
          "FCA notification (if >EUR 1m)"
        ]
      }
    ],
    scenarios: [
      {
        description: "Marketplace holding buyer payment for 14 days before releasing to seller",
        conclusion: "REGULATED - This is a payment account service (holding funds) plus payment execution (releasing to seller).",
        reasoning: "Even if called 'escrow', the marketplace is executing payment transactions. Requires PI or EMI authorization."
      },
      {
        description: "SaaS platform collecting subscription fees and paying out to creators monthly",
        conclusion: "REGULATED - Payment account operation and fund transfers constitute payment services.",
        reasoning: "The platform is receiving funds from payers and transmitting to payees. This is money remittance or payment account service."
      },
      {
        description: "B2B platform passing card payments directly to merchant via acquirer, never touching funds",
        conclusion: "LIKELY EXEMPT - If truly never touching funds and acting as technical service provider.",
        reasoning: "Technical service providers (processors) that don't hold or control funds may be exempt under PSRs Reg 3(3)(j). Must demonstrate funds flow directly from payer to payee via licensed acquirer."
      }
    ]
  },
  {
    activity: "Providing payment initiation services (PISP)",
    pergReference: "PERG 15.5A - Payment initiation services",
    isRegulated: true,
    rationale: "PISP initiates payment orders at the request of the payment service user with respect to accounts held at another PSP.",
    exemptions: [
      {
        name: "No general exemptions",
        conditions: [
          "PISP is always regulated if service matches definition"
        ],
        documentation: []
      }
    ],
    scenarios: [
      {
        description: "Fintech app that connects to user's bank account via Open Banking to initiate bill payments",
        conclusion: "REGULATED - Classic PISP requiring authorization or registration.",
        reasoning: "Initiating payment orders from accounts held at other providers is the definition of PISP."
      },
      {
        description: "Merchant using Open Banking to pull payments directly from customer accounts",
        conclusion: "REGULATED as PISP if the merchant initiates on behalf of customer.",
        reasoning: "Even if called 'direct debit alternative', if the merchant initiates payment orders from customer accounts, it's PISP."
      }
    ]
  },
  {
    activity: "Issuing electronic money (stored value)",
    pergReference: "PERG 3A - E-money",
    isRegulated: true,
    rationale: "E-money is electronically stored monetary value represented by a claim on the issuer, issued on receipt of funds for making payment transactions.",
    exemptions: [
      {
        name: "Limited Network E-Money Exemption",
        conditions: [
          "Can only be used for specific goods/services",
          "Within premises of issuer OR limited network",
          "OR for limited range of goods/services",
          "Must notify FCA if >EUR 1m outstanding"
        ],
        documentation: [
          "Description of limited use",
          "List of acceptance points",
          "Outstanding e-money monitoring"
        ]
      }
    ],
    scenarios: [
      {
        description: "Digital wallet where customers load funds and spend at any merchant",
        conclusion: "REGULATED as e-money - Requires EMI authorization.",
        reasoning: "Stored value that can be spent generally is e-money. No limited network exemption applies."
      },
      {
        description: "Gift card usable only at specific retail chain",
        conclusion: "POTENTIALLY EXEMPT under limited network exemption.",
        reasoning: "If genuinely limited to specific retailer's stores/websites, may qualify. Must notify FCA if >EUR 1m outstanding."
      },
      {
        description: "Prepaid card for public transport only",
        conclusion: "POTENTIALLY EXEMPT under limited network exemption.",
        reasoning: "Transport cards are specifically mentioned as potentially exempt if limited to transport services."
      }
    ]
  }
];

// ============================================================================
// CONFIDENCE SCORING ALGORITHM
// ============================================================================

export interface ConfidenceScore {
  baseScore: number;
  adjustments: Array<{
    factor: string;
    adjustment: number;
    reason: string;
  }>;
  finalScore: number;
  rating: "GREEN" | "AMBER" | "RED";
  letterGrade: "A" | "B" | "C" | "D";
  hardGateFailures: string[];
  criticalGaps: string[];
  recommendations: string[];
}

export function calculateConfidenceScore(responses: Record<string, any>): ConfidenceScore {
  let baseScore = 100;
  const adjustments: ConfidenceScore["adjustments"] = [];
  const hardGateFailures: string[] = [];
  const criticalGaps: string[] = [];
  const recommendations: string[] = [];

  // Hard Gates - Immediate failures
  if (responses["pc-001"]?.value < 2) {
    hardGateFailures.push("UK Presence (COND 2.3)");
    adjustments.push({
      factor: "UK Presence Hard Gate",
      adjustment: -90,
      reason: "Fewer than 2 UK-resident directors with adequate time commitment"
    });
  }

  // Critical Factor Penalties
  if (!responses["pc-002"] || responses["pc-002"]?.value < 2) {
    adjustments.push({
      factor: "SMF Suitability",
      adjustment: -15,
      reason: "Incomplete fit and proper assessments for SMF holders"
    });
    criticalGaps.push("SMF suitability assessments incomplete");
  }

  if (!responses["fc-001"] || responses["fc-001"]?.value < 2) {
    adjustments.push({
      factor: "MLRO/AML Framework",
      adjustment: -10,
      reason: "MLRO not appointed or AML framework incomplete"
    });
    criticalGaps.push("MLRO appointment and AML framework");
  }

  if (!responses["fin-001"] || responses["fin-001"]?.value < 2) {
    adjustments.push({
      factor: "Financial Projections",
      adjustment: -15,
      reason: "Financial projections incomplete or unrealistic"
    });
    criticalGaps.push("Financial projections and capital planning");
  }

  // Payments-Specific Penalties
  if (responses["ps-003"]?.value === "not-applicable") {
    // AISP only - no safeguarding needed
  } else if (!responses["ps-003"] || !responses["ps-004"] || responses["ps-004"]?.value < 2) {
    adjustments.push({
      factor: "Safeguarding",
      adjustment: -20,
      reason: "Safeguarding arrangements incomplete"
    });
    criticalGaps.push("Safeguarding arrangements and reconciliation");
  }

  // Calculate final score
  let finalScore = baseScore;
  adjustments.forEach(adj => {
    finalScore += adj.adjustment;
  });
  finalScore = Math.max(0, Math.min(100, finalScore));

  // If hard gate failed, cap at 10%
  if (hardGateFailures.length > 0) {
    finalScore = Math.min(finalScore, 10);
  }

  // Determine rating
  let rating: ConfidenceScore["rating"];
  let letterGrade: ConfidenceScore["letterGrade"];

  if (finalScore >= 80) {
    rating = "GREEN";
    letterGrade = finalScore >= 85 ? "A" : "B";
  } else if (finalScore >= 60) {
    rating = "AMBER";
    letterGrade = finalScore >= 70 ? "B" : "C";
  } else {
    rating = "RED";
    letterGrade = finalScore >= 55 ? "C" : "D";
  }

  // Generate recommendations
  if (hardGateFailures.length > 0) {
    recommendations.push(`CRITICAL: Address ${hardGateFailures.join(", ")} before proceeding - these are threshold conditions.`);
  }
  criticalGaps.forEach(gap => {
    recommendations.push(`Complete: ${gap}`);
  });

  return {
    baseScore,
    adjustments,
    finalScore,
    rating,
    letterGrade,
    hardGateFailures,
    criticalGaps,
    recommendations
  };
}

// ============================================================================
// FCA DECISION LETTER PATTERNS
// ============================================================================

export interface RefusalPattern {
  category: string;
  frequency: "common" | "occasional" | "rare";
  description: string;
  indicators: string[];
  remediation: string[];
  exampleQuotes: string[];
}

export const REFUSAL_PATTERNS: RefusalPattern[] = [
  {
    category: "Inadequate UK Presence",
    frequency: "common",
    description: "FCA found insufficient mind and management exercised in the UK",
    indicators: [
      "Single UK-based director",
      "Directors spending <50% time on firm business",
      "Strategic decisions referred to overseas parent",
      "Key functions (compliance, finance) based outside UK",
      "Virtual office only"
    ],
    remediation: [
      "Appoint additional UK-resident director(s)",
      "Document time allocation in employment contracts",
      "Establish UK-based decision-making authority",
      "Hire UK-based compliance and finance functions",
      "Secure physical office premises"
    ],
    exampleQuotes: [
      "The Authority is not satisfied that the firm's mind and management would be exercised in the United Kingdom.",
      "The proposed arrangements do not demonstrate genuine UK decision-making authority.",
      "Key operational decisions appear to require referral to the overseas parent company."
    ]
  },
  {
    category: "Insufficient Capital/Financial Resources",
    frequency: "common",
    description: "Capital at or below minimum with no buffer, unrealistic projections",
    indicators: [
      "Own funds exactly at minimum requirement",
      "Projections show profitability from month 1",
      "No stress testing or single optimistic scenario",
      "Funding not committed in writing",
      "Shareholder loans without subordination"
    ],
    remediation: [
      "Increase capital to 150%+ of minimum",
      "Develop realistic projections with documented assumptions",
      "Complete multiple stress scenarios",
      "Obtain committed funding letters from investors",
      "Formalize subordination agreements"
    ],
    exampleQuotes: [
      "The firm's capital position does not provide an adequate buffer above the minimum requirement.",
      "The financial projections do not appear to be based on realistic assumptions.",
      "There is insufficient evidence of committed funding to support the business plan."
    ]
  },
  {
    category: "Weak AML/Financial Crime Framework",
    frequency: "common",
    description: "Generic or incomplete AML arrangements not tailored to business model",
    indicators: [
      "Risk assessment uses generic template language",
      "Transaction monitoring thresholds not justified",
      "MLRO has inadequate time allocation",
      "No evidence of staff training completion",
      "SAR process not documented"
    ],
    remediation: [
      "Rewrite risk assessment specific to your customers/products/geographies",
      "Document rationale for all monitoring thresholds",
      "Increase MLRO time allocation and document in contract",
      "Implement training with testing and records",
      "Document SAR decision-making process"
    ],
    exampleQuotes: [
      "The firm-wide risk assessment does not adequately address the specific ML/TF risks arising from the proposed business model.",
      "Transaction monitoring thresholds do not appear to be calibrated to the firm's risk profile.",
      "There is insufficient evidence that the MLRO would have adequate time and resources."
    ]
  },
  {
    category: "Safeguarding Deficiencies",
    frequency: "common",
    description: "Safeguarding arrangements incomplete or inadequate",
    indicators: [
      "No designated safeguarding account",
      "Account at non-credit institution",
      "No daily reconciliation procedure",
      "Shortfall handling not documented",
      "No audit arrangements (EMIs)"
    ],
    remediation: [
      "Open designated safeguarding account at authorized bank",
      "Document daily reconciliation procedure",
      "Establish shortfall notification and top-up process",
      "Engage auditor for annual safeguarding audit (EMIs)"
    ],
    exampleQuotes: [
      "The proposed safeguarding arrangements do not meet the requirements of PSRs 2017.",
      "There is no evidence of robust reconciliation procedures.",
      "The arrangements for safeguarding audits are inadequate."
    ]
  },
  {
    category: "Fit and Proper Concerns",
    frequency: "occasional",
    description: "Concerns about suitability of key individuals",
    indicators: [
      "Gaps in employment history unexplained",
      "Previous regulatory issues not disclosed",
      "Lack of relevant payments experience",
      "Poor regulatory references",
      "Criminal convictions or CCJs"
    ],
    remediation: [
      "Provide complete explanations for CV gaps",
      "Fully disclose all previous regulatory matters with remediation",
      "Add experienced payments professionals to team",
      "Obtain positive references from known institutions",
      "Address any outstanding financial issues"
    ],
    exampleQuotes: [
      "The Authority has concerns about the fitness and propriety of [individual] to perform the proposed SMF role.",
      "There are unexplained gaps in the employment history that raise questions about suitability.",
      "The proposed [SMF role] does not have sufficient relevant experience."
    ]
  }
];

export default {
  THRESHOLD_CONDITIONS,
  CAPITAL_REQUIREMENTS,
  CAPITAL_CALCULATION_METHODS,
  SECTION_GUIDANCE,
  PERIMETER_GUIDANCE,
  calculateConfidenceScore,
  REFUSAL_PATTERNS
};
