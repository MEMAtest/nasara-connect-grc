import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPack, getPack, getPackTemplates, getPacks } from "@/lib/authorization-pack-db";
import { requireAuth } from "@/lib/auth-utils";
import { createNotification } from "@/lib/server/notifications-store";
import {
  checkRateLimit,
  getPaginationParams,
  handleApiError,
  paginate,
  rateLimitExceeded,
  validateRequest,
} from "@/lib/api-utils";

const CreatePackSchema = z.object({
  templateType: z.string().min(1),
  name: z.string().min(1).max(255),
  targetSubmissionDate: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

    const { page, limit, offset } = getPaginationParams(request);
    const { packs, total } = await getPacks(auth.organizationId, { limit, offset });

    // Transform to expected format
    const formattedPacks = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      status: pack.status,
      target_submission_date: pack.target_submission_date,
      created_at: pack.created_at,
      updated_at: pack.updated_at,
      template_type: pack.template_type,
      template_name: pack.template_name,
    }));

    const payload = paginate(formattedPacks, total, page, limit);
    return NextResponse.json({ ...payload, packs: payload.items }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

    const body = await validateRequest(request, CreatePackSchema);
    const templateType = body.templateType;
    const name = body.name.trim();
    const targetSubmissionDate = body.targetSubmissionDate || null;

    // Get template by code or pack_type
    const templates = await getPackTemplates();
    const template = templates.find((t) => t.type === templateType || t.code === templateType);

    if (!template) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
    }

    const created = await createPack({
      organizationId: auth.organizationId,
      templateType: template.type,
      name,
      targetSubmissionDate,
    });
    const pack = await getPack(created.id);

    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "Authorization pack created",
        message: `Pack "${name}" created from ${template.name}.`,
        severity: "success",
        source: "authorization-pack",
        link: "/authorization-pack",
        metadata: { packId: created.id, templateType: template.type },
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ pack: pack ?? { id: created.id } }, { status: 201, headers });
  } catch (error) {
    return handleApiError(error);
  }
}
