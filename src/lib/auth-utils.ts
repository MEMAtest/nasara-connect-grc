import type { Session } from "next-auth";
import { NextResponse } from "next/server";

export function isAuthDisabled() {
  const disabled = process.env.AUTH_DISABLED === "true" || process.env.AUTH_DISABLED === "1";
  if (disabled && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_DISABLED cannot be enabled in production.");
  }
  return disabled;
}

export function getSessionIdentity(session?: Session | null) {
  if (session?.user?.email) {
    return {
      email: session.user.email,
      name: session.user.name ?? session.user.email,
    };
  }
  if (!isAuthDisabled()) return null;
  return {
    email: process.env.AUTH_DISABLED_USER_EMAIL || "demo@nasara.local",
    name: process.env.AUTH_DISABLED_USER_NAME || "Demo User",
  };
}

// Generate a deterministic UUID from a string (for organization ID)
// Uses Web Crypto API for Edge Runtime compatibility
async function generateDeterministicUUID(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // Format as UUID v4
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16), // Version 4
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20), // Variant
    hash.slice(20, 32)
  ].join('-');
}

export async function deriveOrganizationIdFromEmail(email: string): Promise<string> {
  const emailDomain = email.split("@")[1] || "default";
  return generateDeterministicUUID(`org:${emailDomain}`);
}

export async function deriveUserIdFromEmail(email: string): Promise<string> {
  return generateDeterministicUUID(`user:${email}`);
}

// UUID validation helper
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// API authentication result type
export interface ApiAuthResult {
  authenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  organizationId: string;
}

// Default organization for development/demo mode
export const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000002";

/**
 * Authenticate an API request and return user info
 * Returns organization ID for multi-tenancy support
 */
export async function authenticateApiRequest(): Promise<ApiAuthResult> {
  // If auth is disabled, return demo user
  if (isAuthDisabled()) {
    const demoEmail = process.env.AUTH_DISABLED_USER_EMAIL || "demo@nasara.local";
    return {
      authenticated: true,
      userId: DEFAULT_USER_ID,
      userEmail: demoEmail,
      userName: process.env.AUTH_DISABLED_USER_NAME || "Demo User",
      organizationId: DEFAULT_ORG_ID,
    };
  }

  // Get the session
  const { auth } = await import("@/auth");
  const session = await auth();

  if (!session?.user?.email) {
    return {
      authenticated: false,
      userId: null,
      userEmail: null,
      userName: null,
      organizationId: DEFAULT_ORG_ID,
    };
  }

  // Generate deterministic organization ID from user email domain
  // In production, this should come from a user/organization database lookup
  const organizationId = session.user.organizationId
    ?? await deriveOrganizationIdFromEmail(session.user.email);

  return {
    authenticated: true,
    userId: session.user.id || await deriveUserIdFromEmail(session.user.email),
    userEmail: session.user.email,
    userName: session.user.name || session.user.email,
    organizationId,
  };
}

/**
 * Require authentication for an API route
 * Returns NextResponse with 401 error if not authenticated
 */
export async function requireAuth(): Promise<{ auth: ApiAuthResult; error?: NextResponse }> {
  const authResult = await authenticateApiRequest();

  if (!authResult.authenticated) {
    return {
      auth: authResult,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const enforceRbac = process.env.ENFORCE_RBAC !== "false" && process.env.NODE_ENV === "production"
    || process.env.ENFORCE_RBAC === "true";
  if (enforceRbac && !isAuthDisabled()) {
    try {
      const { getOrganizationMemberByUserId, initOrganizationTables } = await import("@/lib/server/organization-store");
      await initOrganizationTables();
      const member = authResult.userId
        ? await getOrganizationMemberByUserId(authResult.organizationId, authResult.userId)
        : null;
      if (!member) {
        return {
          auth: authResult,
          error: NextResponse.json({ error: "Organization membership required" }, { status: 403 }),
        };
      }
    } catch (error) {
      return {
        auth: authResult,
        error: NextResponse.json(
          { error: "RBAC enforcement unavailable", details: error instanceof Error ? error.message : "Unknown error" },
          { status: 503 }
        ),
      };
    }
  }

  return { auth: authResult };
}
