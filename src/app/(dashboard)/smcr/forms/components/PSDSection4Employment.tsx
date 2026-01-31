"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { PSDFormSectionProps, PSDEmploymentEntry, PSDQualificationEntry } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { FormDatePicker } from './FormDatePicker';
import { psdNatureOfEmployment, psdReasonsForLeaving } from '../utils/form-constants';

interface PSDSection4Props extends PSDFormSectionProps {
  addEmployment: () => void;
  updateEmployment: <K extends keyof PSDEmploymentEntry>(id: string, field: K, value: PSDEmploymentEntry[K]) => void;
  removeEmployment: (id: string) => void;
  addQualification: () => void;
  updateQualification: <K extends keyof PSDQualificationEntry>(id: string, field: K, value: PSDQualificationEntry[K]) => void;
  removeQualification: (id: string) => void;
}

export function PSDSection4Employment({
  formData,
  updateField,
  onNext,
  onBack,
  addEmployment,
  updateEmployment,
  removeEmployment,
  addQualification,
  updateQualification,
  removeQualification,
}: PSDSection4Props) {
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});

  const validateDateRange = (empId: string, fromDate: string, toDate: string) => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateErrors(prev => ({ ...prev, [empId]: "End date must be after start date" }));
    } else {
      setDateErrors(prev => {
        const { [empId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          Section 4: Employment History and Qualifications
        </CardTitle>
        <CardDescription>
          Full 10-year employment history and relevant qualifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Important" variant="warning">
          <p><strong>A full ten-year employment history must be provided</strong> and ALL gaps must be accounted for. Failing to provide this may delay the processing of the application.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
            <li>Include all employment whether in financial services or not</li>
            <li>Part-time work, voluntary work, and self-employment all count</li>
            <li>For gaps (unemployment, education, travel), select the appropriate nature and explain</li>
            <li>Employer address should be the actual place of employment, not head office if different</li>
          </ul>
        </SectionInfo>

        {/* 4.1 Employment History */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">4.1 Employment Details</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmployment}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Employment
            </Button>
          </div>

          {formData.employmentHistory.map((emp, index) => (
            <div key={emp.id} className="border rounded-lg p-4 space-y-4 bg-slate-50">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-slate-700">
                  Employment {index + 1} {index === 0 ? "(Current Position)" : "(Previous)"}
                </h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmployment(emp.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FormDatePicker
                    id={`emp-from-${emp.id}`}
                    label="From (mm/yy)"
                    value={emp.fromDate}
                    onChange={(value) => {
                      updateEmployment(emp.id, "fromDate", value);
                      validateDateRange(emp.id, value, emp.toDate);
                    }}
                    placeholder="Select month"
                    type="month"
                    required
                  />
                </div>
                <div>
                  <FormDatePicker
                    id={`emp-to-${emp.id}`}
                    label="To (mm/yy)"
                    value={emp.toDate}
                    onChange={(value) => {
                      updateEmployment(emp.id, "toDate", value);
                      validateDateRange(emp.id, emp.fromDate, value);
                    }}
                    placeholder="Leave blank if current"
                    type="month"
                    helpText={dateErrors[emp.id]}
                  />
                  {dateErrors[emp.id] && (
                    <p className="text-xs text-red-600 mt-1">{dateErrors[emp.id]}</p>
                  )}
                </div>
                <div>
                  <Label>Nature of Employment *</Label>
                  <Select
                    value={emp.natureOfEmployment}
                    onValueChange={(value) => updateEmployment(emp.id, "natureOfEmployment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {psdNatureOfEmployment.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(emp.natureOfEmployment === "unemployed" || emp.natureOfEmployment === "education") && (
                <div>
                  <Label>Details *</Label>
                  <Textarea
                    value={emp.employmentDetails}
                    onChange={(e) => updateEmployment(emp.id, "employmentDetails", e.target.value)}
                    placeholder={emp.natureOfEmployment === "education" ? "Course and institution details" : "Explain circumstances"}
                    rows={2}
                  />
                </div>
              )}

              {(emp.natureOfEmployment === "employed" || emp.natureOfEmployment === "self-employed") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name of Employer *</Label>
                      <Input
                        value={emp.employerName}
                        onChange={(e) => updateEmployment(emp.id, "employerName", e.target.value)}
                        placeholder="Company/Organisation name"
                      />
                    </div>
                    <div>
                      <Label>Previous/Other Names of Employer</Label>
                      <Input
                        value={emp.previousEmployerNames}
                        onChange={(e) => updateEmployment(emp.id, "previousEmployerNames", e.target.value)}
                        placeholder="If company changed name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Last Known Address of Employer</Label>
                    <Textarea
                      value={emp.employerAddress}
                      onChange={(e) => updateEmployment(emp.id, "employerAddress", e.target.value)}
                      placeholder="Actual place of employment, not head office"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nature of Business *</Label>
                      <Input
                        value={emp.natureOfBusiness}
                        onChange={(e) => updateEmployment(emp.id, "natureOfBusiness", e.target.value)}
                        placeholder="E.g., Financial Services, Retail Banking"
                      />
                    </div>
                    <div>
                      <Label>Position Held *</Label>
                      <Input
                        value={emp.positionHeld}
                        onChange={(e) => updateEmployment(emp.id, "positionHeld", e.target.value)}
                        placeholder="Job title"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`regulated-${emp.id}`}
                      checked={emp.isRegulated}
                      onCheckedChange={(checked) => updateEmployment(emp.id, "isRegulated", Boolean(checked))}
                    />
                    <Label htmlFor={`regulated-${emp.id}`} className="font-normal cursor-pointer text-sm">
                      Employer regulated by a regulatory body
                    </Label>
                  </div>

                  {emp.isRegulated && (
                    <div>
                      <Label>Name of Regulatory Body *</Label>
                      <Input
                        value={emp.regulatorName}
                        onChange={(e) => updateEmployment(emp.id, "regulatorName", e.target.value)}
                        placeholder="E.g., FCA, PRA"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Responsibilities *</Label>
                    <Textarea
                      value={emp.responsibilities}
                      onChange={(e) => updateEmployment(emp.id, "responsibilities", e.target.value)}
                      placeholder="Brief explanation of duties"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Reason for leaving - only for previous positions */}
              {index > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Reason for Leaving</Label>
                    <Select
                      value={emp.reasonForLeaving}
                      onValueChange={(value) => updateEmployment(emp.id, "reasonForLeaving", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {psdReasonsForLeaving.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {emp.reasonForLeaving === "other" && (
                    <div>
                      <Label>Please specify</Label>
                      <Input
                        value={emp.reasonDetails}
                        onChange={(e) => updateEmployment(emp.id, "reasonDetails", e.target.value)}
                        placeholder="Reason details"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 4.2 Qualifications */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">4.2 Qualification Details</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQualification}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Qualification
            </Button>
          </div>

          {formData.qualifications.map((qual, index) => (
            <div key={qual.id} className="border rounded-lg p-4 space-y-4 bg-slate-50">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-slate-700">Qualification {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQualification(qual.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormDatePicker
                    id={`qual-from-${qual.id}`}
                    label="From (mm/yy)"
                    value={qual.fromDate}
                    onChange={(value) => updateQualification(qual.id, "fromDate", value)}
                    placeholder="Select month"
                    type="month"
                  />
                </div>
                <div>
                  <FormDatePicker
                    id={`qual-to-${qual.id}`}
                    label="To (mm/yy)"
                    value={qual.toDate}
                    onChange={(value) => updateQualification(qual.id, "toDate", value)}
                    placeholder="Select month"
                    type="month"
                  />
                </div>
              </div>

              <div>
                <Label>Qualification *</Label>
                <Input
                  value={qual.qualification}
                  onChange={(e) => updateQualification(qual.id, "qualification", e.target.value)}
                  placeholder="Name of qualification"
                />
              </div>

              <div>
                <Label>Issuing Organisation / Training Provider *</Label>
                <Input
                  value={qual.issuingOrganisation}
                  onChange={(e) => updateQualification(qual.id, "issuingOrganisation", e.target.value)}
                  placeholder="University, professional body, etc."
                />
              </div>
            </div>
          ))}

          {formData.qualifications.length === 0 && (
            <p className="text-xs text-slate-500 italic">No qualifications added. Click "Add Qualification" to add relevant qualifications.</p>
          )}
        </div>

        {/* 4.3-4.4 Additional Requirements */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="cvAvailable"
              checked={formData.cvAvailable}
              onCheckedChange={(checked) => updateField("cvAvailable", Boolean(checked))}
            />
            <div>
              <Label htmlFor="cvAvailable" className="font-normal cursor-pointer text-sm">
                4.3 I understand that a CV may be requested *
              </Label>
              <FieldHelp>CV should contain education, professional experience, and qualifications</FieldHelp>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="suitabilityAssessmentAttached"
              checked={formData.suitabilityAssessmentAttached}
              onCheckedChange={(checked) => updateField("suitabilityAssessmentAttached", Boolean(checked))}
            />
            <div>
              <Label htmlFor="suitabilityAssessmentAttached" className="font-normal cursor-pointer text-sm">
                4.4 Suitability assessment attached
              </Label>
              <FieldHelp>Include board minutes, suitability reports, or other assessment documents</FieldHelp>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Fitness & Propriety <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
