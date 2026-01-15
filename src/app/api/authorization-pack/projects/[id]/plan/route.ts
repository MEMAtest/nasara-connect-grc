import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getAuthorizationPack,
  updateAuthorizationPack,
  createProjectMilestone,
  getProjectMilestones,
  getPackTemplates,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

// Standard milestone templates for FCA authorization projects
const milestoneTemplates = [
  // Phase 1: Assessment & Scoping
  { phase: "Assessment & Scoping", title: "Kick-off meeting", description: "Initial project setup and stakeholder alignment", weekOffset: 0, duration: 1 },
  { phase: "Assessment & Scoping", title: "Current state assessment", description: "Document existing capabilities and gaps", weekOffset: 1, duration: 2 },
  { phase: "Assessment & Scoping", title: "Gap analysis completion", description: "Finalize gap analysis and remediation priorities", weekOffset: 2, duration: 2 },

  // Phase 2: Narrative & Business Plan
  { phase: "Narrative & Business Plan", title: "Executive summary draft", description: "Draft executive summary and business model sections", weekOffset: 3, duration: 2 },
  { phase: "Narrative & Business Plan", title: "Business plan sections", description: "Complete all 27 gold-standard sections", weekOffset: 4, duration: 4 },
  { phase: "Narrative & Business Plan", title: "Financial projections", description: "3-year projections and capital adequacy", weekOffset: 5, duration: 3 },

  // Phase 3: Policies & Evidence
  { phase: "Policies & Evidence", title: "Policy framework", description: "Draft and approve required policies", weekOffset: 6, duration: 3, linkedModule: "policy" },
  { phase: "Policies & Evidence", title: "Evidence collection", description: "Gather and organize supporting evidence", weekOffset: 7, duration: 3 },
  { phase: "Policies & Evidence", title: "AML/CTF documentation", description: "Complete AML framework and procedures", weekOffset: 8, duration: 2 },

  // Phase 4: Governance & SMCR
  { phase: "Governance & SMCR", title: "SMCR roles assignment", description: "Assign and document SMCR responsibilities", weekOffset: 9, duration: 2, linkedModule: "smcr" },
  { phase: "Governance & SMCR", title: "Training completion", description: "Complete required training for key personnel", weekOffset: 10, duration: 3, linkedModule: "training" },
  { phase: "Governance & SMCR", title: "Governance documentation", description: "Board approvals and governance sign-off", weekOffset: 11, duration: 2 },

  // Phase 5: Review & Submission
  { phase: "Review & Submission", title: "Internal review", description: "Full pack review by Nasara consultants", weekOffset: 12, duration: 2 },
  { phase: "Review & Submission", title: "Client sign-off", description: "Final review and approval by client", weekOffset: 13, duration: 1 },
  { phase: "Review & Submission", title: "FCA submission", description: "Submit application to FCA", weekOffset: 14, duration: 1 },
];

function calculateDueDate(startDate: Date, weekOffset: number): Date {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + weekOffset * 7);
  return dueDate;
}

// Verify pack belongs to user's organization
async function verifyPackOwnership(packId: string, organizationId: string): Promise<{ pack: Awaited<ReturnType<typeof getAuthorizationPack>> | null; hasAccess: boolean }> {
  const pack = await getAuthorizationPack(packId);
  if (!pack) return { pack: null, hasAccess: false };
  return { pack, hasAccess: pack.organization_id === organizationId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id: projectId } = await params;

    // Validate ID format
    if (!isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    // Verify the user has access to this project
    const { pack, hasAccess } = await verifyPackOwnership(projectId, auth.organizationId);
    if (!pack) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ plan: pack.project_plan || {} });
  } catch (error) {
    logError(error, "Failed to fetch project plan");
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id: projectId } = await params;

    // Validate ID format
    if (!isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    // Verify the user has access to this project
    const { pack, hasAccess } = await verifyPackOwnership(projectId, auth.organizationId);
    if (!pack) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get typical timeline from template
    const templates = await getPackTemplates();
    const template = templates.find((t) => t.id === pack.pack_template_id);
    const typicalWeeks = template?.typical_timeline_weeks || 16;

    // Check if milestones already exist
    const existingMilestones = await getProjectMilestones(projectId);
    if (existingMilestones.length > 0) {
      // Return existing plan
      return NextResponse.json({
        success: true,
        message: "Plan already exists",
        plan: pack.project_plan,
      });
    }

    // Calculate start date (today or from target submission date)
    const startDate = new Date();
    const targetDate = pack.target_submission_date
      ? new Date(pack.target_submission_date)
      : new Date(startDate.getTime() + typicalWeeks * 7 * 24 * 60 * 60 * 1000);

    // Scale milestones to fit timeline
    const scaleFactor = typicalWeeks / 16; // 16 is the default template timeline

    // Create milestones
    const createdMilestones = [];
    for (let i = 0; i < milestoneTemplates.length; i++) {
      const mt = milestoneTemplates[i];
      const scaledWeekOffset = Math.round(mt.weekOffset * scaleFactor);
      const dueDate = calculateDueDate(startDate, scaledWeekOffset + mt.duration);

      const milestone = await createProjectMilestone({
        pack_id: projectId,
        title: mt.title,
        description: mt.description,
        due_date: dueDate,
        linked_module: mt.linkedModule,
        order_index: i,
      });
      createdMilestones.push(milestone);
    }

    // Update pack with project plan metadata
    const planData = {
      generatedAt: new Date().toISOString(),
      startDate: startDate.toISOString(),
      targetDate: targetDate.toISOString(),
      totalWeeks: typicalWeeks,
      phases: [
        "Assessment & Scoping",
        "Narrative & Business Plan",
        "Policies & Evidence",
        "Governance & SMCR",
        "Review & Submission",
      ],
      milestones: createdMilestones.map((m, idx) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        phase: milestoneTemplates[idx].phase,
        status: m.status,
        startWeek: Math.round(milestoneTemplates[idx].weekOffset * scaleFactor) + 1,
        durationWeeks: milestoneTemplates[idx].duration,
        endWeek: Math.round(milestoneTemplates[idx].weekOffset * scaleFactor) + milestoneTemplates[idx].duration,
        dueDate: m.due_date ? new Date(m.due_date).toLocaleDateString("en-GB") : "",
        linkedModule: milestoneTemplates[idx].linkedModule,
      })),
    };

    await updateAuthorizationPack(projectId, {
      project_plan: planData,
      status: "in_progress",
    });

    return NextResponse.json(
      {
        success: true,
        milestones: createdMilestones.length,
        plan: planData,
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error, "Failed to generate project plan");
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
