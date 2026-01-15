import { NextRequest, NextResponse } from "next/server";
import { createPack, getPack, getPackTemplates, getPacks } from "@/lib/authorization-pack-db";
import { requireAuth } from "@/lib/auth-utils";

export async function GET() {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    const packs = await getPacks(auth.organizationId);

    // Transform to expected format
    const formattedPacks = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      status: pack.status,
      target_submission_date: pack.target_submission_date,
      created_at: pack.created_at,
      updated_at: pack.updated_at,
      template_type: pack.template_type,
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
    const template = templates.find((t) => t.type === templateType || t.code === templateType);

    if (!template) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
    }

    const created = await createPack({
      organizationId: auth.organizationId,
      templateType: template.type,
      name,
      targetSubmissionDate,
    });
    const pack = await getPack(created.id);

    return NextResponse.json({ pack: pack ?? { id: created.id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
