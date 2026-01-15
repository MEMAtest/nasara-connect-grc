import { randomUUID } from "crypto";
import { pool } from "@/lib/database";
import {
  PACK_TEMPLATES,
  PackType,
} from "@/lib/authorization-pack-templates";
import {
  PERMISSION_ECOSYSTEMS,
  PermissionCode,
} from "@/lib/authorization-pack-ecosystems";

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

const normalizeEvidenceName = (value: string) => value.trim().toLowerCase();

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

const coerceJsonObject = <T extends Record<string, unknown>>(value: unknown): T => {
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

export async function initAuthorizationPackDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pack_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(100),
        type VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
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
      CREATE TABLE IF NOT EXISTS evidence_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
        section_instance_id UUID REFERENCES section_instances(id) ON DELETE CASCADE,
        required_evidence_id UUID REFERENCES required_evidence(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'missing',
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

    await client.query(`CREATE INDEX IF NOT EXISTS idx_pack_templates_code ON pack_templates(code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_permission_ecosystems_code ON permission_ecosystems(permission_code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_section_templates_template ON section_templates(template_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_authorization_projects_org ON authorization_projects(organization_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_section_instances_pack ON section_instances(pack_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_prompt_responses_section ON prompt_responses(section_instance_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_evidence_items_pack ON evidence_items(pack_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_pack ON tasks(pack_id)`);
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

    const existingTemplates = await client.query(`SELECT id, COALESCE(type, code) as type FROM pack_templates`);
    const templateMap = new Map<string, string>();
    for (const row of existingTemplates.rows) {
      templateMap.set(row.type, row.id);
    }

    for (const template of PACK_TEMPLATES) {
      let templateId = templateMap.get(template.type);
      if (!templateId) {
        templateId = randomUUID();
        templateMap.set(template.type, templateId);
        await client.query(
          `INSERT INTO pack_templates (id, code, name, description) VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING`,
          [templateId, template.type, template.name, template.description]
        );
      } else {
        await client.query(
          `UPDATE pack_templates SET name = $2, description = $3 WHERE id = $1`,
          [templateId, template.name, template.description]
        );
      }

      const existingSections = await client.query(
        `SELECT id, section_key FROM section_templates WHERE template_id = $1`,
        [templateId]
      );
      const sectionMap = new Map<string, string>();
      for (const row of existingSections.rows) {
        sectionMap.set(row.section_key, row.id);
      }

      let displayOrder = 1;
      for (const section of template.sections) {
        let sectionId = sectionMap.get(section.key);
        if (!sectionId) {
          sectionId = randomUUID();
          sectionMap.set(section.key, sectionId);
          await client.query(
            `INSERT INTO section_templates
              (id, template_id, section_key, title, description, display_order, is_addon, addon_trigger)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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
        } else {
          await client.query(
            `UPDATE section_templates
             SET section_key = $2,
                 title = $3,
                 description = $4,
                 display_order = $5,
                 is_addon = $6,
                 addon_trigger = $7
             WHERE id = $1`,
            [
              sectionId,
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
        (id, organization_id, name, permission_code, pack_id, target_submission_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        projectId,
        input.organizationId,
        input.name,
        input.permissionCode,
        pack.id,
        input.targetSubmissionDate ?? null,
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

export async function getAuthorizationProjects(organizationId: string) {
  await ensurePermissionEcosystems();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ap.id,
              ap.name,
              ap.permission_code,
              ap.status,
              ap.target_submission_date,
              ap.created_at,
              ap.updated_at,
              ap.pack_id,
              pe.name as permission_name,
              pe.description as permission_description,
              pe.typical_timeline_weeks,
              pe.policy_templates,
              pe.training_requirements,
              pe.smcr_roles,
              p.name as pack_name,
              p.status as pack_status,
              p.target_submission_date as pack_target_submission_date,
              COALESCE(pt.type, pt.code) as pack_template_type,
              pt.name as pack_template_name
       FROM authorization_projects ap
       LEFT JOIN permission_ecosystems pe ON pe.permission_code = ap.permission_code
       LEFT JOIN packs p ON p.id = ap.pack_id
       LEFT JOIN pack_templates pt ON pt.id = p.template_id
       WHERE ap.organization_id = $1
       ORDER BY ap.created_at DESC`,
      [organizationId]
    );

    const projects = await Promise.all(
      result.rows.map(async (row) => {
        const readiness = row.pack_id ? await getPackReadiness(row.pack_id) : null;
        return {
          ...row,
          policy_templates: coerceJsonArray<string>(row.policy_templates),
          training_requirements: coerceJsonArray<string>(row.training_requirements),
          smcr_roles: coerceJsonArray<string>(row.smcr_roles),
          readiness,
        };
      })
    );
    return projects;
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
              COALESCE(pt.type, pt.code) as pack_template_type,
              pt.name as pack_template_name
       FROM authorization_projects ap
       LEFT JOIN permission_ecosystems pe ON pe.permission_code = ap.permission_code
       LEFT JOIN packs p ON p.id = ap.pack_id
       LEFT JOIN pack_templates pt ON pt.id = p.template_id
       WHERE ap.id = $1
       LIMIT 1`,
      [projectId]
    );
    const row = result.rows[0];
    if (!row) return null;

    const readiness = row.pack_id ? await getPackReadiness(row.pack_id) : null;
    const sections = row.pack_id ? await getSections(row.pack_id) : [];

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

type ReadinessStatus = "missing" | "partial" | "complete";
type TrainingStatus = "missing" | "in-progress" | "complete";
type SmcrStatus = "unassigned" | "assigned";

interface AssessmentData {
  basics?: Record<string, string | number | null>;
  readiness?: Record<string, ReadinessStatus>;
  policies?: Record<string, ReadinessStatus>;
  training?: Record<string, TrainingStatus>;
  smcr?: Record<string, SmcrStatus>;
  meta?: Record<string, unknown>;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: "pending" | "in-progress" | "blocked" | "complete";
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

const calculateAssessmentCompletion = (assessment: AssessmentData) => {
  const basics = assessment.basics ?? {};
  const basicKeys = [
    "legalName",
    "incorporationDate",
    "primaryJurisdiction",
    "primaryContact",
    "contactEmail",
    "firmStage",
    "regulatedActivities",
    "headcount",
  ];

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

  const total =
    basicKeys.length + readiness.length + policies.length + training.length + smcr.length;
  const completed =
    basicsCompleted + readinessCompleted + policiesCompleted + trainingCompleted + smcrCompleted;

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
    const completion = calculateAssessmentCompletion(normalized);
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

export async function syncPackFromTemplate(packId: string) {
  await syncAuthorizationTemplates();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const packResult = await client.query(`SELECT id, template_id FROM packs WHERE id = $1 LIMIT 1`, [packId]);
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
      `SELECT id, COALESCE(type, code) as type, name, description FROM pack_templates ORDER BY created_at ASC`
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
      `SELECT id, COALESCE(type, code) as type, name FROM pack_templates WHERE type = $1 OR code = $1 LIMIT 1`,
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

export async function getPacks(organizationId: string) {
  await ensureAuthorizationTemplates();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.id, p.name, p.status, p.target_submission_date, p.created_at, p.updated_at,
              COALESCE(pt.type, pt.code) as template_type, pt.name as template_name
       FROM packs p
       JOIN pack_templates pt ON p.template_id = pt.id
       WHERE p.organization_id = $1
       ORDER BY p.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPack(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.id, p.name, p.status, p.target_submission_date, p.created_at, p.updated_at,
              COALESCE(pt.type, pt.code) as template_type, pt.name as template_name
       FROM packs p
       JOIN pack_templates pt ON p.template_id = pt.id
       WHERE p.id = $1
       LIMIT 1`,
      [packId]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function getSections(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const sections = await client.query(
      `SELECT id, section_key, title, display_order, status, owner_id, due_date, review_state
       FROM section_instances
       WHERE pack_id = $1
       ORDER BY display_order ASC`,
      [packId]
    );

    const promptCounts = await client.query(
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
    );

    const evidenceCounts = await client.query(
      `SELECT section_instance_id,
              COUNT(*) FILTER (WHERE status IN ('uploaded', 'approved')) as uploaded,
              COUNT(*) as total
       FROM evidence_items
       WHERE pack_id = $1
       GROUP BY section_instance_id`,
      [packId]
    );

    const reviewCounts = await client.query(
      `SELECT rg.section_instance_id,
              COUNT(*) FILTER (WHERE rg.state = 'approved') as approved,
              COUNT(*) as total
       FROM review_gates rg
       JOIN section_instances si ON rg.section_instance_id = si.id
       WHERE si.pack_id = $1
       GROUP BY rg.section_instance_id`,
      [packId]
    );

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
              pr.value, pr.updated_at
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
       WHERE section_instance_id = $1
       ORDER BY created_at ASC`,
      [section.id]
    );

    const tasks = await client.query(
      `SELECT id, title, status, priority, owner_id, due_date, source
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
}) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO prompt_responses (section_instance_id, prompt_id, value, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (section_instance_id, prompt_id)
       DO UPDATE SET value = $3, updated_by = $4, updated_at = NOW()`,
      [input.sectionInstanceId, input.promptId, input.value, input.updatedBy ?? null]
    );
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
       WHERE ei.pack_id = $1
       ORDER BY si.display_order ASC, ei.created_at ASC`,
      [packId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function listTasks(packId: string) {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT t.id, t.title, t.status, t.priority, t.owner_id, t.due_date, t.source,
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
       WHERE id = $1 AND pack_id = $2
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
       WHERE ei.pack_id = $1 AND ei.id = $2
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
       WHERE ei.pack_id = $1 AND ei.id = $2 AND ev.id = $3
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
       WHERE ei.pack_id = $1
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
       WHERE pack_id = $1 AND file_path IS NOT NULL
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
       WHERE ei.pack_id = $1
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

export async function getPackReadiness(packId: string) {
  const sections = await getSections(packId);
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

function average(values: number[]) {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

function calcPercent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}
