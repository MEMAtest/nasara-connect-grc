"use client";

import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { psdFormNotes } from "../utils/psd-form-notes";
import { cn } from "@/lib/utils";

interface FormNotesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection?: string;
}

export function FormNotesPanel({ open, onOpenChange, activeSection }: FormNotesPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            PSD Form Notes
          </SheetTitle>
          <SheetDescription>
            Official FCA guidance notes for the PSD Individual Form
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          <div className="space-y-6">
            {psdFormNotes.map((sectionNote) => {
              const isActive = activeSection === sectionNote.section;
              return (
                <div
                  key={sectionNote.section}
                  id={`notes-section-${sectionNote.section}`}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    isActive ? "border-teal-400 bg-teal-50/50" : "border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "text-xs",
                        isActive && "bg-teal-600"
                      )}
                    >
                      Section {sectionNote.section}
                    </Badge>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {sectionNote.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {sectionNote.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-teal-500 mt-1 flex-shrink-0">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
