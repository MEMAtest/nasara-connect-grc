"use client";

import { useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MatchReviewCard } from "./MatchReviewCard";
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

interface PendingScreening {
  id: string;
  name: string;
  type: "individual" | "company";
  source: string;
  addedAt: string;
}

interface ScreeningQueueProps {
  pendingItems: PendingScreening[];
  matches: ScreeningMatch[];
  onScreenNow: () => void;
  onConfirmMatch: (matchId: string) => void;
  onMarkFalsePositive: (matchId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

type FilterStatus = "all" | "pending_review" | "confirmed_match" | "false_positive";

export function ScreeningQueue({
  pendingItems,
  matches,
  onScreenNow,
  onConfirmMatch,
  onMarkFalsePositive,
  onRefresh,
  isLoading = false,
}: ScreeningQueueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.recordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.matchedEntry.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || match.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const pendingReviewCount = matches.filter(
    (m) => m.status === "pending_review"
  ).length;
  const confirmedCount = matches.filter(
    (m) => m.status === "confirmed_match"
  ).length;
  const falsePositiveCount = matches.filter(
    (m) => m.status === "false_positive"
  ).length;

  const handleConfirmMatch = async (matchId: string) => {
    setProcessingId(matchId);
    try {
      await onConfirmMatch(matchId);
    } catch (error) {
      console.error('Failed to confirm match:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkFalsePositive = async (matchId: string) => {
    setProcessingId(matchId);
    try {
      await onMarkFalsePositive(matchId);
    } catch (error) {
      console.error('Failed to mark false positive:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Screening Queue */}
      {pendingItems.length > 0 && (
        <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Screening Queue</h3>
                <p className="text-sm text-slate-600">
                  {pendingItems.length} record{pendingItems.length !== 1 ? "s" : ""} pending screening
                </p>
              </div>
            </div>
            <Button onClick={onScreenNow} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Screen Now
            </Button>
          </div>

          {/* Pending items preview */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pendingItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.type} • {item.source}
                  </p>
                </div>
              </div>
            ))}
            {pendingItems.length > 6 && (
              <div className="flex items-center justify-center rounded-lg bg-white/50 px-3 py-2">
                <p className="text-sm text-slate-500">
                  +{pendingItems.length - 6} more
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Matches Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Potential Matches
            </h3>
            <p className="text-sm text-slate-600">
              Review and resolve screening matches
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFilterStatus("pending_review")}
            className={cn(
              "rounded-lg border p-3 text-center transition-all hover:border-amber-300",
              filterStatus === "pending_review"
                ? "border-amber-400 bg-amber-50"
                : "bg-white"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-xl font-bold text-amber-700">
                {pendingReviewCount}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">Pending Review</p>
          </button>

          <button
            onClick={() => setFilterStatus("confirmed_match")}
            className={cn(
              "rounded-lg border p-3 text-center transition-all hover:border-red-300",
              filterStatus === "confirmed_match"
                ? "border-red-400 bg-red-50"
                : "bg-white"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xl font-bold text-red-700">
                {confirmedCount}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">Confirmed</p>
          </button>

          <button
            onClick={() => setFilterStatus("false_positive")}
            className={cn(
              "rounded-lg border p-3 text-center transition-all hover:border-emerald-300",
              filterStatus === "false_positive"
                ? "border-emerald-400 bg-emerald-50"
                : "bg-white"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xl font-bold text-emerald-700">
                {falsePositiveCount}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">False Positives</p>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                <Filter className="mr-2 h-4 w-4" />
                {filterStatus === "all"
                  ? "All Status"
                  : filterStatus === "pending_review"
                  ? "Pending Review"
                  : filterStatus === "confirmed_match"
                  ? "Confirmed"
                  : "False Positive"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("pending_review")}>
                Pending Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("confirmed_match")}>
                Confirmed Matches
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("false_positive")}>
                False Positives
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-3">
            {filteredMatches.map((match) => (
              <MatchReviewCard
                key={match.recordId}
                match={match}
                onConfirmMatch={handleConfirmMatch}
                onMarkFalsePositive={handleMarkFalsePositive}
                isProcessing={processingId === match.recordId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <CheckCircle className="mb-3 h-12 w-12 text-emerald-300" />
            <h4 className="font-medium text-slate-900">No Matches Found</h4>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "All records have been screened and cleared"}
            </p>
            {(searchQuery || filterStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
