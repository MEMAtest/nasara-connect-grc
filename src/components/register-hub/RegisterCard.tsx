"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Shield,
  FileSearch,
  FileCheck,
  AlertTriangle,
  Activity,
  MessageSquareWarning,
  Scale,
  Gift,
  Megaphone,
  Heart,
  Package,
  GraduationCap,
  BadgeCheck,
  Calendar,
  TrendingUp,
  Lock,
  Briefcase,
  AlertOctagon,
  Building2,
  Database,
  AlertCircle,
  ExternalLink,
  Check,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RegisterDefinitionRecord, RegisterSubscriptionRecord } from "@/lib/database";
import { RecommendationLevel } from "@/lib/types/register-hub";

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Shield,
  FileSearch,
  FileCheck,
  AlertTriangle,
  Activity,
  MessageSquareWarning,
  Scale,
  Gift,
  Megaphone,
  Heart,
  Package,
  GraduationCap,
  BadgeCheck,
  Calendar,
  TrendingUp,
  Lock,
  Briefcase,
  AlertOctagon,
  Building2,
  Database,
  AlertCircle,
};

// Category colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  aml: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  conduct: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  governance: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  market_abuse: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  operational: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

// Recommendation badge styles
const RECOMMENDATION_BADGES: Record<
  RecommendationLevel,
  { label: string; className: string }
> = {
  mandatory: {
    label: "MANDATORY",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  recommended: {
    label: "RECOMMENDED",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  optional: {
    label: "OPTIONAL",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

interface RegisterCardProps {
  definition: RegisterDefinitionRecord;
  subscription?: RegisterSubscriptionRecord;
  recommendationLevel: RecommendationLevel;
  onToggle: (code: string, enabled: boolean) => void;
  onViewDetails: (definition: RegisterDefinitionRecord) => void;
  isLoading?: boolean;
}

export function RegisterCard({
  definition,
  subscription,
  recommendationLevel,
  onToggle,
  onViewDetails,
  isLoading,
}: RegisterCardProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

  const Icon = ICON_MAP[definition.icon_key] || AlertCircle;
  const colors = CATEGORY_COLORS[definition.category] || CATEGORY_COLORS.operational;
  const badge = RECOMMENDATION_BADGES[recommendationLevel];
  const isEnabled = subscription?.enabled ?? false;

  const handleToggle = async (checked: boolean) => {
    setToggling(true);
    try {
      await onToggle(definition.code, checked);
    } finally {
      setToggling(false);
    }
  };

  const handleOpenRegister = () => {
    if (definition.is_implemented && definition.href) {
      router.push(definition.href);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-white p-4 transition-all hover:shadow-md",
        colors.border,
        isEnabled && "ring-2 ring-teal-500/20"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              colors.bg
            )}
          >
            <Icon className={cn("h-5 w-5", colors.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 line-clamp-1">
              {definition.name}
            </h3>
            <Badge
              variant="outline"
              className={cn("mt-1 text-[10px] font-medium", badge.className)}
            >
              {badge.label}
            </Badge>
          </div>
        </div>

        {/* Enable toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                {isEnabled && (
                  <Check className="h-4 w-4 text-teal-600" />
                )}
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggle}
                  disabled={toggling || isLoading}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isEnabled ? "Disable register" : "Enable register"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-slate-600 line-clamp-2">
        {definition.short_description || definition.description}
      </p>

      {/* Regulatory references */}
      {definition.regulatory_references && definition.regulatory_references.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {(definition.regulatory_references as string[]).slice(0, 2).map((ref, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
            >
              {ref}
            </span>
          ))}
          {(definition.regulatory_references as string[]).length > 2 && (
            <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
              +{(definition.regulatory_references as string[]).length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(definition)}
          className="h-8 text-xs"
        >
          <Info className="mr-1.5 h-3.5 w-3.5" />
          Details
        </Button>

        {definition.is_implemented ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenRegister}
            disabled={!isEnabled}
            className="h-8 text-xs"
          >
            Open Register
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        )}
      </div>
    </div>
  );
}
