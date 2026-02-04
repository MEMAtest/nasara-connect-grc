"use client";

import { useMemo } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Clock,
  BookOpen,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ComplaintInsightsProps {
  complaintType: string;
  daysElapsed: number;
  fourWeekLetterSent: boolean;
  eightWeekLetterSent: boolean;
  status: string;
  similarCount?: number;
}

interface Insight {
  type: "warning" | "info" | "tip";
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const TRAINING_TIPS: Record<string, { tip: string; training: string; trainingId: string }> = {
  service: {
    tip: "For service complaints, document the specific service failure and any root cause analysis. Consider if systemic issues need addressing.",
    training: "Complaints Handling Fundamentals",
    trainingId: "complaints-handling",
  },
  product: {
    tip: "Product complaints may indicate design issues. Check if the product performed as described and whether disclosures were adequate.",
    training: "Consumer Duty & Product Governance",
    trainingId: "consumer-duty-implementation",
  },
  fees: {
    tip: "Fee complaints often relate to disclosure clarity. Review whether all fees were clearly communicated before the customer committed.",
    training: "Consumer Duty & Fair Value",
    trainingId: "consumer-duty-implementation",
  },
  staff: {
    tip: "Staff conduct complaints require careful documentation. Consider whether training or supervision issues need addressing.",
    training: "SM&CR Conduct Rules",
    trainingId: "smcr-training",
  },
  fraud: {
    tip: "Fraud-related complaints have specific handling requirements. Ensure APP fraud rules are followed if applicable.",
    training: "Financial Crime Prevention",
    trainingId: "financial-crime-aml",
  },
  delay: {
    tip: "Delay complaints often reveal process bottlenecks. Document the cause and consider operational improvements.",
    training: "Operational Resilience",
    trainingId: "operational-resilience-framework",
  },
  communication: {
    tip: "Communication complaints highlight the importance of clear, fair messaging. Review if communications met Consumer Duty standards.",
    training: "Consumer Duty Implementation",
    trainingId: "consumer-duty-implementation",
  },
  other: {
    tip: "Ensure thorough investigation and clear documentation of findings, even for unusual complaint types.",
    training: "Complaints Handling Fundamentals",
    trainingId: "complaints-handling",
  },
};

export function ComplaintInsights({
  complaintType,
  daysElapsed,
  fourWeekLetterSent,
  eightWeekLetterSent,
  status,
  similarCount = 0,
}: ComplaintInsightsProps) {
  const insights = useMemo(() => {
    const result: Insight[] = [];
    const isOpen = !["resolved", "closed"].includes(status);

    // Deadline alerts
    if (isOpen) {
      if (daysElapsed >= 28 && daysElapsed < 56 && !fourWeekLetterSent) {
        result.push({
          type: "warning",
          icon: <Clock className="h-4 w-4" />,
          title: "4-Week Letter Due",
          description: `This complaint is ${daysElapsed} days old. Send a holding letter if investigation is ongoing.`,
          action: {
            label: "Generate Letter",
            href: "#letters",
          },
        });
      }

      if (daysElapsed >= 49 && daysElapsed < 56 && !eightWeekLetterSent) {
        result.push({
          type: "warning",
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "8-Week Deadline Approaching",
          description: `Only ${56 - daysElapsed} days until the 8-week FCA deadline. Prepare final response or holding letter.`,
          action: {
            label: "Generate Letter",
            href: "#letters",
          },
        });
      }

      if (daysElapsed >= 56 && !eightWeekLetterSent) {
        result.push({
          type: "warning",
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "8-Week Deadline Passed",
          description: "The FCA 8-week deadline has passed. Send final response with FOS referral rights immediately.",
          action: {
            label: "Generate Letter",
            href: "#letters",
          },
        });
      }
    }

    // Training tip based on complaint type
    const typeKey = complaintType.toLowerCase().replace(/[^a-z]/g, "");
    const trainingTip = TRAINING_TIPS[typeKey] || TRAINING_TIPS["other"];

    result.push({
      type: "tip",
      icon: <BookOpen className="h-4 w-4" />,
      title: "Training Tip",
      description: trainingTip.tip,
      action: {
        label: trainingTip.training,
        href: `/training-library/lesson/${trainingTip.trainingId}`,
      },
    });

    // Similar patterns
    if (similarCount > 2) {
      result.push({
        type: "info",
        icon: <TrendingUp className="h-4 w-4" />,
        title: "Pattern Detected",
        description: `${similarCount} similar "${complaintType}" complaints this month. Consider reviewing operational procedures.`,
        action: {
          label: "View All",
          href: `/registers/complaints?type=${encodeURIComponent(complaintType)}`,
        },
      });
    }

    return result;
  }, [complaintType, daysElapsed, fourWeekLetterSent, eightWeekLetterSent, status, similarCount]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
        <Lightbulb className="h-4 w-4" />
        Insights & Tips
      </h3>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={`${insight.type}-${insight.title}`}
            className={cn(
              "rounded-lg p-3",
              insight.type === "warning" && "bg-amber-100/50 border border-amber-200",
              insight.type === "info" && "bg-blue-100/50 border border-blue-200",
              insight.type === "tip" && "bg-white/60 border border-amber-200/50"
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-0.5",
                  insight.type === "warning" && "text-amber-600",
                  insight.type === "info" && "text-blue-600",
                  insight.type === "tip" && "text-amber-700"
                )}
              >
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    insight.type === "warning" && "text-amber-800",
                    insight.type === "info" && "text-blue-800",
                    insight.type === "tip" && "text-amber-900"
                  )}
                >
                  {insight.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
                {insight.action && (
                  <Link
                    href={insight.action.href || "#"}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
                  >
                    {insight.action.label}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
