-- =====================================================
-- Policy Creator Module - Database Schema
-- =====================================================
-- Version: 1.0
-- Description: Complete schema for Policy Creator with clauses, questions, rules, and runs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. POLICIES CATALOG
-- =====================================================
-- Master catalog of available policy types
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'aml_ctf', 'vulnerable_customers'
  name TEXT NOT NULL, -- e.g., 'AML/CTF Policy'
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  jurisdiction TEXT NOT NULL DEFAULT 'UK',
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}', -- Additional policy metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_key ON policies(key);
CREATE INDEX idx_policies_active ON policies(is_active);

-- =====================================================
-- 2. CLAUSE LIBRARY
-- =====================================================
-- Reusable policy clauses/sections with versioning
CREATE TABLE IF NOT EXISTS clauses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL, -- e.g., 'aml_bwra', 'vc_consumer_duty_outcomes_uk'
  title TEXT NOT NULL,
  body_md TEXT NOT NULL, -- Markdown content with Liquid template variables
  tags JSONB NOT NULL DEFAULT '[]', -- ['consumer_duty', 'accessibility', 'training']
  risk_refs TEXT[] DEFAULT '{}', -- References to risk IDs
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  version TEXT NOT NULL DEFAULT '1.0.0',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clauses_policy_id ON clauses(policy_id);
CREATE INDEX idx_clauses_code ON clauses(code);
CREATE INDEX idx_clauses_tags ON clauses USING GIN(tags);
CREATE INDEX idx_clauses_mandatory ON clauses(is_mandatory);

-- =====================================================
-- 3. QUESTIONS
-- =====================================================
-- Dynamic questions for the wizard with conditional logic
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL, -- e.g., 'firm_role', 'pep_domestic'
  text TEXT NOT NULL, -- The question text
  help TEXT, -- Help text/tooltip
  type TEXT NOT NULL, -- 'select', 'multiselect', 'boolean', 'text', 'number'
  options JSONB, -- For select/multiselect: ["option1", "option2"]
  default_value JSONB, -- Default answer
  validation JSONB, -- Validation rules: {required: true, min: 0, max: 100}
  depends_on JSONB, -- Conditional display: {question_code: "firm_role", value: "principal"}
  display_order INTEGER NOT NULL DEFAULT 0,
  section TEXT, -- Group questions: 'firm_info', 'risk_controls', etc.
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_policy_id ON questions(policy_id);
CREATE INDEX idx_questions_code ON questions(code);
CREATE INDEX idx_questions_depends_on ON questions USING GIN(depends_on);

-- =====================================================
-- 4. RULES ENGINE
-- =====================================================
-- Conditional logic for dynamic clause selection
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 100, -- Higher priority = executes first
  condition JSONB NOT NULL, -- JSON Logic format: {"all": [{"q": "pep_domestic", "eq": true}]}
  action JSONB NOT NULL, -- {"include_clause_codes": ["aml_edd_domestic_pep"], "set_vars": {"approver_role": "SMF17"}}
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rules_policy_id ON rules(policy_id);
CREATE INDEX idx_rules_priority ON rules(priority DESC);
CREATE INDEX idx_rules_active ON rules(is_active);
CREATE INDEX idx_rules_condition ON rules USING GIN(condition);

-- =====================================================
-- 5. FIRM PROFILES
-- =====================================================
-- Store firm-specific attributes for policy defaults
CREATE TABLE IF NOT EXISTS firm_profiles (
  firm_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}', -- {permissions: [], client_types: [], channels: [], ar_or_principal: "principal"}
  branding JSONB NOT NULL DEFAULT '{}', -- {logo_url: "", primary_color: "", font: ""}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_firm_profiles_attributes ON firm_profiles USING GIN(attributes);

-- =====================================================
-- 6. RUNS (Policy Generation Instances)
-- =====================================================
-- Individual policy generation runs with answers and outputs
CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- User-defined title for this run
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'published', 'archived'
  answers JSONB NOT NULL DEFAULT '{}', -- Question answers: {"firm_role": "principal", "pep_domestic": true}
  selected_clause_codes TEXT[] NOT NULL DEFAULT '{}', -- Final selected clause codes
  variables JSONB NOT NULL DEFAULT '{}', -- Computed variables from rules: {"approver_role": "SMF17"}
  outputs JSONB, -- {docx_url: "", pdf_url: "", json_url: "", generated_at: ""}
  version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  review_due_date DATE,
  created_by UUID NOT NULL, -- User who created the run
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_saved_at TIMESTAMPTZ, -- For autosave tracking

  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'archived'))
);

CREATE INDEX idx_runs_firm_id ON runs(firm_id);
CREATE INDEX idx_runs_policy_id ON runs(policy_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_runs_created_by ON runs(created_by);
CREATE INDEX idx_runs_answers ON runs USING GIN(answers);
CREATE INDEX idx_runs_review_due ON runs(review_due_date) WHERE review_due_date IS NOT NULL;

-- =====================================================
-- 7. APPROVALS
-- =====================================================
-- Approval workflow tracking
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL, -- User ID of approver
  approver_role TEXT, -- 'SMF16', 'SMF17', 'Board', 'Compliance Officer'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'changes_requested'
  notes TEXT, -- Approver comments
  redlines JSONB, -- Suggested changes: [{clause_code: "aml_bwra", suggestion: "Update frequency"}]
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested'))
);

CREATE INDEX idx_approvals_run_id ON approvals(run_id);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);
CREATE INDEX idx_approvals_status ON approvals(status);

-- =====================================================
-- 8. AUDIT LOG
-- =====================================================
-- Comprehensive audit trail for all actions
CREATE TABLE IF NOT EXISTS audit (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
  actor_id UUID NOT NULL, -- User who performed the action
  action TEXT NOT NULL, -- 'run_created', 'answer_updated', 'clause_selected', 'approval_requested', 'document_generated'
  payload JSONB NOT NULL DEFAULT '{}', -- Action-specific data
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_run_id ON audit(run_id);
CREATE INDEX idx_audit_actor_id ON audit(actor_id);
CREATE INDEX idx_audit_action ON audit(action);
CREATE INDEX idx_audit_created_at ON audit(created_at DESC);
CREATE INDEX idx_audit_payload ON audit USING GIN(payload);

-- =====================================================
-- 9. POLICY REGISTER
-- =====================================================
-- Published policies register with versioning
CREATE TABLE IF NOT EXISTS policy_register (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL,
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  policy_key TEXT NOT NULL, -- From policies.key
  policy_name TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'superseded', 'archived'
  effective_date DATE NOT NULL,
  review_due_date DATE NOT NULL,
  next_review_reminder DATE,
  document_urls JSONB NOT NULL, -- {docx: "", pdf: "", json: ""}
  owner_id UUID NOT NULL, -- Policy owner
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_register_status CHECK (status IN ('active', 'superseded', 'archived'))
);

CREATE INDEX idx_policy_register_firm_id ON policy_register(firm_id);
CREATE INDEX idx_policy_register_run_id ON policy_register(run_id);
CREATE INDEX idx_policy_register_status ON policy_register(status);
CREATE INDEX idx_policy_register_review_due ON policy_register(review_due_date);
CREATE INDEX idx_policy_register_next_reminder ON policy_register(next_review_reminder) WHERE next_review_reminder IS NOT NULL;

-- =====================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clauses_updated_at BEFORE UPDATE ON clauses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_firm_profiles_updated_at BEFORE UPDATE ON firm_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_runs_updated_at BEFORE UPDATE ON runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_register_updated_at BEFORE UPDATE ON policy_register FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. COMMENTS
-- =====================================================
COMMENT ON TABLE policies IS 'Master catalog of available policy types (AML, Vulnerable Customers, etc.)';
COMMENT ON TABLE clauses IS 'Reusable policy clauses with Markdown templates and Liquid variables';
COMMENT ON TABLE questions IS 'Dynamic wizard questions with conditional display logic';
COMMENT ON TABLE rules IS 'Rules engine for dynamic clause selection based on answers';
COMMENT ON TABLE firm_profiles IS 'Firm-specific attributes for policy defaults and branding';
COMMENT ON TABLE runs IS 'Individual policy generation instances with answers and outputs';
COMMENT ON TABLE approvals IS 'Approval workflow tracking with redlines and sign-offs';
COMMENT ON TABLE audit IS 'Comprehensive audit trail for all policy creator actions';
COMMENT ON TABLE policy_register IS 'Published policies register with versioning and review tracking';

-- =====================================================
-- 12. SAMPLE DATA (Optional - for development)
-- =====================================================
-- Insert default firm profile for testing
INSERT INTO firm_profiles (firm_id, name, attributes, branding) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Organization',
  '{
    "permissions": ["credit_broking", "insurance_mediation", "investments_advice"],
    "client_types": ["retail", "professional"],
    "channels": ["online", "telephone", "face_to_face"],
    "ar_or_principal": "principal",
    "size": "medium",
    "outsourcing": ["kyc_vendor", "tm_system"]
  }',
  '{
    "primary_color": "#4F46E5",
    "secondary_color": "#10B981",
    "logo_url": "/logos/default.png",
    "font": "Inter"
  }'
) ON CONFLICT (firm_id) DO NOTHING;
