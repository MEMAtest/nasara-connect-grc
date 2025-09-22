"use client";

import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string;
  change: number | null;
  icon: LucideIcon;
  color: "green" | "orange" | "blue" | "purple";
}

const metricStyles: Record<MetricCardProps["color"], { bg: string; icon: string; trend: string }> = {
  green: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    trend: "text-emerald-600",
  },
  orange: {
    bg: "bg-amber-50",
    icon: "text-amber-500",
    trend: "text-amber-500",
  },
  blue: {
    bg: "bg-sky-50",
    icon: "text-sky-600",
    trend: "text-sky-600",
  },
  purple: {
    bg: "bg-violet-50",
    icon: "text-violet-600",
    trend: "text-violet-600",
  },
};

export const MetricCard = memo(function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const palette = metricStyles[color];

  return (
    <motion.div
      className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
          {typeof change === "number" ? (
            <span className={cn("mt-2 inline-flex items-center text-xs font-semibold", palette.trend)}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
            </span>
          ) : null}
        </div>
        <div className={cn("rounded-xl p-3", palette.bg)}>
          <Icon className={cn("h-6 w-6", palette.icon)} aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
});

MetricCard.displayName = "MetricCard";

