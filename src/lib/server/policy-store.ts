import { pool } from "@/lib/database";
import type { FirmPermissions } from "@/lib/policies";
import type { PolicyClause, PolicyTemplate } from "@/lib/policies/templates";

export type PolicyStatus = "draft" | "in_review" | "approved";

export interface StoredPolicy {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string;
  permissions: FirmPermissions;
  template: PolicyTemplate;
  clauses: PolicyClause[];
  customContent: Record<string, string>;
  approvals: {
    requiresSMF: boolean;
    smfRole?: string | null;
    requiresBoard: boolean;
    boardFrequency: "annual" | "semi-annual" | "quarterly";
    additionalApprovers: string[];
  };
  status: PolicyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyInput {
  code: string;
  name: string;
  description: string;
  permissions: FirmPermissions;
  template: PolicyTemplate;
  clauses: PolicyClause[];
  customContent: Record<string, string>;
  approvals: StoredPolicy["approvals"];
  status?: PolicyStatus;
  id?: string;
}

export type UpdatePolicyInput = Partial<
  Pick<StoredPolicy, "name" | "description" | "permissions" | "clauses" | "customContent" | "approvals" | "status">
>;

interface PolicyRow {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string;
  permissions: FirmPermissions;
  template: PolicyTemplate;
  clauses: PolicyClause[];
  custom_content: Record<string, string>;
  approvals: StoredPolicy["approvals"];
  status: PolicyStatus;
  created_at: string | Date;
  updated_at: string | Date;
}

function toStoredPolicy(row: PolicyRow): StoredPolicy {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString();
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString();
  return {
    id: row.id,
    organizationId: row.organization_id,
    code: row.code,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
    template: row.template,
    clauses: row.clauses,
    customContent: row.custom_content ?? {},
    approvals: {
      ...row.approvals,
      additionalApprovers: row.approvals?.additionalApprovers ?? [],
    },
    status: row.status,
    createdAt,
    updatedAt,
  };
}

export async function getPoliciesForOrganization(organizationId: string): Promise<StoredPolicy[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<PolicyRow>(
      `SELECT id, organization_id, code, name, description, permissions, template, clauses, custom_content, approvals, status, created_at, updated_at
       FROM policies
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [organizationId],
    );
    return result.rows.map(toStoredPolicy);
  } finally {
    client.release();
  }
}

export async function getPolicyById(organizationId: string, policyId: string): Promise<StoredPolicy | null> {
  const client = await pool.connect();
  try {
    const result = await client.query<PolicyRow>(
      `SELECT id, organization_id, code, name, description, permissions, template, clauses, custom_content, approvals, status, created_at, updated_at
       FROM policies
       WHERE organization_id = $1 AND id = $2
       LIMIT 1`,
      [organizationId, policyId],
    );
    if (result.rows.length === 0) return null;
    return toStoredPolicy(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function createPolicy(organizationId: string, input: CreatePolicyInput): Promise<StoredPolicy> {
  const client = await pool.connect();
  try {
    const permissionsJson = JSON.stringify(input.permissions ?? {});
    const templateJson = JSON.stringify(input.template ?? {});
    const clausesJson = JSON.stringify(input.clauses ?? []);
    const customContentJson = JSON.stringify(input.customContent ?? {});
    const approvalsJson = JSON.stringify(input.approvals ?? {});
    const result = await client.query<PolicyRow>(
      `INSERT INTO policies (id, organization_id, code, name, description, permissions, template, clauses, custom_content, approvals, status)
       VALUES (
         COALESCE($1::uuid, gen_random_uuid()),
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         COALESCE($11, 'draft')
       )
       RETURNING id, organization_id, code, name, description, permissions, template, clauses, custom_content, approvals, status, created_at, updated_at`,
      [
        input.id ?? null,
        organizationId,
        input.code,
        input.name,
        input.description,
        permissionsJson,
        templateJson,
        clausesJson,
        customContentJson,
        approvalsJson,
        input.status ?? null,
      ],
    );
    return toStoredPolicy(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function updatePolicy(
  organizationId: string,
  policyId: string,
  updates: UpdatePolicyInput,
): Promise<StoredPolicy | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex += 1;
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(updates.description);
    paramIndex += 1;
  }

  if (updates.permissions !== undefined) {
    fields.push(`permissions = $${paramIndex}`);
    values.push(JSON.stringify(updates.permissions));
    paramIndex += 1;
  }

  if (updates.clauses !== undefined) {
    fields.push(`clauses = $${paramIndex}`);
    values.push(JSON.stringify(updates.clauses));
    paramIndex += 1;
  }

  if (updates.customContent !== undefined) {
    fields.push(`custom_content = $${paramIndex}`);
    values.push(JSON.stringify(updates.customContent));
    paramIndex += 1;
  }

  if (updates.approvals !== undefined) {
    fields.push(`approvals = $${paramIndex}`);
    values.push(JSON.stringify(updates.approvals));
    paramIndex += 1;
  }

  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex += 1;
  }

  if (fields.length === 0) {
    return getPolicyById(organizationId, policyId);
  }

  fields.push(`updated_at = NOW()`);

  const client = await pool.connect();
  try {
    const query = `UPDATE policies
      SET ${fields.join(", ")}
      WHERE organization_id = $${paramIndex} AND id = $${paramIndex + 1}
      RETURNING id, organization_id, code, name, description, permissions, template, clauses, custom_content, approvals, status, created_at, updated_at`;
    const result = await client.query<PolicyRow>(query, [...values, organizationId, policyId]);
    if (result.rows.length === 0) {
      return null;
    }
    return toStoredPolicy(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function deletePolicy(organizationId: string, policyId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM policies WHERE organization_id = $1 AND id = $2`,
      [organizationId, policyId],
    );
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}
