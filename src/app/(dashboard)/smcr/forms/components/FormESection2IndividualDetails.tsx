"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';

export function FormESection2IndividualDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
  onBack,
}: FormESectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          Section 2: Individual Details
        </CardTitle>
        <CardDescription>
          Details of the approved person being transferred
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Select value={formData.title} onValueChange={(value) => updateField("title", value)}>
              <SelectTrigger id="title">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
                <SelectItem value="Prof">Prof</SelectItem>
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
              placeholder="Family name"
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
            <FieldHelp>The individual's unique reference from the FCA Register</FieldHelp>
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

        <div>
          <Label htmlFor="nationalInsurance">National Insurance Number</Label>
          <Input
            id="nationalInsurance"
            value={formData.nationalInsurance}
            onChange={(e) => updateField("nationalInsurance", e.target.value)}
            onBlur={(e) => validateField("nationalInsurance", e.target.value, "ni")}
            placeholder="AB 12 34 56 C"
          />
          {validationErrors.nationalInsurance && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.nationalInsurance}</p>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Current Functions <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
