"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import { AddressAutocomplete } from "./AddressAutocomplete";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";
import { buildQuestionContext, type QuestionResponse } from "@/lib/assessment-question-bank";
import {
  deriveEntityTypeFromCompaniesHouse,
  deriveFirmStageFromIncorporation,
  deriveJurisdictionFromCompaniesHouse,
  describeSicCode,
  formatCompaniesHouseCompanyType,
  normalizeCompaniesHouseCountry,
} from "@/lib/companies-house-utils";

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
  financialYearEndDay?: string;
  financialYearEndMonth?: string;
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

// Readiness item keys for building default assessment state
const readinessItems = [
  { key: "businessPlanDraft" },
  { key: "financialModel" },
  { key: "technologyStack" },
  { key: "safeguardingSetup" },
  { key: "amlFramework" },
  { key: "riskFramework" },
  { key: "governancePack" },
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

const ASSESSMENT_SECTIONS = [
  { id: "firm-basics", label: "Firm Basics" },
  { id: "identification", label: "Identification & Timings" },
  { id: "head-office", label: "Head Office" },
  { id: "professional-adviser", label: "Professional Adviser" },
  { id: "programme-operations", label: "Programme of Operations" },
  { id: "documents-attach", label: "Documents to Attach" },
  { id: "companies-house", label: "Companies House" },
] as const;

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
    financialYearEndDay: existing?.basics?.financialYearEndDay ?? "",
    financialYearEndMonth: existing?.basics?.financialYearEndMonth ?? "",
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
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (!sectionParam) return;
    const isValid = ASSESSMENT_SECTIONS.some((section) => section.id === sectionParam);
    if (isValid) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

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

  const [activeSection, setActiveSection] = useState<string>("firm-basics");

  // Section completion indicators
  const sectionCompletion = useMemo(() => {
    const basics = assessment.basics ?? {};
    const result: Record<string, { filled: number; total: number }> = {};

    // Firm Basics
    const firmBasicsKeys = ["legalName", "incorporationDate", "companyNumber", "sicCode", "primaryJurisdiction", "primaryContact", "contactEmail", "firmStage", "headcount"];
    result["firm-basics"] = {
      filled: firmBasicsKeys.filter((k) => { const v = basics[k]; return v !== undefined && v !== null && String(v).trim().length > 0; }).length,
      total: firmBasicsKeys.length,
    };

    // Identification & Timings
    const idKeys = ["priorFcaApplications", "firmType", "incorporationPlace", "financialYearEndDay", "financialYearEndMonth", "registeredNumberExists", "tradingName", "website", "previouslyRegulated", "tradeAssociations"];
    result["identification"] = {
      filled: idKeys.filter((k) => { const v = basics[k]; return v !== undefined && v !== null && String(v).trim().length > 0; }).length,
      total: idKeys.length,
    };

    // Head Office
    const hoKeys = ["registeredOfficeSameAsHeadOffice", "headOfficePhone", "headOfficeEmail", "headOfficeAddressLine1", "headOfficeCity", "headOfficePostcode"];
    result["head-office"] = {
      filled: hoKeys.filter((k) => { const v = basics[k]; return v !== undefined && v !== null && String(v).trim().length > 0; }).length,
      total: hoKeys.length,
    };

    // Professional Adviser
    const adviserAnswered = basics.usedProfessionalAdviser !== undefined && basics.usedProfessionalAdviser !== null && String(basics.usedProfessionalAdviser).trim().length > 0;
    result["professional-adviser"] = {
      filled: adviserAnswered ? 1 : 0,
      total: 1,
    };

    // Programme of Operations
    const opsKeys = ["pspType", "currentlyProvidingPIS", "currentlyProvidingAIS", "paymentServicesActivities"];
    result["programme-operations"] = {
      filled: opsKeys.filter((k) => { const v = basics[k]; return v !== undefined && v !== null && String(v).trim().length > 0; }).length,
      total: opsKeys.length,
    };

    // Documents to Attach
    const docKeys = ["certificateOfIncorporation", "articlesOfAssociation", "partnershipDeed", "llpAgreement"];
    const docsCompleted = docKeys.filter((key) => {
      const status = basics[key];
      if (status === undefined || status === null || String(status).trim().length === 0) {
        return false;
      }
      if (status === "not-applicable") {
        const reason = basics[`${key}Reason`];
        return reason !== undefined && reason !== null && String(reason).trim().length > 0;
      }
      return true;
    }).length;
    result["documents-attach"] = {
      filled: docsCompleted,
      total: docKeys.length,
    };

    // Companies House
    const chMeta = ((assessment.meta ?? {}) as Record<string, unknown>).companyHouse as CompanyHouseMeta | undefined;
    const pscDone = chMeta?.pscConfirmed ? 1 : 0;
    const psdDone = Array.isArray(chMeta?.psdCandidates) && chMeta!.psdCandidates!.length > 0 ? 1 : 0;
    result["companies-house"] = { filled: pscDone + psdDone, total: 2 };

    return result;
  }, [assessment]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        // Re-fetch the project to get the packId (plan generation creates the pack)
        const projectResponse = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null);
        const projectData = projectResponse?.ok ? await projectResponse.json() : null;
        const packId = projectData?.project?.packId;
        if (packId) {
          router.push(`/authorization-pack/workspace?packId=${packId}`);
        } else {
          router.push(`/authorization-pack/${projectId}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || "Unable to generate plan.");
      }
    } finally {
      setIsGenerating(false);
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
        const newAddressLine1 = company.address?.line1 || prevBasics.addressLine1 || null;
        const newAddressLine2 = company.address?.line2 || prevBasics.addressLine2 || null;
        const newCity = company.address?.city || prevBasics.city || null;
        const newPostcode = company.address?.postcode || prevBasics.postcode || null;

        // If head office is same as registered, auto-fill head office fields too
        const isSameAsHeadOffice = prevBasics.registeredOfficeSameAsHeadOffice === "yes";

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
            addressLine1: newAddressLine1,
            addressLine2: newAddressLine2,
            city: newCity,
            postcode: newPostcode,
            country: normalizedCountry || prevBasics.country || null,
            registeredNumberExists: prevBasics.registeredNumberExists || (company.number ? "yes" : null),
            primaryJurisdiction: prevBasics.primaryJurisdiction || mappedJurisdiction || null,
            firmStage: prevBasics.firmStage || derivedFirmStage || null,
            financialYearEndDay: filings?.financialYearEndDay || prevBasics.financialYearEndDay || null,
            financialYearEndMonth: filings?.financialYearEndMonth || prevBasics.financialYearEndMonth || null,
            // Auto-fill head office fields if same as registered office
            ...(isSameAsHeadOffice ? {
              headOfficeAddressLine1: newAddressLine1,
              headOfficeAddressLine2: newAddressLine2,
              headOfficeCity: newCity,
              headOfficePostcode: newPostcode,
            } : {}),
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

  const activeSectionLabel =
    ASSESSMENT_SECTIONS.find((section) => section.id === activeSection)?.label ?? "Assessment";
  const hasPack = Boolean(project.packId);
  const workspaceHref = hasPack
    ? `/authorization-pack/workspace?packId=${project.packId}`
    : projectId
      ? `/authorization-pack/${projectId}`
      : "/authorization-pack/workspace";
  const backLabel = hasPack ? "Back to Workspace" : projectId ? "Back to Project" : "Back to Workspace";
  const rootLabel = hasPack ? "Workspace" : projectId ? "Project" : "Workspace";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: rootLabel, href: workspaceHref },
            { label: "Assessment", href: projectId ? `/authorization-pack/${projectId}/assessment` : undefined },
            { label: activeSectionLabel },
          ]}
        />
        <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-700">
          <Link href={workspaceHref}>{backLabel}</Link>
        </Button>
      </div>
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
                  Open Workspace
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

      <div className="border-b border-slate-200">
        <div className="overflow-x-auto">
          <div className="flex gap-1 w-max min-w-full">
            {ASSESSMENT_SECTIONS.map((section) => {
              const sc = sectionCompletion[section.id];
              const isComplete = sc && sc.filled === sc.total && sc.total > 0;
              return (
                <button
                  key={section.id}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeSection === section.id
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                  <span className={`ml-1.5 text-xs ${isComplete ? "text-emerald-600" : "text-slate-400"}`}>
                    {isComplete ? "✓" : `${sc?.filled ?? 0}/${sc?.total ?? 0}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeSection === "firm-basics" && (
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
            <Label>Address lookup</Label>
            <AddressAutocomplete
              defaultValue={String(assessment.basics?.postcode ?? "")}
              placeholder="Search by UK postcode (e.g., EC1A 1BB)"
              onAddressSelect={(address) => {
                updateBasicsBatch({
                  addressLine1: address.line1 || assessment.basics?.addressLine1 || "",
                  addressLine2: address.line2 || "",
                  city: address.city,
                  postcode: address.postcode,
                  country: address.country,
                });
              }}
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter a UK postcode to auto-fill address fields, or enter details manually below.
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Registered address - Street</Label>
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
      )}

      {activeSection === "identification" && (
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
            <Label>Financial year end (DD/MM)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={31}
                value={String(assessment.basics?.financialYearEndDay ?? "")}
                onChange={(event) => {
                  const val = event.target.value.replace(/\D/g, "");
                  const num = parseInt(val, 10);
                  const month = parseInt(String(assessment.basics?.financialYearEndMonth ?? ""), 10);
                  // Validate day based on month (if month is set)
                  let maxDay = 31;
                  if (!isNaN(month)) {
                    if ([4, 6, 9, 11].includes(month)) maxDay = 30;
                    else if (month === 2) maxDay = 29; // Allow 29 for leap years
                  }
                  if (val === "" || (num >= 1 && num <= maxDay)) {
                    updateBasics("financialYearEndDay", val);
                  }
                }}
                placeholder="DD"
                className="w-20"
              />
              <span className="text-slate-500">/</span>
              <Input
                type="number"
                min={1}
                max={12}
                value={String(assessment.basics?.financialYearEndMonth ?? "")}
                onChange={(event) => {
                  const val = event.target.value.replace(/\D/g, "");
                  const num = parseInt(val, 10);
                  if (val === "" || (num >= 1 && num <= 12)) {
                    updateBasics("financialYearEndMonth", val);
                    // Validate existing day against new month
                    const day = parseInt(String(assessment.basics?.financialYearEndDay ?? ""), 10);
                    if (!isNaN(day) && !isNaN(num)) {
                      let maxDay = 31;
                      if ([4, 6, 9, 11].includes(num)) maxDay = 30;
                      else if (num === 2) maxDay = 29;
                      if (day > maxDay) {
                        updateBasics("financialYearEndDay", String(maxDay));
                      }
                    }
                  }
                }}
                placeholder="MM"
                className="w-20"
              />
            </div>
            <p className="text-xs text-slate-500">Day (1-31) / Month (1-12)</p>
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
      )}

      {activeSection === "head-office" && (
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
            <Label>Head office address lookup</Label>
            <AddressAutocomplete
              defaultValue={String(assessment.basics?.headOfficePostcode ?? "")}
              placeholder="Search by UK postcode"
              onAddressSelect={(address) => {
                updateBasicsBatch({
                  headOfficeAddressLine1: address.line1 || assessment.basics?.headOfficeAddressLine1 || "",
                  headOfficeAddressLine2: address.line2 || "",
                  headOfficeCity: address.city,
                  headOfficePostcode: address.postcode,
                });
              }}
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
      )}

      {activeSection === "professional-adviser" && (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Professional adviser details</CardTitle>
          <CardDescription>Capture adviser details and correspondence preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
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
          {assessment.basics?.usedProfessionalAdviser === "yes" && (
            <>
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
            </>
          )}
        </CardContent>
      </Card>
      )}

      {activeSection === "programme-operations" && (
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
      )}

      {activeSection === "documents-attach" && (
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
          ].map((doc) => {
            const statusValue = String(assessment.basics?.[doc.key] ?? "");
            const reasonKey = `${doc.key}Reason`;
            const reasonValue = String(assessment.basics?.[reasonKey] ?? "");
            return (
              <div key={doc.key} className="space-y-2">
                <Label>{doc.label}</Label>
                <Select
                  value={statusValue}
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
                {statusValue === "not-applicable" ? (
                  <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                      Reason required
                    </Label>
                    <Textarea
                      value={reasonValue}
                      onChange={(event) => updateBasics(reasonKey, event.target.value)}
                      placeholder="Explain why this document is not applicable."
                      rows={3}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
      )}

      {activeSection === "companies-house" && (
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
      )}

    </div>
  );
}
