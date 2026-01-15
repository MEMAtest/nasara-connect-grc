"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addMonths, addYears, addDays } from "date-fns";

export type ReviewFrequency = "annual" | "semi_annual" | "quarterly" | "monthly" | "ad_hoc";

const frequencyLabels: Record<ReviewFrequency, string> = {
  annual: "Annual",
  semi_annual: "Semi-Annual",
  quarterly: "Quarterly",
  monthly: "Monthly",
  ad_hoc: "Ad-hoc",
};

const frequencyOptions: ReviewFrequency[] = [
  "annual",
  "semi_annual",
  "quarterly",
  "monthly",
  "ad_hoc",
];

interface ReviewFrequencySelectProps {
  frequency: ReviewFrequency;
  onFrequencyChange: (frequency: ReviewFrequency) => void;
  lastReviewDate?: Date | null;
  onLastReviewDateChange: (date: Date | null) => void;
  nextReviewDate?: Date | null;
  onNextReviewDateChange: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
}

function calculateNextReviewDate(
  lastReview: Date | null | undefined,
  frequency: ReviewFrequency
): Date | null {
  if (!lastReview || frequency === "ad_hoc") return null;

  const baseDate = new Date(lastReview);

  switch (frequency) {
    case "annual":
      return addYears(baseDate, 1);
    case "semi_annual":
      return addMonths(baseDate, 6);
    case "quarterly":
      return addMonths(baseDate, 3);
    case "monthly":
      return addMonths(baseDate, 1);
    default:
      return null;
  }
}

export function ReviewFrequencySelect({
  frequency,
  onFrequencyChange,
  lastReviewDate,
  onLastReviewDateChange,
  nextReviewDate,
  onNextReviewDateChange,
  disabled = false,
  className,
}: ReviewFrequencySelectProps) {
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [lastDateOpen, setLastDateOpen] = useState(false);
  const [nextDateOpen, setNextDateOpen] = useState(false);

  // Auto-calculate next review date when last review date or frequency changes
  useEffect(() => {
    if (!isManualOverride && frequency !== "ad_hoc") {
      const calculated = calculateNextReviewDate(lastReviewDate, frequency);
      if (calculated) {
        onNextReviewDateChange(calculated);
      }
    }
  }, [lastReviewDate, frequency, isManualOverride, onNextReviewDateChange]);

  const handleFrequencyChange = useCallback(
    (value: string) => {
      const newFrequency = value as ReviewFrequency;
      onFrequencyChange(newFrequency);
      // Reset manual override when frequency changes
      if (newFrequency !== "ad_hoc") {
        setIsManualOverride(false);
      }
    },
    [onFrequencyChange]
  );

  const handleNextDateManualChange = useCallback(
    (date: Date | undefined) => {
      setIsManualOverride(true);
      onNextReviewDateChange(date || null);
      setNextDateOpen(false);
    },
    [onNextReviewDateChange]
  );

  const handleRecalculate = useCallback(() => {
    setIsManualOverride(false);
    const calculated = calculateNextReviewDate(lastReviewDate, frequency);
    onNextReviewDateChange(calculated);
  }, [lastReviewDate, frequency, onNextReviewDateChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Review Frequency */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Review Frequency</Label>
        <Select
          value={frequency}
          onValueChange={handleFrequencyChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map((freq) => (
              <SelectItem key={freq} value={freq}>
                {frequencyLabels[freq]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Last Review Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Last Review Date</Label>
        <Popover open={lastDateOpen} onOpenChange={setLastDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !lastReviewDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {lastReviewDate
                ? format(lastReviewDate, "PPP")
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={lastReviewDate || undefined}
              onSelect={(date) => {
                onLastReviewDateChange(date || null);
                setLastDateOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Next Review Date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Next Review Date</Label>
          {isManualOverride && frequency !== "ad_hoc" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRecalculate}
              disabled={disabled || !lastReviewDate}
              className="h-auto py-1 px-2 text-xs text-teal-600 hover:text-teal-700"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Auto-calculate
            </Button>
          )}
        </div>
        <Popover open={nextDateOpen} onOpenChange={setNextDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !nextReviewDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {nextReviewDate
                ? format(nextReviewDate, "PPP")
                : frequency === "ad_hoc"
                ? "Set manually"
                : "Auto-calculated"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={nextReviewDate || undefined}
              onSelect={handleNextDateManualChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {!isManualOverride && frequency !== "ad_hoc" && lastReviewDate && (
          <p className="text-xs text-slate-500">
            Auto-calculated based on {frequencyLabels[frequency].toLowerCase()} review cycle
          </p>
        )}
        {isManualOverride && (
          <p className="text-xs text-amber-600">
            Manual override active
          </p>
        )}
      </div>
    </div>
  );
}

// Export utility function for use in other components
export { calculateNextReviewDate };
