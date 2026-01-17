"use client";

import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MatchDetails {
  nameScore: number;
  dobMatch: {
    matches: boolean;
    confidence: "exact" | "partial" | "year_only" | "none";
  };
  countryMatch: boolean;
  aliasMatched?: string;
}

interface MatchedEntry {
  id: string;
  name: string;
  type: "individual" | "company";
  dob?: string | null;
  countries: string[];
  aliases: string[];
  listName: string;
  listType: "sanctions" | "pep" | "adverse_media";
  reason?: string;
  addedDate?: string;
  sourceUrl?: string;
}

interface ScreeningMatch {
  recordId: string;
  recordName: string;
  matchScore: number;
  matchedEntry: MatchedEntry;
  matchDetails: MatchDetails;
  status: "pending_review" | "confirmed_match" | "false_positive";
}

interface MatchReviewCardProps {
  match: ScreeningMatch;
  onConfirmMatch: (matchId: string) => void;
  onMarkFalsePositive: (matchId: string) => void;
  isProcessing?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 0.85) return "bg-red-100 text-red-700";
  if (score >= 0.75) return "bg-amber-100 text-amber-700";
  return "bg-yellow-100 text-yellow-700";
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "confirmed_match":
      return {
        icon: AlertTriangle,
        bg: "bg-red-50",
        border: "border-red-200",
        badge: "bg-red-100 text-red-700",
        label: "Confirmed Match",
      };
    case "false_positive":
      return {
        icon: CheckCircle,
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700",
        label: "False Positive",
      };
    default:
      return {
        icon: Flag,
        bg: "bg-amber-50",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-700",
        label: "Pending Review",
      };
  }
}

export function MatchReviewCard({
  match,
  onConfirmMatch,
  onMarkFalsePositive,
  isProcessing,
}: MatchReviewCardProps) {
  const statusConfig = getStatusConfig(match.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={cn("transition-all", statusConfig.bg, statusConfig.border)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", match.status === "confirmed_match" ? "text-red-600" : match.status === "false_positive" ? "text-emerald-600" : "text-amber-600")} />
            <CardTitle className="text-base font-semibold text-slate-900">
              {match.recordName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getScoreColor(match.matchScore)}>
              {Math.round(match.matchScore * 100)}% match
            </Badge>
            <Badge className={statusConfig.badge}>{statusConfig.label}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Details */}
        <div className="rounded-lg bg-white/80 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Matched to:</span>
            <span className="font-medium text-slate-900">{match.matchedEntry.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">List:</span>
            <Badge variant="outline" className="text-xs">
              {match.matchedEntry.listName}
            </Badge>
          </div>

          {match.matchedEntry.countries.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Countries:</span>
              <span className="text-sm text-slate-900">{match.matchedEntry.countries.join(", ")}</span>
            </div>
          )}

          {match.matchedEntry.reason && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Reason:</span>
              <span className="text-sm text-slate-900">{match.matchedEntry.reason}</span>
            </div>
          )}

          {match.matchDetails.aliasMatched && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Matched via alias:</span>
              <span className="text-sm text-slate-900">{match.matchDetails.aliasMatched}</span>
            </div>
          )}
        </div>

        {/* Match Scoring Details */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded bg-white/80 p-2">
            <span className="block font-medium text-slate-700">
              {Math.round(match.matchDetails.nameScore * 100)}%
            </span>
            <span className="text-slate-500">Name Score</span>
          </div>
          <div className="rounded bg-white/80 p-2">
            <span className={cn(
              "block font-medium",
              match.matchDetails.dobMatch.matches ? "text-emerald-600" : "text-slate-400"
            )}>
              {match.matchDetails.dobMatch.matches
                ? match.matchDetails.dobMatch.confidence === "exact"
                  ? "Exact"
                  : "Partial"
                : "N/A"
              }
            </span>
            <span className="text-slate-500">DOB Match</span>
          </div>
          <div className="rounded bg-white/80 p-2">
            <span className={cn(
              "block font-medium",
              match.matchDetails.countryMatch ? "text-emerald-600" : "text-slate-400"
            )}>
              {match.matchDetails.countryMatch ? "Yes" : "No"}
            </span>
            <span className="text-slate-500">Country</span>
          </div>
        </div>

        {/* Actions */}
        {match.status === "pending_review" && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkFalsePositive(match.recordId)}
              disabled={isProcessing}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              False Positive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfirmMatch(match.recordId)}
              disabled={isProcessing}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="mr-1 h-4 w-4" />
              Confirm Match
            </Button>
          </div>
        )}

        {/* Source Link */}
        {match.matchedEntry.sourceUrl && isSafeUrl(match.matchedEntry.sourceUrl) && (
          <div className="flex justify-end pt-2">
            <a
              href={match.matchedEntry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
            >
              View Source <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
