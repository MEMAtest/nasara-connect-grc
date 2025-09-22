# SM&CR Module Specification
## Senior Managers & Certification Regime Implementation

### Module Overview
The SM&CR module provides comprehensive management of Senior Manager Functions (SMFs), Certification Functions (CFs), and Conduct Rules compliance across different regulatory permissions. This module ensures firms maintain robust governance, track fitness & propriety, and evidence ongoing compliance with FCA requirements.

---

## 1. Core SM&CR Components

### 1.1 Senior Management Functions (SMFs)
```yaml
universal_smfs:
  SMF1:
    title: "Chief Executive"
    required_for: ["All firms"]
    prescribed_responsibilities: [1, 2, 3, 4, 5, 6]
    
  SMF3:
    title: "Executive Director"
    required_for: ["All firms with executive directors"]
    prescribed_responsibilities: [1, 2, 3, 4]
    
  SMF16:
    title: "Compliance Oversight"
    required_for: ["Core firms"]
    prescribed_responsibilities: [15, 16, 17]
    
  SMF17:
    title: "Money Laundering Reporting Officer"
    required_for: ["All firms"]
    prescribed_responsibilities: [18]
    
  SMF27:
    title: "Partner (Limited Scope)"
    required_for: ["Limited scope firms"]
    prescribed_responsibilities: [1, 2]

payment_specific_smfs:
  SMF4:
    title: "Chief Risk Officer"
    required_for: ["Enhanced firms", "Payment institutions > £250m"]
    unique_requirements:
      - "Safeguarding oversight"
      - "Operational resilience reporting"
      
investment_specific_smfs:
  SMF24:
    title: "Chief Operations"
    required_for: ["IFPR firms"]
    additional_duties:
      - "CASS oversight"
      - "Client money reconciliation"
```

### 1.2 Certification Functions
```yaml
certification_functions:
  CF30:
    title: "Customer-Facing (non-investment)"
    applies_to: ["Consumer credit", "Payment services"]
    annual_assessment: true
    
  CF29:
    title: "Limited Scope Function"
    applies_to: ["Benchmark activities", "Limited permissions"]
    
  CF28:
    title: "Systems & Controls"
    applies_to: ["Material risk-takers"]
    competence_requirements:
      - "Technical knowledge test"
      - "Annual CPD hours: 35"
```

### 1.3 Prescribed Responsibilities Mapping
```yaml
prescribed_responsibilities:
  PR1:
    description: "Performance of obligations under SM&CR"
    typical_holder: "SMF1 or SMF3"
    evidence_required:
      - "Board minutes showing oversight"
      - "Annual effectiveness review"
      
  PR15:
    description: "Compliance with rules and guidance"
    typical_holder: "SMF16"
    monitoring:
      - "Quarterly compliance reports"
      - "Breach log reviews"
      
  PR18:
    description: "Financial crime prevention"
    typical_holder: "SMF17"
    specific_checks:
      - "SAR submission records"
      - "Annual MLRO report"
```

---

## 2. Fitness & Propriety Framework

### 2.1 Initial F&P Assessment
```yaml
fitness_assessment:
  honesty_integrity:
    criminal_records_check:
      - scope: "Unspent convictions (all)"
      - scope: "Spent convictions (financial crime)"
      - frequency: "On appointment + annual"
    
    regulatory_references:
      - period: "6 years"
      - template: "FCA standard template"
      - turnaround: "6 weeks max"
    
    credit_checks:
      - required_for: ["SMFs", "CF30"]
      - red_flags:
        - "CCJs > £1000"
        - "IVA/bankruptcy"
        - "Defaults > 3"
        
  competence_capability:
    qualifications:
      by_role:
        SMF17:
          - "ICA Diploma in AML"
          - "Or equivalent + 3 years experience"
        CF30:
          - "Appropriate qualification level"
          - "Or time + competence pathway"
    
    experience_matrix:
      SMF1:
        minimum_years: 5
        relevant_sectors: ["Financial services", "Related regulated"]
        
  financial_soundness:
    checks:
      - "Personal financial questionnaire"
      - "Related party transactions"
      - "Outside business interests"
```

### 2.2 Ongoing F&P Monitoring
```yaml
continuous_monitoring:
  annual_cycle:
    Q1:
      - "F&P attestations collection"
      - "Criminal records refresh"
    Q2:
      - "Performance reviews alignment"
      - "Training needs analysis"
    Q3:
      - "Conduct rule breaches review"
      - "Outside interests update"
    Q4:
      - "Annual F&P determinations"
      - "Board reporting"
      
  trigger_events:
    immediate_reassessment:
      - "Regulatory investigation"
      - "Serious complaint"
      - "Whistleblowing report"
      - "Criminal charge"
      
    enhanced_monitoring:
      - "Performance concerns"
      - "Multiple minor breaches"
      - "Change in personal circumstances"
```

---

## 3. Performance & Conduct Tracking

### 3.1 Conduct Rules Framework
```yaml
individual_conduct_rules:
  Rule1:
    text: "You must act with integrity"
    breach_examples:
      - "Misleading a customer"
      - "Falsifying records"
      - "Misuse of position"
    severity_matrix:
      minor: "Warning + training"
      serious: "Disciplinary + FCA notification"
      
  Rule2:
    text: "You must act with due skill, care and diligence"
    breach_indicators:
      - "Repeated errors"
      - "Failure to follow process"
      - "Inadequate oversight"
      
senior_manager_conduct_rules:
  SC1:
    text: "Take reasonable steps to ensure controlled functions comply"
    evidence_requirements:
      - "Regular 1-2-1s documented"
      - "Clear objectives set"
      - "Intervention when issues arise"
      
  SC4:
    text: "Disclose appropriately any information to FCA"
    critical_timelines:
      - "Immediately: Material breaches"
      - "Without delay: Significant events"
```

### 3.2 Performance Logging System
```yaml
performance_tracking:
  metrics_dashboard:
    quantitative:
      - metric: "Regulatory breaches"
        threshold: 0
        rag_status: "Red if >0"
      
      - metric: "Training completion"
        threshold: 100%
        rag_status: "Amber <95%"
        
      - metric: "Attestation timeliness"
        threshold: "Due date"
        rag_status: "Red if late"
        
    qualitative:
      - "360 feedback scores"
      - "Risk culture behaviors"
      - "Decision quality assessments"
      
  evidence_trail:
    required_documents:
      - "Objectives & appraisals"
      - "Training records"
      - "Meeting minutes"
      - "Decision logs"
      - "Breach notifications"
```

---

## 4. Permission-Specific SM&CR Requirements

### 4.1 Payment Services Variations
```yaml
payment_services_smcr:
  unique_aspects:
    safeguarding_officer:
      role: "May be combined with SMF16"
      specific_duties:
        - "Daily reconciliation oversight"
        - "Safeguarding audit coordination"
        - "Insurance/guarantee management"
        
    operational_resilience_lead:
      enhanced_requirements:
        - "Important business services mapping"
        - "Tolerance setting & testing"
        - "Annual self-assessment"
        
  reduced_requirements:
    small_payment_institutions:
      threshold: "<€3m monthly average"
      exemptions:
        - "No SMF4 required"
        - "Combined SMF16/17 permitted"
        - "Simplified governance acceptable"
        
  api_psd2_specific:
    account_information:
      lighter_touch: true
      focus_areas: ["Data security", "Consent management"]
      
    payment_initiation:
      full_requirements: true
      additional: ["Liability framework", "Refund procedures"]
```

### 4.2 Consumer Credit Variations
```yaml
consumer_credit_smcr:
  limited_permission:
    simplified_approach:
      - "Single SMF acceptable"
      - "No certification regime"
      - "Basic conduct rules only"
      
  debt_management:
    enhanced_requirements:
      vulnerable_customers_champion:
        reports_to: "SMF1"
        responsibilities:
          - "Forbearance oversight"
          - "Collections governance"
          - "Vulnerability policies"
```

### 4.3 Investment Firms Variations
```yaml
investment_smcr:
  mifid_alignment:
    additional_functions:
      - "SMF9: Chair"
      - "SMF10: Chair of Risk Committee"
      
  ifpr_requirements:
    sns_firms:
      mandatory: ["SMF3", "SMF4", "SMF16", "SMF17"]
      k_factor_monitoring: true
      
    non_sns_firms:
      core_only: ["SMF1/3", "SMF16", "SMF17"]
      proportionate_approach: true
```

---

## 5. Interactive Dashboard Requirements

### 5.1 Main SM&CR Dashboard
```typescript
interface SMCRDashboard {
  summary: {
    total_smfs: number;
    total_certified: number;
    upcoming_assessments: Alert[];
    overdue_items: Warning[];
  };
  
  widgets: {
    fitness_proper_status: {
      green: number;  // All checks complete
      amber: number;  // Pending items
      red: number;    // Issues identified
    };
    
    conduct_breaches: {
      current_quarter: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      by_rule: Map<string, number>;
    };
    
    training_compliance: {
      completion_rate: number;
      overdue_persons: Person[];
      upcoming_deadlines: Deadline[];
    };
    
    regulatory_changes: {
      impacting_smcr: Change[];
      required_actions: Action[];
    };
  };
}
```

### 5.2 Individual SM&CR Record View
```typescript
interface IndividualRecord {
  basic_info: {
    name: string;
    employee_id: string;
    smf_cf_roles: Role[];
    start_date: Date;
    reporting_line: string;
  };
  
  fitness_proper: {
    last_assessment: Date;
    next_due: Date;
    status: 'Valid' | 'Under Review' | 'Issues';
    checks: {
      criminal_record: CheckResult;
      credit_check: CheckResult;
      regulatory_reference: CheckResult;
      qualifications: CheckResult;
    };
    documents: {
      statement_of_responsibilities: Document;
      role_profile: Document;
      certificates: Document[];
    };
  };
  
  performance_conduct: {
    objectives: Objective[];
    appraisals: Appraisal[];
    conduct_breaches: Breach[];
    training_log: Training[];
    mi_reviewed: MIRecord[];
  };
  
  audit_trail: {
    changes: ChangeLog[];
    approvals: Approval[];
    attestations: Attestation[];
  };
}
```

### 5.3 Reporting & Analytics
```yaml
standard_reports:
  board_pack:
    frequency: "Quarterly"
    contents:
      - "SM&CR population overview"
      - "F&P status summary"
      - "Conduct breach analysis"
      - "Training completion stats"
      - "Upcoming regulatory changes"
      
  fca_submissions:
    - "Annual SM&CR return"
    - "Breach notifications"
    - "Change notifications (Form A/E)"
    
  mi_dashboard:
    real_time_metrics:
      - "F&P RAG status"
      - "Overdue assessments"
      - "Breach trends"
      
    drill_down_capability:
      - "By business unit"
      - "By role type"
      - "By risk rating"
```

---

## 6. Integration Points

### 6.1 Links to Other Modules
```yaml
risk_module:
  - "Risk owner assignments (must be SMF/CF)"
  - "Risk event conduct implications"
  - "RCSA participation tracking"
  
training_module:
  - "Role-based learning paths"
  - "Competence evidence"
  - "CPD hour tracking"
  
compliance_module:
  - "Policy attestations"
  - "Breach management"
  - "Regulatory change impacts"
  
hr_systems:
  - "Employee lifecycle events"
  - "Performance management sync"
  - "Disciplinary actions feed"
```

### 6.2 Workflow Automation
```yaml
automated_workflows:
  onboarding:
    triggers: "New SMF/CF appointment"
    steps:
      1: "Generate F&P checklist"
      2: "Request regulatory references"
      3: "Schedule criminal record check"
      4: "Create training plan"
      5: "Draft Statement of Responsibilities"
      
  annual_review:
    triggers: "Anniversary date -30 days"
    steps:
      1: "Send attestation forms"
      2: "Refresh background checks"
      3: "Collate performance data"
      4: "Generate F&P determination"
      5: "Update regulatory systems"
      
  breach_management:
    triggers: "Conduct breach logged"
    steps:
      1: "Assess severity"
      2: "Notify SMF1 if serious"
      3: "Consider FCA notification"
      4: "Document remedial actions"
      5: "Update individual record"
```

---

## 7. Compliance Evidence & Audit

### 7.1 Document Retention
```yaml
retention_schedule:
  permanent:
    - "Appointment documentation"
    - "Regulatory notifications"
    - "Serious breach records"
    
  six_years_post_leaving:
    - "F&P assessments"
    - "Training records"
    - "Performance reviews"
    - "Regulatory references given"
    
  three_years:
    - "Meeting minutes"
    - "MI reports"
    - "Minor breach records"
```

### 7.2 Audit Requirements
```yaml
internal_audit:
  annual_review:
    scope:
      - "F&P process effectiveness"
      - "Conduct rule compliance"
      - "Training completion"
      - "Documentation quality"
      
  sample_testing:
    - "10% of F&P assessments"
    - "All serious breaches"
    - "New appointments process"
    
external_validation:
  skilled_person_review:
    when: "FCA requirement or major failings"
    focus: "End-to-end SM&CR framework"
```

---

## 8. Implementation Notes for AI Agent

### Critical Success Factors
1. **Real-time synchronization** with HR systems for employee changes
2. **Automated alerting** for time-critical items (references, notifications)
3. **Version control** for all Statements of Responsibilities
4. **Clear audit trails** for all F&P decisions
5. **Role-based access** controls (only senior managers see sensitive data)

### User Experience Priorities
1. **Single view of individual** - complete SM&CR record in one place
2. **Proactive notifications** - never miss a deadline
3. **Bulk operations** - manage annual attestations efficiently
4. **Smart workflows** - guide users through complex processes
5. **Mobile-responsive** - approve/review on the go

### Data Model Considerations
- **Temporal data** - track changes over time
- **Hierarchical relationships** - reporting lines, delegation
- **Document versioning** - maintain complete history
- **Flexible schema** - accommodate different firm structures
- **Encryption** - sensitive personal data protection

---

## Appendix: Quick Reference Tables

### SM&CR Scope by Firm Type
| Firm Type | Core | Enhanced | Banking |
|-----------|------|-----------|---------|
| Consumer Credit (limited) | ✓ | - | - |
| Consumer Credit (full) | ✓ | Possible | - |
| Payment Services (SPI) | ✓ | - | - |
| Payment Services (API/PI) | ✓ | ✓ (if large) | - |
| Investment (SNI) | ✓ | - | - |
| Investment (non-SNI) | ✓ | ✓ | - |

### Key Deadlines
| Action | Timeline |
|--------|----------|
| Regulatory reference request | Within 1 week of conditional offer |
| Criminal record check | Before start date |
| F&P assessment | Before appointment |
| FCA notification (Form A) | At least 3 months before |
| Conduct breach notification | Reasonable time (serious = immediate) |
| Annual certification | Within 12 months |

---

*This specification should be read in conjunction with the Training and Authorizations modules for complete SM&CR implementation.*