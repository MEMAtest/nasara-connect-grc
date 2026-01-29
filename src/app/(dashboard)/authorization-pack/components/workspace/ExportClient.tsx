"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NasaraLoader } from "@/components/ui/nasara-loader";
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

const ensurePdfFilename = (value: string) => (value.toLowerCase().endsWith(".pdf") ? value : `${value}.pdf`);

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
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

interface GenerationJob {
  id: string;
  status: string;
  progress?: number | null;
  currentStep?: string | null;
  errorMessage?: string | null;
  documentId?: string | null;
  documentName?: string | null;
  payload?: { warnings?: string[] };
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
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [opinionJob, setOpinionJob] = useState<GenerationJob | null>(null);
  const opinionInFlight = useRef(false);

  const downloadFile = async (
    endpoint: string,
    filename: string,
    formatLabel?: string,
    options?: RequestInit
  ) => {
    const format = formatLabel || filename.split(".").pop()?.toUpperCase() || "file";
    setDownloadingFormat(format);
    setDownloadError(null);
    setDownloadSuccess(null);
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Download failed");
        let errorMessage = errorText;
        try {
          const parsed = JSON.parse(errorText) as { error?: string; details?: string };
          errorMessage = parsed.error || parsed.details || errorText;
        } catch {
          // Use raw text if not JSON.
        }
        setDownloadError(`Failed to download ${format}: ${errorMessage}`);
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
      setDownloadSuccess(`${format} downloaded successfully`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (error) {
      setDownloadError(`Failed to download ${format}: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const downloadOpinionDocument = async (documentId: string, documentName?: string | null) => {
    if (!pack) return;
    const safeName = documentName
      ? documentName.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-")
      : `${pack.name}-opinion-pack`;
    await downloadFile(
      `/api/authorization-pack/packs/${pack.id}/documents/${documentId}`,
      ensurePdfFilename(`${safeName}`),
      "Opinion PDF"
    );
  };

  const runOpinionPackJob = async (jobId: string) => {
    if (!pack || opinionInFlight.current) return;
    opinionInFlight.current = true;
    setDownloadError(null);

    try {
      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 30) {
        attempts += 1;
        const response = await fetch(`/api/authorization-pack/packs/${pack.id}/generate-business-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run", jobId, batchSize: 1 }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          setDownloadError(errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error || "Failed to generate opinion pack");
          break;
        }

        const data = await response.json();
        const nextJob = data.job as GenerationJob | null;
        if (!nextJob) {
          setDownloadError("Generation status unavailable. Please try again.");
          break;
        }

        setOpinionJob(nextJob);

        if (nextJob.status === "completed") {
          const documentId = data.document?.id || nextJob.documentId;
          const documentName = data.document?.name || nextJob.documentName;
          if (documentId) {
            await downloadOpinionDocument(documentId, documentName);
          } else {
            setDownloadError("Opinion pack completed but no document was created.");
          }
          completed = true;
          break;
        }

        if (nextJob.status === "failed") {
          setDownloadError(nextJob.errorMessage || "Failed to generate opinion pack.");
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      if (!completed && attempts >= 30) {
        setDownloadError("Generation is taking longer than expected. Please click again to continue.");
      }
    } catch (error) {
      setDownloadError(`Failed to generate opinion pack: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      opinionInFlight.current = false;
    }
  };

  const handleOpinionPackDownload = async () => {
    if (!pack) return;
    setOpinionJob(null);
    setDownloadError(null);
    setDownloadSuccess(null);

    const response = await fetch(`/api/authorization-pack/packs/${pack.id}/generate-business-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    }).catch(() => null);

    if (!response?.ok) {
      const errorData = response ? await response.json().catch(() => ({ error: "Unknown error" })) : { error: "Connection failed" };
      setDownloadError(errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error || "Failed to start opinion pack");
      return;
    }

    const data = await response.json();
    const job = data.job as GenerationJob | null;
    if (!job?.id) {
      setDownloadError("Unable to start opinion pack job.");
      return;
    }
    setOpinionJob(job);
    await runOpinionPackJob(job.id);
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

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const packResponse = await fetchWithTimeout("/api/authorization-pack/packs").catch(
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
  }, [packIdParam, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <NasaraLoader label="Loading export tools..." />
          </CardContent>
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

      {/* Status notifications */}
      {downloadError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{downloadError}</span>
          <button onClick={() => setDownloadError(null)} className="ml-4 text-red-600 hover:text-red-800">
            &times;
          </button>
        </div>
      )}
      {downloadSuccess && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{downloadSuccess}</span>
          <button onClick={() => setDownloadSuccess(null)} className="ml-4 text-green-600 hover:text-green-800">
            &times;
          </button>
        </div>
      )}
      {downloadingFormat && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <NasaraLoader label={`Downloading ${downloadingFormat}...`} size="sm" className="items-start" />
        </div>
      )}
      {opinionJob && opinionJob.status !== "completed" && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="space-y-2 p-4 text-sm text-blue-900">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">Opinion pack</span>
              <span className="text-xs text-blue-800">{opinionJob.currentStep || "Generating..."}</span>
            </div>
            <Progress value={opinionJob.progress ?? 0} className="h-2" />
            <div className="flex items-center justify-between text-xs text-blue-700">
              <span>{opinionJob.progress ?? 0}% complete</span>
              {opinionJob.payload?.warnings?.length ? (
                <span>{opinionJob.payload.warnings.length} warnings</span>
              ) : null}
            </div>
            {opinionJob.errorMessage ? (
              <p className="text-xs text-blue-800">{opinionJob.errorMessage}</p>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Main Export Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Perimeter Opinion Pack */}
        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-sm">Perimeter Opinion Pack</CardTitle>
                <CardDescription className="text-xs">Regulatory scope opinion with rationale</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleOpinionPackDownload}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Opinion PDF
            </Button>
            <p className="text-center text-xs text-purple-600">
              5-7 page perimeter opinion based on your profile
            </p>
          </CardContent>
        </Card>
      </div>

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
            <CardDescription>Validation to catch issues before submission.</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={validatePack}
            disabled={isValidating}
            className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            {isValidating ? (
              <>
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
          {isValidating ? (
            <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3">
              <NasaraLoader label="Validating your pack..." size="sm" className="items-start" />
            </div>
          ) : null}
          {validationError && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              <span>{validationError}</span>
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
                  <div className="max-h-48 space-y-2 overflow-y-auto">
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

      {/* Additional Exports - Secondary */}
      <Card className="border border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600">Additional Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadFile(`/api/authorization-pack/packs/${pack.id}/export/annex-index`, `${safeName}-annex-index.csv`, "Annex CSV")
              }
            >
              Annex Index CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
