"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface PermissionEcosystem {
  id: string;
  permission_code: string;
  name: string;
  description: string;
  pack_template_type: string;
  section_keys: string[];
  policy_templates: string[];
  training_requirements: string[];
  smcr_roles: string[];
  typical_timeline_weeks: number | null;
}

export function PermissionSelectorClient() {
  const router = useRouter();
  const [ecosystems, setEcosystems] = useState<PermissionEcosystem[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(
    () => ecosystems.find((item) => item.permission_code === selectedCode) || null,
    [ecosystems, selectedCode]
  );

  const loadEcosystems = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout("/api/authorization-pack/ecosystems").catch(() => null);
      if (!response || !response.ok) {
        setLoadError("Unable to load permission ecosystems. Please try again.");
        return;
      }
      const data = await response.json();
      setEcosystems(data.ecosystems || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEcosystems();
  }, []);

  const handleSelect = (code: string, name: string) => {
    setSelectedCode(code);
    if (!projectName.trim()) {
      setProjectName(`${name} Authorisation Project`);
    }
  };

  const handleCreate = async () => {
    if (!selectedCode || !projectName.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/authorization-pack/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          permissionCode: selectedCode,
          organizationId: "default-org",
          targetSubmissionDate: targetDate || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.project?.id) {
          router.push(`/authorization-pack/${data.project.id}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || "Unable to create project. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">Authorisation Pack</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Select a permission type</h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose the FCA permission scope and we will generate the full ecosystem instantly.
        </p>
      </div>

      {isLoading ? (
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading ecosystems...</CardContent>
        </Card>
      ) : null}

      {loadError ? (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Permission ecosystems unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadEcosystems}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !loadError ? (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {ecosystems.map((item) => {
              const isSelected = item.permission_code === selectedCode;
              const isPrimary = item.permission_code === "payments";
              return (
                <Card
                  key={item.permission_code}
                  className={`cursor-pointer border ${isSelected ? "border-teal-500 shadow-md" : "border-slate-200"}`}
                  onClick={() => handleSelect(item.permission_code, item.name)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base text-slate-900">{item.name}</CardTitle>
                      {isPrimary ? <Badge className="bg-teal-600 text-white">Recommended</Badge> : null}
                    </div>
                    <CardDescription className="text-sm text-slate-500">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-500">
                    <div className="flex flex-wrap gap-3">
                      <span>{item.section_keys.length} sections</span>
                      <span>{item.policy_templates.length} policies</span>
                      <span>{item.training_requirements.length} training modules</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span>{item.smcr_roles.length} SMCR roles</span>
                      <span>
                        {item.typical_timeline_weeks
                          ? `Typical timeline ${item.typical_timeline_weeks} weeks`
                          : "Timeline pending"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Create project</CardTitle>
              <CardDescription>Configure the authorisation workspace details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project name</Label>
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="FCA Payments Authorisation"
                />
              </div>
              <div className="space-y-2">
                <Label>Target submission date</Label>
                <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
              </div>
              {selected ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">{selected.name} ecosystem</p>
                  <p className="mt-2">Sections: {selected.section_keys.length}</p>
                  <p>Policies: {selected.policy_templates.length}</p>
                  <p>Training: {selected.training_requirements.length}</p>
                  <p>SMCR roles: {selected.smcr_roles.length}</p>
                </div>
              ) : null}
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!selectedCode || !projectName.trim() || isSubmitting}
                onClick={handleCreate}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
