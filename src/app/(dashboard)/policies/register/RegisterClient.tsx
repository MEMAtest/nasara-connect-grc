"use client";

import useSWR from "swr";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredPolicy } from "@/lib/server/policy-store";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RegisterClient() {
  const { data, error, isLoading } = useSWR<StoredPolicy[]>("/api/policies", fetcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Policy register</h1>
        <Button variant="outline" asChild>
          <Link href="/policies/wizard" className="gap-2">
            <FileText className="h-4 w-4" />
            New policy
          </Link>
        </Button>
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
                <p className="text-sm font-semibold text-slate-900">{policy.name}</p>
                <p className="text-xs text-slate-500">Status: {policy.status}</p>
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