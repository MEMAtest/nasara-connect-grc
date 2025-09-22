
import { GaugeCircle, CheckCircle2, AlertTriangle, GraduationCap } from "lucide-react";

interface PolicyEffectivenessScoreProps {
  attestationsComplete: number;
  breaches: number;
  trainingCompletion: number;
  controlEffectiveness: number;
}

export function PolicyEffectivenessScore({
  attestationsComplete,
  breaches,
  trainingCompletion,
  controlEffectiveness,
}: PolicyEffectivenessScoreProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900">Policy effectiveness</h3>
      <p className="text-sm text-slate-500">Snapshot of policy health across attestations, breaches, training, and controls.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MetricTile
          icon={CheckCircle2}
          label="Attestations"
          value={`${attestationsComplete}%`}
          tone={attestationsComplete >= 85 ? "positive" : "caution"}
        />
        <MetricTile icon={AlertTriangle} label="Breaches" value={breaches.toString()} tone={breaches === 0 ? "positive" : "negative"} />
        <MetricTile
          icon={GraduationCap}
          label="Training completion"
          value={`${trainingCompletion}%`}
          tone={trainingCompletion >= 90 ? "positive" : trainingCompletion >= 75 ? "caution" : "negative"}
        />
        <MetricTile
          icon={GaugeCircle}
          label="Control effectiveness"
          value={`${controlEffectiveness}%`}
          tone={controlEffectiveness >= 80 ? "positive" : controlEffectiveness >= 60 ? "caution" : "negative"}
        />
      </div>
    </div>
  );
}

interface MetricTileProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  tone: "positive" | "caution" | "negative";
}

function MetricTile({ icon: Icon, label, value, tone }: MetricTileProps) {
  const toneClasses = {
    positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
    caution: "border-amber-200 bg-amber-50 text-amber-700",
    negative: "border-rose-200 bg-rose-50 text-rose-700",
  } as const;

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
