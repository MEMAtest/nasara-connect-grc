import { randomUUID } from "crypto";
import { pool } from "@/lib/database";
import { ConcurrencyError, softDeleteClause } from "@/lib/api-utils";
import {
  PACK_TEMPLATES,
  PackType,
} from "@/lib/authorization-pack-templates";
import {
  PERMISSION_ECOSYSTEMS,
  PermissionCode,
} from "@/lib/authorization-pack-ecosystems";
import {
  buildProfileInsights,
  isProfilePermissionCode,
  type BusinessPlanProfile,
} from "@/lib/business-plan-profile";
import {
  buildQuestionContext,
  type QuestionResponse,
} from "@/lib/assessment-question-bank";

interface PackTemplateRow {
  id: string;
  type: PackType;
  name: string;
  description: string | null;
}

interface PermissionEcosystemRow {
  id: string;
  permission_code: PermissionCode;
  name: string;
  description: string | null;
  pack_template_type: PackType;
  section_keys: string[];
  policy_templates: string[];
  training_requirements: string[];
  smcr_roles: string[];
  typical_timeline_weeks: number | null;
}

interface OpinionPackGenerationJobRow {
  id: string;
  pack_id: string;
  status: string;
  progress: number | null;
  current_step: string | null;
  payload: unknown;
  error_message: string | null;
  document_id: string | null;
  document_name: string | null;
  created_at: string;
  updated_at: string;
}

const normalizeEvidenceName = (value: string) => value.trim().toLowerCase();
const normalizeSectionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseAnnexNumber = (value: string | null) => {
  if (!value) return 0;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

const coerceJsonArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const coerceJsonObject = <T>(value: unknown): T => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as T;
      }
    } catch {
      return {} as T;
    }
  }
  return {} as T;
};

let templatesSynced = false;
let ecosystemsSynced = false;
const EXPECTED_TEMPLATE_COUNT = PACK_TEMPLATES.length;
const EXPECTED_SECTION_COUNT = PACK_TEMPLATES.reduce((total, template) => total + template.sections.length, 0);
const EXPECTED_ECOSYSTEM_COUNT = PERMISSION_ECOSYSTEMS.length;

export async function initAuthorizationPackDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(100),
        type VARCHAR(100),
        pack_type VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        typical_timeline_weeks INTEGER DEFAULT 12,
        policy_templates JSONB DEFAULT '[]'::jsonb,
        training_requirements JSONB DEFAULT '[]'::jsonb,
        smcr_roles JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS pack_type VARCHAR(100);
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS type VARCHAR(100);
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS typical_timeline_weeks INTEGER DEFAULT 12;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS policy_templates JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS training_requirements JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS smcr_roles JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pack_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);

    await client.query(`
      UPDATE pack_templates
      SET pack_type = COALESCE(pack_type, type, code)
      WHERE pack_type IS NULL;
    `);

    await client.query(`
      UPDATE pack_templates
      SET type = COALESCE(type, pack_type, code)
      WHERE type IS NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS permission_ecosystems (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        permission_code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        pack_template_type VARCHAR(100) NOT NULL,
        section_keys JSONB DEFAULT '[]'::jsonb,
        policy_templates JSONB DEFAULT '[]'::jsonb,
        training_requirements JSONB DEFAULT '[]'::jsonb,
        smcr_roles JSONB DEFAULT '[]'::jsonb,
        typical_timeline_weeks INTEGER
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS section_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES pack_templates(id) ON DELETE CASCADE,
        section_key VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INTEGER NOT NULL,
        is_addon BOOLEAN DEFAULT FALSE,
        addon_trigger VARCHAR(100),
        UNIQUE(template_id, section_key)
      )
    `);

    await client.query(`
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS pack_template_id UUID;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS code VARCHAR(150);
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS guidance_text TEXT;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS order_index INTEGER;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS regulatory_reference VARCHAR(500);
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS definition_of_done JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS evidence_requirements JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS template_id UUID;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS section_key VARCHAR(150);
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS display_order INTEGER;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS is_addon BOOLEAN DEFAULT FALSE;
      ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS addon_trigger VARCHAR(100);
    `);

    await client.query(`
      UPDATE section_templates
      SET template_id = COALESCE(template_id, pack_template_id)
      WHERE template_id IS NULL AND pack_template_id IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET pack_template_id = COALESCE(pack_template_id, template_id)
      WHERE pack_template_id IS NULL AND template_id IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET section_key = COALESCE(section_key, code)
      WHERE section_key IS NULL AND code IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET code = COALESCE(code, section_key)
      WHERE code IS NULL AND section_key IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET title = COALESCE(title, name)
      WHERE title IS NULL AND name IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET name = COALESCE(name, title)
      WHERE name IS NULL AND title IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET description = COALESCE(description, guidance_text)
      WHERE description IS NULL AND guidance_text IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET guidance_text = COALESCE(guidance_text, description)
      WHERE guidance_text IS NULL AND description IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET display_order = COALESCE(display_order, order_index)
      WHERE display_order IS NULL AND order_index IS NOT NULL;
    `);

    await client.query(`
      UPDATE section_templates
      SET order_index = COALESCE(order_index, display_order)
      WHERE order_index IS NULL AND display_order IS NOT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_template_id UUID REFERENCES section_templates(id) ON DELETE CASCADE,
        prompt_key VARCHAR(150) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        guidance TEXT,
        example_answer TEXT,
        input_type VARCHAR(50) NOT NULL,
        options JSONB,
        required BOOLEAN DEFAULT TRUE,
        weight INTEGER DEFAULT 1,
        display_order INTEGER NOT NULL,
        UNIQUE(section_template_id, prompt_key)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS required_evidence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_template_id UUID REFERENCES section_templates(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        file_types VARCHAR(255),
        is_mandatory BOOLEAN DEFAULT TRUE,
        display_order INTEGER NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS packs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES pack_templates(id),
        organization_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        target_submission_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE packs
        ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES pack_templates(id),
        ADD COLUMN IF NOT EXISTS organization_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS target_submission_date DATE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      ALTER TABLE packs
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS authorization_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        permission_code VARCHAR(50) NOT NULL,
        pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'assessment',
        assessment_data JSONB DEFAULT '{}'::jsonb,
        project_plan JSONB DEFAULT '{}'::jsonb,
        target_submission_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE authorization_projects
        ADD COLUMN IF NOT EXISTS organization_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS permission_code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'assessment',
        ADD COLUMN IF NOT EXISTS assessment_data JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS project_plan JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS target_submission_date DATE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      ALTER TABLE authorization_projects
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS section_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        section_template_id UUID REFERENCES section_templates(id),
        section_key VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        display_order INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'not-started',
        owner_id VARCHAR(100),
        due_date DATE,
        review_state VARCHAR(50) DEFAULT 'draft',
        completed_at TIMESTAMP,
        UNIQUE(pack_id, section_template_id)
      )
    `);

    await client.query(`
      ALTER TABLE section_instances
        ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS section_template_id UUID REFERENCES section_templates(id),
        ADD COLUMN IF NOT EXISTS section_key VARCHAR(150),
        ADD COLUMN IF NOT EXISTS title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS display_order INTEGER,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'not-started',
        ADD COLUMN IF NOT EXISTS owner_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS due_date DATE,
        ADD COLUMN IF NOT EXISTS review_state VARCHAR(50) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    `);

    await client.query(`
      ALTER TABLE section_instances
        ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS prompt_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_instance_id UUID REFERENCES section_instances(id) ON DELETE CASCADE,
        prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
        value TEXT,
        updated_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(section_instance_id, prompt_id)
      )
    `);

    await client.query(`
      ALTER TABLE prompt_responses
        ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS evidence_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        section_instance_id UUID REFERENCES section_instances(id) ON DELETE CASCADE,
        required_evidence_id UUID REFERENCES required_evidence(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'required',
        file_path TEXT,
        file_size INTEGER,
        file_type TEXT,
        uploaded_at TIMESTAMP,
        annex_number VARCHAR(50),
        version INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE evidence_items
        ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS section_instance_id UUID REFERENCES section_instances(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS required_evidence_id UUID REFERENCES required_evidence(id),
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'required',
        ADD COLUMN IF NOT EXISTS file_path TEXT,
        ADD COLUMN IF NOT EXISTS file_size INTEGER,
        ADD COLUMN IF NOT EXISTS file_type TEXT,
        ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS annex_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      ALTER TABLE evidence_items
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS evidence_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        evidence_item_id UUID REFERENCES evidence_items(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT,
        file_size INTEGER,
        file_type TEXT,
        uploaded_by VARCHAR(100),
        uploaded_at TIMESTAMP DEFAULT NOW(),
        notes TEXT
      )
    `);

    await client.query(`
      ALTER TABLE evidence_items ALTER COLUMN status SET DEFAULT 'required';
    `);

    await client.query(`
      UPDATE evidence_items
      SET status = 'required'
      WHERE status = 'missing' OR status IS NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        section_instance_id UUID REFERENCES section_instances(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'medium',
        owner_id VARCHAR(100),
        due_date DATE,
        source VARCHAR(50),
        dependency_ids UUID[],
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS section_instance_id UUID REFERENCES section_instances(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
        ADD COLUMN IF NOT EXISTS owner_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS due_date DATE,
        ADD COLUMN IF NOT EXISTS source VARCHAR(50),
        ADD COLUMN IF NOT EXISTS dependency_ids UUID[],
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        section_code VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        storage_key TEXT,
        file_size_bytes BIGINT,
        mime_type VARCHAR(100),
        checksum VARCHAR(64),
        version INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'draft',
        uploaded_by VARCHAR(100),
        uploaded_at TIMESTAMP,
        reviewed_by VARCHAR(100),
        reviewed_at TIMESTAMP,
        signed_by VARCHAR(100),
        signed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE pack_documents
        ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS section_code VARCHAR(100),
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS storage_key TEXT,
        ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
        ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS checksum VARCHAR(64),
        ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(100),
        ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(100),
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS signed_by VARCHAR(100),
        ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      ALTER TABLE pack_documents
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS authorization_pack_generation_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        current_step VARCHAR(255),
        payload JSONB DEFAULT '{}'::jsonb,
        error_message TEXT,
        document_id UUID,
        document_name TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE authorization_pack_generation_jobs
        ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS current_step VARCHAR(255),
        ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS error_message TEXT,
        ADD COLUMN IF NOT EXISTS document_id UUID,
        ADD COLUMN IF NOT EXISTS document_name TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_pack_gen_jobs_pack ON authorization_pack_generation_jobs(pack_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS review_gates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_instance_id UUID REFERENCES section_instances(id) ON DELETE CASCADE,
        stage VARCHAR(50) NOT NULL,
        state VARCHAR(50) DEFAULT 'pending',
        reviewer_role VARCHAR(50) NOT NULL,
        reviewer_id VARCHAR(100),
        reviewed_at TIMESTAMP,
        notes TEXT,
        client_notes TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        actor_id VARCHAR(100),
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS authorization_pack_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(20) NOT NULL,
        actor_id VARCHAR(100) NOT NULL,
        organization_id VARCHAR(100) NOT NULL,
        changes JSONB DEFAULT '{}'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pack_templates_code_unique ON pack_templates(code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_permission_ecosystems_code ON permission_ecosystems(permission_code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_section_templates_template ON section_templates(template_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_authorization_projects_org ON authorization_projects(organization_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_section_instances_pack ON section_instances(pack_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_prompt_responses_section ON prompt_responses(section_instance_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_evidence_items_pack ON evidence_items(pack_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_pack ON tasks(pack_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pack_documents_pack ON pack_documents(pack_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_review_gates_section ON review_gates(section_instance_id)`);
  } finally {
    client.release();
  }
}

export async function syncAuthorizationTemplates() {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingTemplates = await client.query(
      `SELECT id, code, pack_type, type, COALESCE(pack_type, type, code) as type_key FROM pack_templates`
    );
    const templateMap = new Map<string, string>();
    for (const row of existingTemplates.rows) {
      if (row.type_key) {
        templateMap.set(row.type_key, row.id);
      }
      if (row.code) {
        templateMap.set(row.code, row.id);
      }
      if (row.pack_type) {
        templateMap.set(row.pack_type, row.id);
      }
      if (row.type) {
        templateMap.set(row.type, row.id);
      }
    }

    for (const template of PACK_TEMPLATES) {
      let templateId = templateMap.get(template.type);
      if (!templateId) {
        const existing = await client.query(
          `SELECT id FROM pack_templates WHERE code = $1 OR pack_type = $1 OR type = $1 LIMIT 1`,
          [template.type]
        );
        templateId = existing.rows[0]?.id;
      }
      if (!templateId) {
        const upsert = await client.query(
          `INSERT INTO pack_templates (code, name, description, pack_type, type)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (code)
           DO UPDATE SET name = EXCLUDED.name,
                         description = EXCLUDED.description,
                         pack_type = EXCLUDED.pack_type,
                         type = EXCLUDED.type
           RETURNING id`,
          [template.type, template.name, template.description, template.type, template.type]
        );
        templateId = upsert.rows[0]?.id;
        if (!templateId) {
          throw new Error(`Failed to upsert pack template ${template.type}`);
        }
        templateMap.set(template.type, templateId);
      } else {
        await client.query(
          `UPDATE pack_templates
           SET name = $2, description = $3, pack_type = $4, type = $4
           WHERE id = $1`,
          [templateId, template.name, template.description, template.type]
        );
      }

      const existingSections = await client.query(
        `SELECT id, section_key, code, title, name
         FROM section_templates
         WHERE template_id = $1 OR pack_template_id = $1`,
        [templateId]
      );
      const sectionMap = new Map<string, string>();
      for (const row of existingSections.rows) {
        const candidates = [row.section_key, row.code, row.title, row.name].filter(Boolean) as string[];
        for (const candidate of candidates) {
          const normalized = normalizeSectionKey(candidate);
          if (normalized) {
            sectionMap.set(normalized, row.id);
          }
        }
      }

      let displayOrder = 1;
      for (const section of template.sections) {
        const sectionKey = normalizeSectionKey(section.key);
        const titleKey = normalizeSectionKey(section.title);
        let sectionId = sectionMap.get(sectionKey) ?? sectionMap.get(titleKey);
        if (!sectionId) {
          sectionId = randomUUID();
          sectionMap.set(sectionKey, sectionId);
          await client.query(
            `INSERT INTO section_templates
              (id, template_id, pack_template_id, section_key, code, title, name, description, guidance_text,
               display_order, order_index, is_addon, addon_trigger)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              sectionId,
              templateId,
              templateId,
              section.key,
              section.key,
              section.title,
              section.title,
              section.description,
              section.description,
              displayOrder,
              displayOrder,
              Boolean(section.isAddon),
              section.addonTrigger ?? null,
            ]
          );
        } else {
          await client.query(
            `UPDATE section_templates
             SET template_id = $2,
                 pack_template_id = $2,
                 section_key = $3,
                 code = $3,
                 title = $4,
                 name = $4,
                 description = $5,
                 guidance_text = $5,
                 display_order = $6,
                 order_index = $6,
                 is_addon = $7,
                 addon_trigger = $8
             WHERE id = $1`,
            [
              sectionId,
              templateId,
              section.key,
              section.title,
              section.description,
              displayOrder,
              Boolean(section.isAddon),
              section.addonTrigger ?? null,
            ]
          );
        }

        const existingPrompts = await client.query(
          `SELECT id, prompt_key FROM prompts WHERE section_template_id = $1`,
          [sectionId]
        );
        const promptMap = new Map<string, string>();
        for (const row of existingPrompts.rows) {
          promptMap.set(row.prompt_key, row.id);
        }

        const prompts = section.prompts ?? [];
        let promptOrder = 1;
        for (const prompt of prompts) {
          const promptId = promptMap.get(prompt.key);
          if (!promptId) {
            await client.query(
              `INSERT INTO prompts
                (section_template_id, prompt_key, title, description, guidance, example_answer, input_type, options, required, weight, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                sectionId,
                prompt.key,
                prompt.title,
                null,
                prompt.guidance ?? null,
                prompt.exampleAnswer ?? null,
                prompt.inputType,
                null,
                prompt.required ?? true,
                prompt.weight ?? 1,
                promptOrder,
              ]
            );
          } else {
            await client.query(
              `UPDATE prompts
               SET title = $2,
                   description = $3,
                   guidance = $4,
                   example_answer = $5,
                   input_type = $6,
                   options = $7,
                   required = $8,
                   weight = $9,
                   display_order = $10
               WHERE id = $1`,
              [
                promptId,
                prompt.title,
                null,
                prompt.guidance ?? null,
                prompt.exampleAnswer ?? null,
                prompt.inputType,
                null,
                prompt.required ?? true,
                prompt.weight ?? 1,
                promptOrder,
              ]
            );
          }
          promptOrder += 1;
        }

        const existingEvidence = await client.query(
          `SELECT id, name FROM required_evidence WHERE section_template_id = $1`,
          [sectionId]
        );
        const evidenceMap = new Map<string, string>();
        for (const row of existingEvidence.rows) {
          evidenceMap.set(normalizeEvidenceName(row.name), row.id);
        }

        const evidence = section.evidence ?? [];
        let evidenceOrder = 1;
        for (const item of evidence) {
          const evidenceKey = normalizeEvidenceName(item.name);
          const evidenceId = evidenceMap.get(evidenceKey);
          if (!evidenceId) {
            await client.query(
              `INSERT INTO required_evidence
                (section_template_id, name, description, file_types, is_mandatory, display_order)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                sectionId,
                item.name,
                item.description ?? null,
                item.fileTypes ?? null,
                item.isMandatory ?? true,
                evidenceOrder,
              ]
            );
          } else {
            await client.query(
              `UPDATE required_evidence
               SET name = $2,
                   description = $3,
                   file_types = $4,
                   is_mandatory = $5,
                   display_order = $6
               WHERE id = $1`,
              [
                evidenceId,
                item.name,
                item.description ?? null,
                item.fileTypes ?? null,
                item.isMandatory ?? true,
                evidenceOrder,
              ]
            );
          }
          evidenceOrder += 1;
        }

        displayOrder += 1;
      }
    }

    await client.query("COMMIT");
    templatesSynced = true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureAuthorizationTemplates() {
  if (templatesSynced) return;
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const templateResult = await client.query(`SELECT COUNT(*)::int as count FROM pack_templates`);
    const sectionResult = await client.query(`SELECT COUNT(*)::int as count FROM section_templates`);
    const templateCount = Number(templateResult.rows[0]?.count || 0);
    const sectionCount = Number(sectionResult.rows[0]?.count || 0);
    if (templateCount >= EXPECTED_TEMPLATE_COUNT && sectionCount >= EXPECTED_SECTION_COUNT) {
      templatesSynced = true;
      return;
    }
  } finally {
    client.release();
  }
  await syncAuthorizationTemplates();
}

export async function syncPermissionEcosystems() {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const ecosystem of PERMISSION_ECOSYSTEMS) {
      const template = PACK_TEMPLATES.find((item) => item.type === ecosystem.packTemplateType);
      const sectionKeys = template ? template.sections.map((section) => section.key) : [];
      await client.query(
        `INSERT INTO permission_ecosystems
          (permission_code, name, description, pack_template_type, section_keys, policy_templates, training_requirements, smcr_roles, typical_timeline_weeks)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9)
         ON CONFLICT (permission_code)
         DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           pack_template_type = EXCLUDED.pack_template_type,
           section_keys = EXCLUDED.section_keys,
           policy_templates = EXCLUDED.policy_templates,
           training_requirements = EXCLUDED.training_requirements,
           smcr_roles = EXCLUDED.smcr_roles,
           typical_timeline_weeks = EXCLUDED.typical_timeline_weeks`,
        [
          ecosystem.code,
          ecosystem.name,
          ecosystem.description,
          ecosystem.packTemplateType,
          JSON.stringify(sectionKeys),
          JSON.stringify(ecosystem.policyTemplates),
          JSON.stringify(ecosystem.trainingRequirements),
          JSON.stringify(ecosystem.smcrRoles),
          ecosystem.typicalTimelineWeeks,
        ]
      );
    }
    await client.query("COMMIT");
    ecosystemsSynced = true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function ensurePermissionEcosystems() {
  if (ecosystemsSynced) return;
  await ensureAuthorizationTemplates();
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT COUNT(*)::int as count FROM permission_ecosystems`);
    const count = Number(result.rows[0]?.count || 0);
    if (count >= EXPECTED_ECOSYSTEM_COUNT) {
      ecosystemsSynced = true;
      return;
    }
  } finally {
    client.release();
  }
  await syncPermissionEcosystems();
}

export async function getPermissionEcosystems(): Promise<PermissionEcosystemRow[]> {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, permission_code, name, description, pack_template_type,
              section_keys, policy_templates, training_requirements, smcr_roles, typical_timeline_weeks
       FROM permission_ecosystems
       ORDER BY name ASC`
    );
    return result.rows.map((row) => ({
      ...row,
      section_keys: coerceJsonArray<string>(row.section_keys),
      policy_templates: coerceJsonArray<string>(row.policy_templates),
      training_requirements: coerceJsonArray<string>(row.training_requirements),
      smcr_roles: coerceJsonArray<string>(row.smcr_roles),
    }));
  } finally {
    client.release();
  }
}

export async function createAuthorizationProject(input: {
  organizationId: string;
  permissionCode: PermissionCode;
  name: string;
  targetSubmissionDate?: string | null;
  assessmentData?: AssessmentData;
}) {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  try {
    const ecosystemResult = await client.query(
      `SELECT permission_code, name, pack_template_type, typical_timeline_weeks,
              policy_templates, training_requirements, smcr_roles
       FROM permission_ecosystems
       WHERE permission_code = $1
       LIMIT 1`,
      [input.permissionCode]
    );
    const ecosystem = ecosystemResult.rows[0];
    if (!ecosystem) {
      throw new Error("Permission ecosystem not found");
    }

    const pack = await createPack({
      organizationId: input.organizationId,
      templateType: ecosystem.pack_template_type as PackType,
      name: input.name,
      targetSubmissionDate: input.targetSubmissionDate ?? null,
    });

    const projectId = randomUUID();
    await client.query(
      `INSERT INTO authorization_projects
        (id, organization_id, name, permission_code, pack_id, target_submission_date, assessment_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        projectId,
        input.organizationId,
        input.name,
        input.permissionCode,
        pack.id,
        input.targetSubmissionDate ?? null,
        input.assessmentData ?? {},
      ]
    );

    return {
      id: projectId,
      name: input.name,
      permission_code: input.permissionCode,
      pack_id: pack.id,
      status: "assessment",
      ecosystem: {
        name: ecosystem.name,
        typical_timeline_weeks: ecosystem.typical_timeline_weeks,
        policy_templates: coerceJsonArray<string>(ecosystem.policy_templates),
        training_requirements: coerceJsonArray<string>(ecosystem.training_requirements),
        smcr_roles: coerceJsonArray<string>(ecosystem.smcr_roles),
      },
    };
  } finally {
    client.release();
  }
}

export async function getAuthorizationProjects(
  organizationId: string,
  options?: { limit?: number; offset?: number }
) {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  const limit = Math.max(1, options?.limit ?? 50);
  const offset = Math.max(0, options?.offset ?? 0);
  try {
    const totalResult = await client.query(
      `SELECT COUNT(*)::int as total
       FROM authorization_projects ap
       WHERE ap.organization_id = $1
         AND ${softDeleteClause("ap")}`,
      [organizationId]
    );

    const result = await client.query(
      `SELECT ap.id,
              ap.name,
              ap.permission_code,
              ap.status,
              ap.target_submission_date,
              ap.created_at,
              ap.updated_at,
              ap.pack_id,
              ap.assessment_data,
              pe.name as permission_name,
              pe.description as permission_description,
              pe.typical_timeline_weeks,
              pe.policy_templates,
              pe.training_requirements,
              pe.smcr_roles,
              p.name as pack_name,
              p.status as pack_status,
              p.target_submission_date as pack_target_submission_date,
              COALESCE(pt.pack_type, pt.type, pt.code) as pack_template_type,
              pt.name as pack_template_name
       FROM authorization_projects ap
       LEFT JOIN permission_ecosystems pe ON pe.permission_code = ap.permission_code
       LEFT JOIN packs p ON p.id = ap.pack_id AND ${softDeleteClause("p")}
       LEFT JOIN pack_templates pt ON pt.id = p.template_id
       WHERE ap.organization_id = $1
         AND ${softDeleteClause("ap")}
       ORDER BY ap.created_at DESC
       LIMIT $2 OFFSET $3`,
      [organizationId, limit, offset]
    );

    const packIds = Array.from(
      new Set(result.rows.map((row) => row.pack_id).filter((packId): packId is string => Boolean(packId)))
    );
    const readinessByPack = new Map<
      string,
      { overall: number; narrative: number; evidence: number; review: number }
    >();

    if (packIds.length) {
      const [sectionCounts, narrativeRes, evidenceRes, reviewRes, opinionRes] = await Promise.all([
        client.query(
          `SELECT pack_id, COUNT(*)::int as count
           FROM section_instances
           WHERE pack_id = ANY($1::uuid[])
           GROUP BY pack_id`,
          [packIds]
        ),
        client.query(
          `WITH prompt_counts AS (
             SELECT si.pack_id,
                    si.id AS section_instance_id,
                    COUNT(p.id) FILTER (WHERE p.required IS TRUE) AS required_prompts,
                    COUNT(pr.id) FILTER (WHERE pr.value IS NOT NULL AND pr.value <> '') AS answered_prompts
             FROM section_instances si
             JOIN section_templates st ON st.id = si.section_template_id
             LEFT JOIN prompts p ON p.section_template_id = st.id
             LEFT JOIN prompt_responses pr ON pr.section_instance_id = si.id AND pr.prompt_id = p.id
             WHERE si.pack_id = ANY($1::uuid[])
             GROUP BY si.pack_id, si.id
           )
           SELECT pack_id,
                  AVG(
                    CASE
                      WHEN required_prompts = 0 THEN 0
                      ELSE (answered_prompts::decimal / required_prompts::decimal) * 100
                    END
                  ) AS narrative
           FROM prompt_counts
           GROUP BY pack_id`,
          [packIds]
        ),
        client.query(
          `WITH evidence_counts AS (
             SELECT si.pack_id,
                    si.id AS section_instance_id,
                    COUNT(ei.id) FILTER (WHERE ei.status IN ('uploaded', 'approved')) AS uploaded,
                    COUNT(ei.id) AS total
             FROM section_instances si
             LEFT JOIN evidence_items ei ON ei.section_instance_id = si.id AND ${softDeleteClause("ei")}
             WHERE si.pack_id = ANY($1::uuid[])
             GROUP BY si.pack_id, si.id
           )
           SELECT pack_id,
                  AVG(
                    CASE
                      WHEN total = 0 THEN 0
                      ELSE (uploaded::decimal / total::decimal) * 100
                    END
                  ) AS evidence
           FROM evidence_counts
           GROUP BY pack_id`,
          [packIds]
        ),
        client.query(
          `WITH review_counts AS (
             SELECT si.pack_id,
                    si.id AS section_instance_id,
                    COUNT(rg.id) FILTER (WHERE rg.state = 'approved') AS approved,
                    COUNT(rg.id) AS total
             FROM section_instances si
             LEFT JOIN review_gates rg ON rg.section_instance_id = si.id
             WHERE si.pack_id = ANY($1::uuid[])
             GROUP BY si.pack_id, si.id
           )
           SELECT pack_id,
                  AVG(
                    CASE
                      WHEN total = 0 THEN 0
                      ELSE (approved::decimal / total::decimal) * 100
                    END
                  ) AS review
           FROM review_counts
           GROUP BY pack_id`,
          [packIds]
        ),
        client.query(
          `SELECT pack_id,
                  COUNT(*) FILTER (
                    WHERE section_code = 'perimeter-opinion'
                      AND storage_key IS NOT NULL
                      AND storage_key <> ''
                  ) AS opinion_count
           FROM pack_documents
           WHERE pack_id = ANY($1::uuid[])
             AND ${softDeleteClause("pack_documents")}
           GROUP BY pack_id`,
          [packIds]
        ),
      ]);

      const sectionCountMap = new Map(
        sectionCounts.rows.map((row) => [row.pack_id, Number(row.count || 0)])
      );
      const narrativeMap = new Map(
        narrativeRes.rows.map((row) => [row.pack_id, Number(row.narrative || 0)])
      );
      const evidenceMap = new Map(
        evidenceRes.rows.map((row) => [row.pack_id, Number(row.evidence || 0)])
      );
      const reviewMap = new Map(
        reviewRes.rows.map((row) => [row.pack_id, Number(row.review || 0)])
      );
      const opinionMap = new Map(
        opinionRes.rows.map((row) => [row.pack_id, Number(row.opinion_count || 0) > 0])
      );

      result.rows.forEach((row) => {
        if (!row.pack_id || readinessByPack.has(row.pack_id)) return;
        const assessmentData = coerceJsonObject<ProjectAssessmentData>(row.assessment_data);
        const responses = assessmentData?.businessPlanProfile?.responses ?? {};
        const permission = isProfilePermissionCode(row.permission_code)
          ? row.permission_code
          : row.permission_code?.startsWith("payments")
          ? "payments"
          : null;
        const hasResponses = Object.keys(responses).length > 0;
        const profileCompletion =
          permission && hasResponses ? buildProfileInsights(permission, responses).completionPercent : 0;
        const opinionCompletion = opinionMap.get(row.pack_id) ? 100 : 0;

        const baseNarrative = Math.round(narrativeMap.get(row.pack_id) ?? 0);
        const baseEvidence = Math.round(evidenceMap.get(row.pack_id) ?? 0);
        const baseReview = Math.round(reviewMap.get(row.pack_id) ?? 0);

        const narrative = Math.max(baseNarrative, profileCompletion, opinionCompletion);
        const review = Math.max(baseReview, opinionCompletion);
        const evidence = baseEvidence;
        const hasSections = (sectionCountMap.get(row.pack_id) ?? 0) > 0;
        const overall = hasSections
          ? Math.round(narrative * 0.4 + evidence * 0.4 + review * 0.2)
          : Math.max(profileCompletion, opinionCompletion);

        readinessByPack.set(row.pack_id, {
          overall,
          narrative: Math.round(narrative),
          evidence: Math.round(evidence),
          review: Math.round(review),
        });
      });
    }

    const projects = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      permission_code: row.permission_code,
      status: row.status,
      target_submission_date: row.target_submission_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
      pack_id: row.pack_id,
      permission_name: row.permission_name,
      permission_description: row.permission_description,
      typical_timeline_weeks: row.typical_timeline_weeks,
      policy_templates: coerceJsonArray<string>(row.policy_templates),
      training_requirements: coerceJsonArray<string>(row.training_requirements),
      smcr_roles: coerceJsonArray<string>(row.smcr_roles),
      pack_name: row.pack_name,
      pack_status: row.pack_status,
      pack_target_submission_date: row.pack_target_submission_date,
      pack_template_type: row.pack_template_type,
      pack_template_name: row.pack_template_name,
      readiness: row.pack_id ? readinessByPack.get(row.pack_id) ?? null : null,
    }));
    return {
      projects,
      total: totalResult.rows[0]?.total ?? 0,
    };
  } finally {
    client.release();
  }
}

export async function getAuthorizationProject(projectId: string) {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ap.id,
              ap.organization_id,
              ap.name,
              ap.permission_code,
              ap.status,
              ap.target_submission_date,
              ap.created_at,
              ap.updated_at,
              ap.pack_id,
              ap.assessment_data,
              ap.project_plan,
              pe.name as permission_name,
              pe.description as permission_description,
              pe.typical_timeline_weeks,
              pe.section_keys,
              pe.policy_templates,
              pe.training_requirements,
              pe.smcr_roles,
              p.name as pack_name,
              p.status as pack_status,
              COALESCE(pt.pack_type, pt.type, pt.code) as pack_template_type,
              pt.name as pack_template_name
       FROM authorization_projects ap
       LEFT JOIN permission_ecosystems pe ON pe.permission_code = ap.permission_code
       LEFT JOIN packs p ON p.id = ap.pack_id AND ${softDeleteClause("p")}
       LEFT JOIN pack_templates pt ON pt.id = p.template_id
       WHERE ap.id = $1
         AND ${softDeleteClause("ap")}
       LIMIT 1`,
      [projectId]
    );
    const row = result.rows[0];
    if (!row) return null;

    const sections = row.pack_id ? await getSections(row.pack_id) : [];
    let readiness = row.pack_id ? buildReadinessFromSections(sections) : null;
    if (row.pack_id) {
      const assessmentData = coerceJsonObject<ProjectAssessmentData>(row.assessment_data);
      const responses = assessmentData?.businessPlanProfile?.responses ?? {};
      const permission = isProfilePermissionCode(row.permission_code)
        ? row.permission_code
        : row.permission_code?.startsWith("payments")
        ? "payments"
        : null;
      const hasResponses = Object.keys(responses).length > 0;
      const profileCompletion =
        permission && hasResponses ? buildProfileInsights(permission, responses).completionPercent : 0;
      const documents = await getPackDocuments(row.pack_id);
      const hasOpinionPack = documents.some(
        (doc) => doc.section_code === "perimeter-opinion" && doc.storage_key
      );
      const opinionCompletion = hasOpinionPack ? 100 : 0;
      const baseNarrative = readiness?.narrative ?? 0;
      const baseEvidence = readiness?.evidence ?? 0;
      const baseReview = readiness?.review ?? 0;
      const narrative = Math.max(baseNarrative, profileCompletion, opinionCompletion);
      const review = Math.max(baseReview, opinionCompletion);
      const evidence = baseEvidence;
      const overall = sections.length
        ? Math.round(narrative * 0.4 + evidence * 0.4 + review * 0.2)
        : Math.max(profileCompletion, opinionCompletion);
      readiness = {
        overall,
        narrative,
        evidence,
        review,
      };
    }

    return {
      ...row,
      section_keys: coerceJsonArray<string>(row.section_keys),
      policy_templates: coerceJsonArray<string>(row.policy_templates),
      training_requirements: coerceJsonArray<string>(row.training_requirements),
      smcr_roles: coerceJsonArray<string>(row.smcr_roles),
      assessment_data: coerceJsonObject<Record<string, unknown>>(row.assessment_data),
      project_plan: coerceJsonObject<Record<string, unknown>>(row.project_plan),
      readiness,
      sections,
    };
  } finally {
    client.release();
  }
}

export async function deleteAuthorizationProject(projectId: string, deletedBy?: string | null) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const projectResult = await client.query(
      `SELECT pack_id
       FROM authorization_projects
       WHERE id = $1 AND ${softDeleteClause("authorization_projects")}
       LIMIT 1`,
      [projectId]
    );
    if (projectResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    const packId = projectResult.rows[0]?.pack_id as string | null;
    if (packId) {
      await client.query(
        `UPDATE authorization_projects
         SET deleted_at = NOW(), deleted_by = $2
         WHERE pack_id = $1 AND ${softDeleteClause("authorization_projects")}`,
        [packId, deletedBy ?? null]
      );
      await client.query(
        `UPDATE packs
         SET deleted_at = NOW(), deleted_by = $2
         WHERE id = $1 AND ${softDeleteClause("packs")}`,
        [packId, deletedBy ?? null]
      );
    } else {
      await client.query(
        `UPDATE authorization_projects
         SET deleted_at = NOW(), deleted_by = $2
         WHERE id = $1 AND ${softDeleteClause("authorization_projects")}`,
        [projectId, deletedBy ?? null]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

type ReadinessStatus = "missing" | "partial" | "complete";
type TrainingStatus = "missing" | "in-progress" | "complete";
type SmcrStatus = "unassigned" | "assigned";

interface AssessmentData {
  basics?: Record<string, string | number | null>;
  readiness?: Record<string, ReadinessStatus>;
  policies?: Record<string, ReadinessStatus>;
  training?: Record<string, TrainingStatus>;
  smcr?: Record<string, SmcrStatus>;
  businessPlanProfile?: BusinessPlanProfile;
  questionResponses?: Record<string, QuestionResponse>;
  meta?: Record<string, unknown>;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: "pending" | "in-progress" | "blocked" | "complete";
  owner?: string;
  startWeek: number;
  durationWeeks: number;
  endWeek: number;
  dueDate: string;
  dependencies: string[];
}

interface ProjectPlan {
  generatedAt: string;
  startDate: string;
  totalWeeks: number;
  milestones: ProjectMilestone[];
}

const readinessMilestoneMap: Array<{
  key: string;
  title: string;
  description: string;
  phase: string;
  durationWeeks: number;
}> = [
  {
    key: "businessPlanDraft",
    title: "Draft the business plan narrative",
    description: "Capture the gold-standard narrative in the pack workspace.",
    phase: "Narrative & Business Plan",
    durationWeeks: 3,
  },
  {
    key: "financialModel",
    title: "Finalize financial model & projections",
    description: "Complete capital, revenue, and stress testing assumptions.",
    phase: "Narrative & Business Plan",
    durationWeeks: 2,
  },
  {
    key: "technologyStack",
    title: "Confirm technology stack readiness",
    description: "Document architecture, vendors, and operational resilience controls.",
    phase: "Narrative & Business Plan",
    durationWeeks: 2,
  },
  {
    key: "safeguardingSetup",
    title: "Safeguarding setup & reconciliation",
    description: "Confirm safeguarding accounts and reconciliation cadence.",
    phase: "Policies & Evidence",
    durationWeeks: 2,
  },
  {
    key: "amlFramework",
    title: "AML/CTF framework readiness",
    description: "Document AML controls, monitoring, and reporting.",
    phase: "Policies & Evidence",
    durationWeeks: 2,
  },
  {
    key: "riskFramework",
    title: "Risk & compliance framework",
    description: "Finalize risk appetite, monitoring, and reporting cadence.",
    phase: "Governance & SMCR",
    durationWeeks: 2,
  },
  {
    key: "governancePack",
    title: "Governance and board pack",
    description: "Finalize governance documentation, committee terms, and MI pack.",
    phase: "Governance & SMCR",
    durationWeeks: 2,
  },
];

const normalizeAssessment = (
  assessment: AssessmentData,
  ecosystem: {
    policy_templates: string[];
    training_requirements: string[];
    smcr_roles: string[];
  }
) => {
  const policies: Record<string, ReadinessStatus> = { ...(assessment.policies ?? {}) };
  for (const policy of ecosystem.policy_templates) {
    if (!policies[policy]) policies[policy] = "missing";
  }

  const training: Record<string, TrainingStatus> = { ...(assessment.training ?? {}) };
  for (const trainingItem of ecosystem.training_requirements) {
    if (!training[trainingItem]) training[trainingItem] = "missing";
  }

  const smcr: Record<string, SmcrStatus> = { ...(assessment.smcr ?? {}) };
  for (const role of ecosystem.smcr_roles) {
    if (!smcr[role]) smcr[role] = "unassigned";
  }

  return {
    ...assessment,
    policies,
    training,
    smcr,
  } satisfies AssessmentData;
};

const calculateAssessmentCompletion = (assessment: AssessmentData, permissionCode?: string | null) => {
  const basics = assessment.basics ?? {};
  const basicKeys = [
    "legalName",
    "priorFcaApplications",
    "firmType",
    "incorporationDate",
    "incorporationPlace",
    "registeredNumberExists",
    "financialYearEnd",
    "registeredOfficeSameAsHeadOffice",
    "primaryJurisdiction",
    "primaryContact",
    "contactEmail",
    "firmStage",
    "regulatedActivities",
    "headcount",
    "website",
    "previouslyRegulated",
    "usedProfessionalAdviser",
    "pspType",
    "paymentServicesActivities",
    "currentlyProvidingPIS",
    "currentlyProvidingAIS",
  ];

  if (basics.registeredNumberExists === "yes") {
    basicKeys.push("companyNumber");
  }

  if (basics.registeredOfficeSameAsHeadOffice === "no") {
    basicKeys.push(
      "headOfficeAddressLine1",
      "headOfficeCity",
      "headOfficePostcode",
      "headOfficePhone",
      "headOfficeEmail"
    );
  }

  if (basics.usedProfessionalAdviser === "yes") {
    basicKeys.push("adviserFirmName", "adviserCopyCorrespondence", "adviserContactDetails");
  }

  if (basics.currentlyProvidingPIS === "yes") {
    basicKeys.push("pisStartDate");
  }

  if (basics.currentlyProvidingAIS === "yes") {
    basicKeys.push("aisStartDate");
  }

  const basicsCompleted = basicKeys.filter((key) => {
    const value = basics[key];
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }).length;

  const readiness = Object.values(assessment.readiness ?? {});
  const readinessCompleted = readiness.filter((value) => value === "complete").length;

  const policies = Object.values(assessment.policies ?? {});
  const policiesCompleted = policies.filter((value) => value === "complete").length;

  const training = Object.values(assessment.training ?? {});
  const trainingCompleted = training.filter((value) => value === "complete").length;

  const smcr = Object.values(assessment.smcr ?? {});
  const smcrCompleted = smcr.filter((value) => value === "assigned").length;

  // Include question bank progress
  const questionContext = buildQuestionContext(
    { basics, questionResponses: assessment.questionResponses, meta: assessment.meta },
    permissionCode
  );
  const questionBankTotal = questionContext.requiredCount;
  const questionBankCompleted = questionContext.answeredCount;

  const total =
    basicKeys.length + readiness.length + policies.length + training.length + smcr.length + questionBankTotal;
  const completed =
    basicsCompleted + readinessCompleted + policiesCompleted + trainingCompleted + smcrCompleted + questionBankCompleted;

  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

const buildProjectPlan = (input: {
  assessment: AssessmentData;
  ecosystem: {
    policy_templates: string[];
    training_requirements: string[];
    smcr_roles: string[];
    typical_timeline_weeks: number | null;
  };
  sections: Array<{ title: string; narrativeCompletion: number; evidenceCompletion: number }>;
}) => {
  const { assessment, ecosystem, sections } = input;
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const milestones: ProjectMilestone[] = [];

  let weekCursor = 1;
  const addWeeks = (base: Date, weeks: number) => {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + weeks * 7);
    return date;
  };
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  let previousId: string | null = null;
  const pushMilestone = (inputMilestone: {
    title: string;
    description: string;
    phase: string;
    durationWeeks?: number;
  }) => {
    const durationWeeks = inputMilestone.durationWeeks ?? 1;
    const startWeek = weekCursor;
    const endWeek = startWeek + durationWeeks - 1;
    const dueDate = formatDate(addWeeks(startDate, endWeek));
    const milestoneId = randomUUID();
    milestones.push({
      id: milestoneId,
      title: inputMilestone.title,
      description: inputMilestone.description,
      phase: inputMilestone.phase,
      status: "pending",
      startWeek,
      durationWeeks,
      endWeek,
      dueDate,
      dependencies: previousId ? [previousId] : [],
    });
    previousId = milestoneId;
    weekCursor = endWeek + 1;
  };

  pushMilestone({
    title: "Complete firm assessment",
    description: "Confirm current-state readiness and evidence baseline.",
    phase: "Assessment & Scoping",
    durationWeeks: 1,
  });
  pushMilestone({
    title: "Confirm FCA permission scope",
    description: "Align permissions, activity boundaries, and submission strategy.",
    phase: "Assessment & Scoping",
    durationWeeks: 1,
  });

  const incompleteSections = sections.filter((section) => section.narrativeCompletion < 100);
  const missingEvidenceSections = sections.filter((section) => section.evidenceCompletion < 100);

  pushMilestone({
    title: "Draft business plan narrative",
    description: "Complete the narrative spine across all required sections.",
    phase: "Narrative & Business Plan",
    durationWeeks: 3,
  });

  if (incompleteSections.length) {
    pushMilestone({
      title: `Complete ${incompleteSections.length} narrative sections`,
      description: "Fill remaining narrative gaps and validate narrative consistency.",
      phase: "Narrative & Business Plan",
      durationWeeks: Math.min(4, Math.max(1, Math.ceil(incompleteSections.length / 6))),
    });
  }

  for (const readinessItem of readinessMilestoneMap) {
    const status = assessment.readiness?.[readinessItem.key];
    if (status && status === "complete") continue;
    pushMilestone({
      title: readinessItem.title,
      description: readinessItem.description,
      phase: readinessItem.phase,
      durationWeeks: readinessItem.durationWeeks,
    });
  }

  const policyGaps = Object.entries(assessment.policies ?? {}).filter(([, status]) => status !== "complete");
  if (policyGaps.length) {
    for (const [policyName] of policyGaps) {
      pushMilestone({
        title: `Policy suite: ${policyName}`,
        description: "Draft, review, and approve the required policy document.",
        phase: "Policies & Evidence",
        durationWeeks: 1,
      });
    }
  }

  pushMilestone({
    title: "Evidence checklist & annex mapping",
    description: "Upload evidence, assign annex numbers, and confirm completeness.",
    phase: "Policies & Evidence",
    durationWeeks: 2,
  });

  if (missingEvidenceSections.length) {
    pushMilestone({
      title: `Resolve ${missingEvidenceSections.length} evidence gaps`,
      description: "Collect missing evidence items and confirm review-ready status.",
      phase: "Policies & Evidence",
      durationWeeks: Math.min(3, Math.max(1, Math.ceil(missingEvidenceSections.length / 8))),
    });
  }

  const trainingGaps = Object.entries(assessment.training ?? {}).filter(([, status]) => status !== "complete");
  for (const [trainingName] of trainingGaps) {
    pushMilestone({
      title: `Training rollout: ${trainingName}`,
      description: "Complete training requirements and evidence staff completion.",
      phase: "Governance & SMCR",
      durationWeeks: 1,
    });
  }

  const smcrGaps = Object.entries(assessment.smcr ?? {}).filter(([, status]) => status !== "assigned");
  for (const [roleName] of smcrGaps) {
    pushMilestone({
      title: `Assign SMCR role: ${roleName}`,
      description: "Confirm role holder, responsibilities, and approval workflow.",
      phase: "Governance & SMCR",
      durationWeeks: 1,
    });
  }

  pushMilestone({
    title: "Internal QA review",
    description: "Run consultant QA review across narrative, evidence, and governance.",
    phase: "Review & Submission",
    durationWeeks: 2,
  });
  pushMilestone({
    title: "Final pack sign-off",
    description: "Finalize the submission pack and confirm FCA readiness.",
    phase: "Review & Submission",
    durationWeeks: 1,
  });

  const typicalWeeks = ecosystem.typical_timeline_weeks ?? 12;
  const totalWeeks = Math.max(typicalWeeks, weekCursor - 1);

  return {
    generatedAt: new Date().toISOString(),
    startDate: formatDate(startDate),
    totalWeeks,
    milestones,
  } satisfies ProjectPlan;
};

export async function saveAuthorizationAssessment(projectId: string, assessmentData: AssessmentData) {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  try {
    const projectResult = await client.query(
      `SELECT permission_code FROM authorization_projects WHERE id = $1 LIMIT 1`,
      [projectId]
    );
    const permissionCode = projectResult.rows[0]?.permission_code as PermissionCode | undefined;
    const ecosystemResult = await client.query(
      `SELECT policy_templates, training_requirements, smcr_roles
       FROM permission_ecosystems
       WHERE permission_code = $1
       LIMIT 1`,
      [permissionCode]
    );
    const ecosystem = ecosystemResult.rows[0] ?? {
      policy_templates: [],
      training_requirements: [],
      smcr_roles: [],
    };
    const normalized = normalizeAssessment(assessmentData, {
      policy_templates: coerceJsonArray<string>(ecosystem.policy_templates),
      training_requirements: coerceJsonArray<string>(ecosystem.training_requirements),
      smcr_roles: coerceJsonArray<string>(ecosystem.smcr_roles),
    });
    const completion = calculateAssessmentCompletion(normalized, permissionCode);
    const nextAssessment = {
      ...normalized,
      meta: {
        ...(normalized.meta ?? {}),
        completion,
        updatedAt: new Date().toISOString(),
      },
    };

    await client.query(
      `UPDATE authorization_projects
       SET assessment_data = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [projectId, nextAssessment]
    );

    return { completion, assessment: nextAssessment };
  } finally {
    client.release();
  }
}

export async function saveAuthorizationBusinessPlanProfile(projectId: string, profile: BusinessPlanProfile) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT assessment_data FROM authorization_projects WHERE id = $1 LIMIT 1`,
      [projectId]
    );
    if (!result.rows.length) {
      return null;
    }

    const assessmentData = coerceJsonObject<Record<string, unknown>>(result.rows[0].assessment_data);
    const nextProfile: BusinessPlanProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    const nextAssessment = {
      ...assessmentData,
      businessPlanProfile: nextProfile,
    };

    await client.query(
      `UPDATE authorization_projects
       SET assessment_data = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [projectId, nextAssessment]
    );

    return nextProfile;
  } finally {
    client.release();
  }
}

export async function generateAuthorizationProjectPlan(projectId: string) {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  try {
    const projectResult = await client.query(
      `SELECT ap.id,
              ap.permission_code,
              ap.assessment_data,
              ap.pack_id,
              pe.policy_templates,
              pe.training_requirements,
              pe.smcr_roles,
              pe.typical_timeline_weeks
       FROM authorization_projects ap
       LEFT JOIN permission_ecosystems pe ON pe.permission_code = ap.permission_code
       WHERE ap.id = $1
       LIMIT 1`,
      [projectId]
    );
    const project = projectResult.rows[0];
    if (!project) {
      throw new Error("Project not found");
    }

    const assessment = normalizeAssessment(
      coerceJsonObject<AssessmentData>(project.assessment_data),
      {
        policy_templates: coerceJsonArray<string>(project.policy_templates),
        training_requirements: coerceJsonArray<string>(project.training_requirements),
        smcr_roles: coerceJsonArray<string>(project.smcr_roles),
      }
    );

    const sections = project.pack_id ? await getSections(project.pack_id) : [];

    const plan = buildProjectPlan({
      assessment,
      ecosystem: {
        policy_templates: coerceJsonArray<string>(project.policy_templates),
        training_requirements: coerceJsonArray<string>(project.training_requirements),
        smcr_roles: coerceJsonArray<string>(project.smcr_roles),
        typical_timeline_weeks: project.typical_timeline_weeks,
      },
      sections: sections.map((section) => ({
        title: section.title,
        narrativeCompletion: section.narrativeCompletion,
        evidenceCompletion: section.evidenceCompletion,
      })),
    });

    await client.query(
      `UPDATE authorization_projects
       SET project_plan = $2,
           status = 'planning',
           updated_at = NOW()
       WHERE id = $1`,
      [projectId, plan]
    );

    return plan;
  } finally {
    client.release();
  }
}

export async function updateAuthorizationProjectPlan(projectId: string, plan: ProjectPlan) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE authorization_projects
       SET project_plan = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [projectId, plan]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

export async function syncPackFromTemplate(packId: string) {
  await syncAuthorizationTemplates();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const packResult = await client.query(
      `SELECT id, template_id
       FROM packs
       WHERE id = $1 AND ${softDeleteClause("packs")}
       LIMIT 1`,
      [packId]
    );
    const pack = packResult.rows[0];
    if (!pack) {
      throw new Error("Pack not found");
    }

    const templateSections = await client.query(
      `SELECT id, section_key, title, display_order
       FROM section_templates
       WHERE template_id = $1
       ORDER BY display_order ASC`,
      [pack.template_id]
    );

    const existingSections = await client.query(
      `SELECT id, section_template_id FROM section_instances WHERE pack_id = $1`,
      [packId]
    );
    const sectionInstanceMap = new Map<string, string>();
    for (const row of existingSections.rows) {
      sectionInstanceMap.set(row.section_template_id, row.id);
    }

    await client.query(
      `UPDATE section_instances si
       SET section_key = st.section_key,
           title = st.title,
           display_order = st.display_order
       FROM section_templates st
       WHERE si.section_template_id = st.id AND si.pack_id = $1`,
      [packId]
    );

    let addedSections = 0;
    for (const section of templateSections.rows) {
      if (sectionInstanceMap.has(section.id)) continue;
      const instanceId = randomUUID();
      await client.query(
        `INSERT INTO section_instances
          (id, pack_id, section_template_id, section_key, title, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [instanceId, packId, section.id, section.section_key, section.title, section.display_order]
      );
      sectionInstanceMap.set(section.id, instanceId);
      addedSections += 1;

      await client.query(
        `INSERT INTO review_gates (section_instance_id, stage, state, reviewer_role)
         VALUES ($1, $2, $3, $4)`,
        [instanceId, "client-review", "pending", "client"]
      );
      await client.query(
        `INSERT INTO review_gates (section_instance_id, stage, state, reviewer_role)
         VALUES ($1, $2, $3, $4)`,
        [instanceId, "consultant-review", "pending", "consultant"]
      );
      await client.query(
        `INSERT INTO tasks (pack_id, section_instance_id, title, status, source)
         VALUES ($1, $2, $3, $4, $5)`,
        [packId, instanceId, `Draft narrative for ${section.title}`, "pending", "auto-prompt"]
      );
    }

    const templateSectionIds = templateSections.rows.map((row) => row.id);
    if (templateSectionIds.length === 0) {
      await client.query("COMMIT");
      return { packId, addedSections, addedEvidence: 0 };
    }

    const requiredEvidence = await client.query(
      `SELECT id, section_template_id, name, description
       FROM required_evidence
       WHERE section_template_id = ANY($1::uuid[])
       ORDER BY section_template_id, display_order`,
      [templateSectionIds]
    );

    const existingEvidence = await client.query(
      `SELECT required_evidence_id FROM evidence_items WHERE pack_id = $1`,
      [packId]
    );
    const existingEvidenceSet = new Set(existingEvidence.rows.map((row) => row.required_evidence_id));

    const existingAnnex = await client.query(`SELECT annex_number FROM evidence_items WHERE pack_id = $1`, [packId]);
    let maxAnnex = 0;
    for (const row of existingAnnex.rows) {
      maxAnnex = Math.max(maxAnnex, parseAnnexNumber(row.annex_number));
    }

    const evidenceTasks = await client.query(
      `SELECT title, section_instance_id FROM tasks WHERE pack_id = $1 AND source = 'auto-evidence'`,
      [packId]
    );
    const taskSet = new Set(
      evidenceTasks.rows.map((row) => `${row.section_instance_id}::${row.title}`)
    );

    let addedEvidence = 0;
    for (const item of requiredEvidence.rows) {
      if (existingEvidenceSet.has(item.id)) continue;
      const sectionInstanceId = sectionInstanceMap.get(item.section_template_id);
      if (!sectionInstanceId) continue;
      maxAnnex += 1;
      const annexNumber = `Annex-${String(maxAnnex).padStart(3, "0")}`;
      await client.query(
        `INSERT INTO evidence_items
          (pack_id, section_instance_id, required_evidence_id, name, description, annex_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [packId, sectionInstanceId, item.id, item.name, item.description ?? null, annexNumber]
      );
      addedEvidence += 1;

      const taskTitle = `Upload evidence: ${item.name}`;
      const taskKey = `${sectionInstanceId}::${taskTitle}`;
      if (!taskSet.has(taskKey)) {
        await client.query(
          `INSERT INTO tasks (pack_id, section_instance_id, title, status, source)
           VALUES ($1, $2, $3, $4, $5)`,
          [packId, sectionInstanceId, taskTitle, "pending", "auto-evidence"]
        );
        taskSet.add(taskKey);
      }
    }

    await client.query("COMMIT");
    return { packId, addedSections, addedEvidence };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function resetAuthorizationPackData() {
  templatesSynced = false;
  ecosystemsSynced = false;
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      TRUNCATE TABLE
        activity_log,
        review_gates,
        tasks,
        pack_documents,
        evidence_versions,
        evidence_items,
        prompt_responses,
        section_instances,
        authorization_projects,
        packs,
        required_evidence,
        prompts,
        section_templates,
        pack_templates,
        permission_ecosystems
      RESTART IDENTITY CASCADE
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await ensureAuthorizationTemplates();
  await ensurePermissionEcosystems();
}

export async function getPackTemplates(): Promise<PackTemplateRow[]> {
  await ensureAuthorizationTemplates();
  const client = await pool.connect();
  try {
    const templates = await client.query(
      `SELECT id, COALESCE(pack_type, type, code) as type, name, description FROM pack_templates ORDER BY created_at ASC`
    );
    return templates.rows;
  } finally {
    client.release();
  }
}

export async function createPack(input: {
  organizationId: string;
  templateType: PackType;
  name: string;
  targetSubmissionDate?: string | null;
}) {
  await ensureAuthorizationTemplates();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const templateResult = await client.query(
      `SELECT id, COALESCE(pack_type, type, code) as type, name
       FROM pack_templates
       WHERE pack_type = $1 OR type = $1 OR code = $1
       LIMIT 1`,
      [input.templateType]
    );
    if (templateResult.rows.length === 0) {
      throw new Error("Template not found");
    }
    const templateId = templateResult.rows[0].id;
    const packId = randomUUID();

    await client.query(
      `INSERT INTO packs (id, template_id, organization_id, name, target_submission_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [packId, templateId, input.organizationId, input.name, input.targetSubmissionDate ?? null]
    );

    const sections = await client.query(
      `SELECT id, section_key, title, display_order
       FROM section_templates
       WHERE template_id = $1
       ORDER BY display_order ASC`,
      [templateId]
    );

    const evidenceTemplates = await client.query(
      `SELECT id, section_template_id, name, description, display_order
       FROM required_evidence
       WHERE section_template_id IN (
         SELECT id FROM section_templates WHERE template_id = $1
       )
       ORDER BY section_template_id, display_order`,
      [templateId]
    );

    const sectionMap = new Map<string, { instanceId: string; key: string; title: string; order: number }>();

    for (const row of sections.rows) {
      const instanceId = randomUUID();
      await client.query(
        `INSERT INTO section_instances
          (id, pack_id, section_template_id, section_key, title, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [instanceId, packId, row.id, row.section_key, row.title, row.display_order]
      );
      sectionMap.set(row.id, { instanceId, key: row.section_key, title: row.title, order: row.display_order });
    }

    let annexCounter = 1;
    for (const evidence of evidenceTemplates.rows) {
      const sectionInstance = sectionMap.get(evidence.section_template_id);
      if (!sectionInstance) continue;
      const annexNumber = `Annex-${String(annexCounter).padStart(3, "0")}`;
      await client.query(
        `INSERT INTO evidence_items
          (pack_id, section_instance_id, required_evidence_id, name, description, annex_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          packId,
          sectionInstance.instanceId,
          evidence.id,
          evidence.name,
          evidence.description ?? null,
          annexNumber,
        ]
      );
      annexCounter += 1;
    }

    for (const section of sectionMap.values()) {
      await client.query(
        `INSERT INTO review_gates (section_instance_id, stage, state, reviewer_role)
         VALUES ($1, $2, $3, $4)`,
        [section.instanceId, "client-review", "pending", "client"]
      );
      await client.query(
        `INSERT INTO review_gates (section_instance_id, stage, state, reviewer_role)
         VALUES ($1, $2, $3, $4)`,
        [section.instanceId, "consultant-review", "pending", "consultant"]
      );

      await client.query(
        `INSERT INTO tasks (pack_id, section_instance_id, title, status, source)
         VALUES ($1, $2, $3, $4, $5)`,
        [packId, section.instanceId, `Draft narrative for ${section.title}`, "pending", "auto-prompt"]
      );
    }

    for (const evidence of evidenceTemplates.rows) {
      const sectionInstance = sectionMap.get(evidence.section_template_id);
      if (!sectionInstance) continue;
      await client.query(
        `INSERT INTO tasks (pack_id, section_instance_id, title, status, source)
         VALUES ($1, $2, $3, $4, $5)`,
        [packId, sectionInstance.instanceId, `Upload evidence: ${evidence.name}`, "pending", "auto-evidence"]
      );
    }

    await client.query("COMMIT");
    return { id: packId, templateId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getPacks(
  organizationId: string,
  options?: { limit?: number; offset?: number }
) {
  await ensureAuthorizationTemplates();
  const client = await pool.connect();
  const limit = Math.max(1, options?.limit ?? 50);
  const offset = Math.max(0, options?.offset ?? 0);
  try {
    const totalResult = await client.query(
      `SELECT COUNT(*)::int as total
       FROM packs p
       WHERE p.organization_id = $1
         AND ${softDeleteClause("p")}`,
      [organizationId]
    );

    const result = await client.query(
      `SELECT p.id, p.name, p.status, p.target_submission_date, p.created_at, p.updated_at,
              COALESCE(pt.pack_type, pt.type, pt.code) as template_type, pt.name as template_name
       FROM packs p
       JOIN pack_templates pt ON p.template_id = pt.id
       WHERE p.organization_id = $1
         AND ${softDeleteClause("p")}
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [organizationId, limit, offset]
    );
    return { packs: result.rows, total: totalResult.rows[0]?.total ?? 0 };
  } finally {
    client.release();
  }
}

export async function getPack(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.id, p.organization_id, p.name, p.status, p.target_submission_date, p.created_at, p.updated_at,
              COALESCE(pt.pack_type, pt.type, pt.code) as template_type, pt.name as template_name
       FROM packs p
       JOIN pack_templates pt ON p.template_id = pt.id
       WHERE p.id = $1
         AND ${softDeleteClause("p")}
       LIMIT 1`,
      [packId]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function getPackDocuments(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, pack_id, section_code, name, description, storage_key, file_size_bytes, mime_type, checksum,
              version, status, uploaded_by, uploaded_at, reviewed_by, reviewed_at, signed_by, signed_at,
              created_at, updated_at
       FROM pack_documents
       WHERE pack_id = $1 AND ${softDeleteClause("pack_documents")}
       ORDER BY created_at DESC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPackDocument(documentId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, pack_id, section_code, name, description, storage_key, file_size_bytes, mime_type, checksum,
              version, status, uploaded_by, uploaded_at, reviewed_by, reviewed_at, signed_by, signed_at,
              created_at, updated_at
       FROM pack_documents
       WHERE id = $1 AND ${softDeleteClause("pack_documents")}
       LIMIT 1`,
      [documentId]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function createPackDocument(input: {
  packId: string;
  name: string;
  description?: string | null;
  sectionCode?: string | null;
  storageKey?: string | null;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  checksum?: string | null;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO pack_documents
        (pack_id, section_code, name, description, storage_key, file_size_bytes, mime_type, checksum,
         version, status, uploaded_by, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, 'draft', $9, $10)
       RETURNING *`,
      [
        input.packId,
        input.sectionCode ?? null,
        input.name,
        input.description ?? null,
        input.storageKey ?? null,
        input.fileSizeBytes ?? null,
        input.mimeType ?? null,
        input.checksum ?? null,
        input.uploadedBy ?? null,
        input.uploadedAt ? new Date(input.uploadedAt) : null,
      ]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function updatePackDocument(documentId: string, updates: Record<string, unknown>) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const allowed = new Set([
      "name",
      "description",
      "section_code",
      "storage_key",
      "file_size_bytes",
      "mime_type",
      "checksum",
      "version",
      "status",
      "uploaded_by",
      "uploaded_at",
      "reviewed_by",
      "reviewed_at",
      "signed_by",
      "signed_at",
    ]);
    const keys = Object.keys(updates).filter((key) => allowed.has(key));
    if (!keys.length) return null;

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    setClauses.push("updated_at = NOW()");
    const values = keys.map((key) => updates[key]);

    const result = await client.query(
      `UPDATE pack_documents
       SET ${setClauses.join(", ")}
       WHERE id = $${keys.length + 1} AND ${softDeleteClause("pack_documents")}
       RETURNING *`,
      [...values, documentId]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function deletePackDocument(documentId: string, deletedBy?: string | null) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE pack_documents
       SET deleted_at = NOW(), deleted_by = $2
       WHERE id = $1 AND ${softDeleteClause("pack_documents")}
       RETURNING id`,
      [documentId, deletedBy ?? null]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

const normalizeOpinionPackGenerationJob = (row: OpinionPackGenerationJobRow | undefined | null) => {
  if (!row) return null;
  return {
    id: row.id,
    packId: row.pack_id,
    status: row.status,
    progress: typeof row.progress === "number" ? row.progress : 0,
    currentStep: row.current_step,
    payload: coerceJsonObject<Record<string, unknown>>(row.payload),
    errorMessage: row.error_message,
    documentId: row.document_id,
    documentName: row.document_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export async function createOpinionPackGenerationJob(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const jobId = randomUUID();
    const payload = { aiContent: {}, warnings: [] };
    const result = await client.query(
      `INSERT INTO authorization_pack_generation_jobs
        (id, pack_id, status, progress, current_step, payload)
       VALUES ($1, $2, 'pending', 0, 'queued', $3)
       RETURNING *`,
      [jobId, packId, payload]
    );
    return normalizeOpinionPackGenerationJob(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function getOpinionPackGenerationJob(jobId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT *
       FROM authorization_pack_generation_jobs
       WHERE id = $1
       LIMIT 1`,
      [jobId]
    );
    return normalizeOpinionPackGenerationJob(result.rows[0] as OpinionPackGenerationJobRow | undefined);
  } finally {
    client.release();
  }
}

export async function getActiveOpinionPackGenerationJob(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT *
       FROM authorization_pack_generation_jobs
       WHERE pack_id = $1 AND status IN ('pending', 'processing')
       ORDER BY created_at DESC
       LIMIT 1`,
      [packId]
    );
    return normalizeOpinionPackGenerationJob(result.rows[0] as OpinionPackGenerationJobRow | undefined);
  } finally {
    client.release();
  }
}

export async function getLatestOpinionPackGenerationJob(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT *
       FROM authorization_pack_generation_jobs
       WHERE pack_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [packId]
    );
    return normalizeOpinionPackGenerationJob(result.rows[0] as OpinionPackGenerationJobRow | undefined);
  } finally {
    client.release();
  }
}

export async function updateOpinionPackGenerationJob(
  jobId: string,
  updates: {
    status?: string;
    progress?: number;
    currentStep?: string | null;
    payload?: Record<string, unknown>;
    errorMessage?: string | null;
    documentId?: string | null;
    documentName?: string | null;
  }
) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.progress !== undefined) {
      setClauses.push(`progress = $${idx++}`);
      values.push(updates.progress);
    }
    if (updates.currentStep !== undefined) {
      setClauses.push(`current_step = $${idx++}`);
      values.push(updates.currentStep);
    }
    if (updates.payload !== undefined) {
      setClauses.push(`payload = $${idx++}`);
      values.push(updates.payload);
    }
    if (updates.errorMessage !== undefined) {
      setClauses.push(`error_message = $${idx++}`);
      values.push(updates.errorMessage);
    }
    if (updates.documentId !== undefined) {
      setClauses.push(`document_id = $${idx++}`);
      values.push(updates.documentId);
    }
    if (updates.documentName !== undefined) {
      setClauses.push(`document_name = $${idx++}`);
      values.push(updates.documentName);
    }

    setClauses.push("updated_at = NOW()");
    values.push(jobId);

    const result = await client.query(
      `UPDATE authorization_pack_generation_jobs
       SET ${setClauses.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
    return normalizeOpinionPackGenerationJob(result.rows[0] as OpinionPackGenerationJobRow | undefined);
  } finally {
    client.release();
  }
}

export async function updatePack(
  packId: string,
  updates: {
    status?: string;
    targetSubmissionDate?: string | null;
  }
) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const setClauses: string[] = ["updated_at = NOW()"];
    const values: Array<string | null> = [];
    let idx = 1;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(updates.status);
    }

    if (updates.targetSubmissionDate !== undefined) {
      setClauses.push(`target_submission_date = $${idx++}`);
      values.push(updates.targetSubmissionDate);
    }

    values.push(packId);

    const result = await client.query(
      `UPDATE packs SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING id`,
      values
    );

    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

export async function deletePack(packId: string, deletedBy?: string | null) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE authorization_projects
       SET deleted_at = NOW(), deleted_by = $2
       WHERE pack_id = $1 AND ${softDeleteClause("authorization_projects")}`,
      [packId, deletedBy ?? null]
    );
    const result = await client.query(
      `UPDATE packs
       SET deleted_at = NOW(), deleted_by = $2
       WHERE id = $1 AND ${softDeleteClause("packs")}
       RETURNING id`,
      [packId, deletedBy ?? null]
    );

    await client.query("COMMIT");
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getSections(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    // Execute all queries in parallel for better performance
    const [sections, promptCounts, evidenceCounts, reviewCounts] = await Promise.all([
      client.query(
        `SELECT id, section_key, title, display_order, status, owner_id, due_date, review_state
         FROM section_instances
         WHERE pack_id = $1
         ORDER BY display_order ASC`,
        [packId]
      ),
      client.query(
        `SELECT si.id as section_instance_id,
                COUNT(p.id) FILTER (WHERE p.required IS TRUE) as required_prompts,
                COUNT(pr.id) FILTER (WHERE pr.value IS NOT NULL AND pr.value <> '') as answered_prompts
         FROM section_instances si
         JOIN section_templates st ON si.section_template_id = st.id
         JOIN prompts p ON st.id = p.section_template_id
         LEFT JOIN prompt_responses pr ON pr.section_instance_id = si.id AND pr.prompt_id = p.id
         WHERE si.pack_id = $1
         GROUP BY si.id`,
        [packId]
      ),
      client.query(
        `SELECT section_instance_id,
                COUNT(*) FILTER (WHERE status IN ('uploaded', 'approved')) as uploaded,
                COUNT(*) as total
         FROM evidence_items
         WHERE pack_id = $1 AND ${softDeleteClause("evidence_items")}
         GROUP BY section_instance_id`,
        [packId]
      ),
      client.query(
        `SELECT rg.section_instance_id,
                COUNT(*) FILTER (WHERE rg.state = 'approved') as approved,
                COUNT(*) as total
         FROM review_gates rg
         JOIN section_instances si ON rg.section_instance_id = si.id
         WHERE si.pack_id = $1
         GROUP BY rg.section_instance_id`,
        [packId]
      ),
    ]);

    const promptMap = new Map(promptCounts.rows.map((row) => [row.section_instance_id, row]));
    const evidenceMap = new Map(evidenceCounts.rows.map((row) => [row.section_instance_id, row]));
    const reviewMap = new Map(reviewCounts.rows.map((row) => [row.section_instance_id, row]));

    return sections.rows.map((section) => {
      const prompt = promptMap.get(section.id) || { required_prompts: 0, answered_prompts: 0 };
      const evidence = evidenceMap.get(section.id) || { uploaded: 0, total: 0 };
      const review = reviewMap.get(section.id) || { approved: 0, total: 0 };
      return {
        ...section,
        narrativeCompletion: calcPercent(prompt.answered_prompts, prompt.required_prompts),
        evidenceCompletion: calcPercent(evidence.uploaded, evidence.total),
        reviewCompletion: calcPercent(review.approved, review.total),
        requiredPrompts: Number(prompt.required_prompts || 0),
        answeredPrompts: Number(prompt.answered_prompts || 0),
        evidenceUploaded: Number(evidence.uploaded || 0),
        evidenceTotal: Number(evidence.total || 0),
        reviewApproved: Number(review.approved || 0),
        reviewTotal: Number(review.total || 0),
      };
    });
  } finally {
    client.release();
  }
}

export async function getSectionWorkspace(packId: string, sectionId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const sectionResult = await client.query(
      `SELECT si.id, si.section_key, si.title, si.status, si.owner_id, si.due_date, si.review_state,
              st.id as section_template_id, st.description, st.display_order
       FROM section_instances si
       JOIN section_templates st ON si.section_template_id = st.id
       WHERE si.pack_id = $1 AND si.id = $2
       LIMIT 1`,
      [packId, sectionId]
    );
    const section = sectionResult.rows[0];
    if (!section) return null;

    const prompts = await client.query(
      `SELECT p.id, p.prompt_key, p.title, p.guidance, p.input_type, p.required, p.weight, p.display_order,
              pr.value, pr.updated_at, pr.version
       FROM prompts p
       LEFT JOIN prompt_responses pr
         ON pr.prompt_id = p.id AND pr.section_instance_id = $1
       WHERE p.section_template_id = $2
       ORDER BY p.display_order ASC`,
      [section.id, section.section_template_id]
    );

    const evidence = await client.query(
      `SELECT id, name, description, status, annex_number, file_path, file_size, file_type, uploaded_at, version
       FROM evidence_items
       WHERE section_instance_id = $1 AND ${softDeleteClause("evidence_items")}
       ORDER BY created_at ASC`,
      [section.id]
    );

    const tasks = await client.query(
      `SELECT id, title, description, status, priority, owner_id, due_date, source
       FROM tasks
       WHERE section_instance_id = $1
       ORDER BY created_at ASC`,
      [section.id]
    );

    const review = await client.query(
      `SELECT id, stage, state, reviewer_role, reviewer_id, reviewed_at, notes, client_notes
       FROM review_gates
       WHERE section_instance_id = $1
       ORDER BY stage ASC`,
      [section.id]
    );

    return {
      section,
      prompts: prompts.rows,
      evidence: evidence.rows,
      tasks: tasks.rows,
      reviewGates: review.rows,
    };
  } finally {
    client.release();
  }
}

export async function savePromptResponse(input: {
  sectionInstanceId: string;
  promptId: string;
  value: string;
  updatedBy?: string | null;
  expectedVersion?: number;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    if (input.expectedVersion !== undefined) {
      const result = await client.query(
        `INSERT INTO prompt_responses (section_instance_id, prompt_id, value, updated_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (section_instance_id, prompt_id)
         DO UPDATE SET value = $3,
                      updated_by = $4,
                      updated_at = NOW(),
                      version = prompt_responses.version + 1
         WHERE prompt_responses.version = $5
         RETURNING id, version, updated_by`,
        [
          input.sectionInstanceId,
          input.promptId,
          input.value,
          input.updatedBy ?? null,
          input.expectedVersion,
        ]
      );

      if (result.rowCount === 0) {
        const current = await client.query(
          `SELECT version, updated_by
           FROM prompt_responses
           WHERE section_instance_id = $1 AND prompt_id = $2
           LIMIT 1`,
          [input.sectionInstanceId, input.promptId]
        );
        const currentVersion =
          (current.rows[0]?.version as number | undefined) ?? input.expectedVersion;
        throw new ConcurrencyError(
          "prompt response",
          currentVersion,
          current.rows[0]?.updated_by as string | undefined
        );
      }

      await client.query(
        `UPDATE section_instances
         SET updated_at = NOW(), version = version + 1
         WHERE id = $1`,
        [input.sectionInstanceId]
      );
      return result.rows[0] ?? null;
    }

    const result = await client.query(
      `INSERT INTO prompt_responses (section_instance_id, prompt_id, value, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (section_instance_id, prompt_id)
       DO UPDATE SET value = $3,
                    updated_by = $4,
                    updated_at = NOW(),
                    version = prompt_responses.version + 1
       RETURNING id, version`,
      [input.sectionInstanceId, input.promptId, input.value, input.updatedBy ?? null]
    );

    await client.query(
      `UPDATE section_instances
       SET updated_at = NOW(), version = version + 1
       WHERE id = $1`,
      [input.sectionInstanceId]
    );

    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function listEvidence(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ei.id, ei.name, ei.description, ei.status, ei.annex_number, ei.file_path,
              ei.file_size, ei.file_type, ei.uploaded_at, ei.version, ei.section_instance_id,
              si.section_key, si.title as section_title
       FROM evidence_items ei
       JOIN section_instances si ON ei.section_instance_id = si.id
       WHERE ei.pack_id = $1 AND ${softDeleteClause("ei")}
       ORDER BY si.display_order ASC, ei.created_at ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateEvidenceStatus(input: {
  packId: string;
  evidenceId: string;
  status: string;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE evidence_items
       SET status = $3,
           updated_at = NOW()
       WHERE pack_id = $1 AND id = $2 AND ${softDeleteClause("evidence_items")}
       RETURNING id, status`,
      [input.packId, input.evidenceId, input.status]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function listTasks(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.owner_id, t.due_date, t.source,
              t.section_instance_id, si.title as section_title
       FROM tasks t
       LEFT JOIN section_instances si ON t.section_instance_id = si.id
       WHERE t.pack_id = $1
       ORDER BY t.created_at ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE tasks
       SET status = $2::text,
           completed_at = CASE WHEN $2::text = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $1`,
      [taskId, status]
    );
  } finally {
    client.release();
  }
}

export async function updateTaskPriority(taskId: string, priority: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE tasks
       SET priority = $2::text
       WHERE id = $1`,
      [taskId, priority]
    );
  } finally {
    client.release();
  }
}

export async function listReviewQueue(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT rg.id, rg.stage, rg.state, rg.reviewer_role, rg.reviewer_id, rg.reviewed_at,
              rg.notes, rg.client_notes, si.id as section_instance_id, si.title as section_title
       FROM review_gates rg
       JOIN section_instances si ON rg.section_instance_id = si.id
       WHERE si.pack_id = $1
       ORDER BY si.display_order ASC, rg.stage ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateReviewGate(input: {
  gateId: string;
  state: string;
  reviewerId?: string | null;
  notes?: string | null;
  clientNotes?: string | null;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE review_gates
       SET state = $2,
           reviewer_id = $3,
           notes = $4,
           client_notes = $5,
           reviewed_at = NOW()
       WHERE id = $1`,
      [input.gateId, input.state, input.reviewerId ?? null, input.notes ?? null, input.clientNotes ?? null]
    );

    const sectionResult = await client.query(
      `SELECT section_instance_id, stage FROM review_gates WHERE id = $1`,
      [input.gateId]
    );
    const sectionId = sectionResult.rows[0]?.section_instance_id as string | undefined;
    const reviewStage = sectionResult.rows[0]?.stage as string | undefined;

    if (sectionId) {
      const statesResult = await client.query(
        `SELECT state FROM review_gates WHERE section_instance_id = $1`,
        [sectionId]
      );
      const states = statesResult.rows.map((row) => row.state);
      const currentSection = await client.query(
        `SELECT review_state FROM section_instances WHERE id = $1`,
        [sectionId]
      );
      const currentState = currentSection.rows[0]?.review_state as string | undefined;

      let nextState = currentState ?? "draft";
      if (states.some((state) => state === "changes_requested")) {
        nextState = "changes-requested";
      } else if (states.length && states.every((state) => state === "approved")) {
        nextState = "approved";
      } else if (states.some((state) => state === "approved")) {
        nextState = "in-review";
      }

      await client.query(
        `UPDATE section_instances SET review_state = $2 WHERE id = $1`,
        [sectionId, nextState]
      );

      if (input.state === "changes_requested") {
        const packResult = await client.query(
          `SELECT pack_id, title FROM section_instances WHERE id = $1`,
          [sectionId]
        );
        const packId = packResult.rows[0]?.pack_id as string | undefined;
        const sectionTitle = packResult.rows[0]?.title as string | undefined;

        if (packId) {
          const existingTask = await client.query(
            `SELECT id FROM tasks
             WHERE section_instance_id = $1 AND source = 'review' AND status <> 'completed'
             LIMIT 1`,
            [sectionId]
          );
          if (existingTask.rows.length === 0) {
            const taskTitle = `Address review feedback${sectionTitle ? `: ${sectionTitle}` : ""}`;
            const taskDescription = reviewStage
              ? `Review stage: ${reviewStage.replace("-", " ")}`
              : null;
            await client.query(
              `INSERT INTO tasks (pack_id, section_instance_id, title, description, status, source, priority)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [packId, sectionId, taskTitle, taskDescription, "pending", "review", "high"]
            );
          }
        }
      }
    }
  } finally {
    client.release();
  }
}

export async function updateSectionState(input: {
  sectionId: string;
  status?: string | null;
  reviewState?: string | null;
  ownerId?: string | null;
  dueDate?: string | null;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE section_instances
       SET status = COALESCE($2, status),
           review_state = COALESCE($3, review_state),
           owner_id = COALESCE($4, owner_id),
           due_date = COALESCE($5, due_date)
       WHERE id = $1`,
      [
        input.sectionId,
        input.status ?? null,
        input.reviewState ?? null,
        input.ownerId ?? null,
        input.dueDate ?? null,
      ]
    );
  } finally {
    client.release();
  }
}

export async function resetReviewGates(sectionId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE review_gates
       SET state = 'pending',
           reviewed_at = NULL,
           notes = NULL,
           client_notes = NULL
       WHERE section_instance_id = $1`,
      [sectionId]
    );
  } finally {
    client.release();
  }
}

export async function getEvidenceItem(input: { packId: string; evidenceId: string }) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, name, status, file_path, file_type, file_size
       FROM evidence_items
       WHERE id = $1 AND pack_id = $2 AND ${softDeleteClause("evidence_items")}
       LIMIT 1`,
      [input.evidenceId, input.packId]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function listEvidenceVersions(input: { packId: string; evidenceId: string }) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ev.id, ev.version, ev.filename, ev.file_path, ev.file_size, ev.file_type, ev.uploaded_by, ev.uploaded_at, ev.notes
       FROM evidence_versions ev
       JOIN evidence_items ei ON ev.evidence_item_id = ei.id
       WHERE ei.pack_id = $1 AND ei.id = $2 AND ${softDeleteClause("ei")}
       ORDER BY ev.version DESC`,
      [input.packId, input.evidenceId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getEvidenceVersion(input: {
  packId: string;
  evidenceId: string;
  versionId: string;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ev.id, ev.version, ev.filename, ev.file_path, ev.file_size, ev.file_type
       FROM evidence_versions ev
       JOIN evidence_items ei ON ev.evidence_item_id = ei.id
       WHERE ei.pack_id = $1 AND ei.id = $2 AND ev.id = $3 AND ${softDeleteClause("ei")}
       LIMIT 1`,
      [input.packId, input.evidenceId, input.versionId]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function getNarrativeExportRows(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT si.title as section_title,
              si.display_order as section_order,
              p.title as prompt_title,
              p.display_order as prompt_order,
              pr.value as response_value
       FROM section_instances si
       JOIN section_templates st ON si.section_template_id = st.id
       JOIN prompts p ON st.id = p.section_template_id
       LEFT JOIN prompt_responses pr
         ON pr.section_instance_id = si.id AND pr.prompt_id = p.id
       WHERE si.pack_id = $1
       ORDER BY si.display_order ASC, p.display_order ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getAnnexIndexRows(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ei.annex_number, ei.name, ei.description, ei.status, ei.version, ei.file_path,
              si.title as section_title
       FROM evidence_items ei
       JOIN section_instances si ON ei.section_instance_id = si.id
       WHERE ei.pack_id = $1 AND ${softDeleteClause("ei")}
       ORDER BY ei.annex_number ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function listEvidenceFilesForZip(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, annex_number, name, file_path, file_type, file_size
       FROM evidence_items
       WHERE pack_id = $1 AND file_path IS NOT NULL AND ${softDeleteClause("evidence_items")}
       ORDER BY annex_number ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function listEvidenceVersionFilesForZip(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ei.id as evidence_item_id,
              ei.name as evidence_name,
              ei.annex_number,
              ei.status,
              si.title as section_title,
              si.owner_id,
              si.due_date,
              si.review_state,
              ev.id as version_id,
              ev.version,
              ev.filename,
              ev.file_path,
              ev.file_size,
              ev.file_type,
              ev.uploaded_at
       FROM evidence_versions ev
       JOIN evidence_items ei ON ev.evidence_item_id = ei.id
       JOIN section_instances si ON ei.section_instance_id = si.id
       WHERE ei.pack_id = $1 AND ${softDeleteClause("ei")}
       ORDER BY ei.annex_number ASC, ev.version DESC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function addEvidenceVersion(input: {
  evidenceItemId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  fileType?: string | null;
  uploadedBy?: string | null;
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const current = await client.query(
      `SELECT version FROM evidence_items WHERE id = $1 LIMIT 1`,
      [input.evidenceItemId]
    );
    const nextVersion = Number(current.rows[0]?.version || 0) + 1;

    await client.query(
      `INSERT INTO evidence_versions
        (evidence_item_id, version, filename, file_path, file_size, file_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.evidenceItemId,
        nextVersion,
        input.filename,
        input.filePath,
        input.fileSize,
        input.fileType ?? null,
        input.uploadedBy ?? null,
      ]
    );

    await client.query(
      `UPDATE evidence_items
       SET status = 'uploaded',
           file_path = $2,
           file_size = $3,
           file_type = $4,
           uploaded_at = NOW(),
           version = $5,
           updated_at = NOW()
       WHERE id = $1`,
      [input.evidenceItemId, input.filePath, input.fileSize, input.fileType ?? null, nextVersion]
    );
  } finally {
    client.release();
  }
}

function buildReadinessFromSections(
  sections: Array<{ narrativeCompletion: number; evidenceCompletion: number; reviewCompletion: number }>
) {
  if (!sections.length) {
    return {
      overall: 0,
      narrative: 0,
      evidence: 0,
      review: 0,
    };
  }

  const narrativeAvg = average(sections.map((s) => s.narrativeCompletion));
  const evidenceAvg = average(sections.map((s) => s.evidenceCompletion));
  const reviewAvg = average(sections.map((s) => s.reviewCompletion));

  return {
    overall: Math.round(narrativeAvg * 0.4 + evidenceAvg * 0.4 + reviewAvg * 0.2),
    narrative: narrativeAvg,
    evidence: evidenceAvg,
    review: reviewAvg,
  };
}

export async function getPackReadiness(packId: string) {
  const sections = await getSections(packId);
  const readiness = buildReadinessFromSections(sections);

  const project = await getProjectByPackId(packId);
  if (!project) {
    return readiness;
  }

  const permission = isProfilePermissionCode(project.permissionCode)
    ? project.permissionCode
    : project.permissionCode?.startsWith("payments")
    ? "payments"
    : null;

  const responses = project.assessmentData?.businessPlanProfile?.responses ?? {};
  const hasResponses = Object.keys(responses).length > 0;
  const profileCompletion =
    permission && hasResponses ? buildProfileInsights(permission, responses).completionPercent : 0;

  const documents = await getPackDocuments(packId);
  const hasOpinionPack = documents.some(
    (doc) => doc.section_code === "perimeter-opinion" && doc.storage_key
  );
  const opinionCompletion = hasOpinionPack ? 100 : 0;

  const narrative = Math.max(readiness.narrative, profileCompletion, opinionCompletion);
  const review = Math.max(readiness.review, opinionCompletion);
  const evidence = readiness.evidence;
  const overall = sections.length
    ? Math.round(narrative * 0.4 + evidence * 0.4 + review * 0.2)
    : Math.max(profileCompletion, opinionCompletion);

  return {
    overall,
    narrative,
    evidence,
    review,
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

function calcPercent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

export interface FullSectionData {
  sectionKey: string;
  title: string;
  description: string;
  displayOrder: number;
  prompts: Array<{
    key: string;
    title: string;
    guidance: string | null;
    weight: number;
    response: string | null;
  }>;
  evidence: Array<{
    name: string;
    description: string | null;
    status: string;
    annexNumber: string | null;
  }>;
  narrativeCompletion: number;
  evidenceCompletion: number;
}

export async function getFullPackSectionsWithResponses(packId: string): Promise<FullSectionData[]> {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    // Query 1: Get all sections for the pack
    const sectionsResult = await client.query(
      `SELECT si.id, si.section_key, si.title, si.display_order,
              st.description
       FROM section_instances si
       JOIN section_templates st ON si.section_template_id = st.id
       WHERE si.pack_id = $1
       ORDER BY si.display_order ASC`,
      [packId]
    );

    if (sectionsResult.rows.length === 0) {
      return [];
    }

    const sectionIds = sectionsResult.rows.map((s) => s.id);

    // Query 2: Get ALL prompts with responses for all sections in one query
    const promptsResult = await client.query(
      `SELECT si.id as section_instance_id,
              p.prompt_key, p.title, p.guidance, p.weight, p.display_order,
              pr.value as response
       FROM section_instances si
       JOIN section_templates st ON si.section_template_id = st.id
       JOIN prompts p ON p.section_template_id = st.id
       LEFT JOIN prompt_responses pr ON pr.prompt_id = p.id AND pr.section_instance_id = si.id
       WHERE si.id = ANY($1::uuid[])
       ORDER BY si.display_order ASC, p.display_order ASC`,
      [sectionIds]
    );

    // Query 3: Get ALL evidence for all sections in one query
    const evidenceResult = await client.query(
      `SELECT section_instance_id, name, description, status, annex_number
       FROM evidence_items
       WHERE section_instance_id = ANY($1::uuid[])
       ORDER BY created_at ASC`,
      [sectionIds]
    );

    // Group prompts by section
    const promptsBySection = new Map<string, typeof promptsResult.rows>();
    for (const prompt of promptsResult.rows) {
      const sectionId = prompt.section_instance_id;
      if (!promptsBySection.has(sectionId)) {
        promptsBySection.set(sectionId, []);
      }
      promptsBySection.get(sectionId)!.push(prompt);
    }

    // Group evidence by section
    const evidenceBySection = new Map<string, typeof evidenceResult.rows>();
    for (const evidence of evidenceResult.rows) {
      const sectionId = evidence.section_instance_id;
      if (!evidenceBySection.has(sectionId)) {
        evidenceBySection.set(sectionId, []);
      }
      evidenceBySection.get(sectionId)!.push(evidence);
    }

    // Build sections with their prompts and evidence
    const sections: FullSectionData[] = sectionsResult.rows.map((section) => {
      const sectionPrompts = promptsBySection.get(section.id) || [];
      const sectionEvidence = evidenceBySection.get(section.id) || [];

      // Calculate completion
      const requiredPrompts = sectionPrompts.filter((p) => p.weight > 0);
      const answeredPrompts = requiredPrompts.filter(
        (p) => p.response && p.response.trim().length > 0
      );
      const narrativeCompletion = calcPercent(answeredPrompts.length, requiredPrompts.length);

      const totalEvidence = sectionEvidence.length;
      const uploadedEvidence = sectionEvidence.filter(
        (e) => e.status === "uploaded" || e.status === "approved"
      ).length;
      const evidenceCompletion = calcPercent(uploadedEvidence, totalEvidence);

      return {
        sectionKey: section.section_key,
        title: section.title,
        description: section.description || "",
        displayOrder: section.display_order,
        prompts: sectionPrompts.map((p) => ({
          key: p.prompt_key,
          title: p.title,
          guidance: p.guidance,
          weight: p.weight,
          response: p.response,
        })),
        evidence: sectionEvidence.map((e) => ({
          name: e.name,
          description: e.description,
          status: e.status,
          annexNumber: e.annex_number,
        })),
        narrativeCompletion,
        evidenceCompletion,
      };
    });

    return sections;
  } finally {
    client.release();
  }
}

export interface ProjectAssessmentData {
  basics?: {
    legalName?: string;
    priorFcaApplications?: string;
    firmType?: string;
    tradingName?: string;
    incorporationDate?: string;
    incorporationPlace?: string;
    companyNumber?: string;
    registeredNumberExists?: string;
    financialYearEnd?: string;
    sicCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    registeredOfficeSameAsHeadOffice?: string;
    headOfficeAddressLine1?: string;
    headOfficeAddressLine2?: string;
    headOfficeCity?: string;
    headOfficePostcode?: string;
    headOfficePhone?: string;
    headOfficeEmail?: string;
    primaryJurisdiction?: string;
    primaryContact?: string;
    contactEmail?: string;
    contactPhone?: string;
    firmStage?: string;
    regulatedActivities?: string;
    headcount?: number;
    website?: string;
    previouslyRegulated?: string;
    tradeAssociations?: string;
    usedProfessionalAdviser?: string;
    adviserFirmName?: string;
    adviserCopyCorrespondence?: string;
    adviserContactDetails?: string;
    timingFactors?: string;
    pspType?: string;
    paymentServicesActivities?: string;
    currentlyProvidingPIS?: string;
    currentlyProvidingAIS?: string;
    pisStartDate?: string;
    aisStartDate?: string;
    certificateOfIncorporation?: string;
    articlesOfAssociation?: string;
    partnershipDeed?: string;
    llpAgreement?: string;
    consultantNotes?: string;
  };
  readiness?: Record<string, "missing" | "partial" | "complete">;
  policies?: Record<string, "missing" | "partial" | "complete">;
  training?: Record<string, "missing" | "in-progress" | "complete">;
  smcr?: Record<string, "unassigned" | "assigned">;
  businessPlanProfile?: BusinessPlanProfile;
  meta?: {
    completion?: number;
    updatedAt?: string;
  };
}

export async function getProjectByPackId(packId: string): Promise<{
  id: string;
  name: string;
  permissionCode: string;
  permissionName: string | null;
  assessmentData: ProjectAssessmentData;
} | null> {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ap.id, ap.name, ap.permission_code, ap.assessment_data,
              pe.name as permission_name
       FROM authorization_projects ap
       LEFT JOIN permission_ecosystems pe ON pe.permission_code = ap.permission_code
       WHERE ap.pack_id = $1
       LIMIT 1`,
      [packId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const assessmentData = coerceJsonObject<ProjectAssessmentData>(row.assessment_data);

    return {
      id: row.id,
      name: row.name,
      permissionCode: row.permission_code,
      permissionName: row.permission_name,
      assessmentData,
    };
  } finally {
    client.release();
  }
}
