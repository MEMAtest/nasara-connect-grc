"use client";

import { Button } from "@/components/ui/button";
import { FileText, FileDown, Printer } from "lucide-react";

interface PolicyDocumentActionsProps {
  policyId: string;
}

export function PolicyDocumentActions({ policyId }: PolicyDocumentActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={`/api/policies/${policyId}/documents/pdf`}>
          <FileText className="mr-2 h-4 w-4" />
          Download PDF
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={`/api/policies/${policyId}/documents/docx`}>
          <FileDown className="mr-2 h-4 w-4" />
          Download DOCX
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </div>
  );
}
