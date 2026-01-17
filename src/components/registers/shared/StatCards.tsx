"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.positive ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

export function StatCardsGrid({ children, columns = 4 }: StatCardsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  };

  return <div className={`grid ${gridCols[columns]} gap-4`}>{children}</div>;
}

interface QuickStat {
  label: string;
  value: string | number;
  color?: "default" | "success" | "warning" | "danger" | "info";
}

interface QuickStatsProps {
  stats: QuickStat[];
}

const colorClasses = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            colorClasses[stat.color || "default"]
          }`}
        >
          {stat.label}: {stat.value}
        </div>
      ))}
    </div>
  );
}
