"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardCheck,
  Calendar as CalendarIcon,
  Download,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSmcrData,
  FitnessAssessmentRecord,
  FitnessAssessmentStatus,
  FitnessBooleanAnswer,
} from "../context/SmcrDataContext";
import { fitnessQuestionGroups } from "../data/fitness-framework";

interface StartAssessmentForm {
  personId: string;
  assessmentDate?: Date;
  nextDueDate?: Date;
  reviewer: string;
}

interface StatusDraft {
  overallDetermination: FitnessAssessmentRecord["overallDetermination"];
  reviewer: string;
  assessmentDate?: Date;
  nextDueDate?: Date;
  conditions: string;
}

const initialStartForm: StartAssessmentForm = {
  personId: "",
  assessmentDate: undefined,
  nextDueDate: undefined,
  reviewer: "",
};

const initialStatusDraft: StatusDraft = {
  overallDetermination: "Fit and Proper",
  reviewer: "",
  assessmentDate: undefined,
  nextDueDate: undefined,
  conditions: "",
};

const booleanOptions: { label: string; value: FitnessBooleanAnswer }[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not applicable", value: "not_applicable" },
];

function toISO(date?: Date) {
  return date ? new Date(date).toISOString() : undefined;
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function exportJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function FitnessProprietyClient() {
  const {
    state,
    startAssessment,
    updateAssessmentResponse,
    updateAssessmentStatus,
    removeAssessment,
  } = useSmcrData();
  const { people, assessments } = state;

  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [startForm, setStartForm] = useState<StartAssessmentForm>(initialStartForm);
  const [detailAssessmentId, setDetailAssessmentId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<StatusDraft>(initialStatusDraft);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeAssessment = detailAssessmentId
    ? assessments.find((assessment) => assessment.id === detailAssessmentId) ?? null
    : null;

  useEffect(() => {
    if (activeAssessment) {
      setStatusDraft({
        overallDetermination: activeAssessment.overallDetermination ?? "Fit and Proper",
        reviewer: activeAssessment.reviewer ?? "",
        assessmentDate: parseDate(activeAssessment.assessmentDate),
        nextDueDate: parseDate(activeAssessment.nextDueDate),
        conditions: activeAssessment.conditions?.join("\n") ?? "",
      });
    }
  }, [activeAssessment]);

  const stats = useMemo(() => {
    const total = assessments.length;
    const draft = assessments.filter((assessment) => assessment.status === "draft").length;
    const review = assessments.filter((assessment) => assessment.status === "in_review").length;
    const completed = assessments.filter((assessment) => assessment.status === "completed").length;
    return { total, draft, review, completed };
  }, [assessments]);

  const groupedAssessments = useMemo(() => {
    const grouped: Record<FitnessAssessmentStatus, FitnessAssessmentRecord[]> = {
      draft: [],
      in_review: [],
      completed: [],
    };
    assessments.forEach((assessment) => {
      grouped[assessment.status].push(assessment);
    });
    return grouped;
  }, [assessments]);

  const handleStartAssessment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startForm.personId) return;
    const created = startAssessment({
      personId: startForm.personId,
      assessmentDate: toISO(startForm.assessmentDate),
      nextDueDate: toISO(startForm.nextDueDate),
      reviewer: startForm.reviewer || undefined,
    });
    setFeedback(`Assessment created for ${created.personName}.`);
    setStartDialogOpen(false);
    setStartForm(initialStartForm);
    setDetailAssessmentId(created.id);
  };

  const handleExportAll = () => {
    exportJson("fitness-assessments.json", assessments);
  };

  const handleExportAssessment = (assessment: FitnessAssessmentRecord) => {
    exportJson(`${assessment.personName.replace(/\s+/g, "-").toLowerCase()}-assessment.json`, assessment);
  };

  const handleMarkStatus = (status: FitnessAssessmentStatus) => {
    if (!activeAssessment) return;
    updateAssessmentStatus({
      assessmentId: activeAssessment.id,
      status,
      overallDetermination: statusDraft.overallDetermination,
      conditions: statusDraft.conditions
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean),
      assessmentDate: toISO(statusDraft.assessmentDate),
      nextDueDate: toISO(statusDraft.nextDueDate),
      reviewer: statusDraft.reviewer || undefined,
    });
    if (status === "completed") {
      setFeedback(`Assessment for ${activeAssessment.personName} marked complete.`);
    } else if (status === "in_review") {
      setFeedback(`Assessment for ${activeAssessment.personName} moved to review.`);
    }
  };

  const handleRemoveAssessment = (assessmentId: string) => {
    if (!window.confirm("Remove this assessment record?")) return;
    removeAssessment(assessmentId);
    if (detailAssessmentId === assessmentId) {
      setDetailAssessmentId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Fitness &amp; Propriety Assessments</h1>
          <p className="text-slate-600 mt-1">Track and document SM&amp;CR fitness determinations with evidence-backed questions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button>
          <Button onClick={() => setStartDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Start Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard icon={Shield} label="Total Assessments" value={stats.total} accent="text-sky-500" />
        <SummaryCard icon={ClipboardCheck} label="Draft" value={stats.draft} accent="text-amber-500" />
        <SummaryCard icon={AlertTriangle} label="In Review" value={stats.review} accent="text-orange-500" />
        <SummaryCard icon={CheckCircle} label="Completed" value={stats.completed} accent="text-emerald-500" />
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {((Object.keys(groupedAssessments) as FitnessAssessmentStatus[])).map((status) => (
          <Card key={status} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {status.replace("_", " ")}
                <Badge variant="outline" className="ml-2 text-xs">
                  {groupedAssessments[status].length}
                </Badge>
              </CardTitle>
              <CardDescription>
                {status === "draft" && "Assessments awaiting initial completion."}
                {status === "in_review" && "Assessments under certification review."}
                {status === "completed" && "Closed assessments with final determination."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedAssessments[status].length === 0 ? (
                <p className="text-sm text-slate-500">No records in this status.</p>
              ) : (
                groupedAssessments[status].map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => setDetailAssessmentId(assessment.id)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-sky-300 hover:shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{assessment.personName}</p>
                        <p className="text-xs text-slate-500">{assessment.personRole ?? "Role not captured"}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {assessment.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <span>Assessment: {assessment.assessmentDate ? format(new Date(assessment.assessmentDate), "PPP") : "TBC"}</span>
                      <span>Next due: {assessment.nextDueDate ? format(new Date(assessment.nextDueDate), "PPP") : "Not set"}</span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start Fitness &amp; Propriety Assessment</DialogTitle>
            <DialogDescription>Select a person and capture key scheduling details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStartAssessment} className="space-y-4">
            <div>
              <Label htmlFor="person">Person *</Label>
              <Select
                value={startForm.personId}
                onValueChange={(value) => setStartForm((prev) => ({ ...prev, personId: value }))}
                disabled={people.length === 0}
              >
                <SelectTrigger id="person">
                  <SelectValue placeholder="Select individual" />
                </SelectTrigger>
                <SelectContent>
                  {people.length === 0 ? (
                    <SelectItem value="__no_people__" disabled>
                      No people available
                    </SelectItem>
                  ) : (
                    people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} ({person.employeeId})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DatePickerField
                label="Assessment Date"
                placeholder="Select date"
                value={startForm.assessmentDate}
                onChange={(date) => setStartForm((prev) => ({ ...prev, assessmentDate: date }))}
              />
              <DatePickerField
                label="Next Due Date"
                placeholder="Select date"
                value={startForm.nextDueDate}
                onChange={(date) => setStartForm((prev) => ({ ...prev, nextDueDate: date }))}
              />
            </div>
            <div>
              <Label htmlFor="reviewer">Reviewer</Label>
              <Input
                id="reviewer"
                placeholder="Certification officer"
                value={startForm.reviewer}
                onChange={(event) => setStartForm((prev) => ({ ...prev, reviewer: event.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStartDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!startForm.personId}>
                Start Assessment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeAssessment)} onOpenChange={(open) => !open && setDetailAssessmentId(null)}>
        <DialogContent className="max-w-4xl">
          {activeAssessment && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm text-slate-500">Fitness &amp; Propriety Assessment</span>
                    <p className="text-xl font-semibold text-slate-900">{activeAssessment.personName}</p>
                    <p className="text-xs text-slate-500">{activeAssessment.personRole ?? "Role not captured"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs uppercase">
                      {activeAssessment.status.replace("_", " ")}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleExportAssessment(activeAssessment)}>
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRemoveAssessment(activeAssessment.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Update responses across each assessment pillar and record the final determination.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue={fitnessQuestionGroups[0].id} className="space-y-4">
                <TabsList>
                  {fitnessQuestionGroups.map((group) => (
                    <TabsTrigger key={group.id} value={group.id} className="text-xs">
                      {group.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fitnessQuestionGroups.map((group) => (
                  <TabsContent key={group.id} value={group.id} className="space-y-3">
                    <p className="text-sm text-slate-500">{group.description}</p>
                    {group.questions.map((question) => {
                      const response = activeAssessment.responses.find((item) => item.questionId === question.id);
                      const value = response?.value ?? (question.type === "text" ? "" : null);
                      const notes = response?.notes ?? "";
                      return (
                        <div key={question.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{question.prompt}</p>
                              {question.guidance && (
                                <p className="mt-1 text-xs text-slate-500">{question.guidance}</p>
                              )}
                            </div>
                            {question.type === "boolean" ? (
                              <Select
                                value={typeof value === "string" ? value : ""}
                                onValueChange={(selected) =>
                                  updateAssessmentResponse({
                                    assessmentId: activeAssessment.id,
                                    questionId: question.id,
                                    value: selected as FitnessBooleanAnswer,
                                    notes,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {booleanOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Textarea
                                value={typeof value === "string" ? value : ""}
                                onChange={(event) =>
                                  updateAssessmentResponse({
                                    assessmentId: activeAssessment.id,
                                    questionId: question.id,
                                    value: event.target.value,
                                    notes,
                                  })
                                }
                                rows={3}
                                placeholder="Enter assessment summary"
                              />
                            )}
                          </div>
                          {(question.type === "boolean" && question.followUpPrompt) && (
                            <div className="mt-3">
                              <Label className="text-xs text-slate-500">{question.followUpPrompt}</Label>
                              <Textarea
                                value={notes}
                                onChange={(event) =>
                                  updateAssessmentResponse({
                                    assessmentId: activeAssessment.id,
                                    questionId: question.id,
                                    value,
                                    notes: event.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Add supporting notes"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assessment Outcome</CardTitle>
                  <CardDescription>Set reviewer details and final determination.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label>Reviewer</Label>
                      <Input
                        value={statusDraft.reviewer}
                        onChange={(event) => setStatusDraft((prev) => ({ ...prev, reviewer: event.target.value }))}
                        placeholder="Certification officer"
                      />
                    </div>
                    <div>
                      <Label>Determination</Label>
                      <Select
                        value={statusDraft.overallDetermination ?? "Fit and Proper"}
                        onValueChange={(value) =>
                          setStatusDraft((prev) => ({
                            ...prev,
                            overallDetermination: value as StatusDraft["overallDetermination"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fit and Proper">Fit and Proper</SelectItem>
                          <SelectItem value="Conditional">Conditional</SelectItem>
                          <SelectItem value="Not Fit and Proper">Not Fit and Proper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DatePickerField
                      label="Assessment Date"
                      placeholder="Select date"
                      value={statusDraft.assessmentDate}
                      onChange={(date) => setStatusDraft((prev) => ({ ...prev, assessmentDate: date }))}
                    />
                    <DatePickerField
                      label="Next Due Date"
                      placeholder="Select date"
                      value={statusDraft.nextDueDate}
                      onChange={(date) => setStatusDraft((prev) => ({ ...prev, nextDueDate: date }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Conditions / Follow-up</Label>
                    <Textarea
                      value={statusDraft.conditions}
                      onChange={(event) => setStatusDraft((prev) => ({ ...prev, conditions: event.target.value }))}
                      rows={3}
                      placeholder="Record conditions or remediation actions (one per line)."
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleMarkStatus("draft")}>Save Draft</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleMarkStatus("in_review")}>Move to Review</Button>
                    </div>
                    <Button type="button" size="sm" onClick={() => handleMarkStatus("completed")}>Mark Completed</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type SummaryCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  accent: string;
};

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

type DatePickerFieldProps = {
  label: string;
  placeholder: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

function DatePickerField({ label, placeholder, value, onChange }: DatePickerFieldProps) {
  return (
    <div>
      <Label className="text-sm text-slate-700">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-slate-400")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
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
