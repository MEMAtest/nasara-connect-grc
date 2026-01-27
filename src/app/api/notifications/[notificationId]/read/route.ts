import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse } from "@/lib/api-auth";
import { requireAuth } from "@/lib/auth-utils";
import { setNotificationRead } from "@/lib/server/notifications-store";
import { logError } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { notificationId } = await params;
    if (!notificationId) {
      return badRequestResponse("Notification ID is required");
    }

    const body = await request.json().catch(() => ({}));
    const read = body.read !== false;

    const result = await setNotificationRead({
      notificationId,
      userId: auth.userId ?? "unknown",
      read,
    });

    return NextResponse.json({ readAt: result.readAt });
  } catch (error) {
    logError(error as Error, "Failed to update notification read state");
    return serverErrorResponse("Failed to update notification");
  }
}
