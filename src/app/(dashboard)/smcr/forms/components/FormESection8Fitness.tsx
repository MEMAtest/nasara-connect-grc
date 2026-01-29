"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

export function FormESection8Fitness({
  formData,
  updateField,
  onNext,
  onBack,
}: FormESectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          Section 8: Fitness & Propriety
        </CardTitle>
        <CardDescription>
          Any new matters since original approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Disclosure requirement" variant="warning">
          <p>You must disclose any <strong>new</strong> fitness and propriety matters that have arisen since the individual was originally approved. This includes criminal, civil, regulatory, financial, and employment matters.</p>
        </SectionInfo>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="hasNewFitnessMatters"
              checked={formData.hasNewFitnessMatters}
              onCheckedChange={(checked) => updateField("hasNewFitnessMatters", Boolean(checked))}
            />
            <Label htmlFor="hasNewFitnessMatters" className="font-normal cursor-pointer text-sm">
              There are new fitness and propriety matters to disclose since the individual was originally approved
            </Label>
          </div>

          {formData.hasNewFitnessMatters && (
            <div>
              <Label htmlFor="fitnessMattersDetails">Details of New Matters *</Label>
              <Textarea
                id="fitnessMattersDetails"
                value={formData.fitnessMattersDetails}
                onChange={(e) => updateField("fitnessMattersDetails", e.target.value)}
                placeholder="Provide full details of any new fitness and propriety matters. Include dates, nature of the matter, and current status or outcome..."
                rows={5}
              />
            </div>
          )}
        </div>

        {!formData.hasNewFitnessMatters && (
          <SectionInfo title="Confirmation" variant="success">
            <p>By leaving the checkbox unchecked, you are confirming there are no new fitness and propriety matters to disclose.</p>
          </SectionInfo>
        )}

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
