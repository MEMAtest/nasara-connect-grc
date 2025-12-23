import type { Session } from "next-auth";

const AUTH_DISABLED_FLAG = process.env.AUTH_DISABLED === "true" || process.env.AUTH_DISABLED === "1";
const FALLBACK_EMAIL = process.env.AUTH_DISABLED_USER_EMAIL || "demo@nasara.local";
const FALLBACK_NAME = process.env.AUTH_DISABLED_USER_NAME || "Demo User";

export function isAuthDisabled() {
  return AUTH_DISABLED_FLAG;
}

export function getSessionIdentity(session?: Session | null) {
  if (session?.user?.email) {
    return {
      email: session.user.email,
      name: session.user.name ?? session.user.email,
    };
  }
  if (!AUTH_DISABLED_FLAG) return null;
  return {
    email: FALLBACK_EMAIL,
    name: FALLBACK_NAME,
  };
}
