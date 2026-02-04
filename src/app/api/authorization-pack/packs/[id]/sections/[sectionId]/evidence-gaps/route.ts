import { NextRequest, NextResponse } from "next/server";
import { getPack, getSectionWorkspace, listEvidence } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { getOpenRouterApiKey } from "@/lib/openrouter";
import { requireRole } from "@/lib/rbac";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const MAX_INPUT_LENGTH = 1000;

/**
 * Sanitize user input to prevent prompt injection attacks.
 */
function sanitizeInput(input: string | undefined | null, maxLength = MAX_INPUT_LENGTH): string {
  if (!input) return "";
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "...";
  }
  sanitized = sanitized
    .replace(/```/g, "'''")
    .replace(/\[INST\]/gi, "[instruction]")
    .replace(/\[\/INST\]/gi, "[/instruction]")
    .replace(/<\|.*?\|>/g, "");
  return sanitized;
}

interface EvidenceGap {
  description: string;
  priority: "high" | "medium" | "low";
  regulatoryBasis: string;
  suggestedFormat: string;
}

interface EvidenceGapsResponse {
  gaps: EvidenceGap[];
  completeness: number;
  suggestions: string[];
}

function buildEvidenceGapsSystemPrompt(): string {
  return `You are an FCA authorization evidence analyst for UK financial services firms.
Analyze the section context and existing evidence to identify gaps in documentation.

For FCA authorization packs, common evidence requirements include:
- Policies and procedures (PDF documents)
- Organizational charts and governance structures
- Financial projections and capital adequacy
- Risk assessments and mitigation strategies
- AML/CTF documentation and procedures
- Training records and competency evidence
- Technical architecture documentation
- Business continuity plans
- Complaints handling procedures
- Outsourcing arrangements documentation

Return a valid JSON object with this structure:
{
  "gaps": [
    {
      "description": "Brief description of missing evidence",
      "priority": "high|medium|low",
      "regulatoryBasis": "Which FCA requirement this supports",
      "suggestedFormat": "PDF|Excel|Word|Other"
    }
  ],
  "completeness": 0-100,
  "suggestions": ["Action items to improve evidence coverage"]
}

Be specific about what's missing based on the section type and existing evidence.`;
}

function buildEvidenceGapsUserPrompt(
  sectionTitle: string,
  sectionGuidance: string | null,
  existingEvidence: Array<{ name: string; status: string; description?: string | null }>
): string {
  const evidenceList = existingEvidence.length > 0
    ? existingEvidence.map((e) => `- ${sanitizeInput(e.name, 200)} (${sanitizeInput(e.status, 50)})${e.description ? `: ${sanitizeInput(e.description, 300)}` : ""}`).join("\n")
    : "No evidence uploaded yet";

  return `Analyze evidence gaps for this FCA authorization pack section:

Section: ${sanitizeInput(sectionTitle, 200)}
${sectionGuidance ? `Guidance: ${sanitizeInput(sectionGuidance, 500)}` : ""}

Current Evidence:
${evidenceList}

Identify what key evidence is missing for FCA authorization requirements and prioritize by importance.`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  // Check for API key first
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured. Missing OPENROUTER_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id, sectionId } = await params;

    // Validate UUIDs
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    // Verify pack access
    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify section belongs to pack
    const workspace = await getSectionWorkspace(id, sectionId);
    if (!workspace) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Get existing evidence for this section
    const allEvidence = await listEvidence(id);
    const evidence = allEvidence.filter((e: { section_instance_id: string }) => e.section_instance_id === sectionId);

    // Build prompts
    const sectionTitle = workspace.section?.title || "Authorization Pack Section";
    const sectionGuidance = workspace.section?.description || null;
    const systemPrompt = buildEvidenceGapsSystemPrompt();
    const userPrompt = buildEvidenceGapsUserPrompt(
      sectionTitle,
      sectionGuidance,
      evidence.map((e) => ({
        name: e.name,
        status: e.status,
        description: e.description,
      }))
    );

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    // Call OpenRouter API (non-streaming for JSON response)
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect - Evidence Gap Analysis",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1200,
        top_p: 1,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      logError(new Error(`OpenRouter error ${upstream.status}: ${errorText}`), "Evidence gaps AI call failed");
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No analysis returned from AI" },
        { status: 502 }
      );
    }

    // Parse the JSON response from AI
    let analysis: EvidenceGapsResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonContent = jsonMatch[1] || content;
      analysis = JSON.parse(jsonContent.trim());
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      // Return a fallback response
      return NextResponse.json({
        gaps: [
          {
            description: "Unable to analyze - please review evidence requirements manually",
            priority: "medium" as const,
            regulatoryBasis: "General FCA requirements",
            suggestedFormat: "PDF",
          },
        ],
        completeness: evidence.filter((e) => e.status === "approved" || e.status === "uploaded").length > 0 ? 50 : 0,
        suggestions: ["Review FCA requirements for this section type", "Consult with compliance advisor"],
        warning: "AI response could not be parsed - using fallback analysis",
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    logError(error, "Evidence gaps route error");
    return NextResponse.json(
      { error: "Failed to analyze evidence gaps", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
