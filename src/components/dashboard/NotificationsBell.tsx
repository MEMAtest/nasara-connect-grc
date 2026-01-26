"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { REGISTER_LABELS } from "@/lib/notifications/formatters";
import type { NotificationSeverity } from "@/lib/notifications/types";

const severityStyles: Record<NotificationSeverity, { icon: typeof Info; container: string; iconClass: string }> = {
  critical: { icon: XCircle, container: "border-rose-100 bg-rose-50", iconClass: "text-rose-600" },
  warning: { icon: AlertTriangle, container: "border-amber-100 bg-amber-50", iconClass: "text-amber-600" },
  success: { icon: CheckCircle2, container: "border-emerald-100 bg-emerald-50", iconClass: "text-emerald-600" },
  info: { icon: Info, container: "border-slate-100 bg-white", iconClass: "text-slate-500" },
};

function formatSourceLabel(source: string | null): string {
  if (!source) return "General";
  const [root, detail] = source.split(":");
  if (root === "registers" && detail) {
    return REGISTER_LABELS[detail] ?? "Register";
  }
  if (root === "cmp") return "CMP";
  if (root === "policies") return "Policies";
  if (root === "payments") return "Payments";
  if (root === "risk") return "Risk";
  if (root === "smcr") return "SMCR";
  if (root === "authorization-pack") return "Authorization Pack";
  return root.replace(/[-_]/g, " ");
}

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, error, refresh, markAsRead, markAllRead } = useNotifications({
    limit: 8,
  });

  const hasUnread = unreadCount > 0;

  const items = useMemo(() => {
    return notifications.map((notification) => {
      const severity = notification.severity ?? "info";
      const styles = severityStyles[severity];
      return { notification, severity, styles };
    });
  }, [notifications]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(next) => {
        setIsOpen(next);
        if (next) {
          void refresh();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnread ? (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-semibold text-white shadow-lg">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" sideOffset={12} align="end">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">{hasUnread ? `${unreadCount} unread` : "All caught up"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead} disabled={!hasUnread}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={refresh} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-3">
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <AlertTitle>Unable to load notifications</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 w-full rounded-2xl" />)
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications yet.</p>
          ) : (
            items.map(({ notification, severity, styles }) => {
              const Icon = styles.icon;
              const isUnread = !notification.readAt;
              const sourceLabel = formatSourceLabel(notification.source);
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-2xl border p-3 text-sm transition",
                    styles.container,
                    isUnread ? "shadow-sm" : "opacity-80",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("mt-0.5", styles.iconClass)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{notification.title}</p>
                          {notification.message ? (
                            <p className="text-xs text-slate-600">{notification.message}</p>
                          ) : null}
                        </div>
                        {isUnread ? <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" /> : null}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                          {sourceLabel}
                        </span>
                        {notification.link ? (
                          <Link
                            href={notification.link}
                            className="text-teal-700 hover:text-teal-600 hover:underline"
                            onClick={() => markAsRead(notification.id, true)}
                          >
                            Open
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    {isUnread ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id, true)}
                        aria-label="Mark as read"
                      >
                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
