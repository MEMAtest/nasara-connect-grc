# Authorizations Module Specification
## Smart FCA Authorizations Readiness System

### Executive Summary
The Authorizations Module provides an intelligent questionnaire system that assesses firm readiness across common regulatory areas and sector-specific requirements, generating confidence scores, identifying gaps, and producing board-ready documentation for FCA applications.

---

## 1. Module Architecture Overview

### 1.1 Core Components
```yaml
assessment_framework:
  common_areas:
    coverage: "Universal requirements for all permissions"
    sections: 8
    questions: 40-50
    
  sector_specific:
    coverage: "Permission-specific requirements"
    categories: 5
    questions_per_category: 8-12
    
  scoring_engine:
    scale: "0-3 (No/Partial/Mostly/Yes)"
    weighting: "Question importance factors"
    normalization: "0-100% scale"
    
  confidence_algorithm:
    baseline: 100%
    hard_gates: "Critical fail points"
    deductions: "Risk-based penalties"
    
  output_generation:
    formats:
      - "Interactive dashboard"
      - "Board pack PDF"
      - "Markdown report"
      - "JSON export"
      - "Evidence checklist"
```

### 1.2 Permission Categories
```yaml
supported_permissions:
  consumer_credit:
    activities:
      - "Lending"
      - "Credit broking"
      - "Debt counselling"
      - "Debt collecting"
      
  credit_broking:
    focus: "Intermediation and introduction"
    limited_vs_full: true
    
  payment_services:
    types:
      - "AISP (Account Information)"
      - "PISP (Payment Initiation)"
      - "Money Remittance"
      - "Payment Accounts"
      
  investments:
    activities:
      - "Arranging"
      - "Advising"
      - "Dealing"
      - "Portfolio Management"
      - "Safeguarding"
      
  insurance_distribution:
    roles:
      - "Arranging"
      - "Advising"
      - "Introducing"
      - "Using ARs"
```

---

## 2. Smart Questionnaire System

### 2.1 Common Areas Assessment
```yaml
people_capability:
  questions:
    suitability_assessments:
      text: "Suitability assessments for SMFs/Key Individuals completed with evidence"
      weight: 3
      help: "Internal write-ups for SMFs/Key Individuals; not just relying on consultants"
      evidence_required:
        - policy_link
        - mi_screenshot
        - approval_record
      
    controllers_chart:
      text: "Ownership & Controllers chart prepared with all relevant parties identified"
      weight: 2
      help: "Clear group chart; controllers highlighted; aligns to the legal entity applying"
      
    resourcing_plan:
      text: "Resourcing plan addresses skills/capacity gaps (recruitment/upskilling with timelines)"
      weight: 2
      
    staff_incentives:
      text: "Staff incentives align to good customer outcomes (not volume-driven only)"
      weight: 1
      
    uk_presence:
      text: "UK base (office location) and eligibility to work evidenced; time allocation for multi-hat roles explained"
      weight: 3
      help: "Hard gate: if not evidenced, confidence collapses"
      critical: true  # Failure here = automatic low confidence

governance_smcr:
  questions:
    smf_roles:
      text: "Have you identified all required SMF roles and clearly allocated Prescribed Responsibilities?"
      weight: 3
      help: "E.g., SMF16/17, SMF1/3 as applicable; Statements of Responsibilities drafted"
      
    fit_proper:
      text: "Are Fit & Proper (F&P) assessments, references, and training plans in place for senior staff?"
      weight: 2
      help: "Annual F&P, regulatory references (SYSC 22), role-based training, conduct rules attestation"
      
    governance_structure:
      text: "Do you have a formal governance structure with committees, MI, and decision records?"
      weight: 2
      help: "Board/ExCo terms, minutes, MI packs, RACI, escalation routes"

financial_resources:
  questions:
    historic_accounts:
      text: "Historic financial accounts ready (3 years best practice, if incorporated)"
      weight: 2
      
    projections:
      text: "Forward-looking projections prepared (3 years; monthly/yearly) in Excel format"
      weight: 3
      help: "Balance sheet balances; opening/closing reconcile"
      critical: true
      
    notes_assumptions:
      text: "Accompanying notes & assumptions provided to explain forecasts and MI context"
      weight: 1
      
    prudential_regime:
      text: "Quantified prudential regime evidenced (capital, liquidity, wind-down)"
      weight: 3
      help: "IFPR/SNI, PSRs safeguarding, capital instruments quality"
      critical: true
      
    funding_arrangements:
      text: "Funding arrangements evidenced with contingencies (e.g., bank statements/commitments)"
      weight: 2
      
    entity_alignment:
      text: "Figures align to the legal entity seeking authorisation (not partial)"
      weight: 1

systems_controls:
  questions:
    core_policies:
      text: "Core policies and control testing calendar are drafted and approved"
      weight: 3
      help: "E.g., Compliance Monitoring Plan, Financial Crime, Conduct, Outsourcing, OpRes, Data Protection, FinProms"
      
    document_management:
      text: "Document management, version control, and evidence retention procedures are defined"
      weight: 2
      help: "Retention schedule, approvals workflow, watermarking/versioning, audit trail"
      
    complaints_handling:
      text: "Complaints handling process aligned to DISP is implemented (incl. MI & root-cause)"
      weight: 2
      help: "Timelines, final response templates, C-MI, FOS signposting, vulnerability adjustments"

financial_crime:
  questions:
    mlro_appointment:
      text: "MLRO appointed with risk assessment, CDD/EDD procedures, and SAR handling defined"
      weight: 3
      help: "Firm-wide risk assessment, KYC/KYB, sanctions screening, PEP monitoring, SAR workflow"
      critical: true
      
    screening_tools:
      text: "Are screening tools and transaction monitoring calibrated to your products and geographies?"
      weight: 2
      help: "Risk-based thresholds, adverse media, geo-risk, ongoing monitoring cadence"
      
    aml_training:
      text: "Staff AML/CTF training and testing plan exists with records of completion"
      weight: 1
      help: "Role-based modules, annual refreshers, pass marks, and certification logs"

operational_resilience:
  questions:
    important_services:
      text: "Important Business Services (IBS) identified with impact tolerances and scenario tests"
      weight: 2
      help: "Mapping, tolerances, runbooks, disruption MI (SYSC OpRes)"
      
    critical_outsourcing:
      text: "Critical outsourcing has due diligence, contracts, and oversight KPIs in place"
      weight: 2
      help: "SLAs, exit plans, data processing terms, resilience of third parties"
      
    it_security:
      text: "IT/security controls defined (access, logging, vulnerability mgmt, incident response)"
      weight: 2
      help: "MFA, RBAC, backups, SIEM, breach playbooks, DPO involvement where relevant"

consumer_duty_conduct:
  questions:
    target_market:
      text: "Defined target market, fair value assessment, and product governance in place"
      weight: 3
      help: "Outcomes monitoring, communications testing, vulnerable customer accommodations"
      
    financial_promotions:
      text: "Financial promotions approvals, risk warnings, and record-keeping are implemented"
      weight: 2
      help: "Approver competence (s21/s137), logs, social media monitoring, approval workflows"
      
    customer_support:
      text: "Customer support channels, SLAs, and redress pathways are documented"
      weight: 1
      help: "Accessibility, escalation, refund/rectification steps, MI on outcomes"

data_protection:
  questions:
    lawful_basis:
      text: "Lawful bases, data mapping, and privacy notices are prepared for all processing"
      weight: 2
      help: "ROPA, DPIAs for high-risk processing, data subject rights playbooks"
      
    security_measures:
      text: "Technical and organisational measures (TOMs) and breach response defined"
      weight: 2
      help: "Encryption, key mgmt, minimisation, vendor DPAs, 72-hr breach plan"
      
    retention_deletion:
      text: "Data retention & deletion schedules align with regulatory and business needs"
      weight: 1
      help: "Backups, archival, defensible deletion, holds for investigations/regulatory"
```

### 2.2 Sector-Specific Assessments
```yaml
consumer_credit_specific:
  permission_key: "conc"
  questions:
    activities_scope:
      text: "Which activities apply?"
      type: "multi"
      options: ["Lending", "Credit broking", "Debt counselling", "Debt collecting"]
      weight: 3
      note_enabled: true
      
    limited_vs_full:
      text: "Do you expect to rely on Limited Permission only (no lending/debt mgmt)?"
      type: "scale"
      weight: 2
      help: "Limited Permission typically for ancillary credit broking; Full Permission required for lending or debt mgmt"
      
    affordability_assessment:
      text: "Affordability & creditworthiness assessments defined and evidenced (pre-contract, ongoing)"
      type: "scale"
      weight: 3
      critical: true
      
    pre_contract_disclosure:
      text: "Pre-contract disclosure (SECCI/adequate explanations) and agreements compliant"
      type: "scale"
      weight: 2
      
    promotion_compliance:
      text: "Financial promotions & website journeys meet CONC 3 (risk warnings, prominence)"
      type: "scale"
      weight: 2
      
    commission_disclosure:
      text: "Broker/lender commissions disclosure and conflicts managed (incl. variable commissions)"
      type: "scale"
      weight: 2
      
    arrears_management:
      text: "Arrears, default and forbearance policy aligned to CONC 7 with vulnerable customer routes"
      type: "scale"
      weight: 3
      critical: true
      
    credit_reference_data:
      text: "Use of CRA data, accuracy checks, and adverse decisions comms in place"
      type: "scale"
      weight: 1
      
    debt_counselling:
      text: "If debt counselling: permissions scope, advice suitability and signposting controls"
      type: "scale"
      weight: 3
      conditional: "activities_scope includes 'Debt counselling'"
      
    partner_due_diligence:
      text: "Lender/partner due diligence and ongoing monitoring conducted (financial, conduct, outcomes)"
      type: "scale"
      weight: 2
      
    record_keeping:
      text: "Record-keeping supports audit trail for affordability, disclosures, commissions, and outcomes"
      type: "scale"
      weight: 2

payment_services_specific:
  permission_key: "psd2"
  questions:
    business_model:
      text: "Business model includes:"
      type: "multi"
      options: ["AISP", "PISP", "Money Remittance", "Payment Accounts"]
      weight: 3
      note_enabled: true
      
    safeguarding_approach:
      text: "Safeguarding approach defined (segregation vs insurance) with daily reconciliations & audit"
      type: "scale"
      weight: 3
      critical: true
      help: "This is a critical requirement for payment institutions"
      
    security_framework:
      text: "Operational & security risk framework per EBA Guidelines; incident reporting process"
      type: "scale"
      weight: 2
      
    strong_authentication:
      text: "Strong Customer Authentication (SCA) applied appropriately incl. exemptions logic"
      type: "scale"
      weight: 2
      
    outsourcing_register:
      text: "Outsourcing register and oversight per EBA (critical/important functions)"
      type: "scale"
      weight: 2
      
    complaints_psd:
      text: "Complaints handling per DISP/PSRs with payment-specific root cause codes"
      type: "scale"
      weight: 1
      
    fraud_monitoring:
      text: "Fraud/APP scam monitoring, reimbursement stance, and customer comms defined"
      type: "scale"
      weight: 2
      
    volume_projections:
      text: "Projected monthly volumes/ATV modelled; SPI/API thresholds assessed"
      type: "scale"
      weight: 2
      
    audit_arrangements:
      text: "Annual audit arrangements (safeguarding/financial) identified with timetable"
      type: "scale"
      weight: 1

investment_specific:
  permission_key: "mifid"
  questions:
    activities:
      text: "Activities:"
      type: "multi"
      options: ["Arranging", "Advising", "Dealing", "Portfolio Mgmt", "Safeguarding"]
      weight: 3
      note_enabled: true
      
    client_categorization:
      text: "Client categorisation and opt-up processes defined with records"
      type: "scale"
      weight: 2
      
    appropriateness_suitability:
      text: "Appropriateness/suitability procedures and evidencing templates in place"
      type: "scale"
      weight: 3
      critical: true
      
    best_execution:
      text: "Best execution policy, venue monitoring, and RTS 28-style MI (as applicable)"
      type: "scale"
      weight: 2
      
    conflicts_inducements:
      text: "Conflicts/inducements register; research/fees controls; gifts/hospitality policy aligned"
      type: "scale"
      weight: 2
      
    cass_applicability:
      text: "CASS applicability assessed; safeguarding/custody arrangements documented (if in scope)"
      type: "scale"
      weight: 3
      critical: true
      
    ifpr_classification:
      text: "IFPR classification (SNI vs non-SNI), own funds, liquidity, and wind-down analysis"
      type: "scale"
      weight: 3
      critical: true
      
    personal_account:
      text: "Personal account dealing & market abuse surveillance implemented"
      type: "scale"
      weight: 1
```

---

## 3. Scoring Methodology

### 3.1 Individual Question Scoring
```typescript
interface ScoringScale {
  values: {
    0: { label: "No", description: "Not started or no evidence" };
    1: { label: "Partial", description: "Some progress but significant gaps" };
    2: { label: "Mostly", description: "Largely complete with minor gaps" };
    3: { label: "Yes", description: "Fully complete with evidence" };
  };
}

function calculateQuestionScore(response: number, weight: number): number {
  // Normalize to 0-1 scale, apply weight
  return (response / 3) * weight;
}
```

### 3.2 Section Scoring
```typescript
function calculateSectionScore(
  questions: Question[],
  responses: Map<string, number>
): number {
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const question of questions) {
    const response = responses.get(question.id);
    if (response !== undefined) {
      totalScore += calculateQuestionScore(response, question.weight);
      totalWeight += question.weight;
    }
  }
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}
```

### 3.3 Overall Readiness Score
```typescript
function calculateOverallScore(
  commonSections: Section[],
  enabledCategories: Category[]
): number {
  // Average of common sections
  const commonScores = commonSections.map(s => calculateSectionScore(s));
  const avgCommon = average(commonScores);
  
  // Average of sector-specific scores
  const categoryScores = enabledCategories.map(c => {
    const sectorScore = calculateSectionScore(c.specificQuestions);
    return (avgCommon + sectorScore) / 2; // Equal weight
  });
  
  return average(categoryScores);
}
```

### 3.4 RAG Rating System
```yaml
rag_thresholds:
  green:
    min: 80%
    label: "Ready to submit"
    symbol: "🟢"
    recommendation: "Final review and submit"
    
  amber:
    min: 60%
    max: 79%
    label: "Nearly ready"
    symbol: "🟠"
    recommendation: "Address gaps before submission"
    
  red:
    max: 59%
    label: "Significant gaps"
    symbol: "🔴"
    recommendation: "Major work required"

letter_grades:
  A:
    min: 85%
    description: "Excellent - highly likely approval"
    
  B:
    min: 70%
    max: 84%
    description: "Good - likely approval with minor fixes"
    
  C:
    min: 55%
    max: 69%
    description: "Fair - possible approval with work"
    
  D:
    max: 54%
    description: "Poor - unlikely approval without significant work"
```

---

## 4. Confidence Score Algorithm

### 4.1 Confidence Calculation
```typescript
interface ConfidenceCalculator {
  calculateConfidence(responses: AssessmentResponses): ConfidenceResult;
}

class FCAConfidenceCalculator implements ConfidenceCalculator {
  private hardGates = [
    'people_ukpresence',  // Must have UK presence
  ];
  
  private criticalFactors = [
    { id: 'smcr_roles', penalty: 15 },
    { id: 'mlro', penalty: 10 },
    { id: 'fin_proj', penalty: 15 },
    { id: 'fin_prudential', penalty: 15 },
    { id: 'fin_hist_acc', penalty: 8 },
  ];
  
  private sectorSpecificFactors = {
    payments: [
      { id: 'psd2_safeguard', penalty: 20 }
    ],
    investments: [
      { id: 'mifid_cass', penalty: 12 },
      { id: 'ifpr_class', penalty: 12 }
    ]
  };
  
  calculateConfidence(responses: AssessmentResponses): ConfidenceResult {
    let score = 100; // Start at 100%
    let hardFail = false;
    
    // Check hard gates
    for (const gate of this.hardGates) {
      if (responses[gate] <= 0) {
        hardFail = true;
        score = 10; // Immediate drop to 10%
        break;
      }
    }
    
    if (!hardFail) {
      // Apply critical factor penalties
      for (const factor of this.criticalFactors) {
        if (responses[factor.id] <= 1) {
          score -= factor.penalty;
        }
      }
      
      // Apply sector-specific penalties
      for (const [sector, factors] of Object.entries(this.sectorSpecificFactors)) {
        if (responses.enabledSectors.includes(sector)) {
          for (const factor of factors) {
            if (responses[factor.id] <= 1) {
              score -= factor.penalty;
            }
          }
        }
      }
    }
    
    // Ensure score stays in range 5-100
    score = Math.max(5, Math.min(100, score));
    
    return {
      percent: score,
      band: this.getBand(score),
      hardFail,
      message: this.getMessage(score, hardFail)
    };
  }
  
  private getBand(score: number): 'Low' | 'Medium' | 'High' {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  }
  
  private getMessage(score: number, hardFail: boolean): string {
    if (hardFail) {
      return "Critical requirement missing - UK presence must be evidenced";
    }
    if (score >= 80) {
      return "Strong application - high chance of approval";
    }
    if (score >= 50) {
      return "Moderate readiness - address key gaps to improve chances";
    }
    return "Significant gaps - substantial work needed before submission";
  }
}
```

### 4.2 Confidence Factors
```yaml
baseline_confidence: 100

hard_gates:
  uk_presence:
    failure_impact: "Drop to 10%"
    reason: "FCA requires UK establishment"
    
deduction_factors:
  governance:
    no_smf_roles: -15
    no_mlro: -10
    weak_governance: -10
    
  financial:
    no_projections: -15
    weak_prudential: -15
    no_historic_accounts: -8
    insufficient_capital: -20
    
  systems:
    no_policies: -10
    weak_controls: -10
    no_testing: -8
    
  sector_specific:
    payments_no_safeguarding: -20
    investments_no_cass: -12
    investments_no_ifpr: -12
    credit_no_affordability: -15
```

---

## 5. Gap Analysis Engine

### 5.1 Gap Identification
```typescript
interface Gap {
  id: string;
  section: string;
  question: string;
  currentScore: number;
  targetScore: number;
  severity: 'High' | 'Medium' | 'Low';
  impact: string;
  remediation: string;
  timeEstimate: string;
  dependencies: string[];
}

class GapAnalyzer {
  analyzeGaps(assessment: Assessment): Gap[] {
    const gaps: Gap[] = [];
    
    // Analyze common sections
    for (const section of assessment.commonSections) {
      for (const question of section.questions) {
        const score = assessment.responses[question.id] || 0;
        
        if (score <= 1) {
          gaps.push({
            id: question.id,
            section: section.label,
            question: question.text,
            currentScore: score,
            targetScore: 3,
            severity: this.calculateSeverity(score, question.weight, question.critical),
            impact: this.getImpact(question),
            remediation: this.getRemediation(question),
            timeEstimate: this.estimateTime(score, question.complexity),
            dependencies: question.dependencies || []
          });
        }
      }
    }
    
    // Sort by severity and weight
    return gaps.sort((a, b) => {
      const severityOrder = { High: 0, Medium: 1, Low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
  
  private calculateSeverity(
    score: number, 
    weight: number, 
    critical?: boolean
  ): 'High' | 'Medium' | 'Low' {
    if (critical || (score === 0 && weight >= 3)) return 'High';
    if (score === 0 || weight >= 2) return 'Medium';
    return 'Low';
  }
}
```

### 5.2 Remediation Recommendations
```yaml
remediation_templates:
  governance_gaps:
    no_smf_identified:
      actions:
        - "Map required SMFs to your business model"
        - "Identify suitable candidates"
        - "Prepare Statements of Responsibility"
      timeline: "2-4 weeks"
      resources: "Compliance consultant recommended"
      
  financial_gaps:
    insufficient_projections:
      actions:
        - "Prepare 3-year financial model"
        - "Document all assumptions"
        - "Stress test scenarios"
      timeline: "1-2 weeks"
      resources: "CFO/Finance team + possible external support"
      
  control_gaps:
    missing_policies:
      actions:
        - "Identify required policies from FCA Handbook"
        - "Draft using templates"
        - "Board review and approval"
      timeline: "3-4 weeks"
      resources: "Compliance team or consultant"
```

---

## 6. Evidence Management

### 6.1 Evidence Requirements
```yaml
evidence_types:
  policy_link:
    description: "Link to policy document"
    format: "SharePoint/Drive URL"
    validation: "Valid URL format"
    
  mi_screenshot:
    description: "Management Information evidence"
    format: "Image or PDF"
    validation: "File upload or link"
    
  approval_record:
    description: "Board/committee approval"
    format: "Minutes or resolution"
    validation: "Date and signatory"
    
  evidence_notes:
    description: "Additional context"
    format: "Free text"
    validation: "Max 500 characters"
```

### 6.2 Evidence Tracking
```typescript
interface EvidenceRecord {
  questionId: string;
  evidenceTypes: {
    policyLink?: {
      url: string;
      uploadDate: Date;
      validator?: string;
    };
    miScreenshot?: {
      fileRef: string;
      description: string;
    };
    approvalRecord?: {
      type: 'board' | 'committee' | 'individual';
      date: Date;
      reference: string;
    };
    notes?: string;
  };
  completeness: number; // 0-100%
  lastUpdated: Date;
}

class EvidenceManager {
  calculateCompleteness(evidence: EvidenceRecord): number {
    const required = ['policyLink', 'approvalRecord'];
    const optional = ['miScreenshot', 'notes'];
    
    let score = 0;
    let maxScore = required.length * 50 + optional.length * 25;
    
    for (const req of required) {
      if (evidence.evidenceTypes[req]) score += 50;
    }
    
    for (const opt of optional) {
      if (evidence.evidenceTypes[opt]) score += 25;
    }
    
    return Math.min(100, (score / maxScore) * 100);
  }
}
```

---

## 7. Report Generation

### 7.1 Interactive Dashboard View
```typescript
interface DashboardConfig {
  layout: {
    summary: {
      overallScore: ScoreWidget;
      confidenceScore: ConfidenceWidget;
      ragStatus: RAGWidget;
      letterGrade: GradeWidget;
    };
    
    charts: {
      radarChart: {
        type: 'radar';
        data: SectionScores[];
        interactive: true;
      };
      
      progressBars: {
        type: 'horizontal-bar';
        data: CategoryProgress[];
        animated: true;
      };
    };
    
    gaps: {
      type: 'priority-list';
      limit: 10;
      filters: ['severity', 'section'];
      expandable: true;
    };
    
    actions: {
      exportOptions: ['PDF', 'Markdown', 'JSON'];
      shareOptions: ['Email', 'Link'];
      printOptions: ['Board Pack', 'Simple Report'];
    };
  };
}
```

### 7.2 Board Pack Generation
```yaml
board_pack_structure:
  cover_page:
    content:
      - "Company name and logo"
      - "Assessment date"
      - "Overall readiness score"
      - "Confidence percentage"
      
  executive_summary:
    content:
      - overall_score: "with trend if multiple assessments"
      - confidence_analysis: "chance of approval with reasoning"
      - permission_breakdown: "score per permission type"
      - critical_gaps: "top 5 with severity"
      - recommended_timeline: "to address gaps"
      
  detailed_assessment:
    common_areas:
      format: "Table per section"
      columns:
        - "Question"
        - "Status"
        - "Evidence"
        - "Gap/Action"
        
    sector_specific:
      format: "Grouped by permission"
      includes:
        - "Requirements matrix"
        - "Current state"
        - "Actions needed"
        
  gap_analysis:
    prioritization:
      - "Critical (must fix)"
      - "Important (should fix)"
      - "Nice to have"
      
    action_plan:
      columns:
        - "Gap"
        - "Owner"
        - "Actions"
        - "Timeline"
        - "Dependencies"
        
  appendices:
    - "Full assessment responses"
    - "Evidence checklist"
    - "Regulatory references"
    - "Glossary"
```

### 7.3 Markdown Report Format
```markdown
# FCA Authorisations Readiness Report
Generated: {timestamp}

## Overall Assessment
**Score:** {score}% {rag_symbol} ({rag_status})
**Confidence:** {confidence}% {confidence_message}
**Grade:** {letter_grade}

## Summary by Permission
- **{permission_1}**: {score_1}% {rag_1}
- **{permission_2}**: {score_2}% {rag_2}

## Common Areas Assessment

### {Section_Name}
| Question | Status | Weight | Evidence | Notes |
|----------|--------|--------|----------|-------|
| {question_text} | {status} | {weight} | {evidence_types} | {notes} |

## Sector-Specific Requirements

### {Category_Name}
| Requirement | Status | Critical | Action Required |
|-------------|--------|----------|-----------------|
| {requirement} | {status} | {yes/no} | {action} |

## Gap Analysis & Next Steps

### Critical Gaps (Must Address)
1. [{severity}] {gap_description} _(Area: {section})_
   - **Current State:** {current}
   - **Required State:** {target}
   - **Actions:** {remediation_steps}
   - **Timeline:** {estimate}

### Important Gaps (Should Address)
...

## Recommendations
1. **Immediate Actions** (Week 1)
   - {action_1}
   - {action_2}

2. **Short-term** (Weeks 2-4)
   - {action_3}
   - {action_4}

3. **Pre-submission** (Final Review)
   - {action_5}
   - {action_6}

## Evidence Checklist
- [ ] All governance documents complete
- [ ] Financial projections validated
- [ ] Policies approved by board
- [ ] Systems tested and documented
- [ ] Training records up to date

---
*Disclaimer: This assessment is indicative only. Validate against current FCA requirements.*
```

### 7.4 JSON Export Schema
```json
{
  "assessmentId": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "firm": {
    "name": "Example Firm Ltd",
    "reference": "FRN123456"
  },
  "permissions": ["consumer_credit", "payments"],
  "scores": {
    "overall": 75,
    "confidence": 65,
    "bySection": {
      "people_capability": 80,
      "governance_smcr": 70,
      "financial_resources": 65
    },
    "byPermission": {
      "consumer_credit": 72,
      "payments": 78
    }
  },
  "responses": {
    "questionId": {
      "value": 2,
      "evidence": {
        "policyLink": "https://...",
        "notes": "Board approved 01/01/24"
      }
    }
  },
  "gaps": [
    {
      "id": "gap_001",
      "question": "fin_proj",
      "severity": "High",
      "currentScore": 1,
      "targetScore": 3
    }
  ],
  "metadata": {
    "assessor": "john.smith@firm.com",
    "version": "2.1.0",
    "duration": 3600
  }
}
```

---

## 8. Interactive Features

### 8.1 Real-time Scoring
```typescript
interface RealtimeScoring {
  onResponseChange(questionId: string, value: number): void {
    // Immediate recalculation
    this.updateQuestionScore(questionId, value);
    this.updateSectionScore(this.getSection(questionId));
    this.updateOverallScore();
    this.updateConfidence();
    this.updateGaps();
    
    // Visual feedback
    this.animateScoreChange();
    this.highlightImpact();
    
    // Auto-save
    this.saveProgress();
  }
  
  // Progressive disclosure
  showImpact(questionId: string): void {
    return {
      currentImpact: this.calculateImpact(questionId),
      ifImproved: this.simulateImprovement(questionId),
      dependencies: this.getDependencies(questionId)
    };
  }
}
```

### 8.2 Guided Mode
```yaml
guided_questionnaire:
  features:
    smart_ordering:
      - "Critical questions first"
      - "Dependencies resolved"
      - "Logical flow maintained"
      
    contextual_help:
      - "Inline definitions"
      - "Example answers"
      - "Common pitfalls"
      - "Best practices"
      
    progress_tracking:
      - "Section completion %"
      - "Time estimates"
      - "Save and resume"
      
    validation:
      - "Required field checks"
      - "Consistency validation"
      - "Evidence verification"
```

### 8.3 Comparison Mode
```typescript
interface ComparisonMode {
  compareAssessments(
    assessment1: Assessment,
    assessment2: Assessment
  ): ComparisonResult {
    return {
      scoreChange: assessment2.score - assessment1.score,
      confidenceChange: assessment2.confidence - assessment1.confidence,
      gapsResolved: this.findResolvedGaps(assessment1, assessment2),
      newGaps: this.findNewGaps(assessment1, assessment2),
      improvements: this.identifyImprovements(assessment1, assessment2),
      timeline: this.calculateTimeBetween(assessment1, assessment2)
    };
  }
  
  visualizeProgress(comparisons: ComparisonResult[]): Chart {
    return {
      type: 'line',
      data: {
        labels: comparisons.map(c => c.date),
        datasets: [
          { label: 'Overall Score', data: comparisons.map(c => c.score) },
          { label: 'Confidence', data: comparisons.map(c => c.confidence) }
        ]
      }
    };
  }
}
```

---

## 9. Integration Points

### 9.1 Document Management Integration
```yaml
document_links:
  policy_module:
    - "Pull approved policies"
    - "Link to policy versions"
    - "Track approval status"
    
  training_module:
    - "Link training completion"
    - "Pull competency evidence"
    - "Track certification status"
    
  risk_module:
    - "Import risk assessments"
    - "Link control effectiveness"
    - "Pull risk indicators"
```

### 9.2 Workflow Integration
```yaml
authorization_workflow:
  stages:
    initial_assessment:
      - "Complete questionnaire"
      - "Generate gap report"
      - "Create action plan"
      
    gap_remediation:
      - "Assign actions to owners"
      - "Track progress"
      - "Update assessment"
      
    pre_submission_review:
      - "Final assessment"
      - "Evidence verification"
      - "Board pack generation"
      
    submission:
      - "Export to FCA format"
      - "Generate cover letter"
      - "Archive assessment"
```

### 9.3 API Endpoints
```typescript
interface AuthorizationAPI {
  // Assessment management
  POST   /api/assessments/create
  GET    /api/assessments/{id}
  PUT    /api/assessments/{id}/responses
  POST   /api/assessments/{id}/calculate
  
  // Evidence management  
  POST   /api/assessments/{id}/evidence
  GET    /api/assessments/{id}/evidence/{questionId}
  DELETE /api/assessments/{id}/evidence/{evidenceId}
  
  // Report generation
  POST   /api/assessments/{id}/reports/board-pack
  POST   /api/assessments/{id}/reports/markdown
  POST   /api/assessments/{id}/reports/json
  GET    /api/assessments/{id}/reports/{reportId}
  
  // Gap analysis
  GET    /api/assessments/{id}/gaps
  POST   /api/assessments/{id}/gaps/actions
  PUT    /api/assessments/{id}/gaps/{gapId}/status
  
  // Comparison
  GET    /api/assessments/compare?ids={id1},{id2}
  GET    /api/assessments/trends?firmId={firmId}
}
```

---

## 10. Implementation Notes for AI Agent

### Critical Implementation Points
1. **Question weighting** is crucial - heavier weights for regulatory essentials
2. **Hard gates** must fail fast - UK presence is non-negotiable  
3. **Confidence algorithm** should be pessimistic - better to over-prepare
4. **Evidence tracking** needs audit trail - FCA will verify claims
5. **Sector combinations** matter - firms often have multiple permissions

### UI/UX Priorities
1. **Mobile responsive** - executives review on phones
2. **Auto-save everything** - never lose progress
3. **Print-friendly** - board packs must look professional
4. **Keyboard navigable** - accessibility is required
5. **Offline capable** - work anywhere, sync later

### Data Model Requirements
1. **Versioning** - track questionnaire changes over time
2. **Multi-tenancy** - separate firm data completely
3. **Temporal data** - show progression over time
4. **Audit logging** - who changed what when
5. **Encryption** - sensitive financial data

### Performance Targets
1. **Initial load** < 2 seconds
2. **Score calculation** < 100ms
3. **Report generation** < 5 seconds
4. **PDF export** < 10 seconds
5. **Auto-save** every 30 seconds

### Testing Priorities
1. **Scoring accuracy** - validate against known outcomes
2. **Edge cases** - empty responses, all zero, all perfect
3. **Permission combinations** - test all valid combos
4. **Evidence upload** - file sizes, formats, validation
5. **Report formatting** - all export formats render correctly

---

## Appendix: Quick Reference

### Permission Requirements Matrix
| Permission Type | Key Requirements | Typical Timeline |
|-----------------|------------------|------------------|
| Consumer Credit (Limited) | Affordability process, CONC compliance | 8-12 weeks |
| Consumer Credit (Full) | + Lending policies, arrears management | 12-16 weeks |
| Payment Services (SPI) | Safeguarding, PSR compliance | 10-14 weeks |
| Payment Services (API/PI) | + Operational resilience, higher capital | 14-20 weeks |
| Investment (Simplified) | Basic MiFID, client money | 12-16 weeks |
| Investment (Full) | + CASS audit, IFPR compliance | 16-24 weeks |

### Common Rejection Reasons
1. **Incomplete financials** (35% of rejections)
2. **Inadequate governance** (25%)
3. **Weak control framework** (20%)
4. **Insufficient resources** (15%)
5. **No UK presence** (5%)

### Success Factors
- ✅ Start 6 months before intended launch
- ✅ Engage compliance consultant early
- ✅ Document everything contemporaneously
- ✅ Test all processes before submission
- ✅ Prepare for FCA interviews thoroughly

---

*This specification completes the Authorizations module requirements. Read alongside SM&CR and Training modules for full platform implementation.*