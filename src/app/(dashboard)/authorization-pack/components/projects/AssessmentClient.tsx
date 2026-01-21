"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";

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

const readinessItems = [
  { key: "businessPlanDraft", label: "Business plan draft", description: "Narrative outline and gold-standard coverage." },
  { key: "financialModel", label: "Financial model", description: "Capital, projections, stress testing." },
  { key: "technologyStack", label: "Technology stack", description: "Platform architecture and vendors." },
  { key: "safeguardingSetup", label: "Safeguarding setup", description: "Accounts, reconciliation, reporting." },
  { key: "amlFramework", label: "AML/CTF framework", description: "Risk assessment, monitoring, SARs." },
  { key: "riskFramework", label: "Risk framework", description: "Risk appetite, monitoring, reporting." },
  { key: "governancePack", label: "Governance pack", description: "Board, committees, MI pack." },
];

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
    consultantNotes: existing?.basics?.consultantNotes ?? "",
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
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
        return;
      }
      const data = await response.json();
      setAssessment(buildDefaultAssessment(project, data.assessment));
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

      // Auto-fill the form with company data
      setAssessment((prev) => ({
        ...prev,
        basics: {
          ...(prev.basics ?? {}),
          legalName: company.name || fallbackName || prev.basics?.legalName,
          companyNumber: company.number || companyNumber || prev.basics?.companyNumber,
          incorporationDate: company.incorporationDate || prev.basics?.incorporationDate,
          sicCode: company.sicCodes?.[0] || prev.basics?.sicCode,
          addressLine1: company.address?.line1 || prev.basics?.addressLine1,
          addressLine2: company.address?.line2 || prev.basics?.addressLine2,
          city: company.address?.city || prev.basics?.city,
          postcode: company.address?.postcode || prev.basics?.postcode,
          country: company.address?.country || prev.basics?.country,
        },
      }));
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Lookup failed");
    } finally {
      setIsLookingUp(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            Loading assessment...
          </div>
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
            {isLookingUp ? <p className="text-xs text-slate-500">Loading company details...</p> : null}
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
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="UK and EEA">UK and EEA</SelectItem>
                <SelectItem value="EEA only">EEA only</SelectItem>
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
                <SelectItem value="pre-authorisation">Pre-authorisation</SelectItem>
                <SelectItem value="building">Building operations</SelectItem>
                <SelectItem value="live">Already trading</SelectItem>
                <SelectItem value="expanding">Expanding permissions</SelectItem>
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
            <Input
              type="number"
              min="0"
              value={String(assessment.basics?.headcount ?? "")}
              onChange={(event) => updateBasics("headcount", event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Consultant notes</Label>
            <Textarea
              rows={3}
              value={String(assessment.basics?.consultantNotes ?? "")}
              onChange={(event) => updateBasics("consultantNotes", event.target.value)}
              placeholder="Anything the consultant team should know before drafting the pack."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
