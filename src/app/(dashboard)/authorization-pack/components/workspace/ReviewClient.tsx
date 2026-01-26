"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
  client_notes?: string | null;
}

// Review state options
const REVIEW_STATE_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-700", icon: ClockIcon },
  { value: "in-review", label: "In Review", color: "bg-blue-100 text-blue-700", icon: EyeIcon },
  { value: "changes_requested", label: "Changes Requested", color: "bg-orange-100 text-orange-700", icon: ExclamationIcon },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircleIcon },
];

const REVIEWER_ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "client", label: "Client Review" },
  { value: "consultant", label: "Consultant Review" },
];

const QUICK_CHECKLIST = [
  { id: "firm-profile", category: "Documents", label: "Firm profile complete (legal entity, permissions, scope)" },
  { id: "business-plan", category: "Documents", label: "Business plan narrative drafted" },
  { id: "financial-forecasts", category: "Documents", label: "Financial forecasts (3-year) uploaded" },
  { id: "wind-down", category: "Documents", label: "Wind-down plan prepared" },
  { id: "psd-individuals", category: "Governance", label: "PSD/key persons identified and documented" },
  { id: "controllers", category: "Governance", label: "Controllers list verified (10%/20%/33%/50%)" },
  { id: "governance-forums", category: "Governance", label: "Governance forums and committees documented" },
  { id: "risk-register", category: "Governance", label: "Risk register completed" },
  { id: "cmp", category: "Governance", label: "Compliance Monitoring Plan (CMP) approved" },
  { id: "aml-ctf", category: "Policies", label: "AML/CTF policy approved" },
  { id: "safeguarding", category: "Policies", label: "Safeguarding policy in place (if applicable)" },
  { id: "complaints", category: "Policies", label: "Complaints handling policy approved" },
  { id: "fin-promotions", category: "Policies", label: "Financial promotions policy approved" },
  { id: "outsourcing", category: "Policies", label: "Outsourcing & third-party risk policy approved" },
  { id: "info-security", category: "Policies", label: "Information & cyber security policy approved" },
  { id: "op-resilience", category: "Operational", label: "Operational resilience & incident response documented" },
  { id: "consumer-duty", category: "Operational", label: "Consumer duty & vulnerable customers plan documented" },
  { id: "evidence-pack", category: "Operational", label: "Evidence pack assembled for FCA submission" },
];

function getStateColor(state: string) {
  const option = REVIEW_STATE_OPTIONS.find((opt) => opt.value === state);
  return option?.color || "bg-slate-100 text-slate-700";
}

function getStateIcon(state: string) {
  const option = REVIEW_STATE_OPTIONS.find((opt) => opt.value === state);
  return option?.icon || ClockIcon;
}

// Section group component with collapsible functionality
function ReviewSectionGroup({
  sectionTitle,
  items,
  pack,
  notes,
  setNotes,
  onUpdate,
  onBulkApprove,
  isApproving,
}: {
  sectionTitle: string;
  items: ReviewGate[];
  pack: PackRow;
  notes: Record<string, { clientNotes: string }>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, { clientNotes: string }>>>;
  onUpdate: (gateId: string, state: string) => Promise<void>;
  onBulkApprove: (ids: string[]) => Promise<void>;
  isApproving: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = useMemo(() => {
    return {
      pending: items.filter((item) => item.state === "pending").length,
      inReview: items.filter((item) => item.state === "in-review").length,
      changes: items.filter((item) => item.state === "changes_requested").length,
      approved: items.filter((item) => item.state === "approved").length,
    };
  }, [items]);

  const pendingIds = items.filter((item) => item.state !== "approved").map((item) => item.id);
  const allApproved = stats.approved === items.length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-slate-400" />
          )}
          <span className="font-medium text-slate-900">{sectionTitle}</span>
          <Badge variant="outline" className="text-xs">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {stats.approved > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">
              {stats.approved} approved
            </Badge>
          )}
          {stats.pending > 0 && (
            <Badge className="bg-slate-100 text-slate-700 text-xs">
              {stats.pending} pending
            </Badge>
          )}
          {stats.changes > 0 && (
            <Badge className="bg-orange-100 text-orange-700 text-xs">
              {stats.changes} changes
            </Badge>
          )}
          {allApproved && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          {/* Bulk Approve Button */}
          {!allApproved && pendingIds.length > 0 && (
            <div className="flex justify-end">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onBulkApprove(pendingIds)}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Approve All ({pendingIds.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Individual Items */}
          {items.map((gate) => {
            const StateIcon = getStateIcon(gate.state);
            return (
              <div key={gate.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StateIcon className="h-4 w-4 text-slate-500" />
                      <span className="font-medium text-sm text-slate-900">
                        {gate.stage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <Badge className={`text-xs ${getStateColor(gate.state)}`}>
                        {gate.state.replace(/[_-]/g, " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {gate.reviewer_role === "client" ? "Client review" : "Consultant review"}
                      {gate.reviewed_at && ` - Reviewed ${new Date(gate.reviewed_at).toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {gate.section_instance_id && (
                      <Button size="sm" variant="outline" asChild className="text-xs h-7">
                        <Link href={`/authorization-pack/sections/${gate.section_instance_id}?packId=${pack.id}`}>
                          Open
                        </Link>
                      </Button>
                    )}
                    <Select value={gate.state} onValueChange={(value) => onUpdate(gate.id, value)}>
                      <SelectTrigger className="h-7 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REVIEW_STATE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${opt.color}`}>
                              <opt.icon className="h-3 w-3" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {gate.state !== "approved" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => onUpdate(gate.id, "approved")}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
                    Client notes
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Client Notes</Label>
                      <Textarea
                        className="text-xs h-16"
                        placeholder="Client-visible notes..."
                        value={notes[gate.id]?.clientNotes ?? gate.client_notes ?? ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [gate.id]: {
                              clientNotes: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onUpdate(gate.id, gate.state)}>
                      Save notes
                    </Button>
                    {gate.state !== "changes_requested" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 text-orange-600 hover:bg-orange-50"
                        onClick={() => onUpdate(gate.id, "changes_requested")}
                      >
                        Request Changes
                      </Button>
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [review, setReview] = useState<ReviewGate[]>([]);
  const [notes, setNotes] = useState<Record<string, { clientNotes: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Filter states
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutation error state
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() =>
    QUICK_CHECKLIST.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

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

        const [readinessResponse, reviewResponse] = await Promise.all([
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/review`).catch(() => null),
        ]);
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

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

    const previousReview = [...review];
    setReview((prev) => prev.map((item) => (item.id === gateId ? { ...item, state } : item)));

    try {
      const payload = notes[gateId] || { clientNotes: "" };
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, state, clientNotes: payload.clientNotes }),
      });
      if (!response.ok) {
        throw new Error("Failed to update review status");
      }
    } catch (error) {
      setReview(previousReview);
      setMutationError(error instanceof Error ? error.message : "Failed to update review. Please try again.");
    }
  };

  const handleBulkApprove = async (ids: string[]) => {
    if (!pack || ids.length === 0) return;
    setIsApproving(true);
    setMutationError(null);

    const previousReview = [...review];
    setReview((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, state: "approved" } : item)));

    try {
      const results = await Promise.allSettled(
        ids.map((gateId) =>
          fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gateId, state: "approved" }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to approve ${gateId}`);
            return gateId;
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        // Partial failure - rollback only failed items
        const failedIds = new Set(
          results
            .map((r, i) => (r.status === "rejected" ? ids[i] : null))
            .filter((id): id is string => id !== null)
        );
        setReview((prev) =>
          prev.map((item) => {
            if (failedIds.has(item.id)) {
              const original = previousReview.find((p) => p.id === item.id);
              return original || item;
            }
            return item;
          })
        );
        setMutationError(`${failed.length} of ${ids.length} items failed to approve.`);
      }
    } catch (error) {
      setReview(previousReview);
      setMutationError(error instanceof Error ? error.message : "Failed to bulk approve. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  // Filter review items
  const filteredReview = review.filter((item) => {
    if (roleFilter !== "all" && item.reviewer_role !== roleFilter) return false;
    if (searchQuery && !item.section_title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by section title
  const groupedBySectionTitle = useMemo(() => {
    const groups = new Map<string, ReviewGate[]>();
    filteredReview.forEach((item) => {
      const key = item.section_title || "Other";
      const existing = groups.get(key) || [];
      existing.push(item);
      groups.set(key, existing);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredReview]);

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

  const completionPercent = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const checklistGroups = useMemo(() => {
    const groups = new Map<string, typeof QUICK_CHECKLIST>();
    QUICK_CHECKLIST.forEach((item) => {
      const existing = groups.get(item.category) ?? [];
      existing.push(item);
      groups.set(item.category, existing);
    });
    return Array.from(groups.entries());
  }, []);
  const completedChecklistCount = QUICK_CHECKLIST.filter((item) => checklistState[item.id]).length;
  const toggleChecklistItem = (id: string) => {
    setChecklistState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

      {/* Summary Stats - Compact */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Items</p>
                <p className="text-xl font-semibold text-slate-900">{stats.total}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-600">{completionPercent}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-xl font-semibold text-slate-700">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardContent className="p-3">
            <p className="text-xs text-blue-600">In Review</p>
            <p className="text-xl font-semibold text-blue-700">{stats.inReview}</p>
          </CardContent>
        </Card>
        <Card className="border border-orange-200 bg-orange-50/50">
          <CardContent className="p-3">
            <p className="text-xs text-orange-600">Changes Requested</p>
            <p className="text-xl font-semibold text-orange-700">{stats.changesRequested}</p>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50/50">
          <CardContent className="p-3">
            <p className="text-xs text-green-600">Approved</p>
            <p className="text-xl font-semibold text-green-700">{stats.approved}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Application Ready Checklist</CardTitle>
            <CardDescription>Quick 15-20 item sweep before submission.</CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            {completedChecklistCount}/{QUICK_CHECKLIST.length} complete
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {checklistGroups.map(([category, items]) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category}</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <label key={item.id} className="flex items-start gap-2 text-sm text-slate-600">
                    <Checkbox
                      checked={Boolean(checklistState[item.id])}
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border border-slate-200">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filter:</span>
            </div>
            <Input
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs h-8 text-sm"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
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
            <span className="text-xs text-slate-400 ml-auto">
              {filteredReview.length} of {review.length} items · {groupedBySectionTitle.length} sections
            </span>
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

      {/* Collapsible Section Groups */}
      <div className="space-y-3">
        {groupedBySectionTitle.length > 0 ? (
          groupedBySectionTitle.map(([sectionTitle, items]) => (
            <ReviewSectionGroup
              key={sectionTitle}
              sectionTitle={sectionTitle}
              items={items}
              pack={pack}
              notes={notes}
              setNotes={setNotes}
              onUpdate={handleUpdate}
              onBulkApprove={handleBulkApprove}
              isApproving={isApproving}
            />
          ))
        ) : (
          <Card className="border border-slate-200">
            <CardContent className="p-8 text-center text-slate-400">
              {review.length === 0 ? "No review items available." : "No items match your filters."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
