"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/components/organization-provider";
import { usePermissions } from "@/lib/policies";
import { POLICY_PACKAGES } from "@/lib/policies/policyPackages";
import { QuickSetupPackages } from "@/components/policies/quick-setup-packages";

export function QuickSetupClient() {
  const { organizationId } = useOrganization();
  usePermissions({ organizationId });
  const applicablePackages = POLICY_PACKAGES;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2 px-0 text-slate-500 hover:text-slate-700">
        <Link href="/policies">
          <ArrowLeft className="h-4 w-4" />
          Back to policy dashboard
        </Link>
      </Button>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Quick setup packages</h1>
        <p className="text-sm text-slate-500">
          Pre-configured bundles combining policy templates, controls, and training recommendations for common FCA firm
          profiles. Launching soon.
        </p>
      </div>
      <QuickSetupPackages packages={applicablePackages} />
    </div>
  );
}
