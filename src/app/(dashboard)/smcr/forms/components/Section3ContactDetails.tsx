"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, ChevronRight } from "lucide-react";
import type { SectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function Section3ContactDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
  onBack,
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-teal-600" />
          Section 3: Contact Details
        </CardTitle>
        <CardDescription>
          Home and work contact information for the candidate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Why we need this" variant="info">
          <p>The FCA may contact the candidate directly during the application process or afterwards. Ensure all details are accurate and up-to-date.</p>
        </SectionInfo>

        <h3 className="text-sm font-semibold text-slate-700">Home Address</h3>
        <div>
          <Label htmlFor="homeAddress">Address *</Label>
          <Textarea
            id="homeAddress"
            value={formData.homeAddress}
            onChange={(e) => updateField("homeAddress", e.target.value)}
            rows={2}
            placeholder="House number, street, town/city"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homePostcode">Postcode *</Label>
            <Input
              id="homePostcode"
              value={formData.homePostcode}
              onChange={(e) => updateField("homePostcode", e.target.value)}
              onBlur={(e) => validateField("homePostcode", e.target.value, "postcode")}
              placeholder="e.g., SW1A 1AA"
              aria-required="true"
              aria-invalid={!!validationErrors.homePostcode}
              aria-describedby={validationErrors.homePostcode ? "homePostcode-error" : undefined}
            />
            {validationErrors.homePostcode && (
              <p id="homePostcode-error" className="text-xs text-red-600 mt-1">{validationErrors.homePostcode}</p>
            )}
          </div>
          <div>
            <Label htmlFor="homeCountry">Country</Label>
            <Input
              id="homeCountry"
              value={formData.homeCountry}
              onChange={(e) => updateField("homeCountry", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="correspondenceAddress">Correspondence Address (if different)</Label>
          <Textarea
            id="correspondenceAddress"
            value={formData.correspondenceAddress}
            onChange={(e) => updateField("correspondenceAddress", e.target.value)}
            rows={2}
            placeholder="Leave blank if same as home address"
          />
          <FieldHelp>Only complete if the candidate prefers post sent elsewhere</FieldHelp>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Numbers & Email</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personalEmail">Personal Email</Label>
              <Input
                id="personalEmail"
                type="email"
                value={formData.personalEmail}
                onChange={(e) => updateField("personalEmail", e.target.value)}
                onBlur={(e) => validateField("personalEmail", e.target.value, "email")}
                aria-invalid={!!validationErrors.personalEmail}
                aria-describedby={validationErrors.personalEmail ? "personalEmail-error" : undefined}
              />
              {validationErrors.personalEmail && (
                <p id="personalEmail-error" className="text-xs text-red-600 mt-1">{validationErrors.personalEmail}</p>
              )}
            </div>
            <div>
              <Label htmlFor="personalPhone">Personal Phone</Label>
              <Input
                id="personalPhone"
                type="tel"
                value={formData.personalPhone}
                onChange={(e) => updateField("personalPhone", e.target.value)}
                onBlur={(e) => validateField("personalPhone", e.target.value, "phone")}
                aria-invalid={!!validationErrors.personalPhone}
                aria-describedby={validationErrors.personalPhone ? "personalPhone-error" : undefined}
              />
              {validationErrors.personalPhone && (
                <p id="personalPhone-error" className="text-xs text-red-600 mt-1">{validationErrors.personalPhone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="workEmail">Work Email *</Label>
              <Input
                id="workEmail"
                type="email"
                value={formData.workEmail}
                onChange={(e) => updateField("workEmail", e.target.value)}
                onBlur={(e) => validateField("workEmail", e.target.value, "email")}
                aria-invalid={!!validationErrors.workEmail}
                aria-required="true"
                aria-describedby={validationErrors.workEmail ? "workEmail-error" : "workEmail-help"}
              />
              {validationErrors.workEmail ? (
                <p id="workEmail-error" className="text-xs text-red-600 mt-1">{validationErrors.workEmail}</p>
              ) : (
                <FieldHelp><span id="workEmail-help">Primary contact for FCA correspondence</span></FieldHelp>
              )}
            </div>
            <div>
              <Label htmlFor="workPhone">Work Phone</Label>
              <Input
                id="workPhone"
                type="tel"
                value={formData.workPhone}
                onChange={(e) => updateField("workPhone", e.target.value)}
                onBlur={(e) => validateField("workPhone", e.target.value, "phone")}
                aria-invalid={!!validationErrors.workPhone}
                aria-describedby={validationErrors.workPhone ? "workPhone-error" : undefined}
              />
              {validationErrors.workPhone && (
                <p id="workPhone-error" className="text-xs text-red-600 mt-1">{validationErrors.workPhone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Function Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
