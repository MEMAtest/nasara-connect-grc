import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationPacks, createAuthorizationPack, getPackTemplates, initDatabase, seedPackTemplates } from "@/lib/database";
import { requireAuth } from "@/lib/auth-utils";

export async function GET() {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    await seedPackTemplates();

    const packs = await getAuthorizationPacks(auth.organizationId);

    // Transform to expected format
    const formattedPacks = packs.map(pack => ({
      id: pack.id,
      name: pack.name,
      status: pack.status,
      target_submission_date: pack.target_submission_date,
      created_at: pack.created_at,
      updated_at: pack.updated_at,
      template_type: pack.template_name,
      template_name: pack.template_name,
    }));

    return NextResponse.json({ packs: formattedPacks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load packs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    await seedPackTemplates();

    const body = await request.json();
    const templateType = body.templateType;
    const name = (body.name as string | undefined)?.trim();
    const targetSubmissionDate = body.targetSubmissionDate || null;

    if (!templateType) {
      return NextResponse.json({ error: "Template type is required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Pack name is required" }, { status: 400 });
    }

    if (name.length > 255) {
      return NextResponse.json({ error: "Pack name too long (max 255 characters)" }, { status: 400 });
    }

    // Get template by code or pack_type
    const templates = await getPackTemplates();
    const template = templates.find(t => t.code === templateType || t.pack_type === templateType);

    if (!template) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
    }

    const pack = await createAuthorizationPack({
      organization_id: auth.organizationId,
      pack_template_id: template.id,
      name,
      target_submission_date: targetSubmissionDate ? new Date(targetSubmissionDate) : undefined,
      created_by: auth.userId || undefined,
    });

    return NextResponse.json({ pack }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
