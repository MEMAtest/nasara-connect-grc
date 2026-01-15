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
            <Label>Primary jurisdiction</Label>
            <Input
              value={String(assessment.basics?.primaryJurisdiction ?? "")}
              onChange={(event) => updateBasics("primaryJurisdiction", event.target.value)}
            />
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
        <CardHeader>
          <CardTitle>Readiness signals</CardTitle>
          <CardDescription>Track what is ready versus still being built.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {readinessItems.map((item) => (
            <div key={item.key} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
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
          ))}
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
            <CardTitle>SMCR roles</CardTitle>
            <CardDescription>{project.smcrRoles?.length || 0} roles</CardDescription>
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
