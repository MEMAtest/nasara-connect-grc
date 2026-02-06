import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAuthorizationProject, getAuthorizationProjects } from "@/lib/authorization-pack-db";
import { PermissionCode } from "@/lib/authorization-pack-ecosystems";
import { requireRole } from "@/lib/rbac";
import {
  ApiError,
  checkRateLimit,
  getPaginationParams,
  handleApiError,
  paginate,
  rateLimitExceeded,
  validateRequest,
} from "@/lib/api-utils";

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  permissionCode: z.string().min(1),
  targetSubmissionDate: z.string().nullish(),
  assessmentData: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

    const { page, limit, offset } = getPaginationParams(request);
    const { projects, total } = await getAuthorizationProjects(auth.organizationId, { limit, offset });
    const payload = paginate(projects, total, page, limit);
    return NextResponse.json({ ...payload, projects: payload.items }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

    const body = await validateRequest(request, CreateProjectSchema);
    const { name, permissionCode, targetSubmissionDate, assessmentData } = body;

    const project = await createAuthorizationProject({
      organizationId: auth.organizationId,
      permissionCode: permissionCode as PermissionCode,
      name: name.trim(),
      targetSubmissionDate: targetSubmissionDate ?? null,
      assessmentData,
    }).catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("Permission ecosystem not found") ||
        message.includes("Template not found")
      ) {
        throw new ApiError(400, "INVALID_PERMISSION", message);
      }
      throw err;
    });

    return NextResponse.json({ project }, { status: 201, headers });
  } catch (error) {
    return handleApiError(error);
  }
}
