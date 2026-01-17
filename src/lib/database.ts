import { Pool } from 'pg';
import { logger, logError, logDbOperation } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL;
const allowMissingDatabase =
  process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.VITEST === '1';

const missingDatabaseError = () => new Error('DATABASE_URL environment variable is required');

const createUnavailablePool = (): Pool => {
  const fail = async () => {
    throw missingDatabaseError();
  };
  return {
    connect: fail,
    query: fail,
    end: async () => undefined,
    on: () => undefined,
  } as unknown as Pool;
};

if (!connectionString && !allowMissingDatabase) {
  throw missingDatabaseError();
}

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : createUnavailablePool();

// Add pool error handling
if (connectionString) {
  pool.on('error', (err) => {
    logError(err, 'Unexpected database pool error');
  });

  pool.on('connect', () => {
    logger.debug('New database connection established');
  });
}

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

    // ============================================
    // REGISTER HUB TABLES
    // ============================================

    // Register definitions - master list of all available registers
    await client.query(`
      CREATE TABLE IF NOT EXISTS register_definitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        category VARCHAR(50) NOT NULL,
        icon_key VARCHAR(100) DEFAULT 'clipboard',
        href VARCHAR(255),
        regulatory_references JSONB DEFAULT '[]',
        use_cases TEXT[],
        related_training TEXT[],
        related_policies TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        is_implemented BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_register_def_code ON register_definitions (code)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_register_def_category ON register_definitions (category)
    `);

    // Register recommendations - maps registers to firm types
    await client.query(`
      CREATE TABLE IF NOT EXISTS register_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        register_code VARCHAR(100) NOT NULL,
        firm_type VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        rationale TEXT,
        regulatory_basis TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(register_code, firm_type)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_register_rec_code ON register_recommendations (register_code)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_register_rec_firm ON register_recommendations (firm_type)
    `);

    // Organization register subscriptions - tracks enabled registers per org
    await client.query(`
      CREATE TABLE IF NOT EXISTS register_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL,
        register_code VARCHAR(100) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        enabled_at TIMESTAMP DEFAULT NOW(),
        enabled_by VARCHAR(255),
        configuration JSONB DEFAULT '{}',
        UNIQUE(organization_id, register_code)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_register_sub_org ON register_subscriptions (organization_id)
    `);

    // Organization settings - stores firm type and preferences
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) UNIQUE NOT NULL,
        firm_type VARCHAR(100),
        additional_permissions TEXT[],
        register_hub_preferences JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add wizard_completed columns to organization_settings
    await client.query(`
      ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS wizard_completed BOOLEAN DEFAULT FALSE;
      ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS wizard_completed_at TIMESTAMP;
      ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);

    // Add setup_completed columns to register_subscriptions
    await client.query(`
      ALTER TABLE register_subscriptions ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;
      ALTER TABLE register_subscriptions ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP;
    `);

    // Vulnerable Customers Log
    await client.query(`
      CREATE TABLE IF NOT EXISTS vulnerable_customers_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        customer_reference VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        vulnerability_type VARCHAR(100) NOT NULL,
        vulnerability_details TEXT,
        identified_date TIMESTAMP DEFAULT NOW(),
        identified_by VARCHAR(255),
        risk_level VARCHAR(50) DEFAULT 'medium',
        support_measures TEXT,
        review_frequency VARCHAR(50) DEFAULT 'quarterly',
        next_review_date TIMESTAMP,
        last_review_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        outcome_notes TEXT,
        closed_date TIMESTAMP,
        closed_by VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_vulnerable_customers_org ON vulnerable_customers_records (organization_id)
    `);

    // Regulatory Breach Log
    await client.query(`
      CREATE TABLE IF NOT EXISTS regulatory_breach_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        breach_reference VARCHAR(255) NOT NULL,
        breach_title VARCHAR(500) NOT NULL,
        breach_type VARCHAR(100) NOT NULL,
        regulatory_rule VARCHAR(255),
        regulator VARCHAR(100),
        identified_date TIMESTAMP DEFAULT NOW(),
        identified_by VARCHAR(255),
        breach_description TEXT NOT NULL,
        root_cause TEXT,
        impact_assessment TEXT,
        customers_affected INTEGER DEFAULT 0,
        financial_impact DECIMAL(15, 2),
        severity VARCHAR(50) DEFAULT 'medium',
        reported_to_regulator BOOLEAN DEFAULT FALSE,
        report_date TIMESTAMP,
        regulator_reference VARCHAR(255),
        remediation_plan TEXT,
        remediation_deadline TIMESTAMP,
        remediation_status VARCHAR(50) DEFAULT 'pending',
        lessons_learned TEXT,
        status VARCHAR(50) DEFAULT 'open',
        closed_date TIMESTAMP,
        closed_by VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_regulatory_breach_org ON regulatory_breach_records (organization_id)
    `);

    // Sanctions Screening Log
    await client.query(`
      CREATE TABLE IF NOT EXISTS sanctions_screening_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        screening_reference VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_name VARCHAR(500) NOT NULL,
        entity_dob DATE,
        entity_country VARCHAR(100),
        screening_date TIMESTAMP DEFAULT NOW(),
        screened_by VARCHAR(255),
        screening_type VARCHAR(100) NOT NULL,
        lists_checked TEXT[],
        match_found BOOLEAN DEFAULT FALSE,
        match_details TEXT,
        match_score DECIMAL(5, 2),
        false_positive BOOLEAN DEFAULT FALSE,
        false_positive_reason TEXT,
        escalated BOOLEAN DEFAULT FALSE,
        escalated_to VARCHAR(255),
        escalated_date TIMESTAMP,
        decision VARCHAR(50) DEFAULT 'pending',
        decision_by VARCHAR(255),
        decision_date TIMESTAMP,
        decision_rationale TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sanctions_screening_org ON sanctions_screening_records (organization_id)
    `);

    // Financial Promotions Tracker
    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_prom_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        promotion_reference VARCHAR(255) NOT NULL,
        promotion_title VARCHAR(500) NOT NULL,
        promotion_type VARCHAR(100) NOT NULL,
        channel VARCHAR(100) NOT NULL,
        target_audience VARCHAR(255),
        product_service VARCHAR(255),
        content_summary TEXT,
        created_date TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255),
        approved_by VARCHAR(255),
        approval_date TIMESTAMP,
        approval_status VARCHAR(50) DEFAULT 'draft',
        compliance_reviewer VARCHAR(255),
        compliance_review_date TIMESTAMP,
        compliance_notes TEXT,
        version_number INTEGER DEFAULT 1,
        live_date TIMESTAMP,
        expiry_date TIMESTAMP,
        withdrawn_date TIMESTAMP,
        withdrawal_reason TEXT,
        risk_rating VARCHAR(50) DEFAULT 'medium',
        regulatory_requirements TEXT[],
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_fin_prom_org ON fin_prom_records (organization_id)
    `);

    // AML CDD Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS aml_cdd_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        customer_reference VARCHAR(255) NOT NULL,
        customer_name VARCHAR(500) NOT NULL,
        customer_type VARCHAR(50) NOT NULL,
        onboarding_date TIMESTAMP,
        cdd_level VARCHAR(50) NOT NULL DEFAULT 'standard',
        risk_rating VARCHAR(50) DEFAULT 'medium',
        id_verification_status VARCHAR(50) DEFAULT 'pending',
        id_verification_date TIMESTAMP,
        id_verification_method VARCHAR(100),
        poa_verification_status VARCHAR(50) DEFAULT 'pending',
        poa_verification_date TIMESTAMP,
        source_of_funds VARCHAR(255),
        source_of_wealth VARCHAR(255),
        beneficial_owners TEXT,
        pep_check_status VARCHAR(50) DEFAULT 'pending',
        pep_check_date TIMESTAMP,
        sanctions_check_status VARCHAR(50) DEFAULT 'pending',
        sanctions_check_date TIMESTAMP,
        adverse_media_status VARCHAR(50) DEFAULT 'pending',
        adverse_media_date TIMESTAMP,
        next_review_date TIMESTAMP,
        last_review_date TIMESTAMP,
        reviewer VARCHAR(255),
        overall_status VARCHAR(50) DEFAULT 'in_progress',
        approval_status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approval_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_aml_cdd_org ON aml_cdd_records (organization_id)
    `);

    // EDD Cases Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS edd_cases_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        case_reference VARCHAR(255) NOT NULL,
        customer_reference VARCHAR(255) NOT NULL,
        customer_name VARCHAR(500) NOT NULL,
        edd_trigger VARCHAR(100) NOT NULL,
        trigger_description TEXT,
        trigger_date TIMESTAMP DEFAULT NOW(),
        risk_factors TEXT[],
        enhanced_measures TEXT[],
        source_of_wealth_verified BOOLEAN DEFAULT FALSE,
        source_of_funds_verified BOOLEAN DEFAULT FALSE,
        ongoing_monitoring_level VARCHAR(50) DEFAULT 'enhanced',
        senior_management_approval BOOLEAN DEFAULT FALSE,
        approved_by VARCHAR(255),
        approval_date TIMESTAMP,
        approval_rationale TEXT,
        next_review_date TIMESTAMP,
        last_review_date TIMESTAMP,
        review_frequency VARCHAR(50) DEFAULT 'quarterly',
        status VARCHAR(50) DEFAULT 'open',
        decision VARCHAR(50) DEFAULT 'pending',
        decision_rationale TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_edd_cases_org ON edd_cases_records (organization_id)
    `);

    // SAR-NCA Reports Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS sar_nca_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        sar_reference VARCHAR(255) NOT NULL,
        internal_reference VARCHAR(255),
        subject_name VARCHAR(500) NOT NULL,
        subject_type VARCHAR(50) NOT NULL,
        suspicion_type VARCHAR(100) NOT NULL,
        suspicion_description TEXT,
        discovery_date TIMESTAMP,
        reporter VARCHAR(255),
        mlro_review_date TIMESTAMP,
        mlro_decision VARCHAR(50) DEFAULT 'pending',
        mlro_rationale TEXT,
        submitted_to_nca BOOLEAN DEFAULT FALSE,
        nca_submission_date TIMESTAMP,
        nca_reference VARCHAR(255),
        consent_required BOOLEAN DEFAULT FALSE,
        consent_requested_date TIMESTAMP,
        consent_received BOOLEAN DEFAULT FALSE,
        consent_received_date TIMESTAMP,
        consent_expiry_date TIMESTAMP,
        daml_requested BOOLEAN DEFAULT FALSE,
        daml_reference VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        outcome VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sar_nca_org ON sar_nca_records (organization_id)
    `);

    // TX Monitoring Alerts Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS tx_monitoring_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        alert_reference VARCHAR(255) NOT NULL,
        alert_date TIMESTAMP DEFAULT NOW(),
        rule_name VARCHAR(255),
        rule_id VARCHAR(100),
        customer_reference VARCHAR(255),
        customer_name VARCHAR(500),
        alert_type VARCHAR(100) NOT NULL,
        alert_severity VARCHAR(50) DEFAULT 'medium',
        transaction_ids TEXT[],
        transaction_amount DECIMAL(15, 2),
        transaction_currency VARCHAR(10),
        alert_description TEXT,
        assigned_to VARCHAR(255),
        assigned_date TIMESTAMP,
        investigation_notes TEXT,
        investigation_outcome VARCHAR(100),
        escalated BOOLEAN DEFAULT FALSE,
        escalated_to VARCHAR(255),
        escalated_date TIMESTAMP,
        sar_raised BOOLEAN DEFAULT FALSE,
        sar_reference VARCHAR(255),
        status VARCHAR(50) DEFAULT 'open',
        closed_date TIMESTAMP,
        closed_by VARCHAR(255),
        false_positive BOOLEAN DEFAULT FALSE,
        false_positive_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tx_monitoring_org ON tx_monitoring_records (organization_id)
    `);

    // PA Dealing Log Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS pa_dealing_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        request_reference VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        employee_id VARCHAR(100),
        request_type VARCHAR(50) NOT NULL,
        instrument_type VARCHAR(100),
        instrument_name VARCHAR(255),
        isin VARCHAR(50),
        quantity INTEGER,
        estimated_value DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'GBP',
        broker_account VARCHAR(255),
        reason_for_trade TEXT,
        request_date TIMESTAMP DEFAULT NOW(),
        pre_clearance_status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approval_date TIMESTAMP,
        approval_conditions TEXT,
        execution_date TIMESTAMP,
        execution_price DECIMAL(15, 2),
        holding_period_end TIMESTAMP,
        restricted_list_check BOOLEAN DEFAULT FALSE,
        conflict_check BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pa_dealing_org ON pa_dealing_records (organization_id)
    `);

    // Insider List Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS insider_list_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        list_reference VARCHAR(255) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        project_code VARCHAR(100),
        issuer_name VARCHAR(255),
        nature_of_information TEXT,
        insider_name VARCHAR(255) NOT NULL,
        insider_role VARCHAR(255),
        insider_company VARCHAR(255),
        insider_email VARCHAR(255),
        insider_phone VARCHAR(100),
        insider_national_id VARCHAR(100),
        date_added TIMESTAMP DEFAULT NOW(),
        time_obtained TIMESTAMP,
        date_removed TIMESTAMP,
        reason_for_removal TEXT,
        acknowledgement_received BOOLEAN DEFAULT FALSE,
        acknowledgement_date TIMESTAMP,
        list_status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_insider_list_org ON insider_list_records (organization_id)
    `);

    // Outside Business Interests Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS outside_business_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        declaration_reference VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        employee_id VARCHAR(100),
        employee_role VARCHAR(255),
        interest_type VARCHAR(100) NOT NULL,
        organization_name VARCHAR(255) NOT NULL,
        organization_type VARCHAR(100),
        role_held VARCHAR(255),
        remuneration BOOLEAN DEFAULT FALSE,
        remuneration_amount DECIMAL(15, 2),
        time_commitment VARCHAR(100),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        conflict_assessment TEXT,
        conflict_identified BOOLEAN DEFAULT FALSE,
        mitigation_measures TEXT,
        approval_status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approval_date TIMESTAMP,
        next_review_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_outside_business_org ON outside_business_records (organization_id)
    `);

    // Data Breach & DSAR Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_breach_dsar_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        record_reference VARCHAR(255) NOT NULL,
        record_type VARCHAR(50) NOT NULL,
        discovery_date TIMESTAMP DEFAULT NOW(),
        incident_date TIMESTAMP,
        reported_by VARCHAR(255),
        data_subjects_affected INTEGER,
        data_categories TEXT[],
        breach_description TEXT,
        cause_of_breach VARCHAR(100),
        containment_actions TEXT,
        ico_notification_required BOOLEAN DEFAULT FALSE,
        ico_notified BOOLEAN DEFAULT FALSE,
        ico_notification_date TIMESTAMP,
        ico_reference VARCHAR(255),
        individuals_notified BOOLEAN DEFAULT FALSE,
        notification_date TIMESTAMP,
        dsar_requester_name VARCHAR(255),
        dsar_requester_email VARCHAR(255),
        dsar_request_date TIMESTAMP,
        dsar_verification_status VARCHAR(50),
        dsar_deadline TIMESTAMP,
        dsar_response_date TIMESTAMP,
        dsar_extension_applied BOOLEAN DEFAULT FALSE,
        risk_assessment TEXT,
        root_cause_analysis TEXT,
        remediation_actions TEXT,
        status VARCHAR(50) DEFAULT 'open',
        closed_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_data_breach_dsar_org ON data_breach_dsar_records (organization_id)
    `);

    // Operational Resilience Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS op_resilience_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        service_reference VARCHAR(255) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        service_description TEXT,
        service_owner VARCHAR(255),
        is_important_business_service BOOLEAN DEFAULT FALSE,
        impact_tolerance_defined BOOLEAN DEFAULT FALSE,
        impact_tolerance_description TEXT,
        max_tolerable_disruption VARCHAR(100),
        dependencies TEXT[],
        third_party_dependencies TEXT[],
        last_scenario_test_date TIMESTAMP,
        scenario_test_result VARCHAR(50),
        scenario_test_findings TEXT,
        vulnerabilities_identified TEXT,
        remediation_plan TEXT,
        remediation_deadline TIMESTAMP,
        remediation_status VARCHAR(50) DEFAULT 'pending',
        next_review_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_op_resilience_org ON op_resilience_records (organization_id)
    `);

    // T&C Record Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS tc_record_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        employee_reference VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        employee_role VARCHAR(255),
        department VARCHAR(255),
        start_date TIMESTAMP,
        tc_scheme VARCHAR(100),
        qualification_required VARCHAR(255),
        qualification_status VARCHAR(50) DEFAULT 'in_progress',
        qualification_date TIMESTAMP,
        exam_attempts INTEGER DEFAULT 0,
        competency_status VARCHAR(50) DEFAULT 'not_assessed',
        competency_date TIMESTAMP,
        supervisor_name VARCHAR(255),
        supervision_level VARCHAR(50) DEFAULT 'standard',
        supervision_end_date TIMESTAMP,
        cpd_hours_required INTEGER DEFAULT 0,
        cpd_hours_completed INTEGER DEFAULT 0,
        cpd_deadline TIMESTAMP,
        annual_attestation_date TIMESTAMP,
        fit_proper_status VARCHAR(50) DEFAULT 'pending',
        fit_proper_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tc_record_org ON tc_record_records (organization_id)
    `);

    // SM&CR Certification Tracker Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_certification_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        employee_reference VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        certification_function VARCHAR(255) NOT NULL,
        function_code VARCHAR(50),
        department VARCHAR(255),
        start_date TIMESTAMP,
        annual_assessment_due TIMESTAMP,
        last_assessment_date TIMESTAMP,
        assessment_outcome VARCHAR(50),
        fit_proper_confirmed BOOLEAN DEFAULT FALSE,
        conduct_rules_training BOOLEAN DEFAULT FALSE,
        conduct_rules_date TIMESTAMP,
        regulatory_references_checked BOOLEAN DEFAULT FALSE,
        criminal_records_checked BOOLEAN DEFAULT FALSE,
        credit_checked BOOLEAN DEFAULT FALSE,
        certification_status VARCHAR(50) DEFAULT 'pending',
        certified_by VARCHAR(255),
        certification_date TIMESTAMP,
        certification_expiry TIMESTAMP,
        conduct_breaches INTEGER DEFAULT 0,
        last_breach_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_smcr_certification_org ON smcr_certification_records (organization_id)
    `);

    // Regulatory Returns Calendar Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS regulatory_returns_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        return_reference VARCHAR(255) NOT NULL,
        return_name VARCHAR(255) NOT NULL,
        regulator VARCHAR(100) NOT NULL,
        return_type VARCHAR(100),
        frequency VARCHAR(50),
        reporting_period_start TIMESTAMP,
        reporting_period_end TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        reminder_date TIMESTAMP,
        owner VARCHAR(255),
        preparer VARCHAR(255),
        reviewer VARCHAR(255),
        preparation_status VARCHAR(50) DEFAULT 'not_started',
        review_status VARCHAR(50) DEFAULT 'pending',
        submission_status VARCHAR(50) DEFAULT 'pending',
        submitted_date TIMESTAMP,
        submitted_by VARCHAR(255),
        confirmation_reference VARCHAR(255),
        late_submission BOOLEAN DEFAULT FALSE,
        late_reason TEXT,
        status VARCHAR(50) DEFAULT 'upcoming',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_regulatory_returns_org ON regulatory_returns_records (organization_id)
    `);

    // Product Governance Register
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_governance_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL DEFAULT 'default-org',
        pack_id UUID REFERENCES authorization_packs(id) ON DELETE SET NULL,
        product_reference VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_type VARCHAR(100),
        manufacturer VARCHAR(255),
        is_manufacturer BOOLEAN DEFAULT FALSE,
        target_market TEXT,
        negative_target_market TEXT,
        distribution_strategy VARCHAR(100),
        risk_profile VARCHAR(50) DEFAULT 'medium',
        fair_value_assessment TEXT,
        fair_value_confirmed BOOLEAN DEFAULT FALSE,
        fair_value_date TIMESTAMP,
        customer_outcomes TEXT,
        product_testing_completed BOOLEAN DEFAULT FALSE,
        testing_date TIMESTAMP,
        testing_results TEXT,
        approval_status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approval_date TIMESTAMP,
        launch_date TIMESTAMP,
        last_review_date TIMESTAMP,
        next_review_date TIMESTAMP,
        review_frequency VARCHAR(50) DEFAULT 'annual',
        issues_identified TEXT,
        remediation_actions TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_governance_org ON product_governance_records (organization_id)
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

// ============================================
// REGISTER HUB FUNCTIONS
// ============================================

export interface RegisterDefinitionRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category: string;
  icon_key: string;
  href: string | null;
  regulatory_references: string[];
  use_cases: string[];
  related_training: string[];
  related_policies: string[];
  is_active: boolean;
  is_implemented: boolean;
  sort_order: number;
  created_at: Date;
}

export interface RegisterRecommendationRecord {
  id: string;
  register_code: string;
  firm_type: string;
  level: string;
  rationale: string | null;
  regulatory_basis: string | null;
  created_at: Date;
}

export interface RegisterSubscriptionRecord {
  id: string;
  organization_id: string;
  register_code: string;
  enabled: boolean;
  enabled_at: Date;
  enabled_by: string | null;
  configuration: Record<string, unknown>;
  setup_completed: boolean;
  setup_completed_at: Date | null;
}

export interface OrganizationSettingsRecord {
  id: string;
  organization_id: string;
  firm_type: string | null;
  additional_permissions: string[] | null;
  register_hub_preferences: Record<string, unknown>;
  wizard_completed: boolean;
  wizard_completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Get all register definitions
export async function getRegisterDefinitions(): Promise<RegisterDefinitionRecord[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM register_definitions WHERE is_active = true ORDER BY sort_order, name`
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Get single register definition by code
export async function getRegisterDefinition(code: string): Promise<RegisterDefinitionRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM register_definitions WHERE code = $1`,
      [code]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Upsert register definition (for seeding)
export async function upsertRegisterDefinition(data: Omit<RegisterDefinitionRecord, 'id' | 'created_at'>): Promise<RegisterDefinitionRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO register_definitions (
        code, name, description, short_description, category, icon_key, href,
        regulatory_references, use_cases, related_training, related_policies,
        is_active, is_implemented, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description,
        category = EXCLUDED.category,
        icon_key = EXCLUDED.icon_key,
        href = EXCLUDED.href,
        regulatory_references = EXCLUDED.regulatory_references,
        use_cases = EXCLUDED.use_cases,
        related_training = EXCLUDED.related_training,
        related_policies = EXCLUDED.related_policies,
        is_active = EXCLUDED.is_active,
        is_implemented = EXCLUDED.is_implemented,
        sort_order = EXCLUDED.sort_order
      RETURNING *`,
      [
        data.code, data.name, data.description, data.short_description,
        data.category, data.icon_key, data.href,
        JSON.stringify(data.regulatory_references), data.use_cases,
        data.related_training, data.related_policies,
        data.is_active, data.is_implemented, data.sort_order
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get recommendations for a firm type
export async function getRegisterRecommendations(firmType?: string): Promise<RegisterRecommendationRecord[]> {
  const client = await pool.connect();
  try {
    if (firmType) {
      const result = await client.query(
        `SELECT * FROM register_recommendations WHERE firm_type = $1 OR firm_type = 'all' ORDER BY level`,
        [firmType]
      );
      return result.rows;
    }
    const result = await client.query(
      `SELECT * FROM register_recommendations ORDER BY firm_type, level`
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Upsert register recommendation (for seeding)
export async function upsertRegisterRecommendation(
  data: Omit<RegisterRecommendationRecord, 'id' | 'created_at'>
): Promise<RegisterRecommendationRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO register_recommendations (register_code, firm_type, level, rationale, regulatory_basis)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (register_code, firm_type) DO UPDATE SET
         level = EXCLUDED.level,
         rationale = EXCLUDED.rationale,
         regulatory_basis = EXCLUDED.regulatory_basis
       RETURNING *`,
      [data.register_code, data.firm_type, data.level, data.rationale, data.regulatory_basis || null]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get organization's register subscriptions
export async function getRegisterSubscriptions(organizationId: string): Promise<RegisterSubscriptionRecord[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM register_subscriptions WHERE organization_id = $1 ORDER BY enabled_at`,
      [organizationId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Enable/disable a register for an organization
export async function setRegisterSubscription(
  organizationId: string,
  registerCode: string,
  enabled: boolean,
  enabledBy?: string
): Promise<RegisterSubscriptionRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO register_subscriptions (organization_id, register_code, enabled, enabled_by, enabled_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (organization_id, register_code) DO UPDATE SET
         enabled = EXCLUDED.enabled,
         enabled_by = EXCLUDED.enabled_by,
         enabled_at = NOW()
       RETURNING *`,
      [organizationId, registerCode, enabled, enabledBy || null]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get organization settings
export async function getOrganizationSettings(organizationId: string): Promise<OrganizationSettingsRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM organization_settings WHERE organization_id = $1`,
      [organizationId]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Update organization settings (including firm type)
export async function updateOrganizationSettings(
  organizationId: string,
  data: Partial<Omit<OrganizationSettingsRecord, 'id' | 'organization_id' | 'updated_at' | 'created_at'>>
): Promise<OrganizationSettingsRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO organization_settings (organization_id, firm_type, additional_permissions, register_hub_preferences, wizard_completed, wizard_completed_at, updated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (organization_id) DO UPDATE SET
         firm_type = COALESCE(EXCLUDED.firm_type, organization_settings.firm_type),
         additional_permissions = COALESCE(EXCLUDED.additional_permissions, organization_settings.additional_permissions),
         register_hub_preferences = COALESCE(EXCLUDED.register_hub_preferences, organization_settings.register_hub_preferences),
         wizard_completed = COALESCE(EXCLUDED.wizard_completed, organization_settings.wizard_completed),
         wizard_completed_at = CASE WHEN EXCLUDED.wizard_completed = TRUE AND organization_settings.wizard_completed = FALSE
                                    THEN NOW()
                                    ELSE COALESCE(EXCLUDED.wizard_completed_at, organization_settings.wizard_completed_at) END,
         updated_at = NOW()
       RETURNING *`,
      [
        organizationId,
        data.firm_type || null,
        data.additional_permissions || null,
        data.register_hub_preferences ? JSON.stringify(data.register_hub_preferences) : '{}',
        data.wizard_completed ?? false,
        data.wizard_completed_at || null
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Complete wizard setup - marks wizard as completed and enables selected registers
export async function completeWizardSetup(
  organizationId: string,
  firmType: string,
  selectedRegisterCodes: string[],
  enabledBy?: string
): Promise<{ settings: OrganizationSettingsRecord; subscriptions: RegisterSubscriptionRecord[] }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update organization settings with wizard completion
    const settingsResult = await client.query(
      `INSERT INTO organization_settings (organization_id, firm_type, wizard_completed, wizard_completed_at, updated_at, created_at)
       VALUES ($1, $2, TRUE, NOW(), NOW(), NOW())
       ON CONFLICT (organization_id) DO UPDATE SET
         firm_type = $2,
         wizard_completed = TRUE,
         wizard_completed_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [organizationId, firmType]
    );

    // Enable selected registers
    const subscriptions: RegisterSubscriptionRecord[] = [];
    for (const code of selectedRegisterCodes) {
      const subResult = await client.query(
        `INSERT INTO register_subscriptions (organization_id, register_code, enabled, enabled_at, enabled_by, setup_completed, setup_completed_at)
         VALUES ($1, $2, TRUE, NOW(), $3, TRUE, NOW())
         ON CONFLICT (organization_id, register_code) DO UPDATE SET
           enabled = TRUE,
           enabled_at = NOW(),
           enabled_by = $3,
           setup_completed = TRUE,
           setup_completed_at = NOW()
         RETURNING *`,
        [organizationId, code, enabledBy || null]
      );
      subscriptions.push(subResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      settings: settingsResult.rows[0],
      subscriptions
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Seed all register definitions from the definitions file
export async function seedRegisterDefinitions(): Promise<void> {
  const { REGISTER_DEFINITIONS } = await import('@/lib/register-hub/definitions');

  for (const def of REGISTER_DEFINITIONS) {
    await upsertRegisterDefinition({
      code: def.code,
      name: def.name,
      description: def.description,
      short_description: def.shortDescription,
      category: def.category,
      icon_key: def.iconKey,
      href: def.href,
      regulatory_references: def.regulatoryReferences,
      use_cases: def.useCases,
      related_training: def.relatedTraining,
      related_policies: def.relatedPolicies,
      is_active: def.isActive,
      is_implemented: def.isImplemented,
      sort_order: def.sortOrder,
    });
  }
}

// Seed all register recommendations
export async function seedRegisterRecommendations(): Promise<void> {
  const { REGISTER_RECOMMENDATIONS } = await import('@/lib/register-hub/recommendations');

  for (const rec of REGISTER_RECOMMENDATIONS) {
    await upsertRegisterRecommendation({
      register_code: rec.registerCode,
      firm_type: rec.firmType,
      level: rec.level,
      rationale: rec.rationale,
      regulatory_basis: rec.regulatoryBasis || null,
    });
  }
}

// ============================================================================
// VULNERABLE CUSTOMERS REGISTER
// ============================================================================

export interface VulnerableCustomerRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  customer_reference: string;
  customer_name?: string;
  vulnerability_type: string;
  vulnerability_details?: string;
  identified_date: Date;
  identified_by?: string;
  risk_level: string;
  support_measures?: string;
  review_frequency: string;
  next_review_date?: Date;
  last_review_date?: Date;
  status: string;
  outcome_notes?: string;
  closed_date?: Date;
  closed_by?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getVulnerableCustomerRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<VulnerableCustomerRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM vulnerable_customers_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ' AND pack_id = $2';
      params.push(packId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getVulnerableCustomerRecord(id: string): Promise<VulnerableCustomerRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM vulnerable_customers_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createVulnerableCustomerRecord(
  data: Omit<VulnerableCustomerRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<VulnerableCustomerRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO vulnerable_customers_records (
        organization_id, pack_id, customer_reference, customer_name, vulnerability_type,
        vulnerability_details, identified_date, identified_by, risk_level, support_measures,
        review_frequency, next_review_date, last_review_date, status, outcome_notes,
        closed_date, closed_by, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        data.organization_id || 'default-org',
        data.pack_id,
        data.customer_reference,
        data.customer_name,
        data.vulnerability_type,
        data.vulnerability_details,
        data.identified_date || new Date(),
        data.identified_by,
        data.risk_level || 'medium',
        data.support_measures,
        data.review_frequency || 'quarterly',
        data.next_review_date,
        data.last_review_date,
        data.status || 'active',
        data.outcome_notes,
        data.closed_date,
        data.closed_by,
        data.notes,
        data.created_by,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateVulnerableCustomerRecord(
  id: string,
  data: Partial<VulnerableCustomerRecord>
): Promise<VulnerableCustomerRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'customer_reference', 'customer_name', 'vulnerability_type', 'vulnerability_details',
      'identified_date', 'identified_by', 'risk_level', 'support_measures', 'review_frequency',
      'next_review_date', 'last_review_date', 'status', 'outcome_notes', 'closed_date',
      'closed_by', 'notes'
    ];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE vulnerable_customers_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteVulnerableCustomerRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM vulnerable_customers_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ============================================================================
// REGULATORY BREACH REGISTER
// ============================================================================

export interface RegulatoryBreachRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  breach_reference: string;
  breach_title: string;
  breach_type: string;
  regulatory_rule?: string;
  regulator?: string;
  identified_date: Date;
  identified_by?: string;
  breach_description: string;
  root_cause?: string;
  impact_assessment?: string;
  customers_affected: number;
  financial_impact?: number;
  severity: string;
  reported_to_regulator: boolean;
  report_date?: Date;
  regulator_reference?: string;
  remediation_plan?: string;
  remediation_deadline?: Date;
  remediation_status: string;
  lessons_learned?: string;
  status: string;
  closed_date?: Date;
  closed_by?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getRegulatoryBreachRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<RegulatoryBreachRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM regulatory_breach_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ' AND pack_id = $2';
      params.push(packId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getRegulatoryBreachRecord(id: string): Promise<RegulatoryBreachRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM regulatory_breach_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createRegulatoryBreachRecord(
  data: Omit<RegulatoryBreachRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<RegulatoryBreachRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO regulatory_breach_records (
        organization_id, pack_id, breach_reference, breach_title, breach_type, regulatory_rule,
        regulator, identified_date, identified_by, breach_description, root_cause, impact_assessment,
        customers_affected, financial_impact, severity, reported_to_regulator, report_date,
        regulator_reference, remediation_plan, remediation_deadline, remediation_status,
        lessons_learned, status, closed_date, closed_by, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *`,
      [
        data.organization_id || 'default-org',
        data.pack_id,
        data.breach_reference,
        data.breach_title,
        data.breach_type,
        data.regulatory_rule,
        data.regulator,
        data.identified_date || new Date(),
        data.identified_by,
        data.breach_description,
        data.root_cause,
        data.impact_assessment,
        data.customers_affected || 0,
        data.financial_impact,
        data.severity || 'medium',
        data.reported_to_regulator || false,
        data.report_date,
        data.regulator_reference,
        data.remediation_plan,
        data.remediation_deadline,
        data.remediation_status || 'pending',
        data.lessons_learned,
        data.status || 'open',
        data.closed_date,
        data.closed_by,
        data.notes,
        data.created_by,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateRegulatoryBreachRecord(
  id: string,
  data: Partial<RegulatoryBreachRecord>
): Promise<RegulatoryBreachRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'breach_reference', 'breach_title', 'breach_type', 'regulatory_rule', 'regulator',
      'identified_date', 'identified_by', 'breach_description', 'root_cause', 'impact_assessment',
      'customers_affected', 'financial_impact', 'severity', 'reported_to_regulator', 'report_date',
      'regulator_reference', 'remediation_plan', 'remediation_deadline', 'remediation_status',
      'lessons_learned', 'status', 'closed_date', 'closed_by', 'notes'
    ];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE regulatory_breach_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteRegulatoryBreachRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM regulatory_breach_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ============================================================================
// SANCTIONS SCREENING REGISTER
// ============================================================================

export interface SanctionsScreeningRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  screening_reference: string;
  entity_type: string;
  entity_name: string;
  entity_dob?: Date;
  entity_country?: string;
  screening_date: Date;
  screened_by?: string;
  screening_type: string;
  lists_checked?: string[];
  match_found: boolean;
  match_details?: string;
  match_score?: number;
  false_positive: boolean;
  false_positive_reason?: string;
  escalated: boolean;
  escalated_to?: string;
  escalated_date?: Date;
  decision: string;
  decision_by?: string;
  decision_date?: Date;
  decision_rationale?: string;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getSanctionsScreeningRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<SanctionsScreeningRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM sanctions_screening_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ' AND pack_id = $2';
      params.push(packId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createSanctionsScreeningRecord(
  data: Omit<SanctionsScreeningRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<SanctionsScreeningRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO sanctions_screening_records (
        organization_id, pack_id, screening_reference, entity_type, entity_name, entity_dob,
        entity_country, screening_date, screened_by, screening_type, lists_checked, match_found,
        match_details, match_score, false_positive, false_positive_reason, escalated, escalated_to,
        escalated_date, decision, decision_by, decision_date, decision_rationale, status, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *`,
      [
        data.organization_id || 'default-org',
        data.pack_id,
        data.screening_reference,
        data.entity_type,
        data.entity_name,
        data.entity_dob,
        data.entity_country,
        data.screening_date || new Date(),
        data.screened_by,
        data.screening_type,
        data.lists_checked,
        data.match_found || false,
        data.match_details,
        data.match_score,
        data.false_positive || false,
        data.false_positive_reason,
        data.escalated || false,
        data.escalated_to,
        data.escalated_date,
        data.decision || 'pending',
        data.decision_by,
        data.decision_date,
        data.decision_rationale,
        data.status || 'pending',
        data.notes,
        data.created_by,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateSanctionsScreeningRecord(
  id: string,
  data: Partial<SanctionsScreeningRecord>
): Promise<SanctionsScreeningRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'screening_reference', 'entity_type', 'entity_name', 'entity_dob', 'entity_country',
      'screening_date', 'screened_by', 'screening_type', 'lists_checked', 'match_found',
      'match_details', 'match_score', 'false_positive', 'false_positive_reason', 'escalated',
      'escalated_to', 'escalated_date', 'decision', 'decision_by', 'decision_date',
      'decision_rationale', 'status', 'notes'
    ];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE sanctions_screening_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteSanctionsScreeningRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM sanctions_screening_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ============================================================================
// FINANCIAL PROMOTIONS REGISTER
// ============================================================================

export interface FinPromRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  promotion_reference: string;
  promotion_title: string;
  promotion_type: string;
  channel: string;
  target_audience?: string;
  product_service?: string;
  content_summary?: string;
  created_date: Date;
  created_by?: string;
  approved_by?: string;
  approval_date?: Date;
  approval_status: string;
  compliance_reviewer?: string;
  compliance_review_date?: Date;
  compliance_notes?: string;
  version_number: number;
  live_date?: Date;
  expiry_date?: Date;
  withdrawn_date?: Date;
  withdrawal_reason?: string;
  risk_rating: string;
  regulatory_requirements?: string[];
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getFinPromRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<FinPromRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM fin_prom_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ' AND pack_id = $2';
      params.push(packId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getFinPromRecord(id: string): Promise<FinPromRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM fin_prom_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createFinPromRecord(
  data: Omit<FinPromRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<FinPromRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO fin_prom_records (
        organization_id, pack_id, promotion_reference, promotion_title, promotion_type, channel,
        target_audience, product_service, content_summary, created_date, created_by, approved_by,
        approval_date, approval_status, compliance_reviewer, compliance_review_date, compliance_notes,
        version_number, live_date, expiry_date, withdrawn_date, withdrawal_reason, risk_rating,
        regulatory_requirements, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *`,
      [
        data.organization_id || 'default-org',
        data.pack_id,
        data.promotion_reference,
        data.promotion_title,
        data.promotion_type,
        data.channel,
        data.target_audience,
        data.product_service,
        data.content_summary,
        data.created_date || new Date(),
        data.created_by,
        data.approved_by,
        data.approval_date,
        data.approval_status || 'draft',
        data.compliance_reviewer,
        data.compliance_review_date,
        data.compliance_notes,
        data.version_number || 1,
        data.live_date,
        data.expiry_date,
        data.withdrawn_date,
        data.withdrawal_reason,
        data.risk_rating || 'medium',
        data.regulatory_requirements,
        data.status || 'draft',
        data.notes,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateFinPromRecord(
  id: string,
  data: Partial<FinPromRecord>
): Promise<FinPromRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'promotion_reference', 'promotion_title', 'promotion_type', 'channel', 'target_audience',
      'product_service', 'content_summary', 'created_date', 'created_by', 'approved_by',
      'approval_date', 'approval_status', 'compliance_reviewer', 'compliance_review_date',
      'compliance_notes', 'version_number', 'live_date', 'expiry_date', 'withdrawn_date',
      'withdrawal_reason', 'risk_rating', 'regulatory_requirements', 'status', 'notes'
    ];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE fin_prom_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteFinPromRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM fin_prom_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ============================================================================
// AML CDD REGISTER
// ============================================================================

export interface AmlCddRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  customer_reference: string;
  customer_name: string;
  customer_type: string;
  onboarding_date?: Date;
  cdd_level: string;
  risk_rating: string;
  id_verification_status: string;
  id_verification_date?: Date;
  id_verification_method?: string;
  poa_verification_status: string;
  poa_verification_date?: Date;
  source_of_funds?: string;
  source_of_wealth?: string;
  beneficial_owners?: string;
  pep_check_status: string;
  pep_check_date?: Date;
  sanctions_check_status: string;
  sanctions_check_date?: Date;
  adverse_media_status: string;
  adverse_media_date?: Date;
  next_review_date?: Date;
  last_review_date?: Date;
  reviewer?: string;
  overall_status: string;
  approval_status: string;
  approved_by?: string;
  approval_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getAmlCddRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<AmlCddRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM aml_cdd_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ' AND pack_id = $2';
      params.push(packId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createAmlCddRecord(
  data: Omit<AmlCddRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<AmlCddRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO aml_cdd_records (
        organization_id, pack_id, customer_reference, customer_name, customer_type,
        onboarding_date, cdd_level, risk_rating, id_verification_status, id_verification_date,
        id_verification_method, poa_verification_status, poa_verification_date, source_of_funds,
        source_of_wealth, beneficial_owners, pep_check_status, pep_check_date, sanctions_check_status,
        sanctions_check_date, adverse_media_status, adverse_media_date, next_review_date,
        last_review_date, reviewer, overall_status, approval_status, approved_by, approval_date, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
      RETURNING *`,
      [
        data.organization_id || 'default-org',
        data.pack_id,
        data.customer_reference,
        data.customer_name,
        data.customer_type,
        data.onboarding_date,
        data.cdd_level || 'standard',
        data.risk_rating || 'medium',
        data.id_verification_status || 'pending',
        data.id_verification_date,
        data.id_verification_method,
        data.poa_verification_status || 'pending',
        data.poa_verification_date,
        data.source_of_funds,
        data.source_of_wealth,
        data.beneficial_owners,
        data.pep_check_status || 'pending',
        data.pep_check_date,
        data.sanctions_check_status || 'pending',
        data.sanctions_check_date,
        data.adverse_media_status || 'pending',
        data.adverse_media_date,
        data.next_review_date,
        data.last_review_date,
        data.reviewer,
        data.overall_status || 'in_progress',
        data.approval_status || 'pending',
        data.approved_by,
        data.approval_date,
        data.notes,
        data.created_by,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateAmlCddRecord(
  id: string,
  data: Partial<AmlCddRecord>
): Promise<AmlCddRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'customer_reference', 'customer_name', 'customer_type', 'onboarding_date', 'cdd_level',
      'risk_rating', 'id_verification_status', 'id_verification_date', 'id_verification_method',
      'poa_verification_status', 'poa_verification_date', 'source_of_funds', 'source_of_wealth',
      'beneficial_owners', 'pep_check_status', 'pep_check_date', 'sanctions_check_status',
      'sanctions_check_date', 'adverse_media_status', 'adverse_media_date', 'next_review_date',
      'last_review_date', 'reviewer', 'overall_status', 'approval_status', 'approved_by',
      'approval_date', 'notes'
    ];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE aml_cdd_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteAmlCddRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM aml_cdd_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ============================================================================
// EDD CASES REGISTER
// ============================================================================

export interface EddCaseRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  case_reference: string;
  customer_reference: string;
  customer_name: string;
  edd_trigger: string;
  trigger_description?: string;
  trigger_date: Date;
  risk_factors?: string[];
  enhanced_measures?: string[];
  source_of_wealth_verified: boolean;
  source_of_funds_verified: boolean;
  ongoing_monitoring_level: string;
  senior_management_approval: boolean;
  approved_by?: string;
  approval_date?: Date;
  approval_rationale?: string;
  next_review_date?: Date;
  last_review_date?: Date;
  review_frequency: string;
  status: string;
  decision: string;
  decision_rationale?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getEddCaseRecords(
  organizationId: string = 'default-org',
  packId?: string
): Promise<EddCaseRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM edd_cases_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];

    if (packId) {
      query += ' AND pack_id = $2';
      params.push(packId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createEddCaseRecord(
  data: Omit<EddCaseRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<EddCaseRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO edd_cases_records (
        organization_id, pack_id, case_reference, customer_reference, customer_name,
        edd_trigger, trigger_description, trigger_date, risk_factors, enhanced_measures,
        source_of_wealth_verified, source_of_funds_verified, ongoing_monitoring_level,
        senior_management_approval, approved_by, approval_date, approval_rationale,
        next_review_date, last_review_date, review_frequency, status, decision, decision_rationale, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`,
      [
        data.organization_id || 'default-org',
        data.pack_id,
        data.case_reference,
        data.customer_reference,
        data.customer_name,
        data.edd_trigger,
        data.trigger_description,
        data.trigger_date || new Date(),
        data.risk_factors,
        data.enhanced_measures,
        data.source_of_wealth_verified || false,
        data.source_of_funds_verified || false,
        data.ongoing_monitoring_level || 'enhanced',
        data.senior_management_approval || false,
        data.approved_by,
        data.approval_date,
        data.approval_rationale,
        data.next_review_date,
        data.last_review_date,
        data.review_frequency || 'quarterly',
        data.status || 'open',
        data.decision || 'pending',
        data.decision_rationale,
        data.notes,
        data.created_by,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateEddCaseRecord(
  id: string,
  data: Partial<EddCaseRecord>
): Promise<EddCaseRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'case_reference', 'customer_reference', 'customer_name', 'edd_trigger', 'trigger_description',
      'trigger_date', 'risk_factors', 'enhanced_measures', 'source_of_wealth_verified',
      'source_of_funds_verified', 'ongoing_monitoring_level', 'senior_management_approval',
      'approved_by', 'approval_date', 'approval_rationale', 'next_review_date', 'last_review_date',
      'review_frequency', 'status', 'decision', 'decision_rationale', 'notes'
    ];

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE edd_cases_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteEddCaseRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM edd_cases_records WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

// ============================================================================
// SAR-NCA REPORTS REGISTER
// ============================================================================

export interface SarNcaRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  sar_reference: string;
  internal_reference?: string;
  subject_name: string;
  subject_type: string;
  suspicion_type: string;
  suspicion_description?: string;
  discovery_date?: Date;
  reporter?: string;
  mlro_review_date?: Date;
  mlro_decision: string;
  mlro_rationale?: string;
  submitted_to_nca: boolean;
  nca_submission_date?: Date;
  nca_reference?: string;
  consent_required: boolean;
  consent_requested_date?: Date;
  consent_received: boolean;
  consent_received_date?: Date;
  consent_expiry_date?: Date;
  daml_requested: boolean;
  daml_reference?: string;
  status: string;
  outcome?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getSarNcaRecords(organizationId: string = 'default-org', packId?: string): Promise<SarNcaRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM sar_nca_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function createSarNcaRecord(data: Omit<SarNcaRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SarNcaRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO sar_nca_records (organization_id, pack_id, sar_reference, internal_reference, subject_name, subject_type, suspicion_type, suspicion_description, discovery_date, reporter, mlro_review_date, mlro_decision, mlro_rationale, submitted_to_nca, nca_submission_date, nca_reference, consent_required, consent_requested_date, consent_received, consent_received_date, consent_expiry_date, daml_requested, daml_reference, status, outcome, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.sar_reference, data.internal_reference, data.subject_name, data.subject_type, data.suspicion_type, data.suspicion_description, data.discovery_date, data.reporter, data.mlro_review_date, data.mlro_decision || 'pending', data.mlro_rationale, data.submitted_to_nca || false, data.nca_submission_date, data.nca_reference, data.consent_required || false, data.consent_requested_date, data.consent_received || false, data.consent_received_date, data.consent_expiry_date, data.daml_requested || false, data.daml_reference, data.status || 'draft', data.outcome, data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateSarNcaRecord(id: string, data: Partial<SarNcaRecord>): Promise<SarNcaRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['sar_reference', 'internal_reference', 'subject_name', 'subject_type', 'suspicion_type', 'suspicion_description', 'discovery_date', 'reporter', 'mlro_review_date', 'mlro_decision', 'mlro_rationale', 'submitted_to_nca', 'nca_submission_date', 'nca_reference', 'consent_required', 'consent_requested_date', 'consent_received', 'consent_received_date', 'consent_expiry_date', 'daml_requested', 'daml_reference', 'status', 'outcome', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE sar_nca_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteSarNcaRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM sar_nca_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// TX MONITORING ALERTS REGISTER
// ============================================================================

export interface TxMonitoringRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  alert_reference: string;
  alert_date: Date;
  rule_name?: string;
  rule_id?: string;
  customer_reference?: string;
  customer_name?: string;
  alert_type: string;
  alert_severity: string;
  transaction_ids?: string[];
  transaction_amount?: number;
  transaction_currency?: string;
  alert_description?: string;
  assigned_to?: string;
  assigned_date?: Date;
  investigation_notes?: string;
  investigation_outcome?: string;
  escalated: boolean;
  escalated_to?: string;
  escalated_date?: Date;
  sar_raised: boolean;
  sar_reference?: string;
  status: string;
  closed_date?: Date;
  closed_by?: string;
  false_positive: boolean;
  false_positive_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getTxMonitoringRecords(organizationId: string = 'default-org', packId?: string): Promise<TxMonitoringRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM tx_monitoring_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function createTxMonitoringRecord(data: Omit<TxMonitoringRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TxMonitoringRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO tx_monitoring_records (organization_id, pack_id, alert_reference, alert_date, rule_name, rule_id, customer_reference, customer_name, alert_type, alert_severity, transaction_ids, transaction_amount, transaction_currency, alert_description, assigned_to, assigned_date, investigation_notes, investigation_outcome, escalated, escalated_to, escalated_date, sar_raised, sar_reference, status, closed_date, closed_by, false_positive, false_positive_reason, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.alert_reference, data.alert_date || new Date(), data.rule_name, data.rule_id, data.customer_reference, data.customer_name, data.alert_type, data.alert_severity || 'medium', data.transaction_ids, data.transaction_amount, data.transaction_currency, data.alert_description, data.assigned_to, data.assigned_date, data.investigation_notes, data.investigation_outcome, data.escalated || false, data.escalated_to, data.escalated_date, data.sar_raised || false, data.sar_reference, data.status || 'open', data.closed_date, data.closed_by, data.false_positive || false, data.false_positive_reason, data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateTxMonitoringRecord(id: string, data: Partial<TxMonitoringRecord>): Promise<TxMonitoringRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['alert_reference', 'alert_date', 'rule_name', 'rule_id', 'customer_reference', 'customer_name', 'alert_type', 'alert_severity', 'transaction_ids', 'transaction_amount', 'transaction_currency', 'alert_description', 'assigned_to', 'assigned_date', 'investigation_notes', 'investigation_outcome', 'escalated', 'escalated_to', 'escalated_date', 'sar_raised', 'sar_reference', 'status', 'closed_date', 'closed_by', 'false_positive', 'false_positive_reason', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE tx_monitoring_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteTxMonitoringRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM tx_monitoring_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// PA DEALING LOG REGISTER
// ============================================================================

export interface PaDealingRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  request_reference: string;
  employee_name: string;
  employee_id?: string;
  request_type: string;
  instrument_type?: string;
  instrument_name?: string;
  isin?: string;
  quantity?: number;
  estimated_value?: number;
  currency?: string;
  broker_account?: string;
  reason_for_trade?: string;
  request_date: Date;
  pre_clearance_status: string;
  approved_by?: string;
  approval_date?: Date;
  approval_conditions?: string;
  execution_date?: Date;
  execution_price?: number;
  holding_period_end?: Date;
  restricted_list_check: boolean;
  conflict_check: boolean;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getPaDealingRecords(organizationId: string = 'default-org', packId?: string): Promise<PaDealingRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM pa_dealing_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function createPaDealingRecord(data: Omit<PaDealingRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaDealingRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO pa_dealing_records (organization_id, pack_id, request_reference, employee_name, employee_id, request_type, instrument_type, instrument_name, isin, quantity, estimated_value, currency, broker_account, reason_for_trade, request_date, pre_clearance_status, approved_by, approval_date, approval_conditions, execution_date, execution_price, holding_period_end, restricted_list_check, conflict_check, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.request_reference, data.employee_name, data.employee_id, data.request_type, data.instrument_type, data.instrument_name, data.isin, data.quantity, data.estimated_value, data.currency || 'GBP', data.broker_account, data.reason_for_trade, data.request_date || new Date(), data.pre_clearance_status || 'pending', data.approved_by, data.approval_date, data.approval_conditions, data.execution_date, data.execution_price, data.holding_period_end, data.restricted_list_check || false, data.conflict_check || false, data.status || 'pending', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updatePaDealingRecord(id: string, data: Partial<PaDealingRecord>): Promise<PaDealingRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['request_reference', 'employee_name', 'employee_id', 'request_type', 'instrument_type', 'instrument_name', 'isin', 'quantity', 'estimated_value', 'currency', 'broker_account', 'reason_for_trade', 'request_date', 'pre_clearance_status', 'approved_by', 'approval_date', 'approval_conditions', 'execution_date', 'execution_price', 'holding_period_end', 'restricted_list_check', 'conflict_check', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE pa_dealing_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deletePaDealingRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM pa_dealing_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// INSIDER LIST REGISTER
// ============================================================================

export interface InsiderListRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  list_reference: string;
  project_name: string;
  project_code?: string;
  issuer_name?: string;
  nature_of_information?: string;
  insider_name: string;
  insider_role?: string;
  insider_company?: string;
  insider_email?: string;
  insider_phone?: string;
  insider_national_id?: string;
  date_added: Date;
  time_obtained?: Date;
  date_removed?: Date;
  reason_for_removal?: string;
  acknowledgement_received: boolean;
  acknowledgement_date?: Date;
  list_status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getInsiderListRecords(organizationId: string = 'default-org', packId?: string): Promise<InsiderListRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM insider_list_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getInsiderListRecord(id: string): Promise<InsiderListRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM insider_list_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createInsiderListRecord(data: Omit<InsiderListRecord, 'id' | 'created_at' | 'updated_at'>): Promise<InsiderListRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO insider_list_records (organization_id, pack_id, list_reference, project_name, project_code, issuer_name, nature_of_information, insider_name, insider_role, insider_company, insider_email, insider_phone, insider_national_id, date_added, time_obtained, date_removed, reason_for_removal, acknowledgement_received, acknowledgement_date, list_status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.list_reference, data.project_name, data.project_code, data.issuer_name, data.nature_of_information, data.insider_name, data.insider_role, data.insider_company, data.insider_email, data.insider_phone, data.insider_national_id, data.date_added || new Date(), data.time_obtained, data.date_removed, data.reason_for_removal, data.acknowledgement_received || false, data.acknowledgement_date, data.list_status || 'active', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateInsiderListRecord(id: string, data: Partial<InsiderListRecord>): Promise<InsiderListRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['list_reference', 'project_name', 'project_code', 'issuer_name', 'nature_of_information', 'insider_name', 'insider_role', 'insider_company', 'insider_email', 'insider_phone', 'insider_national_id', 'date_added', 'time_obtained', 'date_removed', 'reason_for_removal', 'acknowledgement_received', 'acknowledgement_date', 'list_status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE insider_list_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteInsiderListRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM insider_list_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// OUTSIDE BUSINESS INTERESTS REGISTER
// ============================================================================

export interface OutsideBusinessRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  declaration_reference: string;
  employee_name: string;
  employee_id?: string;
  employee_role?: string;
  interest_type: string;
  organization_name: string;
  organization_type?: string;
  role_held?: string;
  remuneration: boolean;
  remuneration_amount?: number;
  time_commitment?: string;
  start_date?: Date;
  end_date?: Date;
  conflict_assessment?: string;
  conflict_identified: boolean;
  mitigation_measures?: string;
  approval_status: string;
  approved_by?: string;
  approval_date?: Date;
  next_review_date?: Date;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getOutsideBusinessRecords(organizationId: string = 'default-org', packId?: string): Promise<OutsideBusinessRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM outside_business_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getOutsideBusinessRecord(id: string): Promise<OutsideBusinessRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM outside_business_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createOutsideBusinessRecord(data: Omit<OutsideBusinessRecord, 'id' | 'created_at' | 'updated_at'>): Promise<OutsideBusinessRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO outside_business_records (organization_id, pack_id, declaration_reference, employee_name, employee_id, employee_role, interest_type, organization_name, organization_type, role_held, remuneration, remuneration_amount, time_commitment, start_date, end_date, conflict_assessment, conflict_identified, mitigation_measures, approval_status, approved_by, approval_date, next_review_date, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.declaration_reference, data.employee_name, data.employee_id, data.employee_role, data.interest_type, data.organization_name, data.organization_type, data.role_held, data.remuneration || false, data.remuneration_amount, data.time_commitment, data.start_date, data.end_date, data.conflict_assessment, data.conflict_identified || false, data.mitigation_measures, data.approval_status || 'pending', data.approved_by, data.approval_date, data.next_review_date, data.status || 'active', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateOutsideBusinessRecord(id: string, data: Partial<OutsideBusinessRecord>): Promise<OutsideBusinessRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['declaration_reference', 'employee_name', 'employee_id', 'employee_role', 'interest_type', 'organization_name', 'organization_type', 'role_held', 'remuneration', 'remuneration_amount', 'time_commitment', 'start_date', 'end_date', 'conflict_assessment', 'conflict_identified', 'mitigation_measures', 'approval_status', 'approved_by', 'approval_date', 'next_review_date', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE outside_business_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteOutsideBusinessRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM outside_business_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// DATA BREACH & DSAR REGISTER
// ============================================================================

export interface DataBreachDsarRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  record_reference: string;
  record_type: string;
  discovery_date: Date;
  incident_date?: Date;
  reported_by?: string;
  data_subjects_affected?: number;
  data_categories?: string[];
  breach_description?: string;
  cause_of_breach?: string;
  containment_actions?: string;
  ico_notification_required: boolean;
  ico_notified: boolean;
  ico_notification_date?: Date;
  ico_reference?: string;
  individuals_notified: boolean;
  notification_date?: Date;
  dsar_requester_name?: string;
  dsar_requester_email?: string;
  dsar_request_date?: Date;
  dsar_verification_status?: string;
  dsar_deadline?: Date;
  dsar_response_date?: Date;
  dsar_extension_applied: boolean;
  risk_assessment?: string;
  root_cause_analysis?: string;
  remediation_actions?: string;
  status: string;
  closed_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getDataBreachDsarRecords(organizationId: string = 'default-org', packId?: string): Promise<DataBreachDsarRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM data_breach_dsar_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getDataBreachDsarRecord(id: string): Promise<DataBreachDsarRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM data_breach_dsar_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createDataBreachDsarRecord(data: Omit<DataBreachDsarRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DataBreachDsarRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO data_breach_dsar_records (organization_id, pack_id, record_reference, record_type, discovery_date, incident_date, reported_by, data_subjects_affected, data_categories, breach_description, cause_of_breach, containment_actions, ico_notification_required, ico_notified, ico_notification_date, ico_reference, individuals_notified, notification_date, dsar_requester_name, dsar_requester_email, dsar_request_date, dsar_verification_status, dsar_deadline, dsar_response_date, dsar_extension_applied, risk_assessment, root_cause_analysis, remediation_actions, status, closed_date, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.record_reference, data.record_type, data.discovery_date || new Date(), data.incident_date, data.reported_by, data.data_subjects_affected, data.data_categories, data.breach_description, data.cause_of_breach, data.containment_actions, data.ico_notification_required || false, data.ico_notified || false, data.ico_notification_date, data.ico_reference, data.individuals_notified || false, data.notification_date, data.dsar_requester_name, data.dsar_requester_email, data.dsar_request_date, data.dsar_verification_status, data.dsar_deadline, data.dsar_response_date, data.dsar_extension_applied || false, data.risk_assessment, data.root_cause_analysis, data.remediation_actions, data.status || 'open', data.closed_date, data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateDataBreachDsarRecord(id: string, data: Partial<DataBreachDsarRecord>): Promise<DataBreachDsarRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['record_reference', 'record_type', 'discovery_date', 'incident_date', 'reported_by', 'data_subjects_affected', 'data_categories', 'breach_description', 'cause_of_breach', 'containment_actions', 'ico_notification_required', 'ico_notified', 'ico_notification_date', 'ico_reference', 'individuals_notified', 'notification_date', 'dsar_requester_name', 'dsar_requester_email', 'dsar_request_date', 'dsar_verification_status', 'dsar_deadline', 'dsar_response_date', 'dsar_extension_applied', 'risk_assessment', 'root_cause_analysis', 'remediation_actions', 'status', 'closed_date', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE data_breach_dsar_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteDataBreachDsarRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM data_breach_dsar_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// OPERATIONAL RESILIENCE REGISTER
// ============================================================================

export interface OpResilienceRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  service_reference: string;
  service_name: string;
  service_description?: string;
  service_owner?: string;
  is_important_business_service: boolean;
  impact_tolerance_defined: boolean;
  impact_tolerance_description?: string;
  max_tolerable_disruption?: string;
  dependencies?: string[];
  third_party_dependencies?: string[];
  last_scenario_test_date?: Date;
  scenario_test_result?: string;
  scenario_test_findings?: string;
  vulnerabilities_identified?: string;
  remediation_plan?: string;
  remediation_deadline?: Date;
  remediation_status: string;
  next_review_date?: Date;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getOpResilienceRecords(organizationId: string = 'default-org', packId?: string): Promise<OpResilienceRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM op_resilience_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getOpResilienceRecord(id: string): Promise<OpResilienceRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM op_resilience_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createOpResilienceRecord(data: Omit<OpResilienceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<OpResilienceRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO op_resilience_records (organization_id, pack_id, service_reference, service_name, service_description, service_owner, is_important_business_service, impact_tolerance_defined, impact_tolerance_description, max_tolerable_disruption, dependencies, third_party_dependencies, last_scenario_test_date, scenario_test_result, scenario_test_findings, vulnerabilities_identified, remediation_plan, remediation_deadline, remediation_status, next_review_date, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.service_reference, data.service_name, data.service_description, data.service_owner, data.is_important_business_service || false, data.impact_tolerance_defined || false, data.impact_tolerance_description, data.max_tolerable_disruption, data.dependencies, data.third_party_dependencies, data.last_scenario_test_date, data.scenario_test_result, data.scenario_test_findings, data.vulnerabilities_identified, data.remediation_plan, data.remediation_deadline, data.remediation_status || 'pending', data.next_review_date, data.status || 'active', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateOpResilienceRecord(id: string, data: Partial<OpResilienceRecord>): Promise<OpResilienceRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['service_reference', 'service_name', 'service_description', 'service_owner', 'is_important_business_service', 'impact_tolerance_defined', 'impact_tolerance_description', 'max_tolerable_disruption', 'dependencies', 'third_party_dependencies', 'last_scenario_test_date', 'scenario_test_result', 'scenario_test_findings', 'vulnerabilities_identified', 'remediation_plan', 'remediation_deadline', 'remediation_status', 'next_review_date', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE op_resilience_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteOpResilienceRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM op_resilience_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// T&C RECORD REGISTER
// ============================================================================

export interface TcRecordRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  employee_reference: string;
  employee_name: string;
  employee_role?: string;
  department?: string;
  start_date?: Date;
  tc_scheme?: string;
  qualification_required?: string;
  qualification_status: string;
  qualification_date?: Date;
  exam_attempts: number;
  competency_status: string;
  competency_date?: Date;
  supervisor_name?: string;
  supervision_level: string;
  supervision_end_date?: Date;
  cpd_hours_required: number;
  cpd_hours_completed: number;
  cpd_deadline?: Date;
  annual_attestation_date?: Date;
  fit_proper_status: string;
  fit_proper_date?: Date;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getTcRecordRecords(organizationId: string = 'default-org', packId?: string): Promise<TcRecordRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM tc_record_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getTcRecordRecord(id: string): Promise<TcRecordRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM tc_record_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createTcRecordRecord(data: Omit<TcRecordRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TcRecordRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO tc_record_records (organization_id, pack_id, employee_reference, employee_name, employee_role, department, start_date, tc_scheme, qualification_required, qualification_status, qualification_date, exam_attempts, competency_status, competency_date, supervisor_name, supervision_level, supervision_end_date, cpd_hours_required, cpd_hours_completed, cpd_deadline, annual_attestation_date, fit_proper_status, fit_proper_date, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.employee_reference, data.employee_name, data.employee_role, data.department, data.start_date, data.tc_scheme, data.qualification_required, data.qualification_status || 'in_progress', data.qualification_date, data.exam_attempts || 0, data.competency_status || 'not_assessed', data.competency_date, data.supervisor_name, data.supervision_level || 'standard', data.supervision_end_date, data.cpd_hours_required || 0, data.cpd_hours_completed || 0, data.cpd_deadline, data.annual_attestation_date, data.fit_proper_status || 'pending', data.fit_proper_date, data.status || 'active', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateTcRecordRecord(id: string, data: Partial<TcRecordRecord>): Promise<TcRecordRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['employee_reference', 'employee_name', 'employee_role', 'department', 'start_date', 'tc_scheme', 'qualification_required', 'qualification_status', 'qualification_date', 'exam_attempts', 'competency_status', 'competency_date', 'supervisor_name', 'supervision_level', 'supervision_end_date', 'cpd_hours_required', 'cpd_hours_completed', 'cpd_deadline', 'annual_attestation_date', 'fit_proper_status', 'fit_proper_date', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE tc_record_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteTcRecordRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM tc_record_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// SM&CR CERTIFICATION TRACKER REGISTER
// ============================================================================

export interface SmcrCertificationRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  employee_reference: string;
  employee_name: string;
  certification_function: string;
  function_code?: string;
  department?: string;
  start_date?: Date;
  annual_assessment_due?: Date;
  last_assessment_date?: Date;
  assessment_outcome?: string;
  fit_proper_confirmed: boolean;
  conduct_rules_training: boolean;
  conduct_rules_date?: Date;
  regulatory_references_checked: boolean;
  criminal_records_checked: boolean;
  credit_checked: boolean;
  certification_status: string;
  certified_by?: string;
  certification_date?: Date;
  certification_expiry?: Date;
  conduct_breaches: number;
  last_breach_date?: Date;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getSmcrCertificationRecords(organizationId: string = 'default-org', packId?: string): Promise<SmcrCertificationRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM smcr_certification_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getSmcrCertificationRecord(id: string): Promise<SmcrCertificationRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM smcr_certification_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createSmcrCertificationRecord(data: Omit<SmcrCertificationRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SmcrCertificationRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO smcr_certification_records (organization_id, pack_id, employee_reference, employee_name, certification_function, function_code, department, start_date, annual_assessment_due, last_assessment_date, assessment_outcome, fit_proper_confirmed, conduct_rules_training, conduct_rules_date, regulatory_references_checked, criminal_records_checked, credit_checked, certification_status, certified_by, certification_date, certification_expiry, conduct_breaches, last_breach_date, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.employee_reference, data.employee_name, data.certification_function, data.function_code, data.department, data.start_date, data.annual_assessment_due, data.last_assessment_date, data.assessment_outcome, data.fit_proper_confirmed || false, data.conduct_rules_training || false, data.conduct_rules_date, data.regulatory_references_checked || false, data.criminal_records_checked || false, data.credit_checked || false, data.certification_status || 'pending', data.certified_by, data.certification_date, data.certification_expiry, data.conduct_breaches || 0, data.last_breach_date, data.status || 'active', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateSmcrCertificationRecord(id: string, data: Partial<SmcrCertificationRecord>): Promise<SmcrCertificationRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['employee_reference', 'employee_name', 'certification_function', 'function_code', 'department', 'start_date', 'annual_assessment_due', 'last_assessment_date', 'assessment_outcome', 'fit_proper_confirmed', 'conduct_rules_training', 'conduct_rules_date', 'regulatory_references_checked', 'criminal_records_checked', 'credit_checked', 'certification_status', 'certified_by', 'certification_date', 'certification_expiry', 'conduct_breaches', 'last_breach_date', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE smcr_certification_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteSmcrCertificationRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM smcr_certification_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// REGULATORY RETURNS CALENDAR REGISTER
// ============================================================================

export interface RegulatoryReturnsRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  return_reference: string;
  return_name: string;
  regulator: string;
  return_type?: string;
  frequency?: string;
  reporting_period_start?: Date;
  reporting_period_end?: Date;
  due_date: Date;
  reminder_date?: Date;
  owner?: string;
  preparer?: string;
  reviewer?: string;
  preparation_status: string;
  review_status: string;
  submission_status: string;
  submitted_date?: Date;
  submitted_by?: string;
  confirmation_reference?: string;
  late_submission: boolean;
  late_reason?: string;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getRegulatoryReturnsRecords(organizationId: string = 'default-org', packId?: string): Promise<RegulatoryReturnsRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM regulatory_returns_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY due_date ASC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getRegulatoryReturnsRecord(id: string): Promise<RegulatoryReturnsRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM regulatory_returns_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createRegulatoryReturnsRecord(data: Omit<RegulatoryReturnsRecord, 'id' | 'created_at' | 'updated_at'>): Promise<RegulatoryReturnsRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO regulatory_returns_records (organization_id, pack_id, return_reference, return_name, regulator, return_type, frequency, reporting_period_start, reporting_period_end, due_date, reminder_date, owner, preparer, reviewer, preparation_status, review_status, submission_status, submitted_date, submitted_by, confirmation_reference, late_submission, late_reason, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.return_reference, data.return_name, data.regulator, data.return_type, data.frequency, data.reporting_period_start, data.reporting_period_end, data.due_date, data.reminder_date, data.owner, data.preparer, data.reviewer, data.preparation_status || 'not_started', data.review_status || 'pending', data.submission_status || 'pending', data.submitted_date, data.submitted_by, data.confirmation_reference, data.late_submission || false, data.late_reason, data.status || 'upcoming', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateRegulatoryReturnsRecord(id: string, data: Partial<RegulatoryReturnsRecord>): Promise<RegulatoryReturnsRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['return_reference', 'return_name', 'regulator', 'return_type', 'frequency', 'reporting_period_start', 'reporting_period_end', 'due_date', 'reminder_date', 'owner', 'preparer', 'reviewer', 'preparation_status', 'review_status', 'submission_status', 'submitted_date', 'submitted_by', 'confirmation_reference', 'late_submission', 'late_reason', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE regulatory_returns_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteRegulatoryReturnsRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM regulatory_returns_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}

// ============================================================================
// PRODUCT GOVERNANCE REGISTER
// ============================================================================

export interface ProductGovernanceRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  product_reference: string;
  product_name: string;
  product_type?: string;
  manufacturer?: string;
  is_manufacturer: boolean;
  target_market?: string;
  negative_target_market?: string;
  distribution_strategy?: string;
  risk_profile: string;
  fair_value_assessment?: string;
  fair_value_confirmed: boolean;
  fair_value_date?: Date;
  customer_outcomes?: string;
  product_testing_completed: boolean;
  testing_date?: Date;
  testing_results?: string;
  approval_status: string;
  approved_by?: string;
  approval_date?: Date;
  launch_date?: Date;
  last_review_date?: Date;
  next_review_date?: Date;
  review_frequency: string;
  issues_identified?: string;
  remediation_actions?: string;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export async function getProductGovernanceRecords(organizationId: string = 'default-org', packId?: string): Promise<ProductGovernanceRecord[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM product_governance_records WHERE organization_id = $1';
    const params: (string | undefined)[] = [organizationId];
    if (packId) { query += ' AND pack_id = $2'; params.push(packId); }
    query += ' ORDER BY created_at DESC';
    const result = await client.query(query, params);
    return result.rows;
  } finally { client.release(); }
}

export async function getProductGovernanceRecord(id: string): Promise<ProductGovernanceRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM product_governance_records WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function createProductGovernanceRecord(data: Omit<ProductGovernanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ProductGovernanceRecord> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO product_governance_records (organization_id, pack_id, product_reference, product_name, product_type, manufacturer, is_manufacturer, target_market, negative_target_market, distribution_strategy, risk_profile, fair_value_assessment, fair_value_confirmed, fair_value_date, customer_outcomes, product_testing_completed, testing_date, testing_results, approval_status, approved_by, approval_date, launch_date, last_review_date, next_review_date, review_frequency, issues_identified, remediation_actions, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING *`,
      [data.organization_id || 'default-org', data.pack_id, data.product_reference, data.product_name, data.product_type, data.manufacturer, data.is_manufacturer || false, data.target_market, data.negative_target_market, data.distribution_strategy, data.risk_profile || 'medium', data.fair_value_assessment, data.fair_value_confirmed || false, data.fair_value_date, data.customer_outcomes, data.product_testing_completed || false, data.testing_date, data.testing_results, data.approval_status || 'pending', data.approved_by, data.approval_date, data.launch_date, data.last_review_date, data.next_review_date, data.review_frequency || 'annual', data.issues_identified, data.remediation_actions, data.status || 'draft', data.notes, data.created_by]
    );
    return result.rows[0];
  } finally { client.release(); }
}

export async function updateProductGovernanceRecord(id: string, data: Partial<ProductGovernanceRecord>): Promise<ProductGovernanceRecord | null> {
  const client = await pool.connect();
  try {
    const fields: string[] = []; const values: unknown[] = []; let paramIndex = 1;
    const allowedFields = ['product_reference', 'product_name', 'product_type', 'manufacturer', 'is_manufacturer', 'target_market', 'negative_target_market', 'distribution_strategy', 'risk_profile', 'fair_value_assessment', 'fair_value_confirmed', 'fair_value_date', 'customer_outcomes', 'product_testing_completed', 'testing_date', 'testing_results', 'approval_status', 'approved_by', 'approval_date', 'launch_date', 'last_review_date', 'next_review_date', 'review_frequency', 'issues_identified', 'remediation_actions', 'status', 'notes'];
    for (const field of allowedFields) { if (field in data) { fields.push(`${field} = $${paramIndex++}`); values.push((data as Record<string, unknown>)[field]); } }
    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`); values.push(id);
    const result = await client.query(`UPDATE product_governance_records SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0] || null;
  } finally { client.release(); }
}

export async function deleteProductGovernanceRecord(id: string): Promise<boolean> {
  const client = await pool.connect();
  try { const result = await client.query('DELETE FROM product_governance_records WHERE id = $1', [id]); return result.rowCount !== null && result.rowCount > 0; }
  finally { client.release(); }
}
