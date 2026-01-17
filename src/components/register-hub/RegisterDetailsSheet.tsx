"use client";

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
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RegisterDefinitionRecord, RegisterSubscriptionRecord } from "@/lib/database";
import { RecommendationLevel, REGISTER_CATEGORIES } from "@/lib/types/register-hub";

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
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  aml: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  conduct: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  governance: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
  market_abuse: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  operational: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
};

// Recommendation styles
const RECOMMENDATION_STYLES: Record<RecommendationLevel, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  mandatory: {
    label: "MANDATORY",
    className: "bg-red-100 text-red-700 border-red-300",
    icon: AlertCircle,
  },
  recommended: {
    label: "RECOMMENDED",
    className: "bg-amber-100 text-amber-700 border-amber-300",
    icon: CheckCircle,
  },
  optional: {
    label: "OPTIONAL",
    className: "bg-slate-100 text-slate-600 border-slate-300",
    icon: XCircle,
  },
};

interface RegisterDetailsSheetProps {
  definition: RegisterDefinitionRecord | null;
  subscription?: RegisterSubscriptionRecord;
  recommendationLevel: RecommendationLevel;
  firmType?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (code: string, enabled: boolean) => void;
  isLoading?: boolean;
}

export function RegisterDetailsSheet({
  definition,
  subscription,
  recommendationLevel,
  firmType,
  open,
  onOpenChange,
  onToggle,
  isLoading,
}: RegisterDetailsSheetProps) {
  const router = useRouter();

  if (!definition) return null;

  const Icon = ICON_MAP[definition.icon_key] || AlertCircle;
  const colors = CATEGORY_COLORS[definition.category] || CATEGORY_COLORS.operational;
  const recommendation = RECOMMENDATION_STYLES[recommendationLevel];
  const RecommendationIcon = recommendation.icon;
  const isEnabled = subscription?.enabled ?? false;
  const categoryInfo = REGISTER_CATEGORIES[definition.category as keyof typeof REGISTER_CATEGORIES];

  const handleToggle = (checked: boolean) => {
    onToggle(definition.code, checked);
  };

  const handleOpenRegister = () => {
    if (definition.is_implemented && definition.href) {
      onOpenChange(false);
      router.push(definition.href);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl",
                colors.bg
              )}
            >
              <Icon className={cn("h-7 w-7", colors.text)} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{definition.name}</SheetTitle>
              <SheetDescription className="mt-1">
                <Badge className={cn("text-xs", colors.badge)}>
                  {categoryInfo?.label || definition.category}
                </Badge>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Recommendation badge */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3",
                recommendation.className
              )}
            >
              <RecommendationIcon className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">{recommendation.label}</p>
                {firmType && (
                  <p className="text-xs opacity-80">
                    for {firmType.replace(/_/g, " ")} firms
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Description</h4>
              <p className="text-sm text-slate-600">{definition.description}</p>
            </div>

            <Separator />

            {/* Use Cases */}
            {definition.use_cases && definition.use_cases.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Use Cases</h4>
                <ul className="space-y-2">
                  {definition.use_cases.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-500" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Regulatory References */}
            {definition.regulatory_references && (definition.regulatory_references as string[]).length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">
                  Regulatory References
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(definition.regulatory_references as string[]).map((ref, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Training */}
            {definition.related_training && definition.related_training.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <BookOpen className="h-4 w-4" />
                  Related Training
                </h4>
                <ul className="space-y-1">
                  {definition.related_training.map((training, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      {training}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Policies */}
            {definition.related_policies && definition.related_policies.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4" />
                  Related Policies
                </h4>
                <ul className="space-y-1">
                  {definition.related_policies.map((policy, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      {policy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Switch
              id="enable-register"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isLoading}
              className="data-[state=checked]:bg-teal-600"
            />
            <label htmlFor="enable-register" className="text-sm font-medium">
              {isEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>

          {definition.is_implemented ? (
            <Button onClick={handleOpenRegister} disabled={!isEnabled}>
              Open Register
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Badge variant="secondary" className="px-3 py-1.5">
              Coming Soon
            </Badge>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
