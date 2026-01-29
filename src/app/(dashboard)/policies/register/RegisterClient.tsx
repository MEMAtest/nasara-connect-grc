"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Eye, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolicyProfile } from "@/lib/policies";
import type { StoredPolicy } from "@/lib/server/policy-store";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "n/a";
  }
}

function getGovernance(policy: StoredPolicy) {
  const governance = (policy.customContent as { governance?: Record<string, unknown> } | null)?.governance ?? null;
  return {
    owner: governance && typeof governance.owner === "string" ? governance.owner : null,
    nextReviewAt: governance && typeof governance.nextReviewAt === "string" ? governance.nextReviewAt : null,
  };
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  archived: "Archived",
  expired: "Expired",
};

const STATUS_TONES: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  in_review: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-slate-200 bg-slate-50 text-slate-500",
  expired: "border-rose-200 bg-rose-50 text-rose-700",
};

export function RegisterClient() {
  const { data, error, isLoading } = useSWR<StoredPolicy[]>("/api/policies", fetcher);
  const { profile, isLoading: isProfileLoading } = usePolicyProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewPolicy, setPreviewPolicy] = useState<StoredPolicy | null>(null);

  const policies = data ?? [];

  const statusOptions = useMemo(() => {
    const statuses = ["draft", "in_review", "approved", "archived", "expired"];
    return statuses.filter((value) => policies.some((policy) => policy.status === value));
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    if (!policies.length) return [];
    const query = searchQuery.trim().toLowerCase();
    return policies.filter((policy) => {
      if (statusFilter !== "all" && policy.status !== statusFilter) return false;
      if (!query) return true;
      const { owner } = getGovernance(policy);
      const haystack = [policy.name, policy.code, policy.template.category, owner ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [policies, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const firmName =
    typeof profile?.firmProfile?.name === "string" ? profile.firmProfile.name.trim() : "";
  const showFirmSetupCallout = !isProfileLoading && firmName.length === 0;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Policy register</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Policies</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              A clean list of your policy drafts, approvals, and next review dates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href="/policies/quick-create">
                <Sparkles className="h-4 w-4" />
                Create policy
              </Link>
            </Button>
          </div>
        </div>

        {showFirmSetupCallout ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Firm setup is still missing. Complete onboarding once to prefill every policy.
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_120px]">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by policy name, code, category, or owner"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status] ?? status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!searchQuery && statusFilter === "all"}
          >
            Clear
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">Failed to load policies.</p>
      ) : policies.length ? (
        filteredPolicies.length ? (
          <ul className="grid gap-6 lg:grid-cols-2">
            {filteredPolicies.map((policy) => {
              const governance = getGovernance(policy);
              const statusTone = STATUS_TONES[policy.status] ?? STATUS_TONES.draft;
              const ownerLabel = governance.owner?.trim() || "Unassigned";
              const reviewLabel = governance.nextReviewAt ? formatDate(governance.nextReviewAt) : "Not set";
              const badgeTags = policy.template.badges?.map((badge) => badge.label) ?? [];
              const tagList = badgeTags.length
                ? badgeTags
                : [policy.template.category, policy.code].filter(Boolean);

              return (
                <li key={policy.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900">{policy.name}</p>
                          <Badge variant="outline" className={`text-[11px] ${statusTone}`}>
                            {STATUS_LABELS[policy.status] ?? policy.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{policy.description}</p>
                        <p className="text-xs text-slate-400">
                          Code {policy.code} · Updated {formatDate(policy.updatedAt)}
                        </p>
                      </div>

                      {tagList.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {tagList.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <button type="button" onClick={() => setPreviewPolicy(policy)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </button>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/policies/${policy.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/policies/${policy.id}/edit`}>Edit</Link>
                        </Button>
                      </div>

                      <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Owner</span>
                          <span className="text-sm font-semibold text-slate-700">{ownerLabel}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Next review</span>
                          <span className="text-sm font-semibold text-slate-700">{reviewLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
            No policies match these filters yet. Try adjusting your search or create a new draft.
          </p>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
          <p>No policies yet. Start the policy creator to generate your first draft.</p>
          <Button className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link href="/policies/quick-create">
              <Sparkles className="h-4 w-4" />
              Create policy
            </Link>
          </Button>
        </div>
      )}

      <Dialog open={Boolean(previewPolicy)} onOpenChange={(open) => (!open ? setPreviewPolicy(null) : null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewPolicy?.name ?? "Policy preview"}</DialogTitle>
          </DialogHeader>
          {previewPolicy ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Code {previewPolicy.code}</span>
                <span>·</span>
                <span>{previewPolicy.template.category}</span>
                <span>·</span>
                <span>Updated {formatDate(previewPolicy.updatedAt)}</span>
              </div>
              <iframe
                title={`${previewPolicy.name} preview`}
                src={`/api/policies/${previewPolicy.id}/documents/pdf?inline=1`}
                className="h-[70vh] w-full rounded-2xl border border-slate-200"
              />
              <div className="text-xs text-slate-400">
                Having trouble viewing the preview? Download the PDF from the policy view.
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
