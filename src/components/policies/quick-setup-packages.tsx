
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PolicyPackage } from "@/lib/policies/policyPackages";

interface QuickSetupPackagesProps {
  packages: PolicyPackage[];
}

export function QuickSetupPackages({ packages }: QuickSetupPackagesProps) {
  return (
    <div className="space-y-4">
      {packages.map((pkg) => (
        <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                {pkg.name}
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">{pkg.targetFirms}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              Coming soon
            </Button>
          </div>
          <p className="mt-3 text-sm text-slate-500">{pkg.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            {pkg.policies.map((policy) => (
              <Badge key={policy.code} variant="secondary" className="text-[11px]">
                {policy.code}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Estimated setup time: {pkg.estimatedSetupDays} days (including approvals and documentation tailoring)
          </p>
        </div>
      ))}
    </div>
  );
}
