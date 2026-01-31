"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle, Circle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { buildProfileInsights, getProfileQuestions, isProfilePermissionCode, type ProfileQuestion, type ProfileResponse } from "@/lib/business-plan-profile";
import { buildQuestionContext, isQuestionAnswered, type QuestionResponse } from "@/lib/assessment-question-bank";
import { ProjectHeader } from "./ProjectHeader";

interface AssessmentData {
  basics?: Record<string, string | number | null>;
  questionResponses?: Record<string, QuestionResponse>;
  meta?: Record<string, unknown>;
}

interface ProjectSummary {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
  assessmentData?: AssessmentData;
}

const CHART_COLORS = ["#0f766e", "#2563eb", "#f97316", "#7c3aed", "#e11d48", "#16a34a"]; 

const verdictStyles: Record<string, string> = {
  "in-scope": "bg-emerald-100 text-emerald-700",
  "possible-exemption": "bg-amber-100 text-amber-700",
  "out-of-scope": "bg-rose-100 text-rose-700",
  unknown: "bg-slate-100 text-slate-600",
};

const verdictBorders: Record<string, string> = {
  "in-scope": "border-emerald-200",
  "possible-exemption": "border-amber-200",
  "out-of-scope": "border-rose-200",
  unknown: "border-slate-200",
};

const getReadinessColor = (percent: number) => {
  if (percent >= 80) return "#16a34a";
  if (percent >= 40) return "#f59e0b";
  return "#ef4444";
};

const isProfileResponseComplete = (question: ProfileQuestion, response: ProfileResponse | undefined) => {
  if (response === undefined || response === null) return false;
  if (Array.isArray(response)) return response.length > 0;
  if (typeof response === "string") return response.trim().length > 0;
  return true;
};

export function ResultsClient() {
  const params = useParams();
  const rawProjectId = params?.projectId;
  const projectId = typeof rawProjectId === "string" ? rawProjectId : rawProjectId?.[0] ?? "";

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData>({});
  const [responses, setResponses] = useState<Record<string, ProfileResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLabel, setLoadingLabel] = useState("Loading results...");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [insightFilter, setInsightFilter] = useState<"all" | "critical">("all");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoadError("Project ID is missing.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadResults = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        setLoadingLabel("Loading project details...");
        setLoadingProgress(10);

        const projectResponse = await fetch(`/api/authorization-pack/projects/${projectId}`);
        if (!projectResponse.ok) {
          throw new Error("Unable to load project details.");
        }
        const projectData = await projectResponse.json();
        if (!isMounted) return;
        const projectRecord = projectData.project ?? null;
        setProject(projectRecord);
        setAssessment((projectRecord?.assessmentData ?? {}) as AssessmentData);

        setLoadingLabel("Loading profile responses...");
        setLoadingProgress(55);
        const profileResponse = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`);
        if (!profileResponse.ok) {
          throw new Error("Unable to load profile responses.");
        }
        const profileData = await profileResponse.json();
        if (!isMounted) return;
        setResponses(profileData?.profile?.responses ?? {});

        setLoadingLabel("Results ready");
        setLoadingProgress(100);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load results.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadResults();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const permission = useMemo(() => {
    const code = project?.permissionCode;
    if (!code) return null;
    return isProfilePermissionCode(code) ? code : code.startsWith("payments") ? "payments" : null;
  }, [project?.permissionCode]);

  const insights = useMemo(() => buildProfileInsights(permission, responses), [permission, responses]);

  const questionContext = useMemo(
    () => buildQuestionContext({ basics: assessment.basics, questionResponses: assessment.questionResponses, meta: assessment.meta }, project?.permissionCode),
    [assessment.basics, assessment.questionResponses, assessment.meta, project?.permissionCode]
  );

  const readinessScore = useMemo(() => {
    const allQuestions = questionContext.sections.flatMap((s) => s.questions);
    let totalPossible = 0;
    let totalEarned = 0;

    for (const question of allQuestions) {
      if (!question.weight) continue;
      const response = questionContext.responses[question.id];
      const hasScoredOptions = Boolean(question.options?.some((opt) => typeof opt.score === "number"));
      const maxScore = hasScoredOptions
        ? question.options?.reduce((max, opt) => Math.max(max, opt.score ?? 0), 0) ?? 0
        : 1;
      totalPossible += maxScore * question.weight;
      const answered = isQuestionAnswered(question, response);
      const earned = response?.score !== undefined ? response.score : answered ? maxScore : 0;
      totalEarned += earned * question.weight;
    }

    if (totalPossible === 0) return 0;
    return Math.round((totalEarned / totalPossible) * 100);
  }, [questionContext]);

  const regulatorySignals = useMemo(() => {
    const tally = new Map<string, number>();
    insights.regulatorySignals.forEach((item) => {
      const key = item.label.trim();
      if (!key) return;
      tally.set(key, (tally.get(key) ?? 0) + item.count);
    });
    return Array.from(tally.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [insights]);

  const regulatoryCoverage = useMemo(() => {
    if (regulatorySignals.length <= 5) return regulatorySignals;
    const top = regulatorySignals.slice(0, 5);
    const remainder = regulatorySignals.slice(5).reduce((sum, item) => sum + item.count, 0);
    return [...top, { label: "Other", count: remainder }];
  }, [regulatorySignals]);

  const sectionChartData = useMemo(
    () => insights.sectionScores.map((section) => ({ id: section.id, name: section.label, percent: section.percent })),
    [insights.sectionScores]
  );

  const visibleSectionData = useMemo(
    () => (insightFilter === "critical" ? sectionChartData.filter((section) => section.percent < 40) : sectionChartData),
    [sectionChartData, insightFilter]
  );

  const focusCoverage = useMemo(
    () => [...insights.packSectionScores]
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 8)
      .map((item) => ({ name: item.label, percent: item.percent })),
    [insights.packSectionScores]
  );

  const goldCoverageData = useMemo(
    () => (insightFilter === "critical" ? focusCoverage.filter((item) => item.percent < 40) : focusCoverage),
    [focusCoverage, insightFilter]
  );

  const criticalFlags = useMemo(() => {
    return questionContext.sections.flatMap((section) => section.questions)
      .filter((question) => question.critical && !isQuestionAnswered(question, questionContext.responses[question.id])).length;
  }, [questionContext]);

  const profileQuestions = useMemo(() => getProfileQuestions(permission), [permission]);
  const profileAnsweredCount = useMemo(
    () => profileQuestions.filter((question) => isProfileResponseComplete(question, responses[question.id])).length,
    [profileQuestions, responses]
  );
  const profileTotalCount = profileQuestions.length;

  const scoredSections = sectionChartData.filter((section) => section.percent > 0).length;

  const recommendations = useMemo(() => {
    const items: { id: string; text: string; severity: "critical" | "warning" | "info"; href?: string }[] = [];
    sectionChartData
      .filter((section) => section.percent < 40)
      .forEach((section) => {
        items.push({
          id: `section-${section.id}`,
          text: `Complete ${section.name} questions to improve readiness.`,
          severity: "critical",
          href: `/authorization-pack/${projectId}/opinion-pack`,
        });
      });

    const criticalQuestions = questionContext.sections
      .flatMap((section) => section.questions)
      .filter((question) => question.critical && !isQuestionAnswered(question, questionContext.responses[question.id]))
      .slice(0, 3);

    criticalQuestions.forEach((question) => {
      items.push({
        id: `critical-${question.id}`,
        text: `Answer critical question: ${question.title || question.question}`,
        severity: "critical",
        href: `/authorization-pack/${projectId}/regulatory-questions`,
      });
    });

    if (insights.perimeterOpinion.verdict === "unknown" || insights.perimeterOpinion.verdict === "possible-exemption") {
      items.push({
        id: "perimeter-clarify",
        text: "Clarify scope by completing remaining scope questions.",
        severity: "warning",
        href: `/authorization-pack/${projectId}/opinion-pack`,
      });
    }

    if (insights.focusAreas.length) {
      items.push({
        id: "focus-areas",
        text: `Priority focus: ${insights.focusAreas.slice(0, 3).join(", ")}.`,
        severity: "info",
        href: `/authorization-pack/${projectId}/opinion-pack`,
      });
    }

    return items;
  }, [sectionChartData, questionContext, insights, projectId]);

  const filteredRecommendations = insightFilter === "critical"
    ? recommendations.filter((item) => item.severity === "critical")
    : recommendations;

  const ringPercent = readinessScore ?? 0;
  const ringDegrees = Math.min(100, Math.max(0, ringPercent)) * 3.6;

  const expandedSection = sectionChartData.find((section) => section.id === expandedSectionId) ?? null;
  const expandedSectionQuestions = expandedSection
    ? profileQuestions.filter((question) => question.sectionId === expandedSection.id)
    : [];

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="space-y-4 p-8">
          <NasaraLoader label={loadingLabel} />
          <Progress value={loadingProgress} className="h-2" />
          <p className="text-xs text-slate-500">{loadingProgress}%</p>
        </CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Results unavailable</CardTitle>
          <CardDescription>{loadError || "Project not found."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="results" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Results Dashboard</h2>
          <p className="text-sm text-slate-500">Key insights from your profile and regulatory assessment.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={insightFilter === "all" ? "default" : "outline"}
            className={insightFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600"}
            onClick={() => setInsightFilter("all")}
          >
            All insights
          </Button>
          <Button
            variant={insightFilter === "critical" ? "default" : "outline"}
            className={insightFilter === "critical" ? "bg-rose-600 text-white" : "text-slate-600"}
            onClick={() => setInsightFilter("critical")}
          >
            Critical only
          </Button>
        </div>
      </div>

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(#0f766e ${ringDegrees}deg, #e2e8f0 0deg)` }}
                >
                  <div className="absolute inset-2 rounded-full bg-white" />
                  <span className="relative text-lg font-semibold text-slate-900">{ringPercent}%</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Overall Readiness</p>
                  <p className="text-xs text-slate-500">Weighted score from regulatory questions</p>
                </div>
              </div>
              <div>
                <Badge className={verdictStyles[insights.perimeterOpinion.verdict]}>
                  {insights.perimeterOpinion.verdict.replace(/-/g, " ")}
                </Badge>
                <p className="mt-2 text-sm text-slate-700 max-w-md">
                  {insights.perimeterOpinion.summary}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                Questions: {questionContext.answeredCount}/{questionContext.requiredCount}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                Sections: {scoredSections}/{sectionChartData.length}
              </Badge>
              <Badge variant="outline" className={criticalFlags > 0 ? "border-rose-200 text-rose-700" : "border-emerald-200 text-emerald-700"}>
                Critical flags: {criticalFlags}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Section Readiness</CardTitle>
          <CardDescription>Click a bar to drill into unanswered questions.</CardDescription>
        </CardHeader>
        <CardContent>
          {visibleSectionData.length ? (
            <div className="space-y-4">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visibleSectionData} layout="vertical" margin={{ left: 16, right: 16 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Bar
                      dataKey="percent"
                      radius={[4, 4, 4, 4]}
                      onClick={(_, index) => {
                        const section = visibleSectionData[index];
                        if (!section) return;
                        setExpandedSectionId((prev) => (prev === section.id ? null : section.id));
                      }}
                    >
                      {visibleSectionData.map((entry) => (
                        <Cell key={entry.id} fill={getReadinessColor(entry.percent)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {expandedSection ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{expandedSection.name}</p>
                      <p className="text-xs text-slate-500">Profile questions in this section</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedSectionId(null)}>
                      Close
                    </Button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {expandedSectionQuestions.length ? (
                      expandedSectionQuestions.map((question) => {
                        const answered = isProfileResponseComplete(question, responses[question.id]);
                        return (
                          <div key={question.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                            <span className="text-sm text-slate-700">{question.label || question.prompt}</span>
                            <Badge variant="outline" className={answered ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}>
                              {answered ? "Answered" : "Missing"}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">No questions found for this section.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No sections match the current filter.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Regulatory Coverage</CardTitle>
            <CardDescription>Signals by referenced sources.</CardDescription>
          </CardHeader>
          <CardContent>
            {regulatoryCoverage.length ? (
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={regulatoryCoverage} dataKey="count" nameKey="label" innerRadius={44} outerRadius={84}>
                        {regulatoryCoverage.map((entry, index) => (
                          <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  {regulatoryCoverage.map((entry, index) => (
                    <div key={entry.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        <span>{entry.label}</span>
                      </div>
                      <span className="text-slate-400">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No regulatory signals yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Gold Standard Coverage</CardTitle>
            <CardDescription>Coverage gaps against the gold-standard narrative spine.</CardDescription>
          </CardHeader>
          <CardContent>
            {goldCoverageData.length ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goldCoverageData} layout="vertical" margin={{ left: 16, right: 16 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="percent" radius={[4, 4, 4, 4]}>
                      {goldCoverageData.map((entry) => (
                        <Cell key={entry.name} fill={getReadinessColor(entry.percent)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No coverage gaps meet the current filter.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Activity Highlights</CardTitle>
            <CardDescription>Key regulated activities in scope.</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.activityHighlights.length && insightFilter === "all" ? (
              <div className="flex flex-wrap gap-2">
                {insights.activityHighlights.map((item) => (
                  <Badge key={item} variant="outline" className="border-slate-200 text-slate-600">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No critical activity insights.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Regulatory Drivers</CardTitle>
            <CardDescription>Top referenced perimeter sources.</CardDescription>
          </CardHeader>
          <CardContent>
            {regulatorySignals.length && insightFilter === "all" ? (
              <div className="space-y-2">
                {regulatorySignals.slice(0, 6).map((item) => {
                  const maxCount = regulatorySignals[0]?.count ?? 1;
                  const barWidth = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{item.label}</span>
                        <span className="text-xs text-slate-400">{item.count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No critical regulatory drivers.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Focus Areas</CardTitle>
            <CardDescription>Lowest coverage sections to address.</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.focusAreas.length ? (
              <div className="space-y-2">
                {insights.focusAreas.map((item) => {
                  const match = sectionChartData.find((section) => section.name === item);
                  const severity = match && match.percent < 40 ? "critical" : "warning";
                  if (insightFilter === "critical" && severity !== "critical") return null;
                  return (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      {severity === "critical" ? (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No focus areas yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>Targeted actions derived from the current insights.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecommendations.length ? (
            <div className="space-y-3">
              {filteredRecommendations.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    {item.severity === "critical" ? (
                      <XCircle className="h-4 w-4 text-rose-500 mt-0.5" />
                    ) : item.severity === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                    )}
                    <span>{item.text}</span>
                  </div>
                  {item.href ? (
                    <Button variant="outline" size="sm" className="text-slate-600" asChild>
                      <Link href={item.href}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recommendations match the current filter.</p>
          )}
        </CardContent>
      </Card>

      <Card className={`border ${verdictBorders[insights.perimeterOpinion.verdict]} bg-white`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Perimeter Opinion</span>
            <Badge className={verdictStyles[insights.perimeterOpinion.verdict]}>
              {insights.perimeterOpinion.verdict.replace(/-/g, " ")}
            </Badge>
          </CardTitle>
          <CardDescription>
            Based on {profileAnsweredCount} of {profileTotalCount} profile questions answered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">{insights.perimeterOpinion.summary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rationale</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {insights.perimeterOpinion.rationale.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Circle className="h-2.5 w-2.5 text-slate-400 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Key Obligations</p>
              {insights.perimeterOpinion.obligations.length ? (
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {insights.perimeterOpinion.obligations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Circle className="h-2.5 w-2.5 text-slate-400 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Complete scope questions to generate obligations.</p>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">This is an indicative perimeter view only and does not constitute legal advice.</p>
        </CardContent>
      </Card>
    </div>
  );
}
