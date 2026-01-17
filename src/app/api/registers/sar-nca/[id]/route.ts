import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  updateSarNcaRecord,
  deleteSarNcaRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
} from "@/lib/validation";

const SUBJECT_TYPES = ["individual", "company", "trust", "other"] as const;
const SUSPICION_TYPES = ["money_laundering", "terrorist_financing", "fraud", "tax_evasion", "sanctions_breach", "other"] as const;
const MLRO_DECISIONS = ["pending", "submit_sar", "no_sar", "escalate"] as const;
const STATUSES = ["draft", "under_review", "submitted", "consent_pending", "closed"] as const;

// PATCH /api/registers/sar-nca/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    if (body.subject_type && !isValidEnum(body.subject_type, SUBJECT_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid subject type. Must be one of: ${SUBJECT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.suspicion_type && !isValidEnum(body.suspicion_type, SUSPICION_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid suspicion type. Must be one of: ${SUSPICION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.mlro_decision && !isValidEnum(body.mlro_decision, MLRO_DECISIONS as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid MLRO decision. Must be one of: ${MLRO_DECISIONS.join(", ")}` },
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

    if (body.sar_reference !== undefined) updateData.sar_reference = sanitizeString(body.sar_reference);
    if (body.internal_reference !== undefined) updateData.internal_reference = sanitizeString(body.internal_reference);
    if (body.subject_name !== undefined) updateData.subject_name = sanitizeString(body.subject_name);
    if (body.subject_type !== undefined) updateData.subject_type = body.subject_type;
    if (body.suspicion_type !== undefined) updateData.suspicion_type = body.suspicion_type;
    if (body.suspicion_description !== undefined) updateData.suspicion_description = sanitizeText(body.suspicion_description);
    if (body.discovery_date !== undefined) updateData.discovery_date = parseValidDate(body.discovery_date);
    if (body.reporter !== undefined) updateData.reporter = sanitizeString(body.reporter);
    if (body.mlro_review_date !== undefined) updateData.mlro_review_date = parseValidDate(body.mlro_review_date);
    if (body.mlro_decision !== undefined) updateData.mlro_decision = body.mlro_decision;
    if (body.mlro_rationale !== undefined) updateData.mlro_rationale = sanitizeText(body.mlro_rationale);
    if (body.submitted_to_nca !== undefined) updateData.submitted_to_nca = body.submitted_to_nca;
    if (body.nca_submission_date !== undefined) updateData.nca_submission_date = parseValidDate(body.nca_submission_date);
    if (body.nca_reference !== undefined) updateData.nca_reference = sanitizeString(body.nca_reference);
    if (body.consent_required !== undefined) updateData.consent_required = body.consent_required;
    if (body.consent_requested_date !== undefined) updateData.consent_requested_date = parseValidDate(body.consent_requested_date);
    if (body.consent_received !== undefined) updateData.consent_received = body.consent_received;
    if (body.consent_received_date !== undefined) updateData.consent_received_date = parseValidDate(body.consent_received_date);
    if (body.consent_expiry_date !== undefined) updateData.consent_expiry_date = parseValidDate(body.consent_expiry_date);
    if (body.daml_requested !== undefined) updateData.daml_requested = body.daml_requested;
    if (body.daml_reference !== undefined) updateData.daml_reference = sanitizeString(body.daml_reference);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.outcome !== undefined) updateData.outcome = sanitizeText(body.outcome);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateSarNcaRecord(id, updateData);

    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating SAR-NCA record:", error);
    return NextResponse.json(
      { error: "Failed to update SAR-NCA record" },
      { status: 500 }
    );
  }
}

// DELETE /api/registers/sar-nca/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid record ID format" },
        { status: 400 }
      );
    }

    const deleted = await deleteSarNcaRecord(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting SAR-NCA record:", error);
    return NextResponse.json(
      { error: "Failed to delete SAR-NCA record" },
      { status: 500 }
    );
  }
}
