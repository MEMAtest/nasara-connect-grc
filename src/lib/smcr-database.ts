/**
 * SMCR Database Operations
 * Database layer for Senior Managers & Certification Regime data
 */

import { Pool } from 'pg';
import { logger, logError, logDbOperation } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// =====================================================
// SMCR Database Schema Initialization
// =====================================================

export async function initSmcrDatabase() {
  const client = await pool.connect();
  try {
    // Firms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_firms (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        organization_id VARCHAR(255),
        authorization_project_id VARCHAR(255),
        authorization_project_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // People/Individuals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_people (
        id VARCHAR(255) PRIMARY KEY,
        firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
        employee_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        department VARCHAR(255),
        title VARCHAR(255),
        phone VARCHAR(100),
        address TEXT,
        line_manager VARCHAR(255),
        start_date DATE,
        hire_date DATE,
        end_date DATE,
        is_psd BOOLEAN DEFAULT false,
        psd_status VARCHAR(50),
        notes TEXT,
        assessment_status VARCHAR(50) DEFAULT 'not_required',
        last_assessment DATE,
        next_assessment DATE,
        training_completion INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Role assignments table (SMF/CF roles)
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_role_assignments (
        id VARCHAR(255) PRIMARY KEY,
        firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
        person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE CASCADE,
        function_id VARCHAR(100) NOT NULL,
        function_type VARCHAR(10) NOT NULL CHECK (function_type IN ('SMF', 'CF')),
        function_label VARCHAR(255),
        entity VARCHAR(255),
        start_date DATE NOT NULL,
        end_date DATE,
        assessment_date DATE,
        approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
        notes TEXT,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_documents (
        id VARCHAR(255) PRIMARY KEY,
        person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        size INTEGER,
        file_path TEXT,
        notes TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fitness & Propriety Assessments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_fitness_assessments (
        id VARCHAR(255) PRIMARY KEY,
        firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
        person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE CASCADE,
        person_name VARCHAR(255),
        person_role VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'completed')),
        assessment_date DATE,
        next_due_date DATE,
        reviewer VARCHAR(255),
        overall_determination VARCHAR(50),
        conditions JSONB DEFAULT '[]',
        responses JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Workflows table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_workflows (
        id VARCHAR(255) PRIMARY KEY,
        firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
        template_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        summary TEXT,
        owner_person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE SET NULL,
        owner_name VARCHAR(255),
        launched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        steps JSONB DEFAULT '[]',
        success_criteria JSONB DEFAULT '[]',
        trigger_event VARCHAR(255)
      )
    `);

    // Workflow Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_workflow_documents (
        id VARCHAR(255) PRIMARY KEY,
        firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
        workflow_id VARCHAR(255) REFERENCES smcr_workflows(id) ON DELETE CASCADE,
        step_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        size INTEGER,
        file_path TEXT,
        summary TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Training Plan Items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_training_items (
        id VARCHAR(255) PRIMARY KEY,
        person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE CASCADE,
        module_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        required BOOLEAN DEFAULT false,
        role_context VARCHAR(255),
        status VARCHAR(50) DEFAULT 'not_started',
        due_date DATE,
        completed_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Breaches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_breaches (
        id VARCHAR(255) PRIMARY KEY,
        firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
        person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE SET NULL,
        rule_id VARCHAR(255),
        severity VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        timeline JSONB DEFAULT '[]',
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Group Entities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS smcr_group_entities (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        parent_id VARCHAR(255),
        ownership_percent NUMERIC(5,2),
        country VARCHAR(100),
        linked_firm_id VARCHAR(255),
        linked_project_id VARCHAR(255),
        linked_project_name VARCHAR(255),
        regulatory_status VARCHAR(255),
        is_external BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`ALTER TABLE smcr_firms ADD COLUMN IF NOT EXISTS authorization_project_id VARCHAR(255)`);
    await client.query(`ALTER TABLE smcr_firms ADD COLUMN IF NOT EXISTS authorization_project_name VARCHAR(255)`);
    await client.query(`ALTER TABLE smcr_group_entities ADD COLUMN IF NOT EXISTS linked_firm_id VARCHAR(255)`);
    await client.query(`ALTER TABLE smcr_group_entities ADD COLUMN IF NOT EXISTS linked_project_id VARCHAR(255)`);
    await client.query(`ALTER TABLE smcr_group_entities ADD COLUMN IF NOT EXISTS linked_project_name VARCHAR(255)`);
    await client.query(`ALTER TABLE smcr_group_entities ADD COLUMN IF NOT EXISTS regulatory_status VARCHAR(255)`);
    await client.query(`ALTER TABLE smcr_group_entities ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT false`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_people_firm ON smcr_people(firm_id)`);
    await client.query(`ALTER TABLE smcr_people ADD COLUMN IF NOT EXISTS is_psd BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE smcr_people ADD COLUMN IF NOT EXISTS psd_status VARCHAR(50)`);
    await client.query(`ALTER TABLE smcr_people ADD COLUMN IF NOT EXISTS notes TEXT`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_roles_person ON smcr_role_assignments(person_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_roles_firm ON smcr_role_assignments(firm_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_assessments_person ON smcr_fitness_assessments(person_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_workflows_firm ON smcr_workflows(firm_id)`);
    await client.query(`ALTER TABLE smcr_breaches ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_breaches_firm ON smcr_breaches(firm_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_breaches_person ON smcr_breaches(person_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_group_entities_org ON smcr_group_entities(organization_id)`);

    // FCA verification columns
    await client.query(`ALTER TABLE smcr_people ADD COLUMN IF NOT EXISTS irn VARCHAR(20)`);
    await client.query(`ALTER TABLE smcr_people ADD COLUMN IF NOT EXISTS fca_verification JSONB`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_smcr_people_irn ON smcr_people(irn)`);

    logger.info('SMCR database tables initialized successfully');
  } catch (error) {
    logError(error, 'Failed to initialize SMCR database');
    throw error;
  } finally {
    client.release();
  }
}

// =====================================================
// Firms CRUD Operations
// =====================================================

export interface SmcrFirm {
  id: string;
  name: string;
  organization_id?: string;
  authorization_project_id?: string | null;
  authorization_project_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createFirm(name: string, organizationId?: string): Promise<SmcrFirm> {
  const startTime = Date.now();
  const id = `firm-${crypto.randomUUID()}`;
  const result = await pool.query<SmcrFirm>(
    `INSERT INTO smcr_firms (id, name, organization_id) VALUES ($1, $2, $3) RETURNING *`,
    [id, name, organizationId]
  );
  logDbOperation('insert', 'smcr_firms', Date.now() - startTime);
  return result.rows[0];
}

export async function getFirms(organizationId?: string): Promise<SmcrFirm[]> {
  const startTime = Date.now();
  const result = organizationId
    ? await pool.query<SmcrFirm>('SELECT * FROM smcr_firms WHERE organization_id = $1 ORDER BY name', [organizationId])
    : await pool.query<SmcrFirm>('SELECT * FROM smcr_firms ORDER BY name');
  logDbOperation('query', 'smcr_firms', Date.now() - startTime);
  return result.rows;
}

export async function getFirm(id: string, organizationId?: string): Promise<SmcrFirm | null> {
  const startTime = Date.now();
  const result = organizationId
    ? await pool.query<SmcrFirm>('SELECT * FROM smcr_firms WHERE id = $1 AND organization_id = $2', [id, organizationId])
    : await pool.query<SmcrFirm>('SELECT * FROM smcr_firms WHERE id = $1', [id]);
  logDbOperation('query', 'smcr_firms', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function updateFirm(id: string, updates: Partial<SmcrFirm>): Promise<SmcrFirm | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = ['name', 'authorization_project_id', 'authorization_project_name'];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field as keyof typeof updates]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getFirm(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrFirm>(
    `UPDATE smcr_firms SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_firms', Date.now() - startTime);
  return result.rows[0] || null;
}

// =====================================================
// People CRUD Operations
// =====================================================

export interface SmcrPerson {
  id: string;
  firm_id: string;
  employee_id: string;
  name: string;
  email: string | null;
  department: string | null;
  title: string | null;
  phone: string | null;
  address: string | null;
  line_manager: string | null;
  start_date: Date | null;
  hire_date: Date | null;
  end_date: Date | null;
  is_psd: boolean;
  psd_status: string | null;
  notes: string | null;
  assessment_status: string;
  last_assessment: Date | null;
  next_assessment: Date | null;
  training_completion: number;
  irn: string | null;
  fca_verification: object | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePersonInput {
  firm_id: string;
  name: string;
  email?: string;
  department?: string;
  title?: string;
  phone?: string;
  address?: string;
  line_manager?: string;
  start_date?: string;
  hire_date?: string;
  end_date?: string;
  irn?: string;
  is_psd?: boolean;
  psd_status?: string;
  notes?: string;
}

export async function createPerson(input: CreatePersonInput): Promise<SmcrPerson> {
  const startTime = Date.now();
  const id = `person-${crypto.randomUUID()}`;

  // Generate employee ID
  const countResult = await pool.query('SELECT COUNT(*) FROM smcr_people WHERE firm_id = $1', [input.firm_id]);
  const count = parseInt(countResult.rows[0].count, 10) + 1;
  const employeeId = `EMP${String(count).padStart(3, '0')}`;

  const result = await pool.query<SmcrPerson>(
    `INSERT INTO smcr_people (
      id, firm_id, employee_id, name, email, department, title, phone, address,
      line_manager, start_date, hire_date, end_date, irn, is_psd, psd_status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
    [
      id, input.firm_id, employeeId, input.name, input.email, input.department,
      input.title, input.phone, input.address, input.line_manager,
      input.start_date, input.hire_date || input.start_date, input.end_date,
      input.irn,
      input.is_psd ?? false,
      input.psd_status ?? null,
      input.notes ?? null,
    ]
  );
  logDbOperation('insert', 'smcr_people', Date.now() - startTime);
  return result.rows[0];
}

export async function getPeople(firmId: string): Promise<SmcrPerson[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrPerson>(
    'SELECT * FROM smcr_people WHERE firm_id = $1 ORDER BY name',
    [firmId]
  );
  logDbOperation('query', 'smcr_people', Date.now() - startTime);
  return result.rows;
}

export async function getPerson(id: string): Promise<SmcrPerson | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrPerson>('SELECT * FROM smcr_people WHERE id = $1', [id]);
  logDbOperation('query', 'smcr_people', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function updatePerson(id: string, updates: Partial<SmcrPerson>): Promise<SmcrPerson | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'name', 'email', 'department', 'title', 'phone', 'address', 'line_manager',
    'start_date', 'hire_date', 'end_date', 'assessment_status', 'last_assessment',
    'next_assessment', 'training_completion', 'irn', 'fca_verification', 'is_psd', 'psd_status', 'notes'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      const value = updates[field as keyof typeof updates];
      values.push(field === 'fca_verification' ? JSON.stringify(value) : value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getPerson(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrPerson>(
    `UPDATE smcr_people SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_people', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function deletePerson(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_people WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_people', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Role Assignments CRUD Operations
// =====================================================

export interface SmcrRoleAssignment {
  id: string;
  firm_id: string;
  person_id: string;
  function_id: string;
  function_type: 'SMF' | 'CF';
  function_label: string | null;
  entity: string | null;
  start_date: Date;
  end_date: Date | null;
  assessment_date: Date | null;
  approval_status: string;
  notes: string | null;
  assigned_at: Date;
  updated_at: Date;
}

export interface CreateRoleInput {
  firm_id: string;
  person_id: string;
  function_id: string;
  function_type: 'SMF' | 'CF';
  function_label?: string;
  entity?: string;
  start_date: string;
  end_date?: string;
  assessment_date?: string;
  approval_status?: string;
  notes?: string;
}

export async function createRoleAssignment(input: CreateRoleInput): Promise<SmcrRoleAssignment> {
  const startTime = Date.now();
  const id = `role-${crypto.randomUUID()}`;

  const result = await pool.query<SmcrRoleAssignment>(
    `INSERT INTO smcr_role_assignments (
      id, firm_id, person_id, function_id, function_type, function_label,
      entity, start_date, end_date, assessment_date, approval_status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      id, input.firm_id, input.person_id, input.function_id, input.function_type,
      input.function_label, input.entity, input.start_date, input.end_date,
      input.assessment_date, input.approval_status || 'draft', input.notes
    ]
  );
  logDbOperation('insert', 'smcr_role_assignments', Date.now() - startTime);
  return result.rows[0];
}

export async function getRoleAssignments(firmId: string): Promise<SmcrRoleAssignment[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrRoleAssignment>(
    'SELECT * FROM smcr_role_assignments WHERE firm_id = $1 ORDER BY assigned_at DESC',
    [firmId]
  );
  logDbOperation('query', 'smcr_role_assignments', Date.now() - startTime);
  return result.rows;
}

export async function getRolesByPerson(personId: string): Promise<SmcrRoleAssignment[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrRoleAssignment>(
    'SELECT * FROM smcr_role_assignments WHERE person_id = $1 ORDER BY start_date DESC',
    [personId]
  );
  logDbOperation('query', 'smcr_role_assignments', Date.now() - startTime);
  return result.rows;
}

export async function getRoleAssignment(id: string): Promise<SmcrRoleAssignment | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrRoleAssignment>(
    'SELECT * FROM smcr_role_assignments WHERE id = $1',
    [id]
  );
  logDbOperation('query', 'smcr_role_assignments', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function updateRoleAssignment(id: string, updates: Partial<SmcrRoleAssignment>): Promise<SmcrRoleAssignment | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'function_label', 'entity', 'start_date', 'end_date',
    'assessment_date', 'approval_status', 'notes'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field as keyof typeof updates]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrRoleAssignment>(
    `UPDATE smcr_role_assignments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_role_assignments', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function deleteRoleAssignment(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_role_assignments WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_role_assignments', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Fitness Assessments CRUD Operations
// =====================================================

export interface SmcrFitnessAssessment {
  id: string;
  firm_id: string;
  person_id: string;
  person_name: string | null;
  person_role: string | null;
  status: string;
  assessment_date: Date | null;
  next_due_date: Date | null;
  reviewer: string | null;
  overall_determination: string | null;
  conditions: string[];
  responses: Array<{ questionId: string; value: string | null; notes?: string }>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssessmentInput {
  firm_id: string;
  person_id: string;
  person_name: string;
  person_role?: string;
  assessment_date?: string;
  next_due_date?: string;
  reviewer?: string;
  responses?: Array<{ questionId: string; value: string | null; notes?: string }>;
}

export async function createFitnessAssessment(input: CreateAssessmentInput): Promise<SmcrFitnessAssessment> {
  const startTime = Date.now();
  const id = `assessment-${crypto.randomUUID()}`;

  const result = await pool.query<SmcrFitnessAssessment>(
    `INSERT INTO smcr_fitness_assessments (
      id, firm_id, person_id, person_name, person_role, assessment_date,
      next_due_date, reviewer, responses
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      id, input.firm_id, input.person_id, input.person_name, input.person_role,
      input.assessment_date, input.next_due_date, input.reviewer,
      JSON.stringify(input.responses || [])
    ]
  );
  logDbOperation('insert', 'smcr_fitness_assessments', Date.now() - startTime);
  return result.rows[0];
}

export async function getFitnessAssessments(firmId: string): Promise<SmcrFitnessAssessment[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrFitnessAssessment>(
    'SELECT * FROM smcr_fitness_assessments WHERE firm_id = $1 ORDER BY created_at DESC',
    [firmId]
  );
  logDbOperation('query', 'smcr_fitness_assessments', Date.now() - startTime);
  return result.rows;
}

export async function getAssessmentsByPerson(personId: string): Promise<SmcrFitnessAssessment[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrFitnessAssessment>(
    'SELECT * FROM smcr_fitness_assessments WHERE person_id = $1 ORDER BY created_at DESC',
    [personId]
  );
  logDbOperation('query', 'smcr_fitness_assessments', Date.now() - startTime);
  return result.rows;
}

export async function getFitnessAssessment(id: string): Promise<SmcrFitnessAssessment | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrFitnessAssessment>(
    'SELECT * FROM smcr_fitness_assessments WHERE id = $1',
    [id]
  );
  logDbOperation('query', 'smcr_fitness_assessments', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function updateFitnessAssessment(
  id: string,
  updates: Partial<SmcrFitnessAssessment>
): Promise<SmcrFitnessAssessment | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'status', 'assessment_date', 'next_due_date', 'reviewer',
    'overall_determination', 'conditions', 'responses'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      const value = updates[field as keyof typeof updates];
      values.push(field === 'conditions' || field === 'responses' ? JSON.stringify(value) : value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrFitnessAssessment>(
    `UPDATE smcr_fitness_assessments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_fitness_assessments', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function deleteFitnessAssessment(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_fitness_assessments WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_fitness_assessments', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Workflows CRUD Operations
// =====================================================

export interface SmcrWorkflow {
  id: string;
  firm_id: string;
  template_id: string;
  name: string;
  summary: string | null;
  owner_person_id: string | null;
  owner_name: string | null;
  launched_at: Date;
  due_date: Date | null;
  status: string;
  steps: unknown[];
  success_criteria: string[];
  trigger_event: string | null;
}

export interface CreateWorkflowInput {
  firm_id: string;
  template_id: string;
  name: string;
  summary?: string;
  owner_person_id?: string;
  owner_name?: string;
  due_date?: string;
  steps: unknown[];
  success_criteria?: string[];
  trigger_event?: string;
}

export async function createWorkflow(input: CreateWorkflowInput): Promise<SmcrWorkflow> {
  const startTime = Date.now();
  const id = `workflow-${crypto.randomUUID()}`;

  const result = await pool.query<SmcrWorkflow>(
    `INSERT INTO smcr_workflows (
      id, firm_id, template_id, name, summary, owner_person_id, owner_name,
      due_date, steps, success_criteria, trigger_event
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      id, input.firm_id, input.template_id, input.name, input.summary,
      input.owner_person_id, input.owner_name, input.due_date,
      JSON.stringify(input.steps), JSON.stringify(input.success_criteria || []),
      input.trigger_event
    ]
  );
  logDbOperation('insert', 'smcr_workflows', Date.now() - startTime);
  return result.rows[0];
}

export async function getWorkflows(firmId: string): Promise<SmcrWorkflow[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrWorkflow>(
    'SELECT * FROM smcr_workflows WHERE firm_id = $1 ORDER BY launched_at DESC',
    [firmId]
  );
  logDbOperation('query', 'smcr_workflows', Date.now() - startTime);
  return result.rows;
}

export async function getWorkflow(id: string): Promise<SmcrWorkflow | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrWorkflow>('SELECT * FROM smcr_workflows WHERE id = $1', [id]);
  logDbOperation('query', 'smcr_workflows', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function updateWorkflow(id: string, updates: Partial<SmcrWorkflow>): Promise<SmcrWorkflow | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = ['name', 'status', 'steps', 'due_date'];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      const value = updates[field as keyof typeof updates];
      values.push(field === 'steps' ? JSON.stringify(value) : value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getWorkflow(id);

  values.push(id);

  const result = await pool.query<SmcrWorkflow>(
    `UPDATE smcr_workflows SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_workflows', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_workflows WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_workflows', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Workflow Documents CRUD Operations
// =====================================================

export interface SmcrWorkflowDocument {
  id: string;
  firm_id: string;
  workflow_id: string;
  step_id: string;
  name: string;
  type: string | null;
  size: number | null;
  file_path: string | null;
  summary: string | null;
  status: string;
  uploaded_at: Date;
}

export interface CreateWorkflowDocumentInput {
  firm_id: string;
  workflow_id: string;
  step_id: string;
  name: string;
  type?: string;
  size?: number;
  file_path?: string;
  summary?: string;
  status?: string;
}

export async function getWorkflowDocuments(workflowId: string): Promise<SmcrWorkflowDocument[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrWorkflowDocument>(
    'SELECT * FROM smcr_workflow_documents WHERE workflow_id = $1 ORDER BY uploaded_at DESC',
    [workflowId]
  );
  logDbOperation('query', 'smcr_workflow_documents', Date.now() - startTime);
  return result.rows;
}

export async function getWorkflowDocument(id: string): Promise<SmcrWorkflowDocument | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrWorkflowDocument>(
    'SELECT * FROM smcr_workflow_documents WHERE id = $1',
    [id]
  );
  logDbOperation('query', 'smcr_workflow_documents', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function createWorkflowDocument(input: CreateWorkflowDocumentInput): Promise<SmcrWorkflowDocument> {
  const startTime = Date.now();
  const id = `wdoc-${crypto.randomUUID()}`;
  const result = await pool.query<SmcrWorkflowDocument>(
    `INSERT INTO smcr_workflow_documents (
      id, firm_id, workflow_id, step_id, name, type, size, file_path, summary, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      id,
      input.firm_id,
      input.workflow_id,
      input.step_id,
      input.name,
      input.type ?? null,
      input.size ?? null,
      input.file_path ?? null,
      input.summary ?? null,
      input.status ?? 'pending',
    ]
  );
  logDbOperation('insert', 'smcr_workflow_documents', Date.now() - startTime);
  return result.rows[0];
}

export async function deleteWorkflowDocument(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_workflow_documents WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_workflow_documents', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Documents CRUD Operations
// =====================================================

export interface SmcrDocument {
  id: string;
  person_id: string;
  category: string;
  name: string;
  type: string | null;
  size: number | null;
  file_path: string | null;
  notes: string | null;
  uploaded_at: Date;
}

export interface CreateSmcrDocumentInput {
  person_id: string;
  category: string;
  name: string;
  type?: string;
  size?: number;
  file_path?: string;
  notes?: string;
}

export async function getSmcrDocuments(personId: string): Promise<SmcrDocument[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrDocument>(
    'SELECT * FROM smcr_documents WHERE person_id = $1 ORDER BY uploaded_at DESC',
    [personId]
  );
  logDbOperation('query', 'smcr_documents', Date.now() - startTime);
  return result.rows;
}

export async function getSmcrDocument(id: string): Promise<SmcrDocument | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrDocument>(
    'SELECT * FROM smcr_documents WHERE id = $1',
    [id]
  );
  logDbOperation('query', 'smcr_documents', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function createSmcrDocument(input: CreateSmcrDocumentInput): Promise<SmcrDocument> {
  const startTime = Date.now();
  const id = `doc-${crypto.randomUUID()}`;
  const result = await pool.query<SmcrDocument>(
    `INSERT INTO smcr_documents (
      id, person_id, category, name, type, size, file_path, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      id,
      input.person_id,
      input.category,
      input.name,
      input.type ?? null,
      input.size ?? null,
      input.file_path ?? null,
      input.notes ?? null,
    ]
  );
  logDbOperation('insert', 'smcr_documents', Date.now() - startTime);
  return result.rows[0];
}

export async function deleteSmcrDocument(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_documents WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_documents', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Training Items CRUD Operations
// =====================================================

export interface SmcrTrainingItem {
  id: string;
  person_id: string;
  module_id: string | null;
  title: string;
  required: boolean;
  role_context: string | null;
  status: string;
  due_date: Date | null;
  completed_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTrainingItemInput {
  person_id: string;
  module_id?: string;
  title: string;
  required?: boolean;
  role_context?: string;
  status?: string;
  due_date?: string;
  completed_date?: string;
}

export async function getTrainingItems(personId: string): Promise<SmcrTrainingItem[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrTrainingItem>(
    'SELECT * FROM smcr_training_items WHERE person_id = $1 ORDER BY created_at DESC',
    [personId]
  );
  logDbOperation('query', 'smcr_training_items', Date.now() - startTime);
  return result.rows;
}

export async function createTrainingItem(input: CreateTrainingItemInput): Promise<SmcrTrainingItem> {
  const startTime = Date.now();
  const id = `training-${crypto.randomUUID()}`;
  const result = await pool.query<SmcrTrainingItem>(
    `INSERT INTO smcr_training_items (
      id, person_id, module_id, title, required, role_context,
      status, due_date, completed_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      id,
      input.person_id,
      input.module_id ?? null,
      input.title,
      input.required ?? false,
      input.role_context ?? null,
      input.status ?? 'not_started',
      input.due_date ?? null,
      input.completed_date ?? null,
    ]
  );
  logDbOperation('insert', 'smcr_training_items', Date.now() - startTime);
  return result.rows[0];
}

export async function updateTrainingItem(id: string, updates: Partial<SmcrTrainingItem>): Promise<SmcrTrainingItem | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'status', 'due_date', 'completed_date', 'required', 'role_context', 'title'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field as keyof typeof updates]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrTrainingItem>(
    `UPDATE smcr_training_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_training_items', Date.now() - startTime);
  return result.rows[0] || null;
}

// =====================================================
// Breaches CRUD Operations
// =====================================================

export interface SmcrBreachRecord {
  id: string;
  firm_id: string;
  person_id: string | null;
  rule_id: string | null;
  severity: string;
  status: string;
  timeline: unknown[];
  details: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBreachInput {
  firm_id: string;
  person_id?: string;
  rule_id?: string;
  severity: string;
  status: string;
  timeline?: unknown[];
  details?: Record<string, unknown>;
}

export async function getBreaches(firmId: string): Promise<SmcrBreachRecord[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrBreachRecord>(
    'SELECT * FROM smcr_breaches WHERE firm_id = $1 ORDER BY created_at DESC',
    [firmId]
  );
  logDbOperation('query', 'smcr_breaches', Date.now() - startTime);
  return result.rows;
}

export async function getBreach(id: string): Promise<SmcrBreachRecord | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrBreachRecord>(
    'SELECT * FROM smcr_breaches WHERE id = $1',
    [id]
  );
  logDbOperation('query', 'smcr_breaches', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function createBreach(input: CreateBreachInput): Promise<SmcrBreachRecord> {
  const startTime = Date.now();
  const id = `breach-${crypto.randomUUID()}`;
  const result = await pool.query<SmcrBreachRecord>(
    `INSERT INTO smcr_breaches (
      id, firm_id, person_id, rule_id, severity, status, timeline, details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      id,
      input.firm_id,
      input.person_id ?? null,
      input.rule_id ?? null,
      input.severity,
      input.status,
      JSON.stringify(input.timeline ?? []),
      JSON.stringify(input.details ?? {}),
    ]
  );
  logDbOperation('insert', 'smcr_breaches', Date.now() - startTime);
  return result.rows[0];
}

export async function updateBreach(id: string, updates: Partial<SmcrBreachRecord>): Promise<SmcrBreachRecord | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = ['person_id', 'rule_id', 'severity', 'status', 'timeline', 'details'];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      const value = updates[field as keyof typeof updates];
      if (field === 'timeline' || field === 'details') {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramIndex++;
    }
  }

  if (fields.length === 0) return getBreach(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrBreachRecord>(
    `UPDATE smcr_breaches SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_breaches', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function deleteBreach(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_breaches WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_breaches', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Group Entities CRUD Operations
// =====================================================

export interface SmcrGroupEntity {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  parent_id: string | null;
  ownership_percent: number | null;
  country: string | null;
  linked_firm_id: string | null;
  linked_project_id: string | null;
  linked_project_name: string | null;
  regulatory_status: string | null;
  is_external: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGroupEntityInput {
  organization_id: string;
  name: string;
  type: string;
  parent_id?: string;
  ownership_percent?: number;
  country?: string;
  linked_firm_id?: string;
  linked_project_id?: string;
  linked_project_name?: string;
  regulatory_status?: string;
  is_external?: boolean;
}

export async function getGroupEntities(organizationId: string): Promise<SmcrGroupEntity[]> {
  const startTime = Date.now();
  const result = await pool.query<SmcrGroupEntity>(
    'SELECT * FROM smcr_group_entities WHERE organization_id = $1 ORDER BY created_at DESC',
    [organizationId]
  );
  logDbOperation('query', 'smcr_group_entities', Date.now() - startTime);
  return result.rows;
}

export async function getGroupEntity(id: string): Promise<SmcrGroupEntity | null> {
  const startTime = Date.now();
  const result = await pool.query<SmcrGroupEntity>(
    'SELECT * FROM smcr_group_entities WHERE id = $1',
    [id]
  );
  logDbOperation('query', 'smcr_group_entities', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function createGroupEntity(input: CreateGroupEntityInput): Promise<SmcrGroupEntity> {
  const startTime = Date.now();
  const id = `group-${crypto.randomUUID()}`;
  const result = await pool.query<SmcrGroupEntity>(
    `INSERT INTO smcr_group_entities (
      id, organization_id, name, type, parent_id, ownership_percent, country,
      linked_firm_id, linked_project_id, linked_project_name, regulatory_status, is_external
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      id,
      input.organization_id,
      input.name,
      input.type,
      input.parent_id ?? null,
      input.ownership_percent ?? null,
      input.country ?? null,
      input.linked_firm_id ?? null,
      input.linked_project_id ?? null,
      input.linked_project_name ?? null,
      input.regulatory_status ?? null,
      input.is_external ?? false,
    ]
  );
  logDbOperation('insert', 'smcr_group_entities', Date.now() - startTime);
  return result.rows[0];
}

export async function updateGroupEntity(id: string, updates: Partial<SmcrGroupEntity>): Promise<SmcrGroupEntity | null> {
  const startTime = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'name',
    'type',
    'parent_id',
    'ownership_percent',
    'country',
    'linked_firm_id',
    'linked_project_id',
    'linked_project_name',
    'regulatory_status',
    'is_external',
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field as keyof typeof updates]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getGroupEntity(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<SmcrGroupEntity>(
    `UPDATE smcr_group_entities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  logDbOperation('update', 'smcr_group_entities', Date.now() - startTime);
  return result.rows[0] || null;
}

export async function deleteGroupEntity(id: string): Promise<boolean> {
  const startTime = Date.now();
  const result = await pool.query('DELETE FROM smcr_group_entities WHERE id = $1', [id]);
  logDbOperation('delete', 'smcr_group_entities', Date.now() - startTime);
  return (result.rowCount ?? 0) > 0;
}

// =====================================================
// Dashboard Statistics
// =====================================================

export interface SmcrDashboardStats {
  totalSmfs: number;
  totalCertified: number;
  assessmentsDue: number;
  assessmentsOverdue: number;
  fitnessStatus: { green: number; amber: number; red: number };
  trainingCompletion: number;
  activeWorkflows: number;
}

export async function getDashboardStats(firmId: string): Promise<SmcrDashboardStats> {
  const startTime = Date.now();

  // Get role counts
  const roleStats = await pool.query(`
    SELECT
      function_type,
      COUNT(*) as count
    FROM smcr_role_assignments
    WHERE firm_id = $1 AND (end_date IS NULL OR end_date > CURRENT_DATE)
    GROUP BY function_type
  `, [firmId]);

  const smfCount = roleStats.rows.find(r => r.function_type === 'SMF')?.count || 0;
  const cfCount = roleStats.rows.find(r => r.function_type === 'CF')?.count || 0;

  // Get assessment stats
  const assessmentStats = await pool.query(`
    SELECT
      assessment_status,
      COUNT(*) as count
    FROM smcr_people
    WHERE firm_id = $1
    GROUP BY assessment_status
  `, [firmId]);

  const dueCount = assessmentStats.rows.find(r => r.assessment_status === 'due')?.count || 0;
  const overdueCount = assessmentStats.rows.find(r => r.assessment_status === 'overdue')?.count || 0;
  const currentCount = assessmentStats.rows.find(r => r.assessment_status === 'current')?.count || 0;

  // Get average training completion
  const trainingStats = await pool.query(`
    SELECT AVG(training_completion) as avg_completion
    FROM smcr_people
    WHERE firm_id = $1
  `, [firmId]);

  // Get active workflows
  const workflowStats = await pool.query(`
    SELECT COUNT(*) as count
    FROM smcr_workflows
    WHERE firm_id = $1 AND status IN ('not_started', 'in_progress')
  `, [firmId]);

  logDbOperation('query', 'smcr_dashboard_stats', Date.now() - startTime);

  return {
    totalSmfs: parseInt(smfCount, 10),
    totalCertified: parseInt(cfCount, 10),
    assessmentsDue: parseInt(dueCount, 10),
    assessmentsOverdue: parseInt(overdueCount, 10),
    fitnessStatus: {
      green: parseInt(currentCount, 10),
      amber: parseInt(dueCount, 10),
      red: parseInt(overdueCount, 10),
    },
    trainingCompletion: Math.round(trainingStats.rows[0]?.avg_completion || 0),
    activeWorkflows: parseInt(workflowStats.rows[0]?.count || 0, 10),
  };
}
