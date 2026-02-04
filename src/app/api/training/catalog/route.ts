import { NextResponse } from "next/server";
import { trainingModules } from "@/app/(dashboard)/training-library/content";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const { error } = await requireRole("member");
  if (error) return error;
  const modules = Object.entries(trainingModules).map(([id, module]) => ({
    id,
    title: module.title,
    category: module.category,
    estimatedMinutes: module.estimatedDuration ?? null,
    difficulty: module.difficulty,
  }));

  return NextResponse.json({ modules });
}
