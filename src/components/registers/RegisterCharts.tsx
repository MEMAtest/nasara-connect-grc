"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TrendPoint } from "@/lib/chart-utils";

// Stat Card with drill-down
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "slate" | "emerald" | "amber" | "red" | "blue" | "violet" | "rose" | "cyan" | "orange";
  trend?: { value: number; label: string };
  onClick?: () => void;
  isActive?: boolean;
}

const colorClasses = {
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-900",
    accent: "text-slate-600",
    hover: "hover:border-slate-300 hover:bg-slate-100",
    active: "border-slate-400 bg-slate-100 ring-2 ring-slate-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    accent: "text-emerald-600",
    hover: "hover:border-emerald-300 hover:bg-emerald-100",
    active: "border-emerald-400 bg-emerald-100 ring-2 ring-emerald-200",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    accent: "text-amber-600",
    hover: "hover:border-amber-300 hover:bg-amber-100",
    active: "border-amber-400 bg-amber-100 ring-2 ring-amber-200",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    accent: "text-red-600",
    hover: "hover:border-red-300 hover:bg-red-100",
    active: "border-red-400 bg-red-100 ring-2 ring-red-200",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    accent: "text-blue-600",
    hover: "hover:border-blue-300 hover:bg-blue-100",
    active: "border-blue-400 bg-blue-100 ring-2 ring-blue-200",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-900",
    accent: "text-violet-600",
    hover: "hover:border-violet-300 hover:bg-violet-100",
    active: "border-violet-400 bg-violet-100 ring-2 ring-violet-200",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-900",
    accent: "text-rose-600",
    hover: "hover:border-rose-300 hover:bg-rose-100",
    active: "border-rose-400 bg-rose-100 ring-2 ring-rose-200",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-900",
    accent: "text-cyan-600",
    hover: "hover:border-cyan-300 hover:bg-cyan-100",
    active: "border-cyan-400 bg-cyan-100 ring-2 ring-cyan-200",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    accent: "text-orange-600",
    hover: "hover:border-orange-300 hover:bg-orange-100",
    active: "border-orange-400 bg-orange-100 ring-2 ring-orange-200",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "slate",
  trend,
  onClick,
  isActive,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-all",
        colors.bg,
        colors.border,
        colors.hover,
        isActive && colors.active
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className={cn("text-lg", colors.accent)}>{icon}</div>}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>
            <p className={cn("text-2xl font-bold", colors.text)}>{value}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.value > 0 ? "text-emerald-600" : trend.value < 0 ? "text-red-600" : "text-slate-500"
            )}>
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </div>
          )}
          <ChevronRight className={cn("h-4 w-4", colors.accent)} />
        </div>
      </div>
    </motion.div>
  );
}

// Donut Chart Component
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  onSegmentClick?: (label: string) => void;
  activeSegment?: string;
  size?: number;
}

export function DonutChart({
  data,
  title,
  onSegmentClick,
  activeSegment,
  size = 180,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const segments = useMemo(() => {
    return data.map((item) => {
      const percentage = total > 0 ? item.value / total : 0;
      return {
        ...item,
        percentage,
      };
    });
  }, [data, total]);

  const chartSegments = segments.filter((segment) => segment.value > 0);

  return (
    <Card className="min-h-[280px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0" style={{ width: size }}>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-900">{total}</span>
                <span className="ml-2 text-xs text-slate-500">Total</span>
              </div>
              <span className="text-xs text-slate-400">
                {total > 0 ? "Distribution" : "No data yet"}
              </span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
              {chartSegments.map((segment, i) => (
                <motion.button
                  key={segment.label}
                  type="button"
                  className={cn(
                    "h-full transition-opacity",
                    activeSegment && activeSegment !== segment.label && "opacity-40"
                  )}
                  style={{ backgroundColor: segment.color }}
                  onClick={() => onSegmentClick?.(segment.label)}
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.percentage * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                  aria-label={`${segment.label} ${segment.value}`}
                />
              ))}
              {total === 0 && <div className="h-full w-full" />}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {segments.map((segment) => (
              <button
                key={segment.label}
                onClick={() => onSegmentClick?.(segment.label)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  activeSegment === segment.label
                    ? "bg-slate-100"
                    : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-slate-700">{segment.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{segment.value}</span>
                  <span className="text-xs text-slate-500">
                    ({Math.round(segment.percentage * 100)}%)
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  onBarClick?: (label: string) => void;
  activeBar?: string;
  maxValue?: number;
}

export function BarChart({
  data,
  title,
  onBarClick,
  activeBar,
  maxValue,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className="min-h-[280px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, i) => {
            const percentage = (item.value / max) * 100;
            return (
              <button
                key={item.label}
                onClick={() => onBarClick?.(item.label)}
                className={cn(
                  "w-full rounded-lg p-2 text-left transition-colors",
                  activeBar === item.label ? "bg-slate-100" : "hover:bg-slate-50"
                )}
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color || "#0d9488" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Trend Line Chart
interface TrendChartProps {
  data: TrendPoint[];
  title: string;
  color?: string;
  onPointClick?: (point: TrendPoint) => void;
  activePointKey?: string;
}

export function TrendChart({
  data,
  title,
  color = "#0d9488",
  onPointClick,
  activePointKey,
}: TrendChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const width = 320;
  const height = 120;
  const padding = 16;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return {
      x,
      y,
      value: d.value,
      label: d.label,
      point: d,
      key: d.monthKey || d.label,
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const total = data.reduce((sum, d) => sum + d.value, 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  return (
    <Card className="min-h-[220px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
          <span className="text-lg font-bold text-slate-900">{total}</span>
        </div>
      </CardHeader>
      <CardContent>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i / 2) * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + (i / 2) * (height - 2 * padding)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={`${pathD} L ${points[points.length - 1]?.x} ${height - padding} L ${padding} ${height - padding} Z`}
            fill={color}
            fillOpacity={0.1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Points */}
          {points.map((p, i) => {
            const isActive = activePointKey && p.key === activePointKey;
            return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isActive ? 5 : 4}
              fill="white"
              stroke={color}
              strokeWidth={isActive ? 3 : 2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              onClick={() => onPointClick?.(p.point)}
              className={cn(onPointClick && "cursor-pointer")}
            />
            );
          })}
        </svg>

        <div className="mt-2 flex justify-between text-xs text-slate-500">
          {data.map((d, i) => {
            const isActive = activePointKey && (d.monthKey || d.label) === activePointKey;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPointClick?.(d)}
                className={cn(
                  "border-0 bg-transparent p-0 transition-colors",
                  onPointClick && "hover:text-slate-700",
                  isActive ? "font-semibold text-slate-700" : "text-slate-500"
                )}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
