"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, Sparkles, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@/components/organization-provider";
import { usePolicyProfile } from "@/lib/policies";
import type { StoredPolicy } from "@/lib/server/policy-store";
import { cn } from "@/lib/utils";

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
  const { data, error, isLoading, mutate } = useSWR<StoredPolicy[]>("/api/policies", fetcher);
  const { organizationId } = useOrganization();
  const { profile, isLoading: isProfileLoading } = usePolicyProfile({ organizationId });
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const highlightId = searchParams.get("highlight");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewPolicy, setPreviewPolicy] = useState<StoredPolicy | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<StoredPolicy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const policies = useMemo(() => data ?? [], [data]);

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

  useEffect(() => {
    if (!highlightId) return;
    const node = document.getElementById(`policy-${highlightId}`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, filteredPolicies.length]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleDelete = async () => {
    if (!deletePolicy) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/policies/${deletePolicy.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Unable to delete policy");
      }
      await mutate((current) => current?.filter((policy) => policy.id !== deletePolicy.id), false);
      await mutate();
      toast({
        title: "Policy deleted",
        description: `${deletePolicy.name} has been removed.`,
        variant: "success",
      });
      setDeletePolicy(null);
    } catch (err) {
      toast({
        title: "Unable to delete policy",
        description: err instanceof Error ? err.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const firmName =
    typeof profile?.firmProfile?.name === "string" ? profile.firmProfile.name.trim() : "";
  const showFirmSetupCallout = !isProfileLoading && firmName.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Policies" }]} />
      </div>
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
              const updatedLabel = formatDate(policy.updatedAt);

              const isHighlighted = highlightId === policy.id;
              return (
                <li
                  key={policy.id}
                  id={`policy-${policy.id}`}
                  className={cn(
                    "rounded-3xl border bg-white p-6 shadow-sm transition",
                    isHighlighted ? "border-emerald-200 bg-emerald-50/40 ring-2 ring-emerald-100" : "border-slate-200",
                  )}
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900">{policy.name}</p>
                          <Badge variant="outline" className={`text-[11px] ${statusTone}`}>
                            {STATUS_LABELS[policy.status] ?? policy.status.replace("_", " ")}
                          </Badge>
                          {updatedLabel !== "n/a" ? (
                            <Badge variant="secondary" className="text-[11px]">
                              Updated {updatedLabel}
                            </Badge>
                          ) : null}
                          {isHighlighted ? (
                            <Badge variant="secondary" className="text-[11px]">
                              Added
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-500">{policy.description}</p>
                        <p className="text-xs text-slate-400">
                          Code {policy.code}
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

                    <div className="flex min-w-[260px] flex-col gap-3">
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setDeletePolicy(policy)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>

                      <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Owner</span>
                          <p className="mt-1 text-sm font-semibold text-slate-700">{ownerLabel}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Next review</span>
                          <p className="mt-1 text-sm font-semibold text-slate-700">{reviewLabel}</p>
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

      <AlertDialog
        open={Boolean(deletePolicy)}
        onOpenChange={(open) => (!open ? setDeletePolicy(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete policy</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePolicy
                ? `This will permanently remove "${deletePolicy.name}" from the register. This cannot be undone.`
                : "This will permanently remove the selected policy. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {isDeleting ? "Deleting..." : "Delete policy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
