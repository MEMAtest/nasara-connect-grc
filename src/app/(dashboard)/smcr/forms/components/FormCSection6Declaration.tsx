"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Download } from "lucide-react";
import type { FormCSectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

interface FormCSection6Props extends FormCSectionProps {
  onExport: () => void;
}

export function FormCSection6Declaration({
  formData,
  updateField,
  onBack,
  onExport,
}: FormCSection6Props) {
  const isComplete = formData.firmDeclaration &&
                     formData.declarantSignature &&
                     formData.declarantDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          Section 6: Declaration
        </CardTitle>
        <CardDescription>
          Firm declaration and submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Legal notice" variant="warning">
          <p><strong>Providing false or misleading information to the FCA is a criminal offence</strong> under Section 398 of the Financial Services and Markets Act 2000.</p>
        </SectionInfo>

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Firm Declaration</h3>

          <div className="text-xs text-slate-600 space-y-2">
            <p>By signing below, the firm declares that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The information provided in this notice is accurate and complete to the best of our knowledge</li>
              <li>We have disclosed all relevant circumstances regarding the individual&apos;s departure</li>
              <li>We have made appropriate arrangements for the handover of responsibilities</li>
              <li>We understand that providing false or misleading information is a criminal offence</li>
              <li>We will provide a regulatory reference if requested by the individual&apos;s new employer</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="firmDeclaration"
              checked={formData.firmDeclaration}
              onCheckedChange={(checked) => updateField("firmDeclaration", Boolean(checked))}
            />
            <Label htmlFor="firmDeclaration" className="font-normal cursor-pointer text-sm">
              The firm has read and agrees to the above declaration *
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="declarantName">Declarant Name *</Label>
              <Input
                id="declarantName"
                value={formData.declarantName}
                onChange={(e) => updateField("declarantName", e.target.value)}
                placeholder="Full name of person signing"
              />
            </div>
            <div>
              <Label htmlFor="declarantPosition">Position *</Label>
              <Input
                id="declarantPosition"
                value={formData.declarantPosition}
                onChange={(e) => updateField("declarantPosition", e.target.value)}
                placeholder="e.g., Compliance Officer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="declarantSignature">Signature (type full name) *</Label>
              <Input
                id="declarantSignature"
                value={formData.declarantSignature}
                onChange={(e) => updateField("declarantSignature", e.target.value)}
                placeholder="Type your full legal name"
              />
            </div>
            <div>
              <Label htmlFor="declarantDate">Date *</Label>
              <Input
                id="declarantDate"
                type="date"
                value={formData.declarantDate}
                onChange={(e) => updateField("declarantDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <SectionInfo title="Next steps" variant="success">
          <p>Once complete, export this form and use it as a reference when submitting via FCA Connect.</p>
          <p className="mt-1"><strong>Deadline:</strong> Submit within 7 business days of the individual ceasing the function.</p>
          <p className="mt-1">Official submission must be made through <a href="https://connect.fca.org.uk" target="_blank" rel="noopener noreferrer" className="underline">FCA Connect</a>.</p>
        </SectionInfo>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onExport} disabled={!isComplete}>
            <Download className="h-4 w-4 mr-2" />
            Export Completed Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
