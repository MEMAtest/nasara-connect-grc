import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import {
  createPackDocument,
  deletePackDocument,
  getPack,
  getProjectByPackId,
} from "@/lib/authorization-pack-db";
import { createProjectDocument, deleteProjectDocument, initDatabase } from "@/lib/database";
import {
  removeAuthorizationPackPdf,
  storeAuthorizationPackPdf,
} from "@/lib/authorization-pack-storage";
import { htmlToText } from "@/lib/authorization-pack-export";
import {
  buildProfileInsights,
  getProfileQuestions,
  isProfilePermissionCode,
  type ProfileQuestion,
  type ProfileResponse,
} from "@/lib/business-plan-profile";
import {
  buildPerimeterOpinionPack,
  type OpinionSection,
  type OpinionSectionInput,
} from "@/lib/perimeter-opinion-pdf-builder";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

function sanitizeFilename(input: string) {
  return input.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim().slice(0, 180);
}

function ensurePdfFilename(input: string) {
  const trimmed = input.trim() || "perimeter-opinion-pack";
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
}

function buildStorageKey(packId: string, packName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeBase = sanitizeFilename(packName).replace(/\s+/g, "-").toLowerCase() || "authorization-pack";
  return path.posix.join(packId, "documents", `${timestamp}-${safeBase}-perimeter-opinion.pdf`);
}

const AI_SYNTHESIS_TIMEOUT = 30000;

function formatResponse(question: ProfileQuestion, response: ProfileResponse | undefined): string {
  if (response === undefined || response === null) return "";

  if (Array.isArray(response)) {
    if (question.options) {
      const labels = response.map((value) => {
        const option = question.options?.find((opt) => opt.value === value);
        return option?.label || value;
      });
      return labels.filter(Boolean).join(", ");
    }
    return response.join(", ");
  }

  if (typeof response === "boolean") {
    return response ? "Yes" : "No";
  }

  if (typeof response === "number") {
    return String(response);
  }

  if (question.options) {
    const option = question.options.find((opt) => opt.value === response);
    return option?.label || response;
  }

  return String(response);
}

function buildInputsForSections(
  questions: ProfileQuestion[],
  responses: Record<string, ProfileResponse>,
  sectionIds: string[]
): OpinionSectionInput[] {
  return questions
    .filter((question) => sectionIds.includes(question.sectionId))
    .map((question) => {
      const response = formatResponse(question, responses[question.id]);
      if (!response) return null;
      return {
        label: question.prompt,
        response,
        description: question.description,
        references: question.regulatoryRefs,
      };
    })
    .filter(Boolean) as OpinionSectionInput[];
}

function buildSummaryContent({
  opinion,
  completionPercent,
  regulatorySignals,
  activityHighlights,
  focusAreas,
  assumptionNote,
}: {
  opinion: { verdict: string; summary: string; rationale: string[]; obligations: string[] };
  completionPercent: number;
  regulatorySignals: Array<{ label: string; count: number }>;
  activityHighlights: string[];
  focusAreas: string[];
  assumptionNote?: string;
}): string {
  const lines: string[] = [];

  lines.push("**Opinion summary**");
  lines.push(`Verdict: ${opinion.verdict.replace(/-/g, " ")}`);
  lines.push(opinion.summary);

  if (opinion.rationale.length) {
    lines.push("");
    lines.push("**Rationale**");
    opinion.rationale.forEach((item) => lines.push(`- ${item}`));
  }

  if (opinion.obligations.length) {
    lines.push("");
    lines.push("**Key obligations**");
    opinion.obligations.forEach((item) => lines.push(`- ${item}`));
  }

  if (activityHighlights.length) {
    lines.push("");
    lines.push("**Regulated activities highlighted**");
    activityHighlights.forEach((item) => lines.push(`- ${item}`));
  }

  if (regulatorySignals.length) {
    lines.push("");
    lines.push("**Regulatory drivers referenced**");
    regulatorySignals.slice(0, 6).forEach((signal) => lines.push(`- ${signal.label} (${signal.count})`));
  }

  if (assumptionNote) {
    lines.push("");
    lines.push("**Perimeter assumptions**");
    lines.push(assumptionNote);
  }

  lines.push("");
  lines.push("**Profile completion**");
  lines.push(`Required responses complete: ${completionPercent}%`);

  if (focusAreas.length) {
    lines.push("");
    lines.push("**Coverage gaps to resolve**");
    focusAreas.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join("\n");
}

async function synthesizeOpinionSection(
  section: OpinionSection,
  context: string
): Promise<string | null> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn(`[Opinion Pack] AI synthesis skipped for "${section.title}" - API key not configured`);
    return null;
  }

  if (!section.inputs.length) {
    return null;
  }

  const promptContent = section.inputs
    .map((input) => {
      const cleanResponse = htmlToText(input.response) || input.response || "(No response)";
      const references = input.references?.length ? `References: ${input.references.join(", ")}` : "References: none";
      const description = input.description ? `Context: ${input.description}` : "";
      return `### ${input.label}\n${description}\n${cleanResponse}\n${references}`.trim();
    })
    .join("\n\n");

  const sanitizedTitle = section.title.replace(/["\n\r]/g, "");

  const systemPrompt = `You are a regulatory perimeter analyst. Draft a concise section for a perimeter opinion pack.
Guidelines:
- Write in formal business English, third person
- Use short headings and bullet points where helpful
- Map to PERG/PSD2/CONC/COBS where the references indicate relevance
- Do NOT invent facts; only use the inputs provided
- Keep output between 300-500 words
- Use **bold** for headings
`;

  const userPrompt = `Section: "${sanitizedTitle}"
Purpose: ${section.description}
Context:
${context}

Source inputs:
${promptContent}
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_SYNTHESIS_TIMEOUT);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect Perimeter Opinion Pack",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 900,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`[Opinion Pack] AI synthesis failed for "${section.title}":`, response.status, errorText);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn(`[Opinion Pack] AI returned empty content for "${section.title}"`);
      return null;
    }

    return content;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.error(`[Opinion Pack] AI synthesis timeout for "${section.title}" (>${AI_SYNTHESIS_TIMEOUT}ms)`);
    } else {
      console.error(`[Opinion Pack] AI synthesis error for "${section.title}":`, error);
    }
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
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

    const project = await getProjectByPackId(packId);
    if (!project) {
      return NextResponse.json({ error: "Project not found for this pack" }, { status: 404 });
    }

    const permission = isProfilePermissionCode(project.permissionCode)
      ? project.permissionCode
      : null;
    if (!permission) {
      return NextResponse.json({ error: "Unsupported permission for opinion pack" }, { status: 400 });
    }

    const profile = project.assessmentData?.businessPlanProfile;
    const responses = profile?.responses ?? {};
    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: "Business plan profile responses are required before generating the opinion pack." },
        { status: 400 }
      );
    }

    const questions = getProfileQuestions(permission);
    const insights = buildProfileInsights(permission, responses);

    const questionLookup = new Map<string, ProfileQuestion>();
    questions.forEach((question) => questionLookup.set(question.id, question));

    const perimeterClarity = questionLookup.get("core-perimeter-clarity");
    const perimeterAnswer = perimeterClarity
      ? formatResponse(perimeterClarity, responses["core-perimeter-clarity"])
      : "";
    const assumptionNote = perimeterAnswer ? `Out-of-scope documentation: ${perimeterAnswer}.` : undefined;

    const summarySection: OpinionSection = {
      key: "perimeter-summary",
      title: "Perimeter Opinion Summary",
      description: "Indicative FCA perimeter opinion based on profile responses.",
      inputs: [],
      synthesizedContent: buildSummaryContent({
        opinion: insights.perimeterOpinion,
        completionPercent: insights.completionPercent,
        regulatorySignals: insights.regulatorySignals,
        activityHighlights: insights.activityHighlights,
        focusAreas: insights.focusAreas,
        assumptionNote,
      }),
    };

    const permissionSectionId =
      permission === "payments" ? "payments" : permission === "consumer-credit" ? "consumer-credit" : "investments";

    const scopeInputs = buildInputsForSections(questions, responses, ["scope", permissionSectionId]);
    const modelInputs = buildInputsForSections(questions, responses, ["model", "operations", "governance"]);
    const financialInputs = buildInputsForSections(questions, responses, ["financials"]);

    if (insights.focusAreas.length) {
      financialInputs.push({
        label: "Coverage gaps to resolve",
        response: insights.focusAreas.join(", "),
      });
    }

    const sections: OpinionSection[] = [
      summarySection,
      {
        key: "regulatory-scope",
        title: "Regulated Activities and Permissions",
        description: "Scope of regulated activities, permissions required, and any exclusions or exemptions.",
        inputs: scopeInputs,
      },
      {
        key: "business-model-operations",
        title: "Business Model, Operations and Governance",
        description: "Customer model, delivery channels, operations, and control environment.",
        inputs: modelInputs,
      },
      {
        key: "financials-winddown",
        title: "Financials, Wind-Down and Next Steps",
        description: "Funding position, projections, wind-down readiness, and remaining gaps.",
        inputs: financialInputs,
      },
    ];

    const contextLines = [
      `Permission scope: ${project.permissionName || project.permissionCode}`,
      `Perimeter verdict: ${insights.perimeterOpinion.verdict.replace(/-/g, " ")}`,
      `Summary: ${insights.perimeterOpinion.summary}`,
      `Profile completion: ${insights.completionPercent}%`,
    ];
    if (insights.activityHighlights.length) {
      contextLines.push(`Activity highlights: ${insights.activityHighlights.join(", ")}`);
    }
    const context = contextLines.join("\n");

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const synthesized = await synthesizeOpinionSection(section, context);
      if (synthesized) {
        section.synthesizedContent = synthesized;
      }
      await delay(400);
    }

    const firmBasics = project.assessmentData?.basics;

    const pdfBytes = await buildPerimeterOpinionPack(
      {
        packName: pack.name,
        permissionLabel: project.permissionName || project.permissionCode,
        profileCompletion: insights.completionPercent,
        opinion: insights.perimeterOpinion,
        regulatorySignals: insights.regulatorySignals,
        activityHighlights: insights.activityHighlights,
        firmBasics,
      },
      sections
    );

    const timestamp = new Date().toISOString().split("T")[0];
    const documentName = `Perimeter Opinion Pack - ${pack.name} - ${timestamp}`;

    const description = `Perimeter opinion pack generated from profile responses. Completion: ${insights.completionPercent}%.`;

    const storageKey = buildStorageKey(packId, pack.name);
    const storedFile = await storeAuthorizationPackPdf(storageKey, pdfBytes);

    let document = null;
    let packDocument = null;

    try {
      document = await createProjectDocument({
        pack_id: packId,
        name: documentName,
        description,
        section_code: "perimeter-opinion",
        storage_key: storedFile.storageKey,
        uploaded_by: auth.userId ?? undefined,
        mime_type: "application/pdf",
        file_size_bytes: pdfBytes.length,
      });

      if (!document) {
        throw new Error("Failed to create project document record");
      }

      packDocument = await createPackDocument({
        packId,
        name: documentName,
        description,
        sectionCode: "perimeter-opinion",
        storageKey: storedFile.storageKey,
        mimeType: "application/pdf",
        fileSizeBytes: pdfBytes.length,
        uploadedBy: auth.userId ?? null,
        uploadedAt: new Date().toISOString(),
      });

      if (!packDocument) {
        throw new Error("Failed to create pack document record");
      }
    } catch (error) {
      if (packDocument?.id) {
        await deletePackDocument(packDocument.id).catch(() => null);
      }
      if (document?.id) {
        await deleteProjectDocument(document.id).catch(() => null);
      }
      await removeAuthorizationPackPdf(storedFile.storageKey).catch(() => null);
      throw error;
    }

    const filename = ensurePdfFilename(sanitizeFilename(documentName));

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Document-Id": document.id,
        "X-Pack-Document-Id": packDocument?.id ?? "",
        "X-Document-Name": documentName,
        "X-Document-Filename": filename,
        "X-Section-Count": String(sections.length),
        "X-Profile-Completion": String(insights.completionPercent),
      },
    });
  } catch (error) {
    console.error("Perimeter opinion generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate opinion pack",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
