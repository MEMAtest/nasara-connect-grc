"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileCheck, ChevronRight } from "lucide-react";
import type { FormAState } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { prescribedResponsibilitiesList } from '../utils/form-constants';

interface Section12Props {
  formData: FormAState;
  updateField: <K extends keyof FormAState>(field: K, value: FormAState[K]) => void;
  togglePrescribedResponsibility: (id: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function Section12Responsibilities({
  formData,
  updateField,
  togglePrescribedResponsibility,
  onNext,
  onBack,
}: Section12Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-teal-600" />
          Section 12: Statement of Responsibilities
        </CardTitle>
        <CardDescription>
          Define what the candidate will be responsible for (SMF roles only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="About the Statement of Responsibilities" variant="info">
          <p>Every SMF holder must have a clear Statement of Responsibilities (SoR) that sets out what they are personally responsible and accountable for.</p>
          <p className="mt-1">The SoR should be:</p>
          <p>• <strong>Clear and specific</strong> - avoid vague language</p>
          <p>• <strong>Comprehensive</strong> - cover all areas of accountability</p>
          <p>• <strong>Consistent</strong> - with other SMFs' SoRs (no gaps or overlaps)</p>
        </SectionInfo>

        <div>
          <Label htmlFor="sorResponsibilities">Key Responsibilities *</Label>
          <Textarea
            id="sorResponsibilities"
            value={formData.sorResponsibilities}
            onChange={(e) => updateField("sorResponsibilities", e.target.value)}
            placeholder="Describe the candidate's key areas of responsibility. Be specific about what they are accountable for.

Example:
• Overall responsibility for the firm's compliance function
• Management of the compliance team (3 direct reports)
• Reporting to the Board on regulatory matters
• Oversight of regulatory change implementation
• Primary contact with the FCA"
            rows={8}
          />
          <FieldHelp>Be specific - this document may be used in regulatory enforcement</FieldHelp>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Prescribed Responsibilities</h3>
          <p className="text-xs text-slate-600 mb-4">
            Select any Prescribed Responsibilities that will be allocated to this SMF.
            Each PR must be allocated to exactly one SMF.
          </p>
          <div className="space-y-3">
            {prescribedResponsibilitiesList.map((pr) => (
              <div key={pr.id} className="flex items-start gap-3">
                <Checkbox
                  id={pr.id}
                  checked={formData.prescribedResponsibilities.includes(pr.id)}
                  onCheckedChange={() => togglePrescribedResponsibility(pr.id)}
                />
                <Label htmlFor={pr.id} className="font-normal cursor-pointer text-sm">
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
            placeholder="Any additional responsibilities not covered above"
            rows={3}
          />
        </div>

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
