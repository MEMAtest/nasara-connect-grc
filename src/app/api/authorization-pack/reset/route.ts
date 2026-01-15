import { NextRequest, NextResponse } from "next/server";
import { getPackTemplates, resetAuthorizationPackData } from "@/lib/authorization-pack-db";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Reset not available in production" }, { status: 403 });
  }

  let body: { confirm?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.confirm !== "RESET") {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }

  try {
    await resetAuthorizationPackData();
    const templates = await getPackTemplates();
    return NextResponse.json({ status: "ok", templates });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset authorization pack data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
