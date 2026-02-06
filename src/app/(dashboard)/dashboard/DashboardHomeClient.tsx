"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModuleCard } from "@/components/dashboard/module-card";
import { ModuleCardSkeleton } from "@/components/dashboard/module-card-skeleton";
import { useToast } from "@/components/toast-provider";
import { dashboardModules } from "@/lib/dashboard-data";
import { getModuleLabel } from "@/lib/module-access-shared";
import { useModuleAccess } from "@/hooks/use-module-access";

export function DashboardHomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { warning } = useToast();
  const { isModuleEnabled, isLoading } = useModuleAccess();

  const blockedModuleId = searchParams.get("module_blocked");

  useEffect(() => {
    if (!blockedModuleId) return;

    warning(`Your firm does not have access to ${getModuleLabel(blockedModuleId)}.`);

    // Remove the query param so we don't re-toast on refresh.
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("module_blocked");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `/dashboard?${nextQuery}` : "/dashboard");
  }, [blockedModuleId, router, searchParams, warning]);

  const modulesWithAccess = useMemo(() => {
    return dashboardModules.map((mod) => ({
      ...mod,
      isLocked: !isModuleEnabled(mod.id),
    }));
  }, [isModuleEnabled]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your firm&apos;s enabled modules appear in the sidebar. Locked modules show here for plan upgrades.
        </p>
      </div>

      <section aria-label="Modules">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <ModuleCardSkeleton key={idx} />
              ))
            : modulesWithAccess.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  title={mod.title}
                  description={mod.description}
                  icon={mod.icon}
                  color={mod.color}
                  progress={mod.progress}
                  alerts={mod.alerts}
                  isLocked={mod.isLocked}
                  route={mod.route}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
