"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, ChevronRight } from "lucide-react";
import type { SectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function Section2PersonalDetails({
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
          <User className="h-5 w-5 text-teal-600" />
          Section 2: Candidate Personal Details
        </CardTitle>
        <CardDescription>
          Personal information about the candidate being approved
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Important" variant="warning">
          <p>Enter all names <strong>exactly as they appear on official ID</strong> (passport, driving licence). The FCA will check against government databases.</p>
          <p className="mt-1">Include ALL previous names (maiden name, name changes, aliases) - these will be searched.</p>
        </SectionInfo>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Select value={formData.title} onValueChange={(v) => updateField("title", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
                <SelectItem value="Prof">Prof</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={formData.surname}
              onChange={(e) => updateField("surname", e.target.value)}
            />
            <FieldHelp>Current legal surname as on passport</FieldHelp>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="forenames">Forename(s) *</Label>
            <Input
              id="forenames"
              value={formData.forenames}
              onChange={(e) => updateField("forenames", e.target.value)}
            />
            <FieldHelp>ALL first and middle names as on passport</FieldHelp>
          </div>
          <div>
            <Label htmlFor="previousNames">Previous Names</Label>
            <Input
              id="previousNames"
              value={formData.previousNames}
              onChange={(e) => updateField("previousNames", e.target.value)}
              placeholder="e.g., Smith (maiden name)"
            />
            <FieldHelp>Include ALL: maiden name, deed poll changes, aliases</FieldHelp>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
              onBlur={(e) => validateField("dateOfBirth", e.target.value, "dateOfBirth")}
              aria-invalid={!!validationErrors.dateOfBirth}
              aria-describedby={validationErrors.dateOfBirth ? "dateOfBirth-error" : undefined}
            />
            {validationErrors.dateOfBirth && (
              <p id="dateOfBirth-error" className="text-xs text-red-600 mt-1">{validationErrors.dateOfBirth}</p>
            )}
          </div>
          <div>
            <Label htmlFor="townOfBirth">Town/City of Birth *</Label>
            <Input
              id="townOfBirth"
              value={formData.townOfBirth}
              onChange={(e) => updateField("townOfBirth", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="countryOfBirth">Country of Birth *</Label>
            <Input
              id="countryOfBirth"
              value={formData.countryOfBirth}
              onChange={(e) => updateField("countryOfBirth", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality">Nationality *</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => updateField("nationality", e.target.value)}
              placeholder="e.g., British"
            />
            <FieldHelp>If dual nationality, list both</FieldHelp>
          </div>
          <div>
            <Label htmlFor="nationalInsurance">National Insurance Number</Label>
            <Input
              id="nationalInsurance"
              value={formData.nationalInsurance}
              onChange={(e) => updateField("nationalInsurance", e.target.value)}
              onBlur={(e) => validateField("nationalInsurance", e.target.value, "nationalInsurance")}
              placeholder="AB 12 34 56 C"
              aria-invalid={!!validationErrors.nationalInsurance}
              aria-describedby={validationErrors.nationalInsurance ? "nationalInsurance-error" : "nationalInsurance-help"}
            />
            {validationErrors.nationalInsurance ? (
              <p id="nationalInsurance-error" className="text-xs text-red-600 mt-1">{validationErrors.nationalInsurance}</p>
            ) : (
              <FieldHelp><span id="nationalInsurance-help">UK-based candidates only. Format: AB 12 34 56 C</span></FieldHelp>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="hasRightToWork"
              checked={formData.hasRightToWork}
              onCheckedChange={(checked) => updateField("hasRightToWork", Boolean(checked))}
            />
            <div>
              <Label htmlFor="hasRightToWork" className="font-normal cursor-pointer">
                I confirm the candidate has the right to work in the UK
              </Label>
              <FieldHelp>Firm must verify and retain proof (passport, visa, share code)</FieldHelp>
            </div>
          </div>
          {!formData.hasRightToWork && (
            <div>
              <Label htmlFor="rightToWorkDetails">Please explain:</Label>
              <Textarea
                id="rightToWorkDetails"
                value={formData.rightToWorkDetails}
                onChange={(e) => updateField("rightToWorkDetails", e.target.value)}
                placeholder="Explain the candidate's work authorisation status"
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Contact Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
