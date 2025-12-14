"use client";

import useSWR from "swr";
import Link from "next/link";
import { BarChart3, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function RegisterClient() {
  const { data, error, isLoading } = useSWR<StoredPolicy[]>("/api/policies", fetcher);
  const { data: mappingData } = useSWR<{ counts: Record<string, Record<string, number>> }>("/api/policies/mapping", fetcher);
  const asAtLabel = formatDate(new Date().toISOString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Policy register</h1>
          <p className="text-sm text-slate-500">As at {asAtLabel}</p>
        </div>
        <div className="flex items-center gap-2">
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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">Failed to load policies.</p>
      ) : data && data.length ? (
        <ul className="space-y-3">
          {data.map((policy) => (
            <li key={policy.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{policy.name}</p>
                  <Badge variant="outline" className="capitalize text-[11px]">
                    {policy.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px]">
                    {policy.template.category}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Created {formatDate(policy.createdAt)} · Updated {formatDate(policy.updatedAt)} · Code {policy.code}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {(() => {
                    const governance = (policy.customContent as { governance?: Record<string, unknown> } | null)?.governance ?? null;
                    const effectiveDate = governance && typeof governance.effectiveDate === "string" ? governance.effectiveDate : null;
                    const nextReviewAt = governance && typeof governance.nextReviewAt === "string" ? governance.nextReviewAt : null;
                    const owner = governance && typeof governance.owner === "string" ? governance.owner : null;

                    return (
                      <>
                        {effectiveDate ? <span>Effective {formatDate(effectiveDate)}</span> : <span className="italic">No effective date</span>}
                        {nextReviewAt ? <span>· Next review {formatDate(nextReviewAt)}</span> : null}
                        {owner ? <span>· Owner {owner}</span> : null}
                      </>
                    );
                  })()}
                </div>
                {mappingData?.counts?.[policy.id] ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[11px]">
                      Controls {mappingData.counts[policy.id].control ?? 0}
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      Risks {mappingData.counts[policy.id].risk ?? 0}
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      Training {mappingData.counts[policy.id].training ?? 0}
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      Evidence {mappingData.counts[policy.id].evidence ?? 0}
                    </Badge>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/policies/${policy.id}`}>View</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/policies/${policy.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
          No policies yet. Run the wizard to create your first draft.
        </p>
      )}
    </div>
  );
}
