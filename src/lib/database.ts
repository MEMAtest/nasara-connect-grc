import { Pool } from 'pg';
import { logger, logError, logDbOperation } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Vtu9NK8ThRbB@ep-royal-queen-abitcphb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
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

export async function updateEvidenceDocument(
  documentId: string,
  updates: Partial<Omit<EvidenceDocument, 'id' | 'assessment_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const client = await pool.connect();

  try {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    await client.query(`
      UPDATE evidence_documents
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
    `, [documentId, ...Object.values(updates)]);
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
          after: { label: "Proactive Defense", value: "5min response", details: ["AI-powered alerts", "Real-time dashboards", "Predictive analytics"] }
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
