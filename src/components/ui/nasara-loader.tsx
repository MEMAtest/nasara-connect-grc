"use client";

import { cn } from "@/lib/utils";

type NasaraLoaderSize = "sm" | "md" | "lg";

const sizeConfig: Record<NasaraLoaderSize, { bar: string; gap: string; label: string; track: string }> = {
  sm: { bar: "w-1.5", gap: "gap-1", label: "text-xs", track: "w-24 h-1" },
  md: { bar: "w-2", gap: "gap-1.5", label: "text-sm", track: "w-32 h-1.5" },
  lg: { bar: "w-2.5", gap: "gap-2", label: "text-sm", track: "w-40 h-2" },
};

const heightConfig: Record<NasaraLoaderSize, string[]> = {
  sm: ["h-2", "h-4", "h-3"],
  md: ["h-3", "h-5", "h-4"],
  lg: ["h-4", "h-6", "h-5"],
};

export function NasaraLoader({
  label,
  size = "md",
  className,
}: {
  label?: string;
  size?: NasaraLoaderSize;
  className?: string;
}) {
  const { bar, gap, label: labelSize } = sizeConfig[size];
  const { track } = sizeConfig[size];
  const heights = heightConfig[size];

  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("flex items-end", gap)}>
        {heights.map((height, idx) => (
          <span
            key={`${height}-${idx}`}
            className={cn("block rounded-full bg-teal-600/80 shadow-sm shadow-teal-200/60 animate-bounce", bar, height)}
            style={{ animationDelay: `${idx * 150}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className={cn("relative overflow-hidden rounded-full bg-slate-100", track)} aria-hidden="true">
        <span className="absolute inset-0 bg-gradient-to-r from-teal-500/70 via-teal-400/80 to-teal-500/70 animate-pulse" />
      </div>
      {label ? <span className={cn("text-slate-500", labelSize)}>{label}</span> : null}
    </div>
  );
}
