import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse } from "@/lib/api-auth";
import { requireAuth, DEFAULT_ORG_ID } from "@/lib/auth-utils";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { sanitizeString, sanitizeText } from "@/lib/validation";
import { createNotification, listNotifications } from "@/lib/server/notifications-store";
import type { NotificationSeverity } from "@/lib/notifications/types";
import { logError } from "@/lib/logger";

const ALLOWED_SEVERITIES: NotificationSeverity[] = ["info", "warning", "critical", "success"];

function resolveOrganizationIds(primary: string): string[] {
  if (primary === "default-org" || primary === DEFAULT_ORGANIZATION_ID || primary === DEFAULT_ORG_ID) {
    return Array.from(new Set(["default-org", DEFAULT_ORGANIZATION_ID, DEFAULT_ORG_ID]));
  }
  return [primary];
}

export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const offsetParam = Number.parseInt(searchParams.get("offset") ?? "", 10);
    const limit = Number.isFinite(limitParam) ? limitParam : 10;
    const offset = Number.isFinite(offsetParam) ? offsetParam : 0;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await listNotifications({
      organizationIds: resolveOrganizationIds(auth.organizationId),
      userId: auth.userId ?? "unknown",
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    logError(error as Error, "Failed to fetch notifications");
    return serverErrorResponse("Failed to fetch notifications");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const title = sanitizeString(body.title);
    if (!title) {
      return badRequestResponse("Notification title is required");
    }

    const severity = typeof body.severity === "string" ? body.severity.toLowerCase() : "info";
    const safeSeverity = ALLOWED_SEVERITIES.includes(severity as NotificationSeverity)
      ? (severity as NotificationSeverity)
      : "info";

    const rawLink = typeof body.link === "string" ? body.link.trim() : "";
    const safeLink = rawLink.startsWith("/") ? rawLink : null;

    const created = await createNotification({
      organizationId: auth.organizationId,
      title,
      message: sanitizeText(body.message) || null,
      link: safeLink,
      severity: safeSeverity,
      source: sanitizeString(body.source) || "custom",
      metadata: {
        actor: auth.userEmail || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    logError(error as Error, "Failed to create notification");
    return serverErrorResponse("Failed to create notification");
  }
}
