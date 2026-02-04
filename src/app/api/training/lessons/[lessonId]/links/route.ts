import { NextResponse } from "next/server";
import { listBackLinks } from "@/lib/server/entity-link-store";
import { requireRole } from "@/lib/rbac";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { lessonId } = await params;
  const links = await listBackLinks({
    organizationId: auth.organizationId,
    toType: "training",
    toId: lessonId,
  });
  return NextResponse.json({ links });
}
