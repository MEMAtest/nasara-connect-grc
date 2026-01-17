"use client";

import { useState } from "react";
import {
  CreditCard,
  Landmark,
  TrendingUp,
  Shield,
  Home,
  Wallet,
  Bitcoin,
  Check,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface FirmTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (firmType: FirmType) => void;
  currentFirmType?: FirmType | null;
  isLoading?: boolean;
}

export function FirmTypeSelector({
  open,
  onOpenChange,
  onSelect,
  currentFirmType,
  isLoading,
}: FirmTypeSelectorProps) {
  const [selected, setSelected] = useState<FirmType | null>(currentFirmType || null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5" />
            Select Your Firm Type
          </DialogTitle>
          <DialogDescription>
            We&apos;ll recommend the registers that are mandatory and beneficial for your firm type.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(FIRM_TYPES) as FirmType[]).map((firmType) => {
            const Icon = FIRM_TYPE_ICONS[firmType];
            const info = FIRM_TYPES[firmType];
            const isSelected = selected === firmType;

            return (
              <button
                key={firmType}
                onClick={() => setSelected(firmType)}
                className={cn(
                  "relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                  FIRM_TYPE_COLORS[firmType],
                  isSelected && "ring-2 ring-teal-500 ring-offset-2"
                )}
              >
                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full bg-teal-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-teal-100" : "bg-white/80"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-teal-600" : "text-slate-600"
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{info.label}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{info.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected || isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? "Saving..." : "Confirm Selection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Inline firm type badge for display
interface FirmTypeBadgeProps {
  firmType: FirmType;
  onClick?: () => void;
  className?: string;
}

export function FirmTypeBadge({ firmType, onClick, className }: FirmTypeBadgeProps) {
  const Icon = FIRM_TYPE_ICONS[firmType];
  const info = FIRM_TYPES[firmType];

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        FIRM_TYPE_COLORS[firmType],
        onClick && "cursor-pointer",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {info.label}
    </button>
  );
}
