import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegisterDefinitions,
  seedRegisterDefinitions,
  seedRegisterRecommendations,
} from "@/lib/database";

// GET /api/register-hub/definitions - Get all register definitions
export async function GET() {
  try {
    await initDatabase();
    const definitions = await getRegisterDefinitions();

    // If no definitions exist, seed them
    if (definitions.length === 0) {
      await seedRegisterDefinitions();
      await seedRegisterRecommendations();
      const seededDefinitions = await getRegisterDefinitions();
      return NextResponse.json({ definitions: seededDefinitions, seeded: true });
    }

    return NextResponse.json({ definitions });
  } catch (error) {
    console.error("Error fetching register definitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch register definitions" },
      { status: 500 }
    );
  }
}

// POST /api/register-hub/definitions - Seed/reseed definitions
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json().catch(() => ({}));
    const forceReseed = body.forceReseed === true;

    if (forceReseed) {
      await seedRegisterDefinitions();
      await seedRegisterRecommendations();
    }

    const definitions = await getRegisterDefinitions();
    return NextResponse.json({
      definitions,
      message: forceReseed ? "Definitions reseeded" : "Definitions loaded",
    });
  } catch (error) {
    console.error("Error seeding register definitions:", error);
    return NextResponse.json(
      { error: "Failed to seed register definitions" },
      { status: 500 }
    );
  }
}
