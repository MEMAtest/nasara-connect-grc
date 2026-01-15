"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface ReviewGate {
  id: string;
  stage: string;
  state: string;
  reviewer_role: string;
  section_title: string;
}

export function ReviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [review, setReview] = useState<ReviewGate[]>([]);
  const [notes, setNotes] = useState<Record<string, { notes: string; clientNotes: string }>>({});
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
          router.replace(`/authorization-pack/review?packId=${activePack.id}`);
        }

        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        const reviewResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/review`).catch(
          () => null
        );
        if (reviewResponse?.ok) {
          const reviewData = await reviewResponse.json();
          setReview(reviewData.review || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam]);

  const handleUpdate = async (gateId: string, state: string) => {
    if (!pack) return;
    const payload = notes[gateId] || { notes: "", clientNotes: "" };
    await fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateId, state, notes: payload.notes, clientNotes: payload.clientNotes }),
    });
    setReview((prev) => prev.map((item) => (item.id === gateId ? { ...item, state } : item)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading review queue...</CardContent>
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
            <CardTitle>Review queue unavailable</CardTitle>
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
          <CardContent className="p-8 text-center text-slate-500">Create a pack to manage reviews.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>Separate client and consultant review flows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {review.map((gate) => (
            <div key={gate.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{gate.section_title}</p>
                  <p className="text-xs text-slate-500">{gate.stage.replace("-", " ")}</p>
                </div>
                <Badge variant="outline">{gate.state.replace("-", " ")}</Badge>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Internal notes</p>
                  <Textarea
                    value={notes[gate.id]?.notes ?? ""}
                    onChange={(event) =>
                      setNotes((prev) => ({
                        ...prev,
                        [gate.id]: {
                          notes: event.target.value,
                          clientNotes: prev[gate.id]?.clientNotes ?? "",
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Client-visible notes</p>
                  <Textarea
                    value={notes[gate.id]?.clientNotes ?? ""}
                    onChange={(event) =>
                      setNotes((prev) => ({
                        ...prev,
                        [gate.id]: {
                          notes: prev[gate.id]?.notes ?? "",
                          clientNotes: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleUpdate(gate.id, "changes_requested")}>
                  Request changes
                </Button>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => handleUpdate(gate.id, "approved")}>
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
