"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronRight } from "lucide-react";
import type { FormCSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { reasonCategories } from '../utils/form-constants';

export function FormCSection3CessationDetails({
  formData,
  updateField,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validationErrors,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateField,
  onNext,
  onBack,
}: FormCSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          Section 3: Cessation Details
        </CardTitle>
        <CardDescription>
          When and why the individual is ceasing the function
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="effectiveDate">Date of Cessation *</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => updateField("effectiveDate", e.target.value)}
            />
            <FieldHelp>The last day the individual performed the function</FieldHelp>
          </div>
          <div>
            <Label htmlFor="reasonCategory">Reason for Leaving *</Label>
            <Select
              value={formData.reasonCategory}
              onValueChange={(value) => updateField("reasonCategory", value)}
            >
              <SelectTrigger id="reasonCategory">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {reasonCategories.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.reasonCategory === "internal-transfer" && (
          <SectionInfo title="Use Form E for internal transfers" variant="warning">
            <p>If the individual is transferring to another controlled function within the same firm, you should submit <strong>Form E</strong> instead of Form C.</p>
          </SectionInfo>
        )}

        <div>
          <Label htmlFor="reasonDetails">Additional Details</Label>
          <Textarea
            id="reasonDetails"
            value={formData.reasonDetails}
            onChange={(e) => updateField("reasonDetails", e.target.value)}
            placeholder="Provide any additional context about the circumstances of leaving"
            rows={3}
          />
          <FieldHelp>Include any relevant information the FCA should be aware of</FieldHelp>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">New Employment (if applicable)</h3>

          <div className="flex items-start gap-3 mb-4">
            <Checkbox
              id="isRelocating"
              checked={formData.isRelocating}
              onCheckedChange={(checked) => updateField("isRelocating", Boolean(checked))}
            />
            <Label htmlFor="isRelocating" className="font-normal cursor-pointer text-sm">
              The individual is moving to another regulated firm
            </Label>
          </div>

          {formData.isRelocating && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <Label htmlFor="newEmployerName">New Employer Name</Label>
                <Input
                  id="newEmployerName"
                  value={formData.newEmployerName}
                  onChange={(e) => updateField("newEmployerName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newEmployerFRN">New Employer FRN (if known)</Label>
                <Input
                  id="newEmployerFRN"
                  value={formData.newEmployerFRN}
                  onChange={(e) => updateField("newEmployerFRN", e.target.value)}
                  placeholder="e.g., 123456"
                />
              </div>
            </div>
          )}
        </div>

        <SectionInfo title="Regulatory reference requirements" variant="info">
          <p>If the individual is moving to another FCA-regulated firm, you may be required to provide a regulatory reference within 6 weeks of request.</p>
        </SectionInfo>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Circumstances <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
