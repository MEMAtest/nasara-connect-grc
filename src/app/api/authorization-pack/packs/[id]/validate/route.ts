import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSections } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const MAX_INPUT_LENGTH = 2000;

/**
 * Sanitize user input to prevent prompt injection attacks.
 */
function sanitizeInput(input: string | undefined, maxLength = MAX_INPUT_LENGTH): string {
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

interface ValidationIssue {
  section: string;
  type: "incomplete" | "inconsistent" | "unclear" | "missing";
  description: string;
  severity: "warning" | "error";
}

interface ValidationResponse {
  score: number;
  issues: ValidationIssue[];
  ready: boolean;
  summary: string;
}

function buildValidationSystemPrompt(): string {
  return `You are an FCA authorization pack quality reviewer for UK financial services firms.
Review the provided pack content and identify quality issues before submission.

Check for:
1. INCOMPLETE sections - missing required information or placeholders
2. INCONSISTENT content - contradictions or mismatches between sections
3. UNCLEAR language - vague statements that need specifics
4. MISSING requirements - standard FCA requirements not addressed

Severity levels:
- "error": Must be fixed before submission (missing critical info, placeholders, contradictions)
- "warning": Should be reviewed but not blocking (could be clearer, minor gaps)

Return a valid JSON object with this structure:
{
  "score": 0-100,
  "issues": [
    {
      "section": "Section name",
      "type": "incomplete|inconsistent|unclear|missing",
      "description": "Specific issue description",
      "severity": "warning|error"
    }
  ],
  "ready": true/false,
  "summary": "Brief overall assessment"
}

Set ready=false if there are any "error" severity issues.`;
}

function buildValidationUserPrompt(
  packName: string,
  sections: Array<{ name: string; status: string; progress: number; narrativeContent?: string }>
): string {
  const sectionSummaries = sections.map((s) => {
    const contentPreview = s.narrativeContent
      ? sanitizeInput(s.narrativeContent.substring(0, 500).replace(/<[^>]*>/g, "").trim(), 500)
      : "(No content)";
    return `## ${sanitizeInput(s.name, 200)}
Status: ${sanitizeInput(s.status, 50)} | Progress: ${s.progress}%
Content: ${contentPreview}${s.narrativeContent && s.narrativeContent.length > 500 ? "..." : ""}`;
  }).join("\n\n");

  return `Validate this FCA authorization pack for submission readiness:

Pack Name: ${sanitizeInput(packName, 200)}
Total Sections: ${sections.length}
Sections with Content: ${sections.filter(s => s.narrativeContent && s.narrativeContent.length > 10).length}

${sectionSummaries}

Identify any quality issues that should be addressed before FCA submission.`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check for API key first
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured. Missing OPENROUTER_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id } = await params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify pack access
    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all sections with their content
    const sections = await getPackSections(id);

    // Build section data for AI analysis
    const sectionData = sections.map((s) => ({
      name: s.template?.name || "Unknown Section",
      status: s.status || "not-started",
      progress: s.progress_percentage || 0,
      narrativeContent: typeof s.narrative_content === "string"
        ? s.narrative_content
        : JSON.stringify(s.narrative_content || ""),
    }));

    // Build prompts
    const systemPrompt = buildValidationSystemPrompt();
    const userPrompt = buildValidationUserPrompt(pack.name, sectionData);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    // Call OpenRouter API (non-streaming for JSON response)
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect - Export Validation",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 1,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      logError(new Error(`OpenRouter error ${upstream.status}: ${errorText}`), "Validation AI call failed");
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
        { error: "No validation returned from AI" },
        { status: 502 }
      );
    }

    // Parse the JSON response from AI
    let validation: ValidationResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonContent = jsonMatch[1] || content;
      validation = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Return a fallback response based on basic metrics
      const hasContent = sectionData.filter((s) => s.progress > 0).length;
      const avgProgress = sectionData.reduce((sum, s) => sum + s.progress, 0) / (sectionData.length || 1);

      return NextResponse.json({
        score: Math.round(avgProgress),
        issues: [
          {
            section: "General",
            type: "unclear" as const,
            description: "AI validation could not complete - please review manually",
            severity: "warning" as const,
          },
        ],
        ready: avgProgress >= 80 && hasContent >= sectionData.length * 0.8,
        summary: `Pack has ${hasContent}/${sectionData.length} sections with content. Average progress: ${Math.round(avgProgress)}%.`,
        warning: "AI response could not be parsed - using basic validation",
      });
    }

    return NextResponse.json(validation);
  } catch (error) {
    logError(error, "Validation route error");
    return NextResponse.json(
      { error: "Failed to validate pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
