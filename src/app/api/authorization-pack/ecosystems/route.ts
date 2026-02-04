import { NextResponse } from "next/server";
import {
  getPermissionEcosystems,
  syncAuthorizationTemplates,
  syncPermissionEcosystems,
} from "@/lib/authorization-pack-db";
import { logError } from "@/lib/logger";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "1";
    const allowForce = force && process.env.NODE_ENV !== "production";
    if (allowForce) {
      await syncAuthorizationTemplates();
      await syncPermissionEcosystems();
    }

    const ecosystems = await getPermissionEcosystems();

    return NextResponse.json({ ecosystems });
  } catch (error) {
    logError(error, "Failed to load ecosystems");
    return NextResponse.json(
      { error: "Failed to load ecosystems", ecosystems: [] },
      { status: 500 }
    );
  }
}
