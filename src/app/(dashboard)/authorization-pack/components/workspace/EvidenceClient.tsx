"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface EvidenceItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  annex_number?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  uploaded_at?: string | null;
  version?: number | null;
  section_title?: string | null;
}

interface EvidenceVersion {
  id: string;
  version: number;
  filename: string;
  file_size?: number | null;
  file_type?: string | null;
  uploaded_at?: string | null;
}

export function EvidenceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [versionMap, setVersionMap] = useState<Record<string, EvidenceVersion[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingVersions, setLoadingVersions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
          router.replace(`/authorization-pack/evidence?packId=${activePack.id}`);
        }

        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        const evidenceResponse = await fetchWithTimeout(
          `/api/authorization-pack/packs/${activePack.id}/evidence`
        ).catch(() => null);
        if (evidenceResponse?.ok) {
          const evidenceData = await evidenceResponse.json();
          setEvidence(evidenceData.evidence || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam]);

  const formatSize = (size?: number | null) => {
    if (!size) return "0 KB";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${Math.round(size / (1024 * 1024))} MB`;
  };

  const toggleVersions = async (itemId: string) => {
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    if (versionMap[itemId] || !pack) return;
    setLoadingVersions((prev) => ({ ...prev, [itemId]: true }));
    const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence/${itemId}/versions`);
    if (response.ok) {
      const data = await response.json();
      setVersionMap((prev) => ({ ...prev, [itemId]: data.versions || [] }));
    }
    setLoadingVersions((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleUpload = async (itemId: string, file: File) => {
    if (!pack) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("evidenceItemId", itemId);
    const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      setEvidence((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: "uploaded", file_path: file.name } : item
        )
      );
      setVersionMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading evidence library...</CardContent>
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
            <CardTitle>Evidence unavailable</CardTitle>
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
          <CardContent className="p-8 text-center text-slate-500">Create a pack to manage evidence.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Evidence Hub</CardTitle>
          <CardDescription>Upload, version, and tag evidence across the full pack.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {evidence.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <p className="text-xs text-slate-400">{item.section_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.annex_number ? <Badge variant="outline">{item.annex_number}</Badge> : null}
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-slate-400">
                  Version {item.version ?? 0} {item.file_path ? `· ${item.file_path}` : ""}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.file_path ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={`/api/authorization-pack/packs/${pack.id}/evidence/${item.id}`}>Download</a>
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => toggleVersions(item.id)}>
                    {expanded[item.id] ? "Hide versions" : "View versions"}
                  </Button>
                  <Input
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleUpload(item.id, file);
                    }}
                  />
                </div>
              </div>
              {expanded[item.id] ? (
                <div className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                  {loadingVersions[item.id] ? (
                    <p>Loading versions...</p>
                  ) : versionMap[item.id]?.length ? (
                    versionMap[item.id].map((version) => (
                      <div key={version.id} className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            v{version.version} · {version.filename}
                          </p>
                          <p className="text-xs text-slate-400">
                            {version.uploaded_at ? new Date(version.uploaded_at).toLocaleDateString() : "Unknown date"} · {formatSize(version.file_size)}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={`/api/authorization-pack/packs/${pack.id}/evidence/${item.id}/versions/${version.id}`}
                          >
                            Download
                          </a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p>No prior versions yet.</p>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
