import NextAuth, { DefaultSession } from "next-auth"
import { authConfig } from "./auth.config"
import { deriveOrganizationIdFromEmail, deriveUserIdFromEmail } from "@/lib/auth-utils"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string
      role: string
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    organizationId?: string
    orgRefreshedAt?: number
    role?: string
    roleRefreshedAt?: number
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const email = profile.email || token.email
        token.id = profile.sub || (email ? await deriveUserIdFromEmail(String(email)) : token.id)
      }
      const email = profile?.email || token.email
      const now = Math.floor(Date.now() / 1000)
      const orgRefreshedAt = (token.orgRefreshedAt as number | undefined) ?? 0
      const ORG_REFRESH_INTERVAL = 3600 // Re-check org membership every hour
      const needsRefresh = !token.organizationId || (now - orgRefreshedAt > ORG_REFRESH_INTERVAL)
      if (email && needsRefresh) {
        try {
          const { getOrganizationIdByDomain, getOrganizationMemberByUserId } = await import("@/lib/server/organization-store")
          const domain = String(email).split("@")[1] || "default"
          const orgId = await getOrganizationIdByDomain(domain)
          token.organizationId = orgId ?? await deriveOrganizationIdFromEmail(String(email))

          // Look up the user's role (same refresh interval as org)
          const userId = (token.id as string) || await deriveUserIdFromEmail(String(email))
          if (token.organizationId && userId) {
            const member = await getOrganizationMemberByUserId(token.organizationId, userId)
            token.role = member?.role ?? "viewer" // fail-closed to lowest privilege
          }
        } catch {
          token.organizationId = token.organizationId ?? await deriveOrganizationIdFromEmail(String(email))
          token.role = token.role ?? "viewer"
        }
        token.orgRefreshedAt = now
        token.roleRefreshedAt = now
      }

      // Check for org override cookie (set by org switching or invite acceptance)
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const overrideOrgId = cookieStore.get("nasara-active-org")?.value
        if (overrideOrgId && overrideOrgId !== token.organizationId) {
          const { getOrganizationMemberByUserId } = await import("@/lib/server/organization-store")
          const userId = token.id as string
          if (userId) {
            const member = await getOrganizationMemberByUserId(overrideOrgId, userId)
            if (member) {
              token.organizationId = overrideOrgId
              token.role = member.role
            }
            // If not a member, ignore the cookie (stale)
          }
        }
      } catch {
        // Cookie read can fail in Edge Runtime — fallback to token org (safe)
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
        session.user.role = (token.role as string) || "viewer"
      }
      return session
    },
    async signIn({ account, profile, user }) {
      const email = profile?.email || user?.email
      if (email) {
        try {
          const { ensureOrganizationForUser } = await import("@/lib/server/organization-store")
          const userId = profile?.sub || account?.providerAccountId || user?.id || await deriveUserIdFromEmail(email)
          const name = profile?.name || user?.name || email
          const avatarUrl = (profile as { picture?: string } | null)?.picture || (user as { image?: string } | null)?.image || null
          const organizationId = await deriveOrganizationIdFromEmail(email)
          await ensureOrganizationForUser({
            email,
            userId,
            name,
            avatarUrl,
            organizationId,
          })
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to upsert organization membership on sign-in", error)
          }
        }
      }
      return true
    }
  },
  debug: process.env.NODE_ENV === "development",
})
