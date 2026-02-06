"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkspaceHeader } from "../components/workspace/WorkspaceHeader";
import { GuidanceLibrary } from "../components/workspace/GuidanceLibrary";
import { Card, CardContent } from "@/components/ui/card";
import { PackType } from "@/lib/authorization-pack-templates";
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

export default function GuidancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const topicParam = searchParams.get("topic");

  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuidanceKey, setSelectedGuidanceKey] = useState<string | null>(topicParam);

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

        if (activePack && packIdParam !== activePack.id) {
          const newParams = new URLSearchParams();
          newParams.set("packId", activePack.id);
          if (topicParam) newParams.set("topic", topicParam);
          router.replace(`/authorization-pack/guidance?${newParams.toString()}`);
        }

        if (activePack) {
          const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null);
          if (readinessResponse?.ok) {
            const readinessData = await readinessResponse.json();
            setReadiness(readinessData.readiness);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam, router, topicParam]);

  // Update URL when guidance selection changes
  const handleSelectGuidance = (key: string | null) => {
    setSelectedGuidanceKey(key);
    const newParams = new URLSearchParams(searchParams.toString());
    if (key) {
      newParams.set("topic", key);
    } else {
      newParams.delete("topic");
    }
    router.replace(`/authorization-pack/guidance?${newParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading guidance library...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <GuidanceLibrary
        selectedGuidanceKey={selectedGuidanceKey}
        onSelectGuidance={handleSelectGuidance}
      />
    </div>
  );
}
