"use client";

import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { buildQuestionContext, isQuestionAnswered, type QuestionResponse } from "@/lib/assessment-question-bank";
import { ProjectHeader } from "./ProjectHeader";
import type { QuestionDefinition, QuestionOption, QuestionSection } from "../../lib/questionBank";

interface AssessmentData {
  basics?: Record<string, string | number | null>;
  questionResponses?: Record<string, QuestionResponse>;
  meta?: Record<string, unknown>;
  readiness?: Record<string, string>;
  policies?: Record<string, string>;
  training?: Record<string, string>;
  smcr?: Record<string, string>;
}

interface ProjectDetail {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
  assessmentData?: AssessmentData;
}

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
                  An error occurred while rendering the question bank. Please refresh the page to try again.
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

export function RegulatoryQuestionsClient() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialAssessmentRef = useRef<string>("");

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null);
      if (!response || !response.ok) {
        setLoadError("Unable to load regulatory questions. Please try again.");
        return;
      }
      const data = await response.json();
      const projectData = data.project as ProjectDetail;
      setProject(projectData);
      const existingAssessment = (projectData.assessmentData ?? {}) as AssessmentData;
      setAssessment(existingAssessment);
      initialAssessmentRef.current = JSON.stringify(existingAssessment);
      setHasUnsavedChanges(false);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (!initialAssessmentRef.current) return;
    const currentState = JSON.stringify(assessment);
    setHasUnsavedChanges(currentState !== initialAssessmentRef.current);
  }, [assessment]);

  const questionContext = useMemo(
    () => buildQuestionContext(
      { basics: assessment.basics, questionResponses: assessment.questionResponses, meta: assessment.meta },
      project?.permissionCode
    ),
    [assessment.basics, assessment.questionResponses, assessment.meta, project?.permissionCode]
  );

  const readinessScore = useMemo(() => {
    const responses = questionContext.responses;
    const allQuestions = questionContext.sections.flatMap((s) => s.questions);

    let totalPossible = 0;
    let totalEarned = 0;

    for (const question of allQuestions) {
      if (!question.weight) continue;

      const response = responses[question.id];
      const hasScoredOptions = Boolean(question.options?.some((opt) => typeof opt.score === "number"));
      const maxScore = hasScoredOptions
        ? question.options?.reduce((max, opt) => Math.max(max, opt.score ?? 0), 0) ?? 0
        : 1;
      totalPossible += maxScore * question.weight;

      const answered = isQuestionAnswered(question, response);
      const earned = response?.score !== undefined
        ? response.score
        : answered
        ? maxScore
        : 0;
      totalEarned += earned * question.weight;
    }

    if (totalPossible === 0) return null;
    return {
      earned: totalEarned,
      possible: totalPossible,
      percentage: Math.round((totalEarned / totalPossible) * 100),
    };
  }, [questionContext]);

  const updateQuestionResponse = useCallback((questionId: string, value: unknown, score?: number) => {
    setAssessment((prev) => ({
      ...prev,
      questionResponses: {
        ...(prev.questionResponses ?? {}),
        [questionId]: { value, score, source: "user" as const },
      },
    }));
  }, []);

  const saveResponses = useCallback(async () => {
    if (!projectId) return;
    setIsSaving(true);
    setSaveNotice(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment),
      });
      if (!response.ok) {
        throw new Error("Failed to save responses.");
      }
      const data = await response.json();
      const savedAssessment = (data?.assessment ?? assessment) as AssessmentData;
      setAssessment(savedAssessment);
      initialAssessmentRef.current = JSON.stringify(savedAssessment);
      setHasUnsavedChanges(false);
      setSaveNotice("Responses saved.");
    } catch (error) {
      setSaveNotice(error instanceof Error ? error.message : "Failed to save responses.");
    } finally {
      setIsSaving(false);
    }
  }, [assessment, projectId]);

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="space-y-4 p-8">
          <NasaraLoader label="Loading regulatory questions..." />
          <Progress value={65} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Regulatory questions unavailable</CardTitle>
          <CardDescription>{loadError || "Project not found."}</CardDescription>
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
      <ProjectHeader project={project} active="regulatory-questions" />

      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Regulatory assessment questions</CardTitle>
              <CardDescription>
                Additional questions to assess regulatory readiness. Some questions may be pre-filled based on your earlier answers.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={saveResponses} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save responses"}
              </Button>
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                  Unsaved changes
                </span>
              ) : null}
            </div>
          </div>
          {saveNotice ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {saveNotice}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <QuestionBankErrorBoundary>
            <Tabs defaultValue={questionContext.sections[0]?.id} className="w-full">
              <div className="border-b border-slate-200 px-6">
                <div className="overflow-x-auto">
                  <TabsList className="h-auto bg-transparent p-0 inline-flex gap-0 w-auto min-w-full">
                    {questionContext.sections.map((section: QuestionSection) => {
                      const answeredInSection = section.questions.filter(
                        (q) => questionContext.responses[q.id]?.value !== undefined
                      ).length;
                      const isComplete = answeredInSection === section.questions.length;
                      return (
                        <TabsTrigger
                          key={section.id}
                          value={section.id}
                          className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:shadow-none whitespace-nowrap"
                        >
                          <span className="flex items-center gap-2">
                            {section.title}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              isComplete
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {answeredInSection}/{section.questions.length}
                            </span>
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
              </div>

              {questionContext.sections.map((section: QuestionSection) => (
                <TabsContent
                  key={section.id}
                  value={section.id}
                  className="px-6 py-4 focus-visible:outline-none focus-visible:ring-0"
                >
                  {section.description && (
                    <p className="text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                      {section.description}
                    </p>
                  )}
                  <div className="space-y-6">
                    {section.questions.map((question: QuestionDefinition) => (
                      <QuestionRenderer
                        key={question.id}
                        question={question}
                        response={questionContext.responses[question.id]}
                        onResponseChange={updateQuestionResponse}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </QuestionBankErrorBoundary>
        </CardContent>
      </Card>
    </div>
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
              Auto-filled from your responses above. Value: {" "}
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
    if (cellValue !== "" && isNaN(Number(cellValue.replace(/,/g, "")))) {
      return;
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
