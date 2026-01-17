import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const VISION_MODEL = process.env.OPENROUTER_VISION_MODEL ?? "openai/gpt-4o";

interface ComplianceIssue {
  severity: "high" | "medium" | "low";
  category: string;
  description: string;
  regulation: string;
  recommendation: string;
}

interface ExtractedDetails {
  promotionType: string;
  channel: string;
  targetAudience: string;
  productService: string;
  riskWarningsFound: boolean;
  claimsIdentified: string[];
}

interface AnalysisResult {
  complianceScore: number;
  issues: ComplianceIssue[];
  extractedDetails: ExtractedDetails;
  summary: string;
}

const FINPROM_SYSTEM_PROMPT = `You are an FCA Financial Promotions compliance expert. Analyze the provided financial promotion (image or text) for compliance with UK FCA regulations.

Key regulations to consider:
- FCA COBS 4.2.1R - Communications must be fair, clear and not misleading
- FCA COBS 4.5.2R - Risk warnings must be prominent and adequate
- FCA COBS 4.6 - Past performance must include required warnings
- FCA COBS 4.7 - Direct offer financial promotions requirements
- ICOBS 2.2 - Insurance communications requirements
- BCOBS 2.2 - Banking communications requirements
- CONC 3 - Consumer credit financial promotions
- PSR 2017 - Payment services disclosure requirements

Analyze for:
1. Missing or inadequate risk warnings
2. Misleading claims or comparisons
3. Unclear terms and conditions
4. Target audience appropriateness
5. Product/service clarity
6. Required disclosures
7. Balance of benefits and risks
8. Prominence of key information

Return ONLY valid JSON in this exact format:
{
  "complianceScore": <0-100>,
  "summary": "<brief 1-2 sentence summary>",
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "<issue category>",
      "description": "<what the issue is>",
      "regulation": "<relevant FCA rule>",
      "recommendation": "<how to fix it>"
    }
  ],
  "extractedDetails": {
    "promotionType": "<advertisement|website|social_media|email|brochure|presentation|video|app|sms|other>",
    "channel": "<online|print|broadcast|social|email|direct_mail|phone|in_person|app|other>",
    "targetAudience": "<retail|professional|eligible_counterparty|general>",
    "productService": "<identified product or service name>",
    "riskWarningsFound": <true|false>,
    "claimsIdentified": ["<claim 1>", "<claim 2>"]
  }
}

Be thorough but practical. Focus on material compliance issues, not minor formatting preferences.
If no image is provided or the content is not a financial promotion, return a score of 0 with an appropriate message.`;

async function analyzeWithVision(imageBase64: string, mimeType: string): Promise<AnalysisResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Nasara Connect FinProm Analyzer",
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: "system",
          content: FINPROM_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this financial promotion for FCA compliance. Return the analysis as JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter vision error:", response.status, errorText);
    throw new Error(`Vision analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from vision model");
  }

  try {
    return JSON.parse(content) as AnalysisResult;
  } catch {
    // Try to extract JSON from the response if it's wrapped in markdown
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as AnalysisResult;
    }
    throw new Error("Failed to parse analysis result");
  }
}

async function analyzeWithText(textContent: string): Promise<AnalysisResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Nasara Connect FinProm Analyzer",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: FINPROM_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze this financial promotion text for FCA compliance. Return the analysis as JSON.\n\nPromotion content:\n${textContent}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter text analysis error:", response.status, errorText);
    throw new Error(`Text analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from model");
  }

  try {
    return JSON.parse(content) as AnalysisResult;
  } catch {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as AnalysisResult;
    }
    throw new Error("Failed to parse analysis result");
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let result: AnalysisResult;

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file type
      const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
      if (!supportedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Unsupported file type. Use PNG, JPG, WEBP, or PDF." },
          { status: 400 }
        );
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      // Convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // For PDFs, we need different handling - for now, treat first page as image
      // In production, you'd use a PDF parser or separate API
      if (file.type === "application/pdf") {
        // For PDF, we'll use text analysis with a note about it being a PDF
        // A proper implementation would extract text or render pages as images
        result = await analyzeWithText(
          `[PDF Document: ${file.name}]\n\nNote: This is a PDF file. Please analyze based on common financial promotion patterns and provide general guidance. The actual content analysis may be limited.`
        );
      } else {
        result = await analyzeWithVision(base64, file.type);
      }
    } else if (contentType.includes("application/json")) {
      // Handle JSON with base64 or text content
      const body = await request.json();

      if (body.imageBase64 && body.mimeType) {
        result = await analyzeWithVision(body.imageBase64, body.mimeType);
      } else if (body.textContent) {
        result = await analyzeWithText(body.textContent);
      } else if (body.url) {
        // For URL analysis, we'd need to fetch the page content
        // For now, return a placeholder
        result = await analyzeWithText(
          `[Web URL: ${body.url}]\n\nNote: URL analysis requires fetching page content. Please provide the promotion text or an image/screenshot for accurate analysis.`
        );
      } else {
        return NextResponse.json(
          { error: "Invalid request. Provide imageBase64+mimeType, textContent, or url." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Validate and normalize the result
    const normalizedResult: AnalysisResult = {
      complianceScore: Math.max(0, Math.min(100, result.complianceScore || 0)),
      summary: result.summary || "Analysis complete",
      issues: (result.issues || []).map((issue) => ({
        severity: (["high", "medium", "low"].includes(issue.severity) ? issue.severity : "medium") as "high" | "medium" | "low",
        category: issue.category || "General",
        description: issue.description || "",
        regulation: issue.regulation || "FCA COBS 4.2",
        recommendation: issue.recommendation || "",
      })),
      extractedDetails: {
        promotionType: result.extractedDetails?.promotionType || "other",
        channel: result.extractedDetails?.channel || "other",
        targetAudience: result.extractedDetails?.targetAudience || "general",
        productService: result.extractedDetails?.productService || "",
        riskWarningsFound: result.extractedDetails?.riskWarningsFound ?? false,
        claimsIdentified: result.extractedDetails?.claimsIdentified || [],
      },
    };

    return NextResponse.json(normalizedResult);
  } catch (error) {
    logError(error, "FinProm analysis error");
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
