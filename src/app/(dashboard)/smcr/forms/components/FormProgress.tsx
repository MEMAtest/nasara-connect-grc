"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  progress: number;
}

export function FormProgress({ progress }: FormProgressProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Form Completion</span>
          <span className="text-sm text-slate-500">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-slate-500 mt-2">
          Complete all required fields before submitting via FCA Connect
        </p>
      </CardContent>
    </Card>
  );
}
