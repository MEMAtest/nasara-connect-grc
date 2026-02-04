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
    CREATE TABLE IF NOT EXISTS timeline_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pack_id UUID NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      phase TEXT NOT NULL,
      target_week INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      is_milestone BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
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
      `SELECT id, pack_id, name, description, phase, target_week, status, is_milestone, created_at
       FROM timeline_tasks
       WHERE pack_id = $1
       ORDER BY target_week ASC, created_at ASC`,
      [packId]
    );

    return NextResponse.json({
      tasks: result.rows.map((t: Record<string, unknown>) => ({
        id: t.id,
        packId: t.pack_id,
        name: t.name,
        description: t.description,
        phase: t.phase,
        targetWeek: t.target_week,
        status: t.status,
        isMilestone: t.is_milestone,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch timeline tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks", tasks: [] }, { status: 500 });
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
    const { name, description, phase, targetWeek, isMilestone } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Task name is required" }, { status: 400 });
    }
    if (!phase || typeof phase !== "string") {
      return NextResponse.json({ error: "Phase is required" }, { status: 400 });
    }
    if (typeof targetWeek !== "number" || targetWeek < 1) {
      return NextResponse.json({ error: "Valid target week is required" }, { status: 400 });
    }

    await ensureTable();

    const result = await pool.query(
      `INSERT INTO timeline_tasks (pack_id, name, description, phase, target_week, status, is_milestone)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING id, pack_id, name, description, phase, target_week, status, is_milestone, created_at`,
      [packId, name.trim(), description || null, phase, targetWeek, !!isMilestone]
    );

    const t = result.rows[0];
    return NextResponse.json({
      task: {
        id: t.id,
        packId: t.pack_id,
        name: t.name,
        description: t.description,
        phase: t.phase,
        targetWeek: t.target_week,
        status: t.status,
        isMilestone: t.is_milestone,
        createdAt: t.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create timeline task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { taskId, status, name, description, phase, targetWeek, isMilestone } = body;

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    // Build dynamic SET clause
    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (status !== undefined) {
      const validStatuses = ["pending", "in_progress", "completed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      values.push(status);
      setClauses.push(`status = $${values.length}`);
    }
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
      }
      values.push(name.trim());
      setClauses.push(`name = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description || null);
      setClauses.push(`description = $${values.length}`);
    }
    if (phase !== undefined) {
      if (typeof phase !== "string" || phase.length === 0) {
        return NextResponse.json({ error: "Phase must be a non-empty string" }, { status: 400 });
      }
      values.push(phase);
      setClauses.push(`phase = $${values.length}`);
    }
    if (targetWeek !== undefined) {
      if (typeof targetWeek !== "number" || targetWeek < 1) {
        return NextResponse.json({ error: "Valid target week is required" }, { status: 400 });
      }
      values.push(targetWeek);
      setClauses.push(`target_week = $${values.length}`);
    }
    if (isMilestone !== undefined) {
      values.push(!!isMilestone);
      setClauses.push(`is_milestone = $${values.length}`);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(taskId);
    const taskIdParam = values.length;
    values.push(packId);
    const packIdParam = values.length;

    await ensureTable();

    const result = await pool.query(
      `UPDATE timeline_tasks SET ${setClauses.join(", ")}
       WHERE id = $${taskIdParam} AND pack_id = $${packIdParam}
       RETURNING id, pack_id, name, description, phase, target_week, status, is_milestone, created_at`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const t = result.rows[0];
    return NextResponse.json({
      task: {
        id: t.id,
        packId: t.pack_id,
        name: t.name,
        description: t.description,
        phase: t.phase,
        targetWeek: t.target_week,
        status: t.status,
        isMilestone: t.is_milestone,
        createdAt: t.created_at,
      },
    });
  } catch (error) {
    console.error("Failed to update timeline task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
