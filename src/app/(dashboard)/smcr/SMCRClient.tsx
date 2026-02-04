"use client";

import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Award, Check, ChevronRight, ClipboardCheck, Loader2, RefreshCw, Shield, Users, UserPlus, Play, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmcrData, type FCAVerificationData, type PersonRecord } from "./context/SmcrDataContext";
import { allSMFs, certificationFunctions } from "./data/core-functions";
import { workflowTemplates } from "./data/workflow-templates";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { FirmSwitcher } from "./components/FirmSwitcher";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { useAllMismatches } from "@/hooks/useRoleMismatchDetection";
import {
  DashboardIcon,
  PeopleIcon,
  SmfIcon,
  CertificationIcon,
  FitnessProprietyIcon,
  ConductRulesIcon,
  WorkflowsIcon,
} from "./components/SmcrIcons";

const statusClass = {
  current: "bg-emerald-100 text-emerald-800",
  due: "bg-amber-100 text-amber-800",
  overdue: "bg-rose-100 text-rose-800",
  not_required: "bg-slate-100 text-slate-600",
} as const;

type AssessmentStatusBadge = keyof typeof statusClass;

type SummaryCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  accent: string;
};

type ActionLinkProps = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

type OnboardingStep = "firm" | "person" | "role" | "workflow" | "done";

function getOnboardingStep(hasFirm: boolean, hasPeople: boolean, hasRoles: boolean, hasWorkflows: boolean): OnboardingStep {
  if (!hasFirm) return "firm";
  if (!hasPeople) return "person";
  if (!hasRoles) return "role";
  if (!hasWorkflows) return "workflow";
  return "done";
}

export function SMCRClient() {
  const { state, firms, activeFirmId, updatePerson } = useSmcrData();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [reVerifying, setReVerifying] = useState(false);
  const [reVerifyProgress, setReVerifyProgress] = useState("");
  const scopedPeople = useMemo(
    () => state.people.filter((person) => !activeFirmId || person.firmId === activeFirmId),
    [state.people, activeFirmId],
  );
  const scopedRoles = useMemo(
    () => state.roles.filter((role) => !activeFirmId || role.firmId === activeFirmId),
    [state.roles, activeFirmId],
  );
  const scopedWorkflows = useMemo(
    () => state.workflows.filter((workflow) => !activeFirmId || workflow.firmId === activeFirmId),
    [state.workflows, activeFirmId],
  );
  const scopedAssessments = useMemo(
    () => state.assessments.filter((assessment) => !activeFirmId || assessment.firmId === activeFirmId),
    [state.assessments, activeFirmId],
  );

  const smfRoles = useMemo(() => scopedRoles.filter((role) => role.functionType === "SMF"), [scopedRoles]);
  const cfRoles = useMemo(() => scopedRoles.filter((role) => role.functionType === "CF"), [scopedRoles]);

  const verificationThreshold = state.settings?.verificationStaleThresholdDays ?? 30;
  const verificationSummary = useVerificationStatus(scopedPeople, verificationThreshold);
  const mismatchResults = useAllMismatches(scopedPeople, scopedRoles);

  const abortRef = React.useRef<AbortController | null>(null);

  const handleReVerifyAllStale = useCallback(async () => {
    if (reVerifying) return;
    setReVerifying(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const stalePeopleWithIrn = verificationSummary.stalePeople.filter((p) => p.irn);
    let completed = 0;
    let failed = 0;

    for (const staleEntry of stalePeopleWithIrn) {
      if (controller.signal.aborted) break;

      const person = scopedPeople.find((p) => p.id === staleEntry.personId);
      if (!person || !person.irn) continue;

      setReVerifyProgress(`Verifying ${person.name} (${completed + 1}/${stalePeopleWithIrn.length})`);

      try {
        const response = await fetch(
          `/api/fca-register/firm/${encodeURIComponent(person.irn)}`,
          { signal: controller.signal },
        );
        if (response.ok) {
          const data = await response.json();
          const verificationData: FCAVerificationData = {
            status: data.status ?? "Unknown",
            lastChecked: new Date().toISOString(),
            controlFunctions: (data.controlFunctions ?? []).map((cf: { function?: string; firmName?: string; frn?: string; status?: string; effectiveFrom?: string; effectiveTo?: string }) => ({
              function: cf.function ?? "",
              firmName: cf.firmName ?? "",
              frn: cf.frn ?? "",
              status: cf.status ?? "",
              effectiveFrom: cf.effectiveFrom ?? "",
              effectiveTo: cf.effectiveTo,
            })),
            hasEnforcementHistory: data.hasEnforcementHistory ?? false,
          };
          await updatePerson(person.id, { fcaVerification: verificationData } as Partial<PersonRecord>);
          fetch(`/api/smcr/people/${person.id}/fca-verification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(verificationData),
          }).catch(() => {});
        } else {
          failed++;
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") break;
        failed++;
      }
      completed++;

      // Rate-limit: 500ms delay between requests to avoid hammering the FCA API
      if (completed < stalePeopleWithIrn.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const summary = controller.signal.aborted
      ? "Re-verification cancelled"
      : failed > 0
        ? `Re-verified ${completed - failed}/${stalePeopleWithIrn.length}. ${failed} failed.`
        : `Re-verified ${completed} people successfully.`;

    setReVerifyProgress(summary);
    setReVerifying(false);
    abortRef.current = null;

    // Clear summary message after a few seconds
    setTimeout(() => setReVerifyProgress(""), 4000);
  }, [reVerifying, verificationSummary.stalePeople, scopedPeople, updatePerson]);

  const handleCancelReVerify = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const totalPeople = scopedPeople.length;
  const current = scopedPeople.filter((person) => person.assessment.status === "current").length;
  const dueSoon = scopedPeople.filter((person) => person.assessment.status === "due").length;
  const overdue = scopedPeople.filter((person) => person.assessment.status === "overdue").length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trainingAverage = totalPeople === 0
    ? 0
    : Math.round(
        scopedPeople.reduce((acc, person) => acc + (person.assessment.trainingCompletion ?? 0), 0) /
          totalPeople,
      );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalAssessments = scopedAssessments.length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const assessmentsDraft = scopedAssessments.filter((assessment) => assessment.status === "draft").length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const assessmentsInReview = scopedAssessments.filter((assessment) => assessment.status === "in_review").length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const assessmentsCompleted = scopedAssessments.filter((assessment) => assessment.status === "completed").length;

  const activeWorkflows = scopedWorkflows.filter((workflow) => workflow.status !== "completed");
  const workflowsNotStarted = scopedWorkflows.filter((workflow) => workflow.status === "not_started").length;
  const workflowsInProgress = scopedWorkflows.filter((workflow) => workflow.status === "in_progress").length;
  const workflowsCompleted = scopedWorkflows.filter((workflow) => workflow.status === "completed").length;
  const quickWorkflowTemplates = workflowTemplates.slice(0, 3);

  const workflowStatusChart = [
    { name: "Not started", value: workflowsNotStarted },
    { name: "In progress", value: workflowsInProgress },
    { name: "Completed", value: workflowsCompleted },
  ];

  const trainingDistribution = [0, 25, 50, 75, 100].map((floor, index, arr) => {
    const ceiling = arr[index + 1] ?? 100;
    const count = scopedPeople.filter((person) => {
      const completion = person.assessment.trainingCompletion ?? 0;
      return index === arr.length - 1 ? completion === 100 : completion >= floor && completion < ceiling;
    }).length;
    const label = index === arr.length - 1 ? "100%" : `${floor}-${ceiling - 1}%`;
    return { name: label, value: count };
  });

  const upcomingAssessments = useMemo(() => {
    const now = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 45);

    return scopedPeople
      .map((person) => {
        const nextDate = parseDate(person.assessment.nextAssessment);
        if (!nextDate) return null;
        if (nextDate < now || nextDate > horizon) return null;
        return {
          personId: person.id,
          name: person.name,
          employeeId: person.employeeId,
          department: person.department,
          dueDate: nextDate,
          status: person.assessment.status as AssessmentStatusBadge,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.dueDate.getTime() - b!.dueDate.getTime()))
      .slice(0, 6) as Array<{
        personId: string;
        name: string;
        employeeId: string;
        department: string;
        dueDate: Date;
        status: AssessmentStatusBadge;
      }>;
  }, [scopedPeople]);

  const overdueAssessments = useMemo(() => {
    const today = new Date();
    return scopedPeople
      .map((person) => {
        const nextDate = parseDate(person.assessment.nextAssessment);
        if (person.assessment.status !== "overdue" && (!nextDate || nextDate >= today)) return null;
        return {
          personId: person.id,
          name: person.name,
          employeeId: person.employeeId,
          department: person.department,
          lastAssessment: parseDate(person.assessment.lastAssessment),
          nextAssessment: nextDate,
          status: person.assessment.status as AssessmentStatusBadge,
        };
      })
      .filter(Boolean)
      .slice(0, 6) as Array<{
        personId: string;
        name: string;
        employeeId: string;
        department: string;
        lastAssessment: Date | null;
        nextAssessment: Date | null;
        status: AssessmentStatusBadge;
      }>;
  }, [scopedPeople]);

  const smfCoverage = useMemo(() => {
    const assignmentsById = new Set(smfRoles.map((role) => role.functionId));
    return allSMFs.map((smf) => ({
      id: smf.id,
      label: `${smf.smf_number} · ${smf.title}`,
      assigned: assignmentsById.has(smf.id),
    }));
  }, [smfRoles]);

  const cfCoverage = useMemo(() => {
    const assignmentsById = new Set(cfRoles.map((role) => role.functionId));
    return certificationFunctions.map((cf) => ({
      id: cf.id,
      label: `${cf.cf_number} · ${cf.title}`,
      assigned: assignmentsById.has(cf.id),
    }));
  }, [cfRoles]);

  const hasFirm = Boolean(activeFirmId && firms.length > 0);
  const hasPeople = scopedPeople.length > 0;
  const hasRoles = scopedRoles.length > 0;
  const hasWorkflows = scopedWorkflows.length > 0;
  const onboardingStep = getOnboardingStep(hasFirm, hasPeople, hasRoles, hasWorkflows);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleWidgetClick = (filter: string, status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    router.push(`/smcr/${filter}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <DashboardIcon size={24} />
          <h1 className="text-lg font-semibold text-slate-900">Governance & People Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <FirmSwitcher />
        </div>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && onboardingStep !== "done" && (
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Getting Started with Governance & People</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOnboarding(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Dismiss
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-6">
              {["firm", "person", "role", "workflow"].map((step, index) => (
                <React.Fragment key={step}>
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      step === onboardingStep
                        ? "bg-teal-600 text-white"
                        : getOnboardingStep(hasFirm, hasPeople, hasRoles, hasWorkflows) === "done" ||
                          ["firm", "person", "role", "workflow"].indexOf(step) <
                            ["firm", "person", "role", "workflow"].indexOf(onboardingStep)
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {["firm", "person", "role", "workflow"].indexOf(step) <
                    ["firm", "person", "role", "workflow"].indexOf(onboardingStep) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 transition-colors",
                        ["firm", "person", "role", "workflow"].indexOf(step) <
                          ["firm", "person", "role", "workflow"].indexOf(onboardingStep)
                          ? "bg-teal-300"
                          : "bg-slate-200"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="space-y-3">
              {onboardingStep === "firm" && (
                <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-slate-900">Create your firm</p>
                    <p className="text-sm text-slate-500">
                      Set up your firm profile to begin managing SM&CR records
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-teal-600" />
                </div>
              )}
              {onboardingStep === "person" && (
                <Link href="/smcr/people" className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-4 hover:border-teal-400 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">Add your first person</p>
                    <p className="text-sm text-slate-500">
                      Create personnel records for individuals holding SM&CR roles
                    </p>
                  </div>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Person
                  </Button>
                </Link>
              )}
              {onboardingStep === "role" && (
                <Link href="/smcr/smfs" className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-4 hover:border-teal-400 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">Assign SMF/CF roles</p>
                    <p className="text-sm text-slate-500">
                      Assign Senior Manager or Certification Function roles to your people
                    </p>
                  </div>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Assign Roles
                  </Button>
                </Link>
              )}
              {onboardingStep === "workflow" && (
                <Link href="/smcr/workflows" className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-4 hover:border-teal-400 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">Launch onboarding workflow</p>
                    <p className="text-sm text-slate-500">
                      Start a guided workflow to complete all SM&CR requirements
                    </p>
                  </div>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Play className="h-4 w-4 mr-2" />
                    Launch Workflow
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasFirm ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Create your first firm above to start capturing SM&amp;CR people, workflows, and assessments.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ClickableSummaryCard
              icon={Users}
              label="Total People"
              value={totalPeople}
              accent="text-sky-500"
              onClick={() => router.push("/smcr/people")}
            />
            <ClickableSummaryCard
              icon={Shield}
              label="SMF Assignments"
              value={smfRoles.length}
              accent="text-emerald-500"
              onClick={() => router.push("/smcr/smfs")}
            />
            <ClickableSummaryCard
              icon={Award}
              label="Certified Roles"
              value={cfRoles.length}
              accent="text-amber-500"
              onClick={() => router.push("/smcr/certifications")}
            />
            <ClickableSummaryCard
              icon={AlertTriangle}
              label="Overdue Assessments"
              value={overdue}
              accent="text-rose-500"
              onClick={() => router.push("/smcr/fitness-propriety?status=overdue")}
            />
          </div>

          {/* FCA Verification Status Card */}
          {scopedPeople.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">FCA Verification Status</CardTitle>
                  <CardDescription className="text-xs">
                    Freshness of FCA Register verification checks (threshold: {verificationThreshold} days)
                  </CardDescription>
                </div>
                {verificationSummary.stale > 0 && (
                  <div className="flex items-center gap-2">
                    {reVerifying && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-500"
                        onClick={handleCancelReVerify}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      disabled={reVerifying}
                      onClick={handleReVerifyAllStale}
                    >
                      {reVerifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Re-verify All Stale
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {reVerifying && reVerifyProgress && (
                  <p className="text-xs text-slate-500 mb-3">{reVerifyProgress}</p>
                )}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-2xl font-bold text-emerald-700">{verificationSummary.fresh}</p>
                    <p className="text-xs text-emerald-600">Fresh</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-2xl font-bold text-amber-700">{verificationSummary.stale}</p>
                    <p className="text-xs text-amber-600">Stale</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-2xl font-bold text-slate-600">{verificationSummary.unverified}</p>
                    <p className="text-xs text-slate-500">Unverified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Mismatch Alert */}
          {mismatchResults.totalMismatches > 0 && (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  <CardTitle className="text-base text-rose-800">
                    {mismatchResults.totalMismatches} Role Mismatch{mismatchResults.totalMismatches !== 1 ? "es" : ""} Detected
                  </CardTitle>
                </div>
                <CardDescription className="text-rose-600">
                  Discrepancies between local SMF assignments and FCA Register data across {mismatchResults.peopleWithMismatches} {mismatchResults.peopleWithMismatches === 1 ? "person" : "people"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {mismatchResults.results.slice(0, 5).map((result) => (
                  <div
                    key={result.personId}
                    className="flex items-center justify-between rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">{result.personName}</span>
                    <div className="flex items-center gap-2">
                      {result.missingFromFca.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                          {result.missingFromFca.length} not on FCA
                        </Badge>
                      )}
                      {result.missingLocally.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                          {result.missingLocally.length} not local
                        </Badge>
                      )}
                      {result.statusConflicts.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
                          {result.statusConflicts.length} conflicts
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {mismatchResults.results.length > 5 && (
                  <Link href="/smcr/people" className="block text-xs text-rose-600 hover:underline pt-1">
                    View all {mismatchResults.results.length} people with mismatches →
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Launch Workflows Section */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Launch Workflows</CardTitle>
              <Link href="/smcr/workflows" className="text-sm text-sky-600 hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quickWorkflowTemplates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/smcr/workflows?template=${encodeURIComponent(template.id)}`}
                    className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {template.category.replace("_", " ")}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-teal-700">{template.title}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{template.durationDays} days</span>
                      <span>•</span>
                      <span>{template.steps.length} steps</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link href="/smcr/people">
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Person
                </Button>
              </Link>
              <Link href="/smcr/workflows">
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Launch Workflow
                </Button>
              </Link>
              <Link href="/smcr/conduct-rules">
                <Button variant="outline" size="sm" className="gap-2">
                  <Flag className="h-4 w-4" />
                  Report Breach
                </Button>
              </Link>
              <Link href="/smcr/smfs">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Assign SMF
                </Button>
              </Link>
              <Link href="/smcr/fitness-propriety">
                <Button variant="outline" size="sm" className="gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Main Content Grid - Upcoming Assessments (left) + F&P Status & Workflow Pulse (right) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">Upcoming Assessments (45 days)</CardTitle>
                  <CardDescription>
                    Workflow launch points for upcoming obligations — stay ahead of regulatory deadlines.
                  </CardDescription>
                </div>
                <Link href="/smcr/people" className="text-sm text-sky-600 hover:underline">
                  View all people
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">No assessments due in the next 45 days.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAssessments.map((item) => (
                      <div
                        key={item.personId}
                        className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.employeeId} · {item.department}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn("text-xs", statusClass[item.status])}>{item.status.replace("_", " ")}</Badge>
                          <div className="text-sm text-slate-600">Due {format(item.dueDate, "PPP")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Combined F&P Status + Workflow Pulse */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">F&P Status & Workflow Pulse</CardTitle>
                <CardDescription>Track assessments and active workflows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* F&P Status */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Assessment Status</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current</span>
                    <span className="font-semibold text-emerald-600">{current}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Due Soon</span>
                    <span className="font-semibold text-amber-500">{dueSoon}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Overdue</span>
                    <span className="font-semibold text-rose-500">{overdue}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3" />

                {/* Workflow Pulse */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workflow Status</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active</span>
                    <span className="font-semibold text-sky-600">{activeWorkflows.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">In progress</span>
                    <span className="font-semibold text-emerald-600">{workflowsInProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Completed</span>
                    <span className="font-semibold text-slate-600">{workflowsCompleted}</span>
                  </div>
                </div>

                {activeWorkflows.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 pt-3" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Top Workflows</p>
                      {activeWorkflows.slice(0, 2).map((workflow) => {
                        const totalSteps = workflow.steps.length || 1;
                        const completedSteps = workflow.steps.filter((step) => step.status === "completed").length;
                        const progress = Math.round((completedSteps / totalSteps) * 100);
                        return (
                          <div key={workflow.id} className="rounded-lg border border-slate-200 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-slate-800 truncate">{workflow.name}</p>
                              <span className="text-xs text-slate-500">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1 mt-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <Link href="/smcr/workflows" className="block text-xs text-sky-600 hover:underline pt-1">
                  View all workflows →
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Content Row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overdue or Missed Reviews</CardTitle>
                <CardDescription>Prioritise remediation before regulatory deadlines pass.</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">No overdue assessments recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {overdueAssessments.map((item) => (
                      <div key={item.personId} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-rose-800">{item.name}</p>
                            <p className="text-xs text-rose-600">{item.employeeId} · {item.department}</p>
                          </div>
                          <Badge className={cn("text-xs", statusClass[item.status])}>{item.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="mt-2 text-xs text-rose-700">
                          Last assessment: {item.lastAssessment ? format(item.lastAssessment, "PPP") : "Not captured"}
                        </p>
                        <p className="text-xs text-rose-700">
                          Next assessment: {item.nextAssessment ? format(item.nextAssessment, "PPP") : "Awaiting scheduling"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coverage Checks</CardTitle>
                <CardDescription>Ensure required functions are assigned.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Senior Management Functions</p>
                  <ul className="mt-2 space-y-1">
                    {smfCoverage.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <Badge variant="outline" className={item.assigned ? "border-emerald-300 text-emerald-700" : "border-slate-300 text-slate-600"}>
                          {item.assigned ? "Assigned" : "Unassigned"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Certification Functions</p>
                  <ul className="mt-2 space-y-1">
                    {cfCoverage.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <Badge variant="outline" className={item.assigned ? "border-emerald-300 text-emerald-700" : "border-slate-300 text-slate-600"}>
                          {item.assigned ? "Assigned" : "Unassigned"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section - Collapsible */}
          <details className="group">
            <summary className="cursor-pointer list-none">
              <Card className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Analytics</CardTitle>
                    <CardDescription className="text-xs">Workflow throughput and training readiness</CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-90" />
                </CardHeader>
              </Card>
            </summary>
            <Card className="mt-2 border-slate-200">
              <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Workflow status</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workflowStatusChart} barSize={28}>
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "rgba(148,163,184,0.15)" }} />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Training completion distribution</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trainingDistribution} barGap={8}>
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "rgba(148,163,184,0.15)" }} />
                        <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </details>

          {/* Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Actions</CardTitle>
              <CardDescription>Shortcuts across the Governance & People workspace.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <ActionLinkWithIcon href="/smcr/people" label="Update F&P Records" Icon={PeopleIcon} description="Capture assessment outcomes, attach supporting evidence, and update documentation." />
              <ActionLinkWithIcon href="/smcr/smfs" label="Assign SMFs" Icon={SmfIcon} description="Record statements of responsibility and ensure SMF coverage." />
              <ActionLinkWithIcon href="/smcr/certifications" label="Manage Certification" Icon={CertificationIcon} description="Track certification renewals and CPD evidence." />
              <ActionLinkWithIcon href="/smcr/fitness-propriety" label="Fitness & Propriety" Icon={FitnessProprietyIcon} description="Review detailed fitness and propriety assessments." />
              <ActionLinkWithIcon href="/smcr/conduct-rules" label="Conduct Rules" Icon={ConductRulesIcon} description="Monitor conduct rule attestations and breaches." />
              <ActionLinkWithIcon href="/smcr/workflows" label="Workflow Templates" Icon={WorkflowsIcon} description="Launch SM&CR workflow checklists and attestations." />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SummaryCard({ icon: Icon, label, value, accent }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <Icon className={cn("h-9 w-9", accent)} />
      </CardContent>
    </Card>
  );
}

type ClickableSummaryCardProps = SummaryCardProps & {
  onClick: () => void;
};

function ClickableSummaryCard({ icon: Icon, label, value, accent, onClick }: ClickableSummaryCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <Icon className={cn("h-9 w-9", accent)} />
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ActionLink({ href, label, description, icon: Icon }: ActionLinkProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition hover:border-sky-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-500" />
        <span className="text-sm font-semibold text-slate-900 group-hover:text-sky-600">{label}</span>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </Link>
  );
}

type ActionLinkWithIconProps = {
  href: string;
  label: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

function ActionLinkWithIcon({ href, label, description, Icon }: ActionLinkWithIconProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-sky-300 hover:shadow-sm"
    >
      <Icon size={40} className="flex-shrink-0" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-900 group-hover:text-sky-600">{label}</span>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
