"use client";

import {
  CreditCard,
  Landmark,
  TrendingUp,
  Shield,
  Home,
  Wallet,
  Bitcoin,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FirmType, FIRM_TYPES } from "@/lib/types/register-hub";

const FIRM_TYPE_ICONS: Record<FirmType, React.ComponentType<{ className?: string }>> = {
  payment_services: CreditCard,
  consumer_credit: Landmark,
  investment: TrendingUp,
  insurance: Shield,
  mortgage: Home,
  wealth_management: Wallet,
  crypto: Bitcoin,
};

const FIRM_TYPE_COLORS: Record<FirmType, string> = {
  payment_services: "border-blue-200 bg-blue-50 hover:border-blue-400",
  consumer_credit: "border-amber-200 bg-amber-50 hover:border-amber-400",
  investment: "border-emerald-200 bg-emerald-50 hover:border-emerald-400",
  insurance: "border-purple-200 bg-purple-50 hover:border-purple-400",
  mortgage: "border-rose-200 bg-rose-50 hover:border-rose-400",
  wealth_management: "border-indigo-200 bg-indigo-50 hover:border-indigo-400",
  crypto: "border-orange-200 bg-orange-50 hover:border-orange-400",
};

interface FirmTypeStepProps {
  selectedFirmType: FirmType | null;
  onSelect: (firmType: FirmType) => void;
}

export function FirmTypeStep({ selectedFirmType, onSelect }: FirmTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">Select Your Firm Type</h2>
        <p className="mt-1 text-sm text-slate-500">
          We&apos;ll recommend the registers that are mandatory and beneficial for your firm type
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(FIRM_TYPES) as FirmType[]).map((firmType) => {
          const Icon = FIRM_TYPE_ICONS[firmType];
          const info = FIRM_TYPES[firmType];
          const isSelected = selectedFirmType === firmType;

          return (
            <button
              key={firmType}
              onClick={() => onSelect(firmType)}
              className={cn(
                "relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                FIRM_TYPE_COLORS[firmType],
                isSelected && "ring-2 ring-teal-500 ring-offset-2"
              )}
            >
              {isSelected && (
                <div className="absolute right-3 top-3 rounded-full bg-teal-500 p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-teal-100" : "bg-white/80"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isSelected ? "text-teal-600" : "text-slate-600"
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{info.label}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{info.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg bg-slate-50 p-4 text-center">
        <p className="text-sm text-slate-600">
          Not sure which type fits your firm?{" "}
          <a href="#" className="font-medium text-teal-600 hover:text-teal-700">
            View our guide
          </a>
        </p>
      </div>
    </div>
  );
}
