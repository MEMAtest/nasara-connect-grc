"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Download } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

interface FormESection9Props extends FormESectionProps {
  onExport: () => void;
}

export function FormESection9Declarations({
  formData,
  updateField,
  onBack,
  onExport,
}: FormESection9Props) {
  const isComplete = formData.candidateDeclaration &&
                     formData.candidateSignature &&
                     formData.candidateSignatureDate &&
                     formData.firmDeclaration &&
                     formData.firmSignature &&
                     formData.firmSignatureDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          Section 9: Declarations
        </CardTitle>
        <CardDescription>
          Candidate and firm declarations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Legal notice" variant="warning">
          <p><strong>Providing false or misleading information to the FCA is a criminal offence</strong> under Section 398 of the Financial Services and Markets Act 2000.</p>
        </SectionInfo>

        {/* Candidate Declaration */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Candidate Declaration</h3>

          <div className="text-xs text-slate-600 space-y-2">
            <p>By signing below, the candidate declares that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All information provided is accurate and complete to the best of my knowledge</li>
              <li>I have disclosed all relevant matters affecting my fitness and propriety</li>
              <li>I consent to the FCA making enquiries about me</li>
              <li>I understand that providing false or misleading information is a criminal offence</li>
              <li>I will notify the firm of any changes to my circumstances that may affect my fitness and propriety</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="candidateDeclaration"
              checked={formData.candidateDeclaration}
              onCheckedChange={(checked) => updateField("candidateDeclaration", Boolean(checked))}
            />
            <Label htmlFor="candidateDeclaration" className="font-normal cursor-pointer text-sm">
              I have read and agree to the above declaration *
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="candidateSignature">Candidate Signature (type full name) *</Label>
              <Input
                id="candidateSignature"
                value={formData.candidateSignature}
                onChange={(e) => updateField("candidateSignature", e.target.value)}
                placeholder="Type your full legal name"
              />
            </div>
            <div>
              <Label htmlFor="candidateSignatureDate">Date *</Label>
              <Input
                id="candidateSignatureDate"
                type="date"
                value={formData.candidateSignatureDate}
                onChange={(e) => updateField("candidateSignatureDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Firm Declaration */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Firm Declaration</h3>

          <div className="text-xs text-slate-600 space-y-2">
            <p>By signing below, the firm declares that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The information provided is accurate and complete to the best of our knowledge</li>
              <li>We have assessed the candidate's fitness and propriety for the new function</li>
              <li>We have assessed the candidate's competence for the new function</li>
              <li>We have appropriate systems to supervise the candidate</li>
              <li>We understand that providing false or misleading information is a criminal offence</li>
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
              <Label htmlFor="firmSignature">Firm Signatory (type full name) *</Label>
              <Input
                id="firmSignature"
                value={formData.firmSignature}
                onChange={(e) => updateField("firmSignature", e.target.value)}
                placeholder="Type your full legal name"
              />
            </div>
            <div>
              <Label htmlFor="firmSignatureDate">Date *</Label>
              <Input
                id="firmSignatureDate"
                type="date"
                value={formData.firmSignatureDate}
                onChange={(e) => updateField("firmSignatureDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <SectionInfo title="Next steps" variant="success">
          <p>Once complete, export this form and use it as a reference when submitting via FCA Connect.</p>
          <p className="mt-1"><strong>Processing time:</strong> SMF transfers take up to 3 months. The individual must not perform the new function until approved.</p>
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
