"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ChevronRight } from "lucide-react";
import type { PSDFormSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';

export function PSDSection2FirmDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
  onBack,
}: PSDFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Section 2: Firm Identification Details
        </CardTitle>
        <CardDescription>
          Details of the Payment Institution applying
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firmName">2.1 Name of Applicant Firm *</Label>
            <Input
              id="firmName"
              value={formData.firmName}
              onChange={(e) => updateField("firmName", e.target.value)}
              placeholder="Full legal name of firm or sole trader"
            />
          </div>
          <div>
            <Label htmlFor="firmFRN">2.2 FCA Firm Reference Number (FRN) *</Label>
            <Input
              id="firmFRN"
              value={formData.firmFRN}
              onChange={(e) => updateField("firmFRN", e.target.value)}
              onBlur={(e) => validateField("firmFRN", e.target.value, "frn")}
              placeholder="6-digit FRN"
            />
            {validationErrors.firmFRN && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.firmFRN}</p>
            )}
            <FieldHelp>Look up your FRN on the FCA Register at register.fca.org.uk</FieldHelp>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">2.3 FCA Contact at Applicant Firm *</h3>
          <FieldHelp>Person the FCA should contact regarding this application. They must be authorised to discuss the application with the FCA and available to respond to queries.</FieldHelp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="contactPosition">Position *</Label>
              <Input
                id="contactPosition"
                value={formData.contactPosition}
                onChange={(e) => updateField("contactPosition", e.target.value)}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPhone">Telephone *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                onBlur={(e) => validateField("contactPhone", e.target.value, "phone")}
                placeholder="+44..."
              />
              {validationErrors.contactPhone && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.contactPhone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="contactFax">Fax</Label>
              <Input
                id="contactFax"
                type="tel"
                value={formData.contactFax}
                onChange={(e) => updateField("contactFax", e.target.value)}
                placeholder="If available"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contactEmail">Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              onBlur={(e) => validateField("contactEmail", e.target.value, "email")}
              placeholder="contact@firm.com"
            />
            {validationErrors.contactEmail && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.contactEmail}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Arrangements <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
