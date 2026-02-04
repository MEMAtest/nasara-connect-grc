import { NextResponse } from "next/server";
import { pool, getOrganizationSettings, getRegisterSubscriptions } from "@/lib/database";
import { requireAuth } from "@/lib/auth-utils";

interface RegisterStats {
  code: string;
  count: number;
  activeCount?: number;
  pendingCount?: number;
}

// Map of register codes to their table names and status columns
const REGISTER_TABLES: Record<
  string,
  { table: string; statusColumn: string; activeStatuses: string[]; pendingStatuses: string[]; pendingStatusColumn?: string }
> = {
  pep: { table: "pep_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["under_review"] },
  sanctions: { table: "sanctions_screening_records", statusColumn: "status", activeStatuses: ["in_review", "escalated"], pendingStatuses: ["pending"] },
  "aml-cdd": { table: "aml_cdd_records", statusColumn: "overall_status", activeStatuses: ["in_progress", "on_hold"], pendingStatuses: ["pending_review"] },
  "edd-cases": { table: "edd_cases_records", statusColumn: "status", activeStatuses: ["open", "escalated"], pendingStatuses: ["under_review"] },
  "sar-nca": { table: "sar_nca_records", statusColumn: "status", activeStatuses: ["draft", "submitted"], pendingStatuses: ["under_review", "consent_pending"] },
  "tx-monitoring": { table: "tx_monitoring_records", statusColumn: "status", activeStatuses: ["open", "assigned", "investigating", "escalated"], pendingStatuses: [] },
  complaints: { table: "complaints_records", statusColumn: "status", activeStatuses: ["open", "investigating", "escalated"], pendingStatuses: [] },
  conflicts: { table: "coi_records", statusColumn: "status", activeStatuses: ["active", "mitigated"], pendingStatuses: [] },
  "gifts-hospitality": { table: "gifts_hospitality_records", statusColumn: "approval_status", activeStatuses: ["approved", "not_required"], pendingStatuses: ["pending"] },
  "fin-prom": { table: "fin_prom_records", statusColumn: "status", activeStatuses: ["live", "paused"], pendingStatuses: ["draft"] },
  "vulnerable-customers": { table: "vulnerable_customers_records", statusColumn: "status", activeStatuses: ["active", "monitoring"], pendingStatuses: [] },
  "product-governance": { table: "product_governance_records", statusColumn: "status", activeStatuses: ["approved", "live"], pendingStatuses: ["draft"] },
  "tc-record": { table: "tc_record_records", statusColumn: "status", activeStatuses: ["active", "on_leave", "suspended"], pendingStatuses: [] },
  "smcr-certification": { table: "smcr_certification_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["pending", "under_review"] },
  "regulatory-returns": { table: "regulatory_returns_records", statusColumn: "status", activeStatuses: ["upcoming", "in_progress"], pendingStatuses: ["overdue"] },
  "pa-dealing": { table: "pa_dealing_records", statusColumn: "status", activeStatuses: ["approved", "executed"], pendingStatuses: ["pending"] },
  "insider-list": { table: "insider_list_records", statusColumn: "list_status", activeStatuses: ["active"], pendingStatuses: [] },
  "outside-business": { table: "outside_business_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["pending"], pendingStatusColumn: "approval_status" },
  incidents: { table: "incident_records", statusColumn: "status", activeStatuses: ["detected", "investigating", "contained"], pendingStatuses: [] },
  "third-party": { table: "third_party_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["pending", "under_review"] },
  "data-breach-dsar": { table: "data_breach_dsar_records", statusColumn: "status", activeStatuses: ["open", "investigating", "remediation"], pendingStatuses: [] },
  "op-resilience": { table: "op_resilience_records", statusColumn: "status", activeStatuses: ["active"], pendingStatuses: ["under_review"] },
  "regulatory-breach": { table: "regulatory_breach_records", statusColumn: "status", activeStatuses: ["open", "investigating", "remediation", "reported"], pendingStatuses: [] },
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
          const pendingColumn = tableConfig.pendingStatusColumn || tableConfig.statusColumn;
          const pendingResult = await client.query(
            `SELECT COUNT(*) as count FROM ${tableConfig.table} WHERE organization_id = ANY($1) AND ${pendingColumn} = ANY($2)`,
            [orgIds, tableConfig.pendingStatuses]
          );
          pendingCount = parseInt(pendingResult.rows[0].count, 10);
        }

        stats[code] = { code, count, activeCount, pendingCount };
      } catch {
        // Table might not exist yet, just return zero stats
        stats[code] = { code, count: 0 };
      }
    }
  } finally {
    client.release();
  }

  return stats;
}

export async function GET() {
  // Require authentication
  const { auth, error } = await requireAuth();
  if (error) return error;

  try {
    const organizationId = auth.organizationId;

    const settings = await getOrganizationSettings(organizationId);
    const subscriptions = await getRegisterSubscriptions(organizationId);

    const enabledCodes = subscriptions
      .filter((s) => s.enabled)
      .map((s) => s.register_code);

    // Get stats for enabled registers
    const stats = await getRegisterStats([organizationId], enabledCodes);

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
