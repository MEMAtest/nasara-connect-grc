"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

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

export function ExportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const safeName = pack?.name ? pack.name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-") : "pack";

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
        <CardHeader>
          <CardTitle>Export Center</CardTitle>
          <CardDescription>Generate business plan outputs and annex packs.</CardDescription>
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
      <Card className="border border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-sm text-slate-500">
          Export automation is staged for the next release. Use this page to confirm readiness and plan outputs.
        </CardContent>
      </Card>
    </div>
  );
}
