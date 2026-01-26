"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Download, Plus, Search, Settings, Trash2, Sparkles, PartyPopper, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { workflowTemplates, getWorkflowTemplate } from "../data/workflow-templates";
import { useSmcrData, WorkflowInstance, WorkflowDocument } from "../context/SmcrDataContext";
import { fetchDocumentBlob } from "../utils/document-storage";
import { FirmSwitcher } from "../components/FirmSwitcher";
import { WorkflowsIcon } from "../components/SmcrIcons";
import { FpChecklistTask } from "./components/FpChecklistTask";
import { ReferenceRequestTask } from "./components/ReferenceRequestTask";
import { CriminalCheckTask } from "./components/CriminalCheckTask";
import { TrainingPlanTask } from "./components/TrainingPlanTask";
import { StatementOfResponsibilitiesTask } from "./components/StatementOfResponsibilitiesTask";

interface LaunchFormState {
  ownerId: string;
  dueDate?: Date;
  customName: string;
}

const initialLaunchForm: LaunchFormState = {
  ownerId: "",
  dueDate: undefined,
  customName: "",
};

export function WorkflowsClient() {
  const {
    state,
    launchWorkflow,
    updateWorkflowStep,
    removeWorkflow,
    attachWorkflowEvidence,
    removeWorkflowEvidence,
    updateWorkflowField,
    updateWorkflowChecklist,
    updateFpChecklist,
    updateReferenceRequest,
    updateCriminalCheck,
    updateTrainingPlan,
    updateStatementOfResponsibilities,
    firms,
    activeFirmId,
  } = useSmcrData();
  const { people, workflows, workflowDocuments, roles } = state;
  const firmPeople = useMemo(() => {
    if (!activeFirmId) return [] as typeof people;
    return people.filter((person) => person.firmId === activeFirmId);
  }, [people, activeFirmId]);
  const firmRoles = useMemo(() => {
    if (!activeFirmId) return [] as typeof roles;
    return roles.filter((role) => role.firmId === activeFirmId);
  }, [roles, activeFirmId]);

  const firmWorkflows = useMemo(() => {
    if (!activeFirmId) return [] as typeof workflows;
    return workflows.filter((workflow) => workflow.firmId === activeFirmId);
  }, [workflows, activeFirmId]);

  const firmWorkflowDocuments = useMemo(() => {
    if (!activeFirmId) return [] as typeof workflowDocuments;
    return workflowDocuments.filter((doc) => doc.firmId === activeFirmId);
  }, [workflowDocuments, activeFirmId]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [launchForm, setLaunchForm] = useState<LaunchFormState>(initialLaunchForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [recentWorkflowId, setRecentWorkflowId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<{ workflowId: string; stepId: string } | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  useEffect(() => {
    setTaskError(null);
  }, [activeTask]);

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return workflowTemplates;
    const term = searchTerm.trim().toLowerCase();
    return workflowTemplates.filter((template) =>
      template.title.toLowerCase().includes(term) ||
      template.summary.toLowerCase().includes(term) ||
      template.trigger.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const sortedWorkflows = useMemo(() => (
    [...firmWorkflows].sort((a, b) => new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime())
  ), [firmWorkflows]);

  const evidenceByStep = useMemo(() => {
    const map = new Map<string, WorkflowDocument[]>();
    firmWorkflowDocuments.forEach((doc) => {
      const key = `${doc.workflowId}:${doc.stepId}`;
      const list = map.get(key) ?? [];
      list.push(doc);
      map.set(key, list);
    });
    return map;
  }, [firmWorkflowDocuments]);

  const activeTaskData = useMemo(() => {
    if (!activeTask) return null;
    const workflow = firmWorkflows.find((wf) => wf.id === activeTask.workflowId);
    if (!workflow) return null;
    const step = workflow.steps.find((s) => s.id === activeTask.stepId);
    if (!step) return null;
    const template = getWorkflowTemplate(workflow.templateId ?? "");
    const templateStep = step.templateStepId
      ? template?.steps.find((item) => item.id === step.templateStepId)
      : undefined;
    const evidence = evidenceByStep.get(`${workflow.id}:${step.id}`) ?? [];
    return { workflow, step, template, templateStep, evidence };
  }, [activeTask, firmWorkflows, evidenceByStep]);

  const activeRiskField = activeTaskData?.step.form?.find((field) => field.id === "risk-rating");
  const activeNotesField = activeTaskData?.step.form?.find((field) => field.id === "notes");
  const isFpChecklistTask = Boolean(activeTaskData?.step.fpChecklist);
  const referenceRequestDraft = activeTaskData?.step.referenceRequest;
  const criminalCheckDraft = activeTaskData?.step.criminalCheck;
  const trainingPlanDraft = activeTaskData?.step.trainingPlan;
  const statementOfResponsibilitiesDraft = activeTaskData?.step.statementOfResponsibilities;

  const hasFirm = Boolean(activeFirmId && firms.length > 0);
  const hasPeople = firmPeople.length > 0;

  useEffect(() => {
    const template = searchParams.get("template");
    if (!template) return;
    if (!getWorkflowTemplate(template)) return;

    if (!hasFirm || !hasPeople) {
      router.replace("/smcr/workflows", { scroll: false });
      return;
    }

    setSelectedTemplateId(template);
    setLaunchForm(initialLaunchForm);
    setLaunchError(null);
    setLaunchDialogOpen(true);
    setFeedback(null);

    router.replace("/smcr/workflows", { scroll: false });
  }, [searchParams, router, hasFirm, hasPeople]);

  const handleUseTemplate = (templateId: string) => {
    if (!hasPeople) {
      router.push("/smcr/people");
      return;
    }
    setSelectedTemplateId(templateId);
    setLaunchForm(initialLaunchForm);
    setLaunchError(null);
    setLaunchDialogOpen(true);
  };

  const handleLaunchWorkflow = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTemplateId) return;
    if (!launchForm.ownerId) {
      setLaunchError("Select an owner before launching this workflow.");
      return;
    }
    setLaunchError(null);
    const created = launchWorkflow({
      templateId: selectedTemplateId,
      ownerPersonId: launchForm.ownerId,
      dueDate: launchForm.dueDate ? new Date(launchForm.dueDate).toISOString() : undefined,
      customName: launchForm.customName || undefined,
    });

    setFeedback(`${created.name} workflow launched with ${created.steps.length} steps.`);
    setRecentWorkflowId(created.id);
    setLaunchDialogOpen(false);
    setLaunchForm(initialLaunchForm);
  };

  const handleToggleStep = (workflow: WorkflowInstance, stepId: string, completed: boolean) => {
    updateWorkflowStep({
      workflowId: workflow.id,
      stepId,
      status: completed ? "completed" : "pending",
    });
  };

  const handleExportWorkflow = (workflow: WorkflowInstance) => {
    // Generate a readable HTML report instead of raw JSON
    const completedSteps = workflow.steps.filter((s) => s.status === "completed").length;
    const totalSteps = workflow.steps.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${workflow.name} - Workflow Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; }
    .meta { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .meta p { margin: 5px 0; }
    .progress { background: #e2e8f0; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
    .progress-bar { background: #10b981; height: 100%; transition: width 0.3s; }
    .step { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .step.completed { border-color: #10b981; background: #f0fdf4; }
    .step-header { display: flex; justify-content: space-between; align-items: center; }
    .step-title { font-weight: 600; font-size: 16px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge.completed { background: #dcfce7; color: #166534; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .step-content { margin-top: 10px; font-size: 14px; color: #64748b; }
    .notes { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px; margin-top: 10px; font-size: 13px; }
    .checklist { margin-top: 10px; }
    .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 13px; margin: 5px 0; }
    .checklist-item.done { color: #166534; }
    .checklist-item.pending { color: #64748b; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { margin: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${workflow.name}</h1>

  <div class="meta">
    <p><strong>Status:</strong> ${workflow.status.replace("_", " ").toUpperCase()}</p>
    <p><strong>Owner:</strong> ${workflow.ownerName || "Not assigned"}</p>
    <p><strong>Launched:</strong> ${format(new Date(workflow.launchedAt), "PPP")}</p>
    ${workflow.dueDate ? `<p><strong>Due Date:</strong> ${format(new Date(workflow.dueDate), "PPP")}</p>` : ""}
    <p><strong>Progress:</strong> ${completedSteps} of ${totalSteps} steps completed (${progress}%)</p>
    <div class="progress"><div class="progress-bar" style="width: ${progress}%"></div></div>
  </div>

  <h2>Workflow Steps</h2>
  ${workflow.steps.map((step, index) => `
    <div class="step ${step.status === "completed" ? "completed" : ""}">
      <div class="step-header">
        <span class="step-title">${index + 1}. ${step.title}</span>
        <span class="badge ${step.status}">${step.status === "completed" ? "Completed" : "Pending"}</span>
      </div>
      ${step.description ? `<div class="step-content">${step.description}</div>` : ""}
      ${step.notes ? `<div class="notes"><strong>Notes:</strong> ${step.notes}</div>` : ""}
      ${step.checklist && step.checklist.length > 0 ? `
        <div class="checklist">
          <strong>Checklist:</strong>
          ${step.checklist.map((item) => `
            <div class="checklist-item ${item.completed ? "done" : "pending"}">
              ${item.completed ? "✓" : "○"} ${item.text}
            </div>
          `).join("")}
        </div>
      ` : ""}
      ${step.form && step.form.length > 0 ? `
        <div style="margin-top: 10px; font-size: 13px;">
          ${step.form.filter((f) => f.value).map((field) => `
            <p><strong>${field.label}:</strong> ${field.value}</p>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `).join("")}

  <div class="footer">
    <p>Generated on ${format(new Date(), "PPP 'at' p")}</p>
    <p>SM&CR Workflow Report - Nasara Connect</p>
  </div>

  <script class="no-print">
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}-workflow-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEvidenceUpload = async (files: FileList | null) => {
    if (!files || !activeTask) return;
    for (const file of Array.from(files)) {
      await attachWorkflowEvidence(activeTask.workflowId, activeTask.stepId, file);
    }
  };

  const handleEvidenceDownload = async (workflowDoc: WorkflowDocument) => {
    const blob = await fetchDocumentBlob(workflowDoc.id);
    if (!blob) {
      window.alert("The selected document could not be retrieved.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = workflowDoc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpdateTaskNotes = (notes: string) => {
    if (!activeTask) return;
    updateWorkflowStep({
      workflowId: activeTask.workflowId,
      stepId: activeTask.stepId,
      notes,
    });
  };

  const handleUpdateTaskStatus = (status: "pending" | "completed") => {
    if (!activeTask) return;
    updateWorkflowStep({
      workflowId: activeTask.workflowId,
      stepId: activeTask.stepId,
      status,
    });
  };

  const isStepValid = (step: WorkflowInstance["steps"][number]) => {
    const fieldsValid = (step.form ?? []).every((field) => {
      if (!field.required) return true;
      if (field.type === "boolean") return field.value === true;
      if (typeof field.value === "string") return field.value.trim().length > 0;
      return field.value !== null;
    });
    const checklistValid = (step.checklist ?? []).every((item) => item.completed);
    if (step.fpChecklist) {
      const hasSubject = Boolean(step.fpChecklist.subjectPersonId);
      const hasAssignedResponsibility =
        step.fpChecklist.smfMappings.some((mapping) => mapping.assigned) ||
        step.fpChecklist.prescribedMappings.some((mapping) => mapping.assigned);
      return fieldsValid && checklistValid && hasSubject && hasAssignedResponsibility;
    }
    if (step.referenceRequest) {
      const hasSubject = Boolean(step.referenceRequest.subjectPersonId);
      const hasEntries = step.referenceRequest.entries.length > 0;
      return fieldsValid && checklistValid && hasSubject && hasEntries;
    }
    if (step.criminalCheck) {
      const hasSubject = Boolean(step.criminalCheck.subjectPersonId);
      const hasProvider = Boolean(step.criminalCheck.provider && step.criminalCheck.provider.trim().length > 0);
      const hasStatus = step.criminalCheck.status !== "not_requested";
      return fieldsValid && checklistValid && hasSubject && hasProvider && hasStatus;
    }
    if (step.trainingPlan) {
      const hasSubject = Boolean(step.trainingPlan.subjectPersonId);
      const hasItems = step.trainingPlan.items.length > 0;
      return fieldsValid && checklistValid && hasSubject && hasItems;
    }
    if (step.statementOfResponsibilities) {
      const hasSubject = Boolean(step.statementOfResponsibilities.subjectPersonId);
      const hasConfirmed = step.statementOfResponsibilities.responsibilities.some((item) => item.confirmed);
      return fieldsValid && checklistValid && hasSubject && hasConfirmed;
    }
    return fieldsValid && checklistValid;
  };

  const handleCompleteTask = () => {
    if (!activeTaskData) return;
    if (!isStepValid(activeTaskData.step)) {
      setTaskError("Complete all required fields and checklist items before marking this task complete.");
      return;
    }
    setTaskError(null);
    handleUpdateTaskStatus("completed");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <WorkflowsIcon size={48} />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Workflow Management</h1>
            <p className="text-slate-600 mt-1">Automate SM&amp;CR processes and track evidence for every appointment.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FirmSwitcher />
          {hasFirm && (
            <Button
              variant={hasPeople ? "default" : "outline"}
              onClick={() => {
                if (!hasPeople) {
                  router.push("/smcr/people");
                  return;
                }
                document.getElementById("workflow-templates")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> {hasPeople ? "Browse templates" : "Add first person"}
            </Button>
          )}
        </div>
      </div>

      {!hasFirm ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            Create or select a firm to start tracking SM&amp;CR workflows. Each firm maintains its own task history and evidence.
          </CardContent>
        </Card>
      ) : (
        <>
      {!hasPeople ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-sm text-amber-900">
            <p className="font-semibold">Setup required</p>
            <p className="mt-1 text-amber-800">
              Add at least one person to act as workflow owner before launching templates.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => router.push("/smcr/people")}>
                Add first person
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card id="workflow-templates">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search workflow templates..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-500" />
                {template.title}
              </CardTitle>
              <CardDescription>{template.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Suggested duration</span>
                <Badge variant="outline">{template.durationDays} days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Steps</span>
                <span>{template.steps.length}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-500">Trigger</span>
                <p>{template.trigger}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => handleUseTemplate(template.id)}>
                <Plus className="h-4 w-4 mr-2" />
                {hasPeople ? "Use Template" : "Add owner to launch"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>Track workflow progress, open tasks, and attach supporting evidence.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedWorkflows.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              <Settings className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              No workflows launched yet. Select a template to get started.
            </div>
          ) : (
            sortedWorkflows.map((workflow) => {
              const totalSteps = workflow.steps.length;
              const completedSteps = workflow.steps.filter((step) => step.status === "completed").length;
              const progress = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
              const isComplete = workflow.status === "completed";

              return (
                <Card
                  key={workflow.id}
                  className={cn(
                    "border transition-all duration-500",
                    workflow.id === recentWorkflowId && "border-emerald-300",
                    isComplete && "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50"
                  )}
                >
                  {isComplete && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PartyPopper className="h-5 w-5 animate-bounce" />
                        <span className="font-semibold">Workflow Complete!</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => handleExportWorkflow(workflow)}>
                          <Download className="h-4 w-4 mr-1" />
                          Export Evidence
                        </Button>
                      </div>
                    </div>
                  )}
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                          {isComplete && <Sparkles className="h-5 w-5 text-emerald-500" />}
                          {workflow.name}
                          {workflow.id === recentWorkflowId && !isComplete && (
                            <Badge variant="secondary" className="text-[10px] uppercase">New</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Launched {format(new Date(workflow.launchedAt), "PPP")} · {workflow.steps.length} steps
                        </CardDescription>
                      </div>
                      {!isComplete && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleExportWorkflow(workflow)} aria-label="Export workflow">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeWorkflow(workflow.id)} aria-label="Remove workflow">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress
                          value={progress}
                          className={cn(
                            "h-2 transition-all duration-500",
                            isComplete && "[&>div]:bg-emerald-500"
                          )}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        isComplete ? "text-emerald-600" : "text-slate-500"
                      )}>
                        {completedSteps}/{totalSteps} steps ({progress}%)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {workflow.ownerName && (
                        <span>Owner: {workflow.ownerName}</span>
                      )}
                      {workflow.dueDate && (
                        <span>Due {format(new Date(workflow.dueDate), "PPP")}</span>
                      )}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase",
                          workflow.status === "completed" && "border-emerald-300 bg-emerald-100 text-emerald-700",
                          workflow.status === "in_progress" && "border-sky-300 bg-sky-100 text-sky-700",
                          workflow.status === "not_started" && "border-slate-300 bg-slate-100 text-slate-600"
                        )}
                      >
                        {workflow.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workflow.steps.map((step, stepIndex) => {
                      const template = getWorkflowTemplate(workflow.templateId ?? "");
                      const templateStep = step.templateStepId
                        ? template?.steps.find((item) => item.id === step.templateStepId)
                        : undefined;
                      const evidence = evidenceByStep.get(`${workflow.id}:${step.id}`) ?? [];
                      const isStepComplete = step.status === "completed";
                      const isPreviousComplete = stepIndex === 0 || workflow.steps[stepIndex - 1].status === "completed";
                      const isInProgress = !isStepComplete && isPreviousComplete;

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "rounded-lg border px-4 py-3 transition-all duration-300",
                            isStepComplete && "border-emerald-300 bg-emerald-50",
                            isInProgress && "border-sky-300 bg-sky-50",
                            !isStepComplete && !isInProgress && "border-slate-200 bg-slate-50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                                  isStepComplete && "bg-emerald-500 text-white",
                                  isInProgress && "bg-sky-500 text-white",
                                  !isStepComplete && !isInProgress && "bg-slate-300 text-slate-600"
                                )}>
                                  {isStepComplete ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    stepIndex + 1
                                  )}
                                </div>
                                <p className={cn(
                                  "font-medium text-sm",
                                  isStepComplete && "text-emerald-800",
                                  isInProgress && "text-sky-800",
                                  !isStepComplete && !isInProgress && "text-slate-600"
                                )}>
                                  {step.title}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] uppercase",
                                    isStepComplete && "border-emerald-300 bg-emerald-100 text-emerald-700",
                                    isInProgress && "border-sky-300 bg-sky-100 text-sky-700",
                                    !isStepComplete && !isInProgress && "border-slate-300 bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {isStepComplete ? "Completed" : isInProgress ? "In Progress" : "Pending"}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 ml-8">{step.description || templateStep?.description}</p>
                              {templateStep?.expectedEvidence?.length ? (
                                <p className="mt-1 text-[11px] text-slate-500 ml-8">
                                  <span className="font-medium">Evidence required:</span> {templateStep.expectedEvidence.join(", ")}
                                </p>
                              ) : null}
                              {step.notes && (
                                <p className="mt-1 text-[11px] text-slate-500 ml-8">
                                  <span className="font-medium">Notes:</span> {step.notes}
                                </p>
                              )}
                              {evidence.length > 0 && (
                                <p className="mt-1 text-[11px] text-emerald-600 ml-8 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {evidence.length} evidence file(s) attached
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isStepComplete}
                                onCheckedChange={(value) => handleToggleStep(workflow, step.id, Boolean(value))}
                                className={cn(
                                  "transition-all duration-300",
                                  isStepComplete && "border-emerald-500 bg-emerald-500 text-white"
                                )}
                              />
                              <Button
                                size="sm"
                                variant={isInProgress ? "default" : "outline"}
                                onClick={() => setActiveTask({ workflowId: workflow.id, stepId: step.id })}
                                className={cn(
                                  isInProgress && "bg-sky-600 hover:bg-sky-700"
                                )}
                              >
                                {isInProgress ? (
                                  <>
                                    <ChevronRight className="h-4 w-4 mr-1" />
                                    Work on Task
                                  </>
                                ) : (
                                  "Open Task"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={launchDialogOpen} onOpenChange={setLaunchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Launch Workflow</DialogTitle>
            <DialogDescription>
              Configure owner and due date for <span className="font-semibold">{getWorkflowTemplate(selectedTemplateId ?? "")?.title ?? "the selected template"}</span>.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplateId && (
            <form onSubmit={handleLaunchWorkflow} className="space-y-5">
              <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
                <p>{getWorkflowTemplate(selectedTemplateId)?.summary}</p>
                <p className="mt-2 text-xs text-slate-500">Trigger: {getWorkflowTemplate(selectedTemplateId)?.trigger}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    placeholder={getWorkflowTemplate(selectedTemplateId)?.title}
                    value={launchForm.customName}
                    onChange={(event) => setLaunchForm((prev) => ({ ...prev, customName: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-owner">Owner</Label>
                  <select
                    id="workflow-owner"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    value={launchForm.ownerId}
                    onChange={(event) => {
                      setLaunchError(null);
                      setLaunchForm((prev) => ({ ...prev, ownerId: event.target.value }));
                    }}
                  >
                    <option value="" disabled>
                      Select owner
                    </option>
                    {firmPeople.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.employeeId})
                      </option>
                    ))}
                  </select>
                  {launchError && <p className="mt-2 text-xs text-rose-600">{launchError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DatePickerField
                  label="Target Completion"
                  placeholder="Select due date"
                  value={launchForm.dueDate}
                  onChange={(date) => setLaunchForm((prev) => ({ ...prev, dueDate: date }))}
                />
                <div>
                  <Label className="text-sm text-slate-700">Steps included</Label>
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    {(getWorkflowTemplate(selectedTemplateId)?.steps ?? []).map((step) => (
                      <div key={step.id} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                        <span>{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setLaunchDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!launchForm.ownerId}>
                  Launch Workflow
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeTaskData)} onOpenChange={(open) => !open && setActiveTask(null)}>
        {activeTaskData && (
          <DialogContent className="sm:max-w-4xl overflow-hidden p-0" showCloseButton>
            <div className="flex h-[90vh] flex-col">
              <DialogHeader className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Workflow Task</p>
                    <DialogTitle className="text-xl font-semibold text-slate-900">{activeTaskData.step.title}</DialogTitle>
                    <p className="text-xs text-slate-500">{activeTaskData.workflow.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[11px] uppercase">
                    {activeTaskData.step.status}
                  </Badge>
                </div>
                {(activeTaskData.templateStep?.description || activeTaskData.step.description) && (
                  <DialogDescription className="text-sm text-slate-600">
                    {activeTaskData.templateStep?.description || activeTaskData.step.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto px-6 py-5 space-y-5 text-sm">
                  {activeTaskData.templateStep?.expectedEvidence?.length ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">Expected evidence</p>
                      <ul className="mt-1 list-disc pl-4 space-y-1">
                        {activeTaskData.templateStep.expectedEvidence.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {isFpChecklistTask && activeTaskData.step.fpChecklist ? (
                    <FpChecklistTask
                      draft={activeTaskData.step.fpChecklist}
                      people={firmPeople}
                      roles={firmRoles}
                      onUpdateDraft={(updater) =>
                        updateFpChecklist({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          updater,
                        })
                      }
                      riskValue={typeof activeRiskField?.value === "string" ? activeRiskField.value : ""}
                      onRiskChange={(value) =>
                        updateWorkflowField({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          fieldId: activeRiskField?.id ?? "risk-rating",
                          value,
                        })
                      }
                      notesValue={typeof activeNotesField?.value === "string" ? activeNotesField.value : ""}
                      onNotesChange={(value) =>
                        updateWorkflowField({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          fieldId: activeNotesField?.id ?? "notes",
                          value,
                        })
                      }
                    />
                  ) : referenceRequestDraft ? (
                    <ReferenceRequestTask
                      draft={referenceRequestDraft}
                      people={firmPeople}
                      onUpdateDraft={(updater) =>
                        updateReferenceRequest({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          updater,
                        })
                      }
                    />
                  ) : criminalCheckDraft ? (
                    <CriminalCheckTask
                      draft={criminalCheckDraft}
                      people={firmPeople}
                      onUpdateDraft={(updater) =>
                        updateCriminalCheck({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          updater,
                        })
                      }
                    />
                  ) : trainingPlanDraft ? (
                    <TrainingPlanTask
                      draft={trainingPlanDraft}
                      people={firmPeople}
                      roles={firmRoles}
                      onUpdateDraft={(updater) =>
                        updateTrainingPlan({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          updater,
                        })
                      }
                    />
                  ) : statementOfResponsibilitiesDraft ? (
                    <StatementOfResponsibilitiesTask
                      draft={statementOfResponsibilitiesDraft}
                      people={firmPeople}
                      roles={firmRoles}
                      onUpdateDraft={(updater) =>
                        updateStatementOfResponsibilities({
                          workflowId: activeTaskData.workflow.id,
                          stepId: activeTaskData.step.id,
                          updater,
                        })
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {activeTaskData.step.form && activeTaskData.step.form.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-700">Task details</p>
                          {activeTaskData.step.form.map((field) => (
                            <div key={field.id} className="space-y-1 text-sm">
                              <Label className="flex items-center gap-1 text-xs text-slate-500">
                                {field.label}
                                {field.required && <span className="text-rose-500">*</span>}
                              </Label>
                              {field.type === "text" && (
                                <Input
                                  value={(field.value as string) ?? ""}
                                  onChange={(event) =>
                                    updateWorkflowField({
                                      workflowId: activeTaskData.workflow.id,
                                      stepId: activeTaskData.step.id,
                                      fieldId: field.id,
                                      value: event.target.value,
                                    })
                                  }
                                  placeholder={field.helperText}
                                />
                              )}
                              {field.type === "textarea" && (
                                <Textarea
                                  rows={3}
                                  value={(field.value as string) ?? ""}
                                  onChange={(event) =>
                                    updateWorkflowField({
                                      workflowId: activeTaskData.workflow.id,
                                      stepId: activeTaskData.step.id,
                                      fieldId: field.id,
                                      value: event.target.value,
                                    })
                                  }
                                  placeholder={field.helperText}
                                />
                              )}
                              {field.type === "date" && (
                                <DatePickerField
                                  label=""
                                  placeholder="Select date"
                                  value={typeof field.value === "string" && field.value ? new Date(field.value) : undefined}
                                  onChange={(date) =>
                                    updateWorkflowField({
                                      workflowId: activeTaskData.workflow.id,
                                      stepId: activeTaskData.step.id,
                                      fieldId: field.id,
                                      value: date ? date.toISOString() : "",
                                    })
                                  }
                                />
                              )}
                              {field.type === "select" && (
                                <Select
                                  value={(field.value as string) ?? ""}
                                  onValueChange={(value) =>
                                    updateWorkflowField({
                                      workflowId: activeTaskData.workflow.id,
                                      stepId: activeTaskData.step.id,
                                      fieldId: field.id,
                                      value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(field.options ?? []).map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {field.type === "boolean" && (
                                <div className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                                  <Checkbox
                                    checked={Boolean(field.value)}
                                    onCheckedChange={(checked) =>
                                      updateWorkflowField({
                                        workflowId: activeTaskData.workflow.id,
                                        stepId: activeTaskData.step.id,
                                        fieldId: field.id,
                                        value: Boolean(checked),
                                      })
                                    }
                                  />
                                  <span>{field.helperText || "Confirm"}</span>
                                </div>
                              )}
                              {field.helperText && field.type !== "boolean" && (
                                <p className="text-[11px] text-slate-500">{field.helperText}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTaskData.step.checklist && activeTaskData.step.checklist.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-700">Checklist</p>
                          <div className="space-y-2">
                            {activeTaskData.step.checklist.map((item) => (
                              <label key={item.id} className="flex items-start gap-2 text-sm text-slate-600">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={(checked) =>
                                    updateWorkflowChecklist({
                                      workflowId: activeTaskData.workflow.id,
                                      stepId: activeTaskData.step.id,
                                      checklistId: item.id,
                                      completed: Boolean(checked),
                                    })
                                  }
                                />
                                <span>{item.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 space-y-5">
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div>
                    <Label className="text-xs text-slate-500">Task status</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={activeTaskData.step.status === "pending" ? "default" : "outline"}
                        onClick={() => handleUpdateTaskStatus("pending")}
                      >
                        Pending
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={activeTaskData.step.status === "completed" ? "default" : "outline"}
                        onClick={handleCompleteTask}
                      >
                        Completed
                      </Button>
                    </div>
                    {taskError && <p className="mt-2 text-xs text-rose-600">{taskError}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Task notes</Label>
                    <Textarea
                      className="mt-2"
                      rows={4}
                      value={activeTaskData.step.notes ?? ""}
                      onChange={(event) => handleUpdateTaskNotes(event.target.value)}
                      placeholder="Log who you contacted, key decisions, and follow-up actions."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Evidence upload</p>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => handleEvidenceUpload(event.target.files)}
                        multiple
                      />
                      <Download className="h-3.5 w-3.5" />
                      Add files
                    </label>
                  </div>
                  {activeTaskData.evidence.length === 0 ? (
                    <p className="text-xs text-slate-500">No evidence uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeTaskData.evidence.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{doc.name}</p>
                            <p className="text-slate-500">
                              {Math.round(doc.size / 1024)} KB · Uploaded {format(new Date(doc.uploadedAt), "PPP")}
                            </p>
                            <p className="text-[11px] text-slate-500">{doc.summary}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEvidenceDownload(doc)} aria-label="Download evidence">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => removeWorkflowEvidence(doc.id)} aria-label="Remove evidence">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
        </>
      )}
    </div>
  );
}

type DatePickerFieldProps = {
  label: string;
  placeholder: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

function DatePickerField({ label, placeholder, value, onChange }: DatePickerFieldProps) {
  return (
    <div>
      {label && <Label className="text-sm text-slate-700">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-slate-400")}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}
