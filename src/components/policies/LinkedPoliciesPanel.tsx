"use client";

import useSWR from "swr";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type EntityLink = {
  fromType: string;
  fromId: string;
  metadata: Record<string, unknown>;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load linked policies");
    return res.json() as Promise<{ links: EntityLink[] }>;
  });

function linkTitle(link: EntityLink) {
  const title = typeof link.metadata.title === "string" ? link.metadata.title : typeof link.metadata.label === "string" ? link.metadata.label : "";
  return title.trim().length ? title.trim() : link.fromId;
}

export function LinkedPoliciesPanel({
  title,
  endpoint,
  helperText,
}: {
  title: string;
  endpoint: string;
  helperText?: string;
}) {
  const { data, error, isLoading } = useSWR<{ links: EntityLink[] }>(endpoint, fetcher);
  const links = (data?.links ?? []).filter((link) => link.fromType === "policy");

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
        </div>
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href="/policies/mapping">
            <ExternalLink className="h-4 w-4" />
            Coverage
          </Link>
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-rose-600">Failed to load linked policies.</p>
        ) : links.length ? (
          links.map((link) => (
            <div key={link.fromId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{linkTitle(link)}</p>
                <div className="mt-1">
                  <Badge variant="outline" className="text-[11px]">
                    Policy {link.fromId}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/policies/${link.fromId}`}>Open</Link>
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No linked policies yet.</p>
        )}
      </div>
    </section>
  );
}

