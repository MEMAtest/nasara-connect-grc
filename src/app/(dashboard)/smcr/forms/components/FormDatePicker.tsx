"use client";

import React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FormDatePickerProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  type?: "date" | "month";
}

export function FormDatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Select date",
  helpText,
  required,
  type = "date",
}: FormDatePickerProps) {
  const dateValue = value
    ? type === "month"
      ? parse(value, "yyyy-MM", new Date())
      : parse(value, "yyyy-MM-dd", new Date())
    : undefined;

  const displayValue =
    dateValue && isValid(dateValue)
      ? type === "month"
        ? format(dateValue, "MMMM yyyy")
        : format(dateValue, "PPP")
      : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }
    if (type === "month") {
      onChange(format(date, "yyyy-MM"));
    } else {
      onChange(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label}{required && " *"}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayValue && "text-slate-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue && isValid(dateValue) ? dateValue : undefined}
            onSelect={handleSelect}
            captionLayout="dropdown"
            fromYear={1950}
            toYear={2050}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
    </div>
  );
}
