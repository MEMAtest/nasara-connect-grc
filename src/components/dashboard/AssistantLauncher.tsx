"use client";

import { useState } from "react";
import { X, Sparkles, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AiChatClient } from "@/app/(dashboard)/ai-chat/AiChatClient";
import { useAssistantContext } from "@/components/dashboard/useAssistantContext";

/**
 * Floating assistant launcher that can be dropped into dashboard layouts.
 * Opens a slide-over with the full AI chat experience without leaving the page.
 */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  const { context } = useAssistantContext();
  const pathname = usePathname();

  const shouldAvoidBottomRight =
    typeof pathname === "string" &&
    (pathname.startsWith("/policies") || pathname.startsWith("/smcr") || pathname.startsWith("/risk-assessment"));

  return (
    <>
      <div
        className={[
          "group fixed right-5 z-40 flex flex-col items-end gap-2",
          shouldAvoidBottomRight ? "bottom-24 md:bottom-28" : "bottom-5",
        ].join(" ")}
      >
        <Button
          type="button"
          size="icon"
          variant="default"
          className="h-12 w-12 rounded-full shadow-lg shadow-emerald-500/30"
          onClick={() => setOpen(true)}
          aria-label="Ask AI"
          title="Ask AI"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <div className="pointer-events-none flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-600 opacity-0 shadow-sm ring-1 ring-slate-200 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <MessageCircle className="h-3 w-3" />
          {context.policyId || context.runId
            ? `Context: ${context.policyId ?? ""} ${context.runId ?? ""}`.trim()
            : "Available across dashboard"}
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
