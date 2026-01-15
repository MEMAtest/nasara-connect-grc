import { Pool } from 'pg';
import { logger, logError, logDbOperation } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export { pool };

// Database initialization
export async function initDatabase() {
  const client = await pool.connect();

  try {
    // Create assessments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        business_type VARCHAR(100),
        target_permissions TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        last_modified TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'draft',
        organization_id VARCHAR(100) DEFAULT 'default-org'
      )
    `);

    // Create assessment_responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
        question_id VARCHAR(100) NOT NULL,
        section VARCHAR(100) NOT NULL,
        value TEXT,
        score INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(assessment_id, question_id)
      )
    `);

    // Create assessment_sections table for tracking section completion
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
        section_id VARCHAR(100) NOT NULL,
        completed_questions INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        max_score INTEGER DEFAULT 0,
        completed_at TIMESTAMP,
        UNIQUE(assessment_id, section_id)
      )
    `);

    // Create evidence_documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS evidence_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'required' CHECK (status IN ('required', 'uploaded', 'approved', 'rejected')),
        file_path TEXT,
        file_size INTEGER,
        file_type TEXT,
        uploaded_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create gap_analysis table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gap_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
        status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'in-progress', 'resolved')),
        impact TEXT,
        recommendation TEXT,
        estimated_effort TEXT,
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        format TEXT NOT NULL CHECK (format IN ('pdf', 'word', 'excel', 'powerpoint')),
        file_path TEXT,
        generated_at TIMESTAMP,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS policy_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        investment_services BOOLEAN DEFAULT FALSE,
        payment_services BOOLEAN DEFAULT FALSE,
        e_money BOOLEAN DEFAULT FALSE,
        credit_broking BOOLEAN DEFAULT FALSE,
        client_money BOOLEAN DEFAULT FALSE,
        client_assets BOOLEAN DEFAULT FALSE,
        insurance_mediation BOOLEAN DEFAULT FALSE,
        mortgage_mediation BOOLEAN DEFAULT FALSE,
        dealing_as_agent BOOLEAN DEFAULT FALSE,
        dealing_as_principal BOOLEAN DEFAULT FALSE,
        arranging_deals BOOLEAN DEFAULT FALSE,
        advising BOOLEAN DEFAULT FALSE,
        managing BOOLEAN DEFAULT FALSE,
        safeguarding BOOLEAN DEFAULT FALSE,
        retail_clients BOOLEAN DEFAULT FALSE,
        professional_clients BOOLEAN DEFAULT FALSE,
        eligible_counterparties BOOLEAN DEFAULT FALSE,
        complex_products BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (organization_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '{}'::jsonb,
        template JSONB NOT NULL,
        clauses JSONB DEFAULT '[]'::jsonb,
        custom_content JSONB DEFAULT '{}'::jsonb,
        approvals JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_policies_organization
      ON policies (organization_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS policy_triggers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
        reason VARCHAR(100) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        triggered_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_policy_triggers_org ON policy_triggers (organization_id, triggered_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cmp_controls (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cmp_controls_org ON cmp_controls (organization_id)
    `);

    // Create case_studies table for landing page case studies
    await client.query(`
      CREATE TABLE IF NOT EXISTS case_studies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(500),
        description TEXT,
        icon_key VARCHAR(100) NOT NULL DEFAULT 'network-nodes',
        metrics JSONB DEFAULT '[]'::jsonb,
        before_after JSONB DEFAULT '{}'::jsonb,
        industry VARCHAR(100),
        category VARCHAR(100),
        display_name VARCHAR(100) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies (is_published, sort_order)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies (industry)
    `);

    // Authorization Pack Module - Vanta-style tables

    // Pack Templates (Gold Standard Definition)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        pack_type VARCHAR(100) NOT NULL,
        typical_timeline_weeks INTEGER DEFAULT 12,
        policy_templates JSONB DEFAULT '[]'::jsonb,
        training_requirements JSONB DEFAULT '[]'::jsonb,
        smcr_roles JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add missing columns for existing tables (schema migration)
    await client.query(`
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS code VARCHAR(50);
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS pack_type VARCHAR(100);
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS typical_timeline_weeks INTEGER DEFAULT 12;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS policy_templates JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS training_requirements JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS smcr_roles JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);

    // Section Templates (27 Gold Standard Sections)
    await client.query(`
      CREATE TABLE IF NOT EXISTS section_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_template_id UUID REFERENCES pack_templates(id) ON DELETE CASCADE,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        guidance_text TEXT,
        order_index INTEGER NOT NULL,
        regulatory_reference VARCHAR(500),
        definition_of_done JSONB DEFAULT '[]'::jsonb,
        evidence_requirements JSONB DEFAULT '[]'::jsonb,
        UNIQUE(pack_template_id, code)
      )
    `);

    // Authorization Packs (User Instances)
    await client.query(`
      CREATE TABLE IF NOT EXISTS authorization_packs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL,
        pack_template_id UUID REFERENCES pack_templates(id),
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        progress_percentage INTEGER DEFAULT 0,
        readiness_score INTEGER DEFAULT 0,
        assessment_data JSONB DEFAULT '{}'::jsonb,
        project_plan JSONB DEFAULT '{}'::jsonb,
        created_by UUID,
        assigned_consultant UUID,
        target_submission_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_packs_org ON authorization_packs (organization_id)
    `);

    // Pack Section Instances
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE CASCADE,
        section_template_id UUID REFERENCES section_templates(id),
        status VARCHAR(50) DEFAULT 'not_started',
        progress_percentage INTEGER DEFAULT 0,
        narrative_content JSONB DEFAULT '{}'::jsonb,
        definition_of_done_status JSONB DEFAULT '{}'::jsonb,
        submitted_at TIMESTAMP,
        reviewed_by UUID,
        approved_by UUID,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(pack_id, section_template_id)
      )
    `);

    // Pack Evidence Items
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_evidence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_section_id UUID REFERENCES pack_sections(id) ON DELETE CASCADE,
        requirement_code VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        evidence_type VARCHAR(50) NOT NULL,
        reference_url TEXT,
        reference_metadata JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'required',
        provided_by UUID,
        verified_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Pack Review Comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_review_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_section_id UUID REFERENCES pack_sections(id) ON DELETE CASCADE,
        author_id UUID NOT NULL,
        author_role VARCHAR(50) NOT NULL,
        comment_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Project Milestones (for Gantt chart)
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        due_date DATE,
        completed_at TIMESTAMP,
        dependencies JSONB DEFAULT '[]'::jsonb,
        linked_module VARCHAR(50),
        linked_item_id UUID,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Project Documents (Cloud Storage Document Hub)
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE CASCADE,
        milestone_id UUID REFERENCES project_milestones(id),
        section_code VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        storage_key TEXT,
        file_size_bytes BIGINT,
        mime_type VARCHAR(100),
        checksum VARCHAR(64),
        version INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'draft',
        uploaded_by UUID,
        uploaded_at TIMESTAMP,
        reviewed_by UUID,
        reviewed_at TIMESTAMP,
        signed_by UUID,
        signed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_project_docs_pack ON project_documents (pack_id)
    `);

    // Document Comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES project_documents(id) ON DELETE CASCADE,
        author_id UUID NOT NULL,
        author_name VARCHAR(255),
        content TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Pack Tasks
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE CASCADE,
        pack_section_id UUID REFERENCES pack_sections(id),
        milestone_id UUID REFERENCES project_milestones(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to UUID,
        assigned_name VARCHAR(255),
        due_date DATE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pack_tasks_pack ON pack_tasks (pack_id)
    `);

    // PEP (Politically Exposed Person) Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS pep_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        pep_type VARCHAR(50) NOT NULL DEFAULT 'customer',
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        nationality VARCHAR(100),
        position_held VARCHAR(500),
        pep_category VARCHAR(50) NOT NULL DEFAULT 'pep',
        relationship_type VARCHAR(100),
        risk_rating VARCHAR(20) DEFAULT 'high',
        status VARCHAR(50) DEFAULT 'active',
        identification_date DATE NOT NULL DEFAULT CURRENT_DATE,
        last_review_date DATE,
        next_review_date DATE,
        edd_completed BOOLEAN DEFAULT FALSE,
        edd_completed_date DATE,
        source_of_wealth TEXT,
        source_of_funds TEXT,
        approval_status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pep_records_org ON pep_records (organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pep_records_pack ON pep_records (pack_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pep_records_status ON pep_records (status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pep_records_risk ON pep_records (risk_rating)
    `);

    // Third-Party Register (Vendor/Outsourcing Management)
    await client.query(`
      CREATE TABLE IF NOT EXISTS third_party_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        vendor_name VARCHAR(255) NOT NULL,
        vendor_type VARCHAR(100) NOT NULL,
        service_description TEXT,
        criticality VARCHAR(20) DEFAULT 'medium',
        is_outsourcing BOOLEAN DEFAULT FALSE,
        is_material_outsourcing BOOLEAN DEFAULT FALSE,
        regulatory_notification_required BOOLEAN DEFAULT FALSE,
        contract_start_date DATE,
        contract_end_date DATE,
        contract_value_gbp DECIMAL(15,2),
        risk_rating VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'active',
        primary_contact_name VARCHAR(255),
        primary_contact_email VARCHAR(255),
        primary_contact_phone VARCHAR(50),
        due_diligence_completed BOOLEAN DEFAULT FALSE,
        due_diligence_date DATE,
        last_review_date DATE,
        next_review_date DATE,
        exit_strategy_documented BOOLEAN DEFAULT FALSE,
        data_processing_agreement BOOLEAN DEFAULT FALSE,
        sub_outsourcing_permitted BOOLEAN DEFAULT FALSE,
        geographic_location VARCHAR(255),
        approval_status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_third_party_org ON third_party_records (organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_third_party_pack ON third_party_records (pack_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_third_party_status ON third_party_records (status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_third_party_criticality ON third_party_records (criticality)
    `);

    // Complaints Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        complaint_reference VARCHAR(50) UNIQUE,
        complainant_name VARCHAR(255) NOT NULL,
        complaint_type VARCHAR(50) NOT NULL DEFAULT 'other',
        complaint_category VARCHAR(50) DEFAULT 'pending',
        received_date DATE NOT NULL DEFAULT CURRENT_DATE,
        acknowledged_date DATE,
        resolution_deadline DATE,
        resolved_date DATE,
        root_cause TEXT,
        remedial_action TEXT,
        compensation_amount DECIMAL(15,2),
        fos_referred BOOLEAN DEFAULT FALSE,
        fos_outcome VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open',
        assigned_to VARCHAR(255),
        priority VARCHAR(20) DEFAULT 'medium',
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_org ON complaints_records (organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints_records (status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_received ON complaints_records (received_date)
    `);

    // Complaint Letters Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_letters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID NOT NULL REFERENCES complaints_records(id) ON DELETE CASCADE,
        template_type VARCHAR(50) NOT NULL,
        letter_reference VARCHAR(50),
        generated_content TEXT,
        template_variables JSONB,
        status VARCHAR(30) DEFAULT 'draft',
        generated_at TIMESTAMP DEFAULT NOW(),
        sent_at TIMESTAMP,
        sent_via VARCHAR(30),
        generated_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaint_letters_complaint ON complaint_letters (complaint_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaint_letters_type ON complaint_letters (template_type)
    `);

    // Complaint Activities Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID NOT NULL REFERENCES complaints_records(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        old_value VARCHAR(255),
        new_value VARCHAR(255),
        metadata JSONB,
        performed_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaint_activities_complaint ON complaint_activities (complaint_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaint_activities_type ON complaint_activities (activity_type)
    `);

    // Add new fields to complaints_records if they don't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'complainant_email') THEN
          ALTER TABLE complaints_records ADD COLUMN complainant_email VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'complainant_address') THEN
          ALTER TABLE complaints_records ADD COLUMN complainant_address TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'four_week_letter_sent') THEN
          ALTER TABLE complaints_records ADD COLUMN four_week_letter_sent BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'eight_week_letter_sent') THEN
          ALTER TABLE complaints_records ADD COLUMN eight_week_letter_sent BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'final_response_sent') THEN
          ALTER TABLE complaints_records ADD COLUMN final_response_sent BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'final_response_date') THEN
          ALTER TABLE complaints_records ADD COLUMN final_response_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'product_type') THEN
          ALTER TABLE complaints_records ADD COLUMN product_type VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'policy_reference') THEN
          ALTER TABLE complaints_records ADD COLUMN policy_reference VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'complaints_records' AND column_name = 'contact_method') THEN
          ALTER TABLE complaints_records ADD COLUMN contact_method VARCHAR(50);
        END IF;
      END $$
    `);

    // Incident Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        incident_reference VARCHAR(50) UNIQUE,
        incident_title VARCHAR(255) NOT NULL,
        incident_type VARCHAR(50) NOT NULL DEFAULT 'other',
        severity VARCHAR(20) DEFAULT 'medium',
        detected_date DATE NOT NULL DEFAULT CURRENT_DATE,
        occurred_date DATE,
        reported_date DATE,
        resolved_date DATE,
        description TEXT,
        root_cause TEXT,
        impact_assessment TEXT,
        immediate_actions TEXT,
        remedial_actions TEXT,
        lessons_learned TEXT,
        regulatory_notification_required BOOLEAN DEFAULT FALSE,
        regulatory_notification_date DATE,
        status VARCHAR(50) DEFAULT 'detected',
        assigned_to VARCHAR(255),
        affected_systems TEXT,
        affected_customers_count INTEGER DEFAULT 0,
        financial_impact DECIMAL(15,2),
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidents_org ON incident_records (organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incident_records (status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incident_records (severity)
    `);

    // Conflicts of Interest Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS coi_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        declarant_name VARCHAR(255) NOT NULL,
        declarant_role VARCHAR(255),
        declaration_date DATE NOT NULL DEFAULT CURRENT_DATE,
        conflict_type VARCHAR(50) NOT NULL DEFAULT 'other',
        description TEXT NOT NULL,
        parties_involved TEXT,
        potential_impact TEXT,
        mitigation_measures TEXT,
        review_frequency VARCHAR(50) DEFAULT 'annual',
        last_review_date DATE,
        next_review_date DATE,
        risk_rating VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'active',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coi_org ON coi_records (organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coi_status ON coi_records (status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coi_declarant ON coi_records (declarant_name)
    `);

    // Gifts & Hospitality Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS gifts_hospitality_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        entry_type VARCHAR(50) NOT NULL DEFAULT 'gift_received',
        date_of_event DATE NOT NULL DEFAULT CURRENT_DATE,
        recipient_name VARCHAR(255),
        recipient_organization VARCHAR(255),
        provider_name VARCHAR(255),
        provider_organization VARCHAR(255),
        description TEXT NOT NULL,
        estimated_value_gbp DECIMAL(15,2),
        business_justification TEXT,
        approval_required BOOLEAN DEFAULT FALSE,
        approval_status VARCHAR(50) DEFAULT 'not_required',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        declined BOOLEAN DEFAULT FALSE,
        declined_reason TEXT,
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gifts_org ON gifts_hospitality_records (organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gifts_type ON gifts_hospitality_records (entry_type)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gifts_date ON gifts_hospitality_records (date_of_event)
    `);

    logger.info('Database tables initialized successfully');
  } catch (error) {
    logError(error, 'Failed to initialize database');
    throw error;
  } finally {
    client.release();
  }
}

// Assessment CRUD operations
export interface Assessment {
  id: string;
  name: string;
  description?: string;
  business_type?: string;
  target_permissions?: string[];
  created_at: Date;
  last_modified: Date;
  status: 'draft' | 'in-progress' | 'completed' | 'submitted';
  organization_id: string;
  progress?: number;
  completed_sections?: string[];
  total_sections?: number;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  question_id: string;
  section: string;
  value: string;
  score: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentSection {
  id: string;
  assessment_id: string;
  section_id: string;
  completed_questions: number;
  total_questions: number;
  score: number;
  max_score: number;
  completed_at?: Date;
}

export interface EvidenceDocument {
  id: string;
  assessment_id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  status: 'required' | 'uploaded' | 'approved' | 'rejected';
  file_path?: string;
  file_size?: number;
  file_type?: string;
  uploaded_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Gap {
  id: string;
  assessment_id: string;
  title: string;
  description?: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'identified' | 'in-progress' | 'resolved';
  impact?: string;
  recommendation?: string;
  estimated_effort?: string;
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Report {
  id: string;
  assessment_id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  format: 'pdf' | 'word' | 'excel' | 'powerpoint';
  file_path?: string;
  generated_at?: Date;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export async function createAssessment(data: {
  name: string;
  description?: string;
  business_type?: string;
  target_permissions?: string[];
  organization_id?: string;
}): Promise<Assessment> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO assessments (name, description, business_type, target_permissions, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      data.name,
      data.description,
      data.business_type,
      data.target_permissions,
      data.organization_id || 'default-org'
    ]);

    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAssessments(organizationId: string = 'default-org'): Promise<Assessment[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT a.*,
        COALESCE(
          ROUND(
            (SUM(s.completed_questions)::float / NULLIF(SUM(s.total_questions), 0)) * 100
          ), 0
        ) as progress,
        ARRAY_AGG(
          CASE WHEN s.completed_questions = s.total_questions AND s.total_questions > 0
               THEN s.section_id
               ELSE NULL END
        ) FILTER (WHERE s.completed_questions = s.total_questions AND s.total_questions > 0) as completed_sections
      FROM assessments a
      LEFT JOIN assessment_sections s ON a.id = s.assessment_id
      WHERE a.organization_id = $1
      GROUP BY a.id
      ORDER BY a.last_modified DESC
    `, [organizationId]);

    return result.rows.map(row => ({
      ...row,
      completed_sections: row.completed_sections || [],
      total_sections: 5,
      progress: parseInt(row.progress) || 0
    }));
  } finally {
    client.release();
  }
}

export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT a.*,
        COALESCE(
          ROUND(
            (SUM(s.completed_questions)::float / NULLIF(SUM(s.total_questions), 0)) * 100
          ), 0
        ) as progress,
        ARRAY_AGG(
          CASE WHEN s.completed_questions = s.total_questions AND s.total_questions > 0
               THEN s.section_id
               ELSE NULL END
        ) FILTER (WHERE s.completed_questions = s.total_questions AND s.total_questions > 0) as completed_sections
      FROM assessments a
      LEFT JOIN assessment_sections s ON a.id = s.assessment_id
      WHERE a.id = $1
      GROUP BY a.id
    `, [assessmentId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      completed_sections: row.completed_sections || [],
      total_sections: 5,
      progress: parseInt(row.progress) || 0
    };
  } finally {
    client.release();
  }
}

export async function saveAssessmentResponse(data: {
  assessment_id: string;
  question_id: string;
  section: string;
  value: string;
  score: number;
  notes?: string;
}): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Save/update response
    await client.query(`
      INSERT INTO assessment_responses (assessment_id, question_id, section, value, score, notes, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (assessment_id, question_id)
      DO UPDATE SET value = $4, score = $5, notes = $6, updated_at = NOW()
    `, [data.assessment_id, data.question_id, data.section, data.value, data.score, data.notes]);

    // Update assessment last_modified
    await client.query(`
      UPDATE assessments SET last_modified = NOW() WHERE id = $1
    `, [data.assessment_id]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT * FROM assessment_responses
      WHERE assessment_id = $1
      ORDER BY created_at ASC
    `, [assessmentId]);

    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateSectionProgress(data: {
  assessment_id: string;
  section_id: string;
  completed_questions: number;
  total_questions: number;
  score: number;
  max_score: number;
}): Promise<void> {
  const client = await pool.connect();

  try {
    const isCompleted = data.completed_questions === data.total_questions;

    await client.query(`
      INSERT INTO assessment_sections
      (assessment_id, section_id, completed_questions, total_questions, score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, ${isCompleted ? 'NOW()' : 'NULL'})
      ON CONFLICT (assessment_id, section_id)
      DO UPDATE SET
        completed_questions = $3,
        total_questions = $4,
        score = $5,
        max_score = $6,
        completed_at = ${isCompleted ? 'NOW()' : 'assessment_sections.completed_at'}
    `, [data.assessment_id, data.section_id, data.completed_questions, data.total_questions, data.score, data.max_score]);
  } finally {
    client.release();
  }
}

// Evidence Documents CRUD operations
export async function initializeEvidenceDocuments(assessmentId: string): Promise<void> {
  const client = await pool.connect();

  try {
    // Initialize standard FCA evidence documents for new assessments
    const standardDocuments = [
      {
        name: "Business Plan",
        type: "Core Document",
        category: "business-model",
        description: "Comprehensive business plan outlining your strategy, target market, and revenue model"
      },
      {
        name: "Organizational Chart",
        type: "Governance",
        category: "governance",
        description: "Clear organizational structure showing reporting lines and key personnel"
      },
      {
        name: "Risk Appetite Statement",
        type: "Risk Management",
        category: "risk-management",
        description: "Formal statement of risk tolerance and appetite levels"
      },
      {
        name: "Capital Adequacy Assessment",
        type: "Financial",
        category: "financial-resources",
        description: "Assessment demonstrating adequate capital for proposed activities"
      },
      {
        name: "IT Systems Inventory",
        type: "Systems & Controls",
        category: "systems-controls",
        description: "Detailed inventory of all IT systems and infrastructure"
      },
      {
        name: "Policies & Procedures Manual",
        type: "Governance",
        category: "governance",
        description: "Comprehensive manual of all operational policies and procedures"
      },
      {
        name: "Compliance Manual",
        type: "Risk Management",
        category: "risk-management",
        description: "Detailed compliance monitoring and reporting procedures"
      },
      {
        name: "3-Year Financial Projections",
        type: "Financial",
        category: "financial-resources",
        description: "Detailed financial forecasts including P&L, balance sheet, and cash flow"
      },
      {
        name: "AML Procedures",
        type: "Systems & Controls",
        category: "systems-controls",
        description: "Anti-money laundering policies and procedures"
      },
      {
        name: "Consumer Duty Implementation",
        type: "Core Document",
        category: "business-model",
        description: "Evidence of Consumer Duty compliance implementation"
      }
    ];

    for (const doc of standardDocuments) {
      await client.query(`
        INSERT INTO evidence_documents (assessment_id, name, type, category, description, status)
        VALUES ($1, $2, $3, $4, $5, 'required')
        ON CONFLICT DO NOTHING
      `, [assessmentId, doc.name, doc.type, doc.category, doc.description]);
    }
  } finally {
    client.release();
  }
}

export async function getEvidenceDocuments(assessmentId: string): Promise<EvidenceDocument[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT * FROM evidence_documents
      WHERE assessment_id = $1
      ORDER BY created_at ASC
    `, [assessmentId]);

    return result.rows;
  } finally {
    client.release();
  }
}

// Allowed columns for evidence_documents updates (SQL injection prevention)
const EVIDENCE_DOCUMENT_ALLOWED_COLUMNS = new Set([
  'name', 'description', 'file_path', 'file_type', 'status', 'notes'
]);

export async function updateEvidenceDocument(
  documentId: string,
  updates: Partial<Omit<EvidenceDocument, 'id' | 'assessment_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const client = await pool.connect();

  try {
    // Filter to only allowed columns to prevent SQL injection
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => EVIDENCE_DOCUMENT_ALLOWED_COLUMNS.has(key))
    );

    if (Object.keys(safeUpdates).length === 0) {
      return; // No valid updates
    }

    const setClause = Object.keys(safeUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    await client.query(`
      UPDATE evidence_documents
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
    `, [documentId, ...Object.values(safeUpdates)]);
  } finally {
    client.release();
  }
}

// Gap Analysis CRUD operations
export async function initializeGapAnalysis(assessmentId: string): Promise<void> {
  const client = await pool.connect();

  try {
    // Initialize standard gaps based on common FCA authorization issues
    const standardGaps = [
      {
        title: "Consumer Duty Implementation Gaps",
        description: "Assessment indicates incomplete Consumer Duty implementation across customer journey",
        category: "business-model",
        severity: "critical",
        impact: "Regulatory non-compliance could delay or prevent authorization",
        recommendation: "Develop comprehensive Consumer Duty framework with clear policies, procedures, and monitoring",
        estimated_effort: "4-6 weeks",
        deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000) // 6 weeks from now
      },
      {
        title: "Risk Appetite Framework Incomplete",
        description: "Current risk appetite statement lacks quantitative metrics and board approval",
        category: "risk-management",
        severity: "high",
        impact: "FCA expects robust risk management framework with clear appetite statements",
        recommendation: "Finalize risk appetite framework with board approval and quantitative limits",
        estimated_effort: "2-3 weeks"
      },
      {
        title: "Capital Buffer Below Recommended Level",
        description: "Current capital projections show minimal buffer above regulatory requirements",
        category: "financial-resources",
        severity: "high",
        impact: "May be insufficient to demonstrate financial resilience under stress scenarios",
        recommendation: "Increase capital buffer to at least 150% of minimum requirements",
        estimated_effort: "1-2 weeks"
      },
      {
        title: "IT Governance Policy Missing",
        description: "No formal IT governance policy covering change management and security",
        category: "systems-controls",
        severity: "medium",
        impact: "FCA expects robust IT governance for operational resilience",
        recommendation: "Develop comprehensive IT governance policy including change management procedures",
        estimated_effort: "3-4 weeks"
      },
      {
        title: "Senior Management Certification Gaps",
        description: "Some key personnel lack required FCA certifications or sector experience",
        category: "governance",
        severity: "medium",
        impact: "FCA requires appropriate qualifications for senior management functions",
        recommendation: "Complete certification process and document relevant experience",
        estimated_effort: "2-4 weeks"
      },
      {
        title: "Outsourcing Agreement Terms",
        description: "Current outsourcing agreements may not meet FCA requirements for oversight",
        category: "systems-controls",
        severity: "low",
        impact: "Non-compliant outsourcing could impact operational resilience",
        recommendation: "Review and update outsourcing agreements to include required oversight provisions",
        estimated_effort: "1-2 weeks"
      }
    ];

    for (const gap of standardGaps) {
      await client.query(`
        INSERT INTO gap_analysis (assessment_id, title, description, category, severity, status, impact, recommendation, estimated_effort, deadline)
        VALUES ($1, $2, $3, $4, $5, 'identified', $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
      `, [
        assessmentId,
        gap.title,
        gap.description,
        gap.category,
        gap.severity,
        gap.impact,
        gap.recommendation,
        gap.estimated_effort,
        gap.deadline || null
      ]);
    }
  } finally {
    client.release();
  }
}

export async function getGapAnalysis(assessmentId: string): Promise<Gap[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT * FROM gap_analysis
      WHERE assessment_id = $1
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at ASC
    `, [assessmentId]);

    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateGapStatus(
  gapId: string,
  status: 'identified' | 'in-progress' | 'resolved'
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`
      UPDATE gap_analysis
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, gapId]);
  } finally {
    client.release();
  }
}

// Reports CRUD operations
export async function initializeReports(assessmentId: string): Promise<void> {
  const client = await pool.connect();

  try {
    // Initialize standard report types for FCA authorization
    const standardReports = [
      {
        name: "FCA Readiness Assessment Report",
        type: "readiness-assessment",
        category: "assessment",
        description: "Comprehensive overview of your authorization readiness with scoring and recommendations",
        format: "pdf"
      },
      {
        name: "Section-by-Section Analysis",
        type: "section-analysis",
        category: "assessment",
        description: "Detailed analysis of each assessment section with gaps and improvement areas",
        format: "word"
      },
      {
        name: "Evidence Portfolio Summary",
        type: "evidence-summary",
        category: "compliance",
        description: "Complete inventory of submitted evidence documents with status tracking",
        format: "excel"
      },
      {
        name: "Gap Analysis & Remediation Plan",
        type: "gap-remediation",
        category: "gap-analysis",
        description: "Prioritized action plan for addressing identified readiness gaps",
        format: "pdf"
      },
      {
        name: "Executive Summary Presentation",
        type: "executive-summary",
        category: "executive",
        description: "High-level presentation for senior management and board review",
        format: "powerpoint"
      },
      {
        name: "Regulatory Compliance Checklist",
        type: "compliance-checklist",
        category: "compliance",
        description: "Detailed checklist of FCA requirements with completion status",
        format: "excel"
      },
      {
        name: "Technical Implementation Guide",
        type: "technical-guide",
        category: "technical",
        description: "Technical documentation for IT and operations teams",
        format: "word"
      },
      {
        name: "Timeline & Milestones Report",
        type: "timeline-milestones",
        category: "executive",
        description: "Project timeline with key milestones and delivery dates",
        format: "pdf"
      }
    ];

    for (const report of standardReports) {
      await client.query(`
        INSERT INTO reports (assessment_id, name, type, category, description, format, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        ON CONFLICT DO NOTHING
      `, [
        assessmentId,
        report.name,
        report.type,
        report.category,
        report.description,
        report.format
      ]);
    }
  } finally {
    client.release();
  }
}

export async function getReports(assessmentId: string): Promise<Report[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT * FROM reports
      WHERE assessment_id = $1
      ORDER BY category, name ASC
    `, [assessmentId]);

    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'generating' | 'completed' | 'failed',
  filePath?: string
): Promise<void> {
  const client = await pool.connect();

  try {
    const updates: string[] = ['status = $1', 'updated_at = NOW()'];
    const values: (string | Date)[] = [status, reportId];

    if (status === 'completed' && filePath) {
      updates.push('file_path = $3', 'generated_at = NOW()');
      values.splice(1, 0, filePath);
    }

    await client.query(`
      UPDATE reports
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
    `, values);
  } finally {
    client.release();
  }
}

// Case Studies interfaces and CRUD operations
export interface CaseStudyMetric {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface BeforeAfterData {
  before: {
    label: string;
    value: string;
    details?: string[];
  };
  after: {
    label: string;
    value: string;
    details?: string[];
  };
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  iconKey: string;
  metrics: CaseStudyMetric[];
  beforeAfter?: BeforeAfterData;
  industry?: string;
  category?: string;
  displayName: string;
  sortOrder: number;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transform database row to CaseStudy interface
function transformCaseStudy(row: Record<string, unknown>): CaseStudy {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string | undefined,
    description: row.description as string | undefined,
    iconKey: row.icon_key as string,
    metrics: (row.metrics as CaseStudyMetric[]) || [],
    beforeAfter: row.before_after as BeforeAfterData | undefined,
    industry: row.industry as string | undefined,
    category: row.category as string | undefined,
    displayName: row.display_name as string,
    sortOrder: row.sort_order as number,
    isPublished: row.is_published as boolean,
    featured: row.featured as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function getCaseStudies(publishedOnly: boolean = true): Promise<CaseStudy[]> {
  const client = await pool.connect();

  try {
    const query = publishedOnly
      ? `SELECT * FROM case_studies WHERE is_published = true ORDER BY sort_order ASC, created_at DESC`
      : `SELECT * FROM case_studies ORDER BY sort_order ASC, created_at DESC`;

    const result = await client.query(query);
    return result.rows.map(transformCaseStudy);
  } finally {
    client.release();
  }
}

export async function getCaseStudy(id: string): Promise<CaseStudy | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM case_studies WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    return transformCaseStudy(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function createCaseStudy(data: {
  title: string;
  subtitle?: string;
  description?: string;
  iconKey?: string;
  metrics?: CaseStudyMetric[];
  beforeAfter?: BeforeAfterData;
  industry?: string;
  category?: string;
  displayName: string;
  sortOrder?: number;
  isPublished?: boolean;
  featured?: boolean;
}): Promise<CaseStudy> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO case_studies (
        title, subtitle, description, icon_key, metrics, before_after,
        industry, category, display_name, sort_order, is_published, featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      data.title,
      data.subtitle || null,
      data.description || null,
      data.iconKey || 'network-nodes',
      JSON.stringify(data.metrics || []),
      JSON.stringify(data.beforeAfter || {}),
      data.industry || null,
      data.category || null,
      data.displayName,
      data.sortOrder || 0,
      data.isPublished || false,
      data.featured || false,
    ]);

    return transformCaseStudy(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function updateCaseStudy(
  id: string,
  data: Partial<Omit<CaseStudy, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<CaseStudy | null> {
  const client = await pool.connect();

  try {
    // Build dynamic update query
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.subtitle !== undefined) {
      updates.push(`subtitle = $${paramIndex++}`);
      values.push(data.subtitle);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.iconKey !== undefined) {
      updates.push(`icon_key = $${paramIndex++}`);
      values.push(data.iconKey);
    }
    if (data.metrics !== undefined) {
      updates.push(`metrics = $${paramIndex++}`);
      values.push(JSON.stringify(data.metrics));
    }
    if (data.beforeAfter !== undefined) {
      updates.push(`before_after = $${paramIndex++}`);
      values.push(JSON.stringify(data.beforeAfter));
    }
    if (data.industry !== undefined) {
      updates.push(`industry = $${paramIndex++}`);
      values.push(data.industry);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }
    if (data.displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`);
      values.push(data.displayName);
    }
    if (data.sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(data.sortOrder);
    }
    if (data.isPublished !== undefined) {
      updates.push(`is_published = $${paramIndex++}`);
      values.push(data.isPublished);
    }
    if (data.featured !== undefined) {
      updates.push(`featured = $${paramIndex++}`);
      values.push(data.featured);
    }

    if (updates.length === 0) {
      return getCaseStudy(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(`
      UPDATE case_studies
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) return null;
    return transformCaseStudy(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function deleteCaseStudy(id: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `DELETE FROM case_studies WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// Seed initial case studies for the landing page
export async function seedCaseStudies(): Promise<void> {
  const client = await pool.connect();

  try {
    // Check if case studies already exist
    const existing = await client.query(`SELECT COUNT(*) FROM case_studies`);
    if (parseInt(existing.rows[0].count) > 0) {
      return; // Already seeded
    }

    const initialCaseStudies = [
      {
        title: "Automated AML Compliance Transformation",
        subtitle: "How a Tier 1 Bank reduced compliance overhead by 85%",
        displayName: "Tier 1 Bank",
        iconKey: "shield-matrix",
        industry: "banking",
        category: "compliance",
        metrics: [
          { label: "Time Reduction", value: "85%", description: "in manual review processes" },
          { label: "Cost Savings", value: "$2.4M", description: "annual operational savings" },
          { label: "Accuracy", value: "99.9%", description: "detection rate" }
        ],
        beforeAfter: {
          before: { label: "Manual Process", value: "40 hrs/week", details: ["5 FTE dedicated", "High error rate", "2-week backlog"] },
          after: { label: "Automated System", value: "4 hrs/week", details: ["1 FTE oversight", "99.9% accuracy", "Real-time processing"] }
        },
        sortOrder: 1,
        isPublished: true,
      },
      {
        title: "Real-time Risk Monitoring Platform",
        subtitle: "Enabling predictive risk management for a leading FinTech",
        displayName: "Leading FinTech",
        iconKey: "risk-radar",
        industry: "fintech",
        category: "risk-management",
        metrics: [
          { label: "Risk Detection", value: "3x", description: "faster threat identification" },
          { label: "False Positives", value: "-70%", description: "reduction in alerts" },
          { label: "Response Time", value: "< 5min", description: "average incident response" }
        ],
        beforeAfter: {
          before: { label: "Reactive Approach", value: "24hr response", details: ["Manual monitoring", "Daily reports", "Limited visibility"] },
          after: { label: "Proactive Defense", value: "5min response", details: ["Automated alerts", "Real-time dashboards", "Predictive analytics"] }
        },
        sortOrder: 2,
        isPublished: true,
      },
      {
        title: "Global Regulatory Compliance Unification",
        subtitle: "Streamlining multi-jurisdictional compliance for a global issuer",
        displayName: "Global Issuer",
        iconKey: "integration-mesh",
        industry: "issuing",
        category: "compliance",
        metrics: [
          { label: "Jurisdictions", value: "45+", description: "markets covered" },
          { label: "Time to Market", value: "60%", description: "faster regulatory approval" },
          { label: "Compliance Cost", value: "-40%", description: "operational reduction" }
        ],
        beforeAfter: {
          before: { label: "Fragmented Systems", value: "12 platforms", details: ["Siloed data", "Manual reconciliation", "Inconsistent reporting"] },
          after: { label: "Unified Platform", value: "1 system", details: ["Centralized data", "Automated workflows", "Consistent compliance"] }
        },
        sortOrder: 3,
        isPublished: true,
      },
      {
        title: "Payment Reconciliation Automation",
        subtitle: "Achieving 99.9% accuracy in high-volume transaction processing",
        displayName: "Payment Provider",
        iconKey: "data-flow",
        industry: "payments",
        category: "automation",
        metrics: [
          { label: "Transactions", value: "1M+", description: "processed daily" },
          { label: "Match Rate", value: "99.9%", description: "automatic reconciliation" },
          { label: "Processing", value: "< 1sec", description: "average transaction time" }
        ],
        beforeAfter: {
          before: { label: "Manual Matching", value: "98% accuracy", details: ["End-of-day processing", "Manual exceptions", "24hr settlement"] },
          after: { label: "AI Matching", value: "99.9% accuracy", details: ["Real-time processing", "Auto-resolution", "Instant settlement"] }
        },
        sortOrder: 4,
        isPublished: true,
      },
      {
        title: "Investment Portfolio Governance Framework",
        subtitle: "Building institutional-grade compliance for an asset manager",
        displayName: "Asset Manager",
        iconKey: "compliance-nodes",
        industry: "asset-management",
        category: "governance",
        metrics: [
          { label: "AUM Coverage", value: "$50B+", description: "assets under management" },
          { label: "Audit Time", value: "-75%", description: "reduction in audit prep" },
          { label: "Violations", value: "Zero", description: "regulatory findings" }
        ],
        beforeAfter: {
          before: { label: "Spreadsheet Tracking", value: "Manual oversight", details: ["Quarterly reviews", "Paper trails", "Reactive compliance"] },
          after: { label: "Automated Governance", value: "Continuous monitoring", details: ["Real-time alerts", "Digital audit trail", "Proactive compliance"] }
        },
        sortOrder: 5,
        isPublished: true,
      },
      {
        title: "Digital Banking Compliance Acceleration",
        subtitle: "Fast-tracking FCA authorization for a digital bank",
        displayName: "Digital Bank",
        iconKey: "speed-lines",
        industry: "digital-banking",
        category: "compliance",
        metrics: [
          { label: "Authorization", value: "6 months", description: "time to FCA approval" },
          { label: "Documentation", value: "100%", description: "audit-ready from day 1" },
          { label: "Launch Speed", value: "2x", description: "faster than industry average" }
        ],
        beforeAfter: {
          before: { label: "Traditional Path", value: "12-18 months", details: ["Manual applications", "Consultant-heavy", "Fragmented evidence"] },
          after: { label: "Accelerated Path", value: "6 months", details: ["Guided workflows", "Integrated platform", "Complete documentation"] }
        },
        sortOrder: 6,
        isPublished: true,
      },
    ];

    for (const cs of initialCaseStudies) {
      await client.query(`
        INSERT INTO case_studies (
          title, subtitle, display_name, icon_key, industry, category,
          metrics, before_after, sort_order, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        cs.title,
        cs.subtitle,
        cs.displayName,
        cs.iconKey,
        cs.industry,
        cs.category,
        JSON.stringify(cs.metrics),
        JSON.stringify(cs.beforeAfter),
        cs.sortOrder,
        cs.isPublished,
      ]);
    }
  } finally {
    client.release();
  }
}

// ============================================
// Authorization Pack Module - Types & Functions
// ============================================

export interface PackTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  pack_type: string;
  typical_timeline_weeks: number;
  policy_templates: string[];
  training_requirements: string[];
  smcr_roles: string[];
  is_active: boolean;
  created_at: Date;
}

export interface SectionTemplate {
  id: string;
  pack_template_id: string;
  code: string;
  name: string;
  guidance_text?: string;
  order_index: number;
  regulatory_reference?: string;
  definition_of_done: string[];
  evidence_requirements: string[];
}

export interface AuthorizationPack {
  id: string;
  organization_id: string;
  pack_template_id: string;
  name: string;
  status: 'draft' | 'assessment' | 'in_progress' | 'review' | 'ready' | 'submitted';
  progress_percentage: number;
  readiness_score: number;
  assessment_data: Record<string, unknown>;
  project_plan: Record<string, unknown>;
  created_by?: string;
  assigned_consultant?: string;
  target_submission_date?: Date;
  created_at: Date;
  updated_at: Date;
  template_name?: string;
  pack_type?: string;
  typical_timeline_weeks?: number;
}

export interface PackSection {
  id: string;
  pack_id: string;
  section_template_id: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'review' | 'approved';
  progress_percentage: number;
  narrative_content: Record<string, unknown>;
  definition_of_done_status: Record<string, boolean>;
  submitted_at?: Date;
  reviewed_by?: string;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PackEvidence {
  id: string;
  pack_section_id: string;
  requirement_code: string;
  title: string;
  evidence_type: string;
  reference_url?: string;
  reference_metadata: Record<string, unknown>;
  status: 'required' | 'provided' | 'verified' | 'rejected';
  provided_by?: string;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PackReviewComment {
  id: string;
  pack_section_id: string;
  author_id: string;
  author_role: 'client' | 'consultant';
  comment_type: 'feedback' | 'question' | 'approval' | 'rejection';
  content: string;
  resolved: boolean;
  created_at: Date;
}

export interface ProjectMilestone {
  id: string;
  pack_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  due_date?: Date;
  completed_at?: Date;
  dependencies: string[];
  linked_module?: string;
  linked_item_id?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectDocument {
  id: string;
  pack_id: string;
  milestone_id?: string;
  section_code?: string;
  name: string;
  description?: string;
  storage_key?: string;
  file_size_bytes?: number;
  mime_type?: string;
  checksum?: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'signed';
  uploaded_by?: string;
  uploaded_at?: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  signed_by?: string;
  signed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  resolved: boolean;
  created_at: Date;
}

export interface PackTask {
  id: string;
  pack_id: string;
  pack_section_id?: string;
  milestone_id?: string;
  title: string;
  description?: string;
  task_type: 'document' | 'review' | 'approval' | 'action' | 'meeting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_to?: string;
  assigned_name?: string;
  due_date?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Pack Templates CRUD
export async function getPackTemplates(): Promise<PackTemplate[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM pack_templates WHERE is_active = true ORDER BY name
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPackTemplate(code: string): Promise<PackTemplate | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM pack_templates WHERE code = $1
    `, [code]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getSectionTemplates(packTemplateId: string): Promise<SectionTemplate[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM section_templates
      WHERE pack_template_id = $1
      ORDER BY order_index
    `, [packTemplateId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Authorization Packs CRUD
export async function createAuthorizationPack(data: {
  organization_id: string;
  pack_template_id: string;
  name: string;
  created_by?: string;
  assigned_consultant?: string;
  target_submission_date?: Date;
}): Promise<AuthorizationPack> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create the pack
    const result = await client.query(`
      INSERT INTO authorization_packs
      (organization_id, pack_template_id, name, created_by, assigned_consultant, target_submission_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.organization_id,
      data.pack_template_id,
      data.name,
      data.created_by,
      data.assigned_consultant,
      data.target_submission_date
    ]);

    const pack = result.rows[0];

    // Create section instances from templates
    const sectionTemplates = await client.query(`
      SELECT * FROM section_templates WHERE pack_template_id = $1
    `, [data.pack_template_id]);

    for (const template of sectionTemplates.rows) {
      await client.query(`
        INSERT INTO pack_sections (pack_id, section_template_id)
        VALUES ($1, $2)
      `, [pack.id, template.id]);
    }

    await client.query('COMMIT');
    return pack;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAuthorizationPacks(organizationId: string): Promise<AuthorizationPack[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ap.*, pt.name as template_name, pt.pack_type
      FROM authorization_packs ap
      LEFT JOIN pack_templates pt ON ap.pack_template_id = pt.id
      WHERE ap.organization_id = $1
      ORDER BY ap.updated_at DESC
    `, [organizationId]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getAuthorizationPack(packId: string): Promise<AuthorizationPack | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ap.*, pt.name as template_name, pt.pack_type, pt.typical_timeline_weeks
      FROM authorization_packs ap
      LEFT JOIN pack_templates pt ON ap.pack_template_id = pt.id
      WHERE ap.id = $1
    `, [packId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function updateAuthorizationPack(
  packId: string,
  updates: Partial<Pick<AuthorizationPack, 'name' | 'status' | 'progress_percentage' | 'readiness_score' | 'assessment_data' | 'project_plan' | 'assigned_consultant' | 'target_submission_date'>>
): Promise<AuthorizationPack | null> {
  const client = await pool.connect();
  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(updates.name); }
    if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.progress_percentage !== undefined) { setClauses.push(`progress_percentage = $${idx++}`); values.push(updates.progress_percentage); }
    if (updates.readiness_score !== undefined) { setClauses.push(`readiness_score = $${idx++}`); values.push(updates.readiness_score); }
    if (updates.assessment_data !== undefined) { setClauses.push(`assessment_data = $${idx++}`); values.push(JSON.stringify(updates.assessment_data)); }
    if (updates.project_plan !== undefined) { setClauses.push(`project_plan = $${idx++}`); values.push(JSON.stringify(updates.project_plan)); }
    if (updates.assigned_consultant !== undefined) { setClauses.push(`assigned_consultant = $${idx++}`); values.push(updates.assigned_consultant); }
    if (updates.target_submission_date !== undefined) { setClauses.push(`target_submission_date = $${idx++}`); values.push(updates.target_submission_date); }

    values.push(packId);

    const result = await client.query(`
      UPDATE authorization_packs
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteAuthorizationPack(packId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete related data in order (respecting foreign key constraints)
    await client.query('DELETE FROM pack_review_comments WHERE section_instance_id IN (SELECT id FROM pack_section_instances WHERE pack_id = $1)', [packId]);
    await client.query('DELETE FROM pack_tasks WHERE pack_id = $1', [packId]);
    await client.query('DELETE FROM project_documents WHERE pack_id = $1', [packId]);
    await client.query('DELETE FROM project_milestones WHERE pack_id = $1', [packId]);
    await client.query('DELETE FROM pack_section_instances WHERE pack_id = $1', [packId]);

    // Delete the pack itself
    const result = await client.query('DELETE FROM authorization_packs WHERE id = $1 RETURNING id', [packId]);

    await client.query('COMMIT');
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Pack Sections CRUD
export async function getPackSections(packId: string): Promise<(PackSection & { template: SectionTemplate })[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ps.*,
             st.code as template_code, st.name as template_name,
             st.guidance_text, st.order_index, st.regulatory_reference,
             st.definition_of_done, st.evidence_requirements
      FROM pack_sections ps
      JOIN section_templates st ON ps.section_template_id = st.id
      WHERE ps.pack_id = $1
      ORDER BY st.order_index
    `, [packId]);

    return result.rows.map(row => ({
      id: row.id,
      pack_id: row.pack_id,
      section_template_id: row.section_template_id,
      status: row.status,
      progress_percentage: row.progress_percentage,
      narrative_content: row.narrative_content,
      definition_of_done_status: row.definition_of_done_status,
      submitted_at: row.submitted_at,
      reviewed_by: row.reviewed_by,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      template: {
        id: row.section_template_id,
        pack_template_id: '',
        code: row.template_code,
        name: row.template_name,
        guidance_text: row.guidance_text,
        order_index: row.order_index,
        regulatory_reference: row.regulatory_reference,
        definition_of_done: row.definition_of_done || [],
        evidence_requirements: row.evidence_requirements || []
      }
    }));
  } finally {
    client.release();
  }
}

export async function getPackSection(sectionId: string): Promise<(PackSection & { template: SectionTemplate }) | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ps.*,
             st.code as template_code, st.name as template_name,
             st.guidance_text, st.order_index, st.regulatory_reference,
             st.definition_of_done, st.evidence_requirements
      FROM pack_sections ps
      JOIN section_templates st ON ps.section_template_id = st.id
      WHERE ps.id = $1
    `, [sectionId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      pack_id: row.pack_id,
      section_template_id: row.section_template_id,
      status: row.status,
      progress_percentage: row.progress_percentage,
      narrative_content: row.narrative_content,
      definition_of_done_status: row.definition_of_done_status,
      submitted_at: row.submitted_at,
      reviewed_by: row.reviewed_by,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      template: {
        id: row.section_template_id,
        pack_template_id: '',
        code: row.template_code,
        name: row.template_name,
        guidance_text: row.guidance_text,
        order_index: row.order_index,
        regulatory_reference: row.regulatory_reference,
        definition_of_done: row.definition_of_done || [],
        evidence_requirements: row.evidence_requirements || []
      }
    };
  } finally {
    client.release();
  }
}

export async function updatePackSection(
  sectionId: string,
  updates: Partial<Pick<PackSection, 'status' | 'progress_percentage' | 'narrative_content' | 'definition_of_done_status' | 'submitted_at' | 'reviewed_by' | 'approved_by' | 'approved_at'>>
): Promise<PackSection | null> {
  const client = await pool.connect();
  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.progress_percentage !== undefined) { setClauses.push(`progress_percentage = $${idx++}`); values.push(updates.progress_percentage); }
    if (updates.narrative_content !== undefined) { setClauses.push(`narrative_content = $${idx++}`); values.push(JSON.stringify(updates.narrative_content)); }
    if (updates.definition_of_done_status !== undefined) { setClauses.push(`definition_of_done_status = $${idx++}`); values.push(JSON.stringify(updates.definition_of_done_status)); }
    if (updates.submitted_at !== undefined) { setClauses.push(`submitted_at = $${idx++}`); values.push(updates.submitted_at); }
    if (updates.reviewed_by !== undefined) { setClauses.push(`reviewed_by = $${idx++}`); values.push(updates.reviewed_by); }
    if (updates.approved_by !== undefined) { setClauses.push(`approved_by = $${idx++}`); values.push(updates.approved_by); }
    if (updates.approved_at !== undefined) { setClauses.push(`approved_at = $${idx++}`); values.push(updates.approved_at); }

    values.push(sectionId);

    const result = await client.query(`
      UPDATE pack_sections
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Project Milestones CRUD
export async function createProjectMilestone(data: {
  pack_id: string;
  title: string;
  description?: string;
  due_date?: Date;
  dependencies?: string[];
  linked_module?: string;
  linked_item_id?: string;
  order_index: number;
}): Promise<ProjectMilestone> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO project_milestones
      (pack_id, title, description, due_date, dependencies, linked_module, linked_item_id, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.pack_id,
      data.title,
      data.description,
      data.due_date,
      JSON.stringify(data.dependencies || []),
      data.linked_module,
      data.linked_item_id,
      data.order_index
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getProjectMilestones(packId: string): Promise<ProjectMilestone[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM project_milestones
      WHERE pack_id = $1
      ORDER BY order_index
    `, [packId]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateProjectMilestone(
  milestoneId: string,
  updates: Partial<Pick<ProjectMilestone, 'title' | 'description' | 'status' | 'due_date' | 'completed_at' | 'dependencies'>>
): Promise<ProjectMilestone | null> {
  const client = await pool.connect();
  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(updates.title); }
    if (updates.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(updates.description); }
    if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.due_date !== undefined) { setClauses.push(`due_date = $${idx++}`); values.push(updates.due_date); }
    if (updates.completed_at !== undefined) { setClauses.push(`completed_at = $${idx++}`); values.push(updates.completed_at); }
    if (updates.dependencies !== undefined) { setClauses.push(`dependencies = $${idx++}`); values.push(JSON.stringify(updates.dependencies)); }

    values.push(milestoneId);

    const result = await client.query(`
      UPDATE project_milestones
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Project Documents CRUD (Cloud Storage)
export async function createProjectDocument(data: {
  pack_id: string;
  milestone_id?: string;
  section_code?: string;
  name: string;
  description?: string;
  storage_key?: string;
  file_size_bytes?: number;
  mime_type?: string;
  checksum?: string;
  uploaded_by?: string;
}): Promise<ProjectDocument> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO project_documents
      (pack_id, milestone_id, section_code, name, description, storage_key, file_size_bytes, mime_type, checksum, uploaded_by, uploaded_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `, [
      data.pack_id,
      data.milestone_id,
      data.section_code,
      data.name,
      data.description,
      data.storage_key,
      data.file_size_bytes,
      data.mime_type,
      data.checksum,
      data.uploaded_by
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getProjectDocuments(packId: string): Promise<ProjectDocument[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM project_documents
      WHERE pack_id = $1
      ORDER BY created_at DESC
    `, [packId]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getProjectDocument(documentId: string): Promise<ProjectDocument | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM project_documents WHERE id = $1
    `, [documentId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function updateProjectDocument(
  documentId: string,
  updates: Partial<Pick<ProjectDocument, 'name' | 'description' | 'status' | 'reviewed_by' | 'reviewed_at' | 'signed_by' | 'signed_at'>>
): Promise<ProjectDocument | null> {
  const client = await pool.connect();
  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(updates.name); }
    if (updates.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(updates.description); }
    if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.reviewed_by !== undefined) { setClauses.push(`reviewed_by = $${idx++}`); values.push(updates.reviewed_by); }
    if (updates.reviewed_at !== undefined) { setClauses.push(`reviewed_at = $${idx++}`); values.push(updates.reviewed_at); }
    if (updates.signed_by !== undefined) { setClauses.push(`signed_by = $${idx++}`); values.push(updates.signed_by); }
    if (updates.signed_at !== undefined) { setClauses.push(`signed_at = $${idx++}`); values.push(updates.signed_at); }

    values.push(documentId);

    const result = await client.query(`
      UPDATE project_documents
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteProjectDocument(documentId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM project_documents WHERE id = $1
    `, [documentId]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// Document Comments CRUD
export async function createDocumentComment(data: {
  document_id: string;
  author_id: string;
  author_name?: string;
  content: string;
}): Promise<DocumentComment> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO document_comments (document_id, author_id, author_name, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.document_id, data.author_id, data.author_name, data.content]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getDocumentComments(documentId: string): Promise<DocumentComment[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM document_comments
      WHERE document_id = $1
      ORDER BY created_at ASC
    `, [documentId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Pack Tasks CRUD
export async function createPackTask(data: {
  pack_id: string;
  pack_section_id?: string;
  milestone_id?: string;
  title: string;
  description?: string;
  task_type: string;
  priority?: string;
  assigned_to?: string;
  assigned_name?: string;
  due_date?: Date;
}): Promise<PackTask> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO pack_tasks
      (pack_id, pack_section_id, milestone_id, title, description, task_type, priority, assigned_to, assigned_name, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.pack_id,
      data.pack_section_id,
      data.milestone_id,
      data.title,
      data.description,
      data.task_type,
      data.priority || 'medium',
      data.assigned_to,
      data.assigned_name,
      data.due_date
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getPackTasks(packId: string): Promise<PackTask[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM pack_tasks
      WHERE pack_id = $1
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        due_date ASC NULLS LAST
    `, [packId]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updatePackTask(
  taskId: string,
  updates: Partial<Pick<PackTask, 'title' | 'description' | 'status' | 'priority' | 'assigned_to' | 'assigned_name' | 'due_date' | 'completed_at'>>
): Promise<PackTask | null> {
  const client = await pool.connect();
  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(updates.title); }
    if (updates.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(updates.description); }
    if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.priority !== undefined) { setClauses.push(`priority = $${idx++}`); values.push(updates.priority); }
    if (updates.assigned_to !== undefined) { setClauses.push(`assigned_to = $${idx++}`); values.push(updates.assigned_to); }
    if (updates.assigned_name !== undefined) { setClauses.push(`assigned_name = $${idx++}`); values.push(updates.assigned_name); }
    if (updates.due_date !== undefined) { setClauses.push(`due_date = $${idx++}`); values.push(updates.due_date); }
    if (updates.completed_at !== undefined) { setClauses.push(`completed_at = $${idx++}`); values.push(updates.completed_at); }

    values.push(taskId);

    const result = await client.query(`
      UPDATE pack_tasks
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Pack Review Comments CRUD
export async function createPackReviewComment(data: {
  pack_section_id: string;
  author_id: string;
  author_role: string;
  comment_type: string;
  content: string;
}): Promise<PackReviewComment> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO pack_review_comments
      (pack_section_id, author_id, author_role, comment_type, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [data.pack_section_id, data.author_id, data.author_role, data.comment_type, data.content]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getPackReviewComments(sectionId: string): Promise<PackReviewComment[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM pack_review_comments
      WHERE pack_section_id = $1
      ORDER BY created_at ASC
    `, [sectionId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Seed Pack Templates function
export async function seedPackTemplates(force: boolean = false): Promise<void> {
  const client = await pool.connect();
  try {
    // Check if templates already exist with valid codes
    const existing = await client.query(`SELECT COUNT(*) FROM pack_templates WHERE code IS NOT NULL`);
    if (!force && parseInt(existing.rows[0].count) > 0) {
      return;
    }

    // If force or templates have null codes, clear and re-seed
    // Drop and recreate with correct schema
    await client.query(`DROP TABLE IF EXISTS section_templates CASCADE`);
    await client.query(`DROP TABLE IF EXISTS pack_templates CASCADE`);

    // Recreate pack_templates with correct schema
    await client.query(`
      CREATE TABLE pack_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        pack_type VARCHAR(100) NOT NULL,
        typical_timeline_weeks INTEGER DEFAULT 12,
        policy_templates JSONB DEFAULT '[]'::jsonb,
        training_requirements JSONB DEFAULT '[]'::jsonb,
        smcr_roles JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Recreate section_templates
    await client.query(`
      CREATE TABLE section_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_template_id UUID REFERENCES pack_templates(id) ON DELETE CASCADE,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        guidance_text TEXT,
        order_index INTEGER NOT NULL,
        regulatory_reference VARCHAR(500),
        definition_of_done JSONB DEFAULT '[]'::jsonb,
        evidence_requirements JSONB DEFAULT '[]'::jsonb,
        UNIQUE(pack_template_id, code)
      )
    `);

    // Create the pack types
    const packTypes = [
      {
        code: 'payments-emi',
        name: 'Payment Services / E-Money Institution',
        description: 'FCA authorization pack for firms seeking payment services or e-money institution authorization under PSD2/EMD2.',
        pack_type: 'payments',
        typical_timeline_weeks: 16,
        policy_templates: [
          'aml-policy',
          'safeguarding-policy',
          'complaints-policy',
          'financial-promotions',
          'operational-resilience',
          'consumer-duty'
        ],
        training_requirements: [
          'aml-training',
          'consumer-duty-training',
          'payments-regulation',
          'operational-resilience'
        ],
        smcr_roles: ['SMF16', 'SMF17', 'SMF29']
      },
      {
        code: 'investment-services',
        name: 'Investment Services Authorization',
        description: 'FCA authorization pack for firms seeking MiFID investment permissions including dealing, advising, and managing.',
        pack_type: 'investments',
        typical_timeline_weeks: 20,
        policy_templates: [
          'aml-policy',
          'conflicts-of-interest',
          'best-execution',
          'suitability',
          'financial-promotions',
          'consumer-duty',
          'complaints-policy'
        ],
        training_requirements: [
          'aml-training',
          'consumer-duty-training',
          'mifid-training',
          'investment-advice',
          'financial-promotions'
        ],
        smcr_roles: ['SMF3', 'SMF16', 'SMF17', 'SMF24']
      },
      {
        code: 'consumer-credit',
        name: 'Consumer Credit Authorization',
        description: 'FCA authorization pack for firms seeking consumer credit permissions including lending, broking, and debt activities.',
        pack_type: 'credit',
        typical_timeline_weeks: 14,
        policy_templates: [
          'aml-policy',
          'responsible-lending',
          'arrears-management',
          'complaints-policy',
          'consumer-duty'
        ],
        training_requirements: [
          'aml-training',
          'consumer-duty-training',
          'consumer-credit-training',
          'vulnerable-customers'
        ],
        smcr_roles: ['SMF16', 'SMF17']
      },
      {
        code: 'insurance-distribution',
        name: 'Insurance Distribution Authorization',
        description: 'FCA authorization pack for insurance intermediaries under the IDD/PROD framework.',
        pack_type: 'insurance',
        typical_timeline_weeks: 14,
        policy_templates: [
          'aml-policy',
          'prod-policy',
          'complaints-policy',
          'consumer-duty',
          'financial-promotions'
        ],
        training_requirements: [
          'aml-training',
          'consumer-duty-training',
          'insurance-conduct',
          'financial-promotions'
        ],
        smcr_roles: ['SMF16', 'SMF17']
      },
      {
        code: 'crypto-registration',
        name: 'Cryptoasset Registration',
        description: 'FCA cryptoasset registration pack with enhanced financial crime and risk governance.',
        pack_type: 'crypto',
        typical_timeline_weeks: 18,
        policy_templates: [
          'aml-policy',
          'risk-assessment',
          'financial-promotions',
          'operational-resilience'
        ],
        training_requirements: [
          'aml-training',
          'sanctions-training',
          'cryptoasset-risk'
        ],
        smcr_roles: ['SMF16', 'SMF17']
      }
    ];

    for (const pt of packTypes) {
      const result = await client.query(`
        INSERT INTO pack_templates (code, name, description, pack_type, typical_timeline_weeks, policy_templates, training_requirements, smcr_roles)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          pack_type = EXCLUDED.pack_type,
          typical_timeline_weeks = EXCLUDED.typical_timeline_weeks,
          policy_templates = EXCLUDED.policy_templates,
          training_requirements = EXCLUDED.training_requirements,
          smcr_roles = EXCLUDED.smcr_roles
        RETURNING id
      `, [
        pt.code,
        pt.name,
        pt.description,
        pt.pack_type,
        pt.typical_timeline_weeks,
        JSON.stringify(pt.policy_templates),
        JSON.stringify(pt.training_requirements),
        JSON.stringify(pt.smcr_roles)
      ]);

      const templateId = result.rows[0].id;

      // Create the 27 gold-standard sections for each template
      const sections = [
        { code: 'executive-summary', name: 'Executive Summary', order_index: 1, regulatory_reference: 'FCA Application Form Section A' },
        { code: 'business-model', name: 'Business Model & Market Analysis', order_index: 2, regulatory_reference: 'SUP 6.3' },
        { code: 'regulatory-permissions', name: 'Regulatory Permissions & Operational Scope', order_index: 3, regulatory_reference: 'SUP 6.4' },
        { code: 'corporate-structure', name: 'Corporate Structure & Governance', order_index: 4, regulatory_reference: 'SYSC 4.3' },
        { code: 'technology-infrastructure', name: 'Technology Infrastructure & Operational Resilience', order_index: 5, regulatory_reference: 'SYSC 15A' },
        { code: 'operational-risk', name: 'Operational Risk Framework & Controls', order_index: 6, regulatory_reference: 'SYSC 7' },
        { code: 'customer-lifecycle', name: 'Customer Lifecycle Management', order_index: 7, regulatory_reference: 'BCOBS / CONC' },
        { code: 'product-architecture', name: 'Product Architecture & Fund Flow Management', order_index: 8, regulatory_reference: 'Payment Services Regulations' },
        { code: 'client-asset-protection', name: 'Client Asset Protection (Principle 10)', order_index: 9, regulatory_reference: 'CASS' },
        { code: 'financial-projections', name: 'Financial Projections & Business Economics', order_index: 10, regulatory_reference: 'IPRU-INV / MIPRU' },
        { code: 'wind-down-planning', name: 'Wind-Down Planning & Resolution Strategy', order_index: 11, regulatory_reference: 'WDPG' },
        { code: 'aml-ctf', name: 'AML/CTF Framework', order_index: 12, regulatory_reference: 'MLR 2017' },
        { code: 'regulatory-reporting', name: 'Regulatory Reporting & Supervisory Engagement', order_index: 13, regulatory_reference: 'SUP 16' },
        { code: 'data-quality', name: 'Data Quality & Validation', order_index: 14, regulatory_reference: 'SYSC 3.2' },
        { code: 'consumer-duty', name: 'Consumer Duty Implementation', order_index: 15, regulatory_reference: 'PRIN 2A' },
        { code: 'compliance-monitoring', name: 'Compliance Monitoring Programme', order_index: 16, regulatory_reference: 'SYSC 6.1' },
        { code: 'threshold-conditions', name: 'Threshold Conditions & Ongoing Compliance', order_index: 17, regulatory_reference: 'COND 2' },
        { code: 'app-fraud', name: 'APP Fraud Prevention & Reimbursement', order_index: 18, regulatory_reference: 'PSR 2017' },
        { code: 'management-information', name: 'Management Information & Board Reporting', order_index: 19, regulatory_reference: 'SYSC 4.1' },
        { code: 'change-management', name: 'Change Management & Horizon Scanning', order_index: 20, regulatory_reference: 'SYSC 3.1' },
        { code: 'third-party-risk', name: 'Third-Party Risk Management', order_index: 21, regulatory_reference: 'SYSC 8' },
        { code: 'cyber-security', name: 'Cyber Security Incident Response', order_index: 22, regulatory_reference: 'SYSC 13' },
        { code: 'sensitive-data', name: 'Sensitive Payment Data Management', order_index: 23, regulatory_reference: 'PCI-DSS' },
        { code: 'security-policy', name: 'Security Policy & Risk Assessment', order_index: 24, regulatory_reference: 'SYSC 13' },
        { code: 'vulnerability-management', name: 'Vulnerability Management Programme', order_index: 25, regulatory_reference: 'SYSC 13' },
        { code: 'flow-of-funds', name: 'Flow of Funds', order_index: 26, regulatory_reference: 'CASS 7' },
        { code: 'schedule-2', name: 'Schedule 2 Compliance Mapping + Supporting Documents', order_index: 27, regulatory_reference: 'EMR 2011' }
      ];

      for (const section of sections) {
        await client.query(`
          INSERT INTO section_templates (pack_template_id, code, name, order_index, regulatory_reference)
          VALUES ($1, $2, $3, $4, $5)
        `, [templateId, section.code, section.name, section.order_index, section.regulatory_reference]);
      }
    }

    logger.info('Pack templates seeded successfully');
  } finally {
    client.release();
  }
}

// ============================================
// PEP Register Types and Functions
// ============================================

export interface PEPRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  pep_type: 'customer' | 'beneficial_owner' | 'director' | 'shareholder';
  full_name: string;
  date_of_birth?: Date;
  nationality?: string;
  position_held?: string;
  pep_category: 'pep' | 'rca' | 'family_member';
  relationship_type?: string;
  risk_rating: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'archived' | 'under_review';
  identification_date: Date;
  last_review_date?: Date;
  next_review_date?: Date;
  edd_completed: boolean;
  edd_completed_date?: Date;
  source_of_wealth?: string;
  source_of_funds?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getPEPRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<PEPRecord[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT * FROM pep_records
      WHERE organization_id = $1
    `;
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ` AND pack_id = $2`;
      params.push(packId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPEPRecord(id: string): Promise<PEPRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM pep_records WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createPEPRecord(data: Omit<PEPRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PEPRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO pep_records (
        organization_id, pack_id, pep_type, full_name, date_of_birth,
        nationality, position_held, pep_category, relationship_type,
        risk_rating, status, identification_date, last_review_date,
        next_review_date, edd_completed, edd_completed_date,
        source_of_wealth, source_of_funds, approval_status,
        approved_by, approved_at, notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING *
    `, [
      data.organization_id,
      data.pack_id || null,
      data.pep_type,
      data.full_name,
      data.date_of_birth || null,
      data.nationality || null,
      data.position_held || null,
      data.pep_category,
      data.relationship_type || null,
      data.risk_rating,
      data.status,
      data.identification_date,
      data.last_review_date || null,
      data.next_review_date || null,
      data.edd_completed,
      data.edd_completed_date || null,
      data.source_of_wealth || null,
      data.source_of_funds || null,
      data.approval_status,
      data.approved_by || null,
      data.approved_at || null,
      data.notes || null,
      data.created_by || null,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updatePEPRecord(
  id: string,
  data: Partial<Omit<PEPRecord, 'id' | 'created_at'>>
): Promise<PEPRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const allowedFields = [
      'pep_type', 'full_name', 'date_of_birth', 'nationality',
      'position_held', 'pep_category', 'relationship_type',
      'risk_rating', 'status', 'identification_date',
      'last_review_date', 'next_review_date', 'edd_completed',
      'edd_completed_date', 'source_of_wealth', 'source_of_funds',
      'approval_status', 'approved_by', 'approved_at', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE pep_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deletePEPRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM pep_records WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// ============================================
// Third-Party Register Types and Functions
// ============================================

export interface ThirdPartyRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  vendor_name: string;
  vendor_type: string;
  service_description?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  is_outsourcing: boolean;
  is_material_outsourcing: boolean;
  regulatory_notification_required: boolean;
  contract_start_date?: Date;
  contract_end_date?: Date;
  contract_value_gbp?: number;
  risk_rating: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending' | 'terminated' | 'under_review';
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  due_diligence_completed: boolean;
  due_diligence_date?: Date;
  last_review_date?: Date;
  next_review_date?: Date;
  exit_strategy_documented: boolean;
  data_processing_agreement: boolean;
  sub_outsourcing_permitted: boolean;
  geographic_location?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getThirdPartyRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<ThirdPartyRecord[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT * FROM third_party_records
      WHERE organization_id = $1
    `;
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ` AND pack_id = $2`;
      params.push(packId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getThirdPartyRecord(id: string): Promise<ThirdPartyRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM third_party_records WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createThirdPartyRecord(
  data: Omit<ThirdPartyRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<ThirdPartyRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO third_party_records (
        organization_id, pack_id, vendor_name, vendor_type,
        service_description, criticality, is_outsourcing,
        is_material_outsourcing, regulatory_notification_required,
        contract_start_date, contract_end_date, contract_value_gbp,
        risk_rating, status, primary_contact_name, primary_contact_email,
        primary_contact_phone, due_diligence_completed, due_diligence_date,
        last_review_date, next_review_date, exit_strategy_documented,
        data_processing_agreement, sub_outsourcing_permitted,
        geographic_location, approval_status, approved_by, approved_at,
        notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      )
      RETURNING *
    `, [
      data.organization_id,
      data.pack_id || null,
      data.vendor_name,
      data.vendor_type,
      data.service_description || null,
      data.criticality,
      data.is_outsourcing,
      data.is_material_outsourcing,
      data.regulatory_notification_required,
      data.contract_start_date || null,
      data.contract_end_date || null,
      data.contract_value_gbp || null,
      data.risk_rating,
      data.status,
      data.primary_contact_name || null,
      data.primary_contact_email || null,
      data.primary_contact_phone || null,
      data.due_diligence_completed,
      data.due_diligence_date || null,
      data.last_review_date || null,
      data.next_review_date || null,
      data.exit_strategy_documented,
      data.data_processing_agreement,
      data.sub_outsourcing_permitted,
      data.geographic_location || null,
      data.approval_status,
      data.approved_by || null,
      data.approved_at || null,
      data.notes || null,
      data.created_by || null,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateThirdPartyRecord(
  id: string,
  data: Partial<Omit<ThirdPartyRecord, 'id' | 'created_at'>>
): Promise<ThirdPartyRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const allowedFields = [
      'vendor_name', 'vendor_type', 'service_description', 'criticality',
      'is_outsourcing', 'is_material_outsourcing', 'regulatory_notification_required',
      'contract_start_date', 'contract_end_date', 'contract_value_gbp',
      'risk_rating', 'status', 'primary_contact_name', 'primary_contact_email',
      'primary_contact_phone', 'due_diligence_completed', 'due_diligence_date',
      'last_review_date', 'next_review_date', 'exit_strategy_documented',
      'data_processing_agreement', 'sub_outsourcing_permitted',
      'geographic_location', 'approval_status', 'approved_by', 'approved_at', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE third_party_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteThirdPartyRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM third_party_records WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// ============================================
// Complaints Register Types and Functions
// ============================================

export type ComplaintStatus = 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated' | 'referred_to_fos';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ComplaintRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  complaint_reference?: string;
  complainant_name: string;
  complainant_email?: string;
  complainant_phone?: string;
  complainant_address?: string;
  complaint_type: 'product' | 'service' | 'staff_conduct' | 'fees' | 'advice' | 'delay' | 'communication' | 'other';
  complaint_category: 'upheld' | 'partially_upheld' | 'rejected' | 'pending';
  description?: string;
  received_date: Date;
  acknowledged_date?: Date;
  resolution_deadline?: Date;
  resolved_date?: Date;
  root_cause?: string;
  remedial_action?: string;
  resolution?: string;
  compensation_amount?: number;
  fos_referred: boolean;
  fos_outcome?: string;
  status: ComplaintStatus;
  assigned_to?: string;
  priority: ComplaintPriority;
  notes?: string;
  product_type?: string;
  policy_reference?: string;
  contact_method?: 'phone' | 'email' | 'letter' | 'online' | 'in_person';
  four_week_letter_sent: boolean;
  eight_week_letter_sent: boolean;
  final_response_sent: boolean;
  final_response_date?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export type LetterTemplateType =
  | 'acknowledgement'
  | 'forward_third_party'
  | 'four_week_holding'
  | 'eight_week_holding'
  | 'complaint_upheld'
  | 'complaint_rejected'
  | 'general_contact';

export interface ComplaintLetter {
  id: string;
  complaint_id: string;
  template_type: LetterTemplateType;
  letter_reference?: string;
  generated_content?: string;
  template_variables?: Record<string, unknown>;
  status: 'draft' | 'ready' | 'sent' | 'delivered';
  generated_at: Date;
  sent_at?: Date;
  sent_via?: 'email' | 'post' | 'both';
  generated_by?: string;
  created_at: Date;
}

export type ActivityType =
  | 'complaint_created'
  | 'status_change'
  | 'letter_generated'
  | 'letter_sent'
  | 'note_added'
  | 'assigned'
  | 'priority_change'
  | 'fos_referred'
  | 'resolved'
  | 'closed';

export interface ComplaintActivity {
  id: string;
  complaint_id: string;
  activity_type: ActivityType;
  description: string;
  old_value?: string;
  new_value?: string;
  metadata?: Record<string, unknown>;
  performed_by?: string;
  created_at: Date;
}

export async function getComplaintRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<ComplaintRecord[]> {
  const client = await pool.connect();
  try {
    let query = `SELECT * FROM complaints_records WHERE organization_id = $1`;
    const params: (string | undefined)[] = [organizationId];
    if (packId) {
      query += ` AND pack_id = $2`;
      params.push(packId);
    }
    query += ` ORDER BY received_date DESC`;
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getComplaintRecord(id: string): Promise<ComplaintRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM complaints_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createComplaintRecord(
  data: Omit<ComplaintRecord, 'id' | 'created_at' | 'updated_at' | 'complaint_reference'>
): Promise<ComplaintRecord> {
  const client = await pool.connect();
  try {
    // Generate reference number
    const countResult = await client.query(
      `SELECT COUNT(*) FROM complaints_records WHERE organization_id = $1`,
      [data.organization_id]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const complaint_reference = `COMP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const result = await client.query(`
      INSERT INTO complaints_records (
        organization_id, pack_id, complaint_reference, complainant_name,
        complaint_type, complaint_category, received_date, acknowledged_date,
        resolution_deadline, resolved_date, root_cause, remedial_action,
        compensation_amount, fos_referred, fos_outcome, status, assigned_to,
        priority, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      data.organization_id,
      data.pack_id || null,
      complaint_reference,
      data.complainant_name,
      data.complaint_type,
      data.complaint_category,
      data.received_date,
      data.acknowledged_date || null,
      data.resolution_deadline || null,
      data.resolved_date || null,
      data.root_cause || null,
      data.remedial_action || null,
      data.compensation_amount || null,
      data.fos_referred,
      data.fos_outcome || null,
      data.status,
      data.assigned_to || null,
      data.priority,
      data.notes || null,
      data.created_by || null,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateComplaintRecord(
  id: string,
  data: Partial<Omit<ComplaintRecord, 'id' | 'created_at' | 'complaint_reference'>>
): Promise<ComplaintRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const allowedFields = [
      'complainant_name', 'complaint_type', 'complaint_category',
      'received_date', 'acknowledged_date', 'resolution_deadline',
      'resolved_date', 'root_cause', 'remedial_action', 'compensation_amount',
      'fos_referred', 'fos_outcome', 'status', 'assigned_to', 'priority', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE complaints_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteComplaintRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`DELETE FROM complaints_records WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// ============================================
// Complaint Letters Functions
// ============================================

export async function getComplaintLetters(complaintId: string): Promise<ComplaintLetter[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM complaint_letters WHERE complaint_id = $1 ORDER BY created_at DESC`,
      [complaintId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getComplaintLetter(id: string): Promise<ComplaintLetter | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM complaint_letters WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createComplaintLetter(
  data: Omit<ComplaintLetter, 'id' | 'created_at' | 'generated_at' | 'letter_reference'>
): Promise<ComplaintLetter> {
  const client = await pool.connect();
  try {
    // Generate letter reference
    const countResult = await client.query(
      `SELECT COUNT(*) FROM complaint_letters`
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const letter_reference = `LTR-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const result = await client.query(
      `INSERT INTO complaint_letters (
        complaint_id, template_type, letter_reference, generated_content,
        template_variables, status, sent_at, sent_via, generated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.complaint_id,
        data.template_type,
        letter_reference,
        data.generated_content,
        JSON.stringify(data.template_variables || {}),
        data.status || 'draft',
        data.sent_at,
        data.sent_via,
        data.generated_by
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateComplaintLetter(
  id: string,
  data: Partial<Omit<ComplaintLetter, 'id' | 'created_at' | 'complaint_id'>>
): Promise<ComplaintLetter | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.sent_at !== undefined) {
      fields.push(`sent_at = $${paramCount++}`);
      values.push(data.sent_at);
    }
    if (data.sent_via !== undefined) {
      fields.push(`sent_via = $${paramCount++}`);
      values.push(data.sent_via);
    }
    if (data.generated_content !== undefined) {
      fields.push(`generated_content = $${paramCount++}`);
      values.push(data.generated_content);
    }

    if (fields.length === 0) return null;
    values.push(id);

    const result = await client.query(
      `UPDATE complaint_letters SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteComplaintLetter(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`DELETE FROM complaint_letters WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// ============================================
// Complaint Activities Functions
// ============================================

export async function getComplaintActivities(complaintId: string): Promise<ComplaintActivity[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM complaint_activities WHERE complaint_id = $1 ORDER BY created_at DESC`,
      [complaintId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createComplaintActivity(
  data: Omit<ComplaintActivity, 'id' | 'created_at'>
): Promise<ComplaintActivity> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO complaint_activities (
        complaint_id, activity_type, description, old_value, new_value, metadata, performed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.complaint_id,
        data.activity_type,
        data.description,
        data.old_value,
        data.new_value,
        JSON.stringify(data.metadata || {}),
        data.performed_by
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getComplaintWithDetails(id: string): Promise<{
  complaint: ComplaintRecord | null;
  letters: ComplaintLetter[];
  activities: ComplaintActivity[];
}> {
  const client = await pool.connect();
  try {
    const [complaintResult, lettersResult, activitiesResult] = await Promise.all([
      client.query(`SELECT * FROM complaints_records WHERE id = $1`, [id]),
      client.query(`SELECT * FROM complaint_letters WHERE complaint_id = $1 ORDER BY created_at DESC`, [id]),
      client.query(`SELECT * FROM complaint_activities WHERE complaint_id = $1 ORDER BY created_at DESC`, [id])
    ]);
    return {
      complaint: complaintResult.rows[0] || null,
      letters: lettersResult.rows,
      activities: activitiesResult.rows
    };
  } finally {
    client.release();
  }
}

// ============================================
// Incident Register Types and Functions
// ============================================

export interface IncidentRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  incident_reference?: string;
  incident_title: string;
  incident_type: 'operational' | 'security' | 'data_breach' | 'system_failure' | 'fraud' | 'compliance' | 'human_error' | 'third_party' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_date: Date;
  occurred_date?: Date;
  reported_date?: Date;
  resolved_date?: Date;
  description?: string;
  root_cause?: string;
  impact_assessment?: string;
  immediate_actions?: string;
  remedial_actions?: string;
  lessons_learned?: string;
  regulatory_notification_required: boolean;
  regulatory_notification_date?: Date;
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed';
  assigned_to?: string;
  affected_systems?: string;
  affected_customers_count: number;
  financial_impact?: number;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getIncidentRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<IncidentRecord[]> {
  const client = await pool.connect();
  try {
    let query = `SELECT * FROM incident_records WHERE organization_id = $1`;
    const params: (string | undefined)[] = [organizationId];
    if (packId) {
      query += ` AND pack_id = $2`;
      params.push(packId);
    }
    query += ` ORDER BY detected_date DESC`;
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getIncidentRecord(id: string): Promise<IncidentRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM incident_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createIncidentRecord(
  data: Omit<IncidentRecord, 'id' | 'created_at' | 'updated_at' | 'incident_reference'>
): Promise<IncidentRecord> {
  const client = await pool.connect();
  try {
    // Generate reference number
    const countResult = await client.query(
      `SELECT COUNT(*) FROM incident_records WHERE organization_id = $1`,
      [data.organization_id]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const incident_reference = `INC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const result = await client.query(`
      INSERT INTO incident_records (
        organization_id, pack_id, incident_reference, incident_title,
        incident_type, severity, detected_date, occurred_date, reported_date,
        resolved_date, description, root_cause, impact_assessment,
        immediate_actions, remedial_actions, lessons_learned,
        regulatory_notification_required, regulatory_notification_date,
        status, assigned_to, affected_systems, affected_customers_count,
        financial_impact, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `, [
      data.organization_id,
      data.pack_id || null,
      incident_reference,
      data.incident_title,
      data.incident_type,
      data.severity,
      data.detected_date,
      data.occurred_date || null,
      data.reported_date || null,
      data.resolved_date || null,
      data.description || null,
      data.root_cause || null,
      data.impact_assessment || null,
      data.immediate_actions || null,
      data.remedial_actions || null,
      data.lessons_learned || null,
      data.regulatory_notification_required,
      data.regulatory_notification_date || null,
      data.status,
      data.assigned_to || null,
      data.affected_systems || null,
      data.affected_customers_count,
      data.financial_impact || null,
      data.notes || null,
      data.created_by || null,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateIncidentRecord(
  id: string,
  data: Partial<Omit<IncidentRecord, 'id' | 'created_at' | 'incident_reference'>>
): Promise<IncidentRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const allowedFields = [
      'incident_title', 'incident_type', 'severity', 'detected_date',
      'occurred_date', 'reported_date', 'resolved_date', 'description',
      'root_cause', 'impact_assessment', 'immediate_actions', 'remedial_actions',
      'lessons_learned', 'regulatory_notification_required',
      'regulatory_notification_date', 'status', 'assigned_to',
      'affected_systems', 'affected_customers_count', 'financial_impact', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE incident_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteIncidentRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`DELETE FROM incident_records WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// ============================================
// Conflicts of Interest Register Types and Functions
// ============================================

export interface COIRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  declarant_name: string;
  declarant_role?: string;
  declaration_date: Date;
  conflict_type: 'personal_interest' | 'family_relationship' | 'outside_employment' | 'financial_interest' | 'gift_hospitality' | 'board_membership' | 'shareholder' | 'other';
  description: string;
  parties_involved?: string;
  potential_impact?: string;
  mitigation_measures?: string;
  review_frequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly' | 'ad_hoc';
  last_review_date?: Date;
  next_review_date?: Date;
  risk_rating: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'mitigated' | 'resolved' | 'archived';
  approved_by?: string;
  approved_at?: Date;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getCOIRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<COIRecord[]> {
  const client = await pool.connect();
  try {
    let query = `SELECT * FROM coi_records WHERE organization_id = $1`;
    const params: (string | undefined)[] = [organizationId];
    if (packId) {
      query += ` AND pack_id = $2`;
      params.push(packId);
    }
    query += ` ORDER BY declaration_date DESC`;
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getCOIRecord(id: string): Promise<COIRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM coi_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createCOIRecord(
  data: Omit<COIRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<COIRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO coi_records (
        organization_id, pack_id, declarant_name, declarant_role,
        declaration_date, conflict_type, description, parties_involved,
        potential_impact, mitigation_measures, review_frequency,
        last_review_date, next_review_date, risk_rating, status,
        approved_by, approved_at, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      data.organization_id,
      data.pack_id || null,
      data.declarant_name,
      data.declarant_role || null,
      data.declaration_date,
      data.conflict_type,
      data.description,
      data.parties_involved || null,
      data.potential_impact || null,
      data.mitigation_measures || null,
      data.review_frequency,
      data.last_review_date || null,
      data.next_review_date || null,
      data.risk_rating,
      data.status,
      data.approved_by || null,
      data.approved_at || null,
      data.notes || null,
      data.created_by || null,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateCOIRecord(
  id: string,
  data: Partial<Omit<COIRecord, 'id' | 'created_at'>>
): Promise<COIRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const allowedFields = [
      'declarant_name', 'declarant_role', 'declaration_date', 'conflict_type',
      'description', 'parties_involved', 'potential_impact', 'mitigation_measures',
      'review_frequency', 'last_review_date', 'next_review_date', 'risk_rating',
      'status', 'approved_by', 'approved_at', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE coi_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteCOIRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`DELETE FROM coi_records WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// ============================================
// Gifts & Hospitality Register Types and Functions
// ============================================

export interface GiftHospitalityRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  entry_type: 'gift_received' | 'gift_given' | 'hospitality_received' | 'hospitality_given';
  date_of_event: Date;
  recipient_name?: string;
  recipient_organization?: string;
  provider_name?: string;
  provider_organization?: string;
  description: string;
  estimated_value_gbp?: number;
  business_justification?: string;
  approval_required: boolean;
  approval_status: 'not_required' | 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  declined: boolean;
  declined_reason?: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getGiftHospitalityRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<GiftHospitalityRecord[]> {
  const client = await pool.connect();
  try {
    let query = `SELECT * FROM gifts_hospitality_records WHERE organization_id = $1`;
    const params: (string | undefined)[] = [organizationId];
    if (packId) {
      query += ` AND pack_id = $2`;
      params.push(packId);
    }
    query += ` ORDER BY date_of_event DESC`;
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getGiftHospitalityRecord(id: string): Promise<GiftHospitalityRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM gifts_hospitality_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createGiftHospitalityRecord(
  data: Omit<GiftHospitalityRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<GiftHospitalityRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO gifts_hospitality_records (
        organization_id, pack_id, entry_type, date_of_event,
        recipient_name, recipient_organization, provider_name,
        provider_organization, description, estimated_value_gbp,
        business_justification, approval_required, approval_status,
        approved_by, approved_at, declined, declined_reason, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      data.organization_id,
      data.pack_id || null,
      data.entry_type,
      data.date_of_event,
      data.recipient_name || null,
      data.recipient_organization || null,
      data.provider_name || null,
      data.provider_organization || null,
      data.description,
      data.estimated_value_gbp || null,
      data.business_justification || null,
      data.approval_required,
      data.approval_status,
      data.approved_by || null,
      data.approved_at || null,
      data.declined,
      data.declined_reason || null,
      data.notes || null,
      data.created_by || null,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateGiftHospitalityRecord(
  id: string,
  data: Partial<Omit<GiftHospitalityRecord, 'id' | 'created_at'>>
): Promise<GiftHospitalityRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const allowedFields = [
      'entry_type', 'date_of_event', 'recipient_name', 'recipient_organization',
      'provider_name', 'provider_organization', 'description', 'estimated_value_gbp',
      'business_justification', 'approval_required', 'approval_status',
      'approved_by', 'approved_at', 'declined', 'declined_reason', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE gifts_hospitality_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteGiftHospitalityRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`DELETE FROM gifts_hospitality_records WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}
