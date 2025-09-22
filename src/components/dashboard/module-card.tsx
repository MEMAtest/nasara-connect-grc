"use client";

import type { KeyboardEvent } from "react";
import { memo } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModuleAccent } from "@/lib/dashboard-data";

export interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: ModuleAccent;
  progress?: number;
  alerts?: number;
  isLocked?: boolean;
  route: string;
}

const accentMap: Record<ModuleAccent, { gradient: string; glow: string; button: string }> = {
  teal: {
    gradient: "from-teal-400 to-teal-600",
    glow: "shadow-[0_14px_40px_rgba(13,148,136,0.25)]",
    button: "bg-teal-500 hover:bg-teal-600 focus-visible:ring-teal-400/60",
  },
  sky: {
    gradient: "from-sky-400 to-sky-600",
    glow: "shadow-[0_14px_40px_rgba(2,132,199,0.28)]",
    button: "bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400/60",
  },
  indigo: {
    gradient: "from-indigo-400 to-indigo-600",
    glow: "shadow-[0_14px_40px_rgba(79,70,229,0.28)]",
    button: "bg-indigo-500 hover:bg-indigo-600 focus-visible:ring-indigo-400/60",
  },
  rose: {
    gradient: "from-rose-400 to-rose-600",
    glow: "shadow-[0_14px_40px_rgba(244,63,94,0.25)]",
    button: "bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-400/60",
  },
  amber: {
    gradient: "from-amber-400 to-amber-600",
    glow: "shadow-[0_14px_40px_rgba(245,158,11,0.28)]",
    button: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400/60",
  },
};

const springTransition = { type: "spring", stiffness: 260, damping: 24 };

export const ModuleCard = memo(function ModuleCard({
  title,
  description,
  icon: Icon,
  color,
  progress,
  alerts = 0,
  isLocked,
  route,
}: ModuleCardProps) {
  const router = useRouter();
  const accent = accentMap[color];

  const handleClick = () => {
    if (isLocked) return;
    router.push(route);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(route);
    }
  };

  return (
    <motion.article
      role="button"
      tabIndex={isLocked ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-lg transition duration-200",
        "hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-200",
        isLocked && "pointer-events-none opacity-80",
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
    >
      {alerts > 0 ? (
        <motion.span
          className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-[11px] font-semibold text-white shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {alerts}
        </motion.span>
      ) : null}

      <div>
        <div
          className={cn(
            "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
            accent.gradient,
            accent.glow,
            "transition-transform duration-200 group-hover:scale-105",
          )}
        >
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">{description}</p>
      </div>

      <div className="mt-6 space-y-4">
        {typeof progress === "number" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Progress</span>
              <motion.span
                key={progress}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-slate-600"
              >
                {progress}%
              </motion.span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", accent.gradient)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        ) : null}

        <Button
          type="button"
          className={cn(
            "w-full gap-2 rounded-xl py-2 text-sm font-semibold shadow-sm transition-all duration-200",
            accent.button,
            "hover:shadow-lg",
          )}
        >
          {isLocked ? "Unlock Module" : "Open Module"}
        </Button>
      </div>

      {isLocked ? (
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium leading-tight">
              Upgrade your plan to unlock this module.
            </p>
          </div>
        </motion.div>
      ) : null}
    </motion.article>
  );
});

ModuleCard.displayName = "ModuleCard";
