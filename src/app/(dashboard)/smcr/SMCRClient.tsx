"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Award, ClipboardCheck, FileText, Shield, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmcrData } from "./context/SmcrDataContext";
import { allSMFs, certificationFunctions } from "./data/core-functions";
import { workflowTemplates } from "./data/workflow-templates";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { FirmSwitcher } from "./components/FirmSwitcher";

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

export function SMCRClient() {
  const { state, firms, activeFirmId } = useSmcrData();
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

  const totalPeople = scopedPeople.length;
  const current = scopedPeople.filter((person) => person.assessment.status === "current").length;
  const dueSoon = scopedPeople.filter((person) => person.assessment.status === "due").length;
  const overdue = scopedPeople.filter((person) => person.assessment.status === "overdue").length;
  const trainingAverage = totalPeople === 0
    ? 0
    : Math.round(
        scopedPeople.reduce((acc, person) => acc + (person.assessment.trainingCompletion ?? 0), 0) /
          totalPeople,
      );

  const totalAssessments = scopedAssessments.length;
  const assessmentsDraft = scopedAssessments.filter((assessment) => assessment.status === "draft").length;
  const assessmentsInReview = scopedAssessments.filter((assessment) => assessment.status === "in_review").length;
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

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <FirmSwitcher />
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">SM&CR Command Center</p>
            <h1 className="mt-3 text-3xl font-semibold">Orchestrate your SMF & Certification lifecycle</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Launch guided workflows, capture evidence, and keep fitness &amp; propriety obligations on schedule. Pick a
              workflow to get started or jump straight to assessments.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/smcr/workflows">
                <Button size="sm" variant="secondary">
                  Launch Workflow Hub
                </Button>
              </Link>
              <Link href="/smcr/fitness-propriety">
                <Button size="sm" variant="outline" className="bg-transparent text-white hover:bg-white/10">
                  Review Assessments
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 md:w-auto">
            {quickWorkflowTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/smcr/workflows?template=${encodeURIComponent(template.id)}`}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left transition hover:border-white/40 hover:bg-white/20"
              >
                <p className="text-xs uppercase tracking-wide text-slate-200">
                  {template.category.replace("_", " ")}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{template.title}</p>
                <p className="mt-2 text-[11px] text-slate-200/80">Duration · {template.durationDays} days</p>
                <p className="text-[11px] text-slate-200/80">Steps · {template.steps.length}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {!hasFirm ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Create your first firm above to start capturing SM&amp;CR people, workflows, and assessments.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Users} label="Total People" value={totalPeople} accent="text-sky-500" />
            <SummaryCard icon={Shield} label="SMF Assignments" value={smfRoles.length} accent="text-emerald-500" />
            <SummaryCard icon={Award} label="Certified Roles" value={cfRoles.length} accent="text-amber-500" />
            <SummaryCard icon={AlertTriangle} label="Overdue Assessments" value={overdue} accent="text-rose-500" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operational Metrics</CardTitle>
              <CardDescription>Visualise workflow throughput and training readiness.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">F&P Status Overview</CardTitle>
                <CardDescription>Track completion pipeline and training readiness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
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
                <div className="flex items-center justify-between pt-2 text-xs uppercase tracking-wide text-slate-400">
                  <span>Assessment pipeline</span>
                  <span>{totalAssessments}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Draft</span>
                  <span className="font-semibold text-slate-700">{assessmentsDraft}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">In review</span>
                  <span className="font-semibold text-slate-700">{assessmentsInReview}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-semibold text-slate-700">{assessmentsCompleted}</span>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Average Training Completion</p>
                  <p className="text-xl font-semibold text-slate-900">{trainingAverage}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                <CardTitle className="text-lg">Workflow Pulse</CardTitle>
                <CardDescription>Monitor the guided processes driving SM&CR compliance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active workflows</span>
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
                <div className="pt-3 text-xs uppercase tracking-wide text-slate-400">Top workflows</div>
                {activeWorkflows.length === 0 ? (
                  <p className="text-sm text-slate-500">No workflows running.</p>
                ) : (
                  <div className="space-y-3">
                    {activeWorkflows.slice(0, 3).map((workflow) => {
                      const totalSteps = workflow.steps.length || 1;
                      const completedSteps = workflow.steps.filter((step) => step.status === "completed").length;
                      const progress = Math.round((completedSteps / totalSteps) * 100);
                      return (
                        <div key={workflow.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">{workflow.name}</p>
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {workflow.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <Progress value={progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-slate-500">{progress}%</span>
                          </div>
                        </div>
                      );
                    })}
                    {activeWorkflows.length > 3 && (
                      <p className="text-xs text-slate-500">+ {activeWorkflows.length - 3} more running</p>
                    )}
                  </div>
                )}
                <Link href="/smcr/workflows" className="text-xs text-sky-600 hover:underline">
                  View workflows
                </Link>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Actions</CardTitle>
              <CardDescription>Shortcuts across the SM&CR workspace.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <ActionLink href="/smcr/people" label="Update F&P Records" icon={ClipboardCheck} description="Capture assessment outcomes, attach supporting evidence, and update documentation." />
              <ActionLink href="/smcr/smfs" label="Assign SMFs" icon={Shield} description="Record statements of responsibility and ensure SMF coverage." />
              <ActionLink href="/smcr/certifications" label="Manage Certification" icon={FileText} description="Track certification renewals and CPD evidence." />
              <ActionLink href="/smcr/fitness-propriety" label="Fitness & Propriety" icon={Target} description="Review detailed fitness and propriety assessments." />
              <ActionLink href="/smcr/conduct-rules" label="Conduct Rules" icon={Award} description="Monitor conduct rule attestations and breaches." />
              <ActionLink href="/smcr/workflows" label="Workflow Templates" icon={Users} description="Launch SM&CR workflow checklists and attestations." />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

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
