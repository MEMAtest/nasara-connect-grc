import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import {
  createPackDocument,
  createOpinionPackGenerationJob,
  deletePackDocument,
  getActiveOpinionPackGenerationJob,
  getLatestOpinionPackGenerationJob,
  getOpinionPackGenerationJob,
  getPack,
  getProjectByPackId,
  updateOpinionPackGenerationJob,
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

const sanitizeOpinionContent = (content: string): string => {
  const cleaned = content
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*[-*•]\s+/, "")
        .replace(/^\s*\d+[.)]\s+/, "")
        .replace(/\*\*/g, "")
        .trimEnd()
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned;
};

const getRegimeLabel = (permission: string) =>
  permission === "payments"
    ? "Payment Services Regulations 2017 (PSRs 2017)"
    : permission === "consumer-credit"
    ? "Consumer Credit regime (CONC)"
    : "Investment services regime (COBS/MiFID)";

const isProvided = (value: string) => value !== "Not provided" && value.trim().length > 0;

type PaymentPermissionSummary = {
  engaged: string[];
  conditional: string[];
  outOfScope: string[];
  exemptions: string[];
  emoneyStatus: string | null;
};

const buildPaymentPermissionSummary = ({
  responses,
  questionLookup,
}: {
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): PaymentPermissionSummary => {
  const payServices = Array.isArray(responses["pay-services"]) ? (responses["pay-services"] as string[]) : [];
  const hasService = (value: string) => payServices.includes(value);
  const addUnique = (list: string[], value: string) => {
    if (!list.includes(value)) list.push(value);
  };

  const engaged: string[] = [];
  const conditional: string[] = [];
  const outOfScope: string[] = [];

  const operateAccounts = responses["pay-operate-accounts"];
  if (operateAccounts === "yes") {
    addUnique(engaged, "paragraph 1(a) (operating payment accounts)");
  } else if (operateAccounts === "no") {
    addUnique(outOfScope, "paragraph 1(a) (operating payment accounts)");
  } else if (operateAccounts) {
    addUnique(conditional, "paragraph 1(a) (operating payment accounts)");
  }

  if (hasService("cash-deposit")) {
    addUnique(engaged, "paragraph 1(a) (cash deposits to payment accounts)");
  }
  if (hasService("cash-withdrawal")) {
    addUnique(engaged, "paragraph 1(b) (cash withdrawals from payment accounts)");
  }
  if (hasService("execution-transfers") || hasService("execution-telecom")) {
    addUnique(engaged, "paragraph 1(c) (execution of payment transactions)");
  }

  const creditLine = responses["pay-credit-line"];
  if (creditLine === "credit" || creditLine === "both") {
    addUnique(engaged, "paragraph 1(d) (credit-funded execution)");
  } else if (creditLine === "prefunded") {
    addUnique(outOfScope, "paragraph 1(d) (credit-funded execution)");
  } else if (creditLine) {
    addUnique(conditional, "paragraph 1(d) (credit-funded execution)");
  }

  const paymentInstruments = responses["pay-payment-instruments"];
  if (paymentInstruments === "yes") {
    addUnique(engaged, "paragraph 1(e) (issuing/acquiring payment instruments)");
  } else if (paymentInstruments === "no") {
    addUnique(outOfScope, "paragraph 1(e) (issuing/acquiring payment instruments)");
  } else if (paymentInstruments) {
    addUnique(conditional, "paragraph 1(e) (issuing/acquiring payment instruments)");
  }

  if (hasService("issuing-acquiring")) {
    addUnique(engaged, "paragraph 1(e) (issuing/acquiring payment instruments)");
  }
  if (hasService("money-remittance")) {
    addUnique(engaged, "paragraph 1(f) (money remittance)");
  }
  if (hasService("payment-initiation")) {
    addUnique(engaged, "paragraph 1(g) (payment initiation services)");
  }
  if (hasService("account-info")) {
    addUnique(engaged, "paragraph 1(h) (account information services)");
  }

  const exemptionsRaw = Array.isArray(responses["pay-exemptions"]) ? (responses["pay-exemptions"] as string[]) : [];
  const exemptions = exemptionsRaw
    .filter((value) => value !== "none")
    .map((value) => {
      const question = questionLookup.get("pay-exemptions");
      const option = question?.options?.find((opt) => opt.value === value);
      return option?.label ?? value;
    })
    .filter(Boolean);

  const emoneyStatus =
    typeof responses["pay-emoney"] === "string" ? (responses["pay-emoney"] as string) : null;

  return {
    engaged,
    conditional,
    outOfScope,
    exemptions,
    emoneyStatus,
  };
};

const buildInstructionScopeContent = ({
  firmName,
  permission,
  permissionLabel,
  generatedDate,
}: {
  firmName: string;
  permission: string;
  permissionLabel: string;
  generatedDate: string;
}): string => {
  const regimeLabel = getRegimeLabel(permission);
  const lines: string[] = [];
  lines.push(
    `We have been instructed by ${firmName} to provide a regulatory perimeter and permissions opinion in relation to ${permissionLabel}.`
  );
  lines.push(
    `The question addressed is whether the activities described by the firm constitute regulated activities under ${regimeLabel} and, if so, which FCA permissions are engaged.`
  );
  lines.push(
    "This opinion does not cover tax, non-UK regulatory regimes, or detailed legal advice beyond the FCA perimeter and permissions analysis."
  );
  lines.push(
    `We rely on the information provided by the firm and have not independently verified it. The opinion is given as at ${generatedDate}.`
  );
  return lines.join("\n\n");
};

const buildFactualBackgroundContent = ({
  permission,
  responses,
  questionLookup,
}: {
  permission: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const answer = (id: string, fallback = "") => {
    const question = questionLookup.get(id);
    if (!question) return fallback;
    const value = formatResponse(question, responses[id], responses);
    return normalizeText(value, fallback);
  };

  const statements: string[] = [];
  const regulatedActivities = answer("core-regulated-activities");
  if (isProvided(regulatedActivities)) {
    statements.push(`The firm states that its regulated activities are ${regulatedActivities}.`);
  }
  const customerSegments = answer("core-customer-segments");
  if (isProvided(customerSegments)) {
    statements.push(`The firm intends to serve ${customerSegments}.`);
  }
  const geography = answer("core-geography");
  if (isProvided(geography)) {
    statements.push(`The firm states that its customers will be located in ${geography}.`);
  }
  const distribution = answer("core-distribution");
  if (isProvided(distribution)) {
    statements.push(`The distribution model is described as ${distribution}.`);
  }

  if (permission === "payments") {
    const payServices = answer("pay-services");
    if (isProvided(payServices)) {
      statements.push(`The firm identifies the following payment services: ${payServices}.`);
    }
    const pspRecord = answer("pay-psp-record");
    if (isProvided(pspRecord)) {
      statements.push(`The firm describes the PSP of record as ${pspRecord}.`);
    }
    const operateAccounts = responses["pay-operate-accounts"];
    if (operateAccounts === "yes") {
      statements.push("The firm states that it operates payment accounts.");
    } else if (operateAccounts === "no") {
      statements.push("The firm states that it does not operate payment accounts.");
    } else if (operateAccounts) {
      statements.push("The firm indicates that operation of payment accounts is under review.");
    }
    const paymentInstruments = responses["pay-payment-instruments"];
    if (paymentInstruments === "yes") {
      statements.push("The firm states that it provides the payment initiation procedure or instrument.");
    } else if (paymentInstruments === "no") {
      statements.push("The firm states that it does not provide the payment initiation procedure or instrument.");
    } else if (paymentInstruments) {
      statements.push("The firm indicates that provision of the payment initiation procedure is under review.");
    }
    const creditLine = responses["pay-credit-line"];
    if (creditLine === "prefunded") {
      statements.push("The firm states that payment execution is prefunded.");
    } else if (creditLine === "credit") {
      statements.push("The firm states that payment execution may be funded by credit or overdraft.");
    } else if (creditLine === "both") {
      statements.push("The firm states that payment execution may be prefunded or credit-funded.");
    } else if (creditLine) {
      statements.push("The firm indicates that the credit-funded execution position is under review.");
    }
    const emoney = responses["pay-emoney"];
    if (emoney === "yes") {
      statements.push("The firm states that it will issue electronic money.");
    } else if (emoney === "no") {
      statements.push("The firm states that it will not issue electronic money.");
    } else if (emoney) {
      statements.push("The firm indicates that e-money issuance is under review.");
    }
    const fundsFlow = answer("pay-funds-flow");
    if (isProvided(fundsFlow)) {
      statements.push(`The flow of funds is described as follows: ${fundsFlow}.`);
    }
    const safeguarding = answer("pay-safeguarding");
    if (isProvided(safeguarding)) {
      statements.push(`The firm states that safeguarding is addressed as ${safeguarding}.`);
    }
    const agents = answer("pay-agents");
    if (isProvided(agents)) {
      statements.push(`The firm states its use of agents or distributors as ${agents}.`);
    }
  }

  if (!statements.length) {
    statements.push(
      "The firm has provided limited factual detail about its operating model for the purposes of this opinion."
    );
  }

  return ["FACT:", statements.join(" ")].join("\n\n");
};

const buildRegulatoryFrameworkSourcesContent = ({
  permission,
  permissionLabel,
  responses,
}: {
  permission: string;
  permissionLabel: string;
  responses: Record<string, ProfileResponse>;
}): string => {
  const lines: string[] = [];
  lines.push("ANALYSIS:");
  if (permission === "payments") {
    const emoney = responses["pay-emoney"] === "yes";
    lines.push(
      `The perimeter assessment is made by reference to the Payment Services Regulations 2017 (PSRs 2017), in particular Schedule 1, Part 1, and the FCA's Perimeter Guidance Manual (PERG 15). The FCA Approach Document on Payment Services and E-Money is relevant to the characterisation of PSP roles and safeguarding obligations${emoney ? ", and the Electronic Money Regulations 2011 (EMRs 2011) are relevant to the extent the model includes e-money issuance." : "."}`
    );
  } else if (permission === "consumer-credit") {
    lines.push(
      "The perimeter assessment is made by reference to the Consumer Credit Act regime and the FCA Consumer Credit sourcebook (CONC), together with PERG 17 on the scope of regulated consumer credit activities."
    );
  } else {
    lines.push(
      "The perimeter assessment is made by reference to MiFID II, the FCA Conduct of Business Sourcebook (COBS), and PERG 8 on the scope of investment services and activities."
    );
  }
  lines.push(
    `The FCA Threshold Conditions (COND) provide the authorisation framework applicable to ${permissionLabel}, but this opinion does not assess operational readiness or compliance against COND beyond the perimeter characterisation.`
  );
  return lines.join("\n\n");
};

const buildRegulatedActivitiesAnalysisContent = ({
  permission,
  responses,
  questionLookup,
}: {
  permission: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const answer = (id: string, fallback = "") => {
    const question = questionLookup.get(id);
    if (!question) return fallback;
    const value = formatResponse(question, responses[id], responses);
    return normalizeText(value, fallback);
  };

  const lines: string[] = [];
  lines.push("FACT:");
  const factStatements: string[] = [];
  const regulatedActivities = answer("core-regulated-activities");
  if (isProvided(regulatedActivities)) {
    factStatements.push(`The firm describes its regulated activities as ${regulatedActivities}.`);
  }
  if (permission === "payments") {
    const payServices = answer("pay-services");
    if (isProvided(payServices)) {
      factStatements.push(`The firm identifies the payment services in scope as ${payServices}.`);
    }
    const fundsFlow = answer("pay-funds-flow");
    if (isProvided(fundsFlow)) {
      factStatements.push(`The firm describes the flow of funds as ${fundsFlow}.`);
    }
  }
  if (!factStatements.length) {
    factStatements.push("The information provided about regulated activities is limited.");
  }
  lines.push(factStatements.join(" "));

  lines.push("");
  lines.push("ANALYSIS:");
  if (permission === "payments") {
    const summary = buildPaymentPermissionSummary({ responses, questionLookup });
    if (summary.engaged.length) {
      lines.push(
        `On the stated model, the activities are more likely than not to fall within ${summary.engaged.join(", ")} of PSRs 2017 Schedule 1, Part 1.`
      );
    } else {
      lines.push(
        "On the stated model, the information provided does not allow a complete mapping to the PSRs 2017 Schedule 1, Part 1 activities."
      );
    }
    if (summary.conditional.length) {
      lines.push(
        `Elements described as under review or capable of extending scope include ${summary.conditional.join(", ")}.`
      );
    }
    if (summary.outOfScope.length) {
      lines.push(
        `Activities corresponding to ${summary.outOfScope.join(", ")} are not stated as being provided on the current facts.`
      );
    }
    if (summary.exemptions.length) {
      lines.push(
        `The firm indicates potential reliance on ${summary.exemptions.join(", ")}, which could affect the perimeter position and therefore qualifies this analysis.`
      );
    }
    if (summary.emoneyStatus === "yes") {
      lines.push(
        "The firm indicates that it will issue electronic money; this would bring the model within scope of the Electronic Money Regulations 2011 and would require a separate regulatory analysis."
      );
    }
  } else {
    lines.push(
      `On the stated model, the activities described appear to fall for consideration under the ${getRegimeLabel(permission)} perimeter. The analysis is limited to the services described and does not extend to activities not stated.`
    );
  }
  return lines.join("\n\n");
};

const buildPermissionsMappingContent = ({
  permission,
  permissionLabel,
  responses,
  questionLookup,
}: {
  permission: string;
  permissionLabel: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const lines: string[] = [];
  lines.push("ANALYSIS:");
  if (permission === "payments") {
    const summary = buildPaymentPermissionSummary({ responses, questionLookup });
    if (summary.engaged.length) {
      lines.push(
        `Based on the facts provided, the permissions engaged are likely to include ${summary.engaged.join(", ")} under the PSRs 2017.`
      );
    } else {
      lines.push(
        "Based on the facts provided, no definitive PSRs 2017 Schedule 1 permission can be confirmed without further detail on the services and flow of funds."
      );
    }
    if (summary.conditional.length) {
      lines.push(
        `The permission set may expand if the firm proceeds with ${summary.conditional.join(", ")}.`
      );
    }
    if (summary.outOfScope.length) {
      lines.push(
        `The firm does not state activities corresponding to ${summary.outOfScope.join(", ")}, and those permissions are therefore not indicated on the current model.`
      );
    }
    if (summary.emoneyStatus === "yes") {
      lines.push(
        "If the firm issues electronic money, authorisation under the EMRs 2011 would be required in addition to the PSRs 2017 permissions."
      );
    }
  } else {
    lines.push(
      `The permissions mapping is therefore characterised by the firm's stated activities within the ${permissionLabel} perimeter, with the precise FCA permission set to be confirmed against PERG guidance and the FCA authorisation form for that regime.`
    );
  }
  return lines.join("\n\n");
};

const buildRegulatoryImplicationsContent = ({
  permission,
  responses,
  questionLookup,
}: {
  permission: string;
  responses: Record<string, ProfileResponse>;
  questionLookup: Map<string, ProfileQuestion>;
}): string => {
  const answer = (id: string, fallback = "") => {
    const question = questionLookup.get(id);
    if (!question) return fallback;
    const value = formatResponse(question, responses[id], responses);
    return normalizeText(value, fallback);
  };

  const lines: string[] = [];
  lines.push("ANALYSIS:");
  if (permission === "payments") {
    const safeguarding = answer("pay-safeguarding");
    if (isProvided(safeguarding)) {
      lines.push(
        `Safeguarding obligations will apply where the firm holds customer funds; the firm states that safeguarding is addressed as ${safeguarding}.`
      );
    } else {
      lines.push(
        "Safeguarding obligations will apply where the firm holds customer funds, and the precise safeguarding method will depend on the actual flow of funds."
      );
    }
    const creditLine = responses["pay-credit-line"];
    if (creditLine === "credit" || creditLine === "both") {
      lines.push(
        "Credit-funded execution is a material perimeter factor and would engage additional regulatory considerations under PSRs 2017 paragraph 1(d)."
      );
    }
    lines.push(
      "As a payment institution, the firm would be subject to high-level obligations on safeguarding, incident reporting, and operational resilience under the FCA approach to payment services, without prescriptive implementation detail in this opinion."
    );
    const payServices = Array.isArray(responses["pay-services"]) ? (responses["pay-services"] as string[]) : [];
    if (payServices.includes("payment-initiation") || payServices.includes("account-info")) {
      lines.push(
        "If payment initiation or account information services are provided, the PSD2 RTS on strong customer authentication and secure communication will be relevant at a high level."
      );
    }
  } else if (permission === "consumer-credit") {
    lines.push(
      "If the activities are within scope, CONC conduct obligations and relevant consumer protection requirements will apply at a high level, without assessment of implementation detail in this opinion."
    );
  } else {
    lines.push(
      "If the activities are within scope, COBS conduct obligations and any client asset protections relevant to the stated model will apply at a high level, without assessment of implementation detail in this opinion."
    );
  }
  return lines.join("\n\n");
};

const buildAssumptionsLimitationsContent = ({
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
    return normalizeText(formatResponse(question, responses[id], responses));
  };

  const missing: string[] = [];
  const checkMissing = (id: string, label: string) => {
    const value = answer(id);
    if (!isProvided(value) || value === "Not provided") {
      missing.push(label);
    }
  };

  checkMissing("core-regulated-activities", "a detailed description of regulated activities");
  checkMissing("core-customer-segments", "primary customer segments");
  checkMissing("core-distribution", "distribution model");
  checkMissing("core-geography", "customer geography");
  if (permission === "payments") {
    checkMissing("pay-services", "payment services in scope");
    checkMissing("pay-psp-record", "PSP of record allocation");
    checkMissing("pay-operate-accounts", "payment account operation");
    checkMissing("pay-funds-flow", "flow of funds");
    checkMissing("pay-safeguarding", "safeguarding position");
    checkMissing("pay-credit-line", "credit-funded execution status");
    checkMissing("pay-payment-instruments", "payment initiation procedure status");
  }

  const assumptions: string[] = [];
  if (permission === "payments") {
    if (responses["pay-operate-accounts"] === "no") {
      assumptions.push("The firm does not operate payment accounts.");
    }
    if (responses["pay-credit-line"] === "prefunded") {
      assumptions.push("Payments are executed on a prefunded basis and not funded by credit.");
    }
    if (responses["pay-payment-instruments"] === "no") {
      assumptions.push("The firm does not provide the payment initiation procedure or instrument.");
    }
    if (responses["pay-emoney"] === "no") {
      assumptions.push("The firm does not issue electronic money.");
    }
  }
  assumptions.push("The information provided by the firm is complete and accurate for the stated model.");

  const changeTriggers: string[] = [];
  if (permission === "payments") {
    changeTriggers.push(
      "Any change in PSP-of-record status, operation of payment accounts, flow of funds, or safeguarding arrangements."
    );
    changeTriggers.push(
      "Introduction of payment initiation services, account information services, credit-funded execution, or e-money issuance."
    );
  } else {
    changeTriggers.push("Any material change in the stated regulated activities or customer journey.");
  }

  const lines: string[] = [];
  lines.push("ASSUMPTIONS:");
  lines.push(assumptions.join(" "));
  lines.push("");
  lines.push("LIMITATIONS:");
  if (missing.length) {
    lines.push(
      `This opinion is qualified by the absence of the following information: ${missing.join(", ")}.`
    );
  } else {
    lines.push(
      "This opinion is based solely on the information provided and does not include independent verification."
    );
  }
  lines.push("");
  lines.push("CHANGE TRIGGERS:");
  lines.push(changeTriggers.join(" "));
  return lines.join("\n\n");
};

const buildOpinionConclusionContent = ({
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
  const verdict = insights.perimeterOpinion.verdict;
  const verdictText = verdict.replace(/-/g, " ");
  const summary = permission === "payments" ? buildPaymentPermissionSummary({ responses, questionLookup }) : null;
  const permissionsText =
    summary && summary.engaged.length
      ? `The permissions engaged are likely to include ${summary.engaged.join(", ")}.`
      : "The permissions engaged cannot be finalised on the information provided.";

  let conclusion = "";
  if (verdict === "in-scope") {
    conclusion = `On the basis of the information provided and the assumptions set out above, it is our opinion that the activities described are within scope of the ${permissionLabel} perimeter.`;
  } else if (verdict === "possible-exemption") {
    conclusion = `On the basis of the information provided and the assumptions set out above, it is our opinion that the activities described are more likely than not within scope of the ${permissionLabel} perimeter, subject to the potential application of any stated exemptions.`;
  } else if (verdict === "out-of-scope") {
    conclusion = `On the basis of the information provided and the assumptions set out above, it is our opinion that the activities described are more likely than not outside the ${permissionLabel} perimeter.`;
  } else {
    conclusion = `On the basis of the information provided and the assumptions set out above, it is our opinion that the perimeter position cannot be concluded for ${firmName} without further detail.`;
  }

  const lines: string[] = [];
  lines.push("OPINION:");
  lines.push(conclusion);
  lines.push(permissionsText);
  lines.push(`Perimeter characterisation: ${verdictText}.`);
  lines.push(`Regulatory basis: ${getRegimeLabel(permission)} and applicable FCA perimeter guidance.`);
  return lines.join("\n\n");
};

type OpinionPackJobPayload = {
  aiContent: Record<string, string>;
  warnings: string[];
};

const parseOpinionPackJobPayload = (payload: Record<string, unknown> | undefined): OpinionPackJobPayload => {
  const rawContent = payload?.aiContent;
  const rawWarnings = payload?.warnings;
  const aiContent =
    rawContent && typeof rawContent === "object" && !Array.isArray(rawContent)
      ? (rawContent as Record<string, string>)
      : {};
  const warnings = Array.isArray(rawWarnings) ? rawWarnings.filter((item) => typeof item === "string") : [];
  return { aiContent, warnings };
};

const buildOpinionPackSections = ({
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
}) => {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sections: OpinionSection[] = [
    {
      key: "instruction-scope",
      title: "Instruction and Scope",
      description: "Instruction, scope, and reliance for this opinion.",
      inputs: [],
      synthesizedContent: buildInstructionScopeContent({
        firmName,
        permission,
        permissionLabel,
        generatedDate,
      }),
    },
    {
      key: "factual-background",
      title: "Factual Background (Firm's Stated Model)",
      description: "Neutral summary of the firm's stated activities and operating model.",
      inputs: [],
      synthesizedContent: buildFactualBackgroundContent({ permission, responses, questionLookup }),
    },
    {
      key: "regulatory-framework",
      title: "Regulatory Framework and Sources",
      description: "Core regulatory instruments and FCA perimeter guidance relevant to the opinion.",
      inputs: [],
      synthesizedContent: buildRegulatoryFrameworkSourcesContent({
        permission,
        permissionLabel,
        responses,
      }),
    },
    {
      key: "regulated-activities",
      title: "Analysis of Regulated Activities and Perimeter Position",
      description: "Application of the stated facts to the FCA perimeter framework.",
      inputs: [],
      synthesizedContent: buildRegulatedActivitiesAnalysisContent({ permission, responses, questionLookup }),
    },
    {
      key: "permissions-mapping",
      title: "Permissions Mapping and Regulatory Characterisation",
      description: "High-level mapping of activities to the permissions engaged.",
      inputs: [],
      synthesizedContent: buildPermissionsMappingContent({
        permission,
        permissionLabel,
        responses,
        questionLookup,
      }),
    },
    {
      key: "regulatory-implications",
      title: "Key Regulatory Implications (High-Level)",
      description: "High-level obligations flowing directly from perimeter status.",
      inputs: [],
      synthesizedContent: buildRegulatoryImplicationsContent({ permission, responses, questionLookup }),
    },
    {
      key: "assumptions-limitations",
      title: "Assumptions, Limitations and Change Triggers",
      description: "Explicit assumptions, limitations, and changes requiring a refreshed opinion.",
      inputs: [],
      synthesizedContent: buildAssumptionsLimitationsContent({ permission, responses, questionLookup }),
    },
    {
      key: "opinion",
      title: "Opinion (Conclusion)",
      description: "Concise perimeter and permissions conclusion.",
      inputs: [],
      synthesizedContent: buildOpinionConclusionContent({
        firmName,
        permission,
        permissionLabel,
        responses,
        questionLookup,
        insights,
      }),
    },
  ];

  return sections;
};

const applyAiContentToSections = (
  sections: OpinionSection[],
  aiContent: Record<string, string>
) =>
  sections.map((section) => {
    const baseContent = section.synthesizedContent
      ? sanitizeOpinionContent(section.synthesizedContent)
      : "";
    const supplemental = aiContent[section.key];
    if (!supplemental) {
      return baseContent ? { ...section, synthesizedContent: baseContent } : section;
    }
    const sanitizedSupplemental = sanitizeOpinionContent(supplemental);
    const nextContent = sanitizedSupplemental || baseContent;
    return {
      ...section,
      ...(nextContent ? { synthesizedContent: nextContent } : {}),
    };
  });

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

  const baseSystemPrompt = `You are a senior UK financial services regulatory consultant producing a professional regulatory perimeter and permissions opinion for the FCA framework. You must remain in opinion mode throughout.
Non-negotiable rules:
1) Write in third-person adviser voice (\"we\", \"our view\", \"it is our opinion\"), not as the firm.
2) Do not use bullet points, numbered lists, tables, checklists, or action plans.
3) Do not assess delivery maturity or implementation status.
4) Do not include operational how-to content or control design detail.
5) Avoid promotional or aspirational language.
6) Clearly separate FACT from ANALYSIS and OPINION using short labels such as "FACT:" when relevant.
7) State assumptions explicitly and ring-fence limitations and change triggers in the appropriate section.
8) Do not invent facts; qualify the opinion if information is missing.
9) Keep the conclusion concise and definitive with measured certainty.
10) Use UK spelling and a regulator-facing tone.`;

  const systemPrompt = baseText
    ? `${baseSystemPrompt}
You are expanding an existing section. Keep the section's intent and structure, do not add new sections, and do not repeat verbatim.`
    : `${baseSystemPrompt}
Draft a concise section within the given title and purpose. Do not add headings beyond short labels such as "FACT:", "ANALYSIS:", "OPINION:", or "ASSUMPTIONS:" if needed.`;

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let jobForError: { id: string } | null = null;
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
      : project.permissionCode?.startsWith("payments")
      ? "payments"
      : null;
    if (!permission) {
      return NextResponse.json({ error: "Unsupported permission for opinion pack" }, { status: 400 });
    }

    const profile = project.assessmentData?.businessPlanProfile;
    const responses = profile?.responses ?? {};

    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === "string" ? body.action : "start";
    const jobId = typeof body?.jobId === "string" ? body.jobId : null;
    const batchSize = typeof body?.batchSize === "number" && body.batchSize > 0 ? Math.floor(body.batchSize) : 1;
    const force = Boolean(body?.force);

    if (action === "status") {
      const job = jobId
        ? await getOpinionPackGenerationJob(jobId)
        : await getLatestOpinionPackGenerationJob(packId);
      return NextResponse.json({ job });
    }

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: "Business plan profile responses are required before generating the opinion pack." },
        { status: 400 }
      );
    }

    if (action === "start") {
      const activeJob = await getActiveOpinionPackGenerationJob(packId);
      if (activeJob) {
        return NextResponse.json({ job: activeJob });
      }
      const latestJob = await getLatestOpinionPackGenerationJob(packId);
      if (!force && latestJob && latestJob.status === "completed") {
        return NextResponse.json({ job: latestJob });
      }
      const createdJob = await createOpinionPackGenerationJob(packId);
      if (!createdJob) {
        return NextResponse.json({ error: "Unable to create generation job" }, { status: 500 });
      }
      return NextResponse.json({ job: createdJob }, { status: 201 });
    }

    if (action !== "run") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    let job =
      (jobId ? await getOpinionPackGenerationJob(jobId) : null) ??
      (await getActiveOpinionPackGenerationJob(packId)) ??
      (await getLatestOpinionPackGenerationJob(packId));
    if (!job) {
      job = await createOpinionPackGenerationJob(packId);
    }
    if (!job) {
      return NextResponse.json({ error: "Unable to initialize generation job" }, { status: 500 });
    }
    jobForError = job;

    if (job.status === "completed") {
      return NextResponse.json({ job });
    }

    const questions = getProfileQuestions(permission);
    const insights = buildProfileInsights(permission, responses);
    const questionLookup = new Map<string, ProfileQuestion>();
    questions.forEach((question) => questionLookup.set(question.id, question));

    const firmBasics = project.assessmentData?.basics;
    const firmName = firmBasics?.legalName || project.name || pack.name;
    const permissionLabel = project.permissionName || project.permissionCode;

    const sections = buildOpinionPackSections({
      firmName,
      permission,
      permissionLabel,
      responses,
      questionLookup,
      insights,
    });

    const contextLines = [
      `Firm: ${firmName}`,
      `Permission scope: ${permissionLabel}`,
      `Perimeter verdict: ${insights.perimeterOpinion.verdict.replace(/-/g, " ")}`,
      `Summary: ${insights.perimeterOpinion.summary}`,
    ];
    if (insights.activityHighlights.length) {
      contextLines.push(`Activity highlights: ${insights.activityHighlights.join(", ")}`);
    }
    const context = contextLines.join("\n");

    const aiEligibleSections = new Set([
      "instruction-scope",
      "factual-background",
      "regulatory-framework",
      "regulated-activities",
      "permissions-mapping",
      "regulatory-implications",
      "assumptions-limitations",
      "opinion",
    ]);

    const eligibleSections = sections.filter((s) => aiEligibleSections.has(s.key));
    const jobPayload = parseOpinionPackJobPayload(job.payload as Record<string, unknown>);
    const aiContent: Record<string, string> = { ...jobPayload.aiContent };
    const warnings = [...jobPayload.warnings];

    const pendingSections = eligibleSections.filter((section) => !(section.key in aiContent));
    if (pendingSections.length > 0) {
      const nextBatch = pendingSections.slice(0, Math.max(1, batchSize));
      const stepLabel =
        nextBatch.length === 1
          ? `Drafting: ${nextBatch[0].title}`
          : `Drafting ${nextBatch.length} sections`;

      await updateOpinionPackGenerationJob(job.id, {
        status: "processing",
        currentStep: stepLabel,
        progress: Math.max(job.progress ?? 0, 5),
        errorMessage: null,
      });

      for (const section of nextBatch) {
        const synthesized = await synthesizeOpinionSection(section, context, section.synthesizedContent);
        if (synthesized) {
          aiContent[section.key] = synthesized;
        } else {
          aiContent[section.key] = "";
          warnings.push(`AI synthesis skipped for ${section.title}.`);
        }
      }

      const completed = Object.keys(aiContent).length;
      const progress = Math.round((completed / eligibleSections.length) * 90);
      const updatedJob = await updateOpinionPackGenerationJob(job.id, {
        status: "processing",
        currentStep: pendingSections.length === nextBatch.length ? "Building PDF" : "Drafting sections",
        progress,
        payload: { aiContent, warnings },
        errorMessage: null,
      });
      return NextResponse.json({ job: updatedJob });
    }

    await updateOpinionPackGenerationJob(job.id, {
      status: "processing",
      currentStep: "Building PDF",
      progress: Math.max(job.progress ?? 0, 95),
      errorMessage: null,
    });

    const hydratedSections = applyAiContentToSections(sections, aiContent);

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
      hydratedSections
    );

    const timestamp = new Date().toISOString().split("T")[0];
    const documentName = `Regulatory Perimeter and Permissions Opinion - ${firmName} - ${timestamp}`;

    const description = "Perimeter opinion generated from profile responses.";

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

    const completedJob = await updateOpinionPackGenerationJob(job.id, {
      status: "completed",
      currentStep: "Completed",
      progress: 100,
      payload: { aiContent, warnings },
      documentId: packDocument.id,
      documentName,
      errorMessage: null,
    });

    return NextResponse.json({
      job: completedJob,
      document: {
        id: packDocument.id,
        name: documentName,
        filename: ensurePdfFilename(sanitizeFilename(documentName)),
      },
    });
  } catch (error) {
    console.error("Perimeter opinion generation error:", error);
    if (jobForError?.id) {
      await updateOpinionPackGenerationJob(jobForError.id, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return NextResponse.json(
      {
        error: "Failed to generate opinion pack",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
