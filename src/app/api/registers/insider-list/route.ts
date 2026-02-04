import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getInsiderListRecords,
  createInsiderListRecord,
  type InsiderListRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
} from "@/lib/validation";
import {
  authenticateRequest,
  checkRateLimit,
  rateLimitExceededResponse,
} from "@/lib/api-auth";
import { notifyRegisterCreated } from "@/lib/server/notification-builders";
import { logError } from "@/lib/logger";

const LIST_STATUSES = ["active", "closed", "archived"] as const;

// GET /api/registers/insider-list - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`insider-list-get-${clientIp}`);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    await initDatabase();

    const { searchParams } = new URL(request.url);
    const organizationId = authResult.user.organizationId;
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getInsiderListRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching insider list records");
    return NextResponse.json(
      { error: "Failed to fetch insider list records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/insider-list - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`insider-list-post-${clientIp}`);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    await initDatabase();

    const body = await request.json();

    // Validate required fields
    const listReference = sanitizeString(body.list_reference);
    if (!listReference) {
      return NextResponse.json(
        { error: "List reference is required" },
        { status: 400 }
      );
    }

    const projectName = sanitizeString(body.project_name);
    if (!projectName) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const insiderName = sanitizeString(body.insider_name);
    if (!insiderName) {
      return NextResponse.json(
        { error: "Insider name is required" },
        { status: 400 }
      );
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const status = body.status || "active";
    if (!isValidEnum(status, LIST_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${LIST_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      list_reference: listReference,
      project_name: projectName,
      insider_name: insiderName,
      insider_role: sanitizeString(body.insider_role) || undefined,
      insider_company: sanitizeString(body.insider_company) || undefined,
      insider_email: sanitizeString(body.insider_email) || undefined,
      insider_phone: sanitizeString(body.insider_phone) || undefined,
      date_added: parseValidDate(body.date_added) || new Date(),
      date_removed: parseValidDate(body.date_removed) || undefined,
      reason_for_access: sanitizeText(body.reason_for_access) || undefined,
      access_granted_by: sanitizeString(body.access_granted_by) || undefined,
      acknowledgment_received: body.acknowledgment_received || false,
      acknowledgment_date: parseValidDate(body.acknowledgment_date) || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createInsiderListRecord(recordData as unknown as Omit<InsiderListRecord, 'id' | 'created_at' | 'updated_at'>);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "insider-list",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating insider list record");
    return NextResponse.json(
      { error: "Failed to create insider list record" },
      { status: 500 }
    );
  }
}
