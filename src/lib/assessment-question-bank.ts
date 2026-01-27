import {
  QuestionDefinition,
  QuestionSection,
  questionSections,
} from "@/app/(dashboard)/authorization-pack/lib/questionBank";

export type QuestionResponse = {
  value: unknown;
  score?: number;
  source?: "user" | "auto";
};

export interface AssessmentQuestionState {
  basics?: Record<string, string | number | null>;
  questionResponses?: Record<string, QuestionResponse>;
  meta?: Record<string, unknown>;
}

const mapPaymentActivitiesToPs001 = (activities: string[]) => {
  const mapped = new Set<string>();
  activities.forEach((activity) => {
    switch (activity) {
      case "cash-deposit":
      case "cash-withdrawal":
      case "execution-payment-account":
      case "execution-credit-line":
        mapped.add("payment-accounts");
        break;
      case "issuing-acquiring":
        mapped.add("card-issuing");
        mapped.add("merchant-acquiring");
        break;
      case "money-remittance":
        mapped.add("money-remittance");
        break;
      case "payment-initiation":
        mapped.add("payment-initiation");
        break;
      case "account-information":
        mapped.add("account-information");
        break;
      default:
        break;
    }
  });
  return Array.from(mapped);
};

const mapPspTypeToPs002 = (pspType?: string | number | null) => {
  if (!pspType) return null;
  switch (String(pspType)) {
    case "authorised-pi":
      return "pi";
    case "small-pi":
      return "small-pi";
    case "authorised-emi":
      return "emi";
    case "small-emi":
      return "small-emi";
    default:
      return null;
  }
};

export const getPaymentServiceSelections = (assessment: AssessmentQuestionState) => {
  const raw = assessment.basics?.paymentServicesActivities;
  if (Array.isArray(raw)) {
    return raw.map((value) => String(value).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
};

const getCompanyHouseMeta = (assessment: AssessmentQuestionState) => {
  const meta = assessment.meta ?? {};
  const companyHouse = (meta.companyHouse as Record<string, unknown> | undefined) ?? {};
  return companyHouse;
};

export const buildAutoQuestionResponses = (
  assessment: AssessmentQuestionState
): Record<string, QuestionResponse> => {
  const auto: Record<string, QuestionResponse> = {};
  const activities = getPaymentServiceSelections(assessment);
  const mappedActivities = mapPaymentActivitiesToPs001(activities);
  if (mappedActivities.length) {
    auto["ps-001"] = { value: mappedActivities, source: "auto" };
  }

  const mappedPsp = mapPspTypeToPs002(assessment.basics?.pspType ?? null);
  if (mappedPsp) {
    auto["ps-002"] = { value: mappedPsp, source: "auto" };
  }

  const companyHouse = getCompanyHouseMeta(assessment);
  if (companyHouse.pscConfirmed) {
    auto["pc-003"] = { value: 2, source: "auto" };
  }

  return auto;
};

export const getHiddenQuestionIds = (autoResponses: Record<string, QuestionResponse>) => {
  const hidden = new Set<string>();
  if (autoResponses["ps-001"]) hidden.add("ps-001");
  if (autoResponses["ps-002"]) hidden.add("ps-002");
  if (autoResponses["pc-003"]) hidden.add("pc-003");
  return hidden;
};

const toComparableArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value === null || value === undefined) return [];
  if (typeof value === "string" && value.includes(",")) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [String(value)];
};

export const isQuestionApplicable = (
  question: QuestionDefinition,
  responses: Record<string, QuestionResponse>
) => {
  if (!question.conditionalOn) return true;
  const target = responses[question.conditionalOn.questionId]?.value;
  const targetValues = toComparableArray(target);
  if (!targetValues.length) return false;

  if (question.conditionalOn.values) {
    return question.conditionalOn.values.some((value) => targetValues.includes(String(value)));
  }

  if (question.conditionalOn.notValues) {
    return !question.conditionalOn.notValues.some((value) => targetValues.includes(String(value)));
  }

  return true;
};

export const isQuestionAnswered = (
  question: QuestionDefinition,
  response?: QuestionResponse
) => {
  if (!response) return false;
  const value = response.value;
  if (value === null || value === undefined) return false;

  if (question.type === "numeric-table") {
    if (typeof value !== "object") return false;
    const rows = value as Record<string, Record<string, string | number | null | undefined>>;
    return Object.values(rows).some((row) =>
      Object.values(row ?? {}).some((cell) => String(cell ?? "").trim().length > 0)
    );
  }

  if (question.type === "multi-select" || question.type === "multiple-choice") {
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim().length > 0;
  }

  if (question.type === "text") {
    return String(value).trim().length > 0;
  }

  if (typeof value === "number") return true;
  return String(value).trim().length > 0;
};

const filterSectionsByPermission = (
  permissionCode: string | null | undefined,
  sections: QuestionSection[]
) =>
  sections.filter((section) => {
    if (!section.applicableTo || section.applicableTo.length === 0) return true;
    if (!permissionCode) return false;
    return section.applicableTo.includes(permissionCode);
  });

export const buildQuestionContext = (
  assessment: AssessmentQuestionState,
  permissionCode?: string | null
) => {
  const autoResponses = buildAutoQuestionResponses(assessment);
  const responses = { ...autoResponses, ...(assessment.questionResponses ?? {}) };
  const hiddenIds = getHiddenQuestionIds(autoResponses);
  const applicableSections = filterSectionsByPermission(permissionCode, questionSections);
  const sections = applicableSections
    .map((section) => {
      const questions = section.questions.filter(
        (question) =>
          !hiddenIds.has(question.id) && isQuestionApplicable(question, responses)
      );
      return { ...section, questions };
    })
    .filter((section) => section.questions.length > 0);

  const requiredQuestions = sections.flatMap((section) =>
    section.questions.filter((question) => question.required)
  );
  const answeredCount = requiredQuestions.filter((question) =>
    isQuestionAnswered(question, responses[question.id])
  ).length;

  return {
    sections,
    responses,
    autoResponses,
    hiddenIds,
    requiredCount: requiredQuestions.length,
    answeredCount,
  };
};
