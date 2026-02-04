"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { FormCSectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

export function FormCSection4Circumstances({
  formData,
  updateField,
  onNext,
  onBack,
}: FormCSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-teal-600" />
          Section 4: Circumstances
        </CardTitle>
        <CardDescription>
          Any fitness and propriety concerns or investigations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Disclosure requirements" variant="warning">
          <p><strong>You must disclose</strong> any circumstances that may be relevant to the individual&apos;s fitness and propriety, even if they have now left.</p>
          <p className="mt-1">Failure to disclose material information is itself a regulatory concern.</p>
        </SectionInfo>

        <div className="space-y-4">
          {/* Performance Issues */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasPerformanceIssues"
                checked={formData.hasPerformanceIssues}
                onCheckedChange={(checked) => updateField("hasPerformanceIssues", Boolean(checked))}
              />
              <Label htmlFor="hasPerformanceIssues" className="font-normal cursor-pointer text-sm">
                Were there any performance concerns with the individual?
              </Label>
            </div>
            {formData.hasPerformanceIssues && (
              <Textarea
                value={formData.performanceDetails}
                onChange={(e) => updateField("performanceDetails", e.target.value)}
                placeholder="Describe the performance concerns..."
                rows={3}
              />
            )}
          </div>

          {/* Conduct Issues */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasConductIssues"
                checked={formData.hasConductIssues}
                onCheckedChange={(checked) => updateField("hasConductIssues", Boolean(checked))}
              />
              <Label htmlFor="hasConductIssues" className="font-normal cursor-pointer text-sm">
                Were there any conduct or behaviour concerns?
              </Label>
            </div>
            {formData.hasConductIssues && (
              <Textarea
                value={formData.conductDetails}
                onChange={(e) => updateField("conductDetails", e.target.value)}
                placeholder="Describe the conduct concerns..."
                rows={3}
              />
            )}
          </div>

          {/* Investigation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasInvestigation"
                checked={formData.hasInvestigation}
                onCheckedChange={(checked) => updateField("hasInvestigation", Boolean(checked))}
              />
              <Label htmlFor="hasInvestigation" className="font-normal cursor-pointer text-sm">
                Was the individual subject to any internal or external investigation?
              </Label>
            </div>
            {formData.hasInvestigation && (
              <Textarea
                value={formData.investigationDetails}
                onChange={(e) => updateField("investigationDetails", e.target.value)}
                placeholder="Describe the investigation and its status/outcome..."
                rows={3}
              />
            )}
          </div>

          {/* Disciplinary Action */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasDisciplinaryAction"
                checked={formData.hasDisciplinaryAction}
                onCheckedChange={(checked) => updateField("hasDisciplinaryAction", Boolean(checked))}
              />
              <Label htmlFor="hasDisciplinaryAction" className="font-normal cursor-pointer text-sm">
                Was any disciplinary action taken against the individual?
              </Label>
            </div>
            {formData.hasDisciplinaryAction && (
              <Textarea
                value={formData.disciplinaryDetails}
                onChange={(e) => updateField("disciplinaryDetails", e.target.value)}
                placeholder="Describe the disciplinary action and outcome..."
                rows={3}
              />
            )}
          </div>

          {/* Regulatory Breach */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasRegulatoryBreach"
                checked={formData.hasRegulatoryBreach}
                onCheckedChange={(checked) => updateField("hasRegulatoryBreach", Boolean(checked))}
              />
              <Label htmlFor="hasRegulatoryBreach" className="font-normal cursor-pointer text-sm">
                Was the individual involved in any breach of regulatory requirements?
              </Label>
            </div>
            {formData.hasRegulatoryBreach && (
              <Textarea
                value={formData.regulatoryBreachDetails}
                onChange={(e) => updateField("regulatoryBreachDetails", e.target.value)}
                placeholder="Describe the breach and any remedial action taken..."
                rows={3}
              />
            )}
          </div>
        </div>

        <SectionInfo title="Note" variant="info">
          <p>If you answered YES to any of the above, the FCA may contact you for further information.</p>
        </SectionInfo>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Handover <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
