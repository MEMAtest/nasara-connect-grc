"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function FormESection7Competency({
  formData,
  updateField,
  onNext,
  onBack,
}: FormESectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-teal-600" />
          Section 7: Competency for New Role
        </CardTitle>
        <CardDescription>
          Demonstrate the individual's suitability for the new function
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Competency assessment" variant="info">
          <p>The FCA expects firms to assess whether individuals have the knowledge, skills, and experience to perform their controlled functions effectively.</p>
        </SectionInfo>

        <div>
          <Label htmlFor="relevantExperience">Relevant Experience *</Label>
          <Textarea
            id="relevantExperience"
            value={formData.relevantExperience}
            onChange={(e) => updateField("relevantExperience", e.target.value)}
            placeholder="Describe the individual's relevant experience that qualifies them for this new role. Include previous roles, achievements, and specific expertise..."
            rows={5}
          />
          <FieldHelp>
            Focus on experience directly relevant to the new controlled function
          </FieldHelp>
        </div>

        <div>
          <Label htmlFor="additionalTraining">Training & Development</Label>
          <Textarea
            id="additionalTraining"
            value={formData.additionalTraining}
            onChange={(e) => updateField("additionalTraining", e.target.value)}
            placeholder="Describe any training that has been or will be provided to support the individual in their new role. Include qualifications, courses, and ongoing development plans..."
            rows={4}
          />
          <FieldHelp>
            Include both completed training and planned development
          </FieldHelp>
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
