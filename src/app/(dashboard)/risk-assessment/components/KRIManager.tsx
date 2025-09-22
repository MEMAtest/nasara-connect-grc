"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RiskKeyRiskIndicator } from "../lib/riskConstants";

interface KRIManagerProps {
  kris: RiskKeyRiskIndicator[];
  onUpdate: (kris: RiskKeyRiskIndicator[]) => Promise<void> | void;
}

interface KRITemplate {
  category: string;
  indicators: Array<{ name: string; metric: string; threshold?: { green: number; amber: number; red: number } }>;
}

const TEMPLATES: KRITemplate[] = [
  {
    category: "Operational",
    indicators: [
      { name: "System Downtime", metric: "Hours / month", threshold: { green: 2, amber: 6, red: 12 } },
      { name: "Failed Transactions", metric: "Count / day", threshold: { green: 20, amber: 40, red: 60 } },
      { name: "Processing Errors", metric: "% of transactions", threshold: { green: 0.5, amber: 1, red: 2 } },
    ],
  },
  {
    category: "Compliance",
    indicators: [
      { name: "Overdue Actions", metric: "Count", threshold: { green: 0, amber: 3, red: 5 } },
      { name: "Training Completion", metric: "% complete", threshold: { green: 95, amber: 85, red: 70 } },
      { name: "Breach Count", metric: "Incidents / quarter", threshold: { green: 0, amber: 1, red: 3 } },
    ],
  },
  {
    category: "Financial Crime",
    indicators: [
      { name: "SAR Submissions", metric: "Count / month", threshold: { green: 5, amber: 10, red: 15 } },
      { name: "PEP Matches", metric: "Count", threshold: { green: 2, amber: 5, red: 10 } },
      { name: "Sanctions Alerts", metric: "Count / day", threshold: { green: 10, amber: 20, red: 40 } },
    ],
  },
];

function calculateKRIHealth(kri: RiskKeyRiskIndicator) {
  const { currentValue, threshold } = kri;
  if (!threshold) return 0;

  if (currentValue <= threshold.green) return 100;
  if (currentValue <= threshold.amber) {
    const range = threshold.amber - threshold.green || 1;
    return Math.max(65, 100 - ((currentValue - threshold.green) / range) * 35);
  }

  if (currentValue <= threshold.red) {
    const range = threshold.red - threshold.amber || 1;
    return Math.max(35, 65 - ((currentValue - threshold.amber) / range) * 30);
  }

  return 20;
}

function getKRIStatus(kri: RiskKeyRiskIndicator) {
  const { currentValue, threshold } = kri;
  if (!threshold) return { label: "Unknown", color: "bg-slate-200 text-slate-600" };
  if (currentValue <= threshold.green) return { label: "Stable", color: "bg-emerald-100 text-emerald-700" };
  if (currentValue <= threshold.amber) return { label: "Watch", color: "bg-amber-100 text-amber-700" };
  if (currentValue <= threshold.red) return { label: "Alert", color: "bg-orange-100 text-orange-700" };
  return { label: "Critical", color: "bg-rose-100 text-rose-700" };
}

function TrendIndicator({ trend }: { trend?: "up" | "down" | "steady" }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
        <ArrowUpRight className="h-3.5 w-3.5" /> Rising
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
        <ArrowDownRight className="h-3.5 w-3.5" /> Falling
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
      <Minus className="h-3.5 w-3.5" /> Stable
    </span>
  );
}

const emptyKRI: RiskKeyRiskIndicator = {
  id: "",
  name: "",
  metric: "",
  threshold: { green: 0, amber: 0, red: 0 },
  currentValue: 0,
  direction: "steady",
};

export function KRIManager({ kris, onUpdate }: KRIManagerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RiskKeyRiskIndicator>(emptyKRI);
  const [localKris, setLocalKris] = useState<RiskKeyRiskIndicator[]>(kris);

  useEffect(() => {
    setLocalKris(kris);
  }, [kris]);

  const summary = useMemo(() => {
    const total = localKris.length;
    const critical = localKris.filter((item) => item.threshold && item.currentValue > item.threshold.red).length;
    const watch = localKris.filter(
      (item) =>
        item.threshold &&
        item.currentValue > item.threshold.green &&
        item.currentValue <= item.threshold.red,
    ).length;
    return { total, critical, watch };
  }, [localKris]);

  const handleSave = async () => {
    const candidate = selected.id ? selected : { ...selected, id: crypto.randomUUID() };
    const next = selected.id
      ? localKris.map((item) => (item.id === selected.id ? candidate : item))
      : [...localKris, candidate];
    try {
      await onUpdate?.(next);
      setLocalKris(next);
      setOpen(false);
      setSelected(emptyKRI);
    } catch (error) {
      console.error('Failed to update KRIs', error);
    }
  };

  const openCreateDialog = (template?: { name: string; metric: string; threshold?: { green: number; amber: number; red: number } }) => {
    setSelected({
      ...emptyKRI,
      name: template?.name ?? "",
      metric: template?.metric ?? "",
      threshold: template?.threshold ?? { green: 0, amber: 0, red: 0 },
    });
    setOpen(true);
  };

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Key Risk Indicators</h3>
          <p className="text-sm text-slate-500">Monitor thresholds and automate alerts for emerging risk patterns.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => openCreateDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add KRI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected.id ? "Edit Indicator" : "Add Key Risk Indicator"}</DialogTitle>
              <DialogDescription>
                Configure metric thresholds so we can surface alerts when values breach limits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="kri-name">Indicator name</Label>
                <Input
                  id="kri-name"
                  value={selected.name}
                  onChange={(event) => setSelected((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g., Customer complaints"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="kri-metric">Metric</Label>
                <Input
                  id="kri-metric"
                  value={selected.metric}
                  onChange={(event) => setSelected((prev) => ({ ...prev, metric: event.target.value }))}
                  placeholder="e.g., Count / month"
                />
              </div>
              <div className="grid gap-3">
                <Label>Thresholds</Label>
                <div className="grid gap-3 md:grid-cols-4">
                  {(["green", "amber", "red"] as const).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={selected.threshold?.[key] ?? 0}
                        onChange={(event) =>
                          setSelected((prev) => ({
                            ...prev,
                            threshold: {
                              ...prev.threshold,
                              [key]: Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>Current value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selected.currentValue}
                      onChange={(event) =>
                        setSelected((prev) => ({
                          ...prev,
                          currentValue: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>
                Save indicator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <Badge variant="outline" className="border-teal-200 text-teal-600">
          {summary.total} Indicators
        </Badge>
        <Badge variant="outline" className="border-rose-200 text-rose-600">
          {summary.critical} Critical
        </Badge>
        <Badge variant="outline" className="border-amber-200 text-amber-600">
          {summary.watch} Watchlist
        </Badge>
      </div>

      <div className="mt-5 grid gap-3">
        {localKris.map((kri) => {
          const status = getKRIStatus(kri);
          const health = calculateKRIHealth(kri);
          return (
            <motion.div key={kri.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border border-slate-100 bg-slate-50/70 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">{kri.name}</span>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{kri.metric}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <span className="text-emerald-600">Green ≤ {kri.threshold?.green}</span>
                      <span className="text-amber-600">Amber ≤ {kri.threshold?.amber}</span>
                      <span className="text-rose-600">Red &gt; {kri.threshold?.red}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{kri.currentValue}</p>
                    <TrendIndicator trend={kri.direction} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs text-teal-600"
                      onClick={() => {
                        setSelected(kri);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400"
                    style={{ width: `${health}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          );
        })}
        {localKris.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
            No indicators yet. Use templates or add a bespoke KRI to start monitoring thresholds.
          </div>
        ) : null}
      </div>

      <Collapsible className="mt-6">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-500" /> Browse KRI templates
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          {TEMPLATES.map((group) => (
            <div key={group.category} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">{group.category}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.indicators.map((indicator) => (
                  <Button
                    key={indicator.name}
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateDialog(indicator)}
                  >
                    {indicator.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
