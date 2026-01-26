"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, ChevronRight } from "lucide-react";
import type { FormCSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function FormCSection1FirmDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
}: FormCSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-teal-600" />
          Section 1: Firm Details
        </CardTitle>
        <CardDescription>
          Details of the firm submitting this notice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Submission deadline" variant="warning">
          <p><strong>Form C must be submitted within 7 business days</strong> of the individual ceasing to perform the controlled function.</p>
        </SectionInfo>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firmName">Firm Name *</Label>
            <Input
              id="firmName"
              value={formData.firmName}
              onChange={(e) => updateField("firmName", e.target.value)}
            />
            <FieldHelp>Official name as shown on the FCA Register</FieldHelp>
          </div>
          <div>
            <Label htmlFor="firmFRN">Firm Reference Number (FRN) *</Label>
            <Input
              id="firmFRN"
              value={formData.firmFRN}
              onChange={(e) => updateField("firmFRN", e.target.value)}
              onBlur={(e) => validateField("firmFRN", e.target.value, "frn")}
              placeholder="e.g., 123456"
              aria-invalid={!!validationErrors.firmFRN}
            />
            {validationErrors.firmFRN && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.firmFRN}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="firmAddress">Registered Address</Label>
          <Textarea
            id="firmAddress"
            value={formData.firmAddress}
            onChange={(e) => updateField("firmAddress", e.target.value)}
            rows={2}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Person Submitting This Notice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submitterName">Full Name *</Label>
              <Input
                id="submitterName"
                value={formData.submitterName}
                onChange={(e) => updateField("submitterName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="submitterPosition">Position/Title</Label>
              <Input
                id="submitterPosition"
                value={formData.submitterPosition}
                onChange={(e) => updateField("submitterPosition", e.target.value)}
                placeholder="e.g., Compliance Officer"
              />
            </div>
            <div>
              <Label htmlFor="submitterEmail">Email</Label>
              <Input
                id="submitterEmail"
                type="email"
                value={formData.submitterEmail}
                onChange={(e) => updateField("submitterEmail", e.target.value)}
                onBlur={(e) => validateField("submitterEmail", e.target.value, "email")}
                aria-invalid={!!validationErrors.submitterEmail}
              />
              {validationErrors.submitterEmail && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.submitterEmail}</p>
              )}
            </div>
            <div>
              <Label htmlFor="submitterPhone">Phone</Label>
              <Input
                id="submitterPhone"
                value={formData.submitterPhone}
                onChange={(e) => updateField("submitterPhone", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext}>
            Next: Individual Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
