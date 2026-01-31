"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, ChevronRight } from "lucide-react";
import type { PSDFormSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { FormDatePicker } from './FormDatePicker';
import { psdPositionTypes } from '../utils/form-constants';

export function PSDSection3Arrangements({
  formData,
  updateField,
  onNext,
  onBack,
}: PSDFormSectionProps) {
  const toggleDocument = (doc: string) => {
    const current = formData.attachedDocuments;
    if (current.includes(doc)) {
      updateField("attachedDocuments", current.filter(d => d !== doc));
    } else {
      updateField("attachedDocuments", [...current, doc]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Section 3: Arrangements
        </CardTitle>
        <CardDescription>
          Details of the position to be held
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 3.1 Position Type */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">
            3.1 Details of Position to be Held by the PSD Individual *
          </Label>
          <RadioGroup
            value={formData.positionType}
            onValueChange={(value) => updateField("positionType", value)}
            className="space-y-2"
          >
            {psdPositionTypes.map((type) => (
              <div key={type.value} className="flex items-start space-x-3">
                <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                <Label htmlFor={type.value} className="font-normal cursor-pointer text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {formData.positionType === "other" && (
            <div className="mt-3">
              <Label htmlFor="positionOtherDetails">Please specify</Label>
              <Input
                id="positionOtherDetails"
                value={formData.positionOtherDetails}
                onChange={(e) => updateField("positionOtherDetails", e.target.value)}
                placeholder="Describe the position"
              />
            </div>
          )}
        </div>

        {/* 3.2 Attached Documents */}
        <div className="border rounded-lg p-4 space-y-3">
          <Label className="text-sm font-semibold text-slate-700 block">
            3.2 You must attach the following (as applicable) *
          </Label>
          <SectionInfo title="Note" variant="info">
            <p>In most cases we expect to receive the individual's employment contract. Where not available, supply a letter of appointment or offer letter as confirmation.</p>
            <p className="mt-1">Ensure the document clearly identifies the role, responsibilities, and start date.</p>
          </SectionInfo>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="doc-letter"
                checked={formData.attachedDocuments.includes("letter")}
                onCheckedChange={() => toggleDocument("letter")}
              />
              <Label htmlFor="doc-letter" className="font-normal cursor-pointer text-sm">
                Letter of appointment
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="doc-contract"
                checked={formData.attachedDocuments.includes("contract")}
                onCheckedChange={() => toggleDocument("contract")}
              />
              <Label htmlFor="doc-contract" className="font-normal cursor-pointer text-sm">
                Contract
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="doc-offer"
                checked={formData.attachedDocuments.includes("offer")}
                onCheckedChange={() => toggleDocument("offer")}
              />
              <Label htmlFor="doc-offer" className="font-normal cursor-pointer text-sm">
                Offer of employment or respective drafts
              </Label>
            </div>
          </div>
        </div>

        {/* 3.3-3.4 Start/End Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormDatePicker
              id="plannedStartDate"
              label="3.3 Planned Start Date"
              value={formData.plannedStartDate}
              onChange={(value) => updateField("plannedStartDate", value)}
              placeholder="Select start date"
              required
            />
          </div>
          <div className="space-y-3">
            <Label className="block">3.4 Does the role have an expected end date?</Label>
            <RadioGroup
              value={formData.hasExpectedEndDate ? "yes" : "no"}
              onValueChange={(value) => updateField("hasExpectedEndDate", value === "yes")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="end-no" />
                <Label htmlFor="end-no" className="font-normal">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="end-yes" />
                <Label htmlFor="end-yes" className="font-normal">Yes</Label>
              </div>
            </RadioGroup>

            {formData.hasExpectedEndDate && (
              <div>
                <FormDatePicker
                  id="expectedEndDate"
                  label="Expected End Date"
                  value={formData.expectedEndDate}
                  onChange={(value) => updateField("expectedEndDate", value)}
                  placeholder="Select end date"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3.5 Key Duties */}
        <div>
          <Label htmlFor="keyDutiesResponsibilities">3.5 Key Duties and Responsibilities *</Label>
          <Textarea
            id="keyDutiesResponsibilities"
            value={formData.keyDutiesResponsibilities}
            onChange={(e) => updateField("keyDutiesResponsibilities", e.target.value)}
            placeholder="Include a summary of the role as set out in the contract of employment, as well as information about specific projects or tasks the individual anticipates being involved in..."
            rows={5}
          />
          <FieldHelp>Describe the key duties as they relate to the payment services activity</FieldHelp>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Employment History <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
