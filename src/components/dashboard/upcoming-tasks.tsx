"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UpcomingTask } from "@/lib/dashboard-data";
import { Button } from "@/components/ui/button";

interface UpcomingTasksProps {
  tasks: UpcomingTask[];
}

const priorityStyles: Record<UpcomingTask["priority"], { badge: string }> = {
  high: { badge: "bg-rose-100 text-rose-600" },
  medium: { badge: "bg-amber-100 text-amber-600" },
  low: { badge: "bg-emerald-100 text-emerald-600" },
};

function UpcomingTasksComponent({ tasks }: UpcomingTasksProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h2>
          <p className="text-sm text-slate-500">Stay ahead of regulatory deadlines and team responsibilities.</p>
        </div>
        <Button variant="secondary" className="hidden rounded-full bg-teal-50 px-4 text-xs font-semibold uppercase tracking-widest text-teal-700 transition hover:bg-teal-100 md:inline-flex">
          Add task
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider", priorityStyles[task.priority].badge)}>
                    {task.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">{task.owner}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{task.dueDate}</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Progress</span>
                <span className="text-slate-600">{task.progress}%</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const UpcomingTasks = memo(UpcomingTasksComponent);

UpcomingTasks.displayName = "UpcomingTasks";

