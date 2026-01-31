import { NextRequest, NextResponse } from "next/server";
import { getPack } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { pool } from "@/lib/database";

async function verifyPackOwnership(packId: string, organizationId: string) {
  const pack = await getPack(packId);
  return pack && pack.organization_id === organizationId;
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pack_financials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pack_id UUID NOT NULL UNIQUE,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await ensureTable();
    const result = await pool.query(
      `SELECT data FROM pack_financials WHERE pack_id = $1`,
      [packId]
    );

    return NextResponse.json({
      financials: result.rows[0]?.data || null,
    });
  } catch (error) {
    console.error("Failed to fetch financials:", error);
    return NextResponse.json({ error: "Failed to fetch financials", financials: null }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { incomeStatement, balanceSheet, cashFlow, assumptions, capitalRequirements } = body;

    await ensureTable();
    const data = JSON.stringify({
      incomeStatement,
      balanceSheet,
      cashFlow,
      assumptions,
      capitalRequirements,
    });

    await pool.query(
      `INSERT INTO pack_financials (pack_id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (pack_id) DO UPDATE SET
         data = $2::jsonb,
         updated_at = NOW()`,
      [packId, data]
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to save financials:", error);
    return NextResponse.json({ error: "Failed to save financials" }, { status: 500 });
  }
}
