"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, ChevronRight } from "lucide-react";
import type { SectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { allSMFs, certificationFunctions } from "../../data/core-functions";

export function Section4FunctionDetails({
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
          <Briefcase className="h-5 w-5 text-teal-600" />
          Section 4: Controlled Function Applied For
        </CardTitle>
        <CardDescription>
          Details of the role and function being applied for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Processing time" variant="warning">
          <p><strong>SMF applications:</strong> Allow up to 3 months for FCA approval. The candidate MUST NOT perform the function until approved.</p>
          <p className="mt-1"><strong>Multiple functions:</strong> If applying for more than one function, you need a separate application for each.</p>
        </SectionInfo>

        <div>
          <Label htmlFor="functionApplied">Controlled Function *</Label>
          <Select value={formData.functionApplied} onValueChange={(v) => updateField("functionApplied", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select the function" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50">Senior Manager Functions</div>
              {allSMFs.map((smf) => (
                <SelectItem key={smf.id} value={`${smf.smf_number} - ${smf.title}`}>
                  {smf.smf_number} - {smf.title}
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border-t">Certification Functions</div>
              {certificationFunctions.map((cf) => (
                <SelectItem key={cf.id} value={`${cf.cf_number} - ${cf.title}`}>
                  {cf.cf_number} - {cf.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHelp>Select the specific SMF or CF role the candidate will perform</FieldHelp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="effectiveDate">Proposed Effective Date *</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => updateField("effectiveDate", e.target.value)}
              onBlur={(e) => validateField("effectiveDate", e.target.value, "futureDate")}
              aria-invalid={!!validationErrors.effectiveDate}
              aria-describedby={validationErrors.effectiveDate ? "effectiveDate-error" : "effectiveDate-help"}
            />
            {validationErrors.effectiveDate ? (
              <p id="effectiveDate-error" className="text-xs text-red-600 mt-1">{validationErrors.effectiveDate}</p>
            ) : (
              <FieldHelp><span id="effectiveDate-help">Date you want the candidate to START (after approval)</span></FieldHelp>
            )}
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              placeholder="e.g., Chief Executive Officer"
            />
            <FieldHelp>The candidate's official job title at your firm</FieldHelp>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="arrangementType">Employment Arrangement</Label>
            <Select value={formData.arrangementType} onValueChange={(v) => updateField("arrangementType", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="contracted">Contracted</SelectItem>
                <SelectItem value="seconded">Seconded</SelectItem>
                <SelectItem value="appointed">Appointed (NED)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timeCommitment">Time Commitment</Label>
            <Select value={formData.timeCommitment} onValueChange={(v) => updateField("timeCommitment", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="non-executive">Non-executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hoursPerWeek">Hours per Week</Label>
            <Input
              id="hoursPerWeek"
              value={formData.hoursPerWeek}
              onChange={(e) => updateField("hoursPerWeek", e.target.value)}
              placeholder="e.g., 40"
            />
            <FieldHelp>Expected hours dedicated to this role</FieldHelp>
          </div>
          <div>
            <Label htmlFor="reportingTo">Reports To</Label>
            <Input
              id="reportingTo"
              value={formData.reportingTo}
              onChange={(e) => updateField("reportingTo", e.target.value)}
              placeholder="e.g., Board of Directors"
            />
          </div>
          <div>
            <Label htmlFor="directReports">Number of Direct Reports</Label>
            <Input
              id="directReports"
              value={formData.directReports}
              onChange={(e) => updateField("directReports", e.target.value)}
              placeholder="e.g., 5"
            />
          </div>
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
