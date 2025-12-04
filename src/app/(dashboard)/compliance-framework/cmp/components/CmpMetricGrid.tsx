import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface CmpMetricItem {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accent?: "teal" | "amber" | "rose" | "sky";
}

const accents: Record<NonNullable<CmpMetricItem["accent"]>, string> = {
  teal: "text-teal-600 bg-teal-50",
  amber: "text-amber-600 bg-amber-50",
  rose: "text-rose-600 bg-rose-50",
  sky: "text-sky-600 bg-sky-50",
};

export function CmpMetricGrid({ metrics }: { metrics: CmpMetricItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{metric.title}</CardTitle>
              <div className={accents[metric.accent ?? "teal"] + " inline-flex rounded-full p-2"}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{metric.value}</div>
              <p className="text-sm text-slate-500">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
