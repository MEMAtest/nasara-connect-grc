// SM&CR Module Types - Based on specification requirements
// Senior Managers & Certification Regime Implementation

export interface SMCRDashboard {
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

export interface IndividualRecord {
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

// Senior Management Functions
export interface SeniorManagementFunction {
  id: string;
  smf_number: string; // SMF1, SMF3, etc.
  title: string;
  description: string;
  required_for: string[];
  prescribed_responsibilities: number[];
  unique_requirements?: string[];
  additional_duties?: string[];
  is_universal: boolean;
  category: 'universal' | 'payment_specific' | 'investment_specific' | 'insurance_specific';
}

// Certification Functions
export interface CertificationFunction {
  id: string;
  cf_number: string; // CF30, CF29, etc.
  title: string;
  description: string;
  applies_to: string[];
  annual_assessment: boolean;
  competence_requirements?: {
    technical_knowledge_test?: boolean;
    annual_cpd_hours?: number;
    qualifications?: string[];
  };
}

// Prescribed Responsibilities
export interface PrescribedResponsibility {
  id: string;
  pr_number: string; // PR1, PR15, etc.
  description: string;
  typical_holder: string;
  evidence_required: string[];
  monitoring?: string[];
  specific_checks?: string[];
}

// Fitness & Propriety
export interface FitnessProprietyAssessment {
  id: string;
  person_id: string;
  assessment_date: Date;
  next_due_date: Date;
  status: 'Valid' | 'Under Review' | 'Issues' | 'Overdue';

  honesty_integrity: {
    criminal_records_check: CriminalRecordCheck;
    regulatory_references: RegulatoryReference[];
    credit_checks: CreditCheck;
  };

  competence_capability: {
    qualifications: Qualification[];
    experience: ExperienceRecord[];
    training_completion: TrainingRecord[];
  };

  financial_soundness: {
    personal_financial_questionnaire: Document;
    related_party_transactions: Transaction[];
    outside_business_interests: BusinessInterest[];
  };

  overall_determination: 'Fit and Proper' | 'Not Fit and Proper' | 'Conditional';
  conditions?: string[];
  reviewer: string;
  approved_by: string;
}

// Conduct Rules
export interface ConductRule {
  id: string;
  rule_number: string; // Rule1, Rule2, SC1, SC4, etc.
  text: string;
  type: 'individual' | 'senior_manager';
  breach_examples?: string[];
  breach_indicators?: string[];
  evidence_requirements?: string[];
  critical_timelines?: string[];
  severity_matrix?: {
    minor: string;
    serious: string;
    severe: string;
  };
}

export interface ConductBreach {
  id: string;
  person_id: string;
  rule_id: string;
  date_identified: Date;
  description: string;
  severity: 'minor' | 'serious' | 'severe';
  status: 'open' | 'investigating' | 'resolved' | 'escalated';

  investigation: {
    investigator: string;
    findings: string;
    evidence: Document[];
    recommendations: string[];
  };

  actions_taken: {
    disciplinary_action?: string;
    training_required?: boolean;
    fca_notification?: boolean;
    notification_date?: Date;
  };

  resolution_date?: Date;
  lessons_learned?: string;
}

// Supporting Types
export interface Person {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  reporting_manager: string;
  start_date: Date;
  end_date?: Date;
  roles: Role[];
}

export interface Role {
  id: string;
  type: 'SMF' | 'CF' | 'Staff';
  function_id: string; // Links to SMF or CF
  start_date: Date;
  end_date?: Date;
  statement_of_responsibilities?: Document;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface Alert {
  id: string;
  type: 'assessment_due' | 'overdue' | 'breach' | 'regulatory_change';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  due_date?: Date;
  person_id?: string;
  action_required: string;
  created_date: Date;
}

export interface Warning extends Alert {
  days_overdue: number;
  escalation_level: number;
}

export interface CheckResult {
  status: 'complete' | 'pending' | 'failed' | 'not_required';
  date_completed?: Date;
  result: 'clear' | 'issues_identified' | 'pending_review';
  details?: string;
  documents: Document[];
  next_due?: Date;
}

export interface CriminalRecordCheck extends CheckResult {
  scope: 'unspent_convictions' | 'spent_financial_crime' | 'full_enhanced';
  provider: string;
  certificate_number?: string;
}

export interface RegulatoryReference {
  id: string;
  referee_firm: string;
  referee_contact: string;
  period_covered: {
    start_date: Date;
    end_date: Date;
  };
  request_date: Date;
  response_received?: Date;
  status: 'requested' | 'received' | 'overdue' | 'not_required';
  template_used: 'fca_standard' | 'custom';
  reference_details?: {
    fitness_propriety_concerns: boolean;
    disciplinary_actions: boolean;
    performance_concerns: boolean;
    additional_comments?: string;
  };
}

export interface CreditCheck extends CheckResult {
  ccjs_over_1000: boolean;
  iva_bankruptcy: boolean;
  defaults_over_3: boolean;
  score?: number;
  adverse_items: AdverseItem[];
}

export interface AdverseItem {
  type: 'ccj' | 'default' | 'iva' | 'bankruptcy';
  amount?: number;
  date: Date;
  status: 'satisfied' | 'unsatisfied' | 'current';
  details: string;
}

export interface Qualification {
  id: string;
  type: string;
  title: string;
  awarding_body: string;
  date_achieved: Date;
  expiry_date?: Date;
  certificate_number?: string;
  verified: boolean;
}

export interface ExperienceRecord {
  employer: string;
  position: string;
  start_date: Date;
  end_date?: Date;
  sector: 'financial_services' | 'related_regulated' | 'other';
  relevance_score: number;
  verified: boolean;
}

export interface TrainingRecord {
  course_id: string;
  course_title: string;
  completion_date: Date;
  provider: string;
  cpd_hours: number;
  certificate?: Document;
}

export interface BusinessInterest {
  company_name: string;
  nature_of_business: string;
  role: string;
  percentage_holding?: number;
  potential_conflicts: string[];
  approval_required: boolean;
  approved: boolean;
}

export interface Transaction {
  date: Date;
  counterparty: string;
  amount: number;
  description: string;
  potential_conflict: boolean;
  approved: boolean;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  target_date: Date;
  status: 'not_started' | 'in_progress' | 'complete' | 'overdue';
  progress_percentage: number;
  linked_to_prescribed_responsibility?: string;
}

export interface Appraisal {
  id: string;
  period: {
    start_date: Date;
    end_date: Date;
  };
  rating: 'outstanding' | 'exceeds_expectations' | 'meets_expectations' | 'below_expectations' | 'unsatisfactory';
  objectives_met: number;
  conduct_rating: string;
  development_areas: string[];
  reviewer: string;
  review_date: Date;
}

export interface Breach {
  id: string;
  rule_breached: string;
  date: Date;
  severity: 'minor' | 'serious' | 'severe';
  description: string;
  status: 'open' | 'resolved';
  actions_taken: string[];
}

export interface Training {
  course_id: string;
  title: string;
  completion_date?: Date;
  due_date?: Date;
  status: 'not_started' | 'in_progress' | 'complete' | 'overdue';
  mandatory: boolean;
}

export interface MIRecord {
  report_type: string;
  report_date: Date;
  reviewed_by: string;
  issues_identified: string[];
  actions_required: string[];
}

export interface ChangeLog {
  id: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  change_date: Date;
  reason: string;
}

export interface Approval {
  id: string;
  approval_type: 'appointment' | 'role_change' | 'responsibility_allocation';
  approved_by: string;
  approval_date: Date;
  conditions?: string[];
  expiry_date?: Date;
}

export interface Attestation {
  id: string;
  attestation_type: 'annual_certification' | 'fitness_propriety' | 'responsibilities';
  attestation_date: Date;
  attested_by: string;
  status: 'valid' | 'expired' | 'revoked';
  statement: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  file_path?: string;
  upload_date: Date;
  uploaded_by: string;
  version: number;
  status: 'draft' | 'final' | 'archived';
  confidentiality_level: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface Change {
  id: string;
  regulation: string;
  effective_date: Date;
  impact_assessment: string;
  smcr_impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface Action {
  id: string;
  description: string;
  due_date: Date;
  assigned_to: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'complete';
}

export interface Deadline {
  person_id: string;
  task: string;
  due_date: Date;
  type: 'assessment' | 'training' | 'certification' | 'reference';
}

// Workflow Types
export interface WorkflowStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  assigned_to?: string;
  due_date?: Date;
  status: 'pending' | 'in_progress' | 'complete' | 'skipped';
  completion_date?: Date;
  notes?: string;
}

export interface Workflow {
  id: string;
  type: 'onboarding' | 'annual_review' | 'breach_management' | 'role_change';
  trigger_event: string;
  person_id: string;
  started_date: Date;
  target_completion: Date;
  status: 'active' | 'complete' | 'paused' | 'cancelled';
  steps: WorkflowStep[];
  current_step: number;
}

// Performance Metrics
export interface PerformanceMetric {
  metric_name: string;
  current_value: number | string;
  threshold: number | string;
  rag_status: 'red' | 'amber' | 'green';
  trend: 'improving' | 'stable' | 'declining';
  last_updated: Date;
}

// API Response Types
export interface SMCRApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Filter and Search Types
export interface SMCRFilter {
  role_type?: 'SMF' | 'CF' | 'All';
  status?: 'active' | 'inactive' | 'pending';
  department?: string;
  assessment_status?: 'current' | 'due' | 'overdue';
  breach_status?: 'none' | 'minor' | 'serious';
}

export interface SearchCriteria {
  query?: string;
  filters: SMCRFilter;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}