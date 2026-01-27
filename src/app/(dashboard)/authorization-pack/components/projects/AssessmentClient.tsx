"use client";

import { Component, useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";

// Error Boundary for Question Bank
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class QuestionBankErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Question bank error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border border-rose-200 bg-rose-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-900">Unable to load regulatory questions</p>
                <p className="text-sm text-rose-700 mt-1">
                  An error occurred while rendering the question bank. Your other assessment data is safe.
                  Please refresh the page to try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
import {
  deriveEntityTypeFromCompaniesHouse,
  deriveFirmStageFromIncorporation,
  deriveJurisdictionFromCompaniesHouse,
  describeSicCode,
  formatCompaniesHouseCompanyType,
  normalizeCompaniesHouseCountry,
} from "@/lib/companies-house-utils";
import {
  buildQuestionContext,
  type QuestionResponse,
} from "@/lib/assessment-question-bank";
import type { QuestionDefinition, QuestionSection, QuestionOption } from "../../lib/questionBank";

type ReadinessStatus = "missing" | "partial" | "complete";
type TrainingStatus = "missing" | "in-progress" | "complete";
type SmcrStatus = "unassigned" | "assigned";

interface AssessmentData {
  basics?: Record<string, string | number | null>;
  readiness?: Record<string, ReadinessStatus>;
  policies?: Record<string, ReadinessStatus>;
  training?: Record<string, TrainingStatus>;
  smcr?: Record<string, SmcrStatus>;
  businessPlanProfile?: BusinessPlanProfile;
  questionResponses?: Record<string, QuestionResponse>;
  meta?: Record<string, unknown>;
}

interface ProjectDetail {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
  policyTemplates?: string[];
  trainingRequirements?: string[];
  smcrRoles?: string[];
  assessmentData?: AssessmentData;
}

interface CompanySearchItem {
  company_number: string;
  title: string;
  address_snippet?: string;
}

interface CompanyHousePscItem {
  id: string;
  name: string;
  kind?: string;
  natureOfControl: string[];
  notifiedOn?: string;
  ceasedOn?: string;
}

interface CompanyHouseOfficerItem {
  id: string;
  name: string;
  role?: string;
  appointedOn?: string;
  resignedOn?: string;
}

interface CompanyHouseFilings {
  confirmationStatementDue?: string;
  confirmationStatementMadeUpTo?: string;
  accountsDue?: string;
  accountsMadeUpTo?: string;
}

interface CompanyHouseMeta {
  sicCodes?: string[];
  filings?: CompanyHouseFilings;
  pscItems?: CompanyHousePscItem[];
  officers?: CompanyHouseOfficerItem[];
  pscConfirmed?: boolean;
  psdCandidates?: string[];
  lastSyncedAt?: string;
}

interface AnalysisItem {
  suggested: "missing" | "partial" | "complete";
  reason: string;
  priority: "high" | "medium" | "low";
}

interface AnalysisResponse {
  readiness: {
    businessPlanDraft: AnalysisItem;
    financialModel: AnalysisItem;
    technologyStack: AnalysisItem;
    safeguardingSetup: AnalysisItem;
    amlFramework: AnalysisItem;
    riskFramework: AnalysisItem;
    governancePack: AnalysisItem;
  };
  priorities: string[];
  risks: string[];
  recommendations: string[];
}

const readinessItems = [
  { key: "businessPlanDraft", label: "Business plan draft", description: "Narrative outline and gold-standard coverage." },
  { key: "financialModel", label: "Financial model", description: "Capital, projections, stress testing." },
  { key: "technologyStack", label: "Technology stack", description: "Platform architecture and vendors." },
  { key: "safeguardingSetup", label: "Safeguarding setup", description: "Accounts, reconciliation, reporting." },
  { key: "amlFramework", label: "AML/CTF framework", description: "Risk assessment, monitoring, SARs." },
  { key: "riskFramework", label: "Risk framework", description: "Risk appetite, monitoring, reporting." },
  { key: "governancePack", label: "Governance pack", description: "Board, committees, MI pack." },
];

const JURISDICTIONS = [
  { value: "england-wales", label: "England & Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern-ireland", label: "Northern Ireland" },
  { value: "other-uk", label: "Other UK Territory" },
  { value: "non-uk", label: "Non-UK (Overseas)" },
];

const FIRM_STAGES = [
  { value: "pre-incorporation", label: "Pre-incorporation" },
  { value: "newly-incorporated", label: "Newly incorporated (< 6 months)" },
  { value: "established-no-auth", label: "Established, not yet authorised" },
  { value: "authorised-expanding", label: "Already authorised, expanding permissions" },
  { value: "other", label: "Other" },
];

const EMPLOYEE_RANGES = [
  { value: "1-5", label: "1-5 employees" },
  { value: "6-20", label: "6-20 employees" },
  { value: "21-50", label: "21-50 employees" },
  { value: "51-100", label: "51-100 employees" },
  { value: "100+", label: "More than 100 employees" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
];

const FIRM_TYPES = [
  { value: "limited-company", label: "Limited company" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "partnership", label: "Partnership" },
  { value: "sole-trader", label: "Sole trader" },
  { value: "overseas", label: "Overseas entity" },
  { value: "other", label: "Other" },
];

const PSP_TYPES = [
  { value: "authorised-pi", label: "Authorised Payment Institution (API)" },
  { value: "small-pi", label: "Small Payment Institution (SPI)" },
  { value: "authorised-emi", label: "Authorised E-Money Institution (AEMI)" },
  { value: "small-emi", label: "Small E-Money Institution (SEMI)" },
  { value: "registered-aisp", label: "Registered Account Information Service Provider (RAISP)" },
  { value: "other", label: "Other / unsure" },
];

const DOCUMENT_STATUS_OPTIONS = [
  { value: "provided", label: "Provided" },
  { value: "not-provided", label: "Not provided yet" },
  { value: "not-applicable", label: "Not applicable" },
];

const PAYMENT_SERVICE_OPTIONS = [
  { value: "cash-deposit", label: "Cash placed on a payment account" },
  { value: "cash-withdrawal", label: "Cash withdrawal from a payment account" },
  { value: "execution-payment-account", label: "Execution of payment transactions from a payment account" },
  { value: "execution-credit-line", label: "Execution of payment transactions funded by credit line" },
  { value: "issuing-acquiring", label: "Issuing/acquiring payment instruments" },
  { value: "money-remittance", label: "Money remittance" },
  { value: "payment-initiation", label: "Payment initiation services (PIS)" },
  { value: "account-information", label: "Account information services (AIS)" },
];

const formatDateValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getDaysUntil = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const getPscBucket = (natures: string[]) => {
  const values = natures.map((value) => value.toLowerCase());
  if (values.some((value) => value.includes("75-to-100"))) {
    return { label: "50%+ ownership", band: "CH band 75-100%" };
  }
  if (values.some((value) => value.includes("50-to-75"))) {
    return { label: "50%+ ownership", band: "CH band 50-75%" };
  }
  if (values.some((value) => value.includes("25-to-50"))) {
    return { label: "33%+ ownership", band: "CH band 25-50%" };
  }
  if (values.some((value) => value.includes("significant-influence-or-control"))) {
    return { label: "Other control", band: "" };
  }
  if (values.some((value) => value.includes("right-to-appoint-and-remove-directors"))) {
    return { label: "Other control", band: "" };
  }
  return { label: "Other control", band: "" };
};

const isDirectorRole = (role?: string) => {
  const normalized = (role || "").toLowerCase();
  return normalized.includes("director");
};

const buildDefaultAssessment = (project: ProjectDetail | null, existing?: AssessmentData): AssessmentData => {
  const policies: Record<string, ReadinessStatus> = { ...(existing?.policies ?? {}) };
  (project?.policyTemplates ?? []).forEach((policy) => {
    if (!policies[policy]) policies[policy] = "missing";
  });

  const training: Record<string, TrainingStatus> = { ...(existing?.training ?? {}) };
  (project?.trainingRequirements ?? []).forEach((item) => {
    if (!training[item]) training[item] = "missing";
  });

  const smcr: Record<string, SmcrStatus> = { ...(existing?.smcr ?? {}) };
  (project?.smcrRoles ?? []).forEach((role) => {
    if (!smcr[role]) smcr[role] = "unassigned";
  });

  const readinessDefaults: Record<string, ReadinessStatus> = readinessItems.reduce((acc, item) => {
    acc[item.key] = existing?.readiness?.[item.key] || "missing";
    return acc;
  }, {} as Record<string, ReadinessStatus>);

  const basicsDefaults: Record<string, string | number | null> = {
    legalName: existing?.basics?.legalName ?? "",
    priorFcaApplications: existing?.basics?.priorFcaApplications ?? "",
    firmType: existing?.basics?.firmType ?? "",
    tradingName: existing?.basics?.tradingName ?? "",
    entityType: existing?.basics?.entityType ?? "",
    incorporationDate: existing?.basics?.incorporationDate ?? "",
    incorporationPlace: existing?.basics?.incorporationPlace ?? "",
    companyNumber: existing?.basics?.companyNumber ?? "",
    registeredNumberExists:
      existing?.basics?.registeredNumberExists ??
      (existing?.basics?.companyNumber ? "yes" : ""),
    financialYearEnd: existing?.basics?.financialYearEnd ?? "",
    sicCode: existing?.basics?.sicCode ?? "",
    companyStatus: existing?.basics?.companyStatus ?? "",
    companyType: existing?.basics?.companyType ?? "",
    addressLine1: existing?.basics?.addressLine1 ?? "",
    addressLine2: existing?.basics?.addressLine2 ?? "",
    city: existing?.basics?.city ?? "",
    postcode: existing?.basics?.postcode ?? "",
    country: existing?.basics?.country ?? "United Kingdom",
    registeredOfficeSameAsHeadOffice: existing?.basics?.registeredOfficeSameAsHeadOffice ?? "",
    headOfficeAddressLine1: existing?.basics?.headOfficeAddressLine1 ?? "",
    headOfficeAddressLine2: existing?.basics?.headOfficeAddressLine2 ?? "",
    headOfficeCity: existing?.basics?.headOfficeCity ?? "",
    headOfficePostcode: existing?.basics?.headOfficePostcode ?? "",
    headOfficePhone: existing?.basics?.headOfficePhone ?? "",
    headOfficeEmail: existing?.basics?.headOfficeEmail ?? "",
    primaryJurisdiction: existing?.basics?.primaryJurisdiction ?? "",
    primaryContact: existing?.basics?.primaryContact ?? "",
    contactEmail: existing?.basics?.contactEmail ?? "",
    contactPhone: existing?.basics?.contactPhone ?? "",
    firmStage: existing?.basics?.firmStage ?? "",
    regulatedActivities: existing?.basics?.regulatedActivities ?? "",
    headcount: existing?.basics?.headcount ?? "",
    targetMarkets: existing?.basics?.targetMarkets ?? "",
    estimatedTransactionVolume: existing?.basics?.estimatedTransactionVolume ?? "",
    timelinePreference: existing?.basics?.timelinePreference ?? "",
    website: existing?.basics?.website ?? "",
    previouslyRegulated: existing?.basics?.previouslyRegulated ?? "",
    tradeAssociations: existing?.basics?.tradeAssociations ?? "",
    usedProfessionalAdviser: existing?.basics?.usedProfessionalAdviser ?? "",
    adviserFirmName: existing?.basics?.adviserFirmName ?? "",
    adviserCopyCorrespondence: existing?.basics?.adviserCopyCorrespondence ?? "",
    adviserContactDetails: existing?.basics?.adviserContactDetails ?? "",
    timingFactors: existing?.basics?.timingFactors ?? "",
    pspType: existing?.basics?.pspType ?? "",
    paymentServicesActivities: existing?.basics?.paymentServicesActivities ?? "",
    currentlyProvidingPIS: existing?.basics?.currentlyProvidingPIS ?? "",
    currentlyProvidingAIS: existing?.basics?.currentlyProvidingAIS ?? "",
    pisStartDate: existing?.basics?.pisStartDate ?? "",
    aisStartDate: existing?.basics?.aisStartDate ?? "",
    certificateOfIncorporation: existing?.basics?.certificateOfIncorporation ?? "",
    articlesOfAssociation: existing?.basics?.articlesOfAssociation ?? "",
    partnershipDeed: existing?.basics?.partnershipDeed ?? "",
    llpAgreement: existing?.basics?.llpAgreement ?? "",
  };

  return {
    basics: basicsDefaults,
    readiness: readinessDefaults,
    policies,
    training,
    smcr,
    questionResponses: existing?.questionResponses ?? {},
    meta: existing?.meta ?? {},
  };
};

const calculateCompletion = (assessment: AssessmentData, permissionCode?: string | null) => {
  const basics = assessment.basics ?? {};
  const basicKeys = [
    "legalName",
    "priorFcaApplications",
    "firmType",
    "incorporationDate",
    "incorporationPlace",
    "registeredNumberExists",
    "financialYearEnd",
    "registeredOfficeSameAsHeadOffice",
    "primaryJurisdiction",
    "primaryContact",
    "contactEmail",
    "firmStage",
    "regulatedActivities",
    "headcount",
    "website",
    "previouslyRegulated",
    "usedProfessionalAdviser",
    "pspType",
    "paymentServicesActivities",
    "currentlyProvidingPIS",
    "currentlyProvidingAIS",
  ];

  if (basics.registeredNumberExists === "yes") {
    basicKeys.push("companyNumber");
  }

  if (basics.registeredOfficeSameAsHeadOffice === "no") {
    basicKeys.push(
      "headOfficeAddressLine1",
      "headOfficeCity",
      "headOfficePostcode",
      "headOfficePhone",
      "headOfficeEmail"
    );
  }

  if (basics.usedProfessionalAdviser === "yes") {
    basicKeys.push("adviserFirmName", "adviserCopyCorrespondence", "adviserContactDetails");
  }

  if (basics.currentlyProvidingPIS === "yes") {
    basicKeys.push("pisStartDate");
  }

  if (basics.currentlyProvidingAIS === "yes") {
    basicKeys.push("aisStartDate");
  }
  const basicsCompleted = basicKeys.filter((key) => {
    const value = basics[key];
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }).length;

  // Include readiness, policies, training, smcr (matches server-side calculation)
  const readiness = Object.values(assessment.readiness ?? {});
  const readinessCompleted = readiness.filter((value) => value === "complete").length;

  const policies = Object.values(assessment.policies ?? {});
  const policiesCompleted = policies.filter((value) => value === "complete").length;

  const training = Object.values(assessment.training ?? {});
  const trainingCompleted = training.filter((value) => value === "complete").length;

  const smcr = Object.values(assessment.smcr ?? {});
  const smcrCompleted = smcr.filter((value) => value === "assigned").length;

  // Include question bank progress
  const questionContext = buildQuestionContext(
    { basics, questionResponses: assessment.questionResponses, meta: assessment.meta },
    permissionCode
  );
  const questionBankTotal = questionContext.requiredCount;
  const questionBankCompleted = questionContext.answeredCount;

  const total = basicKeys.length + readiness.length + policies.length + training.length + smcr.length + questionBankTotal;
  const completed = basicsCompleted + readinessCompleted + policiesCompleted + trainingCompleted + smcrCompleted + questionBankCompleted;
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

export function AssessmentClient() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isCompanyHouseSyncing, setIsCompanyHouseSyncing] = useState(false);
  const [companyHouseError, setCompanyHouseError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [companyResults, setCompanyResults] = useState<CompanySearchItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for tracking initial state and abort controllers
  const initialAssessmentRef = useRef<string>("");
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null);
      if (!response || !response.ok) {
        setLoadError("Unable to load assessment. Please try again.");
        return;
      }
      const data = await response.json();
      const projectData = data.project as ProjectDetail;
      setProject(projectData);
      const normalizedAssessment = buildDefaultAssessment(projectData, projectData.assessmentData);
      setAssessment(normalizedAssessment);
      // Store initial state for unsaved changes detection
      initialAssessmentRef.current = JSON.stringify(normalizedAssessment);
      setHasUnsavedChanges(false);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Track unsaved changes
  useEffect(() => {
    if (!initialAssessmentRef.current) return;
    const currentState = JSON.stringify(assessment);
    setHasUnsavedChanges(currentState !== initialAssessmentRef.current);
  }, [assessment]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Companies House search with AbortController
  useEffect(() => {
    const query = String(assessment.basics?.legalName ?? "").trim();
    if (query.length < 3) {
      setCompanyResults([]);
      setSearchError(null);
      return;
    }

    // Abort previous request if still pending
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `/api/companies-house/search?q=${encodeURIComponent(query)}`,
          { signal: abortController.signal }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setSearchError(errorData.error || "Unable to search Companies House");
          setCompanyResults([]);
          return;
        }
        const data = await response.json();
        setCompanyResults(data.items || []);
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setSearchError(error instanceof Error ? error.message : "Companies House search failed");
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [assessment.basics?.legalName]);

  const completion = useMemo(() => calculateCompletion(assessment, project?.permissionCode), [assessment, project?.permissionCode]);

  // Build question bank context for rendering
  const questionContext = useMemo(
    () => buildQuestionContext(
      { basics: assessment.basics, questionResponses: assessment.questionResponses, meta: assessment.meta },
      project?.permissionCode
    ),
    [assessment.basics, assessment.questionResponses, assessment.meta, project?.permissionCode]
  );

  // Calculate readiness score from question responses
  const readinessScore = useMemo(() => {
    const responses = questionContext.responses;
    const allQuestions = questionContext.sections.flatMap((s) => s.questions);

    let totalPossible = 0;
    let totalEarned = 0;

    for (const question of allQuestions) {
      if (!question.weight) continue;

      // Calculate max possible score for this question
      const maxScore = question.options?.reduce((max, opt) => Math.max(max, opt.score ?? 0), 0) ?? question.weight;
      totalPossible += maxScore * question.weight;

      // Get earned score
      const response = responses[question.id];
      if (response?.score !== undefined) {
        totalEarned += response.score * question.weight;
      }
    }

    if (totalPossible === 0) return null;
    return {
      earned: totalEarned,
      possible: totalPossible,
      percentage: Math.round((totalEarned / totalPossible) * 100),
    };
  }, [questionContext]);

  const updateBasics = (key: string, value: string) => {
    setAssessment((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        [key]: value,
      },
    }));
  };

  const updateBasicsBatch = (updates: Record<string, string | number | null>) => {
    setAssessment((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        ...updates,
      },
    }));
  };

  const updateCompanyHouse = (updates: Partial<CompanyHouseMeta>) => {
    setAssessment((prev) => {
      const meta = { ...(prev.meta ?? {}) } as Record<string, unknown>;
      const existing = (meta.companyHouse as CompanyHouseMeta | undefined) || {};
      meta.companyHouse = { ...existing, ...updates };
      return { ...prev, meta };
    });
  };

  const updateQuestionResponse = useCallback((questionId: string, value: unknown, score?: number) => {
    setAssessment((prev) => ({
      ...prev,
      questionResponses: {
        ...(prev.questionResponses ?? {}),
        [questionId]: { value, score, source: "user" as const },
      },
    }));
  }, []);

  const activitySelections = useMemo(() => {
    const raw = assessment.basics?.paymentServicesActivities;
    if (Array.isArray(raw)) {
      return raw.filter((v): v is string => typeof v === "string");
    }
    if (typeof raw === "string" && raw.trim().length > 0) {
      return raw.split(",").map((value) => value.trim()).filter(Boolean);
    }
    return [];
  }, [assessment.basics?.paymentServicesActivities]);

  const togglePaymentService = (value: string) => {
    const next = new Set(activitySelections);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    updateBasics("paymentServicesActivities", Array.from(next).join(", "));
  };

  const syncCompaniesHouseExtras = async (companyNumber: string, profileData?: { company?: unknown } | null) => {
    if (!companyNumber) return;
    setIsCompanyHouseSyncing(true);
    setCompanyHouseError(null);

    try {
      const profilePromise = profileData
        ? Promise.resolve({
            ok: true,
            status: 200,
            json: async () => profileData,
          })
        : fetch(`/api/companies-house/lookup?number=${encodeURIComponent(companyNumber)}`).catch(() => null);

      const [profileResponse, pscResponse, officersResponse] = await Promise.all([
        profilePromise,
        fetch(`/api/companies-house/${encodeURIComponent(companyNumber)}/psc`).catch(() => null),
        fetch(`/api/companies-house/${encodeURIComponent(companyNumber)}/officers`).catch(() => null),
      ]);

      if (!profileResponse || !pscResponse || !officersResponse) {
        setCompanyHouseError("Unable to refresh Companies House data.");
        return;
      }

      if (profileResponse.status === 501 || pscResponse.status === 501 || officersResponse.status === 501) {
        setCompanyHouseError("Companies House integration is not configured.");
        return;
      }

      const resolvedProfile = profileResponse.ok ? await profileResponse.json() : null;
      const pscData = pscResponse.ok ? await pscResponse.json() : { items: [] };
      const officersData = officersResponse.ok ? await officersResponse.json() : { items: [] };
      const officers = Array.isArray(officersData.items) ? (officersData.items as CompanyHouseOfficerItem[]) : [];
      const sicCodes = Array.isArray(resolvedProfile?.company?.sicCodes) ? resolvedProfile.company.sicCodes : [];
      const filings = resolvedProfile?.company?.filings as CompanyHouseFilings | undefined;
      const existingMeta = (assessment.meta as Record<string, unknown> | undefined)?.companyHouse as CompanyHouseMeta | undefined;
      const existingCandidates = Array.isArray(existingMeta?.psdCandidates) ? existingMeta?.psdCandidates : [];
      const defaultCandidates =
        existingCandidates.length > 0
          ? existingCandidates
          : officers.filter((officer) => !officer.resignedOn && isDirectorRole(officer.role)).map((officer) => officer.id);

      updateCompanyHouse({
        pscItems: Array.isArray(pscData.items) ? (pscData.items as CompanyHousePscItem[]) : [],
        officers,
        sicCodes,
        filings,
        psdCandidates: defaultCandidates,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      setCompanyHouseError(error instanceof Error ? error.message : "Unable to refresh Companies House data.");
    } finally {
      setIsCompanyHouseSyncing(false);
    }
  };

  const companyHouse = ((assessment.meta ?? {}) as Record<string, unknown>).companyHouse as CompanyHouseMeta | undefined;
  const pscItems = Array.isArray(companyHouse?.pscItems) ? companyHouse?.pscItems : [];
  const officers = Array.isArray(companyHouse?.officers) ? companyHouse?.officers : [];
  const activeOfficers = officers.filter((officer) => !officer.resignedOn);
  const psdCandidates = Array.isArray(companyHouse?.psdCandidates) ? companyHouse?.psdCandidates : [];
  const psdCandidateSet = new Set(psdCandidates);
  const pscConfirmed = companyHouse?.pscConfirmed ?? false;

  const togglePscConfirmed = (checked: boolean) => {
    updateCompanyHouse({ pscConfirmed: checked });
  };

  const togglePsdCandidate = (officerId: string) => {
    const next = new Set(psdCandidateSet);
    if (next.has(officerId)) {
      next.delete(officerId);
    } else {
      next.add(officerId);
    }
    updateCompanyHouse({ psdCandidates: Array.from(next) });
  };

  const saveAssessment = async () => {
    if (!projectId) return;
    setIsSaving(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || "Unable to save assessment.");
        setSaveNotice(null);
        return;
      }
      const data = await response.json();
      const savedAssessment = buildDefaultAssessment(project, data.assessment);
      setAssessment(savedAssessment);
      // Reset unsaved changes tracking
      initialAssessmentRef.current = JSON.stringify(savedAssessment);
      setHasUnsavedChanges(false);
      setSaveNotice("Assessment saved. Generate the project plan to build milestones and open the workspace.");
    } finally {
      setIsSaving(false);
    }
  };

  const generatePlan = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    await saveAssessment();
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/plan`, { method: "POST" });
      if (response.ok) {
        router.push(`/authorization-pack/${projectId}/plan`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || "Unable to generate plan.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const runPredictiveAnalysis = async () => {
    if (!projectId) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basics: {
            legalName: assessment.basics?.legalName,
            firmStage: assessment.basics?.firmStage,
            regulatedActivities: assessment.basics?.regulatedActivities,
            headcount: assessment.basics?.headcount,
            primaryJurisdiction: assessment.basics?.primaryJurisdiction,
            incorporationDate: assessment.basics?.incorporationDate,
          },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAnalysisError(errorData.error || "Unable to run predictive analysis.");
        return;
      }
      const data = await response.json();
      if (data?.analysis) {
        setAnalysis(data.analysis as AnalysisResponse);
      } else {
        setAnalysisError("No analysis returned.");
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Unable to run predictive analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Companies House lookup
  const lookupCompany = async (companyNumber?: string, fallbackName?: string) => {
    if (!companyNumber || typeof companyNumber !== "string") return;

    setIsLookingUp(true);
    setLookupError(null);
    try {
      const response = await fetch(`/api/companies-house/lookup?number=${encodeURIComponent(companyNumber)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setLookupError(errorData.error || "Company not found");
        return;
      }
      const data = await response.json();
      const company = data.company;
      const normalizedCountry = normalizeCompaniesHouseCountry(company?.address?.country);
      const mappedJurisdiction = deriveJurisdictionFromCompaniesHouse(
        company?.address?.region,
        company?.address?.country
      );
      const derivedFirmStage = deriveFirmStageFromIncorporation(company?.incorporationDate);
      const derivedEntityType = deriveEntityTypeFromCompaniesHouse(company?.type);
      const sicCodes = Array.isArray(company?.sicCodes) ? company.sicCodes : [];
      const filings = company?.filings as CompanyHouseFilings | undefined;

      // Auto-fill the form with company data
      setAssessment((prev) => {
        const prevBasics = prev.basics ?? {};
        return {
          ...prev,
          basics: {
            ...prevBasics,
            legalName: company.name || fallbackName || prevBasics.legalName || null,
            companyNumber: company.number || companyNumber || prevBasics.companyNumber || null,
            incorporationDate: company.incorporationDate || prevBasics.incorporationDate || null,
            incorporationPlace: prevBasics.incorporationPlace || normalizedCountry || null,
            sicCode: company.sicCodes?.[0] || prevBasics.sicCode || null,
            companyStatus: company.status || prevBasics.companyStatus || null,
            companyType: company.type || prevBasics.companyType || null,
            entityType: prevBasics.entityType || derivedEntityType || null,
            addressLine1: company.address?.line1 || prevBasics.addressLine1 || null,
            addressLine2: company.address?.line2 || prevBasics.addressLine2 || null,
            city: company.address?.city || prevBasics.city || null,
            postcode: company.address?.postcode || prevBasics.postcode || null,
            country: normalizedCountry || prevBasics.country || null,
            registeredNumberExists: prevBasics.registeredNumberExists || (company.number ? "yes" : null),
            primaryJurisdiction: prevBasics.primaryJurisdiction || mappedJurisdiction || null,
            firmStage: prevBasics.firmStage || derivedFirmStage || null,
          },
          meta: {
            ...(prev.meta ?? {}),
            companyHouse: {
              ...(((prev.meta ?? {}) as Record<string, unknown>).companyHouse as CompanyHouseMeta | undefined),
              sicCodes,
              filings,
            },
          },
        };
      });
      await syncCompaniesHouseExtras(company?.number || companyNumber, data);
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Lookup failed");
    } finally {
      setIsLookingUp(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <NasaraLoader label="Loading assessment..." />
        </CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Assessment unavailable</CardTitle>
          <CardDescription>{loadError || "We could not find this project."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadProject}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="assessment" />

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Assessment progress</CardTitle>
            <CardDescription>Capture the current state so we can auto-generate the project plan.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-slate-900">{completion}%</p>
            <p className="text-xs text-slate-400">Completion</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={completion} className="h-2" aria-label={`Assessment completion: ${completion}%`} />
          <div className="flex flex-wrap items-center gap-2">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={saveAssessment} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save assessment"}
            </Button>
            <Button variant="outline" onClick={generatePlan} disabled={isGenerating}>
              {isGenerating ? "Generating plan..." : "Generate project plan"}
            </Button>
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 text-xs text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                Unsaved changes
              </span>
            ) : null}
          </div>
          {saveNotice ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700" role="status">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>{saveNotice}</span>
                <Button variant="link" size="sm" className="px-0 text-emerald-700" onClick={generatePlan}>
                  Continue to plan
                </Button>
              </div>
            </div>
          ) : null}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            The project plan converts your assessment into milestones, owners, and target dates so you can track FCA
            readiness and open the workspace with the right sections.
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Predictive readiness analysis</CardTitle>
            <CardDescription>Baseline readiness insights based on your assessment inputs.</CardDescription>
          </div>
          <Button variant="outline" onClick={runPredictiveAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Run analysis"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysisError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {analysisError}
            </div>
          ) : null}
          {isAnalyzing ? (
            <div className="py-2">
              <NasaraLoader label="Generating readiness insights..." />
            </div>
          ) : null}
          {analysis ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {readinessItems.map((item) => {
                const result = analysis.readiness[item.key as keyof AnalysisResponse["readiness"]];
                const status = result?.suggested || "missing";
                return (
                  <div key={item.key} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{result?.reason || "No insight yet."}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 ${
                        status === "complete"
                          ? "bg-emerald-100 text-emerald-700"
                          : status === "partial"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {status}
                      </span>
                      <span className="text-slate-500">Priority: {result?.priority || "medium"}</span>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Priorities</p>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  {(analysis.priorities || []).map((item, idx) => (
                    <p key={idx}>{item}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Risks</p>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  {(analysis.risks || []).map((item, idx) => (
                    <p key={idx}>{item}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white p-3 lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recommendations</p>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  {(analysis.recommendations || []).map((item, idx) => (
                    <p key={idx}>{item}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Run the analysis to see suggested readiness levels, priorities, and risks.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Firm basics</CardTitle>
          <CardDescription>Key details for the authorisation pack and consultant workflow.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Legal name</Label>
            <Input
              value={String(assessment.basics?.legalName ?? "")}
              onChange={(event) => updateBasics("legalName", event.target.value)}
              placeholder="Start typing the registered company name"
            />
            <p className="text-xs text-slate-400">
              Select a Companies House result to auto-fill company number and registered address.
            </p>
            {isSearching ? <p className="text-xs text-slate-500">Searching Companies House...</p> : null}
            {searchError ? <p className="text-xs text-red-500">{searchError}</p> : null}
            {companyResults.length > 0 ? (
              <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white">
                {companyResults.map((item) => (
                  <button
                    key={item.company_number}
                    type="button"
                    className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setCompanyResults([]);
                      lookupCompany(item.company_number, item.title);
                    }}
                    disabled={isLookingUp}
                  >
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.company_number} {item.address_snippet ? `· ${item.address_snippet}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Incorporation date</Label>
            <Input
              type="date"
              value={String(assessment.basics?.incorporationDate ?? "")}
              onChange={(event) => updateBasics("incorporationDate", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Company number</Label>
            <Input
              value={String(assessment.basics?.companyNumber ?? "")}
              onChange={(event) => updateBasics("companyNumber", event.target.value)}
              placeholder="Auto-filled from Companies House"
              readOnly
              className="bg-slate-50"
            />
            {isLookingUp ? (
              <NasaraLoader size="sm" label="Loading company details..." className="items-start" />
            ) : null}
            {lookupError ? <p className="text-xs text-red-500 mt-1">{lookupError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>SIC code</Label>
            <Input
              value={String(assessment.basics?.sicCode ?? "")}
              onChange={(event) => updateBasics("sicCode", event.target.value)}
              placeholder="e.g., 64999"
            />
          </div>
          <div className="space-y-2">
            <Label>Company status (Companies House)</Label>
            <Input
              value={String(assessment.basics?.companyStatus ?? "")}
              placeholder="e.g., active"
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Company type (Companies House)</Label>
            <Input
              value={formatCompaniesHouseCompanyType(
                typeof assessment.basics?.companyType === "string" ? assessment.basics.companyType : null
              )}
              placeholder="e.g., ltd"
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Registered address - Street (auto-filled)</Label>
            <Input
              value={String(assessment.basics?.addressLine1 ?? "")}
              onChange={(event) => updateBasics("addressLine1", event.target.value)}
              placeholder="Street address line 1"
            />
            <Input
              value={String(assessment.basics?.addressLine2 ?? "")}
              onChange={(event) => updateBasics("addressLine2", event.target.value)}
              placeholder="Street address line 2 (optional)"
              className="mt-2"
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={String(assessment.basics?.city ?? "")}
              onChange={(event) => updateBasics("city", event.target.value)}
              placeholder="e.g., London"
            />
          </div>
          <div className="space-y-2">
            <Label>Postcode</Label>
            <Input
              value={String(assessment.basics?.postcode ?? "")}
              onChange={(event) => updateBasics("postcode", event.target.value)}
              placeholder="e.g., EC1A 1BB"
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={String(assessment.basics?.country ?? "United Kingdom")}
              onValueChange={(value) => updateBasics("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Ireland">Ireland</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Primary jurisdiction</Label>
            <Select
              value={String(assessment.basics?.primaryJurisdiction ?? "")}
              onValueChange={(value) => updateBasics("primaryJurisdiction", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                {JURISDICTIONS.map((jurisdiction) => (
                  <SelectItem key={jurisdiction.value} value={jurisdiction.value}>
                    {jurisdiction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Primary contact</Label>
            <Input
              value={String(assessment.basics?.primaryContact ?? "")}
              onChange={(event) => updateBasics("primaryContact", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Contact phone</Label>
            <Input
              value={String(assessment.basics?.contactPhone ?? "")}
              onChange={(event) => updateBasics("contactPhone", event.target.value)}
              placeholder="+44 20 0000 0000"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact email</Label>
            <Input
              type="email"
              value={String(assessment.basics?.contactEmail ?? "")}
              onChange={(event) => updateBasics("contactEmail", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Firm stage</Label>
            <Select
              value={String(assessment.basics?.firmStage ?? "")}
              onValueChange={(value) => updateBasics("firmStage", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {FIRM_STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Regulated activities</Label>
            <Input
              value={String(assessment.basics?.regulatedActivities ?? "")}
              onChange={(event) => updateBasics("regulatedActivities", event.target.value)}
              placeholder="Payments, e-money issuance, FX" 
            />
          </div>
          <div className="space-y-2">
            <Label>Headcount</Label>
            <Select
              value={String(assessment.basics?.headcount ?? "")}
              onValueChange={(value) => updateBasics("headcount", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select headcount range" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Identification details &amp; timings</CardTitle>
          <CardDescription>Capture FCA application timing, legal structure, and core identifiers.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Other FCA applications submitted in the last 12 months?</Label>
            <Select
              value={String(assessment.basics?.priorFcaApplications ?? "")}
              onValueChange={(value) => updateBasics("priorFcaApplications", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type of firm</Label>
            <Select
              value={String(assessment.basics?.firmType ?? "")}
              onValueChange={(value) => updateBasics("firmType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select firm type" />
              </SelectTrigger>
              <SelectContent>
                {FIRM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Place of incorporation or formation</Label>
            <Input
              value={String(assessment.basics?.incorporationPlace ?? "")}
              onChange={(event) => updateBasics("incorporationPlace", event.target.value)}
              placeholder="e.g., England & Wales"
            />
          </div>
          <div className="space-y-2">
            <Label>Financial year end (dd/mm)</Label>
            <Input
              value={String(assessment.basics?.financialYearEnd ?? "")}
              onChange={(event) => updateBasics("financialYearEnd", event.target.value)}
              placeholder="31/12"
            />
          </div>
          <div className="space-y-2">
            <Label>Does the firm have a registered number?</Label>
            <Select
              value={String(assessment.basics?.registeredNumberExists ?? "")}
              onValueChange={(value) => updateBasics("registeredNumberExists", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trading names (if any)</Label>
            <Input
              value={String(assessment.basics?.tradingName ?? "")}
              onChange={(event) => updateBasics("tradingName", event.target.value)}
              placeholder="List trading names separated by commas"
            />
          </div>
          <div className="space-y-2">
            <Label>Website address</Label>
            <Input
              value={String(assessment.basics?.website ?? "")}
              onChange={(event) => updateBasics("website", event.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Previously regulated by FCA or another authority?</Label>
            <Select
              value={String(assessment.basics?.previouslyRegulated ?? "")}
              onValueChange={(value) => updateBasics("previouslyRegulated", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trade associations (if any)</Label>
            <Input
              value={String(assessment.basics?.tradeAssociations ?? "")}
              onChange={(event) => updateBasics("tradeAssociations", event.target.value)}
              placeholder="e.g., Payments Association"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Timing factors to consider</Label>
            <Input
              value={String(assessment.basics?.timingFactors ?? "")}
              onChange={(event) => updateBasics("timingFactors", event.target.value)}
              placeholder="Describe any timing factors for FCA consideration"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Head office details</CardTitle>
          <CardDescription>Confirm head office details and whether they match the registered office.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Is the registered office the same as the head office?</Label>
            <Select
              value={String(assessment.basics?.registeredOfficeSameAsHeadOffice ?? "")}
              onValueChange={(value) => {
                updateBasics("registeredOfficeSameAsHeadOffice", value);
                if (value === "yes") {
                  updateBasicsBatch({
                    headOfficeAddressLine1: String(assessment.basics?.addressLine1 ?? ""),
                    headOfficeAddressLine2: String(assessment.basics?.addressLine2 ?? ""),
                    headOfficeCity: String(assessment.basics?.city ?? ""),
                    headOfficePostcode: String(assessment.basics?.postcode ?? ""),
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Head office phone</Label>
            <Input
              value={String(assessment.basics?.headOfficePhone ?? "")}
              onChange={(event) => updateBasics("headOfficePhone", event.target.value)}
              placeholder="+44 20 0000 0000"
            />
          </div>
          <div className="space-y-2">
            <Label>Head office email</Label>
            <Input
              value={String(assessment.basics?.headOfficeEmail ?? "")}
              onChange={(event) => updateBasics("headOfficeEmail", event.target.value)}
              placeholder="office@company.com"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Head office address</Label>
            <Input
              value={String(assessment.basics?.headOfficeAddressLine1 ?? "")}
              onChange={(event) => updateBasics("headOfficeAddressLine1", event.target.value)}
              placeholder="Street address line 1"
            />
            <Input
              value={String(assessment.basics?.headOfficeAddressLine2 ?? "")}
              onChange={(event) => updateBasics("headOfficeAddressLine2", event.target.value)}
              placeholder="Street address line 2 (optional)"
              className="mt-2"
            />
          </div>
          <div className="space-y-2">
            <Label>Head office city</Label>
            <Input
              value={String(assessment.basics?.headOfficeCity ?? "")}
              onChange={(event) => updateBasics("headOfficeCity", event.target.value)}
              placeholder="e.g., London"
            />
          </div>
          <div className="space-y-2">
            <Label>Head office postcode</Label>
            <Input
              value={String(assessment.basics?.headOfficePostcode ?? "")}
              onChange={(event) => updateBasics("headOfficePostcode", event.target.value)}
              placeholder="e.g., EC1A 1BB"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Professional adviser details</CardTitle>
          <CardDescription>Capture adviser details and correspondence preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Using a professional adviser for this application?</Label>
            <Select
              value={String(assessment.basics?.usedProfessionalAdviser ?? "")}
              onValueChange={(value) => updateBasics("usedProfessionalAdviser", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Adviser firm name</Label>
            <Input
              value={String(assessment.basics?.adviserFirmName ?? "")}
              onChange={(event) => updateBasics("adviserFirmName", event.target.value)}
              placeholder="Adviser firm"
            />
          </div>
          <div className="space-y-2">
            <Label>Copy correspondence to adviser?</Label>
            <Select
              value={String(assessment.basics?.adviserCopyCorrespondence ?? "")}
              onValueChange={(value) => updateBasics("adviserCopyCorrespondence", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Adviser contact details</Label>
            <Input
              value={String(assessment.basics?.adviserContactDetails ?? "")}
              onChange={(event) => updateBasics("adviserContactDetails", event.target.value)}
              placeholder="Name, address, phone, email"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Programme of operations</CardTitle>
          <CardDescription>Confirm payment service scope and operational status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type of payment service provider</Label>
              <Select
                value={String(assessment.basics?.pspType ?? "")}
                onValueChange={(value) => updateBasics("pspType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PSP type" />
                </SelectTrigger>
                <SelectContent>
                  {PSP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currently providing payment initiation services?</Label>
              <Select
                value={String(assessment.basics?.currentlyProvidingPIS ?? "")}
                onValueChange={(value) => updateBasics("currentlyProvidingPIS", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {assessment.basics?.currentlyProvidingPIS === "yes" ? (
              <div className="space-y-2">
                <Label>PIS start date</Label>
                <Input
                  type="date"
                  value={String(assessment.basics?.pisStartDate ?? "")}
                  onChange={(event) => updateBasics("pisStartDate", event.target.value)}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Currently providing account information services?</Label>
              <Select
                value={String(assessment.basics?.currentlyProvidingAIS ?? "")}
                onValueChange={(value) => updateBasics("currentlyProvidingAIS", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {assessment.basics?.currentlyProvidingAIS === "yes" ? (
              <div className="space-y-2">
                <Label>AIS start date</Label>
                <Input
                  type="date"
                  value={String(assessment.basics?.aisStartDate ?? "")}
                  onChange={(event) => updateBasics("aisStartDate", event.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Payment services activities in scope
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {PAYMENT_SERVICE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox
                    checked={activitySelections.includes(option.value)}
                    onCheckedChange={() => togglePaymentService(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Documents to attach</CardTitle>
          <CardDescription>Confirm the legal formation documents for the application.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            { key: "certificateOfIncorporation", label: "Certificate of incorporation" },
            { key: "articlesOfAssociation", label: "Articles of Association" },
            { key: "partnershipDeed", label: "Partnership agreement deeds (if applicable)" },
            { key: "llpAgreement", label: "LLP agreement deeds (if applicable)" },
          ].map((doc) => (
            <div key={doc.key} className="space-y-2">
              <Label>{doc.label}</Label>
              <Select
                value={String(assessment.basics?.[doc.key] ?? "")}
                onValueChange={(value) => updateBasics(doc.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Companies House confirmations</CardTitle>
            <CardDescription>Confirm PSCs, officers, filings, and SIC classifications pulled from Companies House.</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {companyHouse?.lastSyncedAt ? (
              <span>Last synced {formatDateValue(companyHouse.lastSyncedAt)}</span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncCompaniesHouseExtras(String(assessment.basics?.companyNumber ?? ""))}
              disabled={isCompanyHouseSyncing || !assessment.basics?.companyNumber}
            >
              {isCompanyHouseSyncing ? "Syncing..." : "Refresh Companies House"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {companyHouseError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {companyHouseError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">SIC classifications</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {(companyHouse?.sicCodes && companyHouse.sicCodes.length
                  ? companyHouse.sicCodes
                  : assessment.basics?.sicCode
                  ? [String(assessment.basics.sicCode)]
                  : []
                ).map((code) => {
                  const description = describeSicCode(code);
                  return (
                    <div key={code} className="flex flex-col gap-1 rounded-md bg-white px-3 py-2">
                      <span className="text-xs font-semibold text-slate-500">SIC {code}</span>
                      <span className="text-sm text-slate-700">
                        {description || "Industry classification from Companies House."}
                      </span>
                    </div>
                  );
                })}
                {!companyHouse?.sicCodes?.length && !assessment.basics?.sicCode ? (
                  <p className="text-sm text-slate-500">No SIC codes available yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Filing reminders</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="rounded-md bg-white px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Confirmation statement due</span>
                    <span className="text-xs text-slate-400">
                      {formatDateValue(companyHouse?.filings?.confirmationStatementDue) || "Not available"}
                    </span>
                  </div>
                  {companyHouse?.filings?.confirmationStatementDue ? (
                    <p className="text-xs text-slate-500">
                      {getDaysUntil(companyHouse.filings.confirmationStatementDue) !== null
                        ? `${getDaysUntil(companyHouse.filings.confirmationStatementDue)} days remaining`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-md bg-white px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Accounts due</span>
                    <span className="text-xs text-slate-400">
                      {formatDateValue(companyHouse?.filings?.accountsDue) || "Not available"}
                    </span>
                  </div>
                  {companyHouse?.filings?.accountsDue ? (
                    <p className="text-xs text-slate-500">
                      {getDaysUntil(companyHouse.filings.accountsDue) !== null
                        ? `${getDaysUntil(companyHouse.filings.accountsDue)} days remaining`
                        : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">PSC (Controllers)</p>
                  <p className="text-xs text-slate-500">Confirm the PSC list and FCA controller buckets.</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <Checkbox checked={pscConfirmed} onCheckedChange={(value) => togglePscConfirmed(Boolean(value))} />
                  Confirm PSC list
                </label>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {pscItems.length ? (
                  pscItems.map((psc) => {
                    const bucket = getPscBucket(psc.natureOfControl);
                    return (
                      <div key={psc.id} className="rounded-md bg-white px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{psc.name}</span>
                          <span className="text-xs text-slate-500">{bucket.label}</span>
                        </div>
                        {bucket.band ? <p className="text-xs text-slate-400">{bucket.band}</p> : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No PSC data loaded yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Officers / Directors (PSD)
                  </p>
                  <p className="text-xs text-slate-500">Select directors who are PSD / SMF candidates.</p>
                </div>
                <span className="text-xs text-slate-500">{psdCandidates.length} selected</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {activeOfficers.length ? (
                  activeOfficers.map((officer) => (
                    <label
                      key={officer.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{officer.name}</p>
                        <p className="text-xs text-slate-500">
                          {officer.role || "Officer"} {officer.appointedOn ? `· Appointed ${formatDateValue(officer.appointedOn)}` : ""}
                        </p>
                      </div>
                      <Checkbox
                        checked={psdCandidateSet.has(officer.id)}
                        onCheckedChange={() => togglePsdCandidate(officer.id)}
                      />
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No officer data loaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {questionContext.sections.length > 0 ? (
        <QuestionBankErrorBoundary>
          <Card className="border border-slate-200" role="region" aria-label="Regulatory assessment questions">
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Regulatory assessment questions</CardTitle>
                  <CardDescription>
                    Additional questions to assess your regulatory readiness. Some questions may be pre-filled
                    based on your responses above.
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-6">
                  {readinessScore ? (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">{readinessScore.percentage}%</p>
                      <p className="text-xs text-slate-400">Readiness score</p>
                    </div>
                  ) : null}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {questionContext.answeredCount} / {questionContext.requiredCount}
                    </p>
                    <p className="text-xs text-slate-400">Required questions answered</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {questionContext.sections.map((section: QuestionSection) => (
                <QuestionSectionRenderer
                  key={section.id}
                  section={section}
                  responses={questionContext.responses}
                  onResponseChange={updateQuestionResponse}
                />
              ))}
            </CardContent>
          </Card>
        </QuestionBankErrorBoundary>
      ) : null}
    </div>
  );
}

interface QuestionSectionRendererProps {
  section: QuestionSection;
  responses: Record<string, QuestionResponse>;
  onResponseChange: (questionId: string, value: unknown, score?: number) => void;
}

function QuestionSectionRenderer({ section, responses, onResponseChange }: QuestionSectionRendererProps) {
  const sectionId = `section-${section.id}`;
  return (
    <section className="space-y-4" aria-labelledby={sectionId}>
      <div className="border-b border-slate-100 pb-2">
        <h3 id={sectionId} className="text-sm font-semibold text-slate-900">{section.title}</h3>
        <p className="text-xs text-slate-500">{section.description}</p>
      </div>
      <div className="space-y-6" role="group" aria-label={`Questions in ${section.title}`}>
        {section.questions.map((question: QuestionDefinition) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            response={responses[question.id]}
            onResponseChange={onResponseChange}
          />
        ))}
      </div>
    </section>
  );
}

interface QuestionRendererProps {
  question: QuestionDefinition;
  response?: QuestionResponse;
  onResponseChange: (questionId: string, value: unknown, score?: number) => void;
}

function QuestionRenderer({ question, response, onResponseChange }: QuestionRendererProps) {
  const currentValue = response?.value;
  const isAutoFilled = response?.source === "auto";
  const questionLabelId = `question-label-${question.id}`;
  const questionDescId = `question-desc-${question.id}`;

  const handleChange = (value: unknown, score?: number) => {
    onResponseChange(question.id, value, score);
  };

  const hasDescription = Boolean(question.description || question.helpText);

  return (
    <fieldset
      className="rounded-lg border border-slate-100 bg-slate-50 p-4"
      aria-labelledby={questionLabelId}
      aria-describedby={hasDescription ? questionDescId : undefined}
      aria-required={question.required}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <legend id={questionLabelId} className="text-sm font-medium text-slate-900">
            {question.title || question.question}
            {question.required ? (
              <span className="ml-1 text-rose-500" aria-label="required">*</span>
            ) : null}
          </legend>
          {question.critical ? (
            <span
              className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
              role="status"
              aria-label="This is a critical question"
            >
              Critical
            </span>
          ) : null}
        </div>
        {hasDescription ? (
          <p id={questionDescId} className="text-xs text-slate-500">
            {question.description || question.helpText}
          </p>
        ) : null}
        {question.fcaReference ? (
          <p className="text-xs text-teal-600">FCA: {question.fcaReference}</p>
        ) : null}
      </div>

      <div className="mt-3">
        {isAutoFilled ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="text-xs text-emerald-700">
              Auto-filled from your responses above. Value:{" "}
              <span className="font-medium">
                {Array.isArray(currentValue) ? currentValue.join(", ") : String(currentValue ?? "")}
              </span>
            </p>
          </div>
        ) : question.type === "scale" ? (
          <ScaleQuestion
            question={question}
            value={currentValue as number | undefined}
            onChange={handleChange}
          />
        ) : question.type === "single-select" || question.type === "single-choice" ? (
          <SingleSelectQuestion
            question={question}
            value={currentValue as string | undefined}
            onChange={handleChange}
          />
        ) : question.type === "multi-select" || question.type === "multiple-choice" ? (
          <MultiSelectQuestion
            question={question}
            value={currentValue as string[] | undefined}
            onChange={handleChange}
          />
        ) : question.type === "text" ? (
          <TextQuestion
            question={question}
            value={currentValue as string | undefined}
            onChange={handleChange}
          />
        ) : question.type === "numeric-table" ? (
          <NumericTableQuestion
            question={question}
            value={currentValue as Record<string, Record<string, string | number | null>> | undefined}
            onChange={handleChange}
          />
        ) : null}
      </div>

      {question.evidenceRequired && question.evidenceRequired.length > 0 ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2" aria-label="Evidence requirements">
          <p className="text-xs font-medium text-slate-500">Evidence required:</p>
          <ul className="mt-1 list-inside list-disc text-xs text-slate-400" role="list">
            {question.evidenceRequired.map((evidence: string, idx: number) => (
              <li key={idx}>{evidence}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {question.hardGate && question.hardGateMessage ? (
        <div
          className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
          role="alert"
          aria-live="polite"
        >
          {question.hardGateMessage}
        </div>
      ) : null}
    </fieldset>
  );
}

interface ScaleQuestionProps {
  question: QuestionDefinition;
  value?: number;
  onChange: (value: unknown, score?: number) => void;
}

function ScaleQuestion({ question, value, onChange }: ScaleQuestionProps) {
  return (
    <RadioGroup
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val: string) => {
        const numVal = Number(val);
        const option = question.options?.find((opt: QuestionOption) => Number(opt.value) === numVal);
        onChange(numVal, option?.score);
      }}
      className="space-y-2"
      aria-label={question.title || question.question || "Select an option"}
    >
      {question.options?.map((option: QuestionOption) => {
        const optionId = `${question.id}-option-${option.value}`;
        return (
          <label
            key={String(option.value)}
            htmlFor={optionId}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
          >
            <RadioGroupItem id={optionId} value={String(option.value)} />
            <div className="flex-1">
              <span className="text-sm text-slate-900">{option.label}</span>
              {option.description ? (
                <p className="text-xs text-slate-400">{option.description}</p>
              ) : null}
            </div>
          </label>
        );
      })}
    </RadioGroup>
  );
}

interface SingleSelectQuestionProps {
  question: QuestionDefinition;
  value?: string;
  onChange: (value: unknown, score?: number) => void;
}

function SingleSelectQuestion({ question, value, onChange }: SingleSelectQuestionProps) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(val: string) => {
        const option = question.options?.find((opt: QuestionOption) => String(opt.value) === val);
        onChange(val, option?.score);
      }}
    >
      <SelectTrigger aria-label={question.title || question.question || "Select an option"}>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {question.options?.map((option: QuestionOption) => (
          <SelectItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface MultiSelectQuestionProps {
  question: QuestionDefinition;
  value?: string[];
  onChange: (value: unknown, score?: number) => void;
}

function MultiSelectQuestion({ question, value, onChange }: MultiSelectQuestionProps) {
  const selected = new Set(value ?? []);

  const toggle = (optionValue: string) => {
    const next = new Set(selected);
    if (next.has(optionValue)) {
      next.delete(optionValue);
    } else {
      next.add(optionValue);
    }
    const arr = Array.from(next);
    const totalScore = arr.reduce((sum: number, v: string) => {
      const opt = question.options?.find((o: QuestionOption) => String(o.value) === v);
      return sum + (opt?.score ?? 0);
    }, 0);
    onChange(arr, totalScore);
  };

  return (
    <div
      className="space-y-2"
      role="group"
      aria-label={question.title || question.question || "Select options"}
    >
      {question.options?.map((option: QuestionOption) => {
        const optionId = `${question.id}-checkbox-${option.value}`;
        return (
          <label
            key={String(option.value)}
            htmlFor={optionId}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
          >
            <Checkbox
              id={optionId}
              checked={selected.has(String(option.value))}
              onCheckedChange={() => toggle(String(option.value))}
              aria-describedby={option.description ? `${optionId}-desc` : undefined}
            />
            <div className="flex-1">
              <span className="text-sm text-slate-900">{option.label}</span>
              {option.description ? (
                <p id={`${optionId}-desc`} className="text-xs text-slate-400">{option.description}</p>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}

interface TextQuestionProps {
  question: QuestionDefinition;
  value?: string;
  onChange: (value: unknown, score?: number) => void;
}

function TextQuestion({ question, value, onChange }: TextQuestionProps) {
  return (
    <Textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your response..."
      className="min-h-[100px]"
      aria-label={question.title || question.question || "Enter your response"}
    />
  );
}

interface NumericTableQuestionProps {
  question: QuestionDefinition;
  value?: Record<string, Record<string, string | number | null>>;
  onChange: (value: unknown, score?: number) => void;
}

function NumericTableQuestion({ question, value, onChange }: NumericTableQuestionProps) {
  const columns = question.columns ?? [];
  const rows = question.rows ?? [];
  const tableData = value ?? {};

  const updateCell = (rowLabel: string, colLabel: string, cellValue: string) => {
    // Allow empty values but validate numeric input
    if (cellValue !== "" && isNaN(Number(cellValue.replace(/,/g, "")))) {
      return; // Reject non-numeric input
    }
    const nextData = { ...tableData };
    if (!nextData[rowLabel]) {
      nextData[rowLabel] = {};
    }
    const numericValue = cellValue === "" ? null : cellValue;
    nextData[rowLabel] = { ...nextData[rowLabel], [colLabel]: numericValue };
    onChange(nextData);
  };

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm"
        aria-label={question.title || question.question || "Numeric data table"}
      >
        <thead>
          <tr>
            <th scope="col" className="border-b border-slate-200 px-2 py-1 text-left text-xs font-medium text-slate-500">
              <span className="sr-only">Row label</span>
            </th>
            {columns.map((col: string) => (
              <th scope="col" key={col} className="border-b border-slate-200 px-2 py-1 text-left text-xs font-medium text-slate-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string) => (
            <tr key={row}>
              <th scope="row" className="border-b border-slate-100 px-2 py-1 text-xs text-slate-600 font-normal text-left">
                {row}
              </th>
              {columns.map((col: string) => (
                <td key={col} className="border-b border-slate-100 px-2 py-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={String(tableData[row]?.[col] ?? "")}
                    onChange={(e) => updateCell(row, col, e.target.value)}
                    className="h-8 text-sm"
                    aria-label={`${row} for ${col}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
