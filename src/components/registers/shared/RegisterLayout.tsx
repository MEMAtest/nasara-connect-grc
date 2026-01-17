"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";

interface RegisterLayoutProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function RegisterLayout({
  title,
  description,
  backHref = "/registers",
  backLabel = "Back to Registers",
  actions,
  children,
}: RegisterLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="mb-2 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {backLabel}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Content */}
        {children}
      </div>
    </ErrorBoundary>
  );
}
