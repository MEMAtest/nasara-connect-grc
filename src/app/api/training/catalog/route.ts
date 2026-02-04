import { NextResponse } from "next/server";
import { trainingModules } from "@/app/(dashboard)/training-library/content";
import { requireAuth } from "@/lib/auth-utils";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const modules = Object.entries(trainingModules).map(([id, module]) => ({
    id,
    title: module.title,
    category: module.category,
    estimatedMinutes: module.estimatedDurationMinutes ?? null,
    difficulty: module.difficulty,
  }));

  return NextResponse.json({ modules });
}
