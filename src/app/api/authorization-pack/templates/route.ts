import { NextResponse } from "next/server";
import { getPackTemplates, syncAuthorizationTemplates } from "@/lib/authorization-pack-db";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    await syncAuthorizationTemplates();

    const templates = await getPackTemplates();

    // Transform to match expected format
    const formattedTemplates = templates.map((t) => ({
      code: t.type,
      name: t.name,
      description: t.description,
    }));

    return NextResponse.json({ templates: formattedTemplates });
  } catch (error) {
    logError(error, "Failed to load templates");
    return NextResponse.json(
      { error: "Failed to load templates", templates: [] },
      { status: 500 }
    );
  }
}
