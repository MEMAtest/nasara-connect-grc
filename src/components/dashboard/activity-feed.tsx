"use client";

import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { ActivityEvent } from "@/lib/dashboard-data";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";

const statusMap: Record<ActivityEvent["status"], { bg: string; border: string; iconColor: string; label: string }> = {
  success: { bg: "bg-emerald-100/60", border: "border-emerald-200", iconColor: "text-emerald-600", label: "Success" },
  warning: { bg: "bg-amber-100/60", border: "border-amber-200", iconColor: "text-amber-600", label: "Warning" },
  danger: { bg: "bg-rose-100/60", border: "border-rose-200", iconColor: "text-rose-600", label: "Alert" },
  info: { bg: "bg-sky-100/60", border: "border-sky-200", iconColor: "text-sky-600", label: "Update" },
};

const statusIconFallback = {
  all: Bell,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

interface ActivityFeedProps {
  events: ActivityEvent[];
}

function ActivityFeedComponent({ events }: ActivityFeedProps) {
  const [activeTab, setActiveTab] = useState<"all" | ActivityEvent["status"]>("all");

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return events;
    return events.filter((event) => event.status === activeTab);
  }, [activeTab, events]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Activity &amp; Insights</h2>
          <p className="text-sm text-slate-500">Track regulatory updates, risks, and milestones in real-time.</p>
        </div>
        <Button variant="outline" className="hidden border-slate-200 text-xs uppercase tracking-widest text-slate-600 transition hover:border-teal-200 hover:text-teal-600 sm:inline-flex">
          View history
        </Button>
      </div>

      <div className="px-6 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-xl bg-slate-50 p-1 text-xs">
            {(["all", "success", "warning", "danger", "info"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg py-2 text-xs font-semibold capitalize data-[state=active]:bg-white data-[state=active]:text-teal-600"
              >
                {tab === "all" ? "All" : statusMap[tab].label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="focus-visible:outline-none">
            <Separator className="my-4" />
            <div className="space-y-4 pb-6">
              <AnimatePresence initial={false}>
                {filteredEvents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={statusIconFallback[activeTab] ?? Bell}
                      message="No activity matches this filter yet."
                    />
                  </motion.div>
                ) : (
                  filteredEvents.map((event) => {
                    const palette = statusMap[event.status];
                    const Icon = event.icon;
                    return (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-transparent bg-white p-4 transition hover:border-teal-100 hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className={"flex h-12 w-12 items-center justify-center rounded-xl border " + palette.border + " " + palette.bg}>
                            <Icon className={"h-6 w-6 " + palette.iconColor} aria-hidden="true" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-sm font-semibold text-slate-900">{event.title}</h3>
                              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{event.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-500">{event.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export const ActivityFeed = memo(ActivityFeedComponent);

ActivityFeed.displayName = "ActivityFeed";
