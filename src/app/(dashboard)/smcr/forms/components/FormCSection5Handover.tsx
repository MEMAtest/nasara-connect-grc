"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRightLeft, ChevronRight } from "lucide-react";
import type { FormCSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function FormCSection5Handover({
  formData,
  updateField,
  onNext,
  onBack,
}: FormCSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-teal-600" />
          Section 5: Handover Arrangements
        </CardTitle>
        <CardDescription>
          How responsibilities are being transitioned
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Continuity of oversight" variant="info">
          <p>The FCA expects firms to maintain appropriate oversight arrangements when SMF holders leave. Ensure there are no gaps in critical responsibilities.</p>
        </SectionInfo>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="hasHandoverPlan"
              checked={formData.hasHandoverPlan}
              onCheckedChange={(checked) => updateField("hasHandoverPlan", Boolean(checked))}
            />
            <Label htmlFor="hasHandoverPlan" className="font-normal cursor-pointer text-sm">
              A formal handover has been/will be completed
            </Label>
          </div>

          {formData.hasHandoverPlan && (
            <div>
              <Label htmlFor="handoverDetails">Handover Details</Label>
              <Textarea
                id="handoverDetails"
                value={formData.handoverDetails}
                onChange={(e) => updateField("handoverDetails", e.target.value)}
                placeholder="Describe the handover process, including what has been transferred and to whom..."
                rows={3}
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="interimArrangements">Interim Arrangements *</Label>
          <Textarea
            id="interimArrangements"
            value={formData.interimArrangements}
            onChange={(e) => updateField("interimArrangements", e.target.value)}
            placeholder="Describe how the individual's responsibilities will be covered until a replacement is in place. Include who is taking on which responsibilities."
            rows={4}
          />
          <FieldHelp>This is particularly important for SMF roles to ensure no gap in accountability</FieldHelp>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Replacement (if applicable)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="replacementName">Replacement Name</Label>
              <Input
                id="replacementName"
                value={formData.replacementName}
                onChange={(e) => updateField("replacementName", e.target.value)}
                placeholder="Name of person taking over the function"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4">
            <Checkbox
              id="replacementApplicationSubmitted"
              checked={formData.replacementApplicationSubmitted}
              onCheckedChange={(checked) => updateField("replacementApplicationSubmitted", Boolean(checked))}
            />
            <Label htmlFor="replacementApplicationSubmitted" className="font-normal cursor-pointer text-sm">
              Form A application has been submitted for the replacement
            </Label>
          </div>

          {!formData.replacementApplicationSubmitted && formData.replacementName && (
            <SectionInfo title="Reminder" variant="warning">
              <p>If the replacement requires FCA approval (SMF role), ensure Form A is submitted in good time. SMF applications take up to 3 months to process.</p>
            </SectionInfo>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Declaration <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
