import type { Session } from "next-auth";

export function isAuthDisabled() {
  return process.env.AUTH_DISABLED === "true" || process.env.AUTH_DISABLED === "1";
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
