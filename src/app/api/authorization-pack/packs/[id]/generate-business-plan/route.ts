import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import {
  createPackDocument,
  deletePackDocument,
  getPack,
  getProjectByPackId,
} from "@/lib/authorization-pack-db";
import { initDatabase } from "@/lib/database";
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
} from "@/lib/perimeter-opinion-pdf-builder";
import { getOpenRouterApiKey } from "@/lib/openrouter";

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

function formatResponse(
  question: ProfileQuestion,
  response: ProfileResponse | undefined,
  responses: Record<string, ProfileResponse> = {}
): string {
  if (response === undefined || response === null) return "";
  const otherTextRaw = responses[`${question.id}_other_text`];
  const otherText = typeof otherTextRaw === "string" ? otherTextRaw.trim() : "";

  if (Array.isArray(response)) {
    const labels = response.map((value) => {
      if (value === "other" && otherText) {
        return `Other: ${otherText}`;
      }
      if (question.options) {
        const option = question.options.find((opt) => opt.value === value);
        return option?.label || value;
      }
      return value;
    });
    return labels.filter(Boolean).join(", ");
  }

  if (typeof response === "boolean") {
    return response ? "Yes" : "No";
  }

  if (typeof response === "number") {
    return String(response);
  }

  if (response === "other" && otherText) {
    return `Other: ${otherText}`;
  }

  if (question.options) {
    const option = question.options.find((opt) => opt.value === response);
    return option?.label || String(response);
  }

  return String(response);
}

const normalizeText = (value: string | null | undefined, fallback = "Not provided") =>
  value && value.trim().length ? value.trim() : fallback;

const buildExecutiveSummaryContent = ({
  firmName,
  permission,
  permissionLabel,
  responses,
  questionLookup,
  insights,
}: {
  firmName: string;
  permission: string;
  permissionLabel: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
  insights: ReturnType<typeof buildProfileInsights>;
}): string => {
  const answer = (id: string) => {
    const question = questionLookup.get(id);
    if (!question) return "";
    return formatResponse(question, responses[id], responses);
  };
  const regimeLabel =
    permission === "payments"
      ? "Payment Services Regulations 2017 (PSRs 2017)"
      : permission === "consumer-credit"
      ? "Consumer Credit regime (CONC)"
      : "Investment services regime (COBS/MiFID)";

  const lines: string[] = [];
  lines.push("**Executive Summary**");
  lines.push(
    `This RegAuth opinion for ${firmName} assesses the firm's stated activities against the ${permissionLabel} perimeter and maps them to the relevant regulatory permissions and obligations.`
  );
  lines.push("");
  lines.push("**The question**");
  lines.push(
    `The firm has requested a regulatory perimeter opinion to confirm which permissions are required under the ${regimeLabel} and related FCA perimeter guidance (PERG).`
  );
  lines.push("");
  lines.push("**Firm activities and operating model**");
  const activityItems = [
    `Regulated activities: ${normalizeText(answer("core-regulated-activities"))}`,
    `Customer segments: ${normalizeText(answer("core-customer-segments"))}`,
    `Distribution channels: ${normalizeText(answer("core-distribution"))}`,
    `PSP of record: ${normalizeText(answer("pay-psp-record"))}`,
    `Payment accounts operated: ${normalizeText(answer("pay-operate-accounts"))}`,
    `Payment initiation procedure provided: ${normalizeText(answer("pay-payment-instruments"))}`,
    `Flow of funds: ${normalizeText(answer("pay-funds-flow"))}`,
    `Safeguarding approach: ${normalizeText(answer("pay-safeguarding"))}`,
  ];
  activityItems.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("**Scope note**");
  lines.push(
    `This opinion is based on the responses captured in the Business Plan Profile. Any material change in operating model, PSP-of-record status, or flow of funds requires a fresh perimeter review.`
  );
  lines.push("");
  lines.push("**Profile completion**");
  lines.push(`Required responses complete: ${insights.completionPercent}%`);
  return lines.join("\n");
};

const buildRegulatoryFrameworkContent = ({
  permission,
  permissionLabel,
}: {
  permission: string;
  permissionLabel: string;
}): string => {
  const lines: string[] = [];
  lines.push("**Regulatory framework**");
  if (permission === "payments") {
    lines.push(
      "Schedule 1, Part 1 of the PSRs 2017 defines payment services that may require authorisation. PERG 15 provides FCA perimeter guidance on the scope of these services and how PSP responsibilities are allocated."
    );
    lines.push(
      "The FCA Approach Document sets expectations for governance, safeguarding, operational resilience, outsourcing oversight, incident management, and readiness to operate as a PSP of record."
    );
  } else if (permission === "consumer-credit") {
    lines.push(
      "The Consumer Credit Act regime and the FCA's CONC sourcebook define regulated consumer credit activities and conduct requirements. PERG 17 provides perimeter guidance on what falls in scope."
    );
  } else {
    lines.push(
      "MiFID II, COBS and related FCA perimeter guidance define the scope of investment services. PERG 8 provides guidance on activities that require authorisation."
    );
  }
  lines.push("");
  lines.push("**Threshold conditions (COND)**");
  lines.push(
    `The FCA will assess whether the firm has adequate resources, effective supervision, suitability of management, and a viable business model for the ${permissionLabel} permission. These conditions must be demonstrable in the application narrative and supporting evidence.`
  );
  return lines.join("\n");
};

const buildPermissionMappingContent = ({
  permission,
  permissionLabel,
  responses,
  questionLookup,
}: {
  permission: string;
  permissionLabel: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): { content: string; core: string[]; conditional: string[]; outOfScope: string[] } => {
  if (permission !== "payments") {
    const lines: string[] = [];
    lines.push("**Permission mapping**");
    lines.push(
      `Detailed PSRs 2017 Schedule 1 mapping is applicable to payment services only. For ${permissionLabel}, map the firm's activities to the relevant FCA permission set and PERG guidance, and document the specific permissions sought.`
    );
    return { content: lines.join("\n"), core: [], conditional: [], outOfScope: [] };
  }

  const payServices = Array.isArray(responses["pay-services"]) ? (responses["pay-services"] as string[]) : [];
  const hasService = (value: string) => payServices.includes(value);
  const answer = (id: string) => {
    const question = questionLookup.get(id);
    if (!question) return "";
    return formatResponse(question, responses[id], responses);
  };
  const normalizeScope = (status: "yes" | "no" | "potential" | "unknown") => {
    if (status === "yes") return "Yes (core)";
    if (status === "no") return "No";
    if (status === "potential") return "Potentially";
    return "Not stated";
  };

  const operateAccounts = responses["pay-operate-accounts"];
  const creditLine = responses["pay-credit-line"];
  const paymentInstruments = responses["pay-payment-instruments"];

  const scopeFlags = [
    {
      code: "1(a)",
      title: "Operating payment accounts",
      activity: operateAccounts
        ? `Firm response: ${answer("pay-operate-accounts")}.`
        : "No payment account operation stated.",
      scope:
        operateAccounts === "yes"
          ? "yes"
          : operateAccounts === "no"
          ? "no"
          : operateAccounts
          ? "potential"
          : "unknown",
      changes:
        operateAccounts === "yes"
          ? `Firm must be PSP of record for account services, own customer terms, account governance, access controls, and safeguarding accountability. PSP of record stated: ${normalizeText(answer("pay-psp-record"))}. Safeguarding: ${normalizeText(answer("pay-safeguarding"))}.`
          : "If introduced, the firm must own account governance, access controls, disclosures, and safeguarding accountability.",
    },
    {
      code: "1(b)",
      title: "Cash withdrawals from a payment account",
      activity: hasService("cash-withdrawal") ? "Cash withdrawals from payment accounts." : "No cash withdrawals stated.",
      scope: hasService("cash-withdrawal") ? "yes" : "no",
      changes:
        hasService("cash-withdrawal")
          ? "Requires end-to-end withdrawal controls, authentication, limits, dispute handling, and reconciliation."
          : "Out of scope unless cash withdrawal functionality is introduced.",
    },
    {
      code: "1(c)",
      title: "Execution of payment transactions",
      activity: hasService("execution-transfers") || hasService("execution-telecom")
        ? `Execution of payment transactions: ${normalizeText(answer("pay-services"))}.`
        : "No execution service stated.",
      scope: hasService("execution-transfers") || hasService("execution-telecom") ? "yes" : "no",
      changes:
        hasService("execution-transfers") || hasService("execution-telecom")
          ? "Firm must own execution outcomes, cut-offs, reconciliation, exception handling, and customer notifications. Any rails/sponsor PSP must be treated as outsourcing with oversight and audit rights."
          : "Out of scope unless the firm executes payment transactions.",
    },
    {
      code: "1(d)",
      title: "Execution funded by a credit line",
      activity: creditLine
        ? `Firm response: ${answer("pay-credit-line")}.`
        : "No credit-funded execution stated.",
      scope:
        creditLine === "credit" || creditLine === "both"
          ? "yes"
          : creditLine === "prefunded"
          ? "no"
          : creditLine
          ? "potential"
          : "unknown",
      changes:
        creditLine === "credit" || creditLine === "both"
          ? "Requires credit governance, underwriting, limits, and clear disclosures. This is a material change trigger."
          : "Out of scope unless payments can execute without prefunding.",
    },
    {
      code: "1(e)",
      title: "Issuing payment instruments / acquiring",
      activity: paymentInstruments
        ? `Firm response: ${answer("pay-payment-instruments")}.`
        : "No payment instrument/procedure stated.",
      scope:
        paymentInstruments === "yes"
          ? "yes"
          : paymentInstruments === "no"
          ? "no"
          : paymentInstruments
          ? "potential"
          : "unknown",
      changes:
        paymentInstruments === "yes"
          ? "Firm must evidence secure authentication, approval workflows, fraud controls, and an auditable initiation trail."
          : "Out of scope unless the firm provides the initiation procedure or payment instrument.",
    },
    {
      code: "1(f)",
      title: "Money remittance",
      activity: hasService("money-remittance") ? "Money remittance service." : "No remittance service stated.",
      scope: hasService("money-remittance") ? "yes" : "no",
      changes:
        hasService("money-remittance")
          ? "Requires a remittance operating model, safeguarding arrangements, and customer disclosures."
          : "Out of scope unless a remittance-only product is introduced.",
    },
    {
      code: "1(g)",
      title: "Payment initiation services (PIS)",
      activity: hasService("payment-initiation")
        ? "Initiation of payment orders from accounts held with another PSP."
        : "No PIS activity stated.",
      scope: hasService("payment-initiation") ? "yes" : "no",
      changes:
        hasService("payment-initiation")
          ? "Requires consent flows, secure communications, and controls preventing access to customer credentials. Introduces ASPSP dependency and PIS liability framework."
          : "Out of scope unless the firm initiates payments from accounts held with other PSPs.",
    },
    {
      code: "1(h)",
      title: "Account information services (AIS)",
      activity: hasService("account-information")
        ? "Accessing and presenting account information from accounts held with another PSP."
        : "No AIS activity stated.",
      scope: hasService("account-information") ? "yes" : "no",
      changes:
        hasService("account-information")
          ? "Requires AIS consent, data minimisation, audit trails, and secure access controls."
          : "Out of scope unless the firm retrieves or consolidates account data from other PSPs.",
    },
  ];

  const lines: string[] = [];
  lines.push("**Permission mapping (PSRs 2017 Schedule 1, Part 1)**");
  scopeFlags.forEach((entry) => {
    lines.push("");
    lines.push(`**Para ${entry.code} – ${entry.title}**`);
    lines.push(`Firm activity: ${entry.activity}`);
    lines.push(`In scope: ${normalizeScope(entry.scope)}`);
    lines.push(`Key changes required: ${entry.changes}`);
  });

  const core = scopeFlags.filter((entry) => entry.scope === "yes").map((entry) => entry.code);
  const conditional = scopeFlags.filter((entry) => entry.scope === "potential").map((entry) => entry.code);
  const outOfScope = scopeFlags.filter((entry) => entry.scope === "no").map((entry) => entry.code);

  return {
    content: lines.join("\n"),
    core,
    conditional,
    outOfScope,
  };
};

const buildDetailedAssessmentContent = ({
  permission,
  responses,
  questionLookup,
}: {
  permission: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const answer = (id: string) => {
    const question = questionLookup.get(id);
    if (!question) return "";
    return formatResponse(question, responses[id], responses);
  };

  const lines: string[] = [];
  lines.push("**Detailed assessment and regulatory implications**");
  if (permission === "payments") {
    lines.push("");
    lines.push("**Safeguarding and flow of funds**");
    lines.push(`Safeguarding approach: ${normalizeText(answer("pay-safeguarding"))}.`);
    lines.push(`Funds flow description: ${normalizeText(answer("pay-funds-flow"))}.`);
    if (answer("pay-funds-flow-touchpoints")) {
      lines.push(`Funds flow touchpoints: ${normalizeText(answer("pay-funds-flow-touchpoints"))}.`);
    }
    lines.push("");
    lines.push("**Outsourcing and dependencies**");
    lines.push(`Material outsourcing: ${normalizeText(answer("core-outsourcing"))}.`);
    lines.push("Any critical supplier must be treated as outsourcing with oversight, audit rights, and exit planning.");
    lines.push("");
    lines.push("**Security and incident readiness**");
    lines.push(`Security readiness: ${normalizeText(answer("pay-security"))}.`);
    lines.push("Controls must align to PSD2 RTS, including incident reporting and secure communications.");
    lines.push("");
    lines.push("**Operational risk themes**");
    lines.push(`Risk themes: ${normalizeText(answer("core-risk-areas"))}.`);
    lines.push(`Top operational and compliance risks identified: ${normalizeText(answer("core-risk-theme"))}.`);
    const mitigationNotes = normalizeText(answer("core-risk-mitigation"), "");
    if (mitigationNotes) {
      lines.push(`Risk mitigation notes: ${mitigationNotes}.`);
    }
    lines.push("");
    lines.push("**Agents and distribution**");
    lines.push(`Agents or distributors: ${normalizeText(answer("pay-agents"))}.`);
  } else {
    lines.push("");
    lines.push("**Operating model and controls**");
    lines.push(`Regulated activities: ${normalizeText(answer("core-regulated-activities"))}.`);
    lines.push(`Material outsourcing: ${normalizeText(answer("core-outsourcing"))}.`);
    lines.push("");
    lines.push("**Operational risk themes**");
    lines.push(`Risk themes: ${normalizeText(answer("core-risk-areas"))}.`);
    lines.push(`Top operational and compliance risks identified: ${normalizeText(answer("core-risk-theme"))}.`);
    const mitigationNotes = normalizeText(answer("core-risk-mitigation"), "");
    if (mitigationNotes) {
      lines.push(`Risk mitigation notes: ${mitigationNotes}.`);
    }
  }
  return lines.join("\n");
};

const buildThresholdConditionsContent = ({
  permission,
  responses,
  questionLookup,
}: {
  permission: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const answer = (id: string) => {
    const question = questionLookup.get(id);
    if (!question) return "";
    return formatResponse(question, responses[id], responses);
  };

  const lines: string[] = [];
  lines.push("**Threshold conditions assessment (COND)**");
  lines.push("");
  lines.push("**Resources and capital adequacy**");
  lines.push(`Capital position: ${normalizeText(answer("core-capital"))}.`);
  if (permission === "payments") {
    lines.push(`Capital method: ${normalizeText(answer("pay-capital-method"))}.`);
    lines.push(`Estimated monthly operating expenditure: ${normalizeText(answer("pay-monthly-opex"))}.`);
  }
  lines.push(`Financial projections status: ${normalizeText(answer("core-projections"))}.`);
  lines.push(`Wind-down planning status: ${normalizeText(answer("core-winddown"))}.`);
  const winddownTriggers = normalizeText(answer("core-winddown-trigger"), "");
  if (winddownTriggers) {
    lines.push(`Wind-down triggers: ${winddownTriggers}.`);
  }
  const winddownPlan = normalizeText(answer("core-winddown-plan"), "");
  if (winddownPlan) {
    lines.push(`Wind-down execution plan: ${winddownPlan}.`);
  }
  lines.push("");
  lines.push("**Suitability and governance**");
  lines.push(`Governance readiness: ${normalizeText(answer("core-governance"))}.`);
  if (permission === "payments") {
    lines.push(`Planned headcount: ${normalizeText(answer("pay-headcount"))}.`);
  }
  lines.push("");
  lines.push("**Effective supervision and systems**");
  if (permission === "payments") {
    lines.push(`Operational security readiness: ${normalizeText(answer("pay-security"))}.`);
  }
  lines.push(`Outsourcing oversight: ${normalizeText(answer("core-outsourcing"))}.`);
  return lines.join("\n");
};

const buildOpinionContent = ({
  firmName,
  insights,
  mapping,
  responses,
  questionLookup,
}: {
  firmName: string;
  insights: ReturnType<typeof buildProfileInsights>;
  mapping: { core: string[]; conditional: string[]; outOfScope: string[] };
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const answer = (id: string) => {
    const question = questionLookup.get(id);
    if (!question) return "";
    return formatResponse(question, responses[id], responses);
  };
  const perimeterClarity = normalizeText(answer("core-perimeter-clarity"));

  const lines: string[] = [];
  lines.push("**Opinion and recommendations**");
  lines.push(
    `Based on the firm's stated operating model, ${firmName} is likely ${insights.perimeterOpinion.verdict.replace(/-/g, " ")} for the services described.`
  );
  lines.push(`Perimeter summary: ${insights.perimeterOpinion.summary}`);
  lines.push("");
  lines.push("**Summary position**");
  if (responses["pay-operate-accounts"] || responses["pay-psp-record"]) {
    const modelParts = [
      normalizeText(answer("pay-psp-record")),
      normalizeText(answer("pay-operate-accounts")),
      normalizeText(answer("pay-services")),
    ].filter((part) => part !== "Not provided");
    lines.push(`Target operating model: ${modelParts.join(" | ") || "Not stated"}.`);
  } else {
    lines.push("Target operating model: Not stated.");
  }
  const changeTriggers: string[] = [];
  if (responses["pay-services"] && Array.isArray(responses["pay-services"])) {
    const services = responses["pay-services"] as string[];
    if (services.includes("payment-initiation")) {
      changeTriggers.push("PIS (para 1(g)) required if initiating payments from accounts held with other PSPs.");
    }
    if (services.includes("account-information")) {
      changeTriggers.push("AIS (para 1(h)) required if accessing account information from other PSPs.");
    }
  }
  if (responses["pay-credit-line"] === "credit" || responses["pay-credit-line"] === "both") {
    changeTriggers.push("Credit-funded execution triggers para 1(d) and additional capital/credit controls.");
  }
  if (changeTriggers.length) {
    lines.push(`Key dependencies/change triggers: ${changeTriggers.join(" ")}`);
  } else {
    lines.push("Key dependencies/change triggers: None stated.");
  }
  if (insights.perimeterOpinion.rationale.length) {
    lines.push("");
    lines.push("**Rationale**");
    insights.perimeterOpinion.rationale.forEach((item) => lines.push(`- ${item}`));
  }
  if (insights.perimeterOpinion.obligations.length) {
    lines.push("");
    lines.push("**Key obligations**");
    insights.perimeterOpinion.obligations.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push("");
  lines.push(`Recommended permissions (core): ${mapping.core.length ? mapping.core.join(", ") : "Not stated"}.`);
  lines.push(
    `Conditional permissions (triggered by model changes): ${mapping.conditional.length ? mapping.conditional.join(", ") : "None stated"}.`
  );
  lines.push(
    `Permissions currently out of scope: ${mapping.outOfScope.length ? mapping.outOfScope.join(", ") : "None stated"}.`
  );
  lines.push("");
  lines.push("**Perimeter assumptions**");
  lines.push(`Out-of-scope documentation: ${perimeterClarity}.`);
  lines.push(
    "Applying for permissions not used in practice can create unnecessary regulatory scope; failing to include an in-scope permission can create a permission gap."
  );
  lines.push("");
  lines.push("**Why this matters**");
  lines.push(
    "The permission set must match the implemented customer journeys and flow of funds. Over-scoping increases regulatory burden, while under-scoping can undermine the application narrative and delay authorisation."
  );
  return lines.join("\n");
};

const buildAppendixContent = (): string => {
  const lines: string[] = [];
  lines.push("**Appendix: Key statutory provisions and guidance**");
  lines.push("");
  lines.push("**PSRs 2017 Schedule 1, Part 1**");
  lines.push("- Para 1(a): Operating payment accounts");
  lines.push("- Para 1(b): Cash withdrawals");
  lines.push("- Para 1(c): Execution of payment transactions");
  lines.push("- Para 1(d): Execution funded by a credit line");
  lines.push("- Para 1(e): Issuing payment instruments and/or acquiring");
  lines.push("- Para 1(f): Money remittance");
  lines.push("- Para 1(g): Payment initiation services");
  lines.push("- Para 1(h): Account information services");
  lines.push("");
  lines.push("**FCA Perimeter Guidance (PERG)**");
  lines.push("PERG 15: FCA perimeter guidance for the PSRs 2017.");
  lines.push("");
  lines.push("**FCA Approach Document**");
  lines.push("FCA Approach to Payment Services and E-Money (PSRs 2017/EMRs 2011).");
  return lines.join("\n");
};

async function synthesizeOpinionSection(
  section: OpinionSection,
  context: string,
  baseContent?: string
): Promise<string | null> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    console.warn(`[Opinion Pack] AI synthesis skipped for "${section.title}" - API key not configured`);
    return null;
  }

  const baseText = baseContent?.trim();
  if (!section.inputs.length && !baseText) {
    return null;
  }

  const promptContent = baseText
    ? baseText
    : section.inputs
        .map((input) => {
          const cleanResponse = htmlToText(input.response) || input.response || "(No response)";
          const references = input.references?.length ? `References: ${input.references.join(", ")}` : "References: none";
          const description = input.description ? `Context: ${input.description}` : "";
          return `### ${input.label}\n${description}\n${cleanResponse}\n${references}`.trim();
        })
        .join("\n\n");

  const sanitizedTitle = section.title.replace(/["\n\r]/g, "");

  const systemPrompt = baseText
    ? `You are a regulatory perimeter analyst. Expand and deepen an existing section of a RegAuth opinion pack.
Guidelines:
- Keep the existing facts and structure accurate; do NOT contradict or invent facts
- Add additional regulatory analysis, PERG references, threshold condition implications, and change triggers
- Use concise headings and bullet points where helpful
- Keep output between 400-800 words
- Use **bold** for headings
- Add a short "**Additional analysis**" heading before any new material
`
    : `You are a regulatory perimeter analyst. Draft a concise section for a RegAuth opinion pack.
Guidelines:
- Write in formal business English, third person
- Use short headings and bullet points where helpful
- Map to PERG/PSD2/CONC/COBS where the references indicate relevance
- Do NOT invent facts; only use the inputs provided
- Keep output between 300-500 words
- Use **bold** for headings
`;

  const userPrompt = baseText
    ? `Section: "${sanitizedTitle}"
Purpose: ${section.description}
Context:
${context}

Existing draft (do not repeat verbatim; expand with additional analysis):
${promptContent}
`
    : `Section: "${sanitizedTitle}"
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
        Authorization: `Bearer ${apiKey}`,
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

// Helper to split an array into chunks of a given size
function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];
  if (!array.length) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

    const firmBasics = project.assessmentData?.basics;
    const firmName = firmBasics?.legalName || project.name || pack.name;
    const permissionLabel = project.permissionName || project.permissionCode;

    const permissionMapping = buildPermissionMappingContent({
      permission,
      permissionLabel,
      responses,
      questionLookup,
    });

    const sections: OpinionSection[] = [
      {
        key: "executive-summary",
        title: "Executive Summary",
        description: "Summary of the firm's stated activities and the scope of this opinion.",
        inputs: [],
        synthesizedContent: buildExecutiveSummaryContent({
          firmName,
          permission,
          permissionLabel,
          responses,
          questionLookup,
          insights,
        }),
      },
      {
        key: "regulatory-framework",
        title: "Regulatory Framework",
        description: "Key regulatory sources and threshold conditions relevant to the assessment.",
        inputs: [],
        synthesizedContent: buildRegulatoryFrameworkContent({ permission, permissionLabel }),
      },
      {
        key: "permission-mapping",
        title: "Permission Mapping (PSRs 2017)",
        description: "Mapping of stated activities to PSRs 2017 Schedule 1, Part 1 permissions.",
        inputs: [],
        synthesizedContent: permissionMapping.content,
      },
      {
        key: "detailed-assessment",
        title: "Detailed Assessment and Regulatory Implications",
        description: "Safeguarding, outsourcing, security, and operational readiness implications.",
        inputs: [],
        synthesizedContent: buildDetailedAssessmentContent({ permission, responses, questionLookup }),
      },
      {
        key: "threshold-conditions",
        title: "Threshold Conditions Assessment",
        description: "Assessment against FCA threshold conditions based on stated responses.",
        inputs: [],
        synthesizedContent: buildThresholdConditionsContent({ permission, responses, questionLookup }),
      },
      {
        key: "opinion-recommendations",
        title: "Opinion and Recommendations",
        description: "Perimeter opinion and recommended permission set based on the stated model.",
        inputs: [],
        synthesizedContent: buildOpinionContent({
          firmName,
          insights,
          mapping: permissionMapping,
          responses,
          questionLookup,
        }),
      },
      {
        key: "appendix",
        title: "Appendix",
        description: "Key statutory provisions and FCA guidance referenced.",
        inputs: [],
        synthesizedContent: buildAppendixContent(),
      },
    ];

    const contextLines = [
      `Firm: ${firmName}`,
      `Permission scope: ${permissionLabel}`,
      `Perimeter verdict: ${insights.perimeterOpinion.verdict.replace(/-/g, " ")}`,
      `Summary: ${insights.perimeterOpinion.summary}`,
      `Profile completion: ${insights.completionPercent}%`,
    ];
    if (insights.activityHighlights.length) {
      contextLines.push(`Activity highlights: ${insights.activityHighlights.join(", ")}`);
    }
    const context = contextLines.join("\n");

    const aiEligibleSections = new Set([
      "executive-summary",
      "regulatory-framework",
      "permission-mapping",
      "detailed-assessment",
      "threshold-conditions",
      "opinion-recommendations",
    ]);

    // Filter sections eligible for AI synthesis
    const eligibleSections = sections.filter((s) => aiEligibleSections.has(s.key));

    // Process sections in parallel batches of 3 for better performance
    const BATCH_SIZE = 3;
    const batches = chunk(eligibleSections, BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      await Promise.all(
        batch.map(async (section) => {
          const synthesized = await synthesizeOpinionSection(section, context, section.synthesizedContent);
          if (synthesized) {
            section.synthesizedContent = section.synthesizedContent
              ? `${section.synthesizedContent}\n\n${synthesized}`
              : synthesized;
          }
        })
      );
      // Small delay between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await delay(200);
      }
    }

    const pdfBytes = await buildPerimeterOpinionPack(
      {
        packName: pack.name,
        permissionLabel,
        profileCompletion: insights.completionPercent,
        opinion: insights.perimeterOpinion,
        regulatorySignals: insights.regulatorySignals,
        activityHighlights: insights.activityHighlights,
        firmBasics,
      },
      sections
    );

    const timestamp = new Date().toISOString().split("T")[0];
    const documentName = `RegAuth Opinion - ${firmName} - ${timestamp}`;

    const description = `Perimeter opinion pack generated from profile responses. Completion: ${insights.completionPercent}%.`;

    const storageKey = buildStorageKey(packId, pack.name);
    const storedFile = await storeAuthorizationPackPdf(storageKey, pdfBytes);

    let packDocument = null;

    try {
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
      await removeAuthorizationPackPdf(storedFile.storageKey).catch(() => null);
      throw error;
    }

    const filename = ensurePdfFilename(sanitizeFilename(documentName));

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Document-Id": packDocument.id,
        "X-Pack-Document-Id": packDocument.id,
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
