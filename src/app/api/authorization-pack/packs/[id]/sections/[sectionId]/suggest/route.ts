import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSection } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const MAX_INPUT_LENGTH = 10000;

/**
 * Sanitize user input to prevent prompt injection attacks.
 * Strips control characters, limits length, and escapes delimiter patterns.
 */
function sanitizePromptInput(input: string | undefined, maxLength = MAX_INPUT_LENGTH): string {
  if (!input) return "";
  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "...";
  }
  // Escape common prompt injection patterns
  sanitized = sanitized
    .replace(/```/g, "'''")
    .replace(/\[INST\]/gi, "[instruction]")
    .replace(/\[\/INST\]/gi, "[/instruction]")
    .replace(/<\|.*?\|>/g, "");
  return sanitized;
}

interface SuggestRequestBody {
  promptKey: string;
  promptTitle: string;
  promptGuidance?: string;
  existingContent?: string;
  assessmentData?: {
    legalName?: string;
    primaryJurisdiction?: string;
    firmStage?: string;
    regulatedActivities?: string;
    headcount?: number;
  };
  sectionTemplate?: string;
  mode?: "generate" | "enhance";
}

interface StreamChunkDelta {
  choices?: Array<{ delta?: { content?: string } }>;
}

interface StreamChunkMessage {
  choices?: Array<{ message?: { content?: string } }>;
}

type UpstreamStreamChunk = StreamChunkDelta | StreamChunkMessage;

function buildNarrativeSystemPrompt(
  body: SuggestRequestBody,
  sectionTitle: string,
  sectionGuidance?: string | null
): string {
  const mode = body.mode ?? "generate";
  const isEnhance = mode === "enhance";

  const base = `You are an FCA authorization pack drafting assistant for UK financial services firms.
You help draft professional, compliant narrative content for authorization applications.

Guidelines:
- Write in a professional, formal tone suitable for regulatory submission
- Use appropriate FCA/UK financial services terminology
- Be specific and comprehensive, avoiding vague statements
- Structure content with clear paragraphs
- Do NOT invent specific data (names, dates, figures) unless provided in context
- If information is missing, use placeholder brackets like [INSERT COMPANY NAME]`;

  const modeDirective = isEnhance
    ? `Mode: ENHANCE existing content. Improve the provided text for clarity, completeness, and regulatory compliance. Maintain the original meaning and intent while making it more professional and comprehensive.`
    : `Mode: GENERATE new content. Create a complete, professional narrative response that directly addresses the prompt requirements.`;

  const sectionContext = `
Section: ${sectionTitle}
${sectionGuidance ? `Section Guidance: ${sectionGuidance}` : ""}

Prompt to Address: ${body.promptTitle}
${body.promptGuidance ? `FCA Guidance: ${body.promptGuidance}` : ""}`;

  const firmContext = body.assessmentData
    ? `
Firm Context:
- Legal Name: ${body.assessmentData.legalName || "[Not provided]"}
- Jurisdiction: ${body.assessmentData.primaryJurisdiction || "United Kingdom"}
- Firm Stage: ${body.assessmentData.firmStage || "[Not provided]"}
- Regulated Activities: ${body.assessmentData.regulatedActivities || "[Not provided]"}
${body.assessmentData.headcount ? `- Headcount: ${body.assessmentData.headcount}` : ""}`
    : "";

  const existingContentSection = isEnhance && body.existingContent
    ? `
Existing Content to Enhance:
---
${sanitizePromptInput(body.existingContent, 5000)}
---

Please improve this content while maintaining its core message.`
    : "";

  return `${base}

${modeDirective}
${sectionContext}
${firmContext}
${existingContentSection}

Generate a response of 200-400 words that is ready for inclusion in an FCA authorization application.`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
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
    const { id, sectionId } = await params;

    // Validate UUIDs
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    // Verify pack access
    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify section belongs to pack
    const section = await getPackSection(sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    if (section.pack_id !== id) {
      return NextResponse.json({ error: "Section does not belong to this pack" }, { status: 403 });
    }

    // Parse request body
    let body: SuggestRequestBody;
    try {
      body = (await request.json()) as SuggestRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.promptTitle) {
      return NextResponse.json({ error: "promptTitle is required" }, { status: 400 });
    }

    // Build the system prompt
    const sectionTitle = section.template?.name || "Authorization Pack Section";
    const sectionGuidance = section.template?.guidance_text;
    const systemPrompt = buildNarrativeSystemPrompt(body, sectionTitle, sectionGuidance);

    // Prepare messages for the AI
    const sanitizedTitle = sanitizePromptInput(body.promptTitle, 500);
    const userMessage = body.mode === "enhance" && body.existingContent
      ? `Please enhance the existing content for the prompt: "${sanitizedTitle}"`
      : `Please generate professional narrative content for the following prompt: "${sanitizedTitle}"`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ];

    // Call OpenRouter API with streaming
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nasara Connect - Authorization Pack AI",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.4, // Slightly higher for more natural writing
        max_tokens: 1200, // Allow longer responses for narrative
        top_p: 1,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      logError(new Error(`OpenRouter error ${upstream.status}: ${errorText}`), "Suggest AI call failed");
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.error(new Error("No stream from AI service"));
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data:")) continue;

              const json = trimmed.replace(/^data:\s*/, "");
              try {
                const parsed = JSON.parse(json) as StreamChunkDelta;
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(new TextEncoder().encode(delta));
                }
              } catch {
                // Ignore malformed chunks
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    logError(error, "Narrative suggest route error");
    return NextResponse.json(
      { error: "Failed to generate suggestion", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
