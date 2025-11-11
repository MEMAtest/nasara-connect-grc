/**
 * Policy Creator Module - TypeScript Types
 * Corresponds to PostgreSQL schema in database/migrations/001_policy_creator_schema.sql
 */

// =====================================================
// ENUMS
// =====================================================

export type RunStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';
export type RegisterStatus = 'active' | 'superseded' | 'archived';
export type QuestionType = 'select' | 'multiselect' | 'boolean' | 'text' | 'number' | 'date';

// =====================================================
// 1. POLICY
// =====================================================

export interface Policy {
  id: string;
  key: string; // 'aml_ctf', 'vulnerable_customers'
  name: string;
  description?: string;
  version: string;
  jurisdiction: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PolicyCreate extends Omit<Policy, 'id' | 'created_at' | 'updated_at'> {}

// =====================================================
// 2. CLAUSE
// =====================================================

export interface Clause {
  id: string;
  policy_id: string;
  code: string; // Unique identifier
  title: string;
  body_md: string; // Markdown with Liquid variables
  tags: string[]; // ['consumer_duty', 'training']
  risk_refs: string[];
  is_mandatory: boolean;
  display_order: number;
  version: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ClauseCreate extends Omit<Clause, 'id' | 'created_at' | 'updated_at'> {}

// =====================================================
// 3. QUESTION
// =====================================================

export interface QuestionValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string; // Custom validation function name
}

export interface QuestionDependency {
  question_code: string;
  operator?: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt'; // Default: 'eq'
  value: any;
}

export interface Question {
  id: string;
  policy_id: string;
  code: string; // Unique identifier
  text: string;
  help?: string;
  type: QuestionType;
  options?: string[] | { value: string; label: string }[]; // For select/multiselect
  default_value?: any;
  validation?: QuestionValidation;
  depends_on?: QuestionDependency | QuestionDependency[]; // Conditional display
  display_order: number;
  section?: string; // Group questions
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface QuestionCreate extends Omit<Question, 'id' | 'created_at' | 'updated_at'> {}

// =====================================================
// 4. RULE
// =====================================================

/**
 * Rule Condition Format (JSON Logic):
 *
 * Simple: {"q": "pep_domestic", "eq": true}
 * All: {"all": [{"q": "firm_role", "eq": "principal"}, {"q": "client_types", "includes": "retail"}]}
 * Any: {"any": [{"q": "permissions", "includes": "investments"}, {"q": "permissions", "includes": "insurance"}]}
 * Not: {"not": {"q": "outsourcing", "includes": "none"}}
 */
export interface RuleCondition {
  q?: string; // Question code
  eq?: any; // Equals
  neq?: any; // Not equals
  in?: any[]; // Value is in array
  nin?: any[]; // Value is not in array
  includes?: any; // Array includes value (for multiselect)
  gt?: number; // Greater than
  lt?: number; // Less than
  gte?: number; // Greater than or equal
  lte?: number; // Less than or equal
  all?: RuleCondition[]; // All conditions must be true
  any?: RuleCondition[]; // At least one condition must be true
  not?: RuleCondition; // Negates the condition
}

/**
 * Rule Action Format:
 *
 * Include clauses: {"include_clause_codes": ["aml_bwra", "aml_cdd"]}
 * Exclude clauses: {"exclude_clause_codes": ["optional_clause"]}
 * Set variables: {"set_vars": {"approver_role": "SMF17", "review_frequency": "quarterly"}}
 * Suggest clauses: {"suggest_clause_codes": ["enhanced_monitoring"], "reason": "High risk jurisdiction detected"}
 */
export interface RuleAction {
  include_clause_codes?: string[];
  exclude_clause_codes?: string[];
  set_vars?: Record<string, any>;
  suggest_clause_codes?: string[];
  reason?: string; // For suggestions
}

export interface Rule {
  id: string;
  policy_id: string;
  name: string;
  description?: string;
  priority: number; // Higher = executes first
  condition: RuleCondition;
  action: RuleAction;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RuleCreate extends Omit<Rule, 'id' | 'created_at' | 'updated_at'> {}

// =====================================================
// 5. FIRM PROFILE
// =====================================================

export interface FirmAttributes {
  permissions?: string[]; // FCA permissions
  client_types?: string[]; // retail, professional, ecp
  channels?: string[]; // online, telephone, face_to_face
  ar_or_principal?: 'principal' | 'appointed_representative';
  size?: 'small' | 'medium' | 'large';
  outsourcing?: string[]; // kyc_vendor, tm_system, call_center
  high_risk_jurisdictions?: string[];
  products?: string[];
  [key: string]: any; // Allow custom attributes
}

export interface FirmBranding {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font?: string;
  watermark_drafts?: boolean;
}

export interface FirmProfile {
  firm_id: string;
  name: string;
  attributes: FirmAttributes;
  branding: FirmBranding;
  created_at: string;
  updated_at: string;
}

export interface FirmProfileCreate extends Omit<FirmProfile, 'created_at' | 'updated_at'> {}

// =====================================================
// 6. RUN (Policy Generation Instance)
// =====================================================

export interface RunOutputs {
  docx_url?: string;
  pdf_url?: string;
  json_url?: string;
  generated_at?: string;
}

export interface Run {
  id: string;
  firm_id: string;
  policy_id: string;
  title: string;
  status: RunStatus;
  answers: Record<string, any>; // Question answers
  selected_clause_codes: string[];
  variables: Record<string, any>; // Computed variables from rules
  outputs?: RunOutputs;
  version: number;
  published_at?: string;
  review_due_date?: string; // ISO date
  created_by: string; // User ID
  created_at: string;
  updated_at: string;
  last_saved_at?: string; // For autosave
}

export interface RunCreate extends Omit<Run, 'id' | 'created_at' | 'updated_at' | 'version' | 'last_saved_at'> {
  version?: number;
}

export interface RunUpdate {
  title?: string;
  status?: RunStatus;
  answers?: Record<string, any>;
  selected_clause_codes?: string[];
  variables?: Record<string, any>;
  outputs?: RunOutputs;
  review_due_date?: string;
  published_at?: string;
}

// =====================================================
// 7. APPROVAL
// =====================================================

export interface ApprovalRedline {
  clause_code: string;
  suggestion: string;
  reason?: string;
}

export interface Approval {
  id: string;
  run_id: string;
  approver_id: string; // User ID
  approver_role?: string; // 'SMF16', 'SMF17', 'Board'
  status: ApprovalStatus;
  notes?: string;
  redlines?: ApprovalRedline[];
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalCreate extends Omit<Approval, 'id' | 'created_at' | 'updated_at' | 'signed_at'> {}

export interface ApprovalUpdate {
  status?: ApprovalStatus;
  notes?: string;
  redlines?: ApprovalRedline[];
}

// =====================================================
// 8. AUDIT LOG
// =====================================================

export type AuditAction =
  | 'run_created'
  | 'run_updated'
  | 'answer_updated'
  | 'clause_selected'
  | 'clause_deselected'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_rejected'
  | 'changes_requested'
  | 'document_generated'
  | 'run_published'
  | 'run_archived';

export interface AuditLog {
  id: number;
  run_id?: string;
  actor_id: string; // User ID
  action: AuditAction;
  payload: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogCreate extends Omit<AuditLog, 'id' | 'created_at'> {}

// =====================================================
// 9. POLICY REGISTER
// =====================================================

export interface PolicyRegisterDocuments {
  docx: string;
  pdf: string;
  json: string;
}

export interface PolicyRegister {
  id: string;
  firm_id: string;
  run_id: string;
  policy_key: string;
  policy_name: string;
  version: string;
  status: RegisterStatus;
  effective_date: string; // ISO date
  review_due_date: string; // ISO date
  next_review_reminder?: string; // ISO date
  document_urls: PolicyRegisterDocuments;
  owner_id: string; // User ID
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PolicyRegisterCreate extends Omit<PolicyRegister, 'id' | 'created_at' | 'updated_at'> {}

// =====================================================
// WIZARD-SPECIFIC TYPES
// =====================================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  is_complete: boolean;
}

export interface WizardState {
  run_id?: string;
  policy_key: string;
  current_step: number;
  answers: Record<string, any>;
  selected_clauses: string[];
  suggested_clauses: Array<{
    code: string;
    reason: string;
  }>;
  variables: Record<string, any>;
  is_saving: boolean;
  last_saved_at?: string;
}

export interface ClausePreview {
  code: string;
  title: string;
  body_rendered: string; // After Liquid processing
  is_mandatory: boolean;
  is_selected: boolean;
  is_suggested: boolean;
  suggestion_reason?: string;
}

// =====================================================
// RULES ENGINE TYPES
// =====================================================

export interface RulesEngineResult {
  included_clauses: string[];
  excluded_clauses: string[];
  suggested_clauses: Array<{
    code: string;
    reason: string;
  }>;
  variables: Record<string, any>;
  rules_fired: Array<{
    rule_id: string;
    rule_name: string;
    condition_met: boolean;
  }>;
}

export interface EvaluateRulesInput {
  policy_id: string;
  answers: Record<string, any>;
  firm_attributes?: FirmAttributes;
}

// =====================================================
// DOCUMENT GENERATION TYPES
// =====================================================

export interface DocumentGenerationInput {
  run_id: string;
  clauses: Clause[];
  answers: Record<string, any>;
  variables: Record<string, any>;
  firm_branding: FirmBranding;
  metadata: {
    policy_name: string;
    version: string;
    generated_by: string;
    generated_at: string;
  };
}

export interface DocumentGenerationOutput {
  docx_url: string;
  pdf_url: string;
  json_url: string;
  generated_at: string;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateRunRequest {
  policy_key: string;
  title: string;
  firm_id: string;
  created_by: string;
  initial_answers?: Record<string, any>;
}

export interface CreateRunResponse {
  run: Run;
  questions: Question[];
  firm_profile?: FirmProfile;
}

export interface UpdateRunRequest {
  answers?: Record<string, any>;
  selected_clause_codes?: string[];
}

export interface UpdateRunResponse {
  run: Run;
  clause_preview: ClausePreview[];
  rules_result: RulesEngineResult;
}

export interface GenerateDocumentsRequest {
  run_id: string;
  include_watermark?: boolean;
}

export interface GenerateDocumentsResponse {
  success: boolean;
  outputs: RunOutputs;
  audit_log_id: number;
}

export interface RequestApprovalRequest {
  run_id: string;
  approver_ids: string[];
  notes?: string;
}

export interface RequestApprovalResponse {
  approvals: Approval[];
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
