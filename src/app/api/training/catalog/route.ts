import { NextResponse } from "next/server";
import { trainingModules } from "@/app/(dashboard)/training-library/content";

export async function GET() {
  const modules = Object.entries(trainingModules).map(([id, module]) => ({
    id,
    title: module.title,
    category: module.category,
    estimatedMinutes: module.estimatedDurationMinutes ?? null,
    difficulty: module.difficulty,
  }));

  return NextResponse.json({ modules });
}

