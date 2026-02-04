"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldAlert, Sparkles, ClipboardList } from "lucide-react";
import { ModuleCard } from "@/components/dashboard/module-card";
import { ModuleCardSkeleton } from "@/components/dashboard/module-card-skeleton";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PolicyAnalytics } from "@/components/dashboard/policy-analytics";
import {
  activityFeed,
  dashboardMetrics,
  dashboardModules,
  heroHighlights,
  keyPeople,
  quickActions,
  upcomingTasks,
} from "@/lib/dashboard-data";
import type { DashboardModule } from "@/lib/dashboard-data";
import { usePolicyMetrics } from "@/lib/policies";
import { useCmpSummary } from "./compliance-framework/cmp/hooks/useCmpSummary";
import { useOrganization } from "@/components/organization-provider";

const ActivityFeed = dynamic(() => import("@/components/dashboard/activity-feed").then((mod) => mod.ActivityFeed), {
  ssr: false,
});

const UpcomingTasks = dynamic(
  () => import("@/components/dashboard/upcoming-tasks").then((mod) => mod.UpcomingTasks),
  { ssr: false },
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const moduleVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.28 } },
};

function ActivityFeedSkeleton() {
  return (
    <div className="h-[420px] rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingTasksSkeleton() {
  return (
    <div className="h-[420px] rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-44 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function DashboardClient() {
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [moduleData, setModuleData] = useState<DashboardModule[]>([]);
  const [hasError, setHasError] = useState(false);

  const { organizationId } = useOrganization();
  const { metrics: policyMetrics, isLoading: isPolicyLoading, refresh: refreshPolicyMetrics } = usePolicyMetrics();
  const { summary: cmpSummary } = useCmpSummary({ organizationId });

  const policyMetricCard = useMemo(() => {
    // Show loading state until data is fetched
    if (isPolicyLoading) {
      return {
        title: "Policy Completion",
        value: "--",
        change: null,
        icon: FileText,
        color: "blue" as const,
      };
    }
    return {
      title: "Policy Completion",
      value: `${policyMetrics.completionRate}%`,
      change: null,
      icon: FileText,
      color: (policyMetrics.completionRate >= 80
          ? "green"
          : policyMetrics.completionRate >= 60
          ? "blue"
          : "orange") as "green" | "blue" | "purple" | "orange",
    };
  }, [policyMetrics, isPolicyLoading]);

  const cmpMetricCard = useMemo(() => ({
    title: "CMP Pass Rate",
    value: cmpSummary ? `${Math.round(cmpSummary.avgPassRate * 100)}%` : "--",
    change: null,
    icon: ClipboardList,
    color: (cmpSummary && cmpSummary.avgPassRate >= 0.9
        ? "green"
        : cmpSummary && cmpSummary.avgPassRate >= 0.75
        ? "orange"
        : "purple") as "green" | "blue" | "purple" | "orange",
  }), [cmpSummary]);

  const moduleBlueprint = useMemo(() => {
    return dashboardModules.map((module) =>
      module.id === "policies"
        ? {
            ...module,
            // Show null/undefined during loading to trigger skeleton/loading state in ModuleCard
            progress: isPolicyLoading ? module.progress : policyMetrics.completionRate,
            alerts: isPolicyLoading ? module.alerts : policyMetrics.overduePolicies + policyMetrics.policyGaps,
            isLocked: false,
          }
        : module.id === "complianceFramework"
        ? {
            ...module,
            progress: cmpSummary ? Math.round(cmpSummary.avgPassRate * 100) : module.progress,
            alerts: cmpSummary ? cmpSummary.overdue : module.alerts,
            description: "Monitor CMP testing and link controls to risks",
          }
        : module
    );
  }, [policyMetrics, cmpSummary, isPolicyLoading]);

  const metricsWithPolicy = useMemo(() => {
    return [...dashboardMetrics, policyMetricCard, cmpMetricCard];
  }, [policyMetricCard, cmpMetricCard]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        setModuleData(moduleBlueprint);
        setIsLoadingModules(false);
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('dashboard-modules-load-failed', error);
        } else {
          console.error("Failed to load modules", error);
        }
        setHasError(true);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [moduleBlueprint]);

  const modulesContent = useMemo(() => {
    if (hasError) {
      return (
        <EmptyState
          icon={ShieldAlert}
          message="Something went wrong while loading modules. Please refresh to try again."
          action={
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setIsLoadingModules(true);
                setModuleData([]);
                setTimeout(() => {
                  setModuleData(moduleBlueprint);
                  setIsLoadingModules(false);
                }, 400);
              }}
              className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-teal-500"
            >
              Retry load
            </button>
          }
        />
      );
    }

    if (isLoadingModules) {
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: moduleBlueprint.length }).map((_, index) => (
            <ModuleCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    return (
      <AnimatePresence>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {moduleData.map((module) => (
            <motion.div key={module.id} variants={moduleVariants} initial="hidden" animate="visible">
              <ModuleCard {...module} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    );
  }, [hasError, isLoadingModules, moduleData, moduleBlueprint]);

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section variants={sectionVariants}>
        <WelcomeHero highlights={heroHighlights} quickActions={quickActions} keyPeople={keyPeople} />
      </motion.section>

      <motion.section variants={sectionVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Key Metrics</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-700">
            <Sparkles className="h-4 w-4 text-teal-500" aria-hidden="true" />
            Real-time sync enabled
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricsWithPolicy.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants}>
        <PolicyAnalytics metrics={policyMetrics} isLoading={isPolicyLoading} onRefresh={refreshPolicyMetrics} />
      </motion.section>

      <motion.section variants={sectionVariants}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Modules</h2>
            <p className="text-sm text-slate-500">Access Nasara Connect modules tailored to your authorization journey.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Mobile ready · Smooth animations</span>
        </div>
        {modulesContent}
      </motion.section>

      <motion.section variants={sectionVariants}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Suspense fallback={<ActivityFeedSkeleton />}>
              <ActivityFeed events={activityFeed} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<UpcomingTasksSkeleton />}>
              <UpcomingTasks tasks={upcomingTasks} />
            </Suspense>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
