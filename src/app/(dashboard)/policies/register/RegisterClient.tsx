"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { BarChart3, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getGovernance(policy: StoredPolicy) {
  const governance = (policy.customContent as { governance?: Record<string, unknown> } | null)?.governance ?? null;
  return {
    owner: governance && typeof governance.owner === "string" ? governance.owner : null,
    effectiveDate: governance && typeof governance.effectiveDate === "string" ? governance.effectiveDate : null,
    nextReviewAt: governance && typeof governance.nextReviewAt === "string" ? governance.nextReviewAt : null,
  };
}

function getReviewStatus(nextReviewAt: string | null) {
  if (!nextReviewAt) {
    return { label: "Review date missing", tone: "slate" as const };
  }
  const reviewDate = parseDate(nextReviewAt);
  if (!reviewDate) {
    return { label: "Review date missing", tone: "slate" as const };
  }
  const now = new Date();
  const daysUntil = (reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntil < 0) {
    return { label: "Review overdue", tone: "rose" as const };
  }
  if (daysUntil <= 30) {
    return { label: "Review due soon", tone: "amber" as const };
  }
  return { label: "Review scheduled", tone: "emerald" as const };
}

export function RegisterClient() {
  const { data, error, isLoading } = useSWR<StoredPolicy[]>("/api/policies", fetcher);
  const { data: mappingData } = useSWR<{ counts: Record<string, Record<string, number>> }>("/api/policies/mapping", fetcher);
  const asAtLabel = formatDate(new Date().toISOString());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const policies = data ?? [];

  const categories = useMemo(() => {
    return Array.from(new Set(policies.map((policy) => policy.template.category))).sort();
  }, [policies]);

  const reviewCounts = useMemo(() => {
    return policies.reduce(
      (acc, policy) => {
        const { nextReviewAt } = getGovernance(policy);
        const status = getReviewStatus(nextReviewAt);
        if (status.tone === "rose") acc.overdue += 1;
        if (status.tone === "amber") acc.dueSoon += 1;
        if (status.tone === "slate") acc.missing += 1;
        return acc;
      },
      { overdue: 0, dueSoon: 0, missing: 0 },
    );
  }, [policies]);

  const mappedPolicies = useMemo(() => {
    if (!mappingData?.counts) return 0;
    return policies.filter((policy) => {
      const counts = mappingData.counts[policy.id];
      return counts && Object.values(counts).some((value) => value > 0);
    }).length;
  }, [mappingData?.counts, policies]);

  const filteredPolicies = useMemo(() => {
    if (!policies.length) return [];
    const query = searchQuery.trim().toLowerCase();
    return policies.filter((policy) => {
      if (statusFilter !== "all" && policy.status !== statusFilter) return false;
      if (categoryFilter !== "all" && policy.template.category !== categoryFilter) return false;
      if (!query) return true;
      const { owner } = getGovernance(policy);
      const haystack = [
        policy.name,
        policy.code,
        policy.template.category,
        owner ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [policies, searchQuery, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const statusOptions = ["draft", "in_review", "published", "archived"].filter((value) =>
    policies.some((policy) => policy.status === value),
  );

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Policy register</h1>
            <p className="text-sm text-slate-500">As at {asAtLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/policies/mapping" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Coverage
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/policies/wizard" className="gap-2">
                <FileText className="h-4 w-4" />
                New policy
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RegisterStatCard label="Total policies" value={policies.length} helper="All policy records in register." />
          <RegisterStatCard
            label="Drafts"
            value={policies.filter((policy) => policy.status === "draft").length}
            helper="Policies still in draft."
          />
          <RegisterStatCard
            label="Reviews due"
            value={reviewCounts.overdue + reviewCounts.dueSoon}
            helper={`${reviewCounts.overdue} overdue, ${reviewCounts.dueSoon} due soon.`}
            tone="amber"
          />
          <RegisterStatCard
            label="Mapped policies"
            value={mappedPolicies}
            helper="Policies linked to risks/controls."
            tone="emerald"
          />
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_120px]">
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
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters} disabled={!searchQuery && statusFilter === "all" && categoryFilter === "all"}>
            Clear
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">Failed to load policies.</p>
      ) : policies.length ? (
        filteredPolicies.length ? (
          <ul className="space-y-4">
            {filteredPolicies.map((policy) => {
              const governance = getGovernance(policy);
              const reviewStatus = getReviewStatus(governance.nextReviewAt);
              const reviewBadgeTone = {
                rose: "border-rose-200 bg-rose-50 text-rose-700",
                amber: "border-amber-200 bg-amber-50 text-amber-700",
                emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
                slate: "border-slate-200 bg-slate-50 text-slate-500",
              }[reviewStatus.tone];

              const missingMetadata = [
                governance.owner ? null : "Owner",
                governance.effectiveDate ? null : "Effective date",
                governance.nextReviewAt ? null : "Next review",
              ].filter(Boolean);

              const mappingCounts = (mappingData?.counts?.[policy.id] ?? {}) as Record<string, number>;

              return (
                <li key={policy.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{policy.name}</p>
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {policy.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {policy.template.category}
                        </Badge>
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${reviewBadgeTone}`}>
                          {reviewStatus.label}
                        </span>
                        {missingMetadata.length ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                            Metadata incomplete
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500">
                        Code {policy.code} · Created {formatDate(policy.createdAt)} · Updated {formatDate(policy.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/policies/${policy.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/policies/${policy.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Governance snapshot</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Owner</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {governance.owner ?? "Unassigned"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Effective</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {governance.effectiveDate ? formatDate(governance.effectiveDate) : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Next review</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {governance.nextReviewAt ? formatDate(governance.nextReviewAt) : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Owner role</p>
                          <p className="text-sm font-semibold text-slate-800">{policy.approvals.smfRole ?? "TBC"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Mapping coverage</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <Badge variant="outline" className="text-[11px]">
                          Controls {mappingCounts.control ?? 0}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          Risks {mappingCounts.risk ?? 0}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          Training {mappingCounts.training ?? 0}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          Evidence {mappingCounts.evidence ?? 0}
                        </Badge>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        Link controls, risks, training and evidence to complete coverage.
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
            No policies match these filters yet. Try adjusting your search or launch the wizard to create a draft.
          </p>
        )
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
          No policies yet. Run the wizard to create your first draft.
        </p>
      )}
    </div>
  );
}

interface RegisterStatCardProps {
  label: string;
  value: number;
  helper: string;
  tone?: "slate" | "amber" | "emerald";
}

function RegisterStatCard({ label, value, helper, tone = "slate" }: RegisterStatCardProps) {
  const toneClasses = {
    slate: "border-slate-100 bg-slate-50/80 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}
