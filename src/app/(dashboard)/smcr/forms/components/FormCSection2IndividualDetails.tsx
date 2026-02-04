"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ChevronRight } from "lucide-react";
import type { FormCSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { controlledFunctions } from '../utils/form-constants';

export function FormCSection2IndividualDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
  onBack,
}: FormCSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          Section 2: Individual Details
        </CardTitle>
        <CardDescription>
          Details of the person ceasing the controlled function
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Finding the IRN" variant="info">
          <p>The Individual Reference Number (IRN) can be found on the <a href="https://register.fca.org.uk" target="_blank" rel="noopener noreferrer" className="underline">FCA Register</a> by searching for the individual&apos;s name.</p>
        </SectionInfo>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Select value={formData.title} onValueChange={(value) => updateField("title", value)}>
              <SelectTrigger id="title">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="forenames">Forename(s) *</Label>
            <Input
              id="forenames"
              value={formData.forenames}
              onChange={(e) => updateField("forenames", e.target.value)}
              placeholder="First and middle names"
            />
          </div>
          <div>
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={formData.surname}
              onChange={(e) => updateField("surname", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="individualReferenceNumber">Individual Reference Number (IRN) *</Label>
            <Input
              id="individualReferenceNumber"
              value={formData.individualReferenceNumber}
              onChange={(e) => updateField("individualReferenceNumber", e.target.value)}
              placeholder="e.g., ABC12345"
            />
            <FieldHelp>Found on the FCA Register for approved persons</FieldHelp>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationalInsurance">National Insurance Number</Label>
            <Input
              id="nationalInsurance"
              value={formData.nationalInsurance}
              onChange={(e) => updateField("nationalInsurance", e.target.value.toUpperCase())}
              onBlur={(e) => validateField("nationalInsurance", e.target.value, "ni")}
              placeholder="e.g., AB123456C"
              aria-invalid={!!validationErrors.nationalInsurance}
            />
            {validationErrors.nationalInsurance && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.nationalInsurance}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Controlled Function Being Ceased</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="functionCeasing">Function *</Label>
              <Select
                value={formData.functionCeasing}
                onValueChange={(value) => updateField("functionCeasing", value)}
              >
                <SelectTrigger id="functionCeasing">
                  <SelectValue placeholder="Select function..." />
                </SelectTrigger>
                <SelectContent>
                  {controlledFunctions.map((func) => (
                    <SelectItem key={func.value} value={func.value}>
                      {func.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateApproved">Date Originally Approved</Label>
              <Input
                id="dateApproved"
                type="date"
                value={formData.dateApproved}
                onChange={(e) => updateField("dateApproved", e.target.value)}
              />
              <FieldHelp>When the individual was first approved for this function</FieldHelp>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Cessation Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
