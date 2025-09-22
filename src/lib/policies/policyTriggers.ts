import { pool } from "@/lib/database";

export type TriggerReason =
  | "high_risk_trigger"
  | "breach_report"
  | "incident_logged"
  | "kri_threshold"
  | "scheduled_review";

export interface PolicyTriggerEvent {
  id: string;
  organizationId: string;
  policyId: string | null;
  reason: TriggerReason;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  resolvedAt?: string | null;
}

interface TriggerRow {
  id: string;
  organization_id: string;
  policy_id: string | null;
  reason: string;
  metadata: Record<string, unknown> | null;
  triggered_at: string | Date;
  resolved_at: string | Date | null;
}

function toTriggerEvent(row: TriggerRow): PolicyTriggerEvent {
  const createdAt = row.triggered_at instanceof Date ? row.triggered_at.toISOString() : new Date(row.triggered_at).toISOString();
  const resolvedAt = row.resolved_at
    ? row.resolved_at instanceof Date
      ? row.resolved_at.toISOString()
      : new Date(row.resolved_at).toISOString()
    : null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    policyId: row.policy_id,
    reason: row.reason as TriggerReason,
    metadata: row.metadata,
    createdAt,
    resolvedAt,
  };
}

export async function recordTrigger(organizationId: string, event: Omit<PolicyTriggerEvent, "createdAt" | "organizationId">) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO policy_triggers (id, organization_id, policy_id, reason, metadata, triggered_at)
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6
       )`,
      [
        event.id,
        organizationId,
        event.policyId,
        event.reason,
        event.metadata ?? {},
        new Date().toISOString(),
      ],
    );
  } finally {
    client.release();
  }
}

export async function getTriggers(organizationId: string): Promise<PolicyTriggerEvent[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<TriggerRow>(
      `SELECT id, organization_id, policy_id, reason, metadata, triggered_at, resolved_at
       FROM policy_triggers
       WHERE organization_id = $1
       ORDER BY triggered_at DESC`,
      [organizationId],
    );

    return result.rows.map(toTriggerEvent);
  } finally {
    client.release();
  }
}

export async function resolveTrigger(organizationId: string, triggerId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE policy_triggers
       SET resolved_at = NOW()
       WHERE organization_id = $1 AND id = $2`,
      [organizationId, triggerId],
    );
  } finally {
    client.release();
  }
}
