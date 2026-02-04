import { NextRequest, NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/api-auth";
import { requireRole } from "@/lib/rbac";
import { markAllNotificationsRead } from "@/lib/server/notifications-store";
import { logError } from "@/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const result = await markAllNotificationsRead({
      organizationIds: [auth.organizationId],
      userId: auth.userId ?? "unknown",
    });

    return NextResponse.json(result);
  } catch (error) {
    logError(error as Error, "Failed to mark notifications as read");
    return serverErrorResponse("Failed to mark notifications as read");
  }
}
