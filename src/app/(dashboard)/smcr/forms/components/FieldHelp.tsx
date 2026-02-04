"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

interface FieldHelpProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldHelp({ children, className }: FieldHelpProps) {
  return (
    <p className={`text-xs text-slate-500 mt-1 flex items-start gap-1 ${className ?? ""}`}>
      <HelpCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-400" />
      <span>{children}</span>
    </p>
  );
}
