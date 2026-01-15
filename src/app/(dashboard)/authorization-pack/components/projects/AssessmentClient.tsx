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

type ReadinessStatus = "missing" | "partial" | "complete";
type TrainingStatus = "missing" | "in-progress" | "complete";
type SmcrStatus = "unassigned" | "assigned";

interface AssessmentData {
  basics?: Record<string, string | number | null>;
  readiness?: Record<string, ReadinessStatus>;
  policies?: Record<string, ReadinessStatus>;
  training?: Record<string, TrainingStatus>;
  smcr?: Record<string, SmcrStatus>;
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

const readinessItems = [
  { key: "businessPlanDraft", label: "Business plan draft", description: "Narrative outline and gold-standard coverage." },
  { key: "financialModel", label: "Financial model", description: "Capital, projections, stress testing." },
  { key: "technologyStack", label: "Technology stack", description: "Platform architecture and vendors." },
  { key: "safeguardingSetup", label: "Safeguarding setup", description: "Accounts, reconciliation, reporting." },
  { key: "amlFramework", label: "AML/CTF framework", description: "Risk assessment, monitoring, SARs." },
  { key: "riskFramework", label: "Risk framework", description: "Risk appetite, monitoring, reporting." },
  { key: "governancePack", label: "Governance pack", description: "Board, committees, MI pack." },
];

const statusOptions: Array<{ value: ReadinessStatus; label: string }> = [
  { value: "missing", label: "Missing" },
  { value: "partial", label: "In progress" },
  { value: "complete", label: "Complete" },
];

const trainingOptions: Array<{ value: TrainingStatus; label: string }> = [
  { value: "missing", label: "Missing" },
  { value: "in-progress", label: "In progress" },
  { value: "complete", label: "Complete" },
];

const smcrOptions: Array<{ value: SmcrStatus; label: string }> = [
  { value: "unassigned", label: "Unassigned" },
  { value: "assigned", label: "Assigned" },
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
    firmStage: existing?.basics?.firmStage ?? "",
    regulatedActivities: existing?.basics?.regulatedActivities ?? "",
    headcount: existing?.basics?.headcount ?? "",
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

  const readinessValues = Object.values(assessment.readiness ?? {});
  const readinessCompleted = readinessValues.filter((value) => value === "complete").length;

  const policyValues = Object.values(assessment.policies ?? {});
  const policyCompleted = policyValues.filter((value) => value === "complete").length;

  const trainingValues = Object.values(assessment.training ?? {});
  const trainingCompleted = trainingValues.filter((value) => value === "complete").length;

  const smcrValues = Object.values(assessment.smcr ?? {});
  const smcrCompleted = smcrValues.filter((value) => value === "assigned").length;

  const total = basicKeys.length + readinessValues.length + policyValues.length + trainingValues.length + smcrValues.length;
  const completed = basicsCompleted + readinessCompleted + policyCompleted + trainingCompleted + smcrCompleted;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    readiness: Record<string, { suggested: string; reason: string; priority: string }>;
    priorities: string[];
    risks: string[];
    recommendations: string[];
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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

  const updateReadiness = (key: string, value: ReadinessStatus) => {
    setAssessment((prev) => ({
      ...prev,
      readiness: {
        ...(prev.readiness ?? {}),
        [key]: value,
      },
    }));
  };

  const updatePolicy = (key: string, value: ReadinessStatus) => {
    setAssessment((prev) => ({
      ...prev,
      policies: {
        ...(prev.policies ?? {}),
        [key]: value,
      },
    }));
  };

  const updateTraining = (key: string, value: TrainingStatus) => {
    setAssessment((prev) => ({
      ...prev,
      training: {
        ...(prev.training ?? {}),
        [key]: value,
      },
    }));
  };

  const updateSmcr = (key: string, value: SmcrStatus) => {
    setAssessment((prev) => ({
      ...prev,
      smcr: {
        ...(prev.smcr ?? {}),
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

  // AI-powered readiness analysis
  const analyzeReadiness = async () => {
    if (!projectId || !assessment.basics) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basics: assessment.basics }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAnalysisError(errorData.error || "Unable to analyze readiness.");
        return;
      }
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply AI suggestions to readiness
  const applyAISuggestions = () => {
    if (!analysisResult?.readiness) return;
    setAssessment((prev) => {
      const newReadiness = { ...(prev.readiness ?? {}) };
      for (const [key, value] of Object.entries(analysisResult.readiness)) {
        if (value.suggested && ["missing", "partial", "complete"].includes(value.suggested)) {
          newReadiness[key] = value.suggested as ReadinessStatus;
        }
      }
      return { ...prev, readiness: newReadiness };
    });
  };

  // Companies House lookup
  const lookupCompany = async () => {
    const companyNumber = assessment.basics?.companyNumber;
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
          legalName: company.name || prev.basics?.legalName,
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
        <CardContent className="p-8 text-center text-slate-500">Loading assessment...</CardContent>
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
            <Input value={String(assessment.basics?.legalName ?? "")} onChange={(event) => updateBasics("legalName", event.target.value)} />
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
            <div className="flex gap-2">
              <Input
                value={String(assessment.basics?.companyNumber ?? "")}
                onChange={(event) => updateBasics("companyNumber", event.target.value)}
                placeholder="e.g., 12345678"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={lookupCompany}
                disabled={isLookingUp || !assessment.basics?.companyNumber}
                className="shrink-0"
              >
                {isLookingUp ? "Looking up..." : "Lookup"}
              </Button>
            </div>
            {lookupError && (
              <p className="text-xs text-red-500 mt-1">{lookupError}</p>
            )}
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

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Readiness signals</CardTitle>
            <CardDescription>Track what is ready versus still being built.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {analysisResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={applyAISuggestions}
                className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Apply suggestions
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeReadiness}
              disabled={isAnalyzing || !assessment.basics?.legalName}
              className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border border-teal-500 border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  AI Analyze
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* AI Analysis Results */}
        {analysisError && (
          <div className="mx-6 mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <span>AI: {analysisError}</span>
            <button onClick={() => setAnalysisError(null)} className="text-amber-600 hover:text-amber-800">
              &times;
            </button>
          </div>
        )}
        {analysisResult && (
          <div className="mx-6 mb-4 space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-teal-800">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI Analysis Complete
              <button onClick={() => setAnalysisResult(null)} className="ml-auto text-teal-600 hover:text-teal-800">
                &times;
              </button>
            </div>
            {analysisResult.priorities?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-teal-700">Top Priorities:</p>
                <ul className="mt-1 space-y-1">
                  {analysisResult.priorities.map((priority, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-teal-800">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-200 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {priority}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysisResult.risks?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-700">Risks/Flags:</p>
                <ul className="mt-1 space-y-1">
                  {analysisResult.risks.map((risk, idx) => (
                    <li key={idx} className="text-xs text-amber-800">• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <CardContent className="grid gap-4 md:grid-cols-2">
          {readinessItems.map((item) => {
            const aiSuggestion = analysisResult?.readiness?.[item.key];
            return (
              <div key={item.key} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  {aiSuggestion && (
                    <div className="rounded border border-teal-200 bg-teal-50 p-2 text-xs text-teal-700">
                      <span className="font-medium">AI suggests: </span>
                      <span className={`font-semibold ${
                        aiSuggestion.suggested === "complete" ? "text-green-600" :
                        aiSuggestion.suggested === "partial" ? "text-amber-600" : "text-red-600"
                      }`}>
                        {aiSuggestion.suggested}
                      </span>
                      {aiSuggestion.reason && (
                        <p className="mt-1 text-teal-600">{aiSuggestion.reason}</p>
                      )}
                    </div>
                  )}
                  <Select
                    value={assessment.readiness?.[item.key] || "missing"}
                    onValueChange={(value) => updateReadiness(item.key, value as ReadinessStatus)}
                  >
                    <SelectTrigger className="mt-2 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>{project.policyTemplates?.length || 0} requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(project.policyTemplates ?? []).map((policy) => (
              <div key={policy} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">{policy}</span>
                <Select
                  value={assessment.policies?.[policy] || "missing"}
                  onValueChange={(value) => updatePolicy(policy, value as ReadinessStatus)}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
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
          <CardHeader>
            <CardTitle>Training</CardTitle>
            <CardDescription>{project.trainingRequirements?.length || 0} modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(project.trainingRequirements ?? []).map((module) => (
              <div key={module} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">{module}</span>
                <Select
                  value={assessment.training?.[module] || "missing"}
                  onValueChange={(value) => updateTraining(module, value as TrainingStatus)}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingOptions.map((option) => (
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
          <CardHeader>
            <CardTitle>Key Persons / PSD Roles</CardTitle>
            <CardDescription>{project.smcrRoles?.length || 0} responsible persons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(project.smcrRoles ?? []).map((role) => (
              <div key={role} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">{role}</span>
                <Select
                  value={assessment.smcr?.[role] || "unassigned"}
                  onValueChange={(value) => updateSmcr(role, value as SmcrStatus)}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {smcrOptions.map((option) => (
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
      </div>
    </div>
  );
}
