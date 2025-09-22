
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { POLICY_TEMPLATE_CLAUSES } from "@/lib/policies/templates";

export default function ClauseLibraryPage() {
  const [search, setSearch] = useState("");
  const [mandatoryOnly, setMandatoryOnly] = useState(false);

  const clauses = useMemo(() => {
    return POLICY_TEMPLATE_CLAUSES.filter((clause) => {
      if (mandatoryOnly && !clause.isMandatory) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        clause.title.toLowerCase().includes(term) ||
        clause.summary.toLowerCase().includes(term) ||
        clause.category.toLowerCase().includes(term)
      );
    });
  }, [search, mandatoryOnly]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Clause library</h1>
        <p className="text-sm text-slate-500">Reusable clauses that can be inserted into policies. Review and customise before publishing.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clauses"
            className="pl-10"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <Checkbox checked={mandatoryOnly} onCheckedChange={(checked) => setMandatoryOnly(!!checked)} />
          Show mandatory clauses only
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {clauses.map((clause) => (
          <div key={clause.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
                <p className="text-xs text-slate-500">{clause.category}</p>
              </div>
              {clause.isMandatory ? (
                <Badge variant="destructive" className="text-[11px]">Mandatory</Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px]">Optional</Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500">{clause.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
