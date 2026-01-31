"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_PERMISSIONS, type FirmPermissions, usePermissions, usePolicyProfile } from "@/lib/policies";
import { PolicyWizard } from "@/components/policies/policy-wizard/PolicyWizard";
import type { FirmProfile, WizardFormState } from "@/components/policies/policy-wizard/types";
import { getTemplateByCode, type PolicyTemplate } from "@/lib/policies/templates";
import { buildFirmProfileFromBasics, buildPermissionsFromProject } from "@/lib/policies/authorization-projects";

interface AuthorizationProjectBasics {
  [key: string]: unknown;
}

interface AuthorizationProjectContext {
  id: string;
  name?: string | null;
  permissionCode?: string | null;
  policyTemplates?: string[];
  assessmentData?: {
    basics?: AuthorizationProjectBasics;
  };
}

const normalizeStoredFirmProfile = (profile?: Record<string, unknown>): Partial<FirmProfile> | undefined => {
  if (!profile) return undefined;
  const sicCodes = Array.isArray(profile.sicCodes)
    ? profile.sicCodes.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : typeof profile.sicCodes === "string"
      ? profile.sicCodes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  const normalized: Partial<FirmProfile> = {
    name: typeof profile.name === "string" ? profile.name : "",
    tradingName: typeof profile.tradingName === "string" ? profile.tradingName : undefined,
    registeredAddress: typeof profile.registeredAddress === "string" ? profile.registeredAddress : undefined,
    companyNumber: typeof profile.companyNumber === "string" ? profile.companyNumber : undefined,
    fcaReference: typeof profile.fcaReference === "string" ? profile.fcaReference : undefined,
    website: typeof profile.website === "string" ? profile.website : undefined,
    sicCodes: sicCodes.length ? sicCodes : undefined,
  };
  if (!normalized.name?.trim()) return undefined;
  return normalized;
};


const buildAvailableTemplates = (
  templateCodes: string[] | undefined,
  initialTemplateCode?: string
) => {
  if (!templateCodes?.length) return undefined;
  const uniqueCodes = Array.from(
    new Set(templateCodes.map((code) => code.toUpperCase()))
  );
  const templates = uniqueCodes
    .map((code) => getTemplateByCode(code))
    .filter((template): template is PolicyTemplate => Boolean(template));

  if (initialTemplateCode && !templates.some((template) => template.code === initialTemplateCode)) {
    const initialTemplate = getTemplateByCode(initialTemplateCode);
    if (initialTemplate) {
      templates.push(initialTemplate);
    }
  }

  return templates.length ? templates : undefined;
};

export function WizardClient() {
  const { permissions, requiredPolicies } = usePermissions();
  const { profile: policyProfile } = usePolicyProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialTemplateCode = searchParams.get("template")?.toUpperCase() || undefined;
  const projectId = searchParams.get("projectId") || undefined;
  const [projectContext, setProjectContext] = useState<AuthorizationProjectContext | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let isActive = true;

    const loadProject = async () => {
      setIsProjectLoading(true);
      setProjectError(null);
      try {
        const response = await fetch(`/api/authorization-pack/projects/${projectId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "Unable to load project context");
        }
        if (!isActive) return;
        setProjectContext((data?.project as AuthorizationProjectContext) ?? null);
      } catch (error) {
        if (!isActive) return;
        setProjectError(error instanceof Error ? error.message : "Unable to load project context");
      } finally {
        if (!isActive) return;
        setIsProjectLoading(false);
      }
    };

    void loadProject();
    return () => {
      isActive = false;
    };
  }, [projectId]);

  const projectBasics = useMemo(() => {
    const basics = projectContext?.assessmentData?.basics;
    if (basics && typeof basics === "object" && !Array.isArray(basics)) {
      return basics as AuthorizationProjectBasics;
    }
    return undefined;
  }, [projectContext]);

  const projectFirmProfile = useMemo(
    () => buildFirmProfileFromBasics(projectBasics, projectContext?.name ?? null),
    [projectBasics, projectContext?.name]
  );

  const projectPermissions = useMemo(
    () => buildPermissionsFromProject(projectContext?.permissionCode ?? null, projectBasics),
    [projectContext?.permissionCode, projectBasics]
  );

  const storedFirmProfile = useMemo(
    () => normalizeStoredFirmProfile(policyProfile?.firmProfile as Record<string, unknown> | undefined),
    [policyProfile?.firmProfile],
  );

  const availableTemplates = useMemo(
    () => buildAvailableTemplates(projectContext?.policyTemplates, initialTemplateCode),
    [projectContext?.policyTemplates, initialTemplateCode]
  );
  const requiredTemplates = useMemo(
    () => buildAvailableTemplates(requiredPolicies.map((policy) => policy.code), initialTemplateCode),
    [requiredPolicies, initialTemplateCode]
  );

  const handleWizardFinish = async (state: WizardFormState) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateCode: state.selectedTemplate?.code,
          permissions: state.permissions,
          sectionClauses: state.sectionClauses,
          sectionOptions: state.sectionOptions,
          sectionNotes: state.sectionNotes,
          clauseVariables: state.clauseVariables,
          firmProfile: state.firmProfile,
          approvals: state.approvals,
          detailLevel: state.detailLevel,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate policy draft");
      }
      const created = (await response.json()) as { id?: string };
      toast({
        title: "Policy draft created",
        description: "Redirecting to the policy register…",
        variant: "success",
      });
      if (created?.id) {
        router.push(`/policies/register?highlight=${created.id}`);
      } else {
        router.push("/policies/register");
      }
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

  const wizardTemplates = projectId ? availableTemplates : requiredTemplates;
  const mandatoryCount = useMemo(() => {
    if (wizardTemplates?.length) return wizardTemplates.length;
    return requiredPolicies.filter((policy) => policy.mandatory).length;
  }, [wizardTemplates, requiredPolicies]);

  if (projectId && isProjectLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 px-0 text-slate-500 hover:text-slate-700">
            <Link href="/policies">
              <ArrowLeft className="h-4 w-4" />
              Back to policy dashboard
            </Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading project context...
        </div>
      </div>
    );
  }

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
      {projectError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Unable to load project context. Showing the standard wizard instead.
        </div>
      ) : null}

      <PolicyWizard
        initialPermissions={projectId ? projectPermissions ?? permissions : permissions}
        initialTemplateCode={initialTemplateCode}
        initialFirmProfile={projectId ? projectFirmProfile : storedFirmProfile}
        availableTemplates={wizardTemplates}
        onFinish={handleWizardFinish}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
