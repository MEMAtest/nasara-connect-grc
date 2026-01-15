import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

interface AnalyzeRequestBody {
  basics: {
    legalName?: string;
    firmStage?: string;
    regulatedActivities?: string;
    headcount?: number;
    primaryJurisdiction?: string;
    incorporationDate?: string;
  };
}

interface ReadinessItem {
  suggested: "missing" | "partial" | "complete";
  reason: string;
  priority: "high" | "medium" | "low";
}

interface AnalysisResponse {
  readiness: {
    businessPlanDraft: ReadinessItem;
    financialModel: ReadinessItem;
    technologyStack: ReadinessItem;
    safeguardingSetup: ReadinessItem;
    amlFramework: ReadinessItem;
    riskFramework: ReadinessItem;
    governancePack: ReadinessItem;
  };
  priorities: string[];
  risks: string[];
  recommendations: string[];
}

function buildAnalysisSystemPrompt(): string {
  return `You are an FCA authorization readiness analyst for UK financial services firms.
Analyze the provided firm information and assess their readiness status for FCA authorization.

For each readiness category, suggest:
- "complete" if the firm stage/activities indicate they likely have this in place
- "partial" if they may have started but likely need more work
- "missing" if they're early stage or it's not evident

Consider:
- Pre-authorisation firms typically have "missing" or "partial" for most items
- Building-stage firms often have "partial" across the board
- Live/expanding firms should have more items "complete"
- Regulated activities affect which items are most critical

Provide:
1. Specific reasoning for each assessment
2. Top 3 priority items to focus on
3. Any red flags or risks based on the firm profile
4. Key recommendations for next steps

Return a valid JSON object with this exact structure:
{
  "readiness": {
    "businessPlanDraft": { "suggested": "missing|partial|complete", "reason": "...", "priority": "high|medium|low" },
    "financialModel": { "suggested": "...", "reason": "...", "priority": "..." },
    "technologyStack": { "suggested": "...", "reason": "...", "priority": "..." },
    "safeguardingSetup": { "suggested": "...", "reason": "...", "priority": "..." },
    "amlFramework": { "suggested": "...", "reason": "...", "priority": "..." },
    "riskFramework": { "suggested": "...", "reason": "...", "priority": "..." },
    "governancePack": { "suggested": "...", "reason": "...", "priority": "..." }
  },
  "priorities": ["First priority", "Second priority", "Third priority"],
  "risks": ["Any red flags or concerns"],
  "recommendations": ["Key action items"]
}`;
}

function buildAnalysisUserPrompt(basics: AnalyzeRequestBody["basics"]): string {
  return `Analyze this firm's readiness for FCA authorization:

Firm Details:
- Legal Name: ${basics.legalName || "Not provided"}
- Firm Stage: ${basics.firmStage || "Not provided"}
- Primary Jurisdiction: ${basics.primaryJurisdiction || "United Kingdom"}
- Regulated Activities: ${basics.regulatedActivities || "Not specified"}
- Headcount: ${basics.headcount || "Not provided"}
- Incorporation Date: ${basics.incorporationDate || "Not provided"}

Based on this profile, assess their readiness status for each category and provide actionable recommendations.`;
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
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    // Verify pack access
    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse request body
    let body: AnalyzeRequestBody;
    try {
      body = (await request.json()) as AnalyzeRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.basics) {
      return NextResponse.json({ error: "basics object is required" }, { status: 400 });
    }

    // Build prompts
    const systemPrompt = buildAnalysisSystemPrompt();
    const userPrompt = buildAnalysisUserPrompt(body.basics);

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
        "X-Title": "Nasara Connect - Assessment Intelligence",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1500,
        top_p: 1,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error("OpenRouter error", upstream.status, errorText);
      return NextResponse.json(
        { error: "AI service unavailable", details: errorText },
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
    let analysis: AnalysisResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonContent = jsonMatch[1] || content;
      analysis = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Return a fallback response
      return NextResponse.json({
        analysis: {
          readiness: {
            businessPlanDraft: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "high" },
            financialModel: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "high" },
            technologyStack: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "medium" },
            safeguardingSetup: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "high" },
            amlFramework: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "high" },
            riskFramework: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "medium" },
            governancePack: { suggested: "partial", reason: "Unable to analyze - please review manually", priority: "medium" },
          },
          priorities: ["Complete firm assessment manually", "Review all readiness categories", "Consult with compliance advisor"],
          risks: ["AI analysis was unable to parse - manual review recommended"],
          recommendations: ["Please complete the assessment form with more details for better AI analysis"],
        },
        raw: content,
        warning: "AI response could not be parsed - using fallback analysis",
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    logError(error, "Assessment analyze route error");
    return NextResponse.json(
      { error: "Failed to analyze assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
