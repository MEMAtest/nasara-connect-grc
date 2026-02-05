"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { REGISTER_LABELS } from "@/lib/notifications/formatters";
import type { Notification, NotificationSeverity } from "@/lib/notifications/types";

const severityStyles: Record<NotificationSeverity, { icon: typeof Info; container: string; iconClass: string }> = {
  critical: { icon: XCircle, container: "border-rose-100 bg-rose-50", iconClass: "text-rose-600" },
  warning: { icon: AlertTriangle, container: "border-amber-100 bg-amber-50", iconClass: "text-amber-600" },
  success: { icon: CheckCircle2, container: "border-emerald-100 bg-emerald-50", iconClass: "text-emerald-600" },
  info: { icon: Info, container: "border-slate-100 bg-white", iconClass: "text-slate-500" },
};

const severityOptions: Array<{ value: "all" | NotificationSeverity; label: string }> = [
  { value: "all", label: "All severities" },
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

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

function filterNotifications(
  notifications: Notification[],
  severityFilter: "all" | NotificationSeverity,
  unreadOnly: boolean,
) {
  return notifications.filter((notification) => {
    if (unreadOnly && notification.readAt) return false;
    if (severityFilter !== "all" && notification.severity !== severityFilter) return false;
    return true;
  });
}

export function NotificationsPageClient() {
  const [limit, setLimit] = useState(25);
  const [severityFilter, setSeverityFilter] = useState<"all" | NotificationSeverity>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { notifications, unreadCount, isLoading, error, isEnabled, refresh, markAsRead, markAllRead } = useNotifications({
    limit,
  });

  const filtered = useMemo(
    () => filterNotifications(notifications, severityFilter, unreadOnly),
    [notifications, severityFilter, unreadOnly]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              {isEnabled
                ? `${unreadCount} unread · ${notifications.length} total`
                : "In-app notifications are disabled in settings."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={refresh} disabled={!isEnabled || isLoading}>
              Refresh
            </Button>
            <Button variant="outline" onClick={markAllRead} disabled={!isEnabled || unreadCount === 0}>
              Mark all read
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} disabled={!isEnabled} />
              <span className="text-sm text-slate-600">Unread only</span>
            </div>
            <div className="w-56">
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as typeof severityFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isEnabled ? (
              <Link href="/settings" className="text-sm text-teal-700 hover:text-teal-600 hover:underline">
                Manage notification preferences
              </Link>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : isLoading ? (
            <div className="text-sm text-slate-500">Loading notifications…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-slate-500">No notifications found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notification) => {
                const severity = notification.severity ?? "info";
                const styles = severityStyles[severity];
                const Icon = styles.icon;
                const isUnread = !notification.readAt;
                const sourceLabel = formatSourceLabel(notification.source);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-2xl border p-4 text-sm transition",
                      styles.container,
                      isUnread ? "shadow-sm" : "opacity-80"
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
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
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
              })}
            </div>
          )}

          {isEnabled && notifications.length >= limit ? (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setLimit((prev) => prev + 25)}>
                Load more
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
