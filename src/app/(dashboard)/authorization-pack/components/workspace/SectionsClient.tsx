"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
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
  review: number;
}

interface SectionSummary {
  id: string;
  section_key: string;
  title: string;
  status?: string;
  owner_id?: string | null;
  due_date?: string | null;
  review_state?: string;
  narrativeCompletion: number;
  reviewCompletion: number;
}

// Inner component with hooks - wrapped in Suspense
function SectionsClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams?.get("packId") ?? null;
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(true);

  // All useMemo hooks must be called unconditionally before any early returns
  const uniqueSections = useMemo(() => {
    if (!sections || sections.length === 0) return [];
    const seen = new Set<string>();
    return sections.filter((section) => {
      const key = section.section_key || section.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sections]);

  const remainingSections = useMemo(() => {
    return uniqueSections.filter((section) => section.narrativeCompletion < 100);
  }, [uniqueSections]);

  const visibleSections = useMemo(() => {
    return showIncompleteOnly ? remainingSections : uniqueSections;
  }, [showIncompleteOnly, remainingSections, uniqueSections]);

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
          const [readinessResponse, sectionResponse] = await Promise.all([
            fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null),
            fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/sections`).catch(() => null),
          ]);
          if (readinessResponse?.ok) {
            const readinessData = await readinessResponse.json();
            setReadiness(readinessData.readiness);
          }
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
  }, [packIdParam, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading sections...
            </div>
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
            {packTypeLabels[pack.template_type]} spine with review gates.
          </CardDescription>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{remainingSections.length} sections remaining</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-slate-200 text-xs text-slate-600"
              onClick={() => setShowIncompleteOnly((prev) => !prev)}
            >
              {showIncompleteOnly ? "Show all sections" : "Show remaining only"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleSections.length === 0 ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              All sections are complete. Switch to review to sign off and export.
            </div>
          ) : (
            visibleSections.map((section) => (
              <div key={section.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                  <p className="text-xs text-slate-500">{section.section_key}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <Badge variant="outline">{(section.status || "not-started").replace("-", " ")}</Badge>
                  <Badge variant="outline">Review {(section.review_state || "draft").replace("-", " ")}</Badge>
                  <Badge variant="outline">Narrative {section.narrativeCompletion}%</Badge>
                  <Badge variant="outline">Review {section.reviewCompletion}%</Badge>
                  {section.due_date ? (
                    <Badge variant="outline">Due {new Date(section.due_date).toLocaleDateString()}</Badge>
                  ) : null}
                </div>
                <Button asChild variant="outline">
                  <Link href={`/authorization-pack/sections/${section.id}?packId=${pack.id}`}>Open Workspace</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with Suspense boundary for useSearchParams
export function SectionsClient() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SectionsClientInner />
    </Suspense>
  );
}
