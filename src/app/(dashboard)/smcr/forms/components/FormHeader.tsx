"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = 'saved' | 'saving' | 'error' | 'quota-exceeded' | null;

interface FormHeaderProps {
  saveStatus: SaveStatus;
  onPrint: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function FormHeader({ saveStatus, onPrint, onExport, onClear }: FormHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">FCA Controller Forms</h1>
          <p className="text-slate-600 mt-1">
            Complete SM&CR forms with step-by-step guidance
          </p>
          {/* Save status indicator */}
          {saveStatus && (
            <p className={cn(
              "text-xs mt-1 flex items-center gap-1",
              saveStatus === 'saved' && "text-emerald-600",
              saveStatus === 'saving' && "text-slate-500",
              (saveStatus === 'error' || saveStatus === 'quota-exceeded') && "text-red-600"
            )} role="status" aria-live="polite">
              {saveStatus === 'saved' && <><CheckCircle2 className="h-3 w-3" /> Draft saved</>}
              {saveStatus === 'saving' && "Saving..."}
              {saveStatus === 'error' && "Failed to save"}
              {saveStatus === 'quota-exceeded' && <><AlertTriangle className="h-3 w-3" /> Storage full - export your form to save progress</>}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label="Clear form and start over"
        >
          Clear Form
        </Button>
        <Button variant="outline" size="sm" onClick={onPrint} aria-label="Print form">
          <Printer className="h-4 w-4 mr-2" aria-hidden="true" />
          Print
        </Button>
        <Button size="sm" onClick={onExport} aria-label="Export form as HTML">
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          Export
        </Button>
      </div>
    </div>
  );
}
