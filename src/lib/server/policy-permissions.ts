import { pool } from "@/lib/database";
import type { FirmPermissions } from "@/lib/policies";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";

const PERMISSION_KEYS = [
  "investmentServices",
  "paymentServices",
  "eMoney",
  "creditBroking",
  "clientMoney",
  "clientAssets",
  "insuranceMediation",
  "mortgageMediation",
  "dealingAsAgent",
  "dealingAsPrincipal",
  "arrangingDeals",
  "advising",
  "managing",
  "safeguarding",
  "retailClients",
  "professionalClients",
  "eligibleCounterparties",
  "complexProducts",
] as const satisfies Array<keyof FirmPermissions>;

const COLUMN_MAP: Record<keyof FirmPermissions, string> = {
  investmentServices: "investment_services",
  paymentServices: "payment_services",
  eMoney: "e_money",
  creditBroking: "credit_broking",
  clientMoney: "client_money",
  clientAssets: "client_assets",
  insuranceMediation: "insurance_mediation",
  mortgageMediation: "mortgage_mediation",
  dealingAsAgent: "dealing_as_agent",
  dealingAsPrincipal: "dealing_as_principal",
  arrangingDeals: "arranging_deals",
  advising: "advising",
  managing: "managing",
  safeguarding: "safeguarding",
  retailClients: "retail_clients",
  professionalClients: "professional_clients",
  eligibleCounterparties: "eligible_counterparties",
  complexProducts: "complex_products",
};

interface PolicyPermissionsRow {
  organization_id: string;
  [key: string]: unknown;
}

function mapRowToPermissions(row: PolicyPermissionsRow | null): FirmPermissions {
  if (!row) {
    return { ...DEFAULT_PERMISSIONS };
  }

  return PERMISSION_KEYS.reduce((acc, key) => {
    const column = COLUMN_MAP[key];
    return {
      ...acc,
      [key]: Boolean(row[column]),
    };
  }, {} as FirmPermissions);
}

export async function getPolicyPermissions(organizationId: string): Promise<FirmPermissions> {
  const client = await pool.connect();
  try {
    const result = await client.query<PolicyPermissionsRow>(
      `SELECT organization_id, ${PERMISSION_KEYS.map((key) => COLUMN_MAP[key]).join(", ")}
       FROM policy_permissions
       WHERE organization_id = $1
       LIMIT 1`,
      [organizationId],
    );

    if (result.rows.length === 0) {
      await upsertPolicyPermissions(organizationId, DEFAULT_PERMISSIONS);
      return { ...DEFAULT_PERMISSIONS };
    }

    return mapRowToPermissions(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function upsertPolicyPermissions(
  organizationId: string,
  permissions: FirmPermissions,
): Promise<FirmPermissions> {
  const columns = PERMISSION_KEYS.map((key) => COLUMN_MAP[key]);
  const placeholders = PERMISSION_KEYS.map((_, index) => `$${index + 2}`);
  const updateAssignments = columns.map((column) => `${column} = EXCLUDED.${column}`);

  const values = PERMISSION_KEYS.map((key) => permissions[key]);

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO policy_permissions (organization_id, ${columns.join(", ")})
       VALUES ($1, ${placeholders.join(", ")})
       ON CONFLICT (organization_id) DO UPDATE SET
         ${updateAssignments.join(", ")},
         updated_at = NOW()`,
      [organizationId, ...values],
    );

    return permissions;
  } finally {
    client.release();
  }
}
