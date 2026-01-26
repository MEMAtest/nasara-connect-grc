"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, ChevronRight } from "lucide-react";
import type { FormAState, EmploymentEntry } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

interface Section5Props {
  formData: FormAState;
  updateEmployment: <K extends keyof EmploymentEntry>(id: string, field: K, value: EmploymentEntry[K]) => void;
  addEmployment: () => void;
  removeEmployment: (id: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function Section5EmploymentHistory({
  formData,
  updateEmployment,
  addEmployment,
  removeEmployment,
  onNext,
  onBack,
}: Section5Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600" />
          Section 5: Employment History (10 Years)
        </CardTitle>
        <CardDescription>
          Complete employment record for the past 10 years
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Critical requirements" variant="warning">
          <p><strong>ALL employment</strong> for the past 10 years must be listed in reverse chronological order (most recent first).</p>
          <p><strong>ALL gaps</strong> must be explained (career break, study, travel, gardening leave, unemployment).</p>
          <p><strong>Regulated firms:</strong> The FCA will request regulatory references from previous regulated employers.</p>
        </SectionInfo>

        {formData.employmentHistory.map((emp, index) => (
          <div key={emp.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Employment {index + 1} {index === 0 && "(Most Recent)"}
              </h3>
              {formData.employmentHistory.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmployment(emp.id)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`employer-${emp.id}`}>Employer Name *</Label>
                <Input
                  id={`employer-${emp.id}`}
                  value={emp.employer}
                  onChange={(e) => updateEmployment(emp.id, "employer", e.target.value)}
                  placeholder="Company name"
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor={`jobTitle-${emp.id}`}>Job Title *</Label>
                <Input
                  id={`jobTitle-${emp.id}`}
                  value={emp.jobTitle}
                  onChange={(e) => updateEmployment(emp.id, "jobTitle", e.target.value)}
                  aria-required="true"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`startDate-${emp.id}`}>Start Date *</Label>
                <Input
                  id={`startDate-${emp.id}`}
                  type="date"
                  value={emp.startDate}
                  onChange={(e) => updateEmployment(emp.id, "startDate", e.target.value)}
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor={`endDate-${emp.id}`}>End Date</Label>
                <Input
                  id={`endDate-${emp.id}`}
                  type="date"
                  value={emp.endDate}
                  onChange={(e) => updateEmployment(emp.id, "endDate", e.target.value)}
                  placeholder="Leave blank if current"
                  aria-describedby={`endDate-help-${emp.id}`}
                />
                <FieldHelp><span id={`endDate-help-${emp.id}`}>Leave blank if current employment</span></FieldHelp>
              </div>
              <div>
                <Label htmlFor={`reasonForLeaving-${emp.id}`}>Reason for Leaving *</Label>
                <Input
                  id={`reasonForLeaving-${emp.id}`}
                  value={emp.reasonForLeaving}
                  onChange={(e) => updateEmployment(emp.id, "reasonForLeaving", e.target.value)}
                  placeholder="e.g., Career progression"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t">
              <Checkbox
                id={`regulated-${emp.id}`}
                checked={emp.isRegulated}
                onCheckedChange={(checked) => updateEmployment(emp.id, "isRegulated", Boolean(checked))}
              />
              <div className="flex-1">
                <Label htmlFor={`regulated-${emp.id}`} className="font-normal cursor-pointer">
                  This employer is/was regulated by the FCA, PRA, or another financial regulator
                </Label>
                {emp.isRegulated && (
                  <div className="mt-2">
                    <Label htmlFor={`regulatorName-${emp.id}`}>Regulator Name</Label>
                    <Input
                      id={`regulatorName-${emp.id}`}
                      value={emp.regulatorName}
                      onChange={(e) => updateEmployment(emp.id, "regulatorName", e.target.value)}
                      placeholder="e.g., FCA, PRA, CBI"
                      aria-describedby={`regulatorName-help-${emp.id}`}
                    />
                    <FieldHelp><span id={`regulatorName-help-${emp.id}`}>FCA will request a regulatory reference from this employer</span></FieldHelp>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addEmployment} className="w-full">
          + Add Another Employment
        </Button>

        <SectionInfo title="Tip: Accounting for gaps" variant="info">
          <p>If there are gaps between employments, add an entry explaining what you were doing:</p>
          <p>• Employer: "Career Break" or "Self-employed" or "Full-time study"</p>
          <p>• Job Title: Brief description (e.g., "Travelling", "Caring responsibilities", "MBA Studies")</p>
        </SectionInfo>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Directorships <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
