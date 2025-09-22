"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { StoredPolicy } from "@/lib/server/policy-store";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to load policy");
    }
    return res.json() as Promise<StoredPolicy>;
  });

export default function PolicyEditPage() {
  const params = useParams<{ policyId: string }>();
  const policyIdParam = params?.policyId;
  const policyId = Array.isArray(policyIdParam) ? policyIdParam[0] : policyIdParam;
  const router = useRouter();
  const { toast } = useToast();

  const isPolicyIdReady = typeof policyId === "string" && policyId.length > 0;

  const { data, error, isLoading, mutate } = useSWR<StoredPolicy>(
    isPolicyIdReady ? `/api/policies/${policyId}` : null,
    fetcher,
  );

  const [status, setStatus] = useState<StoredPolicy["status"]>("draft");
  const [customContent, setCustomContent] = useState<Record<string, string>>({});
  const [approvals, setApprovals] = useState<StoredPolicy["approvals"]>({
    requiresSMF: false,
    smfRole: "",
    requiresBoard: false,
    boardFrequency: "annual",
    additionalApprovers: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setCustomContent(data.customContent ?? {});
      setApprovals({
        requiresSMF: data.approvals.requiresSMF,
        smfRole: data.approvals.smfRole ?? "",
        requiresBoard: data.approvals.requiresBoard,
        boardFrequency: data.approvals.boardFrequency,
        additionalApprovers: data.approvals.additionalApprovers ?? [],
      });
    }
  }, [data]);

  const sections = useMemo(() => data?.template.sections ?? [], [data?.template.sections]);

  const handleContentChange = (sectionId: string, value: string) => {
    setCustomContent((current) => ({ ...current, [sectionId]: value }));
  };

  const toggleApproval = (key: "requiresSMF" | "requiresBoard") => {
    setApprovals((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleApproverChange = (value: string) => {
    const entries = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    setApprovals((current) => ({ ...current, additionalApprovers: entries }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !policyId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          customContent,
          approvals: {
            ...approvals,
            smfRole: approvals.smfRole?.trim() || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const updated = (await response.json()) as StoredPolicy;
      await mutate(updated, { revalidate: false });
      toast({ title: "Policy updated", description: "Changes saved successfully." });
      router.push(`/policies/${policyId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPolicyIdReady) {
    return <p className="text-sm text-rose-600">Invalid policy reference.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading policy…</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-rose-600">Unable to load policy.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2 px-0 text-slate-500 hover:text-slate-700">
          <Link href={`/policies/${policyId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to policy
          </Link>
        </Button>
        <Badge variant="outline" className="uppercase tracking-widest text-xs">
          {data.code}
        </Badge>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Edit policy</h1>
        <p className="text-sm text-slate-500">
          Update bespoke content and approval workflow. You can revisit the wizard to regenerate clauses if required.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Status & governance</h2>
            <p className="text-sm text-slate-500">Set the current lifecycle status and attestation workflow.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as StoredPolicy["status"]) }>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SMF attestation</label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Checkbox checked={approvals.requiresSMF} onCheckedChange={() => toggleApproval("requiresSMF")}/>
                <span className="text-sm text-slate-700">Requires SMF sign-off</span>
              </div>
              {approvals.requiresSMF ? (
                <Input
                  placeholder="e.g. SMF16 - Compliance Monitoring"
                  value={approvals.smfRole ?? ""}
                  onChange={(event) =>
                    setApprovals((current) => ({ ...current, smfRole: event.target.value }))
                  }
                />
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Board review cadence</label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Checkbox checked={approvals.requiresBoard} onCheckedChange={() => toggleApproval("requiresBoard")}/>
                <span className="text-sm text-slate-700">Board or committee approval needed</span>
              </div>
              {approvals.requiresBoard ? (
                <Select
                  value={approvals.boardFrequency}
                  onValueChange={(value) =>
                    setApprovals((current) => ({
                      ...current,
                      boardFrequency: value as StoredPolicy["approvals"]["boardFrequency"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annual">Semi-annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Additional approvers</label>
              <Input
                placeholder="Jane Doe, Head of Legal"
                value={approvals.additionalApprovers.join(", ")}
                onChange={(event) => handleApproverChange(event.target.value)}
              />
              {approvals.additionalApprovers.length ? (
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {approvals.additionalApprovers.map((approver) => (
                    <Badge key={approver} variant="secondary" className="text-[11px]">
                      {approver}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Custom content</h2>
            <p className="text-sm text-slate-500">
              Tailor each section with firm-specific wording. Clauses suggested by the wizard are displayed for reference.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => {
              const insertedClauses = data.clauses.filter((clause) => section.suggestedClauses.includes(clause.id));
              return (
                <div key={section.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                      <p className="text-xs text-slate-500">{section.summary}</p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">Section</Badge>
                  </div>
                  <Textarea
                    className="h-32"
                    value={customContent[section.id] ?? ""}
                    placeholder="Describe how this requirement applies to your firm"
                    onChange={(event) => handleContentChange(section.id, event.target.value)}
                  />
                  {insertedClauses.length ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Clauses in scope</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {insertedClauses.map((clause) => (
                          <li key={clause.id}>• {clause.title}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href={`/policies/${policyId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
