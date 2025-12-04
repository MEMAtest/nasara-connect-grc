"use client";

import { Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface RiskControlCoverageProps {
  riskId: string;
}

interface Control {
  id: string;
  name: string;
  type: "preventive" | "detective" | "corrective";
  effectiveness: "high" | "medium" | "low";
  status: "active" | "planned" | "inactive";
}

// Mock controls data - in production this would come from an API
const mockControls: Control[] = [
  {
    id: "1",
    name: "Access Control Policy",
    type: "preventive",
    effectiveness: "high",
    status: "active",
  },
  {
    id: "2",
    name: "Audit Logging",
    type: "detective",
    effectiveness: "high",
    status: "active",
  },
  {
    id: "3",
    name: "Incident Response Plan",
    type: "corrective",
    effectiveness: "medium",
    status: "active",
  },
  {
    id: "4",
    name: "Data Encryption",
    type: "preventive",
    effectiveness: "high",
    status: "active",
  },
];

const effectivenessColors = {
  high: "text-emerald-600 bg-emerald-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-red-600 bg-red-50",
};

const statusIcons = {
  active: CheckCircle2,
  planned: AlertTriangle,
  inactive: XCircle,
};

const statusColors = {
  active: "text-emerald-500",
  planned: "text-amber-500",
  inactive: "text-slate-400",
};

export function RiskControlCoverage({ riskId }: RiskControlCoverageProps) {
  // In production, fetch controls based on riskId
  const controls = mockControls;

  const activeControls = controls.filter((c) => c.status === "active").length;
  const highEffectiveness = controls.filter((c) => c.effectiveness === "high").length;
  const coverageScore = Math.round((activeControls / controls.length) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold text-slate-900">Control Coverage</h3>
      </div>

      {/* Coverage Summary */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">{coverageScore}%</p>
          <p className="text-xs text-slate-500">Coverage</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{activeControls}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">{highEffectiveness}</p>
          <p className="text-xs text-slate-500">High Eff.</p>
        </div>
      </div>

      {/* Controls List */}
      <div className="space-y-2">
        {controls.map((control) => {
          const StatusIcon = statusIcons[control.status];
          return (
            <div
              key={control.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3"
            >
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-4 w-4 ${statusColors[control.status]}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{control.name}</p>
                  <p className="text-xs capitalize text-slate-500">{control.type}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${effectivenessColors[control.effectiveness]}`}
              >
                {control.effectiveness}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
