"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  if (!items.length) return null;
  return (
    <nav className={cn("flex flex-wrap items-center gap-2 text-sm text-slate-500", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (item.href && !isLast) {
          return (
            <span key={`${item.label}-${index}`} className="flex items-center gap-2">
              <Link href={item.href} className="hover:text-teal-600 transition-colors">
                {item.label}
              </Link>
              <span className="text-slate-300">/</span>
            </span>
          );
        }
        return (
          <span
            key={`${item.label}-${index}`}
            className={cn(isLast ? "text-slate-700 font-medium" : "text-slate-500")}
          >
            {item.label}
          </span>
        );
      })}
    </nav>
  );
}
