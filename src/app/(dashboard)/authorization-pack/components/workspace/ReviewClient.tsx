"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// Icon components
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

interface ReviewGate {
  id: string;
  stage: string;
  state: string;
  reviewer_role: string;
  section_title: string;
  section_instance_id?: string;
  reviewer_id?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
  client_notes?: string | null;
}

// Review state options
const REVIEW_STATE_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-700", icon: ClockIcon },
  { value: "in-review", label: "In Review", color: "bg-blue-100 text-blue-700", icon: EyeIcon },
  { value: "changes_requested", label: "Changes Requested", color: "bg-orange-100 text-orange-700", icon: ExclamationIcon },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircleIcon },
];

const FILTER_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  ...REVIEW_STATE_OPTIONS,
];

const REVIEWER_ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "client", label: "Client Review" },
  { value: "consultant", label: "Consultant Review" },
];

function getStateColor(state: string) {
  const option = REVIEW_STATE_OPTIONS.find((opt) => opt.value === state);
  return option?.color || "bg-slate-100 text-slate-700";
}

function getStateIcon(state: string) {
  const option = REVIEW_STATE_OPTIONS.find((opt) => opt.value === state);
  return option?.icon || ClockIcon;
}

export function ReviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [review, setReview] = useState<ReviewGate[]>([]);
  const [notes, setNotes] = useState<Record<string, { notes: string; clientNotes: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter states
  const [stateFilter, setStateFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutation error state
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const packResponse = await fetchWithTimeout("/api/authorization-pack/packs?organizationId=default-org").catch(
          () => null
        );
        if (!packResponse || !packResponse.ok) {
          setLoadError("Unable to load packs. Check the database connection and try again.");
          return;
        }
        const packData = await packResponse.json();
        const activePack =
          (packIdParam ? packData.packs?.find((item: PackRow) => item.id === packIdParam) : null) ??
          packData.packs?.[0] ??
          null;
        setPack(activePack);
        if (!activePack) return;

        if (packIdParam !== activePack.id) {
          router.replace(`/authorization-pack/review?packId=${activePack.id}`);
        }

        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        const reviewResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/review`).catch(
          () => null
        );
        if (reviewResponse?.ok) {
          const reviewData = await reviewResponse.json();
          setReview(reviewData.review || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam, router]);

  const handleUpdate = async (gateId: string, state: string) => {
    if (!pack) return;
    setMutationError(null);

    // Store previous state for rollback
    const previousReview = [...review];

    // Optimistic update
    setReview((prev) => prev.map((item) => (item.id === gateId ? { ...item, state } : item)));

    try {
      const payload = notes[gateId] || { notes: "", clientNotes: "" };
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, state, notes: payload.notes, clientNotes: payload.clientNotes }),
      });
      if (!response.ok) {
        throw new Error("Failed to update review status");
      }
    } catch (error) {
      // Rollback on error
      setReview(previousReview);
      setMutationError(error instanceof Error ? error.message : "Failed to update review. Please try again.");
    }
  };

  // Filter review items
  const filteredReview = review.filter((item) => {
    if (stateFilter !== "all" && item.state !== stateFilter) return false;
    if (roleFilter !== "all" && item.reviewer_role !== roleFilter) return false;
    if (searchQuery && !item.section_title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Summary stats
  const stats = useMemo(() => {
    return {
      total: review.length,
      pending: review.filter((r) => r.state === "pending").length,
      inReview: review.filter((r) => r.state === "in-review").length,
      changesRequested: review.filter((r) => r.state === "changes_requested").length,
      approved: review.filter((r) => r.state === "approved").length,
    };
  }, [review]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading review queue...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Review queue unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={null} readiness={null} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Create a pack to manage reviews.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.pending}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <ClockIcon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">In Review</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.inReview}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <EyeIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Changes Requested</p>
                <p className="text-2xl font-semibold text-orange-600">{stats.changesRequested}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <ExclamationIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-500">State</Label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_STATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-500">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEWER_ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mutation Error Display */}
      {mutationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutationError}
          <button
            onClick={() => setMutationError(null)}
            className="ml-2 text-red-500 underline hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Review Queue */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-teal-600" />
            Review Queue
          </CardTitle>
          <CardDescription>
            Manage client and consultant review flows across sections.{" "}
            {filteredReview.length} of {review.length} items shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredReview.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              {review.length === 0 ? "No review items available." : "No items match your filters."}
            </div>
          ) : (
            filteredReview.map((gate) => {
              const StateIcon = getStateIcon(gate.state);
              return (
                <div key={gate.id} className="rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${getStateColor(
                          gate.state
                        )}`}
                      >
                        <StateIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{gate.section_title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {gate.stage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <UserIcon className="h-3 w-3" />
                            {gate.reviewer_role === "client" ? "Client Review" : "Consultant Review"}
                          </span>
                          {gate.reviewed_at && (
                            <span className="text-xs text-slate-400">
                              Reviewed: {new Date(gate.reviewed_at).toLocaleDateString("en-GB")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="mt-4">
                    <Label className="text-xs text-slate-500">Review Status</Label>
                    <Select
                      value={gate.state}
                      onValueChange={(value) => handleUpdate(gate.id, value)}
                    >
                      <SelectTrigger className="mt-1 w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REVIEW_STATE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs ${opt.color}`}
                            >
                              <opt.icon className="h-3 w-3" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Internal Notes (Consultant Only)</Label>
                      <Textarea
                        className="text-sm"
                        rows={3}
                        placeholder="Internal notes not visible to client..."
                        value={notes[gate.id]?.notes ?? gate.notes ?? ""}
                        onChange={(event) =>
                          setNotes((prev) => ({
                            ...prev,
                            [gate.id]: {
                              notes: event.target.value,
                              clientNotes: prev[gate.id]?.clientNotes ?? gate.client_notes ?? "",
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Client Notes (Visible to Client)</Label>
                      <Textarea
                        className="text-sm"
                        rows={3}
                        placeholder="Notes visible to the client..."
                        value={notes[gate.id]?.clientNotes ?? gate.client_notes ?? ""}
                        onChange={(event) =>
                          setNotes((prev) => ({
                            ...prev,
                            [gate.id]: {
                              notes: prev[gate.id]?.notes ?? gate.notes ?? "",
                              clientNotes: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 hover:bg-orange-50"
                      onClick={() => handleUpdate(gate.id, "changes_requested")}
                    >
                      <ExclamationIcon className="mr-1.5 h-3 w-3" />
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdate(gate.id, "approved")}
                    >
                      <CheckCircleIcon className="mr-1.5 h-3 w-3" />
                      Approve
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
