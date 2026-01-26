"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, ChevronRight } from "lucide-react";
import type { SectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

export function Section13Competency({
  formData,
  updateField,
  onNext,
  onBack,
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-teal-600" />
          Section 13: Competency Assessment
        </CardTitle>
        <CardDescription>
          Evidence that the candidate is competent for the role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="What the FCA looks for" variant="info">
          <p>The FCA needs to be satisfied that the candidate has the knowledge, skills, and experience to perform the function effectively.</p>
          <p className="mt-1">Link their experience directly to the responsibilities of the role they're applying for.</p>
        </SectionInfo>

        <div>
          <Label htmlFor="relevantExperience">Relevant Experience *</Label>
          <Textarea
            id="relevantExperience"
            value={formData.relevantExperience}
            onChange={(e) => updateField("relevantExperience", e.target.value)}
            placeholder="Describe the candidate's relevant experience that makes them suitable for this role. Include:

• Specific experience in this type of role
• Experience in financial services
• Leadership and management experience
• Experience with relevant regulatory frameworks
• Achievements and track record"
            rows={8}
          />
          <FieldHelp>Link directly to the Statement of Responsibilities - explain how their experience qualifies them</FieldHelp>
        </div>

        <div>
          <Label htmlFor="qualifications">Professional Qualifications</Label>
          <Textarea
            id="qualifications"
            value={formData.qualifications}
            onChange={(e) => updateField("qualifications", e.target.value)}
            placeholder="List relevant qualifications:
• Degree(s) and institution(s)
• Professional qualifications (e.g., CFA, ACCA, CISI)
• Regulatory qualifications
• Other relevant certifications"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="trainingPlanned">Training Planned</Label>
          <Textarea
            id="trainingPlanned"
            value={formData.trainingPlanned}
            onChange={(e) => updateField("trainingPlanned", e.target.value)}
            placeholder="Describe any induction or training planned for the candidate:
• Regulatory training
• Firm-specific training
• Ongoing development plans"
            rows={4}
          />
          <FieldHelp>Even experienced candidates should have an induction plan</FieldHelp>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Declarations <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
