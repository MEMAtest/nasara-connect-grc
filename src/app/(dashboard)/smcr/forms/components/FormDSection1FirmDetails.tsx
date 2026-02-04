"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ChevronRight } from "lucide-react";
import type { FormDSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function FormDSection1FirmDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
}: FormDSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-600" />
          Section 1: Firm Details
        </CardTitle>
        <CardDescription>
          Firm and submitter information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="About Form D" variant="info">
          <p>Use this form to notify the FCA of changes to an approved person&apos;s details, including name changes, contact updates, or new fitness and propriety matters.</p>
          <p className="mt-1"><strong>Note:</strong> Submit as soon as possible after becoming aware of the change.</p>
        </SectionInfo>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firmName">Firm Name *</Label>
            <Input
              id="firmName"
              value={formData.firmName}
              onChange={(e) => updateField("firmName", e.target.value)}
              placeholder="Enter firm name"
            />
          </div>
          <div>
            <Label htmlFor="firmFRN">Firm Reference Number (FRN) *</Label>
            <Input
              id="firmFRN"
              value={formData.firmFRN}
              onChange={(e) => updateField("firmFRN", e.target.value)}
              onBlur={(e) => validateField("firmFRN", e.target.value, "frn")}
              placeholder="e.g., 123456"
            />
            {validationErrors.firmFRN && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.firmFRN}</p>
            )}
            <FieldHelp>6-digit number from FCA Register</FieldHelp>
          </div>
        </div>

        <div>
          <Label htmlFor="firmAddress">Firm Address *</Label>
          <Textarea
            id="firmAddress"
            value={formData.firmAddress}
            onChange={(e) => updateField("firmAddress", e.target.value)}
            placeholder="Registered office address"
            rows={2}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Submitter Details</h3>
          <FieldHelp className="mb-3">The person completing this form on behalf of the firm</FieldHelp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submitterName">Full Name *</Label>
              <Input
                id="submitterName"
                value={formData.submitterName}
                onChange={(e) => updateField("submitterName", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="submitterPosition">Position *</Label>
              <Input
                id="submitterPosition"
                value={formData.submitterPosition}
                onChange={(e) => updateField("submitterPosition", e.target.value)}
                placeholder="e.g., Compliance Officer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="submitterEmail">Email *</Label>
              <Input
                id="submitterEmail"
                type="email"
                value={formData.submitterEmail}
                onChange={(e) => updateField("submitterEmail", e.target.value)}
                onBlur={(e) => validateField("submitterEmail", e.target.value, "email")}
                placeholder="your.email@firm.com"
              />
              {validationErrors.submitterEmail && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.submitterEmail}</p>
              )}
            </div>
            <div>
              <Label htmlFor="submitterPhone">Phone *</Label>
              <Input
                id="submitterPhone"
                type="tel"
                value={formData.submitterPhone}
                onChange={(e) => updateField("submitterPhone", e.target.value)}
                onBlur={(e) => validateField("submitterPhone", e.target.value, "phone")}
                placeholder="+44..."
              />
              {validationErrors.submitterPhone && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.submitterPhone}</p>
              )}
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
