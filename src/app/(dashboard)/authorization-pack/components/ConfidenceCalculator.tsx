"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileCheck,
  Users,
  Target
} from "lucide-react";

interface HardGate {
  id: string;
  name: string;
  description: string;
  status: "passed" | "failed" | "pending";
  critical: boolean;
  evidence?: string[];
}

interface SoftFactor {
  id: string;
  name: string;
  description: string;
  score: number;
  maxScore: number;
  weight: number;
  category: "completeness" | "quality" | "consistency" | "evidence";
}

interface ConfidenceMetrics {
  hardGatesPassed: number;
  totalHardGates: number;
  softFactorScore: number;
  maxSoftFactorScore: number;
  overallConfidence: number;
  level: "high" | "medium" | "low" | "very-low";
  submissionRecommendation: "proceed" | "review" | "delay" | "stop";
}

interface ConfidenceCalculatorProps {
  hardGates: HardGate[];
  softFactors: SoftFactor[];
  lastUpdated?: Date;
}

export function ConfidenceCalculator({
  hardGates,
  softFactors,
  lastUpdated
}: ConfidenceCalculatorProps) {
  const confidence = useMemo((): ConfidenceMetrics => {
    // Calculate hard gates
    const passedHardGates = hardGates.filter(gate => gate.status === "passed").length;
    const criticalFailed = hardGates.some(gate => gate.critical && gate.status === "failed");

    // Calculate soft factors
    const totalSoftScore = softFactors.reduce((sum, factor) => {
      const normalizedScore = (factor.score / factor.maxScore) * factor.weight;
      return sum + normalizedScore;
    }, 0);
    const maxSoftScore = softFactors.reduce((sum, factor) => sum + factor.weight, 0);

    // Calculate overall confidence
    let overallConfidence = 0;

    if (criticalFailed) {
      overallConfidence = 0; // Hard gate failure overrides everything
    } else {
      const hardGateWeight = 0.6;
      const softFactorWeight = 0.4;

      const hardGateScore = passedHardGates / hardGates.length;
      const softFactorScore = maxSoftScore > 0 ? totalSoftScore / maxSoftScore : 0;

      overallConfidence = (hardGateScore * hardGateWeight + softFactorScore * softFactorWeight) * 100;
    }

    // Determine confidence level
    let level: "high" | "medium" | "low" | "very-low";
    if (criticalFailed || overallConfidence < 30) level = "very-low";
    else if (overallConfidence < 50) level = "low";
    else if (overallConfidence < 75) level = "medium";
    else level = "high";

    // Determine submission recommendation
    let submissionRecommendation: "proceed" | "review" | "delay" | "stop";
    if (criticalFailed) submissionRecommendation = "stop";
    else if (overallConfidence >= 85) submissionRecommendation = "proceed";
    else if (overallConfidence >= 65) submissionRecommendation = "review";
    else submissionRecommendation = "delay";

    return {
      hardGatesPassed: passedHardGates,
      totalHardGates: hardGates.length,
      softFactorScore: totalSoftScore,
      maxSoftFactorScore: maxSoftScore,
      overallConfidence: Math.round(overallConfidence),
      level,
      submissionRecommendation
    };
  }, [hardGates, softFactors]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return CheckCircle2;
      case "failed": return AlertTriangle;
      case "pending": return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "failed": return "text-rose-600 bg-rose-50 border-rose-200";
      case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "medium": return "text-blue-600 bg-blue-50 border-blue-200";
      case "low": return "text-amber-600 bg-amber-50 border-amber-200";
      case "very-low": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "proceed": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "review": return "text-blue-600 bg-blue-50 border-blue-200";
      case "delay": return "text-amber-600 bg-amber-50 border-amber-200";
      case "stop": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case "proceed": return "Ready for Submission";
      case "review": return "Review Before Submission";
      case "delay": return "Delay Submission";
      case "stop": return "Do Not Submit";
      default: return "Under Review";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "completeness": return FileCheck;
      case "quality": return Target;
      case "consistency": return Shield;
      case "evidence": return Users;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Confidence */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                Submission Confidence
              </CardTitle>
              <CardDescription>
                Automated confidence assessment for FCA submission
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {confidence.overallConfidence}%
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
          <Progress value={confidence.overallConfidence} className="h-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`${getConfidenceColor(confidence.level)} border`}>
                {confidence.level.replace("-", " ").toUpperCase()} Confidence
              </Badge>
              <Badge className={`${getRecommendationColor(confidence.submissionRecommendation)} border`}>
                {getRecommendationText(confidence.submissionRecommendation)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="h-4 w-4" />
              Hard Gates: {confidence.hardGatesPassed}/{confidence.totalHardGates}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hard Gates */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Hard Gates Assessment</CardTitle>
          <CardDescription>
            Critical requirements that must be met before submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hardGates.map((gate) => {
              const Icon = getStatusIcon(gate.status);
              return (
                <div key={gate.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-lg">
                  <div className={`p-2 rounded-lg ${getStatusColor(gate.status).split(" ")[1]}`}>
                    <Icon className={`h-4 w-4 ${getStatusColor(gate.status).split(" ")[0]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{gate.name}</h4>
                      {gate.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{gate.description}</p>
                    {gate.evidence && gate.evidence.length > 0 && (
                      <div className="text-xs text-slate-500">
                        Evidence: {gate.evidence.join(", ")}
                      </div>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(gate.status)} border`}>
                    {gate.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Soft Factors */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Quality Factors</CardTitle>
          <CardDescription>
            Assessment quality indicators that influence confidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {softFactors.map((factor) => {
              const Icon = getCategoryIcon(factor.category);
              const percentage = Math.round((factor.score / factor.maxScore) * 100);

              return (
                <div key={factor.id} className="p-4 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">{factor.name}</h4>
                      <p className="text-xs text-slate-500">{factor.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">
                        {percentage}%
                      </div>
                      <div className="text-xs text-slate-500">
                        Weight: {factor.weight}x
                      </div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submission Guidance */}
      {confidence.submissionRecommendation !== "proceed" && (
        <Alert className={getRecommendationColor(confidence.submissionRecommendation)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Submission Guidance:</strong>{" "}
            {confidence.submissionRecommendation === "stop" &&
              "Critical hard gates have failed. Address these issues before proceeding with submission."
            }
            {confidence.submissionRecommendation === "delay" &&
              "Confidence level is below threshold. Complete additional assessment areas and address gaps."
            }
            {confidence.submissionRecommendation === "review" &&
              "Good progress made. Review and strengthen areas with lower scores before submission."
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Mock data for demonstration
export const mockHardGates: HardGate[] = [
  {
    id: "senior-management",
    name: "Senior Management Function Holders",
    description: "Appropriate senior management identified and assessed as fit and proper",
    status: "passed",
    critical: true,
    evidence: ["CV and references", "FIT questionnaire", "Criminal record check"]
  },
  {
    id: "capital-adequacy",
    name: "Capital Adequacy",
    description: "Sufficient initial capital and ongoing capital requirements met",
    status: "passed",
    critical: true,
    evidence: ["Audited financial statements", "Capital projections", "Stress testing"]
  },
  {
    id: "risk-management",
    name: "Risk Management Framework",
    description: "Comprehensive risk management policies and procedures in place",
    status: "pending",
    critical: true,
    evidence: ["Risk appetite statement", "Risk policies", "Control framework"]
  },
  {
    id: "systems-controls",
    name: "Systems and Controls",
    description: "Adequate systems and controls for regulated activities",
    status: "pending",
    critical: false,
    evidence: ["System specifications", "Control testing", "IT policies"]
  },
  {
    id: "conduct-policies",
    name: "Conduct and Ethics Policies",
    description: "Consumer Duty and conduct risk policies implemented",
    status: "failed",
    critical: false,
    evidence: ["Consumer Duty framework", "Conduct policies", "Training records"]
  }
];

export const mockSoftFactors: SoftFactor[] = [
  {
    id: "response-completeness",
    name: "Response Completeness",
    description: "Percentage of required questions answered",
    score: 85,
    maxScore: 100,
    weight: 3,
    category: "completeness"
  },
  {
    id: "response-quality",
    name: "Response Quality",
    description: "Depth and quality of responses provided",
    score: 72,
    maxScore: 100,
    weight: 4,
    category: "quality"
  },
  {
    id: "internal-consistency",
    name: "Internal Consistency",
    description: "Consistency across related responses",
    score: 78,
    maxScore: 100,
    weight: 2,
    category: "consistency"
  },
  {
    id: "evidence-coverage",
    name: "Evidence Coverage",
    description: "Supporting evidence provided for key assertions",
    score: 60,
    maxScore: 100,
    weight: 3,
    category: "evidence"
  }
];
