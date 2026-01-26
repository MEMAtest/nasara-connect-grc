"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, TrendingUp, RefreshCw, Lightbulb, Quote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import type { PredictiveScore, RiskLevel, RiskArea } from "@/lib/fca-intelligence/predictive-scorer";

interface PredictiveInsightsProps {
  projectId: string;
  onScoreChange?: (score: number) => void;
}

const riskLevelConfig: Record<RiskLevel, { color: string; bgColor: string; borderColor: string; label: string }> = {
  low: { color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", label: "Low Risk" },
  medium: { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", label: "Medium Risk" },
  high: { color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", label: "High Risk" },
  critical: { color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", label: "Critical Risk" },
};

function getGaugeColor(likelihood: number): string {
  if (likelihood >= 75) return "#10b981"; // emerald
  if (likelihood >= 50) return "#f59e0b"; // amber
  if (likelihood >= 25) return "#f97316"; // orange
  return "#ef4444"; // red
}

export function PredictiveInsights({ projectId, onScoreChange }: PredictiveInsightsProps) {
  const [prediction, setPrediction] = useState<PredictiveScore | null>(null);
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

      const data = await response.json();
      setPrediction(data.prediction);
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

      {/* Top Risks */}
      {prediction.topRisks.length > 0 && (
        <Card className="border-rose-200">
          <CardHeader className="bg-rose-50 pb-3">
            <CardTitle className="text-rose-800 flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Firms Like Yours Failed Because...
            </CardTitle>
            <CardDescription className="text-rose-600">
              FCA refusals matching your current profile
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {prediction.topRisks.map((risk, index) => (
              <RiskAreaCard key={index} risk={risk} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section Scores */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Section Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(prediction.sectionScores)
            .sort(([, a], [, b]) => a - b)
            .map(([section, score]) => (
              <div key={section} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-slate-600 truncate capitalize">
                  {section.replace(/_/g, " ")}
                </div>
                <div className="flex-1">
                  <Progress
                    value={score}
                    className={`h-2 ${
                      score < 40 ? "[&>div]:bg-rose-500" :
                      score < 60 ? "[&>div]:bg-amber-500" :
                      score < 80 ? "[&>div]:bg-blue-500" :
                      "[&>div]:bg-emerald-500"
                    }`}
                  />
                </div>
                <div className={`w-10 text-right text-sm font-semibold ${
                  score < 40 ? "text-rose-600" :
                  score < 60 ? "text-amber-600" :
                  score < 80 ? "text-blue-600" :
                  "text-emerald-600"
                }`}>
                  {score}%
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

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

function RiskAreaCard({ risk }: { risk: RiskArea }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-800">{risk.area}</h4>
        <Badge variant={risk.score < 40 ? "destructive" : risk.score < 60 ? "secondary" : "outline"}>
          {risk.score}%
        </Badge>
      </div>

      {risk.quote && (
        <blockquote className="bg-slate-50 border-l-4 border-slate-300 pl-4 py-2 my-3 text-sm text-slate-600 italic flex items-start gap-2">
          <Quote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>"{risk.quote}"</span>
        </blockquote>
      )}

      <div className="flex items-start gap-2 mt-3">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          <span className="font-medium">Mitigation:</span> {risk.mitigation}
        </p>
      </div>
    </div>
  );
}

export default PredictiveInsights;
