"use client";

import { useMemo } from "react";
import { Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOrganization } from "@/components/organization-provider";
import { useCmpSummary } from "@/app/(dashboard)/compliance-framework/cmp/hooks/useCmpSummary";
import { buildCmpAlerts } from "@/lib/cmp-alerts";
import { cn } from "@/lib/utils";

export function CmpNotificationsBell() {
  const { organizationId } = useOrganization();
  const { summary, isLoading, error, refresh } = useCmpSummary({ organizationId });
  const alerts = useMemo(() => buildCmpAlerts(summary), [summary]);
  const badgeCount = alerts.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {badgeCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow-lg">
              {badgeCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" sideOffset={12} align="end">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Notifications</p>
          <Button variant="ghost" size="sm" className="text-xs" onClick={refresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>
        <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <AlertTitle>Unable to load CMP alerts</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          ) : isLoading ? (
            Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-2xl" />)
          ) : alerts.length === 0 ? (
            <p className="text-sm text-slate-500">No outstanding CMP alerts.</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "rounded-2xl border p-3 text-sm",
                  alert.severity === "critical" ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50",
                )}
              >
                <p className="font-semibold text-slate-900">{alert.title}</p>
                <p className="text-xs text-slate-600">{alert.description}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
