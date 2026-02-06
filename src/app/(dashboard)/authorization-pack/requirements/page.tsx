"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkspaceHeader } from "../components/workspace/WorkspaceHeader";
import { RequirementsList } from "../components/workspace/RequirementsList";
import { Card, CardContent } from "@/components/ui/card";
import { PackType } from "@/lib/authorization-pack-templates";
import { getRequirementsForPermission } from "@/lib/requirements-by-permission";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

export const dynamic = "force-dynamic";

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

export default function RequirementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const highlightRequirement = searchParams.get("requirement");

  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedDocuments, setUploadedDocuments] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const packResponse = await fetchWithTimeout("/api/authorization-pack/packs?organizationId=default-org").catch(
          () => null
        );
        if (!packResponse?.ok) return;

        const packData = await packResponse.json();
        const activePack =
          (packIdParam ? packData.packs?.find((item: PackRow) => item.id === packIdParam) : null) ??
          packData.packs?.[0] ??
          null;
        setPack(activePack);

        if (activePack) {
          if (packIdParam !== activePack.id) {
            router.replace(`/authorization-pack/requirements?packId=${activePack.id}`);
          }
          const [readinessResponse, evidenceResponse] = await Promise.all([
            fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null),
            fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/evidence`).catch(() => null),
          ]);
          if (readinessResponse?.ok) {
            const readinessData = await readinessResponse.json();
            setReadiness(readinessData.readiness);
          }
          if (evidenceResponse?.ok) {
            const evidenceData = await evidenceResponse.json();
            const docMap = new Map<string, string[]>();
            for (const item of evidenceData.evidence || []) {
              if (item.status === "uploaded" && item.file_path) {
                docMap.set(item.id, [item.file_path]);
              }
            }
            setUploadedDocuments(docMap);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam, router]);

  const requirements = pack?.template_type ? getRequirementsForPermission(pack.template_type) : [];

  const handleUploadClick = (documentId: string, requirementId: string) => {
    router.push(`/authorization-pack/evidence?packId=${pack?.id}&document=${documentId}`);
  };

  const handleGuidanceClick = (guidanceKey: string) => {
    router.push(`/authorization-pack/guidance?packId=${pack?.id}&topic=${guidanceKey}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading requirements...
            </div>
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
          <CardContent className="p-8 text-center text-slate-500">
            Create a pack to view requirements.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <RequirementsList
        requirements={requirements}
        uploadedDocuments={uploadedDocuments}
        onUploadClick={handleUploadClick}
        onGuidanceClick={handleGuidanceClick}
      />
    </div>
  );
}
