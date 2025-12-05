"use client";

import { Badge } from "@/components/ui/badge";

type Citation = {
  type: "cmp" | "policy" | "clause" | "run";
  label: string;
};

export function AssistantCitations({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {citations.map((c, idx) => (
        <Badge key={`${c.label}-${idx}`} variant="outline" className="text-[11px]">
          {c.type.toUpperCase()}: {c.label}
        </Badge>
      ))}
    </div>
  );
}
