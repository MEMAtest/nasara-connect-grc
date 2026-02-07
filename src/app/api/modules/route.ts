import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";
import { isAuthDisabled } from "@/lib/auth-utils";
import { requireRole } from "@/lib/rbac";
import { MODULE_REGISTRY } from "@/lib/module-access-shared";
import {
  getOrganizationEnabledModules,
  setOrganizationEnabledModules,
} from "@/lib/server/organization-store";

const VALID_MODULE_IDS = new Set<string>(MODULE_REGISTRY.map((m) => m.id));

function isNasaraAdminEmail(email: string | null): boolean {
  const raw = process.env.NASARA_ADMIN_EMAILS ?? "";
  const allowlist = raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  if (!allowlist.length) return false;
  if (!email) return false;
  return allowlist.includes(email.toLowerCase());
}

function parseEnabledModules(input: unknown): { ok: true; value: string[] | null } | { ok: false; error: string } {
  if (input === null) return { ok: true, value: null };
  if (!Array.isArray(input)) return { ok: false, error: "enabledModules must be an array or null" };

  const values = input.filter((v): v is string => typeof v === "string").map((v) => v.trim());
  if (values.length !== input.length) return { ok: false, error: "enabledModules must be an array of strings" };

  if (values.includes("*")) return { ok: true, value: ["*"] };

  for (const moduleId of values) {
    if (!moduleId) {
      return { ok: false, error: "Invalid module ID: (empty)" };
    }
    if (!VALID_MODULE_IDS.has(moduleId)) {
      return { ok: false, error: `Invalid module ID: ${moduleId}` };
    }
  }

  return { ok: true, value: values };
}

/**
 * GET /api/modules
 *
 * Returns the enabled module IDs for the caller's active organization.
 * enabledModules: null => all enabled (default / dev).
 */
export async function GET(request: NextRequest) {
  const { success, headers } = await checkRateLimit(request, { requests: 60, window: "60 s" });
  if (!success) return rateLimitExceeded(headers);

  const { auth, error } = await requireRole("viewer");
  if (error) return error;

  if (isAuthDisabled()) {
    return NextResponse.json({ enabledModules: null, canEdit: true });
  }

  const enabledModules = await getOrganizationEnabledModules(auth.organizationId);
  const canEdit = process.env.NODE_ENV !== "production" ? true : isNasaraAdminEmail(auth.userEmail);
  return NextResponse.json({ enabledModules, canEdit });
}

/**
 * PUT /api/modules
 *
 * Sets enabled modules for the caller's active organization.
 * Body: { enabledModules: string[] | null }
 *
 * Notes:
 * - `["*"]` = explicitly enable all modules.
 * - `null` = reset to default (dev: all enabled, prod: plan default).
 */
export async function PUT(request: NextRequest) {
  const { success, headers } = await checkRateLimit(request, { requests: 20, window: "60 s" });
  if (!success) return rateLimitExceeded(headers);

  const { auth, error } = await requireRole("admin");
  if (error) return error;

  if (isAuthDisabled()) {
    return NextResponse.json({ enabledModules: null, canEdit: true });
  }

  // In production, module entitlements should be managed by Nasara (not firm admins).
  if (process.env.NODE_ENV === "production" && !isNasaraAdminEmail(auth.userEmail)) {
    return NextResponse.json(
      { error: "Module access is managed by Nasara. Please contact support." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = parseEnabledModules((body as { enabledModules?: unknown }).enabledModules);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await setOrganizationEnabledModules(auth.organizationId, parsed.value);
  if (!updated) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({ enabledModules: parsed.value, canEdit: true });
}
