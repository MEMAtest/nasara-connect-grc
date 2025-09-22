import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <p className="mt-6 max-w-xs text-sm text-slate-500">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
