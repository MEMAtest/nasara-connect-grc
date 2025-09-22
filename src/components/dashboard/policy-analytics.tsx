import { useMemo } from "react";
import { FileText, RefreshCcw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PolicyMetrics } from "@/lib/policies";

interface PolicyAnalyticsProps {
  metrics: PolicyMetrics;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function PolicyAnalytics({ metrics, isLoading = false, onRefresh }: PolicyAnalyticsProps) {
  const formattedUpdatedAt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(metrics.lastUpdated));
    } catch {
      return "n/a";
    }
  }, [metrics.lastUpdated]);

  return (
    <section className="rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Policy posture</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Living policy health check</h3>
          <p className="mt-2 text-sm text-slate-500">
            Monitor completion, overdue reviews, and documentation gaps across mandatory FCA policies.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 transition",
            "hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <AnalyticsTile
          icon={FileText}
          label="Total policies"
          value={metrics.totalPolicies.toString()}
          subLabel="Mandatory + recommended"
        />
        <AnalyticsTile
          icon={ShieldCheck}
          label="Completion"
          value={`${metrics.completionRate}%`}
          subLabel="Policies reviewed & approved"
          tone={metrics.completionRate >= 80 ? "positive" : metrics.completionRate >= 60 ? "caution" : "negative"}
        />
        <AnalyticsTile
          icon={FileText}
          label="Overdue"
          value={metrics.overduePolicies.toString()}
          subLabel="Past review date"
          tone={metrics.overduePolicies === 0 ? "positive" : metrics.overduePolicies <= 2 ? "caution" : "negative"}
        />
        <AnalyticsTile
          icon={FileText}
          label="Gaps"
          value={metrics.policyGaps.toString()}
          subLabel="Missing mandatory policies"
          tone={metrics.policyGaps === 0 ? "positive" : "negative"}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span>
          Reviews due soon: <strong className="text-slate-600">{metrics.reviewsDueSoon}</strong>
        </span>
        <span>
          In progress: <strong className="text-slate-600">{metrics.underReview}</strong>
        </span>
        <span>Updated {formattedUpdatedAt}</span>
      </div>
    </section>
  );
}

interface AnalyticsTileProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  subLabel: string;
  tone?: "positive" | "caution" | "negative";
}

function AnalyticsTile({ icon: Icon, label, value, subLabel, tone = "positive" }: AnalyticsTileProps) {
  const toneClasses = {
    positive: "from-emerald-50 to-white text-emerald-700",
    caution: "from-amber-50 to-white text-amber-700",
    negative: "from-rose-50 to-white text-rose-700",
  } as const;

  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-gradient-to-br p-4 shadow-sm", toneClasses[tone])}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-slate-600 shadow">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{subLabel}</p>
        </div>
      </div>
    </div>
  );
}
