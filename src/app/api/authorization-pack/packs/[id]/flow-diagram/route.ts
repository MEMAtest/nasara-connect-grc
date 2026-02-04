import { NextRequest, NextResponse } from "next/server";
import { getPack } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { pool } from "@/lib/database";
import { requireRole } from "@/lib/rbac";

async function verifyPackOwnership(packId: string, organizationId: string) {
  const pack = await getPack(packId);
  return pack && pack.organization_id === organizationId;
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pack_flow_diagrams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pack_id UUID NOT NULL UNIQUE,
      diagram JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
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
      `SELECT diagram FROM pack_flow_diagrams WHERE pack_id = $1`,
      [packId]
    );

    return NextResponse.json({
      diagram: result.rows[0]?.diagram || null,
    });
  } catch (error) {
    console.error("Failed to fetch flow diagram:", error);
    return NextResponse.json({ error: "Failed to fetch diagram", diagram: null }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
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
    const { nodes, connections } = body;

    if (!Array.isArray(nodes) || !Array.isArray(connections)) {
      return NextResponse.json({ error: "nodes and connections arrays are required" }, { status: 400 });
    }

    await ensureTable();
    const diagram = JSON.stringify({ nodes, connections });

    await pool.query(
      `INSERT INTO pack_flow_diagrams (pack_id, diagram, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (pack_id) DO UPDATE SET
         diagram = $2::jsonb,
         updated_at = NOW()`,
      [packId, diagram]
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to save flow diagram:", error);
    return NextResponse.json({ error: "Failed to save diagram" }, { status: 500 });
  }
}
