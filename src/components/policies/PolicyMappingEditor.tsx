"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Plus, Trash2 } from "lucide-react";
import { useOrganization } from "@/components/organization-provider";
import type { EntityLink, EntityType } from "@/lib/server/entity-link-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type LinkResponse = { links: EntityLink[] };

type RiskOption = { id: string; title: string; riskId?: string };
type ControlOption = { id: string; title: string; owner?: string };
type TrainingOption = { id: string; title: string; category?: string };

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  });

function groupLabel(type: EntityType) {
  if (type === "control") return "Controls";
  if (type === "risk") return "Risks";
  if (type === "training") return "Training";
  if (type === "evidence") return "Evidence";
  return "Links";
}

function getLinkTitle(link: EntityLink): string {
  const meta = link.metadata ?? {};
  const title = typeof meta.title === "string" ? meta.title : typeof meta.label === "string" ? meta.label : "";
  if (title.trim().length) return title.trim();
  return link.toId;
}

export function PolicyMappingEditor({ policyId }: { policyId: string }) {
  const { organizationId } = useOrganization();
  const { data, mutate } = useSWR<LinkResponse>(`/api/policies/${policyId}/links`, fetcher);
  const links = useMemo(() => data?.links ?? [], [data?.links]);

  const { data: risksData } = useSWR<RiskOption[]>(
    `/api/organizations/${organizationId}/risks`,
    fetcher,
  );
  const { data: controlsData } = useSWR<ControlOption[]>(
    `/api/organizations/${organizationId}/cmp/controls`,
    fetcher,
  );
  const { data: trainingData } = useSWR<{ modules: TrainingOption[] }>(
    "/api/training/catalog",
    fetcher,
  );

  const risks = useMemo(() => (risksData ?? []).map((risk) => ({ id: risk.id, title: risk.title, riskId: risk.riskId })), [risksData]);
  const controls = useMemo(() => (controlsData ?? []).map((control) => ({ id: control.id, title: control.title, owner: control.owner })), [controlsData]);
  const training = useMemo(() => trainingData?.modules ?? [], [trainingData?.modules]);

  const [picker, setPicker] = useState<{ open: boolean; type: EntityType | null }>({ open: false, type: null });
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");

  const grouped = useMemo(() => {
    const byType: Record<EntityType, EntityLink[]> = {
      policy: [],
      risk: [],
      control: [],
      training: [],
      evidence: [],
    };
    for (const link of links) {
      byType[link.toType]?.push(link);
    }
    return byType;
  }, [links]);

  const availableForPicker = useMemo(() => {
    const type = picker.type;
    if (!type) return [];
    const existing = new Set(links.filter((link) => link.toType === type).map((link) => link.toId));
    if (type === "risk") return risks.filter((item) => !existing.has(item.id));
    if (type === "control") return controls.filter((item) => !existing.has(item.id));
    if (type === "training") return training.filter((item) => !existing.has(item.id));
    return [];
  }, [picker.type, links, risks, controls, training]);

  const addLink = async (payload: { toType: EntityType; toId: string; metadata?: Record<string, unknown> }) => {
    const response = await fetch(`/api/policies/${policyId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create link");
    await mutate();
  };

  const removeLink = async (toType: EntityType, toId: string) => {
    const response = await fetch(`/api/policies/${policyId}/links`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toType, toId }),
    });
    if (!response.ok) throw new Error("Failed to remove link");
    await mutate();
  };

  const handlePick = async (option: RiskOption | ControlOption | TrainingOption) => {
    const type = picker.type;
    if (!type) return;
    setPicker({ open: false, type: null });
    await addLink({
      toType: type,
      toId: option.id,
      metadata: {
        title: option.title,
        ...(type === "risk" && "riskId" in option ? { riskId: option.riskId ?? null } : {}),
        ...(type === "control" && "owner" in option ? { owner: option.owner ?? null } : {}),
        ...(type === "training" && "category" in option ? { category: option.category ?? null } : {}),
      },
    });
  };

  const handleAddEvidence = async () => {
    const title = evidenceTitle.trim();
    const url = evidenceUrl.trim();
    if (!title) return;
    const evidenceId = crypto.randomUUID();
    await addLink({
      toType: "evidence",
      toId: evidenceId,
      metadata: {
        title,
        url: url.length ? url : null,
        notes: evidenceNotes.trim().length ? evidenceNotes.trim() : null,
      },
    });
    setEvidenceTitle("");
    setEvidenceUrl("");
    setEvidenceNotes("");
    setEvidenceOpen(false);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Policy mapping</h2>
        <p className="text-sm text-slate-500">
          Map this policy to risks, CMP controls, training content, and evidence so the platform can report coverage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Controls</p>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => setPicker({ open: true, type: "control" })}>
              <Plus className="h-4 w-4" />
              Link control
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {grouped.control.length ? (
              grouped.control.map((link) => (
                <div key={`${link.toType}-${link.toId}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">{getLinkTitle(link)}</p>
                    {"owner" in link.metadata && typeof link.metadata.owner === "string" ? (
                      <p className="text-xs text-slate-500">Owner: {link.metadata.owner}</p>
                    ) : null}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLink("control", link.toId)} className="text-slate-500 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No mapped controls yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Risks</p>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => setPicker({ open: true, type: "risk" })}>
              <Plus className="h-4 w-4" />
              Link risk
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {grouped.risk.length ? (
              grouped.risk.map((link) => (
                <div key={`${link.toType}-${link.toId}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">{getLinkTitle(link)}</p>
                    {"riskId" in link.metadata && typeof link.metadata.riskId === "string" ? (
                      <p className="text-xs text-slate-500">Risk ID: {link.metadata.riskId}</p>
                    ) : null}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLink("risk", link.toId)} className="text-slate-500 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No mapped risks yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Training</p>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => setPicker({ open: true, type: "training" })}>
              <Plus className="h-4 w-4" />
              Link training
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {grouped.training.length ? (
              grouped.training.map((link) => (
                <div key={`${link.toType}-${link.toId}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">{getLinkTitle(link)}</p>
                    {"category" in link.metadata && typeof link.metadata.category === "string" ? (
                      <p className="text-xs text-slate-500">{link.metadata.category}</p>
                    ) : null}
                    <div className="pt-1">
                      <Badge variant="outline" className="text-[11px]">
                        Lesson: {link.toId}
                      </Badge>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLink("training", link.toId)} className="text-slate-500 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No mapped training yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Evidence</p>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => setEvidenceOpen(true)}>
              <Plus className="h-4 w-4" />
              Add evidence
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {grouped.evidence.length ? (
              grouped.evidence.map((link) => (
                <div key={`${link.toType}-${link.toId}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">{getLinkTitle(link)}</p>
                    {"url" in link.metadata && typeof link.metadata.url === "string" ? (
                      <a href={link.metadata.url} className="text-xs text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                        {link.metadata.url}
                      </a>
                    ) : null}
                    {"notes" in link.metadata && typeof link.metadata.notes === "string" ? (
                      <p className="text-xs text-slate-500">{link.metadata.notes}</p>
                    ) : null}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLink("evidence", link.toId)} className="text-slate-500 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No evidence captured yet.</p>
            )}
          </div>
        </div>
      </div>

      <CommandDialog open={picker.open} onOpenChange={(open) => setPicker((current) => ({ open, type: open ? current.type : null }))} title="Link item">
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading={picker.type ? `Select ${groupLabel(picker.type).toLowerCase().slice(0, -1)}` : "Select item"}>
            {availableForPicker.map((option) => (
              <CommandItem key={option.id} onSelect={() => void handlePick(option)}>
                <span className="font-medium">{option.title}</span>
                <span className="ml-auto text-xs text-slate-500">{option.id}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add evidence</DialogTitle>
            <DialogDescription>Capture supporting evidence for this policy (link, reference, or note).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} placeholder="e.g. AML annual review minutes" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">URL (optional)</label>
              <Input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
              <Textarea value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} placeholder="What does this evidence show?" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEvidenceOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => void handleAddEvidence()} disabled={!evidenceTitle.trim().length}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
