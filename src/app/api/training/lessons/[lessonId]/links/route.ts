import { NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { listBackLinks } from "@/lib/server/entity-link-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const links = await listBackLinks({
    organizationId: DEFAULT_ORGANIZATION_ID,
    toType: "training",
    toId: lessonId,
  });
  return NextResponse.json({ links });
}
