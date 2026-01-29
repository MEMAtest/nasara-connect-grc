"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { controlledFunctions } from '../utils/form-constants';

export function FormESection4NewFunctions({
  formData,
  updateField,
  onNext,
  onBack,
}: FormESectionProps) {
  const toggleFunction = (funcValue: string) => {
    const current = formData.newFunctions;
    if (current.includes(funcValue)) {
      updateField("newFunctions", current.filter(f => f !== funcValue));
    } else {
      updateField("newFunctions", [...current, funcValue]);
    }
  };

  // Filter out functions that are being ceased
  const availableFunctions = controlledFunctions.filter(
    func => !formData.currentFunctions.includes(func.value)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-teal-600" />
          Section 4: New Functions Applied For
        </CardTitle>
        <CardDescription>
          Select the controlled function(s) the individual will perform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="SMF Applications" variant="warning">
          <p>If applying for an SMF role, the individual <strong>must not</strong> perform the function until FCA approval is granted. SMF applications take up to 3 months.</p>
        </SectionInfo>

        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">
            New Functions Being Applied For *
          </Label>
          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            {availableFunctions.map((func) => (
              <div key={func.value} className="flex items-center gap-3">
                <Checkbox
                  id={`new-${func.value}`}
                  checked={formData.newFunctions.includes(func.value)}
                  onCheckedChange={() => toggleFunction(func.value)}
                />
                <Label
                  htmlFor={`new-${func.value}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  {func.label}
                </Label>
              </div>
            ))}
          </div>
          <FieldHelp>Select all that apply</FieldHelp>
        </div>

        {formData.newFunctions.length > 0 && (
          <div className="bg-teal-50 p-3 rounded-lg">
            <p className="text-xs text-teal-700 font-medium">Selected new functions:</p>
            <ul className="text-xs text-teal-800 mt-1 list-disc pl-4">
              {formData.newFunctions.map(funcValue => {
                const func = controlledFunctions.find(f => f.value === funcValue);
                return <li key={funcValue}>{func?.label || funcValue}</li>;
              })}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="newFunctionStartDate">Proposed Start Date *</Label>
            <Input
              id="newFunctionStartDate"
              type="date"
              value={formData.newFunctionStartDate}
              onChange={(e) => updateField("newFunctionStartDate", e.target.value)}
            />
            <FieldHelp>When the individual should start the new function (subject to approval)</FieldHelp>
          </div>
          <div>
            <Label htmlFor="newJobTitle">New Job Title *</Label>
            <Input
              id="newJobTitle"
              value={formData.newJobTitle}
              onChange={(e) => updateField("newJobTitle", e.target.value)}
              placeholder="e.g., Chief Risk Officer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="newReportingTo">Reporting To *</Label>
            <Input
              id="newReportingTo"
              value={formData.newReportingTo}
              onChange={(e) => updateField("newReportingTo", e.target.value)}
              placeholder="Name and title of line manager"
            />
          </div>
          <div>
            <Label htmlFor="newDirectReports">Direct Reports</Label>
            <Input
              id="newDirectReports"
              value={formData.newDirectReports}
              onChange={(e) => updateField("newDirectReports", e.target.value)}
              placeholder="Number of direct reports"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeCommitment">Time Commitment *</Label>
            <Select
              value={formData.timeCommitment}
              onValueChange={(value) => updateField("timeCommitment", value)}
            >
              <SelectTrigger id="timeCommitment">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="ned">Non-Executive Director</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hoursPerWeek">Hours per Week</Label>
            <Input
              id="hoursPerWeek"
              value={formData.hoursPerWeek}
              onChange={(e) => updateField("hoursPerWeek", e.target.value)}
              placeholder="e.g., 40"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={formData.newFunctions.length === 0}>
            Next: Transfer Reason <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
