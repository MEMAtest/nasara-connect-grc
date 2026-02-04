import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPaDealingRecords,
  updatePaDealingRecord,
  deletePaDealingRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
} from "@/lib/validation";
import { requireRole } from "@/lib/rbac";

const REQUEST_TYPES = ["buy", "sell", "transfer"] as const;
const INSTRUMENT_TYPES = ["equity", "bond", "fund", "etf", "derivative", "crypto", "other"] as const;
const PRE_CLEARANCE_STATUSES = ["pending", "approved", "rejected", "expired"] as const;
const STATUSES = ["pending", "approved", "executed", "cancelled", "expired"] as const;

// PATCH /api/registers/pa-dealing/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
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
    if (body.request_type && !isValidEnum(body.request_type, REQUEST_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid request type. Must be one of: ${REQUEST_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.instrument_type && !isValidEnum(body.instrument_type, INSTRUMENT_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid instrument type. Must be one of: ${INSTRUMENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.pre_clearance_status && !isValidEnum(body.pre_clearance_status, PRE_CLEARANCE_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid pre-clearance status. Must be one of: ${PRE_CLEARANCE_STATUSES.join(", ")}` },
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

    if (body.request_reference !== undefined) updateData.request_reference = sanitizeString(body.request_reference);
    if (body.employee_name !== undefined) updateData.employee_name = sanitizeString(body.employee_name);
    if (body.employee_id !== undefined) updateData.employee_id = sanitizeString(body.employee_id);
    if (body.request_type !== undefined) updateData.request_type = body.request_type;
    if (body.instrument_type !== undefined) updateData.instrument_type = body.instrument_type;
    if (body.instrument_name !== undefined) updateData.instrument_name = sanitizeString(body.instrument_name);
    if (body.isin !== undefined) updateData.isin = sanitizeString(body.isin);
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity);
    if (body.estimated_value !== undefined) updateData.estimated_value = parseFloat(body.estimated_value);
    if (body.currency !== undefined) updateData.currency = sanitizeString(body.currency);
    if (body.broker_account !== undefined) updateData.broker_account = sanitizeString(body.broker_account);
    if (body.reason_for_trade !== undefined) updateData.reason_for_trade = sanitizeText(body.reason_for_trade);
    if (body.request_date !== undefined) updateData.request_date = parseValidDate(body.request_date);
    if (body.pre_clearance_status !== undefined) updateData.pre_clearance_status = body.pre_clearance_status;
    if (body.approved_by !== undefined) updateData.approved_by = sanitizeString(body.approved_by);
    if (body.approval_date !== undefined) updateData.approval_date = parseValidDate(body.approval_date);
    if (body.approval_conditions !== undefined) updateData.approval_conditions = sanitizeText(body.approval_conditions);
    if (body.execution_date !== undefined) updateData.execution_date = parseValidDate(body.execution_date);
    if (body.execution_price !== undefined) updateData.execution_price = parseFloat(body.execution_price);
    if (body.holding_period_end !== undefined) updateData.holding_period_end = parseValidDate(body.holding_period_end);
    if (body.restricted_list_check !== undefined) updateData.restricted_list_check = body.restricted_list_check;
    if (body.conflict_check !== undefined) updateData.conflict_check = body.conflict_check;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const records = await getPaDealingRecords(auth.organizationId);
    const existing = records.find((item) => item.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record = await updatePaDealingRecord(id, updateData);

    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating PA dealing record:", error);
    return NextResponse.json(
      { error: "Failed to update PA dealing record" },
      { status: 500 }
    );
  }
}

// DELETE /api/registers/pa-dealing/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid record ID format" },
        { status: 400 }
      );
    }

    const records = await getPaDealingRecords(auth.organizationId);
    const existing = records.find((item) => item.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const deleted = await deletePaDealingRecord(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting PA dealing record:", error);
    return NextResponse.json(
      { error: "Failed to delete PA dealing record" },
      { status: 500 }
    );
  }
}
