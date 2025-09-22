"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield
} from "lucide-react";

interface SectionScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  status: "excellent" | "good" | "needs-improvement" | "critical";
  questionsAnswered: number;
  totalQuestions: number;
}

interface OverallScore {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  ragStatus: "red" | "amber" | "green";
  confidenceLevel: "high" | "medium" | "low";
  readinessLevel: "submission-ready" | "minor-gaps" | "major-gaps" | "not-ready";
}

interface ScoringEngineProps {
  sections: SectionScore[];
  lastUpdated?: Date;
}

export function ScoringEngine({ sections, lastUpdated }: ScoringEngineProps) {
  const overallScore = useMemo((): OverallScore => {
    // Calculate weighted score
    const totalWeightedScore = sections.reduce((sum, section) => {
      const sectionPercentage = section.score / section.maxScore;
      return sum + (sectionPercentage * section.weight);
    }, 0);

    const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    const percentage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

    // Determine RAG status
    let ragStatus: "red" | "amber" | "green";
    if (percentage >= 80) ragStatus = "green";
    else if (percentage >= 60) ragStatus = "amber";
    else ragStatus = "red";

    // Determine confidence level based on completion
    const completionRate = sections.reduce((sum, section) => {
      return sum + (section.questionsAnswered / section.totalQuestions);
    }, 0) / sections.length;

    let confidenceLevel: "high" | "medium" | "low";
    if (completionRate >= 0.9) confidenceLevel = "high";
    else if (completionRate >= 0.7) confidenceLevel = "medium";
    else confidenceLevel = "low";

    // Determine readiness level
    let readinessLevel: "submission-ready" | "minor-gaps" | "major-gaps" | "not-ready";
    if (percentage >= 90 && confidenceLevel === "high") readinessLevel = "submission-ready";
    else if (percentage >= 75) readinessLevel = "minor-gaps";
    else if (percentage >= 50) readinessLevel = "major-gaps";
    else readinessLevel = "not-ready";

    return {
      totalScore: totalWeightedScore,
      maxPossibleScore: totalWeight,
      percentage: Math.round(percentage),
      ragStatus,
      confidenceLevel,
      readinessLevel
    };
  }, [sections]);

  const getSectionStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-emerald-500";
      case "good": return "bg-blue-500";
      case "needs-improvement": return "bg-amber-500";
      case "critical": return "bg-rose-500";
      default: return "bg-slate-400";
    }
  };

  const getSectionStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return CheckCircle2;
      case "good": return TrendingUp;
      case "needs-improvement": return Clock;
      case "critical": return AlertTriangle;
      default: return Target;
    }
  };

  const getRAGColor = (rag: string) => {
    switch (rag) {
      case "green": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "amber": return "text-amber-600 bg-amber-50 border-amber-200";
      case "red": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "submission-ready": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "minor-gaps": return "text-blue-700 bg-blue-50 border-blue-200";
      case "major-gaps": return "text-amber-700 bg-amber-50 border-amber-200";
      case "not-ready": return "text-rose-700 bg-rose-50 border-rose-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const getReadinessLabel = (level: string) => {
    switch (level) {
      case "submission-ready": return "Submission Ready";
      case "minor-gaps": return "Minor Gaps";
      case "major-gaps": return "Major Gaps";
      case "not-ready": return "Not Ready";
      default: return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <Target className="h-6 w-6 text-teal-600" />
                </div>
                FCA Readiness Score
              </CardTitle>
              <CardDescription>
                Weighted assessment across all authorization areas
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {overallScore.percentage}%
              </div>
              {lastUpdated && (
                <p className="text-xs text-slate-500 mt-1">
                  Updated {lastUpdated.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={overallScore.percentage} className="h-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`${getRAGColor(overallScore.ragStatus)} border`}>
                {overallScore.ragStatus.toUpperCase()} Status
              </Badge>
              <Badge variant="outline" className={getReadinessColor(overallScore.readinessLevel)}>
                {getReadinessLabel(overallScore.readinessLevel)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4" />
              Confidence: {overallScore.confidenceLevel}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Breakdown */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Section Breakdown</CardTitle>
          <CardDescription>
            Detailed scoring across all assessment areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = getSectionStatusIcon(section.status);
              const percentage = Math.round((section.score / section.maxScore) * 100);

              return (
                <div key={section.id} className="p-4 border border-slate-100 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getSectionStatusColor(section.status)}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{section.name}</h4>
                        <p className="text-sm text-slate-500">
                          {section.questionsAnswered} of {section.totalQuestions} questions completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        {percentage}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {section.score} / {section.maxScore} pts
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">
                        Weight: {section.weight}x
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Score Interpretation */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Score Interpretation</CardTitle>
          <CardDescription>
            Understanding your readiness assessment results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-700">Green (80-100%)</span>
              </div>
              <p className="text-emerald-600">
                Submission ready. Minor refinements may be beneficial.
              </p>
            </div>

            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-700">Amber (60-79%)</span>
              </div>
              <p className="text-amber-600">
                Good progress. Address identified gaps before submission.
              </p>
            </div>

            <div className="p-4 border border-rose-200 bg-rose-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span className="font-medium text-rose-700">Red (0-59%)</span>
              </div>
              <p className="text-rose-600">
                Significant gaps identified. Further development needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data for demonstration
export const mockSectionScores: SectionScore[] = [
  {
    id: "business-model",
    name: "Business Model & Strategy",
    score: 45,
    maxScore: 50,
    weight: 3,
    status: "excellent",
    questionsAnswered: 12,
    totalQuestions: 12
  },
  {
    id: "governance",
    name: "Governance & Management",
    score: 38,
    maxScore: 45,
    weight: 3,
    status: "good",
    questionsAnswered: 13,
    totalQuestions: 15
  },
  {
    id: "risk-management",
    name: "Risk Management Framework",
    score: 32,
    maxScore: 54,
    weight: 4,
    status: "needs-improvement",
    questionsAnswered: 13,
    totalQuestions: 18
  },
  {
    id: "financial-resources",
    name: "Financial Resources",
    score: 15,
    maxScore: 30,
    weight: 2,
    status: "needs-improvement",
    questionsAnswered: 5,
    totalQuestions: 10
  },
  {
    id: "systems-controls",
    name: "Systems & Controls",
    score: 12,
    maxScore: 60,
    weight: 3,
    status: "critical",
    questionsAnswered: 6,
    totalQuestions: 20
  }
];