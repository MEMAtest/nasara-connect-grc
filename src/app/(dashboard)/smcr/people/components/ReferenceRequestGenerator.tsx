"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Download, Building2 } from "lucide-react";
import { PersonRecord } from "../../context/SmcrDataContext";

interface ReferenceFormData {
  previousEmployer: string;
  employerAddress: string;
  employerContact: string;
  employerEmail: string;
  roleAtEmployer: string;
  employmentStartDate: string;
  employmentEndDate: string;
  reasonForLeaving: string;
  referenceType: "standard" | "regulatory" | "character";
  additionalQuestions: string;
  urgency: "standard" | "urgent";
}

const initialFormData: ReferenceFormData = {
  previousEmployer: "",
  employerAddress: "",
  employerContact: "",
  employerEmail: "",
  roleAtEmployer: "",
  employmentStartDate: "",
  employmentEndDate: "",
  reasonForLeaving: "",
  referenceType: "regulatory",
  additionalQuestions: "",
  urgency: "standard",
};

interface ReferenceRequestGeneratorProps {
  person: PersonRecord;
  firmName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferenceRequestGenerator({ person, firmName, open, onOpenChange }: ReferenceRequestGeneratorProps) {
  const [formData, setFormData] = useState<ReferenceFormData>(initialFormData);

  const generateLetter = () => {
    const referenceTypeLabels = {
      standard: "Standard Employment Reference",
      regulatory: "Regulatory Reference (FCA)",
      character: "Character Reference",
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reference Request - ${person.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 700px; margin: 0 auto; padding: 50px; color: #1e293b; line-height: 1.8; }
    .header { text-align: center; border-bottom: 2px solid #14b8a6; padding-bottom: 30px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; color: #0f172a; }
    .header p { margin: 5px 0; color: #64748b; font-size: 14px; }
    .logo { font-size: 28px; font-weight: bold; color: #14b8a6; margin-bottom: 10px; }
    .date { text-align: right; margin-bottom: 20px; color: #64748b; }
    .recipient { margin-bottom: 30px; }
    .recipient p { margin: 3px 0; }
    .subject { font-weight: bold; margin: 30px 0 20px 0; text-decoration: underline; }
    .body-text { margin-bottom: 15px; text-align: justify; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { width: 180px; font-weight: 600; color: #475569; }
    .info-value { color: #0f172a; }
    .highlight { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 15px; margin: 20px 0; }
    .questions { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .questions h3 { margin: 0 0 15px 0; color: #166534; font-size: 14px; }
    .questions ol { margin: 0; padding-left: 20px; }
    .questions li { margin-bottom: 10px; font-size: 14px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    .signature { margin-top: 40px; }
    .signature-line { border-top: 1px solid #94a3b8; width: 250px; margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Nasara Connect</div>
    <h1>Reference Request</h1>
    <p>${referenceTypeLabels[formData.referenceType]}</p>
  </div>

  <div class="date">
    Date: ${format(new Date(), "PPP")}
  </div>

  <div class="recipient">
    ${formData.employerContact ? `<p><strong>${formData.employerContact}</strong></p>` : ""}
    <p>${formData.previousEmployer}</p>
    ${formData.employerAddress ? `<p>${formData.employerAddress.replace(/\n/g, "<br>")}</p>` : ""}
    ${formData.employerEmail ? `<p>${formData.employerEmail}</p>` : ""}
  </div>

  <p class="subject">Re: Reference Request for ${person.name}</p>

  <p class="body-text">Dear ${formData.employerContact || "Sir/Madam"},</p>

  <p class="body-text">
    I am writing to request a ${formData.referenceType === "regulatory" ? "regulatory " : ""}reference for the above-named individual
    who has applied for a position with ${firmName}. ${formData.referenceType === "regulatory" ?
    "As a firm authorised by the Financial Conduct Authority, we are required to obtain regulatory references for individuals who will be performing controlled functions." : ""}
  </p>

  <p class="body-text">
    We understand that ${person.name} was employed by your organisation in the following capacity:
  </p>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Position Held:</span>
      <span class="info-value">${formData.roleAtEmployer || "Not specified"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Employment Period:</span>
      <span class="info-value">${formData.employmentStartDate || "N/A"} - ${formData.employmentEndDate || "N/A"}</span>
    </div>
    ${formData.reasonForLeaving ? `
    <div class="info-row">
      <span class="info-label">Reason for Leaving:</span>
      <span class="info-value">${formData.reasonForLeaving}</span>
    </div>
    ` : ""}
  </div>

  ${formData.referenceType === "regulatory" ? `
  <div class="highlight">
    <strong>Regulatory Reference Requirements</strong><br>
    Under FCA rules (SYSC 22), we are required to request specific information about the individual's fitness and propriety,
    including any disciplinary actions, performance concerns, or conduct issues during their employment with you.
  </div>
  ` : ""}

  <div class="questions">
    <h3>Please provide information on the following:</h3>
    <ol>
      <li>Confirmation of the dates of employment and job title(s) held</li>
      <li>A summary of the individual's main duties and responsibilities</li>
      ${formData.referenceType === "regulatory" ? `
      <li>Whether the individual performed any FCA controlled functions or other regulatory roles</li>
      <li>Details of any disciplinary action taken against the individual</li>
      <li>Details of any performance issues or concerns raised</li>
      <li>Whether you are aware of any circumstances that might affect their fitness and propriety</li>
      <li>Whether the individual left following resignation, redundancy, or dismissal</li>
      ` : `
      <li>Your assessment of the individual's performance and conduct</li>
      <li>Whether you would re-employ this individual</li>
      `}
      ${formData.additionalQuestions ? `<li>${formData.additionalQuestions.replace(/\n/g, "</li><li>")}</li>` : ""}
    </ol>
  </div>

  <p class="body-text">
    ${formData.urgency === "urgent" ?
    "<strong>URGENT:</strong> We would be grateful if you could respond within 5 working days as we need to complete our due diligence process promptly." :
    "We would be grateful if you could respond within 10 working days."}
  </p>

  <p class="body-text">
    Please send your response to the address shown on this letterhead, or email to the contact below.
    If you have any questions regarding this request, please do not hesitate to contact us.
  </p>

  <p class="body-text">
    Thank you for your assistance in this matter.
  </p>

  <div class="signature">
    <p>Yours ${formData.employerContact ? "sincerely" : "faithfully"},</p>
    <div class="signature-line"></div>
    <p style="margin-top: 10px; color: #64748b; font-size: 14px;">
      Name: ________________________________<br>
      Title: ________________________________<br>
      ${firmName}<br>
      Date: ${format(new Date(), "PPP")}
    </p>
  </div>

  <div class="footer">
    Generated via Nasara Connect on ${format(new Date(), "PPPpp")}
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      window.alert("Unable to open window. Please allow pop-ups.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal-600" />
            Reference Request Generator
          </DialogTitle>
          <DialogDescription>
            Generate a reference request letter for {person.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Candidate:</span>
                <span className="ml-2 font-medium">{person.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Requesting Firm:</span>
                <span className="ml-2 font-medium">{firmName}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Reference Type *</Label>
              <Select
                value={formData.referenceType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, referenceType: value as ReferenceFormData["referenceType"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulatory">Regulatory Reference (FCA)</SelectItem>
                  <SelectItem value="standard">Standard Employment Reference</SelectItem>
                  <SelectItem value="character">Character Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urgency</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, urgency: value as ReferenceFormData["urgency"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (10 working days)</SelectItem>
                  <SelectItem value="urgent">Urgent (5 working days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <h3 className="font-medium text-slate-900">Previous Employer Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.previousEmployer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, previousEmployer: e.target.value }))}
                    placeholder="e.g. ABC Financial Services Ltd"
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={formData.employerContact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employerContact: e.target.value }))}
                    placeholder="e.g. HR Manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.employerEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employerEmail: e.target.value }))}
                    placeholder="hr@company.com"
                  />
                </div>
                <div>
                  <Label>Role Held</Label>
                  <Input
                    value={formData.roleAtEmployer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, roleAtEmployer: e.target.value }))}
                    placeholder="e.g. Compliance Officer"
                  />
                </div>
              </div>

              <div>
                <Label>Company Address</Label>
                <Textarea
                  value={formData.employerAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, employerAddress: e.target.value }))}
                  placeholder="Full postal address..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employment Start</Label>
                  <Input
                    value={formData.employmentStartDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employmentStartDate: e.target.value }))}
                    placeholder="e.g. January 2018"
                  />
                </div>
                <div>
                  <Label>Employment End</Label>
                  <Input
                    value={formData.employmentEndDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employmentEndDate: e.target.value }))}
                    placeholder="e.g. December 2022"
                  />
                </div>
              </div>

              <div>
                <Label>Reason for Leaving</Label>
                <Input
                  value={formData.reasonForLeaving}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reasonForLeaving: e.target.value }))}
                  placeholder="e.g. Career progression"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Additional Questions</Label>
            <Textarea
              value={formData.additionalQuestions}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalQuestions: e.target.value }))}
              placeholder="Any additional questions to include in the reference request (one per line)..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={generateLetter}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={!formData.previousEmployer}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Letter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
