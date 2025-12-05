"use client";

import { useState } from "react";
import { X, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiChatClient } from "@/app/(dashboard)/ai-chat/AiChatClient";

/**
 * Floating assistant launcher that can be dropped into dashboard layouts.
 * Opens a slide-over with the full AI chat experience without leaving the page.
 */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <Button
          type="button"
          size="lg"
          className="shadow-lg shadow-emerald-500/30"
          onClick={() => setOpen(true)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Ask AI
        </Button>
        <div className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200">
          <MessageCircle className="h-3 w-3" />
          Available across dashboard
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative h-[92vh] w-full max-w-5xl rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-200 md:rounded-2xl md:h-[85vh] md:mb-6 md:mr-6">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                AI Assistant
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-52px)] overflow-y-auto p-4 md:p-6">
              <AiChatClient />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
