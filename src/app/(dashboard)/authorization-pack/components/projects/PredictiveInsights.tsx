"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, TrendingUp, RefreshCw, Lightbulb, BookOpen, FileText, ArrowRight, Shield, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import type { PredictiveScore, RiskLevel, EnhancedRiskArea, ProfileResponseValue } from "@/lib/fca-intelligence/predictive-scorer";
import { THRESHOLD_SECTIONS, SECTION_METADATA } from "@/lib/fca-intelligence/question-section-mapping";
import { SCORE_THRESHOLDS } from "@/lib/fca-intelligence/constants";

/** Maximum linked answers to display before showing "more" indicator */
const MAX_VISIBLE_ANSWERS = 3;

// ============================================================================
// Types
// ============================================================================

interface PredictiveInsightsProps {
  projectId: string;
  onScoreChange?: (score: number) => void;
}

interface HardGateFailure {
  questionId: string;
  question: string;
  score: number;
  threshold: number;
  message: string;
  fcaReference?: string;
}

interface PredictionResponse {
  prediction: PredictiveScore;
  source?: "question_bank" | "business_plan_profile";
  hardGateFailures?: HardGateFailure[];
  questionStats?: {
    totalQuestions: number;
    answeredQuestions: number;
    completionPercentage: number;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Get progress bar color class based on score */
function getProgressBarColor(score: number): string {
  if (score < SCORE_THRESHOLDS.NEEDS_FOCUS) return "[&>div]:bg-amber-500";
  if (score < SCORE_THRESHOLDS.DEVELOPING) return "[&>div]:bg-amber-400";
  if (score < SCORE_THRESHOLDS.STRONG) return "[&>div]:bg-blue-500";
  return "[&>div]:bg-emerald-500";
}

/** Get progress bar text color class based on score */
function getProgressTextColor(score: number): string {
  if (score < SCORE_THRESHOLDS.NEEDS_FOCUS) return "text-amber-700";
  if (score < SCORE_THRESHOLDS.DEVELOPING) return "text-amber-600";
  if (score < SCORE_THRESHOLDS.STRONG) return "text-blue-600";
  return "text-emerald-600";
}

/** Get score badge styling based on score */
function getScoreBadgeStyle(score: number): string {
  if (score < SCORE_THRESHOLDS.NEEDS_FOCUS) return "bg-amber-100 text-amber-800 border-amber-200";
  if (score < SCORE_THRESHOLDS.STRONG) return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

/** Get score label based on score */
function getScoreLabel(score: number): string {
  if (score < SCORE_THRESHOLDS.NEEDS_FOCUS) return "Needs Focus";
  if (score < SCORE_THRESHOLDS.STRONG) return "Developing";
  return "Strong";
}

/** Get gauge color based on likelihood percentage */
function getGaugeColor(likelihood: number): string {
  if (likelihood >= 75) return "#10b981"; // emerald
  if (likelihood >= 50) return "#f59e0b"; // amber
  if (likelihood >= 25) return "#f97316"; // orange
  return "#ef4444"; // red
}

/** Format answer value for display */
function formatAnswer(value: ProfileResponseValue): string {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    if (value.trim() === "") return "Not provided";
    if (value.length > 100) return value.substring(0, 100) + "...";
    return value;
  }
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "None selected";
    return value.join(", ");
  }
  return String(value);
}

// ============================================================================
// Configuration
// ============================================================================

/** Risk level display configuration with supportive labels */
const riskLevelConfig: Record<RiskLevel, { color: string; bgColor: string; borderColor: string; label: string }> = {
  low: { color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", label: "Strong Foundation" },
  medium: { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", label: "Developing Well" },
  high: { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", label: "Requires Attention" },
  critical: { color: "text-amber-800", bgColor: "bg-amber-100", borderColor: "border-amber-300", label: "Needs Focus" },
};

export function PredictiveInsights({ projectId, onScoreChange }: PredictiveInsightsProps) {
  const [prediction, setPrediction] = useState<PredictiveScore | null>(null);
  const [hardGateFailures, setHardGateFailures] = useState<HardGateFailure[]>([]);
  const [questionStats, setQuestionStats] = useState<PredictionResponse["questionStats"]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPrediction = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/predict`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch prediction");
      }

      const data: PredictionResponse = await response.json();
      setPrediction(data.prediction);
      setHardGateFailures(data.hardGateFailures ?? []);
      setQuestionStats(data.questionStats);
      onScoreChange?.(data.prediction.approvalLikelihood);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate prediction");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId, onScoreChange]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <NasaraLoader label="Calculating approval likelihood..." />
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <p className="text-sm text-amber-700">{error || "Unable to calculate prediction"}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchPrediction()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const riskConfig = riskLevelConfig[prediction.riskLevel];
  const gaugeColor = getGaugeColor(prediction.approvalLikelihood);
  const gaugeAngle = (prediction.approvalLikelihood / 100) * 180;

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-white" />
              <h3 className="text-white font-semibold">FCA Authorization Readiness</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => fetchPrediction(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Approval Likelihood Gauge */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Approval Likelihood
              </p>

              <div className="relative w-40 h-24">
                <svg viewBox="0 0 100 55" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled arc */}
                  <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(gaugeAngle / 180) * 141.37} 141.37`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                  <span className="text-3xl font-bold text-slate-800">
                    {prediction.approvalLikelihood}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center mt-2">
                Based on FCA historical patterns
              </p>
            </div>

            {/* Risk Level Badge */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Risk Assessment
              </p>

              <div className={`${riskConfig.bgColor} ${riskConfig.borderColor} border-2 rounded-xl px-6 py-4 text-center`}>
                {prediction.riskLevel === "low" || prediction.riskLevel === "medium" ? (
                  <CheckCircle className={`w-8 h-8 ${riskConfig.color} mx-auto mb-2`} />
                ) : (
                  <AlertTriangle className={`w-8 h-8 ${riskConfig.color} mx-auto mb-2`} />
                )}
                <p className={`text-lg font-bold ${riskConfig.color}`}>
                  {riskConfig.label}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hard Gate Failures - Critical Threshold Conditions */}
      {hardGateFailures.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4" />
              Threshold Conditions Not Met
            </CardTitle>
            <CardDescription className="text-red-700">
              These FCA threshold conditions must be addressed before your application can proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hardGateFailures.map((failure, index) => (
              <div key={index} className="bg-white border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 mb-1">{failure.question}</p>
                    <p className="text-sm text-red-700 mb-2">{failure.message}</p>
                    {failure.fcaReference && (
                      <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                        {failure.fcaReference}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Threshold Conditions Overview */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            FCA Threshold Conditions
          </CardTitle>
          <CardDescription>
            These regulatory requirements must be met for authorization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {THRESHOLD_SECTIONS.map((sectionKey) => {
            const score = prediction.sectionScores[sectionKey];
            const metadata = SECTION_METADATA[sectionKey];
            const isPassing = score !== undefined && score >= SCORE_THRESHOLDS.NEEDS_FOCUS;
            const hasFailure = hardGateFailures.some(f => {
              const section = Object.entries(prediction.sectionScores).find(([key]) => key === sectionKey);
              return section && score !== undefined && score < SCORE_THRESHOLDS.NEEDS_FOCUS;
            });

            if (score === undefined) return null;

            return (
              <div key={sectionKey} className="flex items-center gap-3">
                <div className="shrink-0">
                  {isPassing ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {metadata?.label || sectionKey.replace(/_/g, " ")}
                    </span>
                    {metadata?.fcaReference && (
                      <Badge variant="secondary" className="text-xs">
                        {metadata.fcaReference}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      value={score}
                      className={`h-1.5 flex-1 ${getProgressBarColor(score)}`}
                    />
                    <span className={`text-xs font-medium ${getProgressTextColor(score)}`}>
                      {score}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Areas to Strengthen - Supportive Framing */}
      {prediction.enhancedRisks && prediction.enhancedRisks.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 pb-3">
            <CardTitle className="text-slate-800 flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Areas to Strengthen for FCA Approval
            </CardTitle>
            <CardDescription className="text-slate-600">
              Based on your answers, here is where we will focus to build a strong application
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {prediction.enhancedRisks.map((risk, index) => (
              <EnhancedRiskAreaCard key={index} risk={risk} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Non-Threshold Section Scores */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Other Section Readiness</CardTitle>
          <CardDescription>
            Additional regulatory areas that support your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(prediction.sectionScores)
            .filter(([section]) => !THRESHOLD_SECTIONS.includes(section))
            .sort(([, a], [, b]) => a - b)
            .map(([section, score]) => {
              const metadata = SECTION_METADATA[section];
              return (
                <div key={section} className="flex items-center gap-3">
                  <div className="w-36 text-sm font-medium text-slate-600 truncate">
                    {metadata?.label || section.replace(/_/g, " ")}
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={score}
                      className={`h-2 ${getProgressBarColor(score)}`}
                    />
                  </div>
                  <div className={`w-10 text-right text-sm font-semibold ${getProgressTextColor(score)}`}>
                    {score}%
                  </div>
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Question Completion Stats */}
      {questionStats && questionStats.totalQuestions > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Assessment Completion
              </div>
              <div className="text-sm font-medium text-slate-800">
                {questionStats.answeredQuestions} of {questionStats.totalQuestions} questions ({questionStats.completionPercentage}%)
              </div>
            </div>
            <Progress
              value={questionStats.completionPercentage}
              className="h-2 mt-2 [&>div]:bg-blue-500"
            />
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {prediction.recommendations.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 pb-3">
            <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prediction.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                  <Badge variant="secondary" className="mt-0.5 shrink-0">
                    {index + 1}
                  </Badge>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Enhanced Risk Area Card with supportive framing
 */
function EnhancedRiskAreaCard({ risk }: { risk: EnhancedRiskArea }) {
  const visibleAnswers = risk.linkedAnswers?.slice(0, MAX_VISIBLE_ANSWERS) ?? [];
  const remainingAnswersCount = (risk.linkedAnswers?.length ?? 0) - MAX_VISIBLE_ANSWERS;

  return (
    <div className="p-4 first:pt-4 last:pb-4">
      {/* Header with area name and score */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-800">{risk.area}</h4>
        <Badge className={`${getScoreBadgeStyle(risk.score)} border`}>
          {getScoreLabel(risk.score)} · {risk.score}%
        </Badge>
      </div>

      {/* Supportive message */}
      <p className="text-sm text-slate-700 mb-4">
        {risk.supportiveMessage}
      </p>

      {/* Case Reference Box - Educational framing */}
      {risk.caseReference && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {risk.caseReference.thematicReview
                  ? `${risk.caseReference.caseName} (${risk.caseReference.thematicReview})`
                  : risk.caseReference.caseName
                }
              </p>
              <p className="text-sm text-slate-600">
                {risk.caseReference.educationalContext}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Linked Answers Section */}
      {visibleAnswers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Your Answers
          </p>
          <div className="space-y-2">
            {visibleAnswers.map((insight, idx) => (
              <div key={idx} className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
                <p className="font-medium text-slate-700 mb-1">{insight.questionPrompt}</p>
                <p className="text-amber-800 mb-2">
                  Your answer: {formatAnswer(insight.userAnswer)}
                </p>
                <p className="text-slate-600 flex items-start gap-1">
                  <ArrowRight className="w-3 h-3 mt-1 shrink-0 text-blue-500" />
                  <span>{insight.strengtheningSuggestion}</span>
                </p>
              </div>
            ))}
            {remainingAnswersCount > 0 && (
              <p className="text-xs text-slate-500 italic mt-2 pl-1">
                + {remainingAnswersCount} more {remainingAnswersCount === 1 ? "answer" : "answers"} to review
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Items - "We will strengthen this by..." */}
      {risk.actionItems && risk.actionItems.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            We will strengthen this by
          </p>
          <ul className="space-y-1">
            {risk.actionItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PredictiveInsights;
