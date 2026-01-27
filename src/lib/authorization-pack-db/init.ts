/**
 * Database initialization and schema management for authorization packs
 */

import { pool } from "@/lib/database";
import { PACK_TEMPLATES } from "@/lib/authorization-pack-templates";
import { PERMISSION_ECOSYSTEMS } from "@/lib/authorization-pack-ecosystems";
import { randomUUID } from "crypto";
import { normalizeEvidenceName, normalizeSectionKey } from "./utils";
import type { PermissionEcosystemRow } from "./types";
import { coerceJsonArray } from "./utils";

let templatesSynced = false;
let ecosystemsSynced = false;
const EXPECTED_TEMPLATE_COUNT = PACK_TEMPLATES.length;
const EXPECTED_SECTION_COUNT = PACK_TEMPLATES.reduce((total, template) => total + template.sections.length, 0);
const EXPECTED_ECOSYSTEM_COUNT = PERMISSION_ECOSYSTEMS.length;

export async function initAuthorizationPackDatabase() {
  const client = await pool.connect();
  try {
    // Pack templates table
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
      UPDATE pack_templates SET pack_type = COALESCE(pack_type, type, code) WHERE pack_type IS NULL;
    `);
    await client.query(`
      UPDATE pack_templates SET type = COALESCE(type, pack_type, code) WHERE type IS NULL;
    `);

    // Permission ecosystems table
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

    // Section templates table
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

    // Normalize section_templates columns
    await client.query(`UPDATE section_templates SET template_id = COALESCE(template_id, pack_template_id) WHERE template_id IS NULL AND pack_template_id IS NOT NULL`);
    await client.query(`UPDATE section_templates SET pack_template_id = COALESCE(pack_template_id, template_id) WHERE pack_template_id IS NULL AND template_id IS NOT NULL`);
    await client.query(`UPDATE section_templates SET section_key = COALESCE(section_key, code) WHERE section_key IS NULL AND code IS NOT NULL`);
    await client.query(`UPDATE section_templates SET code = COALESCE(code, section_key) WHERE code IS NULL AND section_key IS NOT NULL`);
    await client.query(`UPDATE section_templates SET title = COALESCE(title, name) WHERE title IS NULL AND name IS NOT NULL`);
    await client.query(`UPDATE section_templates SET name = COALESCE(name, title) WHERE name IS NULL AND title IS NOT NULL`);
    await client.query(`UPDATE section_templates SET description = COALESCE(description, guidance_text) WHERE description IS NULL AND guidance_text IS NOT NULL`);
    await client.query(`UPDATE section_templates SET guidance_text = COALESCE(guidance_text, description) WHERE guidance_text IS NULL AND description IS NOT NULL`);
    await client.query(`UPDATE section_templates SET display_order = COALESCE(display_order, order_index) WHERE display_order IS NULL AND order_index IS NOT NULL`);
    await client.query(`UPDATE section_templates SET order_index = COALESCE(order_index, display_order) WHERE order_index IS NULL AND display_order IS NOT NULL`);

    // Prompts table
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

    // Required evidence table
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

    // Packs table
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
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT '{}'::jsonb;
    `);

    // Authorization projects table
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
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    // Section instances table
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
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
    `);

    // Prompt responses table
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
    await client.query(`ALTER TABLE prompt_responses ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1`);

    // Evidence items table
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
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    // Evidence versions table
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

    await client.query(`ALTER TABLE evidence_items ALTER COLUMN status SET DEFAULT 'required'`);
    await client.query(`UPDATE evidence_items SET status = 'required' WHERE status = 'missing' OR status IS NULL`);

    // Tasks table
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

    // Pack documents table
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
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;
    `);

    // Generation jobs table
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

    // Review gates table
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

    // Activity log table
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

    // Audit log table
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

    // Create indexes
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
    await client.query(`CREATE INDEX IF NOT EXISTS idx_auth_pack_gen_jobs_pack ON authorization_pack_generation_jobs(pack_id)`);
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
      if (row.type_key) templateMap.set(row.type_key, row.id);
      if (row.code) templateMap.set(row.code, row.id);
      if (row.pack_type) templateMap.set(row.pack_type, row.id);
      if (row.type) templateMap.set(row.type, row.id);
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
           DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, pack_type = EXCLUDED.pack_type, type = EXCLUDED.type
           RETURNING id`,
          [template.type, template.name, template.description, template.type, template.type]
        );
        templateId = upsert.rows[0]?.id;
        if (!templateId) throw new Error(`Failed to upsert pack template ${template.type}`);
        templateMap.set(template.type, templateId);
      } else {
        await client.query(
          `UPDATE pack_templates SET name = $2, description = $3, pack_type = $4, type = $4 WHERE id = $1`,
          [templateId, template.name, template.description, template.type]
        );
      }

      const existingSections = await client.query(
        `SELECT id, section_key, code, title, name FROM section_templates WHERE template_id = $1 OR pack_template_id = $1`,
        [templateId]
      );
      const sectionMap = new Map<string, string>();
      for (const row of existingSections.rows) {
        const candidates = [row.section_key, row.code, row.title, row.name].filter(Boolean) as string[];
        for (const candidate of candidates) {
          const normalized = normalizeSectionKey(candidate);
          if (normalized) sectionMap.set(normalized, row.id);
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
              (id, template_id, pack_template_id, section_key, code, title, name, description, guidance_text, display_order, order_index, is_addon, addon_trigger)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [sectionId, templateId, templateId, section.key, section.key, section.title, section.title, section.description, section.description, displayOrder, displayOrder, Boolean(section.isAddon), section.addonTrigger ?? null]
          );
        } else {
          await client.query(
            `UPDATE section_templates SET template_id = $2, pack_template_id = $2, section_key = $3, code = $3, title = $4, name = $4, description = $5, guidance_text = $5, display_order = $6, order_index = $6, is_addon = $7, addon_trigger = $8 WHERE id = $1`,
            [sectionId, templateId, section.key, section.title, section.description, displayOrder, Boolean(section.isAddon), section.addonTrigger ?? null]
          );
        }

        // Sync prompts
        const existingPrompts = await client.query(`SELECT id, prompt_key FROM prompts WHERE section_template_id = $1`, [sectionId]);
        const promptMap = new Map<string, string>();
        for (const row of existingPrompts.rows) promptMap.set(row.prompt_key, row.id);

        const prompts = section.prompts ?? [];
        let promptOrder = 1;
        for (const prompt of prompts) {
          const promptId = promptMap.get(prompt.key);
          if (!promptId) {
            await client.query(
              `INSERT INTO prompts (section_template_id, prompt_key, title, description, guidance, example_answer, input_type, options, required, weight, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [sectionId, prompt.key, prompt.title, null, prompt.guidance ?? null, prompt.exampleAnswer ?? null, prompt.inputType, null, prompt.required ?? true, prompt.weight ?? 1, promptOrder]
            );
          } else {
            await client.query(
              `UPDATE prompts SET title = $2, description = $3, guidance = $4, example_answer = $5, input_type = $6, options = $7, required = $8, weight = $9, display_order = $10 WHERE id = $1`,
              [promptId, prompt.title, null, prompt.guidance ?? null, prompt.exampleAnswer ?? null, prompt.inputType, null, prompt.required ?? true, prompt.weight ?? 1, promptOrder]
            );
          }
          promptOrder += 1;
        }

        // Sync evidence
        const existingEvidence = await client.query(`SELECT id, name FROM required_evidence WHERE section_template_id = $1`, [sectionId]);
        const evidenceMap = new Map<string, string>();
        for (const row of existingEvidence.rows) evidenceMap.set(normalizeEvidenceName(row.name), row.id);

        const evidence = section.evidence ?? [];
        let evidenceOrder = 1;
        for (const item of evidence) {
          const evidenceKey = normalizeEvidenceName(item.name);
          const evidenceId = evidenceMap.get(evidenceKey);
          if (!evidenceId) {
            await client.query(
              `INSERT INTO required_evidence (section_template_id, name, description, file_types, is_mandatory, display_order) VALUES ($1, $2, $3, $4, $5, $6)`,
              [sectionId, item.name, item.description ?? null, item.fileTypes ?? null, item.isMandatory ?? true, evidenceOrder]
            );
          } else {
            await client.query(
              `UPDATE required_evidence SET name = $2, description = $3, file_types = $4, is_mandatory = $5, display_order = $6 WHERE id = $1`,
              [evidenceId, item.name, item.description ?? null, item.fileTypes ?? null, item.isMandatory ?? true, evidenceOrder]
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
         DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, pack_template_type = EXCLUDED.pack_template_type, section_keys = EXCLUDED.section_keys, policy_templates = EXCLUDED.policy_templates, training_requirements = EXCLUDED.training_requirements, smcr_roles = EXCLUDED.smcr_roles, typical_timeline_weeks = EXCLUDED.typical_timeline_weeks`,
        [ecosystem.code, ecosystem.name, ecosystem.description, ecosystem.packTemplateType, JSON.stringify(sectionKeys), JSON.stringify(ecosystem.policyTemplates), JSON.stringify(ecosystem.trainingRequirements), JSON.stringify(ecosystem.smcrRoles), ecosystem.typicalTimelineWeeks]
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
      `SELECT id, permission_code, name, description, pack_template_type, section_keys, policy_templates, training_requirements, smcr_roles, typical_timeline_weeks FROM permission_ecosystems ORDER BY name`
    );
    return result.rows.map((row) => ({
      id: row.id,
      permission_code: row.permission_code,
      name: row.name,
      description: row.description,
      pack_template_type: row.pack_template_type,
      section_keys: coerceJsonArray<string>(row.section_keys),
      policy_templates: coerceJsonArray<string>(row.policy_templates),
      training_requirements: coerceJsonArray<string>(row.training_requirements),
      smcr_roles: coerceJsonArray<string>(row.smcr_roles),
      typical_timeline_weeks: row.typical_timeline_weeks,
    }));
  } finally {
    client.release();
  }
}
