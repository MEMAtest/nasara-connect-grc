"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
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

interface SectionSummary {
  id: string;
  section_key: string;
  title: string;
  status: string;
  owner_id?: string | null;
  due_date?: string | null;
  review_state: string;
  narrativeCompletion: number;
  evidenceCompletion: number;
  reviewCompletion: number;
  evidenceUploaded: number;
  evidenceTotal: number;
}

export function SectionsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
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
        if (activePack) {
          if (packIdParam !== activePack.id) {
            router.replace(`/authorization-pack/sections?packId=${activePack.id}`);
          }
          const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
            () => null
          );
          if (readinessResponse?.ok) {
            const readinessData = await readinessResponse.json();
            setReadiness(readinessData.readiness);
          }
          const sectionResponse = await fetchWithTimeout(
            `/api/authorization-pack/packs/${activePack.id}/sections`
          ).catch(() => null);
          if (sectionResponse?.ok) {
            const sectionData = await sectionResponse.json();
            setSections(sectionData.sections || []);
          }
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
          <CardContent className="p-8 text-center text-slate-500">Loading sections...</CardContent>
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
            <CardTitle>Sections unavailable</CardTitle>
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
          <CardContent className="p-8 text-center text-slate-500">
            Create a pack in Overview to start tracking sections.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>
            {packTypeLabels[pack.template_type]} spine with evidence and review gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                <p className="text-xs text-slate-500">{section.section_key}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge variant="outline">{section.status.replace("-", " ")}</Badge>
                <Badge variant="outline">Review {section.review_state.replace("-", " ")}</Badge>
                <Badge variant="outline">Narrative {section.narrativeCompletion}%</Badge>
                <Badge variant="outline">Evidence {section.evidenceCompletion}%</Badge>
                <Badge variant="outline">Review {section.reviewCompletion}%</Badge>
                <Badge variant="outline">
                  Evidence {section.evidenceUploaded}/{section.evidenceTotal}
                </Badge>
                {section.due_date ? (
                  <Badge variant="outline">Due {new Date(section.due_date).toLocaleDateString()}</Badge>
                ) : null}
              </div>
              <Button asChild variant="outline">
                <Link href={`/authorization-pack/sections/${section.id}?packId=${pack.id}`}>Open Workspace</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
