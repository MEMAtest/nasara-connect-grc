import { NextRequest, NextResponse } from "next/server";
import { pool, getOrganizationSettings, getRegisterSubscriptions } from "@/lib/database";
import { requireAuth, isAuthDisabled } from "@/lib/auth-utils";

interface RegisterStats {
  code: string;
  count: number;
  activeCount?: number;
  pendingCount?: number;
}

// Map of register codes to their table names and status columns
const REGISTER_TABLES: Record<
  string,
  { table: string; statusColumn: string; activeStatuses: string[]; pendingStatuses: string[] }
> = {
  pep: { table: "pep_records", statusColumn: "status", activeStatuses: ["active", "under_review"], pendingStatuses: [] },
  sanctions: { table: "sanctions_screening_records", statusColumn: "status", activeStatuses: ["in_review", "escalated"], pendingStatuses: ["pending"] },
  "aml-cdd": { table: "aml_cdd_records", statusColumn: "overall_status", activeStatuses: ["in_progress"], pendingStatuses: ["pending_review"] },
  "edd-cases": { table: "edd_cases_records", statusColumn: "status", activeStatuses: ["open", "under_review", "escalated"], pendingStatuses: [] },
  "sar-nca": { table: "sar_nca_records", statusColumn: "status", activeStatuses: ["draft", "under_review", "consent_pending"], pendingStatuses: [] },
  "tx-monitoring": { table: "tx_monitoring_records", statusColumn: "status", activeStatuses: ["open", "investigating"], pendingStatuses: ["pending"] },
  complaints: { table: "complaints_records", statusColumn: "status", activeStatuses: ["open", "investigating", "escalated"], pendingStatuses: [] },
  conflicts: { table: "coi_records", statusColumn: "status", activeStatuses: ["active", "mitigated"], pendingStatuses: [] },
  "gifts-hospitality": { table: "gifts_hospitality_records", statusColumn: "approval_status", activeStatuses: ["approved"], pendingStatuses: ["pending"] },
  "fin-prom": { table: "fin_prom_records", statusColumn: "status", activeStatuses: ["live"], pendingStatuses: ["draft"] },
  "vulnerable-customers": { table: "vulnerable_customers_records", statusColumn: "status", activeStatuses: ["active", "monitoring"], pendingStatuses: [] },
  "product-governance": { table: "product_governance_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["draft", "review"] },
  "tc-record": { table: "tc_record_records", statusColumn: "status", activeStatuses: ["active", "competent"], pendingStatuses: ["in_training", "assessment_due"] },
  "smcr-certification": { table: "smcr_certification_records", statusColumn: "status", activeStatuses: ["active", "certified"], pendingStatuses: ["pending", "renewal_due"] },
  "regulatory-returns": { table: "regulatory_returns_records", statusColumn: "status", activeStatuses: ["submitted"], pendingStatuses: ["pending", "overdue"] },
  "pa-dealing": { table: "pa_dealing_records", statusColumn: "status", activeStatuses: ["approved"], pendingStatuses: ["pending_approval"] },
  "insider-list": { table: "insider_list_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: [] },
  "outside-business": { table: "outside_business_records", statusColumn: "status", activeStatuses: ["active", "approved"], pendingStatuses: ["pending_approval"] },
  incidents: { table: "incident_records", statusColumn: "status", activeStatuses: ["detected", "investigating", "contained"], pendingStatuses: [] },
  "third-party": { table: "third_party_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["pending", "under_review"] },
  "data-breach-dsar": { table: "data_breach_dsar_records", statusColumn: "status", activeStatuses: ["open", "investigating"], pendingStatuses: ["pending"] },
  "op-resilience": { table: "op_resilience_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["testing", "review"] },
  "regulatory-breach": { table: "regulatory_breach_records", statusColumn: "status", activeStatuses: ["open", "investigating", "remediation"], pendingStatuses: [] },
};

async function getRegisterStats(
  organizationIds: string[],
  registerCodes: string[]
): Promise<Record<string, RegisterStats>> {
  const stats: Record<string, RegisterStats> = {};
  const client = await pool.connect();
  const orgIds = Array.from(new Set(organizationIds.filter(Boolean)));

  try {
    for (const code of registerCodes) {
      const tableConfig = REGISTER_TABLES[code];
      if (!tableConfig) {
        stats[code] = { code, count: 0 };
        continue;
      }

      try {
        // Get total count
        const countResult = await client.query(
          `SELECT COUNT(*) as count FROM ${tableConfig.table} WHERE organization_id = ANY($1)`,
          [orgIds]
        );
        const count = parseInt(countResult.rows[0].count, 10);

        // Get active count
        let activeCount = 0;
        if (tableConfig.activeStatuses.length > 0) {
          const activeResult = await client.query(
            `SELECT COUNT(*) as count FROM ${tableConfig.table} WHERE organization_id = ANY($1) AND ${tableConfig.statusColumn} = ANY($2)`,
            [orgIds, tableConfig.activeStatuses]
          );
          activeCount = parseInt(activeResult.rows[0].count, 10);
        }

        // Get pending count
        let pendingCount = 0;
        if (tableConfig.pendingStatuses.length > 0) {
          const pendingResult = await client.query(
            `SELECT COUNT(*) as count FROM ${tableConfig.table} WHERE organization_id = ANY($1) AND ${tableConfig.statusColumn} = ANY($2)`,
            [orgIds, tableConfig.pendingStatuses]
          );
          pendingCount = parseInt(pendingResult.rows[0].count, 10);
        }

        stats[code] = { code, count, activeCount, pendingCount };
      } catch (tableError) {
        // Table might not exist yet, just return zero stats
        stats[code] = { code, count: 0 };
      }
    }
  } finally {
    client.release();
  }

  return stats;
}

export async function GET(request: NextRequest) {
  // Require authentication
  const { auth, error } = await requireAuth();
  if (error) return error;

  try {
    // Get organization ID from authenticated user
    const organizationId = auth.organizationId;

    // Get organization settings
    const settings = await getOrganizationSettings(organizationId);

    // Get register subscriptions
    const subscriptions = await getRegisterSubscriptions(organizationId);
    const enabledCodes = subscriptions
      .filter((s) => s.enabled)
      .map((s) => s.register_code);

    // Get stats for enabled registers
    const orgIds = isAuthDisabled() && organizationId !== "default-org"
      ? [organizationId, "default-org"]
      : [organizationId];
    const stats = await getRegisterStats(orgIds, enabledCodes);

    return NextResponse.json({
      firmType: settings?.firm_type || null,
      wizardCompleted: settings?.wizard_completed || false,
      wizardCompletedAt: settings?.wizard_completed_at || null,
      enabledRegisters: enabledCodes,
      registerStats: stats,
      subscriptions,
    });
  } catch (error) {
    console.error("Error getting my registers:", error);
    return NextResponse.json(
      { error: "Failed to get registers" },
      { status: 500 }
    );
  }
}
