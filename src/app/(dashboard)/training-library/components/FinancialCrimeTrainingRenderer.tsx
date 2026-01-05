"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  Shield,
  Target,
  Trophy,
  Award,
} from "lucide-react";
import { MarkdownContent, formatListItem, renderVisual } from "./training-renderer-helpers";

type StageKey = "hook" | "content" | "practice" | "assessment" | "summary";
const STAGE_ORDER: StageKey[] = ["hook", "content", "practice", "assessment", "summary"];

interface TrainingModuleData {
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  hook?: {
    title?: string;
    content?: string;
    statistic?: string;
    caseStudy?: string;
    keyQuestion?: string;
  };
  learningOutcomes?: string[];
  lessons?: Array<{
    id?: string;
    title: string;
    type?: string;
    duration?: number;
    content: string | {
      learningPoint?: string;
      mainContent?: string;
      keyConcepts?: (string | { term: string; definition: string })[];
      realExamples?: Array<string | { title: string; description?: string; outcome?: string }>;
      regulatoryRequirements?: string[];
      visual?: Record<string, unknown>;
    };
    keyConcepts?: (string | { term: string; definition: string })[];
    realExamples?: Array<string | { title: string; description?: string; outcome?: string }>;
  }>;
  practiceScenarios?: Array<{
    id: string;
    title: string;
    scenario?: string;
    situation?: string;
    context?: string;
    challenge?: string;
    question?: string;
    options: Array<{ id?: string; text?: string; isCorrect?: boolean; feedback?: string } | string>;
    correctAnswer?: number;
    explanation?: string;
    learningPoint?: string;
    learningPoints?: string[];
  }>;
  assessmentQuestions?: Array<{
    id: string;
    question: string;
    options: Array<{ id?: string; text?: string; isCorrect?: boolean } | string>;
    correctAnswer?: number;
    explanation?: string;
  }>;
  summary?: {
    keyTakeaways?: string[];
    nextSteps?: string[];
    quickReference?: string[] | { title?: string; items?: Array<{ term: string; definition: string }> };
  };
  visualAssets?: {
    diagrams?: Array<{ id?: string; title?: string; description: string; type?: string }>;
    infographics?: Array<{ id?: string; title?: string; description: string; type?: string }>;
    images?: Array<{ id?: string; title?: string; description: string; section?: string }>;
    style?: string;
  };
}

interface FinancialCrimeTrainingRendererProps {
  moduleId: string;
  module: TrainingModuleData;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
  deepLink?: { stage?: string; section?: string };
  onDeepLinkChange?: (deepLink: { stage?: string; section?: string }) => void;
}

export function FinancialCrimeTrainingRenderer({
  moduleId,
  module,
  onComplete,
  onProgress,
  deepLink,
  onDeepLinkChange,
}: FinancialCrimeTrainingRendererProps) {
  const initialStage = STAGE_ORDER.includes((deepLink?.stage as StageKey) ?? "hook")
    ? ((deepLink?.stage as StageKey) ?? "hook")
    : "hook";
  const [currentStage, setCurrentStage] = useState<StageKey>(initialStage);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    if (initialStage !== "content") return 0;
    const parsed = Number(deepLink?.section);
    if (!Number.isFinite(parsed)) return 0;
    const maxIndex = Math.max(0, (module.lessons?.length ?? 1) - 1);
    return Math.max(0, Math.min(parsed, maxIndex));
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});

  const content = {
    title: module.title,
    description: module.description,
    estimatedDuration: module.duration,
    difficulty: module.difficulty,
    hook: {
      title: module.hook?.title || module.title,
      content: module.hook?.content || module.hook?.caseStudy || module.description,
      statistic: module.hook?.statistic,
      keyQuestion: module.hook?.keyQuestion,
    },
    learningOutcomes: module.learningOutcomes || [],
    lessons: module.lessons || [],
    practiceScenarios: module.practiceScenarios || [],
    assessmentQuestions: module.assessmentQuestions || [],
    summary: {
      keyTakeaways: module.summary?.keyTakeaways || [],
      nextSteps: module.summary?.nextSteps || [],
      quickReference: module.summary?.quickReference,
    },
    visualAssets: module.visualAssets,
  };

  useEffect(() => {
    const stageIndex = STAGE_ORDER.indexOf(currentStage);
    const progressValue = ((stageIndex + 1) / STAGE_ORDER.length) * 100;
    onProgress?.(Math.round(progressValue));
  }, [currentStage, onProgress]);

  useEffect(() => {
    if (!deepLink?.stage) return;
    if (!STAGE_ORDER.includes(deepLink.stage as StageKey)) return;
    if (deepLink.stage === currentStage) return;
    setCurrentStage(deepLink.stage as StageKey);
    if (deepLink.stage !== "content") {
      setCurrentLessonIndex(0);
    }
  }, [currentStage, deepLink?.stage]);

  useEffect(() => {
    if (currentStage !== "content") return;
    const section = deepLink?.section;
    if (!section) return;
    const parsed = Number(section);
    if (!Number.isFinite(parsed)) return;
    const nextIndex = Math.max(0, Math.min(parsed, Math.max(0, (content.lessons.length || 1) - 1)));
    if (nextIndex === currentLessonIndex) return;
    setCurrentLessonIndex(nextIndex);
  }, [content.lessons.length, currentLessonIndex, currentStage, deepLink?.section]);

  const getStageProgress = () => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    return ((currentIndex + 1) / STAGE_ORDER.length) * 100;
  };

  const getLessonContent = (lessonContent: TrainingModuleData["lessons"][0]["content"]): string => {
    if (typeof lessonContent === "string") {
      return lessonContent;
    }
    return lessonContent.mainContent || lessonContent.learningPoint || "";
  };

  const getLessonKeyConcepts = (lesson: TrainingModuleData["lessons"][0]) => {
    if (typeof lesson.content === "object" && lesson.content.keyConcepts) {
      return lesson.content.keyConcepts.map((concept) =>
        typeof concept === "string" ? concept : `${concept.term}: ${concept.definition}`
      );
    }
    if (lesson.keyConcepts) {
      return lesson.keyConcepts.map((concept) =>
        typeof concept === "string" ? concept : `${concept.term}: ${concept.definition}`
      );
    }
    return [];
  };

  const getLessonExamples = (lesson: TrainingModuleData["lessons"][0]) => {
    if (typeof lesson.content === "object" && lesson.content.realExamples) {
      return lesson.content.realExamples;
    }
    return lesson.realExamples || [];
  };

  const getLessonVisual = (lesson: TrainingModuleData["lessons"][0]) => {
    if (typeof lesson.content === "object" && lesson.content.visual) {
      return lesson.content.visual;
    }
    return null;
  };

  const calculatePracticeScore = () => {
    if (content.practiceScenarios.length === 0) {
      return 100;
    }

    const correctCount = content.practiceScenarios.reduce((count, scenario) => {
      const selectedId = selectedAnswers[scenario.id];
      if (!selectedId) return count;

      const selectedIndex = scenario.options.findIndex((opt, idx) => {
        if (typeof opt === "string") return `opt-${idx}` === selectedId;
        return (opt.id || `opt-${idx}`) === selectedId;
      });

      if (typeof scenario.correctAnswer === "number") {
        return selectedIndex === scenario.correctAnswer ? count + 1 : count;
      }

      const selectedOption = scenario.options[selectedIndex];
      if (typeof selectedOption === "object" && selectedOption.isCorrect) {
        return count + 1;
      }

      return count;
    }, 0);

    return Math.round((correctCount / content.practiceScenarios.length) * 100);
  };

  const calculateAssessmentScore = () => {
    if (content.assessmentQuestions.length === 0) {
      return 100;
    }

    const correctCount = content.assessmentQuestions.reduce((count, question) => {
      const selectedId = assessmentAnswers[question.id];
      if (!selectedId) return count;

      const selectedIndex = question.options.findIndex((opt, idx) => {
        if (typeof opt === "string") return `opt-${idx}` === selectedId;
        return (opt.id || `opt-${idx}`) === selectedId;
      });

      if (typeof question.correctAnswer === "number") {
        return selectedIndex === question.correctAnswer ? count + 1 : count;
      }

      const selectedOption = question.options[selectedIndex];
      if (typeof selectedOption === "object" && selectedOption.isCorrect) {
        return count + 1;
      }

      return count;
    }, 0);

    return Math.round((correctCount / content.assessmentQuestions.length) * 100);
  };

  const syncDeepLink = (stage: StageKey, section?: number) => {
    if (!onDeepLinkChange) return;
    if (stage !== "content") {
      onDeepLinkChange({ stage });
      return;
    }
    const targetSection = typeof section === "number" ? section : currentLessonIndex;
    onDeepLinkChange({ stage, section: String(targetSection) });
  };

  const handleLessonSelect = (index: number) => {
    setCurrentLessonIndex(index);
    syncDeepLink("content", index);
  };

  const nextStage = () => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const nextStageValue = STAGE_ORDER[currentIndex + 1];
      setCurrentStage(nextStageValue);
      syncDeepLink(nextStageValue, nextStageValue === "content" ? currentLessonIndex : undefined);
    } else {
      const practiceScore = calculatePracticeScore();
      const assessmentScore = calculateAssessmentScore();
      const scores = [
        content.practiceScenarios.length ? practiceScore : undefined,
        content.assessmentQuestions.length ? assessmentScore : undefined,
      ].filter((score): score is number => typeof score === "number");
      const finalScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 100;
      const estimatedMinutes = typeof content.estimatedDuration === "number"
        ? content.estimatedDuration
        : Number(content.estimatedDuration ?? 0);
      onComplete?.(finalScore, Number.isFinite(estimatedMinutes) ? estimatedMinutes : 0);
    }
  };

  const renderVisualAssets = () => {
    if (!content.visualAssets) return null;
    const { diagrams = [], infographics = [], images = [], style } = content.visualAssets;
    if (diagrams.length === 0 && infographics.length === 0 && images.length === 0) return null;

    return (
      <Card className="border border-red-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Case File Visuals
          </CardTitle>
          <CardDescription>Supporting diagrams and evidence references.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...diagrams, ...infographics, ...images].map((item, index) => (
            <div key={`${item.id || item.title || index}`} className="rounded-lg border border-red-100 bg-red-50 p-4">
              <h4 className="text-sm font-semibold text-red-900">{item.title || "Reference"}</h4>
              <p className="text-xs text-red-700 mt-2">{item.description}</p>
            </div>
          ))}
          {style ? (
            <p className="text-xs text-slate-500 md:col-span-2">Design style: {style}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  const renderHookStage = () => (
    <div className="space-y-6">
      <Card className="border border-red-200 bg-gradient-to-r from-red-50 to-amber-50">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600 text-white">Case File</Badge>
            <Badge variant="outline" className="text-red-600 border-red-200">Financial Crime</Badge>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{content.hook.title}</h2>
          <MarkdownContent content={content.hook.content || ""} className="text-sm" />
          {content.hook.statistic && (
            <div className="rounded-lg border border-amber-200 bg-white/60 p-4 text-sm text-amber-900">
              {content.hook.statistic}
            </div>
          )}
          {content.hook.keyQuestion && (
            <div className="rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700">
              {content.hook.keyQuestion}
            </div>
          )}
        </CardContent>
      </Card>

      {content.learningOutcomes.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Investigation Objectives
            </CardTitle>
            <CardDescription>What you will be able to identify and evidence.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  {formatListItem(outcome)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContentStage = () => {
    const currentLesson = content.lessons[currentLessonIndex];
    if (!currentLesson) {
      return (
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-600">Content for this module is being developed.</CardContent>
        </Card>
      );
    }

    const lessonContent = getLessonContent(currentLesson.content);
    const keyConcepts = getLessonKeyConcepts(currentLesson);
    const examples = getLessonExamples(currentLesson);
    const visual = getLessonVisual(currentLesson);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <Card className="border border-red-100 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.2em] text-red-600">Case Index</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {content.lessons.map((lesson, index) => (
                <Button
                  key={lesson.id || index}
                  variant={index === currentLessonIndex ? "default" : "outline"}
                  className={`w-full justify-start ${
                    index === currentLessonIndex ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-200"
                  }`}
                  onClick={() => handleLessonSelect(index)}
                >
                  <span className="mr-2 text-xs">0{index + 1}</span>
                  {lesson.title}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  {currentLesson.title}
                </CardTitle>
                <CardDescription>Session {currentLessonIndex + 1} of {content.lessons.length}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MarkdownContent content={lessonContent} />

                {keyConcepts.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Key Evidence Points
                    </h4>
                    <ul className="space-y-2">
                      {keyConcepts.map((concept, index) => (
                        <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {examples.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Case Examples
                    </h4>
                    <ul className="space-y-3">
                      {examples.map((example, index) => (
                        <li key={index} className="text-sm text-red-800">
                          {typeof example === "string" ? (
                            example
                          ) : (
                            <div>
                              <p className="font-semibold text-red-900">{example.title}</p>
                              {example.description ? <p>{example.description}</p> : null}
                              {example.outcome ? <p className="text-red-700">Outcome: {example.outcome}</p> : null}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {visual && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Visual Reference</h4>
                    {renderVisual(visual)}
                  </div>
                )}
              </CardContent>
            </Card>

            {renderVisualAssets()}
          </div>
        </div>
      </div>
    );
  };

  const getScenarioText = (scenario: TrainingModuleData["practiceScenarios"][0]) => {
    return scenario.scenario || scenario.situation || scenario.context || scenario.challenge || "";
  };

  const renderPracticeStage = () => (
    <div className="space-y-6">
      <Card className="border border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Investigation Exercises
          </CardTitle>
          <CardDescription>Apply judgement to real-world scenarios.</CardDescription>
        </CardHeader>
      </Card>

      {content.practiceScenarios.map((scenario) => {
        const selectedId = selectedAnswers[scenario.id];
        const selectedIndex = scenario.options.findIndex((opt, idx) => {
          if (typeof opt === "string") return `opt-${idx}` === selectedId;
          return (opt.id || `opt-${idx}`) === selectedId;
        });
        const isCorrect = typeof scenario.correctAnswer === "number"
          ? selectedIndex === scenario.correctAnswer
          : typeof scenario.options[selectedIndex] === "object" && Boolean((scenario.options[selectedIndex] as { isCorrect?: boolean }).isCorrect);

        return (
          <Card key={scenario.id} className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{scenario.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                {getScenarioText(scenario)}
              </div>
              <div className="space-y-2">
                {scenario.options.map((option, index) => {
                  const optionId = typeof option === "string" ? `opt-${index}` : option.id || `opt-${index}`;
                  const optionText = typeof option === "string" ? option : option.text || "";
                  const isSelected = selectedId === optionId;
                  return (
                    <label
                      key={optionId}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                        isSelected ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={scenario.id}
                        value={optionId}
                        checked={isSelected}
                        onChange={() => setSelectedAnswers((prev) => ({ ...prev, [scenario.id]: optionId }))}
                        className="mt-1"
                      />
                      <span className="text-sm text-slate-700">{optionText}</span>
                    </label>
                  );
                })}
              </div>
              {selectedId && (
                <div className={`rounded-lg border p-3 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {isCorrect ? "Correct" : "Review Required"}
                  </div>
                  {scenario.explanation && <p className="text-xs text-slate-600 mt-2">{scenario.explanation}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderAssessmentStage = () => (
    <div className="space-y-6">
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            Case Review Assessment
          </CardTitle>
          <CardDescription>Complete the knowledge check to close the case file.</CardDescription>
        </CardHeader>
      </Card>

      {content.assessmentQuestions.map((question, index) => {
        const selectedId = assessmentAnswers[question.id];
        return (
          <Card key={question.id} className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Question {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">{question.question}</p>
              {question.options.map((option, optionIndex) => {
                const optionId = typeof option === "string" ? `opt-${optionIndex}` : option.id || `opt-${optionIndex}`;
                const optionText = typeof option === "string" ? option : option.text || "";
                const isSelected = selectedId === optionId;
                return (
                  <label
                    key={optionId}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                      isSelected ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={optionId}
                      checked={isSelected}
                      onChange={() => setAssessmentAnswers((prev) => ({ ...prev, [question.id]: optionId }))}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-700">{optionText}</span>
                  </label>
                );
              })}
              {selectedId && question.explanation && (
                <p className="text-xs text-slate-500">{question.explanation}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderSummaryStage = () => (
    <div className="space-y-6">
      <Card className="border border-amber-200 bg-gradient-to-r from-amber-50 to-red-50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Case Closed</h2>
          <p className="text-sm text-slate-600 mt-2">You completed {content.title}.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-semibold text-amber-700">{content.estimatedDuration} min</div>
              <div className="text-xs text-slate-500">Estimated time</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-amber-700">{calculateAssessmentScore()}%</div>
              <div className="text-xs text-slate-500">Assessment score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Nasara Connect Certificate</CardTitle>
          <CardDescription>Pass mark: 80%</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-slate-600">Unlock a certificate for audit evidence.</div>
          {calculateAssessmentScore() >= 80 ? (
            <Button className="bg-red-600 hover:bg-red-700" asChild>
              <a href={`/training-library/certificate/${moduleId}?score=${calculateAssessmentScore()}`}>
                <Award className="mr-2 h-4 w-4" />
                Download Certificate
              </a>
            </Button>
          ) : (
            <Badge variant="outline">Complete assessment to unlock</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Badge className="bg-red-600 text-white">Financial Crime</Badge>
            <h1 className="text-3xl font-semibold text-slate-900 mt-3">{content.title}</h1>
            <p className="text-sm text-slate-600 mt-2">{content.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {content.estimatedDuration} min
            </Badge>
            <Badge className="bg-amber-500">{content.difficulty}</Badge>
          </div>
        </div>
      </div>

      <Card className="border border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">Case Progress</span>
            <span className="text-xs text-slate-500">{Math.round(getStageProgress())}% complete</span>
          </div>
          <Progress value={getStageProgress()} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span className={currentStage === "hook" ? "text-red-600 font-semibold" : ""}>Brief</span>
            <span className={currentStage === "content" ? "text-red-600 font-semibold" : ""}>Sessions</span>
            <span className={currentStage === "practice" ? "text-red-600 font-semibold" : ""}>Practice</span>
            <span className={currentStage === "assessment" ? "text-red-600 font-semibold" : ""}>Assessment</span>
            <span className={currentStage === "summary" ? "text-red-600 font-semibold" : ""}>Summary</span>
          </div>
        </CardContent>
      </Card>

      {currentStage === "hook" && renderHookStage()}
      {currentStage === "content" && renderContentStage()}
      {currentStage === "practice" && renderPracticeStage()}
      {currentStage === "assessment" && renderAssessmentStage()}
      {currentStage === "summary" && renderSummaryStage()}

      <div className="flex justify-center">
        <Button onClick={nextStage} className="bg-red-600 hover:bg-red-700">
          {currentStage === "summary" ? "Complete" : "Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
