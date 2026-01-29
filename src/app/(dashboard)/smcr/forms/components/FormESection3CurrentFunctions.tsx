"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MinusCircle, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { controlledFunctions } from '../utils/form-constants';

export function FormESection3CurrentFunctions({
  formData,
  updateField,
  onNext,
  onBack,
}: FormESectionProps) {
  const toggleFunction = (funcValue: string) => {
    const current = formData.currentFunctions;
    if (current.includes(funcValue)) {
      updateField("currentFunctions", current.filter(f => f !== funcValue));
    } else {
      updateField("currentFunctions", [...current, funcValue]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MinusCircle className="h-5 w-5 text-teal-600" />
          Section 3: Current Functions Being Ceased
        </CardTitle>
        <CardDescription>
          Select the controlled function(s) the individual is ceasing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Important" variant="info">
          <p>Select all functions that the individual will <strong>stop performing</strong> as part of this transfer. These functions will be ceased on the date specified below.</p>
        </SectionInfo>

        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">
            Functions Being Ceased *
          </Label>
          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            {controlledFunctions.map((func) => (
              <div key={func.value} className="flex items-center gap-3">
                <Checkbox
                  id={`current-${func.value}`}
                  checked={formData.currentFunctions.includes(func.value)}
                  onCheckedChange={() => toggleFunction(func.value)}
                />
                <Label
                  htmlFor={`current-${func.value}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  {func.label}
                </Label>
              </div>
            ))}
          </div>
          <FieldHelp>Select all that apply</FieldHelp>
        </div>

        {formData.currentFunctions.length > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600 font-medium">Selected functions to cease:</p>
            <ul className="text-xs text-slate-700 mt-1 list-disc pl-4">
              {formData.currentFunctions.map(funcValue => {
                const func = controlledFunctions.find(f => f.value === funcValue);
                return <li key={funcValue}>{func?.label || funcValue}</li>;
              })}
            </ul>
          </div>
        )}

        <div>
          <Label htmlFor="ceasingDate">Date Functions Will Cease *</Label>
          <Input
            id="ceasingDate"
            type="date"
            value={formData.ceasingDate}
            onChange={(e) => updateField("ceasingDate", e.target.value)}
          />
          <FieldHelp>The date the individual will stop performing the selected functions</FieldHelp>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={formData.currentFunctions.length === 0}>
            Next: New Functions <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
