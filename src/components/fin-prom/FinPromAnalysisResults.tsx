"use client";

import { AlertTriangle, AlertCircle, CheckCircle, Info, RefreshCw, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ComplianceIssue {
  severity: "high" | "medium" | "low";
  category: string;
  description: string;
  regulation: string;
  recommendation: string;
}

export interface ExtractedDetails {
  promotionType: string;
  channel: string;
  targetAudience: string;
  productService: string;
  riskWarningsFound: boolean;
  claimsIdentified: string[];
}

export interface AnalysisResult {
  complianceScore: number;
  issues: ComplianceIssue[];
  extractedDetails: ExtractedDetails;
  summary: string;
}

interface FinPromAnalysisResultsProps {
  result: AnalysisResult;
  onAccept: () => void;
  onEdit: () => void;
  onRescan: () => void;
  isLoading?: boolean;
}

const severityConfig = {
  high: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getScoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Good", color: "bg-emerald-100 text-emerald-700" };
  if (score >= 60) return { text: "Needs Attention", color: "bg-amber-100 text-amber-700" };
  return { text: "Critical Issues", color: "bg-red-100 text-red-700" };
}

export function FinPromAnalysisResults({
  result,
  onAccept,
  onEdit,
  onRescan,
  isLoading,
}: FinPromAnalysisResultsProps) {
  const scoreLabel = getScoreLabel(result.complianceScore);

  const issuesByPriority = {
    high: result.issues.filter((i) => i.severity === "high"),
    medium: result.issues.filter((i) => i.severity === "medium"),
    low: result.issues.filter((i) => i.severity === "low"),
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score Header */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className={cn("text-4xl font-bold", getScoreColor(result.complianceScore))}>
                {result.complianceScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div>
              <Badge className={scoreLabel.color}>{scoreLabel.text}</Badge>
              <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRescan} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rescan
          </Button>
        </div>
      </div>

      {/* Issues Found */}
      {result.issues.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Issues Found</h3>

          {(["high", "medium", "low"] as const).map((severity) => {
            const issues = issuesByPriority[severity];
            if (issues.length === 0) return null;

            return (
              <div key={severity} className="space-y-2">
                {issues.map((issue, idx) => {
                  const config = severityConfig[severity];
                  const Icon = config.icon;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-lg border p-4",
                        config.bg,
                        config.border
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-5 w-5 mt-0.5", config.text)} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={config.badge}>
                              {severity.toUpperCase()}
                            </Badge>
                            <span className={cn("font-medium", config.text)}>
                              {issue.category}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{issue.description}</p>
                          <div className="rounded bg-white/50 p-2 text-xs">
                            <span className="font-medium text-slate-600">
                              Regulation: {issue.regulation}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-medium text-slate-600">Recommendation:</span>
                            <span className="text-slate-700">{issue.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* No Issues */}
      {result.issues.length === 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-2 font-medium text-emerald-700">No compliance issues detected</p>
          <p className="text-sm text-emerald-600">
            The promotion appears to meet FCA requirements
          </p>
        </div>
      )}

      {/* Extracted Details */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 font-semibold text-slate-900">Extracted Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Promotion Type</span>
            <p className="text-sm text-slate-900">{result.extractedDetails.promotionType || "Not identified"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Channel</span>
            <p className="text-sm text-slate-900">{result.extractedDetails.channel || "Not identified"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Target Audience</span>
            <p className="text-sm text-slate-900">{result.extractedDetails.targetAudience || "Not identified"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Product/Service</span>
            <p className="text-sm text-slate-900">{result.extractedDetails.productService || "Not identified"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Risk Warnings</span>
            <Badge
              className={
                result.extractedDetails.riskWarningsFound
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {result.extractedDetails.riskWarningsFound ? "Found" : "Not Found"}
            </Badge>
          </div>
          {result.extractedDetails.claimsIdentified.length > 0 && (
            <div className="sm:col-span-2 space-y-1">
              <span className="text-xs font-medium text-slate-500">Claims Identified</span>
              <div className="flex flex-wrap gap-1">
                {result.extractedDetails.claimsIdentified.map((claim, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {claim}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Before Saving
        </Button>
        <Button onClick={onAccept} className="bg-teal-600 hover:bg-teal-700">
          <Check className="mr-2 h-4 w-4" />
          Accept & Create Record
        </Button>
      </div>
    </div>
  );
}
