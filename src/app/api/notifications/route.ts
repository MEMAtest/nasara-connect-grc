import { NextRequest, NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/api-auth";
import { requireRole } from "@/lib/rbac";
import { listNotifications } from "@/lib/server/notifications-store";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const offsetParam = Number.parseInt(searchParams.get("offset") ?? "", 10);
    const limit = Number.isFinite(limitParam) ? limitParam : 10;
    const offset = Number.isFinite(offsetParam) ? offsetParam : 0;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await listNotifications({
      organizationIds: [auth.organizationId],
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

export async function POST(_request: NextRequest) {
  try {
    const { error } = await requireRole("member");
    if (error) return error;
    return NextResponse.json({ error: "Manual notifications are disabled." }, { status: 403 });
  } catch (error) {
    logError(error as Error, "Failed to create notification");
    return serverErrorResponse("Failed to create notification");
  }
}
