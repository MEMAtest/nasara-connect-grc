"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredPolicy } from "@/lib/server/policy-store";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDate(value: string | null) {
  if (!value) return "n/a";
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

export function MappingClient() {
  const { data: policies, error, isLoading } = useSWR<StoredPolicy[]>("/api/policies", fetcher);
  const { data: mappingData } = useSWR<{ counts: Record<string, Record<string, number>> }>("/api/policies/mapping", fetcher);
  const [query, setQuery] = useState("");

  const counts = mappingData?.counts ?? {};
  const normalizedQuery = (query ?? "").trim().toLowerCase();

  const filtered = (policies ?? []).filter((policy) => {
    if (!normalizedQuery) return true;
    return (
      policy.name.toLowerCase().includes(normalizedQuery) ||
      policy.code.toLowerCase().includes(normalizedQuery) ||
      policy.template.category.toLowerCase().includes(normalizedQuery)
    );
  });

  const coverage = filtered.map((policy) => {
    const governance = (policy.customContent as { governance?: Record<string, unknown> } | null)?.governance ?? null;
    const effectiveDate = governance && typeof governance.effectiveDate === "string" ? governance.effectiveDate : null;
    const nextReviewAt = governance && typeof governance.nextReviewAt === "string" ? governance.nextReviewAt : null;
    const owner = governance && typeof governance.owner === "string" ? governance.owner : null;

    const policyCounts = counts[policy.id] ?? {};
    return {
      policy,
      governance: { effectiveDate, nextReviewAt, owner },
      counts: {
        control: policyCounts.control ?? 0,
        risk: policyCounts.risk ?? 0,
        training: policyCounts.training ?? 0,
        evidence: policyCounts.evidence ?? 0,
      },
    };
  });

  const uncovered = coverage.filter((row) => row.counts.control === 0 || row.counts.risk === 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Policy coverage</h1>
          <p className="text-sm text-slate-500">
            Map policies to risks, CMP controls, training and evidence to track coverage across the platform.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/policies/register" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Back to register
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search policies (name, code, category)…"
          className="sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Badge variant="outline" className="text-[11px]">
            Policies {filtered.length}
          </Badge>
          <Badge variant={uncovered.length ? "secondary" : "outline"} className="text-[11px]">
            Missing mapping {uncovered.length}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">Failed to load policy coverage.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Effective</th>
                <th className="px-4 py-3">Next review</th>
                <th className="px-4 py-3">Controls</th>
                <th className="px-4 py-3">Risks</th>
                <th className="px-4 py-3">Training</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((row) => (
                <tr key={row.policy.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">{row.policy.name}</p>
                      <p className="text-xs text-slate-500">
                        {row.policy.code} · {row.policy.template.category}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.governance.owner ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(row.governance.effectiveDate)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(row.governance.nextReviewAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.counts.control ? "outline" : "secondary"} className="text-[11px]">
                      {row.counts.control}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={row.counts.risk ? "outline" : "secondary"} className="text-[11px]">
                      {row.counts.risk}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[11px]">
                      {row.counts.training}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[11px]">
                      {row.counts.evidence}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/policies/${row.policy.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {coverage.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    No matching policies.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
