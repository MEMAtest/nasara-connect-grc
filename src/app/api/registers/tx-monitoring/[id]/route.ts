import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getTxMonitoringRecords,
  updateTxMonitoringRecord,
  deleteTxMonitoringRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
} from "@/lib/validation";
import { requireAuth } from "@/lib/auth-utils";

const ALERT_TYPES = ["high_value", "unusual_pattern", "structuring", "rapid_movement", "dormant_account", "geographic", "other"] as const;
const ALERT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
const INVESTIGATION_OUTCOMES = ["cleared", "sar_filed", "account_closed", "enhanced_monitoring", "pending"] as const;
const STATUSES = ["open", "assigned", "investigating", "escalated", "closed"] as const;

// PATCH /api/registers/tx-monitoring/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid record ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.alert_type && !isValidEnum(body.alert_type, ALERT_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid alert type. Must be one of: ${ALERT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.alert_severity && !isValidEnum(body.alert_severity, ALERT_SEVERITIES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid alert severity. Must be one of: ${ALERT_SEVERITIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.investigation_outcome && !isValidEnum(body.investigation_outcome, INVESTIGATION_OUTCOMES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid investigation outcome. Must be one of: ${INVESTIGATION_OUTCOMES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.alert_reference !== undefined) updateData.alert_reference = sanitizeString(body.alert_reference);
    if (body.alert_date !== undefined) updateData.alert_date = parseValidDate(body.alert_date);
    if (body.alert_type !== undefined) updateData.alert_type = body.alert_type;
    if (body.alert_severity !== undefined) updateData.alert_severity = body.alert_severity;
    if (body.customer_id !== undefined) updateData.customer_id = sanitizeString(body.customer_id);
    if (body.customer_name !== undefined) updateData.customer_name = sanitizeString(body.customer_name);
    if (body.account_number !== undefined) updateData.account_number = sanitizeString(body.account_number);
    if (body.transaction_amount !== undefined) updateData.transaction_amount = parseFloat(body.transaction_amount);
    if (body.transaction_currency !== undefined) updateData.transaction_currency = sanitizeString(body.transaction_currency);
    if (body.transaction_date !== undefined) updateData.transaction_date = parseValidDate(body.transaction_date);
    if (body.alert_description !== undefined) updateData.alert_description = sanitizeText(body.alert_description);
    if (body.rule_triggered !== undefined) updateData.rule_triggered = sanitizeString(body.rule_triggered);
    if (body.assigned_to !== undefined) updateData.assigned_to = sanitizeString(body.assigned_to);
    if (body.assigned_date !== undefined) updateData.assigned_date = parseValidDate(body.assigned_date);
    if (body.investigation_start_date !== undefined) updateData.investigation_start_date = parseValidDate(body.investigation_start_date);
    if (body.investigation_end_date !== undefined) updateData.investigation_end_date = parseValidDate(body.investigation_end_date);
    if (body.investigation_notes !== undefined) updateData.investigation_notes = sanitizeText(body.investigation_notes);
    if (body.investigation_outcome !== undefined) updateData.investigation_outcome = body.investigation_outcome;
    if (body.escalated !== undefined) updateData.escalated = body.escalated;
    if (body.escalated_to !== undefined) updateData.escalated_to = sanitizeString(body.escalated_to);
    if (body.escalated_date !== undefined) updateData.escalated_date = parseValidDate(body.escalated_date);
    if (body.sar_reference !== undefined) updateData.sar_reference = sanitizeString(body.sar_reference);
    if (body.sar_filed_date !== undefined) updateData.sar_filed_date = parseValidDate(body.sar_filed_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.closed_date !== undefined) updateData.closed_date = parseValidDate(body.closed_date);
    if (body.closed_by !== undefined) updateData.closed_by = sanitizeString(body.closed_by);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const records = await getTxMonitoringRecords(auth.organizationId);
    const existing = records.find((item) => item.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record = await updateTxMonitoringRecord(id, updateData);

    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating tx monitoring record:", error);
    return NextResponse.json(
      { error: "Failed to update tx monitoring record" },
      { status: 500 }
    );
  }
}

// DELETE /api/registers/tx-monitoring/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid record ID format" },
        { status: 400 }
      );
    }

    const records = await getTxMonitoringRecords(auth.organizationId);
    const existing = records.find((item) => item.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const deleted = await deleteTxMonitoringRecord(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tx monitoring record:", error);
    return NextResponse.json(
      { error: "Failed to delete tx monitoring record" },
      { status: 500 }
    );
  }
}
