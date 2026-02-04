import { NextRequest, NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/api-auth";
import { requireAuth } from "@/lib/auth-utils";
import { markAllNotificationsRead } from "@/lib/server/notifications-store";
import { logError } from "@/lib/logger";

export async function POST(_request: NextRequest) {
  try {
    const { auth, error } = await requireAuth();
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
