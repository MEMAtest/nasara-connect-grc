import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { isAuthDisabled } from "@/lib/auth-utils"

/**
 * Auth configuration that's safe to use in Edge Runtime (middleware).
 * This file must NOT import any server-only code like database modules.
 */
export const authConfig: NextAuthConfig = {
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
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}
