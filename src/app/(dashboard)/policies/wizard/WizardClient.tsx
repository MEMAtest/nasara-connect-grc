"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/lib/policies";
import { PolicyWizard } from "@/components/policies/policy-wizard/PolicyWizard";
import type { WizardFormState } from "@/components/policies/policy-wizard/types";

export function WizardClient() {
  const { permissions, requiredPolicies } = usePermissions();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWizardFinish = async (state: WizardFormState) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateCode: state.selectedTemplate?.code,
          permissions: state.permissions,
          clauses: state.selectedClauses.map((clause) => clause.id),
          customContent: state.customContent,
          approvals: state.approvals,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate policy draft");
      }
      toast({
        title: "Policy draft created",
        description: "Redirecting to the policy register…",
      });
      router.push("/policies/register");
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save policy",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mandatoryCount = useMemo(() => requiredPolicies.filter((policy) => policy.mandatory).length, [requiredPolicies]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2 px-0 text-slate-500 hover:text-slate-700">
          <Link href="/policies">
            <ArrowLeft className="h-4 w-4" />
            Back to policy dashboard
          </Link>
        </Button>
        <div className="text-xs text-slate-400">
          Mandatory policies required: <strong className="text-slate-600">{mandatoryCount}</strong>
        </div>
      </div>

      <PolicyWizard initialPermissions={permissions} onFinish={handleWizardFinish} isSubmitting={isSubmitting} />
    </div>
  );
}