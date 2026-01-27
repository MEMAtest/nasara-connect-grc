# Payments Authorization Module - Complete Build Specification

> **Purpose**: This document provides complete specifications for an AI to build out all missing features for the payments (PI/EMI) authorization module in Nasara Connect.

---

## TABLE OF CONTENTS

1. [Missing Question Bank - Common Areas](#1-missing-question-bank---common-areas)
2. [Missing Question Bank - Payments Specific](#2-missing-question-bank---payments-specific)
3. [Regulatory Intelligence Library](#3-regulatory-intelligence-library)
4. [Production Readiness Fixes](#4-production-readiness-fixes)
5. [Implementation Files](#5-implementation-files)

---

## 1. MISSING QUESTION BANK - COMMON AREAS

### File: `src/app/(dashboard)/authorization-pack/lib/questionBank.ts`

Add the following sections and questions to the existing question bank.

### 1.1 People & Capability Section (NEW - 5 questions)

```typescript
{
  id: "people-capability",
  title: "People & Capability",
  description: "Assessment of key personnel, UK presence, and organizational capability",
  questions: [
    {
      id: "pc-001",
      question: "Do you have at least two UK-resident directors who will dedicate 50%+ of their time to the firm?",
      helpText: "FCA requires 'mind and management' exercised in the UK. Directors must be genuinely UK-based with decision-making authority, not just on paper.",
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
      hardGateMessage: "UK presence is a threshold condition. Failure here will result in automatic refusal.",
      evidenceRequired: [
        "Director CVs with UK address confirmation",
        "Employment contracts showing time allocation",
        "Board meeting schedule (must be UK-based)"
      ],
      fcaReference: "COND 2.3 - Location of Offices"
    },
    {
      id: "pc-002",
      question: "Have suitability assessments (fit and proper) been completed for all proposed SMF holders?",
      helpText: "Each Senior Management Function holder needs documented assessment of honesty/integrity, competence/capability, and financial soundness.",
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
      id: "pc-003",
      question: "Is your ownership and controllers chart complete with all persons with >10% control identified?",
      helpText: "Include all shareholders, beneficial owners, and anyone with significant influence. Controllers need FCA approval.",
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
      helpText: "Identify gaps in compliance, finance, operations, technology. Include recruitment timeline or upskilling plans.",
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
      question: "Are staff incentive structures aligned to good customer outcomes (not purely volume-driven)?",
      helpText: "Consumer Duty requires that remuneration doesn't incentivize poor customer outcomes. Sales-only targets are problematic.",
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
}
```

### 1.2 Financial Crime Section (NEW - 4 questions)

```typescript
{
  id: "financial-crime",
  title: "Financial Crime Prevention",
  description: "AML/CTF framework, MLRO appointment, and financial crime controls",
  questions: [
    {
      id: "fc-001",
      question: "Has an MLRO been appointed with a firm-wide risk assessment and documented AML procedures?",
      helpText: "MLRO must have sufficient seniority, time allocation (typically 20%+ for small firms), and independence. Risk assessment must be tailored to YOUR business model.",
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
      helpText: "Must define when standard CDD applies vs enhanced due diligence. PEPs, high-risk jurisdictions, complex structures require EDD.",
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
      question: "Are screening tools and transaction monitoring calibrated to your products and customer base?",
      helpText: "Generic thresholds won't work. Must be risk-based: cross-border remittance to high-risk countries needs different rules than domestic payments.",
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
      helpText: "All staff need baseline training. Customer-facing and compliance staff need role-specific training. Annual refreshers required.",
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
}
```

### 1.3 Operational Resilience Section (NEW - 4 questions)

```typescript
{
  id: "operational-resilience",
  title: "Operational Resilience",
  description: "Business continuity, important business services, and third-party risk management",
  questions: [
    {
      id: "or-001",
      question: "Have you identified your Important Business Services (IBS) with impact tolerances?",
      helpText: "IBS = services that if disrupted would cause intolerable harm to customers or market integrity. Must define maximum tolerable disruption period.",
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
      question: "Do critical outsourcing arrangements have due diligence, contracts with exit plans, and oversight KPIs?",
      helpText: "Cloud providers, payment processors, KYC vendors = critical. Need right to audit, data portability, termination rights, and regular performance reviews.",
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
      question: "Are IT security controls documented (access management, logging, vulnerability management, incident response)?",
      helpText: "Must cover: MFA for all systems, RBAC, security logging/SIEM, regular vulnerability scanning, penetration testing, and incident response playbooks.",
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
      helpText: "BCP must cover key scenarios: office inaccessible, key person unavailable, system failure, cyber incident. DR must have defined RTOs and RPOs.",
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
}
```

### 1.4 Consumer Duty & Conduct Section (NEW - 4 questions)

```typescript
{
  id: "consumer-duty",
  title: "Consumer Duty & Conduct",
  description: "Consumer Duty compliance, fair value, and customer outcomes monitoring",
  questions: [
    {
      id: "cd-001",
      question: "Have you defined your target market and completed a fair value assessment for each product?",
      helpText: "Must identify who the product IS and ISN'T for. Fair value = price is reasonable relative to benefits. Document the assessment.",
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
      question: "Do you have a process for financial promotions approval with record-keeping?",
      helpText: "All promotions must be clear, fair, not misleading. Need approval workflow, sign-off authority, and retention of all versions.",
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
      helpText: "Must identify vulnerability characteristics, train staff to recognize signs, and have procedures to provide appropriate support.",
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
      fcaReference: "FG21/1 - Guidance for firms on the fair treatment of vulnerable customers"
    },
    {
      id: "cd-004",
      question: "Do you have a complaints handling procedure aligned to DISP with root-cause analysis?",
      helpText: "8-week resolution deadline, final response letters, FOS signposting, MI on complaint trends, root-cause analysis to fix systemic issues.",
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
}
```

### 1.5 Data Protection Section (NEW - 3 questions)

```typescript
{
  id: "data-protection",
  title: "Data Protection",
  description: "GDPR compliance, data processing, and privacy controls",
  questions: [
    {
      id: "dp-001",
      question: "Have you documented lawful bases for all processing activities with a Record of Processing Activities (ROPA)?",
      helpText: "Each processing activity needs a lawful basis (consent, contract, legal obligation, etc.). ROPA is mandatory for most firms.",
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
      question: "Are technical and organizational measures (TOMs) documented with a breach response plan?",
      helpText: "TOMs = encryption, access controls, pseudonymization, etc. Breach plan must enable 72-hour ICO notification.",
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
      helpText: "Balance regulatory retention requirements (e.g., 5 years for AML) with GDPR minimization. Must have defensible deletion process.",
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
}
```

---

## 2. MISSING QUESTION BANK - PAYMENTS SPECIFIC

### 2.1 Payment Services Sector Questions (NEW - 12 questions)

```typescript
{
  id: "payments-specific",
  title: "Payment Services Specific",
  description: "Questions specific to Payment Institution and E-Money Institution authorization",
  applicableTo: ["payments-emi", "payments-pi"],
  questions: [
    {
      id: "ps-001",
      question: "What payment services will you provide?",
      helpText: "Select all that apply. Each service has different capital and safeguarding requirements.",
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
      helpText: "EMI if you issue e-money (stored value). PI if you only execute payments. EMI has higher capital requirements (€350k vs €125k for payment accounts).",
      type: "single-select",
      options: [
        { value: "pi", label: "Payment Institution (PI)" },
        { value: "emi", label: "E-Money Institution (EMI)" },
        { value: "small-pi", label: "Small Payment Institution (under €3m/month)" },
        { value: "small-emi", label: "Small EMI (under €5m outstanding)" }
      ],
      weight: 3,
      required: true,
      critical: true,
      capitalImplications: {
        "pi": { method: "A/B/C", minimum: 125000 },
        "emi": { method: "D", minimum: 350000, liquidAssets: true },
        "small-pi": { method: "none", minimum: 0 },
        "small-emi": { method: "none", minimum: 0 }
      },
      fcaReference: "PSRs 2017 Regulation 6-7"
    },
    {
      id: "ps-003",
      question: "What is your safeguarding approach for customer funds?",
      helpText: "Segregation = separate account at credit institution. Insurance = must cover 100% of customer funds. Mixed approach possible but complex.",
      type: "single-select",
      options: [
        { value: "segregation", label: "Segregation in separate account at credit institution" },
        { value: "insurance", label: "Insurance or guarantee from authorized insurer/credit institution" },
        { value: "mixed", label: "Combination of segregation and insurance" },
        { value: "not-applicable", label: "Not applicable (AISP only)" }
      ],
      weight: 3,
      required: true,
      critical: true,
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
      question: "Do you have daily safeguarding reconciliation procedures with documented shortfall/excess handling?",
      helpText: "Must reconcile daily. Shortfall = top up within same business day. Excess = return to operational account. Records must be auditable.",
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
      question: "Have you implemented Strong Customer Authentication (SCA) for payment initiation and account access?",
      helpText: "SCA = 2 of 3 factors (knowledge, possession, inherence). Exemptions available for low-value, recurring, trusted beneficiaries - must document usage.",
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
      question: "Do you have an agent/distributor network, and if so, is there a due diligence and oversight framework?",
      helpText: "Agents act on your behalf - you're responsible for their actions. Need robust onboarding, ongoing monitoring, and termination procedures.",
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
      helpText: "Needed for capital calculation (Method B uses payment volume). Be realistic - FCA will scrutinize projections.",
      type: "numeric-table",
      columns: ["Year 1", "Year 2", "Year 3"],
      rows: ["Monthly Payment Volume (£)", "Number of Transactions", "Average Transaction Value"],
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
      question: "Do you have fraud prevention and transaction monitoring systems appropriate to your payment services?",
      helpText: "Must detect: unusual patterns, velocity checks, geo anomalies, device fingerprinting. Real-time for high-risk transactions.",
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
      helpText: "D+1 for UK/EEA payments. Must clearly communicate cut-off times. Different rules for different payment types.",
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
      helpText: "From Oct 2024: mandatory reimbursement for APP fraud victims (with exceptions). Must have processes and funding for reimbursement.",
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
      helpText: "Direct membership (Visa, Mastercard, BACS, FPS) or sponsor bank arrangement. Each has different requirements and costs.",
      type: "single-select",
      options: [
        { value: "direct", label: "Direct scheme membership" },
        { value: "sponsored", label: "Sponsored access via bank" },
        { value: "both", label: "Mix of direct and sponsored" },
        { value: "not-required", label: "Not required for my services" }
      ],
      weight: 2,
      required: true,
      conditionalOn: { questionId: "ps-001", values: ["payment-accounts", "card-issuing", "merchant-acquiring"] },
      evidenceRequired: [
        "Scheme membership documentation (or application status)",
        "Sponsor bank agreement",
        "Scheme compliance certification"
      ]
    },
    {
      id: "ps-012",
      question: "Do you have arrangements for safeguarding audits (annual for EMIs, as needed for PIs)?",
      helpText: "EMIs must have annual safeguarding audit by external accountant. PIs should have capability to produce audit on request.",
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
```

---

## 3. REGULATORY INTELLIGENCE LIBRARY

### File: `src/lib/fca-intelligence/payments-regulatory-intelligence.ts`

```typescript
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
    calculationMethod: "Higher of: €125,000 OR Method A/B/C calculation",
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
    calculationMethod: "Higher of: €350,000 OR 2% of average outstanding e-money",
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
      formula: "Liquid Assets = MAX(Own Funds Requirement, 2% × Average Outstanding E-Money)",
      example: "If average outstanding e-money is £10m: 2% × £10m = £200k. If own funds requirement is €350k (£302k), liquid assets must be at least £302k (the higher amount)."
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
    calculationMethod: "€20,000 minimum (Method A/B/C not required for money remittance only)",
    tier1Instruments: [
      "Fully paid-up share capital",
      "Share premium account",
      "Retained earnings (audited)"
    ],
    tier2Instruments: [
      "Subordinated loans (with conditions)"
    ],
    commonMistakes: [
      "Assuming €20k is sufficient if also doing other payment services",
      "Not considering agent network capital needs",
      "Forgetting professional indemnity insurance"
    ],
    fcaBuffer: "Even though minimum is low, FCA expects realistic capital for operations. Typical money remitters need £50-100k+ working capital."
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
    fcaBuffer: "While no capital requirement, FCA expects sufficient resources for operations. PI insurance must cover €1m per claim, €1.5m aggregate."
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
    example: "If fixed overheads (rent, salaries, admin, depreciation) were £500k last year: Method A = £500k × 10% = £50k"
  },
  methodB: {
    name: "Method B - Payment Volume",
    formula: "Tiered calculation based on monthly payment volume",
    tiers: [
      { threshold: 5000000, rate: 0.04 },      // 4% of first €5m
      { threshold: 10000000, rate: 0.025 },    // 2.5% of €5m-€10m
      { threshold: 100000000, rate: 0.01 },    // 1% of €10m-€100m
      { threshold: 250000000, rate: 0.005 },   // 0.5% of €100m-€250m
      { threshold: Infinity, rate: 0.0025 }    // 0.25% above €250m
    ],
    example: `Monthly volume €8m:
    First €5m × 4% = €200k
    Next €3m × 2.5% = €75k
    Total = €275k
    Monthly average = €275k / 12 = €22,917`
  },
  methodC: {
    name: "Method C - Relevant Income",
    formula: "10% × Relevant Income × k-factor",
    multiplier: 0.1,
    example: "If relevant income (interest, fees, commissions) is £1m: Method C = £1m × 10% = £100k (k-factor adjustments may apply)"
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
        example: "Our target market is the UK diaspora population originating from Sub-Saharan Africa (estimated 1.2m individuals), primarily aged 25-55, who regularly send remittances to family members. Average transaction size: £200-500, frequency: monthly."
      },
      {
        component: "Revenue Model",
        description: "How you make money",
        example: "Revenue comprises: (1) Transaction fees averaging 3% of transfer value, (2) FX margin of 1.5-2% on currency conversion. At projected volumes of £2m monthly by Year 2, this yields monthly revenue of approximately £100k."
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
        example: "If daily reconciliation identifies a shortfall (safeguarding account balance < customer liability), the Finance Manager must: (1) Investigate cause within 2 hours, (2) Transfer funds from operational account to cover shortfall same day, (3) Notify MLRO and Compliance if shortfall exceeds £5,000 or occurs >2 times per month, (4) Document root cause and remedial action."
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
        example: "**Standard CDD** (all customers): Name, DOB, address verification via electronic ID check, sanctions/PEP screening.\n\n**Enhanced DD triggers**:\n- Transaction >£5,000\n- Cumulative monthly >£15,000\n- High-risk jurisdiction (list attached)\n- PEP match\n- Adverse media hit\n\n**EDD measures**: Source of funds documentation, enhanced ongoing monitoring, senior management sign-off."
      },
      {
        component: "Transaction Monitoring",
        description: "Rules and thresholds for detecting suspicious activity",
        example: "Transaction monitoring rules (automated via [System Name]):\n\n1. **Velocity**: >3 transactions in 24 hours → Alert\n2. **Value**: Single transaction >£3,000 → Review\n3. **Cumulative**: Monthly total >£10,000 → Enhanced review\n4. **Pattern**: Round amounts (£500, £1000) repeatedly → Alert\n5. **Geographic**: High-risk corridor + new customer → Alert\n6. **Behavioral**: Deviation from stated transaction profile → Alert\n\nAlert investigation: Compliance team review within 24 hours, escalate to MLRO if suspicious."
      },
      {
        component: "SAR Process",
        description: "How suspicious activity reports are handled",
        example: "SAR Process:\n1. Suspicion identified by staff/system → Report to Compliance\n2. Compliance investigates within 24 hours, documents findings\n3. MLRO reviews and decides: File SAR / No SAR with rationale\n4. SAR filed via NCA portal within 24 hours of MLRO decision\n5. Customer relationship: Continue monitoring / Exit (MLRO decision)\n6. All decisions documented in SAR register with rationale"
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
        example: "Incident Response Process:\n1. Detection → Alert to on-call team (24/7 monitoring)\n2. Triage → Severity assessment (P1-P4)\n3. Response → Invoke playbook, assemble response team\n4. Communication → Customer notification if impact >2 hours\n5. Resolution → Restore service within impact tolerance\n6. Review → Post-incident review within 5 business days\n7. Reporting → FCA notification if material (SUP 15.3)"
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
        example: "**Capital Requirement Calculation (PI with Payment Accounts)**\n\nMethod A (Fixed Overheads): £400k × 10% = £40k\nMethod B (Payment Volume): Based on projected Year 1 volume of £2m/month\n- £2m × 12 = £24m annual\n- Tiered calculation: €5m × 4% = €200k, remainder = €0\n- €200k / 12 = €16.7k monthly\n\n**Result**: Higher of €125k minimum or Method A/B = €125k (£108k)\n\n**Buffer**: We will maintain 150% = £162k"
      },
      {
        component: "Own Funds Composition",
        description: "What makes up your capital",
        example: "Own Funds Composition:\n- Share capital: £100,000 (ordinary shares, fully paid)\n- Share premium: £50,000\n- Retained earnings: £12,000 (audited)\n- **Total Own Funds: £162,000**\n\nNo Tier 2 instruments or deductions."
      },
      {
        component: "Financial Projections",
        description: "3-year P&L and cash flow",
        example: "Summary Projections:\n\n| | Year 1 | Year 2 | Year 3 |\n|---|---|---|---|\n| Revenue | £240k | £720k | £1.4m |\n| Costs | £500k | £650k | £900k |\n| Net | (£260k) | £70k | £500k |\n| Cumulative | (£260k) | (£190k) | £310k |\n\nBreak-even: Month 18\nCash runway: 24 months at current burn"
      },
      {
        component: "Stress Testing",
        description: "What happens if things go wrong",
        example: "Stress Scenarios:\n\n**Scenario 1 - Volume 50% below plan**:\n- Revenue impact: -£120k Year 1\n- Cost reduction: -£50k (variable costs)\n- Cash runway: 18 months (vs 24 base case)\n- Mitigation: Reduce marketing spend, delay hires\n\n**Scenario 2 - Major corridor closure**:\n- Revenue impact: -30% if Nigeria corridor closed\n- Mitigation: Diversify corridors, maintain reserve\n\n**Scenario 3 - Key partner failure**:\n- Impact: 2-week service disruption\n- Mitigation: Backup payout partners in key corridors"
      },
      {
        component: "Wind-Down Plan",
        description: "How you would exit the market",
        example: "Wind-Down Plan Summary:\n\n**Trigger**: Board decision based on: (1) Capital below 110% of requirement, (2) Sustained losses >12 months, (3) Regulatory instruction\n\n**Timeline**: 6-month orderly wind-down\n\n**Key Steps**:\n1. Cease new customer onboarding\n2. Complete in-flight transactions (max 5 days)\n3. Return customer funds within 30 days\n4. Notify FCA, customers, partners\n5. Retain records per regulatory requirements\n\n**Wind-Down Reserve**: £150k (6 months fixed costs)"
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
          "Must notify FCA if >€1m in 12 months"
        ],
        documentation: [
          "Description of limited network/goods",
          "Transaction volume monitoring",
          "FCA notification (if >€1m)"
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
          "Must notify FCA if >€1m outstanding"
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
        reasoning: "If genuinely limited to specific retailer's stores/websites, may qualify. Must notify FCA if >€1m outstanding."
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
```

---

## 4. PRODUCTION READINESS FIXES

### File: `src/lib/api-utils.ts` (NEW)

```typescript
// ============================================================================
// API UTILITIES - Production Readiness
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logError } from "./logger";

// ============================================================================
// 1. STRUCTURED ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV !== "production" && { details: error.details }),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          fields: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  logError(error, "Unhandled API error");
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

// ============================================================================
// 2. INPUT VALIDATION WITH ZOD
// ============================================================================

export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

// Common schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const UUIDSchema = z.string().uuid();

export const DateStringSchema = z.string().datetime().optional().nullable();

// ============================================================================
// 3. RATE LIMITING
// ============================================================================

let ratelimit: Ratelimit | null = null;

function getRatelimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Rate limiting disabled: Missing Upstash Redis configuration");
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per minute default
      analytics: true,
    });
  }

  return ratelimit;
}

export interface RateLimitConfig {
  requests: number;
  window: string; // e.g., "60 s", "1 m", "1 h"
  identifier?: (request: NextRequest) => string;
}

export async function checkRateLimit(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
): Promise<{ success: boolean; headers: Record<string, string> }> {
  const limiter = getRatelimiter();

  if (!limiter) {
    return { success: true, headers: {} };
  }

  const identifier = config?.identifier
    ? config.identifier(request)
    : request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "anonymous";

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  return { success, headers };
}

export function rateLimitExceeded(headers: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    },
    { status: 429, headers }
  );
}

// ============================================================================
// 4. PAGINATION HELPERS
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPaginationParams(request: NextRequest): { page: number; limit: number; offset: number } {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ============================================================================
// 5. SOFT DELETE HELPERS
// ============================================================================

export interface SoftDeleteFields {
  deleted_at: Date | null;
  deleted_by: string | null;
}

export function softDeleteClause(alias?: string): string {
  const prefix = alias ? `${alias}.` : "";
  return `${prefix}deleted_at IS NULL`;
}

// ============================================================================
// 6. OPTIMISTIC LOCKING
// ============================================================================

export class ConcurrencyError extends ApiError {
  constructor(entityType: string, currentVersion: number, updatedBy?: string) {
    super(
      409,
      "CONCURRENCY_CONFLICT",
      `This ${entityType} was modified by another user. Please refresh and try again.`,
      { currentVersion, updatedBy }
    );
  }
}

// ============================================================================
// 7. AUDIT LOGGING
// ============================================================================

export interface AuditLogEntry {
  entityType: string;
  entityId: string;
  action: "created" | "updated" | "deleted" | "viewed";
  actorId: string;
  organizationId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(
  pool: any,
  entry: AuditLogEntry
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO authorization_pack_audit_log
       (entity_type, entity_id, action, actor_id, organization_id, changes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.actorId,
        entry.organizationId,
        JSON.stringify(entry.changes || {}),
        JSON.stringify(entry.metadata || {}),
      ]
    );
  } catch (error) {
    logError(error, "Failed to write audit log");
    // Don't throw - audit logging should not break the main operation
  }
}
```

### File: `src/lib/file-upload-security.ts` (NEW)

```typescript
// ============================================================================
// FILE UPLOAD SECURITY
// ============================================================================

import { fileTypeFromBuffer } from "file-type";
import { logError } from "./logger";

// ============================================================================
// CONFIGURATION
// ============================================================================

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB

  allowedMimeTypes: new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
    "image/png",
    "image/jpeg",
    "image/gif",
    "text/plain",
    "text/csv",
  ]),

  allowedExtensions: new Set([
    ".pdf",
    ".docx",
    ".doc",
    ".xlsx",
    ".xls",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".txt",
    ".csv",
  ]),

  dangerousExtensions: new Set([
    ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".jar",
    ".msi", ".dll", ".scr", ".com", ".pif", ".application", ".gadget",
    ".msp", ".hta", ".cpl", ".msc", ".wsf", ".wsh", ".ws",
  ]),
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
}

export async function validateFileUpload(
  file: File,
  config = FILE_UPLOAD_CONFIG
): Promise<FileValidationResult> {
  // 1. Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`,
    };
  }

  // 2. Check extension
  const ext = getFileExtension(file.name).toLowerCase();

  if (config.dangerousExtensions.has(ext)) {
    return {
      valid: false,
      error: "This file type is not allowed for security reasons",
    };
  }

  if (!config.allowedExtensions.has(ext)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${Array.from(config.allowedExtensions).join(", ")}`,
    };
  }

  // 3. Check declared MIME type
  if (file.type && !config.allowedMimeTypes.has(file.type)) {
    return {
      valid: false,
      error: "Invalid file MIME type",
    };
  }

  // 4. Detect actual file type from magic numbers
  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = await detectFileType(buffer);

  if (detectedType && !config.allowedMimeTypes.has(detectedType)) {
    return {
      valid: false,
      error: "File content does not match an allowed type",
    };
  }

  // 5. Check for file type mismatch (potential spoofing)
  if (detectedType && file.type && detectedType !== file.type) {
    // Allow some flexibility for similar types
    const isSimilar = areSimilarMimeTypes(file.type, detectedType);
    if (!isSimilar) {
      logError(
        new Error(`File type mismatch: declared=${file.type}, detected=${detectedType}`),
        "File upload security warning"
      );
      // Don't reject, but log for monitoring
    }
  }

  // 6. Additional validation for specific file types
  if (ext === ".pdf") {
    const isValidPdf = validatePdfStructure(buffer);
    if (!isValidPdf) {
      return {
        valid: false,
        error: "Invalid or corrupted PDF file",
      };
    }
  }

  return {
    valid: true,
    detectedMimeType: detectedType || file.type,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot) : "";
}

async function detectFileType(buffer: Buffer): Promise<string | null> {
  try {
    const type = await fileTypeFromBuffer(buffer);
    return type?.mime || null;
  } catch {
    return null;
  }
}

function areSimilarMimeTypes(type1: string, type2: string): boolean {
  // Group similar MIME types
  const groups = [
    ["image/jpeg", "image/jpg"],
    ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    ["text/plain", "text/csv"],
  ];

  for (const group of groups) {
    if (group.includes(type1) && group.includes(type2)) {
      return true;
    }
  }

  return false;
}

function validatePdfStructure(buffer: Buffer): boolean {
  // Check PDF magic number
  const header = buffer.slice(0, 8).toString("ascii");
  if (!header.startsWith("%PDF-")) {
    return false;
  }

  // Check for EOF marker (basic structure validation)
  const trailer = buffer.slice(-1024).toString("ascii");
  if (!trailer.includes("%%EOF")) {
    return false;
  }

  return true;
}

// ============================================================================
// FILENAME SANITIZATION
// ============================================================================

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/[/\\]/g, "_");

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "");

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, "_");

  // Limit length
  if (sanitized.length > 200) {
    const ext = getFileExtension(sanitized);
    sanitized = sanitized.slice(0, 200 - ext.length) + ext;
  }

  // Ensure not empty
  if (!sanitized || sanitized === "." || sanitized === "..") {
    sanitized = "unnamed_file";
  }

  return sanitized;
}

// ============================================================================
// VIRUS SCANNING INTERFACE
// ============================================================================

export interface VirusScanResult {
  clean: boolean;
  threat?: string;
  scanTime?: number;
}

export async function scanFileForViruses(buffer: Buffer): Promise<VirusScanResult> {
  // If ClamAV is available, use it
  if (process.env.CLAMAV_HOST) {
    return scanWithClamAV(buffer);
  }

  // If VirusTotal API key is available, use it
  if (process.env.VIRUSTOTAL_API_KEY) {
    return scanWithVirusTotal(buffer);
  }

  // No scanning available - log warning and allow
  console.warn("No virus scanning configured. File accepted without scan.");
  return { clean: true };
}

async function scanWithClamAV(buffer: Buffer): Promise<VirusScanResult> {
  try {
    const NodeClam = require("clamscan");
    const clamscan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST,
        port: parseInt(process.env.CLAMAV_PORT || "3310", 10),
      },
    });

    const start = Date.now();
    const { isInfected, viruses } = await clamscan.scanBuffer(buffer);

    return {
      clean: !isInfected,
      threat: viruses?.[0],
      scanTime: Date.now() - start,
    };
  } catch (error) {
    logError(error, "ClamAV scan failed");
    // Fail open with warning - or fail closed depending on security requirements
    return { clean: true };
  }
}

async function scanWithVirusTotal(buffer: Buffer): Promise<VirusScanResult> {
  // Implementation for VirusTotal API
  // Note: VirusTotal has rate limits and is async (may take time)
  console.warn("VirusTotal scanning not yet implemented");
  return { clean: true };
}
```

### Database Migration: `src/lib/migrations/add-production-features.sql` (NEW)

```sql
-- ============================================================================
-- PRODUCTION READINESS DATABASE MIGRATION
-- ============================================================================

-- 1. Add soft delete columns
ALTER TABLE packs
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

ALTER TABLE authorization_projects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

ALTER TABLE evidence_items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

ALTER TABLE pack_documents
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

-- 2. Add version columns for optimistic locking
ALTER TABLE prompt_responses
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE section_instances
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 3. Create comprehensive audit log table
CREATE TABLE IF NOT EXISTS authorization_pack_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  actor_id VARCHAR(100) NOT NULL,
  organization_id VARCHAR(100) NOT NULL,
  changes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_packs_deleted_at
ON packs(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_authorization_projects_deleted_at
ON authorization_projects(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_items_deleted_at
ON evidence_items(deleted_at) WHERE deleted_at IS NOT NULL;

-- 5. Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
ON authorization_pack_audit_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
ON authorization_pack_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_organization
ON authorization_pack_audit_log(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor
ON authorization_pack_audit_log(actor_id);

-- 6. Create missing performance indexes
CREATE INDEX IF NOT EXISTS idx_packs_organization_id
ON packs(organization_id);

CREATE INDEX IF NOT EXISTS idx_packs_created_at
ON packs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_section_instances_pack_id
ON section_instances(pack_id);

CREATE INDEX IF NOT EXISTS idx_evidence_items_pack_id
ON evidence_items(pack_id);

CREATE INDEX IF NOT EXISTS idx_evidence_items_section_instance_id
ON evidence_items(section_instance_id);

CREATE INDEX IF NOT EXISTS idx_prompt_responses_section_instance_id
ON prompt_responses(section_instance_id);

CREATE INDEX IF NOT EXISTS idx_pack_documents_pack_id
ON pack_documents(pack_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_packs_org_deleted_created
ON packs(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_pack_section
ON evidence_items(pack_id, section_instance_id);

-- 7. Add constraint to ensure version is always positive
ALTER TABLE prompt_responses
ADD CONSTRAINT prompt_responses_version_positive CHECK (version > 0);

ALTER TABLE section_instances
ADD CONSTRAINT section_instances_version_positive CHECK (version > 0);
```

---

## 5. IMPLEMENTATION FILES

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/(dashboard)/authorization-pack/lib/questionBank.ts` | Update with new questions from sections 1.1-1.5 and 2.1 |
| `src/lib/fca-intelligence/payments-regulatory-intelligence.ts` | New file with all content from section 3 |
| `src/lib/api-utils.ts` | New file with content from section 4 |
| `src/lib/file-upload-security.ts` | New file with content from section 4 |
| `src/lib/migrations/add-production-features.sql` | New migration file from section 4 |

### Files to Update

| File Path | Changes Required |
|-----------|------------------|
| `src/app/api/authorization-pack/projects/route.ts` | Add pagination, rate limiting, validation |
| `src/app/api/authorization-pack/packs/route.ts` | Add pagination, rate limiting, validation |
| `src/app/api/authorization-pack/packs/[id]/evidence/route.ts` | Add file upload security |
| `src/app/api/authorization-pack/packs/[id]/sections/[sectionId]/responses/route.ts` | Add optimistic locking |
| `src/lib/authorization-pack-db.ts` | Add soft delete support, pagination, version checking |

### NPM Dependencies to Add

```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "@upstash/ratelimit": "^1.0.0",
    "@upstash/redis": "^1.28.0",
    "file-type": "^18.0.0"
  },
  "devDependencies": {
    "clamscan": "^2.2.0"
  }
}
```

### Environment Variables to Add

```env
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Virus Scanning (Optional)
CLAMAV_HOST=
CLAMAV_PORT=3310
VIRUSTOTAL_API_KEY=
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Question Bank (Priority: HIGH)
- [x] Add People & Capability section (5 questions)
- [x] Add Financial Crime section (4 questions)
- [x] Add Operational Resilience section (4 questions)
- [x] Add Consumer Duty section (4 questions)
- [x] Add Data Protection section (3 questions)
- [x] Add Payments-Specific section (12 questions)
- [x] Implement confidence scoring algorithm
- [x] Add hard gate logic

### Phase 2: Regulatory Intelligence (Priority: HIGH)
- [x] Create `payments-regulatory-intelligence.ts`
- [x] Implement threshold conditions guidance
- [x] Implement capital calculation helpers
- [x] Implement section guidance
- [x] Implement perimeter guidance
- [x] Implement refusal pattern matching

### Phase 3: Production Readiness (Priority: HIGH)
- [ ] Run database migration
- [x] Create `api-utils.ts` with error handling
- [x] Create `file-upload-security.ts`
- [x] Update API routes with pagination
- [x] Add rate limiting to AI endpoints
- [x] Implement soft deletes
- [x] Add optimistic locking
- [x] Add Zod validation schemas

### Phase 4: Testing
- [ ] Unit tests for confidence scoring
- [ ] Unit tests for capital calculations
- [ ] Integration tests for API pagination
- [ ] Integration tests for rate limiting
- [ ] File upload security tests

---

*End of Build Specification*
