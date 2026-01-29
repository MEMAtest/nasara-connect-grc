"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Download } from "lucide-react";
import type { PSDFormSectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

interface PSDSection7Props extends PSDFormSectionProps {
  onExport: () => void;
}

export function PSDSection7Declarations({
  formData,
  updateField,
  onBack,
  onExport,
}: PSDSection7Props) {
  const isComplete = formData.individualFullName &&
                     formData.individualSignature &&
                     formData.individualSignatureDate &&
                     formData.firmNameDeclaration &&
                     formData.firmSignatoryName &&
                     formData.firmSignatoryJobTitle &&
                     formData.firmSignature &&
                     formData.firmSignatureDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          Section 7: Declarations and Signatures
        </CardTitle>
        <CardDescription>
          Individual and firm declarations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Legal Notice" variant="warning">
          <p><strong>Knowingly or recklessly giving the FCA information which is false or misleading in a material particular is a criminal offence</strong> under the Payment Services Regulations 2017 and may lead to disciplinary sanctions or other enforcement action.</p>
        </SectionInfo>

        {/* Individual Declaration */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Declaration of Individual</h3>

          <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded">
            <p>By signing below, I:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authorise the FCA to make enquiries and seek further information as it thinks appropriate</li>
              <li>Understand I may be selected to undergo a PNC check to determine criminal records</li>
              <li>Understand the FCA may disclose results of enquiries to the firm submitting this application</li>
              <li>Confirm the information in this Form is accurate and complete to the best of my knowledge and belief</li>
              <li>Confirm I have read the notes to this form</li>
            </ul>
          </div>

          <div>
            <Label htmlFor="individualFullName">Individual's Full Name *</Label>
            <Input
              id="individualFullName"
              value={formData.individualFullName}
              onChange={(e) => updateField("individualFullName", e.target.value)}
              placeholder="Full legal name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="individualSignature">Signature (type full name) *</Label>
              <Input
                id="individualSignature"
                value={formData.individualSignature}
                onChange={(e) => updateField("individualSignature", e.target.value)}
                placeholder="Type your full legal name as signature"
              />
            </div>
            <div>
              <Label htmlFor="individualSignatureDate">Date *</Label>
              <Input
                id="individualSignatureDate"
                type="date"
                value={formData.individualSignatureDate}
                onChange={(e) => updateField("individualSignatureDate", e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">Must not be more than 3 months before submission</p>
            </div>
          </div>
        </div>

        {/* Firm Declaration */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Declaration of Applicant Firm / Payment Institution</h3>

          <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded">
            <p>By signing below, the firm declares that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All information that the FCA might reasonably consider relevant has been supplied</li>
              <li>Information is not assumed to be known merely because it is public or previously disclosed</li>
              <li>The firm will notify without delay of any material change</li>
              <li>On the basis of due and diligent enquiry, the individual is believed to be fit and proper</li>
              <li>On the basis of due and diligent enquiry, the individual is believed to be competent to fulfil the duties required</li>
              <li>The information in this Form is accurate and complete</li>
              <li>The signatory has authority to make this application on behalf of the applicant firm</li>
              <li>A copy of this Form will be sent to the firm at the same time as submission to the FCA</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firmNameDeclaration">Name of Applicant Firm *</Label>
              <Input
                id="firmNameDeclaration"
                value={formData.firmNameDeclaration}
                onChange={(e) => updateField("firmNameDeclaration", e.target.value)}
                placeholder="Full legal name of firm"
              />
            </div>
            <div>
              <Label htmlFor="firmSignatoryName">Name of Person Signing *</Label>
              <Input
                id="firmSignatoryName"
                value={formData.firmSignatoryName}
                onChange={(e) => updateField("firmSignatoryName", e.target.value)}
                placeholder="Full name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="firmSignatoryJobTitle">Job Title *</Label>
            <Input
              id="firmSignatoryJobTitle"
              value={formData.firmSignatoryJobTitle}
              onChange={(e) => updateField("firmSignatoryJobTitle", e.target.value)}
              placeholder="Position at firm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firmSignature">Signature (type full name) *</Label>
              <Input
                id="firmSignature"
                value={formData.firmSignature}
                onChange={(e) => updateField("firmSignature", e.target.value)}
                placeholder="Type your full legal name as signature"
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
              <p className="text-xs text-slate-500 mt-1">Must not be more than 3 months before submission</p>
            </div>
          </div>
        </div>

        <SectionInfo title="Next Steps" variant="success">
          <p>Once complete, export this form and use it as a reference when submitting via FCA Connect.</p>
          <p className="mt-1">If the PSD Individual Form is part of a new application for registration or authorisation as a Payment Institution, it should be attached to your application in Connect.</p>
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
