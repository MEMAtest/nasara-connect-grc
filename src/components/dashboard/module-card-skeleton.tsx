import { cn } from "@/lib/utils";

interface ModuleCardSkeletonProps {
  className?: string;
}

export function ModuleCardSkeleton({ className }: ModuleCardSkeletonProps) {
  return (
    <div className={cn("h-full rounded-2xl bg-white p-6 shadow-sm", className)}>
      <div className="flex animate-pulse flex-col gap-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100" />
        <div className="h-11 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

