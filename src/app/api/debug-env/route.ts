import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasTrustHost: !!process.env.AUTH_TRUST_HOST,
    authUrlValue: process.env.AUTH_URL ? process.env.AUTH_URL.substring(0, 20) + "..." : "not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
