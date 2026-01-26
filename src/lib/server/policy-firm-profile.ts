import { pool } from "@/lib/database";

export interface PolicyFirmProfileRecord {
  organizationId: string;
  firmProfile: Record<string, unknown>;
  governanceDefaults: Record<string, unknown>;
  linkedProjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface PolicyFirmProfileRow {
  organization_id: string;
  firm_profile: Record<string, unknown> | null;
  governance_defaults: Record<string, unknown> | null;
  linked_project_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

const toRecord = (row: PolicyFirmProfileRow): PolicyFirmProfileRecord => ({
  organizationId: row.organization_id,
  firmProfile: row.firm_profile ?? {},
  governanceDefaults: row.governance_defaults ?? {},
  linkedProjectIds: row.linked_project_ids ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function getPolicyFirmProfile(organizationId: string): Promise<PolicyFirmProfileRecord | null> {
  const client = await pool.connect();
  try {
    const result = await client.query<PolicyFirmProfileRow>(
      `SELECT organization_id, firm_profile, governance_defaults, linked_project_ids, created_at, updated_at
       FROM policy_firm_profiles
       WHERE organization_id = $1
       LIMIT 1`,
      [organizationId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return toRecord(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function upsertPolicyFirmProfile(
  organizationId: string,
  payload: {
    firmProfile?: Record<string, unknown>;
    governanceDefaults?: Record<string, unknown>;
    linkedProjectIds?: string[];
  },
): Promise<PolicyFirmProfileRecord> {
  const client = await pool.connect();
  try {
    const existing = await getPolicyFirmProfile(organizationId);
    const firmProfile = payload.firmProfile ?? existing?.firmProfile ?? {};
    const governanceDefaults = payload.governanceDefaults ?? existing?.governanceDefaults ?? {};
    const linkedProjectIds = payload.linkedProjectIds ?? existing?.linkedProjectIds ?? [];

    const result = await client.query<PolicyFirmProfileRow>(
      `INSERT INTO policy_firm_profiles (
          organization_id,
          firm_profile,
          governance_defaults,
          linked_project_ids
        )
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id) DO UPDATE SET
          firm_profile = EXCLUDED.firm_profile,
          governance_defaults = EXCLUDED.governance_defaults,
          linked_project_ids = EXCLUDED.linked_project_ids,
          updated_at = NOW()
       RETURNING organization_id, firm_profile, governance_defaults, linked_project_ids, created_at, updated_at`,
      [organizationId, JSON.stringify(firmProfile), JSON.stringify(governanceDefaults), linkedProjectIds],
    );

    return toRecord(result.rows[0]);
  } finally {
    client.release();
  }
}
