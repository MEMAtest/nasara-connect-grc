import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { deriveOrganizationIdFromEmail, deriveUserIdFromEmail, isAuthDisabled } from "@/lib/auth-utils"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    organizationId?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth }) {
      if (isAuthDisabled()) return true
      return !!auth
    },
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
          const { getOrganizationIdByDomain } = await import("@/lib/server/organization-store")
          const domain = String(email).split("@")[1] || "default"
          const orgId = await getOrganizationIdByDomain(domain)
          token.organizationId = orgId ?? await deriveOrganizationIdFromEmail(String(email))
        } catch {
          token.organizationId = token.organizationId ?? await deriveOrganizationIdFromEmail(String(email))
        }
        token.orgRefreshedAt = now
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
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
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours — appropriate for FCA-regulated platform
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
})
