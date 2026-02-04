"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Users,
  BarChart3,
  MapPin,
  Shield,
  Search,
  FileText,
  Image as ImageIcon,
  Star,
  Brain,
  Zap,
  Award,
  Trophy
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getTrainingModule } from "../content";
import { normalizeTrainingModule } from "../lib/module-normalizer";
import { normalizeMarkdown } from "./training-renderer-helpers";
import { AMLTrainingRenderer } from "./AMLTrainingRenderer";
import { FinancialCrimeTrainingRenderer } from "./FinancialCrimeTrainingRenderer";
import { CustomerProtectionTrainingRenderer } from "./CustomerProtectionTrainingRenderer";
import { KYCTrainingRenderer } from "./KYCTrainingRenderer";
import { OperationalRiskTrainingRenderer } from "./OperationalRiskTrainingRenderer";
import { RegulatoryComplianceTrainingRenderer } from "./RegulatoryComplianceTrainingRenderer";

// Configure marked for simple inline formatting
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Simple markdown renderer component
function MarkdownContent({ content, className = "" }: { content: unknown; className?: string }) {
  const html = useMemo(() => {
    const normalized = normalizeMarkdown(content);
    if (!normalized) return "";
    const raw = marked.parse(normalized, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [content]);

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface TrainingContentRendererProps {
  contentId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
  deepLink?: {
    stage?: string;
    section?: string;
  };
  onDeepLinkChange?: (deepLink: { stage?: string; section?: string }) => void;
}

export function TrainingContentRenderer({ contentId, onComplete, onProgress, deepLink, onDeepLinkChange }: TrainingContentRendererProps) {
  // Get the training module from our content registry
  const trainingModule = normalizeTrainingModule(getTrainingModule(contentId) as Parameters<typeof normalizeTrainingModule>[0]) as TrainingModuleData | undefined;

  // If no module found, show error state
  if (!trainingModule) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Training Module Not Found</h2>
            <p className="text-red-700 mb-6">The requested training module &ldquo;{contentId}&rdquo; could not be found.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contentId === "aml-fundamentals") {
    return (
      <AMLTrainingRenderer
        onComplete={onComplete}
        onProgress={onProgress}
        deepLink={deepLink}
        onDeepLinkChange={onDeepLinkChange}
      />
    );
  }

  if (contentId === "kyc-fundamentals") {
    return (
      <KYCTrainingRenderer
        onComplete={onComplete}
        onProgress={onProgress}
        deepLink={deepLink}
        onDeepLinkChange={onDeepLinkChange}
      />
    );
  }

  if (trainingModule.category === "financial-crime-prevention") {
    return (
      <FinancialCrimeTrainingRenderer
        moduleId={contentId}
        module={trainingModule}
        onComplete={onComplete}
        onProgress={onProgress}
        deepLink={deepLink}
        onDeepLinkChange={onDeepLinkChange}
      />
    );
  }

  if (trainingModule.category === "customer-protection") {
    return (
      <CustomerProtectionTrainingRenderer
        moduleId={contentId}
        module={trainingModule}
        onComplete={onComplete}
        onProgress={onProgress}
        deepLink={deepLink}
        onDeepLinkChange={onDeepLinkChange}
      />
    );
  }

  if (trainingModule.category === "operational-risk") {
    return (
      <OperationalRiskTrainingRenderer
        moduleId={contentId}
        module={trainingModule}
        onComplete={onComplete}
        onProgress={onProgress}
        deepLink={deepLink}
        onDeepLinkChange={onDeepLinkChange}
      />
    );
  }

  if (trainingModule.category === "regulatory-compliance") {
    return (
      <RegulatoryComplianceTrainingRenderer
        moduleId={contentId}
        module={trainingModule}
        onComplete={onComplete}
        onProgress={onProgress}
        deepLink={deepLink}
        onDeepLinkChange={onDeepLinkChange}
      />
    );
  }

  return (
    <GenericTrainingRenderer
      moduleId={contentId}
      module={trainingModule}
      onComplete={onComplete}
      onProgress={onProgress}
      deepLink={deepLink}
      onDeepLinkChange={onDeepLinkChange}
    />
  );
}

// Generic renderer for modules without specialized components
type GenericStageKey = 'hook' | 'content' | 'practice' | 'assessment' | 'summary';
const GENERIC_STAGE_ORDER: GenericStageKey[] = ['hook', 'content', 'practice', 'assessment', 'summary'];

// Key concept can be either a string or an object with term/definition
interface KeyConceptObject {
  term: string;
  definition: string;
}

// Lesson content can be either a string or an object with detailed structure
interface LessonContentObject {
  learningPoint?: string;
  mainContent?: string;
  keyConcepts?: (string | KeyConceptObject)[];
  realExamples?: Array<string | { title: string; description?: string; outcome?: string }>;
  regulatoryRequirements?: string[];
  visual?: Record<string, unknown>;
}

interface VisualAssetItem {
  id?: string;
  title?: string;
  description: string;
  type?: string;
  section?: string;
}

interface TrainingVisualAssets {
  diagrams?: VisualAssetItem[];
  infographics?: VisualAssetItem[];
  images?: VisualAssetItem[];
  style?: string;
}

interface TrainingModuleData {
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  category?: string;
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
    content: string | LessonContentObject;
    keyConcepts?: (string | KeyConceptObject)[];
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
    options: Array<{
      id?: string;
      text?: string;
      isCorrect?: boolean;
      feedback?: string;
    } | string>;
    correctAnswer?: number;
    explanation?: string;
    learningPoint?: string;
    learningPoints?: string[];
  }>;
  assessmentQuestions?: Array<{
    id: string;
    type?: string;
    question: string;
    options: Array<{
      id?: string;
      text?: string;
      isCorrect?: boolean;
    } | string>;
    correctAnswer?: number;
    explanation: string;
  }>;
  summary?: {
    keyTakeaways?: string[];
    nextSteps?: string[];
    quickReference?: string[] | { title?: string; items?: Array<{ term: string; definition: string }> };
  };
  visualAssets?: TrainingVisualAssets;
}

function GenericTrainingRenderer({ moduleId, module, onComplete, onProgress, deepLink, onDeepLinkChange }: {
  moduleId: string;
  module: TrainingModuleData;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
  deepLink?: { stage?: string; section?: string };
  onDeepLinkChange?: (deepLink: { stage?: string; section?: string }) => void;
}) {
  const initialStage = GENERIC_STAGE_ORDER.includes((deepLink?.stage as GenericStageKey) ?? "hook")
    ? ((deepLink?.stage as GenericStageKey) ?? "hook")
    : "hook";
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentTouched, setAssessmentTouched] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    if (initialStage !== "content") return 0;
    const parsed = Number(deepLink?.section);
    if (!Number.isFinite(parsed)) return 0;
    const maxIndex = Math.max(0, (module.lessons?.length ?? 1) - 1);
    return Math.max(0, Math.min(parsed, maxIndex));
  });
  const [currentStage, setCurrentStage] = useState<GenericStageKey>(initialStage);

  const formatListItem = (item: unknown) => {
    if (typeof item === "string" || typeof item === "number") return String(item);
    if (!item || typeof item !== "object") return "";
    const record = item as Record<string, unknown>;
    const term = typeof record.term === "string" ? record.term : "";
    const definition = typeof record.definition === "string" ? record.definition : "";
    if (term && definition) return `${term}: ${definition}`;
    const title = typeof record.title === "string" ? record.title : "";
    const description = typeof record.description === "string" ? record.description : "";
    const outcome = typeof record.outcome === "string" ? record.outcome : "";
    const text = typeof record.text === "string" ? record.text : "";
    const parts = [title || text, description, outcome ? `Outcome: ${outcome}` : ""].filter(Boolean);
    return parts.join(" - ");
  };

  // Use actual module content
  const content = {
    title: module.title,
    description: module.description,
    estimatedDuration: module.duration,
    difficulty: module.difficulty,
    hook: {
      title: module.hook?.title || module.title,
      content: module.hook?.content || module.hook?.caseStudy || module.description,
      statistic: module.hook?.statistic
    },
    learningOutcomes: module.learningOutcomes || [],
    lessons: module.lessons || [],
    practiceScenarios: module.practiceScenarios || [],
    assessmentQuestions: module.assessmentQuestions || [],
    summary: {
      keyTakeaways: module.summary?.keyTakeaways || [],
      nextSteps: module.summary?.nextSteps || [],
      quickReference: module.summary?.quickReference
    },
    visualAssets: module.visualAssets
  };

  useEffect(() => {
    const stageIndex = GENERIC_STAGE_ORDER.indexOf(currentStage);
    const progressValue = ((stageIndex + 1) / GENERIC_STAGE_ORDER.length) * 100;
    onProgress?.(Math.round(progressValue));
  }, [currentStage, onProgress]);

  useEffect(() => {
    if (!deepLink?.stage) return;
    if (!GENERIC_STAGE_ORDER.includes(deepLink.stage as GenericStageKey)) return;
    if (deepLink.stage === currentStage) return;
    setCurrentStage(deepLink.stage as GenericStageKey);
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
    const currentIndex = GENERIC_STAGE_ORDER.indexOf(currentStage);
    return ((currentIndex + 1) / GENERIC_STAGE_ORDER.length) * 100;
  };

  const calculatePracticeScore = () => {
    if (content.practiceScenarios.length === 0) {
      return 100;
    }

    const correctCount = content.practiceScenarios.reduce((count, scenario) => {
      const selectedId = selectedAnswers[scenario.id];
      if (!selectedId) return count;

      // Find the index of the selected option
      const selectedIndex = scenario.options.findIndex((opt, idx) => {
        if (typeof opt === 'string') return `opt-${idx}` === selectedId;
        return (opt.id || `opt-${idx}`) === selectedId;
      });

      // If correctAnswer index is provided, use it
      if (typeof scenario.correctAnswer === 'number') {
        return selectedIndex === scenario.correctAnswer ? count + 1 : count;
      }

      // Otherwise check for isCorrect property on options
      const selectedOption = scenario.options[selectedIndex];
      if (typeof selectedOption === 'object' && selectedOption.isCorrect) {
        return count + 1;
      }

      return count;
    }, 0);

    return Math.round((correctCount / content.practiceScenarios.length) * 100);
  };

  const syncDeepLink = (stage: GenericStageKey, section?: number) => {
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
    const currentIndex = GENERIC_STAGE_ORDER.indexOf(currentStage);
    if (currentIndex < GENERIC_STAGE_ORDER.length - 1) {
      const nextStageValue = GENERIC_STAGE_ORDER[currentIndex + 1];
      setCurrentStage(nextStageValue);
      syncDeepLink(nextStageValue, nextStageValue === "content" ? currentLessonIndex : undefined);
    } else {
      const practiceScore = calculatePracticeScore();
      const estimatedMinutes = typeof content.estimatedDuration === 'number'
        ? content.estimatedDuration
        : Number(content.estimatedDuration ?? 0);

      const assessmentScore = calculateAssessmentScore();
      const scores = [
        content.practiceScenarios.length ? practiceScore : undefined,
        content.assessmentQuestions.length ? assessmentScore : undefined,
      ].filter((score): score is number => typeof score === "number");
      const finalScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 100;

      onComplete?.(finalScore, Number.isFinite(estimatedMinutes) ? estimatedMinutes : 0);
    }
  };

  const calculateAssessmentScore = () => {
    if (content.assessmentQuestions.length === 0) {
      return 100;
    }

    const correctCount = content.assessmentQuestions.reduce((count, question) => {
      const selectedId = assessmentAnswers[question.id];
      if (!selectedId) return count;

      const selectedIndex = question.options.findIndex((opt, idx) => {
        if (typeof opt === 'string') return `opt-${idx}` === selectedId;
        return (opt.id || `opt-${idx}`) === selectedId;
      });

      if (typeof question.correctAnswer === 'number') {
        return selectedIndex === question.correctAnswer ? count + 1 : count;
      }

      const selectedOption = question.options[selectedIndex];
      if (typeof selectedOption === 'object' && selectedOption.isCorrect) {
        return count + 1;
      }

      return count;
    }, 0);

    return Math.round((correctCount / content.assessmentQuestions.length) * 100);
  };

  const renderVisual = (visual: Record<string, unknown>) => {
    if (!visual) return null;

    switch (visual.type) {
      case 'infographic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {(visual.elements as Record<string, unknown>[] | undefined)?.map((element: Record<string, unknown>, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                element.color === 'red' ? 'border-red-200 bg-red-50' :
                element.color === 'amber' ? 'border-amber-200 bg-amber-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {element.icon === 'alert-triangle' && <AlertTriangle className={`h-6 w-6 ${
                    element.color === 'red' ? 'text-red-600' :
                    element.color === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {element.icon === 'search' && <Search className={`h-6 w-6 ${
                    element.color === 'red' ? 'text-red-600' :
                    element.color === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {element.icon === 'shield' && <Shield className={`h-6 w-6 ${
                    element.color === 'red' ? 'text-red-600' :
                    element.color === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  <h4 className="font-semibold">{String(element.text ?? "")}</h4>
                </div>
                <p className="text-sm text-slate-600">{String(element.description ?? "")}</p>
              </div>
            ))}
          </div>
        );

      case 'process_flow':
        return (
          <div className="space-y-6 my-8">
            {(visual.steps as Record<string, unknown>[] | undefined)?.map((step: Record<string, unknown>, index: number) => (
              <div key={index} className="relative">
                <div className={`border-l-4 ${
                  step.color === 'red' ? 'border-red-500' :
                  step.color === 'amber' ? 'border-amber-500' :
                  'border-green-500'
                } pl-6`}>
                  <div className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    step.color === 'red' ? 'bg-red-500' :
                    step.color === 'amber' ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}>
                    {String(step.number ?? "")}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-lg font-semibold mb-2">{String(step.title ?? "")}</h4>
                    <p className="text-slate-600 mb-4">{String(step.description ?? "")}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-emerald-800 mb-2">Common Examples:</h5>
                        <ul className="space-y-1">
                          {(step.examples as string[] | undefined)?.map((example: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                              {formatListItem(example)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-800 mb-2">Red Flags to Watch:</h5>
                        <ul className="space-y-1">
                          {(step.redFlags as string[] | undefined)?.map((flag: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                              {formatListItem(flag)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'category_grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            {(visual.categories as Record<string, unknown>[] | undefined)?.map((category: Record<string, unknown>, index: number) => (
              <div key={index} className={`p-6 rounded-lg border-2 ${
                category.riskLevel === 'high' ? 'border-red-200 bg-red-50' :
                category.riskLevel === 'medium' ? 'border-amber-200 bg-amber-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {category.icon === 'user' && <Users className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {category.icon === 'credit-card' && <BarChart3 className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {category.icon === 'map-pin' && <MapPin className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {category.icon === 'briefcase' && <FileText className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  <div>
                    <h4 className="text-lg font-semibold">{String(category.title ?? "")}</h4>
                    <Badge className={`mt-1 ${
                      category.riskLevel === 'high' ? 'bg-red-600' :
                      category.riskLevel === 'medium' ? 'bg-amber-600' :
                      'bg-green-600'
                    }`}>
                      {String(category.riskLevel ?? "")} risk
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-700 mb-4">{String(category.description ?? "")}</p>
                <div>
                  <h5 className="font-medium mb-2">Common Indicators:</h5>
                  <ul className="space-y-2">
                    {(category.examples as string[] | undefined)?.map((example: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          category.riskLevel === 'high' ? 'bg-red-500' :
                          category.riskLevel === 'medium' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}></div>
                        {formatListItem(example)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );

      case 'scenario_illustration':
        return (
          <div className="my-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-blue-600" />
            </div>
            <p className="text-slate-600 italic">{String(visual.description ?? "")}</p>
          </div>
        );

      default:
        return null;
    }
  };

  const formatVisualTitle = (value: string) => {
    return value
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderVisualAssets = () => {
    if (!content.visualAssets) return null;
    const { diagrams = [], infographics = [], images = [], style } = content.visualAssets;
    if (diagrams.length === 0 && infographics.length === 0 && images.length === 0) return null;

    return (
      <Card className="border border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <ImageIcon className="h-5 w-5 text-slate-600" />
            Visual Toolkit
          </CardTitle>
          <CardDescription>Quick visual references to reinforce the lesson</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagrams.map((diagram, index) => (
              <div key={`diagram-${diagram.id || index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <h4 className="text-sm font-semibold text-slate-900">{diagram.title}</h4>
                  </div>
                  {diagram.type ? (
                    <Badge variant="outline" className="text-xs capitalize">
                      {diagram.type}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-slate-600">{diagram.description}</p>
              </div>
            ))}
            {infographics.map((infographic, index) => (
              <div key={`infographic-${infographic.id || index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-900">{infographic.title}</h4>
                </div>
                <p className="text-xs text-slate-600">{infographic.description}</p>
              </div>
            ))}
            {images.map((image, index) => {
              const fallbackTitle = image.section ? formatVisualTitle(image.section) : "Visual Reference";
              const title = image.title || fallbackTitle;
              return (
                <div key={`image-${image.id || image.section || index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{image.description}</p>
                </div>
              );
            })}
          </div>
          {style ? (
            <p className="text-xs text-slate-500">Design style: {style}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  const renderHookStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
          <Zap className="h-4 w-4" />
          Introduction
        </div>
      </div>

      <Card className="border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            {content.hook.title}
          </h2>
          <MarkdownContent content={content.hook.content || ""} className="text-lg mb-6 text-center" />

          {content.hook.statistic && (
            <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-800 font-medium">{content.hook.statistic}</p>
            </div>
          )}

          {content.learningOutcomes.length > 0 && (
            <div className="mt-8 p-4 bg-white/50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-3">📚 What You&apos;ll Learn:</h3>
              <ul className="space-y-2">
                {content.learningOutcomes.slice(0, 5).map((outcome, index) => (
                  <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    {formatListItem(outcome)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Helper function to extract lesson content string from either string or object
  const getLessonContent = (lessonContent: string | LessonContentObject): string => {
    if (typeof lessonContent === 'string') {
      return lessonContent;
    }
    return lessonContent.mainContent || lessonContent.learningPoint || '';
  };

  // Helper function to extract key concepts from lesson
  const getLessonKeyConcepts = (lesson: typeof content.lessons[0]): string[] => {
    // First check if content is an object with keyConcepts
    if (typeof lesson.content === 'object' && lesson.content.keyConcepts) {
      return lesson.content.keyConcepts.map(concept => {
        if (typeof concept === 'string') return concept;
        return `${concept.term}: ${concept.definition}`;
      });
    }
    // Then check lesson-level keyConcepts
    if (lesson.keyConcepts) {
      return lesson.keyConcepts.map(concept => {
        if (typeof concept === 'string') return concept;
        return `${concept.term}: ${concept.definition}`;
      });
    }
    return [];
  };

  // Helper function to extract real examples from lesson
  const getLessonRealExamples = (
    lesson: typeof content.lessons[0],
  ): Array<string | { title: string; description?: string; outcome?: string }> => {
    // First check if content is an object with realExamples
    if (typeof lesson.content === 'object' && lesson.content.realExamples) {
      return lesson.content.realExamples;
    }
    // Then check lesson-level realExamples
    return lesson.realExamples || [];
  };

  const getLessonVisual = (lesson: typeof content.lessons[0]) => {
    if (typeof lesson.content === "object" && lesson.content.visual) {
      return lesson.content.visual;
    }
    return null;
  };

  const renderContentStage = () => {
    const currentLesson = content.lessons[currentLessonIndex];

    if (!currentLesson && content.lessons.length === 0) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              Core Content
            </div>
          </div>
          <Card className="border border-slate-200">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Content for this module is being developed.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const lessonContent = currentLesson ? getLessonContent(currentLesson.content) : '';
    const keyConcepts = currentLesson ? getLessonKeyConcepts(currentLesson) : [];
    const realExamples = currentLesson ? getLessonRealExamples(currentLesson) : [];
    const lessonVisual = currentLesson ? getLessonVisual(currentLesson) : null;

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Lesson {currentLessonIndex + 1} of {content.lessons.length}
          </div>
        </div>

        {currentLesson && (
          <Card className="border border-slate-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">{currentLesson.title}</h3>
              <MarkdownContent content={lessonContent} className="mb-6" />

              {keyConcepts.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Concepts
                  </h4>
                  <ul className="space-y-2">
                    {keyConcepts.map((concept, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        {concept}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {realExamples.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Real-World Examples
                  </h4>
                  <ul className="space-y-3">
                    {realExamples.map((example, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        {typeof example === 'string' ? (
                          <span>{example}</span>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-semibold text-amber-900">{example.title}</p>
                            {example.description ? <p className="text-amber-800">{example.description}</p> : null}
                            {example.outcome ? (
                              <p className="text-amber-700">
                                <span className="font-semibold">Outcome:</span> {example.outcome}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lessonVisual && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Visual Reference
                  </h4>
                  {renderVisual(lessonVisual)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {renderVisualAssets()}

        {/* Lesson navigation */}
        {content.lessons.length > 1 && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => handleLessonSelect(Math.max(0, currentLessonIndex - 1))}
              disabled={currentLessonIndex === 0}
            >
              Previous Lesson
            </Button>
            <span className="text-sm text-slate-600">
              Lesson {currentLessonIndex + 1} of {content.lessons.length}
            </span>
            <Button
              variant="outline"
              onClick={() => handleLessonSelect(Math.min(content.lessons.length - 1, currentLessonIndex + 1))}
              disabled={currentLessonIndex >= content.lessons.length - 1}
            >
              Next Lesson
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Helper to get scenario text (can be scenario, situation, or context)
  const getScenarioText = (scenario: typeof content.practiceScenarios[0]): string => {
    return scenario.scenario || scenario.situation || scenario.context || '';
  };

  // Helper to get question text (can be question or challenge)
  const getQuestionText = (scenario: typeof content.practiceScenarios[0]): string => {
    return scenario.question || scenario.challenge || 'What would you do?';
  };

  // Helper to get option text (handles both string and object options)
  const getOptionText = (option: typeof content.practiceScenarios[0]['options'][0]): string => {
    if (typeof option === 'string') return option;
    return option.text || '';
  };

  // Helper to get option ID (handles both string and object options)
  const getOptionId = (option: typeof content.practiceScenarios[0]['options'][0], index: number): string => {
    if (typeof option === 'string') return `opt-${index}`;
    return option.id || `opt-${index}`;
  };

  // Helper to check if an answer is correct
  const isAnswerCorrect = (scenario: typeof content.practiceScenarios[0], selectedId: string): boolean => {
    const selectedIndex = scenario.options.findIndex((opt, idx) => getOptionId(opt, idx) === selectedId);

    // If correctAnswer index is provided, use it
    if (typeof scenario.correctAnswer === 'number') {
      return selectedIndex === scenario.correctAnswer;
    }

    // Otherwise check for isCorrect property on options
    const selectedOption = scenario.options[selectedIndex];
    if (typeof selectedOption === 'object' && selectedOption.isCorrect !== undefined) {
      return selectedOption.isCorrect;
    }

    return false;
  };

  // Helper to get feedback for selected answer
  const getAnswerFeedback = (scenario: typeof content.practiceScenarios[0], selectedId: string): string => {
    const selectedIndex = scenario.options.findIndex((opt, idx) => getOptionId(opt, idx) === selectedId);
    const selectedOption = scenario.options[selectedIndex];

    // Check for feedback on the option itself
    if (typeof selectedOption === 'object' && selectedOption.feedback) {
      return selectedOption.feedback;
    }

    // Fall back to scenario-level explanation
    return scenario.explanation || '';
  };

  // Helper to get learning points (handles both string and array)
  const getLearningPoints = (scenario: typeof content.practiceScenarios[0]): string[] => {
    if (scenario.learningPoints && Array.isArray(scenario.learningPoints)) {
      return scenario.learningPoints;
    }
    if (scenario.learningPoint && typeof scenario.learningPoint === 'string') {
      return [scenario.learningPoint];
    }
    return [];
  };

  const renderPracticeStage = () => {
    if (content.practiceScenarios.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              Practice
            </div>
          </div>
          <Card className="border border-slate-200">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Practice scenarios for this module are being developed.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
            <Target className="h-4 w-4" />
            Practice Scenarios
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Apply Your Knowledge
        </h2>

        {content.practiceScenarios.map((scenario) => {
          const scenarioText = getScenarioText(scenario);
          const questionText = getQuestionText(scenario);
          const selectedId = selectedAnswers[scenario.id];
          const isCorrect = selectedId ? isAnswerCorrect(scenario, selectedId) : false;
          const feedback = selectedId ? getAnswerFeedback(scenario, selectedId) : '';
          const learningPoints = getLearningPoints(scenario);

          return (
            <Card key={scenario.id} className="border border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-600" />
                  {scenario.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {scenarioText && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">Scenario:</h4>
                    <p className="text-slate-700 whitespace-pre-line">{scenarioText}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">{questionText}</h4>
                  <div className="space-y-3">
                    {scenario.options.map((option, index) => {
                      const optionId = getOptionId(option, index);
                      const optionText = getOptionText(option);
                      const isSelected = selectedId === optionId;

                      return (
                        <label
                          key={optionId}
                          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={scenario.id}
                            value={optionId}
                            checked={isSelected}
                            onChange={() => setSelectedAnswers(prev => ({ ...prev, [scenario.id]: optionId }))}
                            className="mt-1"
                          />
                          <span className="text-slate-700">{optionText}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {selectedId && (
                  <div className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    {feedback && (
                      <p className="text-sm mb-3">{feedback}</p>
                    )}
                    {learningPoints.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                        <h5 className="font-medium mb-1 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          Key Learning Points:
                        </h5>
                        <ul className="space-y-1">
                          {learningPoints.map((point, i) => (
                            <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-amber-600 mt-1 shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const getAssessmentOptionText = (option: typeof content.assessmentQuestions[0]['options'][0]): string => {
    if (typeof option === 'string') return option;
    return option.text || '';
  };

  const getAssessmentOptionId = (option: typeof content.assessmentQuestions[0]['options'][0], index: number): string => {
    if (typeof option === 'string') return `opt-${index}`;
    return option.id || `opt-${index}`;
  };

  const isAssessmentCorrect = (question: typeof content.assessmentQuestions[0], selectedId: string): boolean => {
    const selectedIndex = question.options.findIndex((opt, idx) => getAssessmentOptionId(opt, idx) === selectedId);

    if (typeof question.correctAnswer === 'number') {
      return selectedIndex === question.correctAnswer;
    }

    const selectedOption = question.options[selectedIndex];
    if (typeof selectedOption === 'object' && selectedOption.isCorrect !== undefined) {
      return selectedOption.isCorrect;
    }

    return false;
  };

  const renderAssessmentStage = () => {
    if (content.assessmentQuestions.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium mb-6">
              <FileText className="h-4 w-4" />
              Assessment
            </div>
          </div>
          <Card className="border border-slate-200">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Assessment questions for this module are being prepared.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const assessmentScore = calculateAssessmentScore();
    const assessmentCompleted = content.assessmentQuestions.every((question) => assessmentAnswers[question.id]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-6">
            <FileText className="h-4 w-4" />
            Assessment
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          Knowledge Check
        </h2>

        {content.assessmentQuestions.map((question, index) => {
          const selectedId = assessmentAnswers[question.id];
          const answered = Boolean(selectedId);
          const isCorrect = selectedId ? isAssessmentCorrect(question, selectedId) : false;

          return (
            <Card key={question.id} className="border border-indigo-200">
              <CardHeader>
                <CardTitle className="text-base">
                  Question {index + 1} of {content.assessmentQuestions.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-800">{question.question}</p>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const optionId = getAssessmentOptionId(option, optionIndex);
                    const optionText = getAssessmentOptionText(option);
                    const isSelected = selectedId === optionId;
                    return (
                      <label
                        key={optionId}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optionId}
                          checked={isSelected}
                          onChange={() => {
                            setAssessmentTouched(true);
                            setAssessmentAnswers(prev => ({ ...prev, [question.id]: optionId }));
                          }}
                          className="mt-1"
                        />
                        <span className="text-slate-700">{optionText}</span>
                      </label>
                    );
                  })}
                </div>

                {answered && (
                  <div className={`p-3 rounded-lg border ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {isCorrect ? 'Correct' : 'Review this concept'}
                      </span>
                    </div>
                    {question.explanation && (
                      <p className="text-xs text-slate-600 mt-2">{question.explanation}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {assessmentTouched && (
          <Card className="border border-indigo-200 bg-indigo-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-indigo-900">Assessment Progress</div>
                <div className="text-xs text-indigo-700">
                  {assessmentCompleted ? "All questions answered." : "Complete all questions to finalize your score."}
                </div>
              </div>
              <Badge className="bg-indigo-600">{assessmentScore}%</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSummaryStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
          <Award className="h-4 w-4" />
          Summary
        </div>
      </div>

      <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Module Complete!</h2>
          <p className="text-slate-600 mb-6">Congratulations on completing {content.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{content.estimatedDuration} min</div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{calculateAssessmentScore()}%</div>
              <div className="text-sm text-slate-600">Assessment Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Nasara Connect Certificate</CardTitle>
          <CardDescription>Complete the assessment to unlock your certificate.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-slate-700">Pass mark: 80%</p>
              <p className="text-xs text-slate-500">Certificate includes module title, score, and issue date.</p>
            </div>
            {calculateAssessmentScore() >= 80 ? (
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <a href={`/training-library/certificate/${moduleId}?score=${calculateAssessmentScore()}`}>Download Certificate</a>
              </Button>
            ) : (
              <Badge variant="outline" className="text-slate-500">Complete assessment to unlock</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {content.summary.keyTakeaways.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {content.summary.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{formatListItem(takeaway)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {content.summary.nextSteps.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.summary.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{formatListItem(step)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(() => {
        const quickReference = content.summary.quickReference;
        const hasQuickReference = Array.isArray(quickReference)
          ? quickReference.length > 0
          : Boolean(quickReference && (quickReference.items?.length || quickReference.title));

        if (!hasQuickReference) return null;

        return (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
            <CardDescription>Key terms and reminders for day-to-day use</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(quickReference) ? (
              <ul className="space-y-2">
                {quickReference.map((item, index) => (
                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {formatListItem(item)}
                  </li>
                ))}
              </ul>
            ) : quickReference ? (
              <div className="space-y-3">
                {quickReference.title ? (
                  <h4 className="text-sm font-semibold text-slate-900">{quickReference.title}</h4>
                ) : null}
                <div className="space-y-2">
                  {(quickReference.items || []).map((item, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-semibold text-slate-900">{item.term}</div>
                      <div className="text-sm text-slate-600">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        );
      })()}
    </div>
  );

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'hook':
        return renderHookStage();
      case 'content':
        return renderContentStage();
      case 'practice':
        return renderPracticeStage();
      case 'assessment':
        return renderAssessmentStage();
      case 'summary':
        return renderSummaryStage();
      default:
        return renderHookStage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{content.title}</h1>
          <p className="text-slate-600 mt-1">{content.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {content.estimatedDuration} min
          </Badge>
          <Badge className={
            content.difficulty === 'beginner' ? 'bg-green-600' :
            content.difficulty === 'intermediate' ? 'bg-amber-600' :
            'bg-red-600'
          }>
            {content.difficulty}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Learning Progress</h3>
            <span className="text-sm text-slate-600">{Math.round(getStageProgress())}% Complete</span>
          </div>
          <Progress value={getStageProgress()} className="h-3" />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span className={currentStage === 'hook' ? 'font-medium text-slate-700' : ''}>Hook</span>
            <span className={currentStage === 'content' ? 'font-medium text-slate-700' : ''}>Content</span>
            <span className={currentStage === 'practice' ? 'font-medium text-slate-700' : ''}>Practice</span>
            <span className={currentStage === 'assessment' ? 'font-medium text-slate-700' : ''}>Assessment</span>
            <span className={currentStage === 'summary' ? 'font-medium text-slate-700' : ''}>Summary</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Content */}
      {renderCurrentStage()}

      {/* Navigation */}
      <div className="flex justify-center">
        <Button
          onClick={nextStage}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {currentStage === 'summary' ? 'Complete' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
