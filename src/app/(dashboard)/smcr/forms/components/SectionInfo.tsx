"use client";

import React from "react";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionInfoProps {
  title: string;
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
}

export function SectionInfo({
  title,
  children,
  variant = "info"
}: SectionInfoProps) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  const icons = {
    info: <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={cn("rounded-lg border p-3 text-sm", styles[variant])}>
      <div className="flex items-start gap-2">
        {icons[variant]}
        <div>
          <p className="font-medium">{title}</p>
          <div className="mt-1 text-xs space-y-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
