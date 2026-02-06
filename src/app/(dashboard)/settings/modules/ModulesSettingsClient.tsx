"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";
import { useOrganization } from "@/components/organization-provider";
import {
  MODULE_REGISTRY,
  type ModuleId,
} from "@/lib/module-access-shared";

type EnabledModulesValue = string[] | null;

const ALL_MODULE_IDS = MODULE_REGISTRY.map((m) => m.id);

function toExplicitList(value: EnabledModulesValue): ModuleId[] {
  if (value === null) return [...ALL_MODULE_IDS];
  if (Array.isArray(value) && value.includes("*")) return [...ALL_MODULE_IDS];
  return (value ?? []).filter((v): v is ModuleId => (ALL_MODULE_IDS as readonly string[]).includes(v));
}

function normalize(value: ModuleId[]): EnabledModulesValue {
  const unique = Array.from(new Set(value));
  unique.sort();
  if (unique.length === ALL_MODULE_IDS.length) {
    // In production, "all modules" should be explicit to avoid falling back to plan defaults.
    return process.env.NODE_ENV === "production" ? ["*"] : null;
  }
  return unique;
}

export function ModulesSettingsClient() {
  const { canManageTeam } = useUserRole();
  const { retryContextFetch } = useOrganization();
  const isProduction = process.env.NODE_ENV === "production";

  const [enabledModules, setEnabledModules] = useState<EnabledModulesValue>(null);
  const [serverCanEdit, setServerCanEdit] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const canEditModules = canManageTeam && (!isProduction || Boolean(serverCanEdit));

  const load = useCallback(async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/modules");
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const data = await res.json();
      const value: EnabledModulesValue =
        data?.enabledModules === null ? null : Array.isArray(data?.enabledModules) ? data.enabledModules : null;
      setEnabledModules(value);
      setServerCanEdit(typeof data?.canEdit === "boolean" ? data.canEdit : null);
      setDirty(false);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load module access.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const enabledSet = useMemo(() => {
    const explicit = toExplicitList(enabledModules);
    return new Set<ModuleId>(explicit);
  }, [enabledModules]);

  const toggleModule = (moduleId: ModuleId, nextOn: boolean) => {
    setEnabledModules((prev) => {
      const current = new Set<ModuleId>(toExplicitList(prev));
      if (nextOn) current.add(moduleId);
      else current.delete(moduleId);
      return normalize(Array.from(current));
    });
    setDirty(true);
    setStatus(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledModules }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Save failed: ${res.status}`);
      }
      const data = await res.json();
      setEnabledModules(
        data?.enabledModules === null ? null : Array.isArray(data?.enabledModules) ? data.enabledModules : null,
      );
      setDirty(false);
      setStatus({ type: "success", message: "Module access updated." });
      // Refresh the global org context so sidebar/dashboard update immediately.
      await retryContextFetch();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Save failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" aria-label="Back to settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
            <p className="text-muted-foreground">
              Enable or disable modules for your organization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={isLoading || isSaving}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={!canEditModules || !dirty || isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      {!canManageTeam ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Only admins can change module access.
        </div>
      ) : null}

      {isProduction && serverCanEdit === false ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          In production, module entitlements are managed by Nasara.
        </div>
      ) : null}

      {status ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            status.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            status.type === "error" && "border-red-200 bg-red-50 text-red-800",
            status.type === "info" && "border-slate-200 bg-slate-50 text-slate-700",
          )}
        >
          {status.message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {MODULE_REGISTRY.map((mod) => {
            const enabled = enabledSet.has(mod.id);
            return (
              <Card key={mod.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle>{mod.label}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {mod.id}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => toggleModule(mod.id, Boolean(checked))}
                    disabled={!canEditModules}
                    aria-label={`Toggle ${mod.label}`}
                  />
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  {enabled ? (
                    <span className="text-emerald-700">Enabled</span>
                  ) : (
                    <span className="text-slate-500">Disabled</span>
                  )}
                  <div className="mt-3 text-xs text-slate-500">
                    Routes: {mod.pageRoutes.join(", ")}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How this works</CardTitle>
          <CardDescription>Visibility is controlled by enabled modules for your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>
            Dashboard cards show locked modules with an upgrade prompt.
          </p>
          <p>
            The sidebar hides disabled modules.
          </p>
          <p className="text-xs text-slate-500">
            Note: In development, direct URL access may still work even if a module is disabled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
