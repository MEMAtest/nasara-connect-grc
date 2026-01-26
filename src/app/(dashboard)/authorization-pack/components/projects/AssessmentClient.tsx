"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";
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
    tradingName: existing?.basics?.tradingName ?? "",
    entityType: existing?.basics?.entityType ?? "",
    incorporationDate: existing?.basics?.incorporationDate ?? "",
    companyNumber: existing?.basics?.companyNumber ?? "",
    sicCode: existing?.basics?.sicCode ?? "",
    companyStatus: existing?.basics?.companyStatus ?? "",
    companyType: existing?.basics?.companyType ?? "",
    addressLine1: existing?.basics?.addressLine1 ?? "",
    addressLine2: existing?.basics?.addressLine2 ?? "",
    city: existing?.basics?.city ?? "",
    postcode: existing?.basics?.postcode ?? "",
    country: existing?.basics?.country ?? "United Kingdom",
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
  };

  return {
    basics: basicsDefaults,
    readiness: readinessDefaults,
    policies,
    training,
    smcr,
    meta: existing?.meta ?? {},
  };
};

const calculateCompletion = (assessment: AssessmentData) => {
  const basics = assessment.basics ?? {};
  const basicKeys = [
    "legalName",
    "incorporationDate",
    "companyNumber",
    "addressLine1",
    "city",
    "postcode",
    "primaryJurisdiction",
    "primaryContact",
    "contactEmail",
    "firmStage",
    "regulatedActivities",
    "headcount",
  ];
  const basicsCompleted = basicKeys.filter((key) => {
    const value = basics[key];
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }).length;

  const total = basicKeys.length;
  const completed = basicsCompleted;
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

  const loadProject = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    const query = String(assessment.basics?.legalName ?? "").trim();
    if (query.length < 3) {
      setCompanyResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(`/api/companies-house/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setSearchError(errorData.error || "Unable to search Companies House");
          setCompanyResults([]);
          return;
        }
        const data = await response.json();
        setCompanyResults(data.items || []);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : "Companies House search failed");
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [assessment.basics?.legalName]);

  const completion = useMemo(() => calculateCompletion(assessment), [assessment]);

  const updateBasics = (key: string, value: string) => {
    setAssessment((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        [key]: value,
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
      setAssessment(buildDefaultAssessment(project, data.assessment));
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
      setAssessment((prev) => ({
        ...prev,
        basics: {
          ...(prev.basics ?? {}),
          legalName: company.name || fallbackName || prev.basics?.legalName,
          companyNumber: company.number || companyNumber || prev.basics?.companyNumber,
          incorporationDate: company.incorporationDate || prev.basics?.incorporationDate,
          sicCode: company.sicCodes?.[0] || prev.basics?.sicCode,
          companyStatus: company.status || prev.basics?.companyStatus,
          companyType: company.type || prev.basics?.companyType,
          entityType: prev.basics?.entityType || derivedEntityType || prev.basics?.entityType,
          addressLine1: company.address?.line1 || prev.basics?.addressLine1,
          addressLine2: company.address?.line2 || prev.basics?.addressLine2,
          city: company.address?.city || prev.basics?.city,
          postcode: company.address?.postcode || prev.basics?.postcode,
          country: normalizedCountry || prev.basics?.country,
          primaryJurisdiction: prev.basics?.primaryJurisdiction || mappedJurisdiction || prev.basics?.primaryJurisdiction,
          firmStage: prev.basics?.firmStage || derivedFirmStage || prev.basics?.firmStage,
        },
        meta: {
          ...(prev.meta ?? {}),
          companyHouse: {
            ...(((prev.meta ?? {}) as Record<string, unknown>).companyHouse as CompanyHouseMeta | undefined),
            sicCodes,
            filings,
          },
        },
      }));
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
          <Progress value={completion} className="h-2" />
          <div className="flex flex-wrap gap-2">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={saveAssessment} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save assessment"}
            </Button>
            <Button variant="outline" onClick={generatePlan} disabled={isGenerating}>
              {isGenerating ? "Generating plan..." : "Generate project plan"}
            </Button>
          </div>
          {saveNotice ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
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
              value={formatCompaniesHouseCompanyType(assessment.basics?.companyType)}
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
    </div>
  );
}
