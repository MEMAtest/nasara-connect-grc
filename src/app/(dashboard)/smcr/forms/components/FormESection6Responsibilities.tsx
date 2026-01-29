"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { prescribedResponsibilitiesList } from '../utils/form-constants';

export function FormESection6Responsibilities({
  formData,
  updateField,
  onNext,
  onBack,
}: FormESectionProps) {
  const toggleResponsibility = (id: string) => {
    const current = formData.prescribedResponsibilities;
    if (current.includes(id)) {
      updateField("prescribedResponsibilities", current.filter(r => r !== id));
    } else {
      updateField("prescribedResponsibilities", [...current, id]);
    }
  };

  // Check if any new function is an SMF (not CF)
  const hasSmfFunction = formData.newFunctions.some(f => f.startsWith("SMF"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-teal-600" />
          Section 6: Statement of Responsibilities
        </CardTitle>
        <CardDescription>
          Define the responsibilities for the new role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasSmfFunction ? (
          <>
            <SectionInfo title="SMF Statement of Responsibilities" variant="info">
              <p>A Statement of Responsibilities (SoR) is required for SMF roles. This document defines the senior manager's responsibilities and must be kept up to date.</p>
            </SectionInfo>

            <div>
              <Label htmlFor="newResponsibilities">Key Responsibilities in New Role *</Label>
              <Textarea
                id="newResponsibilities"
                value={formData.newResponsibilities}
                onChange={(e) => updateField("newResponsibilities", e.target.value)}
                placeholder="Describe the key responsibilities this individual will hold in their new role. Be specific about what they will be accountable for..."
                rows={5}
              />
              <FieldHelp>
                This forms part of the Statement of Responsibilities
              </FieldHelp>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                Prescribed Responsibilities
              </Label>
              <FieldHelp className="mb-3">
                Select any Prescribed Responsibilities that will be allocated to this individual
              </FieldHelp>
              <div className="border rounded-lg p-4 space-y-3">
                {prescribedResponsibilitiesList.map((pr) => (
                  <div key={pr.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`pr-${pr.id}`}
                      checked={formData.prescribedResponsibilities.includes(pr.id)}
                      onCheckedChange={() => toggleResponsibility(pr.id)}
                    />
                    <Label
                      htmlFor={`pr-${pr.id}`}
                      className="font-normal cursor-pointer text-sm leading-tight"
                    >
                      {pr.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="additionalResponsibilities">Additional Responsibilities</Label>
              <Textarea
                id="additionalResponsibilities"
                value={formData.additionalResponsibilities}
                onChange={(e) => updateField("additionalResponsibilities", e.target.value)}
                placeholder="Any other responsibilities not covered above..."
                rows={3}
              />
            </div>
          </>
        ) : (
          <SectionInfo title="No SoR Required" variant="info">
            <p>A Statement of Responsibilities is not required for Certification Functions. However, the firm should maintain records of the individual's responsibilities.</p>
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={onNext}
            >
              Skip to next section →
            </Button>
          </SectionInfo>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Competency <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
