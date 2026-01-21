"use client";

import Link from "next/link";
import { FileText, Settings2, Sparkles, Rocket, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions, usePolicyMetrics } from "@/lib/policies";
import { PolicyEffectivenessScore } from "@/components/policies/policy-effectiveness-score";

export function PoliciesClient() {
  const { requiredPolicies, isLoading: isLoadingPermissions } = usePermissions();
  const { metrics, isLoading: isLoadingMetrics } = usePolicyMetrics();

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Policy management</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Build and maintain FCA-mandatory policies</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Use Quick Create for a standard policy draft in minutes, or launch the advanced wizard when you need
              fine-grained control over clauses and approvals.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href="/policies/quick-create">
                <Sparkles className="h-4 w-4" />
                Quick Create Policy
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/policies/wizard">
                <Settings2 className="h-4 w-4" />
                Advanced Wizard
              </Link>
            </Button>
            <Button variant="ghost" className="gap-2 text-slate-500" asChild>
              <Link href="/policies/register">
                <FileText className="h-4 w-4" />
                View Policy Register
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Show empty state when no policies exist, otherwise show effectiveness score */}
      {!isLoadingMetrics && metrics.totalPolicies === 0 ? (
        <section className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Rocket className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Get started with your first policy</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You haven&apos;t created any policies yet. Use Quick Create to generate FCA-compliant policy drafts in
            minutes, or explore the advanced wizard for full customization.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href="/policies/quick-create">
                <Sparkles className="h-4 w-4" />
                Quick Create Policy
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/policies/wizard">
                <Settings2 className="h-4 w-4" />
                Advanced Wizard
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Based on your firm permissions, you have {requiredPolicies.length} mandatory policies to create.
          </p>
        </section>
      ) : (
        <PolicyEffectivenessScore
          attestationsComplete={metrics.completionRate}
          breaches={metrics.overduePolicies}
          trainingCompletion={metrics.completionRate}
          controlEffectiveness={Math.max(60, 100 - metrics.policyGaps * 5)}
          isEmpty={metrics.totalPolicies === 0}
          isLoading={isLoadingMetrics}
        />
      )}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Required policies</h2>
          <p className="mt-1 text-sm text-slate-500">
            Based on your permissions, these policies are mandatory. Use Quick Create to generate standard drafts, or
            open the advanced wizard to tailor clause selection and approvals.
          </p>
          <div className="mt-5 space-y-3">
            {isLoadingPermissions ? (
              <p className="text-sm text-slate-400">Loading permission profile…</p>
            ) : (
              requiredPolicies.map((policy) => (
                <div
                  key={policy.code}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{policy.name}</p>
                    <p className="text-xs text-slate-500">Code: {policy.code}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                    {policy.mandatory ? "Mandatory" : "Recommended"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Policy metrics</h2>
          {isLoadingMetrics ? (
            <p className="mt-2 text-sm text-slate-400">Syncing latest status…</p>
          ) : metrics.totalPolicies === 0 ? (
            <div className="mt-4 text-center">
              <FileCheck2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No policies created yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Metrics will appear here once you create your first policy.
              </p>
              <Button size="sm" className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href="/policies/quick-create">
                  <Sparkles className="h-3 w-3" />
                  Create first policy
                </Link>
              </Button>
            </div>
          ) : (
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>Total policies</dt>
                <dd className="font-semibold">{metrics.totalPolicies}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Completion</dt>
                <dd className="font-semibold">{metrics.completionRate}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Overdue reviews</dt>
                <dd className={`font-semibold ${metrics.overduePolicies > 0 ? "text-rose-600" : "text-slate-600"}`}>
                  {metrics.overduePolicies}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Documentation gaps</dt>
                <dd className={`font-semibold ${metrics.policyGaps > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {metrics.policyGaps}
                </dd>
              </div>
            </dl>
          )}
          {metrics.totalPolicies > 0 && (
            <p className="mt-4 text-xs text-slate-400">Advanced wizard is available for detailed configuration.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
        <p>
          Need to kickstart compliance fast? Check out the Quick Setup packages that combine policy templates,
          control mappings, and training plans for common firm types.
        </p>
        <Link href="/policies/quick-setup" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600">
          Explore packages →
        </Link>
      </section>
    </div>
  );
}
