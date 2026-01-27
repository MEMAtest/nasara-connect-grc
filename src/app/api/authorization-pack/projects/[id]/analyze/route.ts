import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationProject } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { getOpenRouterApiKey } from "@/lib/openrouter";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const MAX_INPUT_LENGTH = 1000;

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

interface AnalyzeRequestBody {
  basics: {
    legalName?: string;
    firmStage?: string;
    regulatedActivities?: string;
    headcount?: number;
    primaryJurisdiction?: string;
    incorporationDate?: string;
  };
  businessPlanProfileCompletion?: number;
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

function buildFallbackAnalysis(basics: AnalyzeRequestBody["basics"], profileCompletion?: number): AnalysisResponse {
  const stage = (basics.firmStage || "").toLowerCase();
  const activities = (basics.regulatedActivities || "").toLowerCase();

  const isEarlyStage =
    stage.includes("pre-incorporation") ||
    stage.includes("pre") ||
    stage.includes("newly") ||
    stage.includes("new");
  const isEstablished =
    stage.includes("established") ||
    stage.includes("authorised") ||
    stage.includes("authorized");

  const baseStatus: ReadinessItem["suggested"] = isEarlyStage ? "missing" : isEstablished ? "partial" : "partial";

  const priorityFrom = (value: ReadinessItem["suggested"]): ReadinessItem["priority"] =>
    value === "missing" ? "high" : value === "partial" ? "medium" : "low";

  const buildItem = (label: string, suggested: ReadinessItem["suggested"], extra?: string): ReadinessItem => ({
    suggested,
    priority: priorityFrom(suggested),
    reason: extra || `${label} inferred from firm stage and provided activities.`,
  });

  const needsSafeguarding =
    activities.includes("payment") ||
    activities.includes("remittance") ||
    activities.includes("e-money") ||
    activities.includes("emoney");

  // Determine business plan draft status based on profile completion
  let businessPlanStatus: ReadinessItem["suggested"] = baseStatus;
  let businessPlanReason = "Based on firm stage and scope.";
  if (typeof profileCompletion === "number") {
    if (profileCompletion >= 80) {
      businessPlanStatus = "complete";
      businessPlanReason = `Business plan profile is ${profileCompletion}% complete.`;
    } else if (profileCompletion >= 40) {
      businessPlanStatus = "partial";
      businessPlanReason = `Business plan profile is ${profileCompletion}% complete. Continue filling in the remaining sections.`;
    } else if (profileCompletion > 0) {
      businessPlanStatus = "partial";
      businessPlanReason = `Business plan profile is only ${profileCompletion}% complete. Focus on completing the core sections.`;
    } else {
      businessPlanStatus = "missing";
      businessPlanReason = "Business plan profile has not been started. Begin with the Business Plan Profile section.";
    }
  }

  const readiness = {
    businessPlanDraft: buildItem("Business plan draft", businessPlanStatus, businessPlanReason),
    financialModel: buildItem(
      "Financial model",
      isEarlyStage ? "missing" : "partial",
      "Financial modelling typically follows the assessment stage."
    ),
    technologyStack: buildItem("Technology stack", isEarlyStage ? "missing" : baseStatus),
    safeguardingSetup: buildItem(
      "Safeguarding setup",
      needsSafeguarding ? (isEarlyStage ? "missing" : "partial") : baseStatus,
      needsSafeguarding
        ? "Safeguarding is central to payment services and should be evidenced early."
        : "Safeguarding expectations depend on the services in scope."
    ),
    amlFramework: buildItem("AML/CTF framework", isEarlyStage ? "missing" : "partial"),
    riskFramework: buildItem("Risk framework", isEarlyStage ? "missing" : "partial"),
    governancePack: buildItem("Governance pack", isEarlyStage ? "missing" : "partial"),
  };

  const priorities = Object.entries(readiness)
    .filter(([, item]) => item.priority === "high")
    .map(([key]) => key.replace(/([A-Z])/g, " $1").trim())
    .slice(0, 3);

  return {
    readiness,
    priorities: priorities.length ? priorities : ["Complete the firm assessment baseline", "Confirm scope and permissions", "Draft core governance pack"],
    risks: [
      isEarlyStage
        ? "Early-stage firms often need to formalize governance, safeguarding, and AML frameworks."
        : "Ensure controls and documentation match the permissions and services in scope.",
    ],
    recommendations: [
      "Complete the firm assessment with confirmed service scope and operational model.",
      "Draft the business plan narrative for core FCA sections.",
      "Prepare safeguarding and AML documentation aligned to the chosen permissions.",
    ],
  };
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

function buildAnalysisUserPrompt(basics: AnalyzeRequestBody["basics"], profileCompletion?: number): string {
  const profileInfo = typeof profileCompletion === "number"
    ? `${profileCompletion}% complete`
    : "Not started";

  return `Analyze this firm's readiness for FCA authorization:

Firm Details:
- Legal Name: ${sanitizeInput(basics.legalName, 200) || "Not provided"}
- Firm Stage: ${sanitizeInput(basics.firmStage, 100) || "Not provided"}
- Primary Jurisdiction: ${sanitizeInput(basics.primaryJurisdiction, 100) || "United Kingdom"}
- Regulated Activities: ${sanitizeInput(basics.regulatedActivities, 500) || "Not specified"}
- Headcount: ${basics.headcount || "Not provided"}
- Incorporation Date: ${sanitizeInput(basics.incorporationDate, 50) || "Not provided"}
- Business Plan Profile: ${profileInfo}

Based on this profile, assess their readiness status for each category and provide actionable recommendations.
Note: The Business Plan Profile completion percentage directly indicates how much of the business plan draft has been completed.`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const project = await getAuthorizationProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.organization_id !== auth.organizationId) {
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

    const fallback = buildFallbackAnalysis(body.basics, body.businessPlanProfileCompletion);

    // Check for API key
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      return NextResponse.json({
        analysis: fallback,
        warning: "AI service not configured. Returned baseline analysis.",
      });
    }

    // Build prompts
    const systemPrompt = buildAnalysisSystemPrompt();
    const userPrompt = buildAnalysisUserPrompt(body.basics, body.businessPlanProfileCompletion);

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
      logError(new Error(`OpenRouter error ${upstream.status}: ${errorText}`), "Analyze AI call failed");
      return NextResponse.json({
        analysis: fallback,
        warning: "AI service temporarily unavailable. Returned baseline analysis.",
      });
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
        analysis: fallback,
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
