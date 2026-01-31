"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, FileDown, Printer, Eye } from "lucide-react";

interface PolicyDocumentActionsProps {
  policyId: string;
}

export function PolicyDocumentActions({ policyId }: PolicyDocumentActionsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
        <Eye className="mr-2 h-4 w-4" />
        Preview PDF
      </Button>
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Policy preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <iframe
              src={`/api/policies/${policyId}/documents/pdf?inline=1`}
              className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
              title="Policy PDF preview"
            />
            <p className="text-xs text-slate-500">
              Having trouble viewing? Download the PDF or open it in a new tab.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/policies/${policyId}/documents/pdf`} target="_blank" rel="noreferrer">
                  Download PDF
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/policies/${policyId}/documents/pdf?inline=1`} target="_blank" rel="noreferrer">
                  Open in new tab
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
