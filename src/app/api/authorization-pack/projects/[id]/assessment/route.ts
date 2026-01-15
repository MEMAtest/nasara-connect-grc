import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationProject, saveAuthorizationAssessment } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getAuthorizationProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ assessment: project.assessment_data || {} });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await saveAuthorizationAssessment(id, body);
    return NextResponse.json({ status: "ok", completion: result.completion, assessment: result.assessment });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
