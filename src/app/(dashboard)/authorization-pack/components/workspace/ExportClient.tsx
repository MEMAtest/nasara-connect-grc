"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

interface ValidationIssue {
  section: string;
  type: string;
  description: string;
  severity: "warning" | "error";
}

interface ValidationResult {
  score: number;
  issues: ValidationIssue[];
  ready: boolean;
  summary: string;
}

export function ExportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBatchExporting, setIsBatchExporting] = useState(false);

  const downloadFile = async (endpoint: string, filename: string) => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const validatePack = async () => {
    if (!pack) return;
    setIsValidating(true);
    setValidationError(null);
    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/validate`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setValidationError(errorData.error || "Validation failed");
        return;
      }
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  const safeName = pack?.name ? pack.name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-") : "pack";

  const downloadBatchExport = async () => {
    if (!pack) return;
    setIsBatchExporting(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      await downloadFile(
        `/api/authorization-pack/packs/${pack.id}/export/batch`,
        `${safeName}-complete-${timestamp}.zip`
      );
    } finally {
      setIsBatchExporting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const packResponse = await fetchWithTimeout("/api/authorization-pack/packs?organizationId=default-org").catch(
          () => null
        );
        if (!packResponse || !packResponse.ok) {
          setLoadError("Unable to load packs. Check the database connection and try again.");
          return;
        }
        const packData = await packResponse.json();
        const activePack =
          (packIdParam ? packData.packs?.find((item: PackRow) => item.id === packIdParam) : null) ??
          packData.packs?.[0] ??
          null;
        setPack(activePack);
        if (!activePack) return;

        if (packIdParam !== activePack.id) {
          router.replace(`/authorization-pack/export?packId=${activePack.id}`);
        }

        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading export tools...</CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Exports unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={null} readiness={null} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Create a pack to generate exports.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Export Center</CardTitle>
            <CardDescription>Generate business plan outputs and annex packs.</CardDescription>
          </div>
          <Button
            onClick={downloadBatchExport}
            disabled={isBatchExporting}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            {isBatchExporting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">Business plan narrative</p>
            <p className="text-xs text-slate-500">Merge section narratives into a single document.</p>
            <div className="mt-4 space-y-2">
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() =>
                  downloadFile(`/api/authorization-pack/packs/${pack.id}/export/narrative`, `${safeName}-narrative.md`)
                }
              >
                Download Markdown
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  downloadFile(
                    `/api/authorization-pack/packs/${pack.id}/export/narrative-docx`,
                    `${safeName}-narrative.docx`
                  )
                }
              >
                Download DOCX
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  downloadFile(
                    `/api/authorization-pack/packs/${pack.id}/export/narrative-pdf`,
                    `${safeName}-narrative.pdf`
                  )
                }
              >
                Download PDF
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">Annex index</p>
            <p className="text-xs text-slate-500">Create the annex register with evidence mapping.</p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() =>
                downloadFile(`/api/authorization-pack/packs/${pack.id}/export/annex-index`, `${safeName}-annex-index.csv`)
              }
            >
              Download annex index
            </Button>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">Evidence bundle</p>
            <p className="text-xs text-slate-500">Zip all evidence uploads for submission.</p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() =>
                downloadFile(`/api/authorization-pack/packs/${pack.id}/export/evidence-zip`, `${safeName}-evidence.zip`)
              }
            >
              Download evidence zip
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Quality Check Card */}
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <SparklesIcon className="h-4 w-4 text-teal-600" />
              Pre-Export Quality Check
              {validation && (
                <Badge
                  variant="outline"
                  className={validation.ready ? "border-green-300 bg-green-50 text-green-700" : "border-amber-300 bg-amber-50 text-amber-700"}
                >
                  {validation.ready ? "Ready" : "Needs Review"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>AI-powered validation to catch issues before submission.</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={validatePack}
            disabled={isValidating}
            className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            {isValidating ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-teal-500 border-t-transparent" />
                Validating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-3 w-3" />
                Check Quality
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {validationError && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              <span>AI: {validationError}</span>
              <button onClick={() => setValidationError(null)} className="text-amber-600 hover:text-amber-800">
                &times;
              </button>
            </div>
          )}
          {validation ? (
            <div className="space-y-4">
              {/* Score and Summary */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Quality Score</p>
                  <p className="mt-1 text-xs text-slate-500">{validation.summary}</p>
                </div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  validation.score >= 80 ? "bg-green-100 text-green-700" :
                  validation.score >= 60 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  <span className="text-2xl font-bold">{validation.score}</span>
                </div>
              </div>

              {/* Issues List */}
              {validation.issues.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Issues Found ({validation.issues.length})</p>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {validation.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 ${
                          issue.severity === "error"
                            ? "border-red-200 bg-red-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{issue.section}</p>
                            <p className="mt-0.5 text-xs text-slate-600">{issue.description}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-xs ${
                              issue.severity === "error"
                                ? "border-red-300 text-red-700"
                                : "border-amber-300 text-amber-700"
                            }`}
                          >
                            {issue.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-sm font-medium text-green-700">No issues found!</p>
                  <p className="mt-1 text-xs text-green-600">Your pack is ready for export.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-slate-400">
              Click &quot;Check Quality&quot; to validate your pack before exporting.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
