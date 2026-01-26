import { NextRequest, NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/api-auth";
import { DEFAULT_ORG_ID, requireAuth } from "@/lib/auth-utils";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { markAllNotificationsRead } from "@/lib/server/notifications-store";
import { logError } from "@/lib/logger";

function resolveOrganizationIds(primary: string): string[] {
  if (primary === "default-org" || primary === DEFAULT_ORGANIZATION_ID || primary === DEFAULT_ORG_ID) {
    return Array.from(new Set(["default-org", DEFAULT_ORGANIZATION_ID, DEFAULT_ORG_ID]));
  }
  return [primary];
}

export async function POST(_request: NextRequest) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const result = await markAllNotificationsRead({
      organizationIds: resolveOrganizationIds(auth.organizationId),
      userId: auth.userId ?? "unknown",
    });

    return NextResponse.json(result);
  } catch (error) {
    logError(error as Error, "Failed to mark notifications as read");
    return serverErrorResponse("Failed to mark notifications as read");
  }
}
