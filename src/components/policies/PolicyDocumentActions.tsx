"use client";

import { Button } from "@/components/ui/button";

interface PolicyDocumentActionsProps {
  policyId: string;
}

export function PolicyDocumentActions({ policyId }: PolicyDocumentActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        Print / PDF
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={`/api/policies/${policyId}/documents/docx`}>Download DOCX</a>
      </Button>
    </div>
  );
}
