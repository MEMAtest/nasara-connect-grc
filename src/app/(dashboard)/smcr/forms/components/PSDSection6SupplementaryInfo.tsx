"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ChevronRight } from "lucide-react";
import type { PSDFormSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function PSDSection6SupplementaryInfo({
  formData,
  updateField,
  onNext,
  onBack,
}: PSDFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Section 6: Supplementary Information
        </CardTitle>
        <CardDescription>
          Additional information and disclosure details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Purpose" variant="info">
          <p>Use this section to provide:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Full details of any &quot;Yes&quot; answers in Section 5 (Fitness and Propriety)</li>
            <li>Additional personal details (multiple nationalities, previous names, etc.)</li>
            <li>Any other information the individual or firm considers relevant</li>
          </ul>
        </SectionInfo>

        <SectionInfo title="Important" variant="warning">
          <p>For each disclosure, include at minimum:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Question reference number</li>
            <li>Full details of the matter</li>
            <li>Date(s) and duration</li>
            <li>Current status or outcome</li>
            <li>Any mitigating factors</li>
          </ul>
          <p className="mt-2">Attach supporting documents where available.</p>
        </SectionInfo>

        <div>
          <Label htmlFor="supplementaryInfo">6.1 Supplementary Information</Label>
          <Textarea
            id="supplementaryInfo"
            value={formData.supplementaryInfo}
            onChange={(e) => updateField("supplementaryInfo", e.target.value)}
            placeholder="Format:
Question [number]: [Brief description]
Details: [Full explanation]
Date(s): [Relevant dates]
Outcome/Status: [Current status]
Supporting documents: [List any attached]

Example:
Question 5.1(i): Criminal conviction - Driving without insurance
Details: In March 2018, I was convicted of driving without valid insurance...
Date(s): Incident March 2018, Court date May 2018
Outcome/Status: Fine of £300, 6 penalty points. Points expired March 2021.
Supporting documents: Court certificate attached."
            rows={15}
          />
          <FieldHelp>
            If there is insufficient space, continue on separate sheets and clearly identify the question reference
          </FieldHelp>
        </div>

        <div>
          <Label htmlFor="additionalSheets">Number of additional sheets being submitted</Label>
          <Input
            id="additionalSheets"
            type="number"
            min="0"
            value={formData.additionalSheets || ""}
            onChange={(e) => updateField("additionalSheets", Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
            placeholder="0"
            className="w-32"
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Declarations <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
