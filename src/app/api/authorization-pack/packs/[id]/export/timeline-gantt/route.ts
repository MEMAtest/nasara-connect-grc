import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/auth-utils";
import { getPack } from "@/lib/authorization-pack-db";
import { pool } from "@/lib/database";
import { TIMELINE_PHASES } from "@/lib/fca-api-checklist";
import { getWeekDate } from "@/lib/checklist-constants";
import ExcelJS from "exceljs";
import { requireRole } from "@/lib/rbac";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

interface TimelineTaskRow {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  target_week: number;
  status: string;
  is_milestone: boolean;
}

// Colors for phases matching PHASE_COLORS
const PHASE_HEX: Record<string, string> = {
  teal: "99F6E4",
  blue: "BFDBFE",
  purple: "E9D5FF",
  amber: "FDE68A",
  green: "BBF7D0",
};

const STATUS_FILL: Record<string, string> = {
  completed: "BBF7D0",
  in_progress: "BFDBFE",
  pending: "E2E8F0",
};

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

    const pack = await getPack(packId);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch timeline tasks
    let tasks: TimelineTaskRow[] = [];
    try {
      const result = await pool.query(
        `SELECT id, name, description, phase, target_week, status, is_milestone
         FROM timeline_tasks
         WHERE pack_id = $1
         ORDER BY target_week ASC, created_at ASC`,
        [packId]
      );
      tasks = result.rows;
    } catch {
      // Table may not exist yet
    }

    // Fetch project plan for startDate
    let startDate: string | null = null;
    try {
      const projectResult = await pool.query(
        `SELECT p.project_plan FROM authorization_pack_projects p
         JOIN authorization_packs a ON a.id = p.pack_id
         WHERE p.pack_id = $1`,
        [packId]
      );
      if (projectResult.rows.length > 0) {
        const plan = projectResult.rows[0].project_plan;
        if (plan && typeof plan === "object" && plan.startDate) {
          startDate = plan.startDate;
        }
      }
    } catch {
      // project may not exist
    }

    const totalWeeks = TIMELINE_PHASES.at(-1)?.endWeek ?? 56;

    // Build Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Nasara Connect";
    workbook.created = new Date();

    // ─── Sheet 1: Gantt Chart ───
    const ganttSheet = workbook.addWorksheet("Gantt Chart");

    // Header row
    const headerRow: string[] = ["Task", "Phase", "Type", "Status", "Start Week", "End Week"];
    for (let w = 1; w <= totalWeeks; w++) {
      const dateLabel = startDate ? getWeekDate(startDate, w) : "";
      headerRow.push(dateLabel ? `W${w} (${dateLabel})` : `W${w}`);
    }

    const hRow = ganttSheet.addRow(headerRow);
    hRow.font = { bold: true, size: 10 };
    hRow.alignment = { vertical: "middle", horizontal: "center" };
    hRow.height = 24;

    // Set column widths
    ganttSheet.getColumn(1).width = 30; // Task
    ganttSheet.getColumn(2).width = 24; // Phase
    ganttSheet.getColumn(3).width = 10; // Type
    ganttSheet.getColumn(4).width = 12; // Status
    ganttSheet.getColumn(5).width = 10; // Start Week
    ganttSheet.getColumn(6).width = 10; // End Week
    for (let c = 7; c <= 6 + totalWeeks; c++) {
      ganttSheet.getColumn(c).width = 5;
    }

    // Freeze header + label columns
    ganttSheet.views = [{ state: "frozen", xSplit: 6, ySplit: 1 }];

    // Phase rows
    for (const phase of TIMELINE_PHASES) {
      const row = ganttSheet.addRow([
        phase.name,
        "",
        "Phase",
        "",
        phase.startWeek,
        phase.endWeek,
      ]);
      row.font = { bold: true, size: 10 };

      const phaseColor = PHASE_HEX[phase.color] || PHASE_HEX.teal;
      // Fill cells in the week range
      for (let w = phase.startWeek; w <= phase.endWeek; w++) {
        const cell = row.getCell(6 + w);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${phaseColor}` },
        };
      }

      // Phase tasks
      const phaseTasks = tasks.filter((t) => t.phase === phase.name);
      for (const task of phaseTasks) {
        const taskRow = ganttSheet.addRow([
          `${task.is_milestone ? "M " : ""}${task.name}`,
          phase.name,
          task.is_milestone ? "Milestone" : "Task",
          task.status,
          task.target_week,
          task.target_week,
        ]);
        taskRow.font = {
          bold: task.is_milestone,
          size: 10,
          italic: task.is_milestone,
        };

        // Mark the target week cell
        const statusColor = STATUS_FILL[task.status] || STATUS_FILL.pending;
        const taskCell = taskRow.getCell(6 + task.target_week);
        taskCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${statusColor}` },
        };
        if (task.is_milestone) {
          taskCell.value = "M";
          taskCell.font = { bold: true, size: 9 };
          taskCell.alignment = { horizontal: "center" };
        }
      }
    }

    // ─── Sheet 2: Tasks (flat table) ───
    const tasksSheet = workbook.addWorksheet("Tasks");
    const tHeader = tasksSheet.addRow([
      "Name",
      "Phase",
      "Description",
      "Target Week",
      "Status",
      "Milestone",
    ]);
    tHeader.font = { bold: true, size: 10 };
    tasksSheet.getColumn(1).width = 30;
    tasksSheet.getColumn(2).width = 24;
    tasksSheet.getColumn(3).width = 40;
    tasksSheet.getColumn(4).width = 12;
    tasksSheet.getColumn(5).width = 12;
    tasksSheet.getColumn(6).width = 10;

    for (const task of tasks) {
      const r = tasksSheet.addRow([
        task.name,
        task.phase,
        task.description || "",
        task.target_week,
        task.status,
        task.is_milestone ? "Yes" : "No",
      ]);
      const sColor = STATUS_FILL[task.status] || STATUS_FILL.pending;
      r.getCell(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${sColor}` },
      };
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `${sanitizeFilename(pack.name)}-timeline-gantt.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export timeline gantt:", error);
    return NextResponse.json(
      {
        error: "Failed to export timeline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
