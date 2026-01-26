"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Download, FileCheck } from "lucide-react";
import { PersonRecord } from "../../context/SmcrDataContext";

interface DBSFormData {
  checkLevel: "basic" | "standard" | "enhanced";
  workforceType: "child" | "adult" | "other";
  provider: string;
  referenceNumber: string;
  requestDate: string;
  additionalNotes: string;
}

const initialFormData: DBSFormData = {
  checkLevel: "basic",
  workforceType: "adult",
  provider: "",
  referenceNumber: "",
  requestDate: format(new Date(), "yyyy-MM-dd"),
  additionalNotes: "",
};

interface DBSRequestGeneratorProps {
  person: PersonRecord;
  firmName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DBSRequestGenerator({ person, firmName, open, onOpenChange }: DBSRequestGeneratorProps) {
  const [formData, setFormData] = useState<DBSFormData>(initialFormData);

  const generateLetter = () => {
    const checkLevelLabels = {
      basic: "Basic DBS Check",
      standard: "Standard DBS Check",
      enhanced: "Enhanced DBS Check",
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DBS Check Request - ${person.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 700px; margin: 0 auto; padding: 50px; color: #1e293b; line-height: 1.8; }
    .header { text-align: center; border-bottom: 2px solid #14b8a6; padding-bottom: 30px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; color: #0f172a; }
    .header p { margin: 5px 0; color: #64748b; font-size: 14px; }
    .logo { font-size: 28px; font-weight: bold; color: #14b8a6; margin-bottom: 10px; }
    .date { text-align: right; margin-bottom: 30px; color: #64748b; }
    h2 { color: #0f172a; font-size: 18px; margin-top: 30px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; margin-bottom: 10px; }
    .info-label { width: 180px; font-weight: 600; color: #475569; }
    .info-value { color: #0f172a; }
    .highlight { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 15px; margin: 20px 0; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    .signature { margin-top: 50px; }
    .signature-line { border-top: 1px solid #94a3b8; width: 250px; margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Nasara Connect</div>
    <h1>DBS Check Request Form</h1>
    <p>${checkLevelLabels[formData.checkLevel]}</p>
  </div>

  <div class="date">
    Date: ${format(new Date(formData.requestDate), "PPP")}
  </div>

  <h2>Subject Information</h2>
  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Full Name:</span>
      <span class="info-value">${person.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Employee ID:</span>
      <span class="info-value">${person.employeeId}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span class="info-value">${person.email}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Department:</span>
      <span class="info-value">${person.department}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Job Title:</span>
      <span class="info-value">${person.title || "Not specified"}</span>
    </div>
  </div>

  <h2>Check Details</h2>
  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Check Level:</span>
      <span class="info-value">${checkLevelLabels[formData.checkLevel]}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Workforce Type:</span>
      <span class="info-value">${formData.workforceType === "child" ? "Child Workforce" : formData.workforceType === "adult" ? "Adult Workforce" : "Other"}</span>
    </div>
    ${formData.provider ? `
    <div class="info-row">
      <span class="info-label">Provider:</span>
      <span class="info-value">${formData.provider}</span>
    </div>
    ` : ""}
    ${formData.referenceNumber ? `
    <div class="info-row">
      <span class="info-label">Reference Number:</span>
      <span class="info-value">${formData.referenceNumber}</span>
    </div>
    ` : ""}
  </div>

  <div class="highlight">
    <strong>Requesting Organization:</strong> ${firmName}<br>
    <strong>Request Date:</strong> ${format(new Date(formData.requestDate), "PPP")}
  </div>

  ${formData.additionalNotes ? `
  <h2>Additional Notes</h2>
  <p>${formData.additionalNotes}</p>
  ` : ""}

  <p style="margin-top: 30px;">
    This DBS check is requested in accordance with the SM&CR regime requirements for
    individuals performing Senior Management Functions (SMF) or Certification Functions (CF).
  </p>

  <div class="signature">
    <p><strong>Authorized By:</strong></p>
    <div class="signature-line"></div>
    <p style="margin-top: 10px; color: #64748b; font-size: 14px;">
      Name: ________________________________<br>
      Title: ________________________________<br>
      Date: ________________________________
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-600" />
            DBS Check Request
          </DialogTitle>
          <DialogDescription>
            Generate a DBS check request form for {person.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Name:</span>
                <span className="ml-2 font-medium">{person.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Employee ID:</span>
                <span className="ml-2 font-medium">{person.employeeId}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Check Level *</Label>
              <Select
                value={formData.checkLevel}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, checkLevel: value as DBSFormData["checkLevel"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic DBS Check</SelectItem>
                  <SelectItem value="standard">Standard DBS Check</SelectItem>
                  <SelectItem value="enhanced">Enhanced DBS Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Workforce Type *</Label>
              <Select
                value={formData.workforceType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workforceType: value as DBSFormData["workforceType"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adult Workforce</SelectItem>
                  <SelectItem value="child">Child Workforce</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DBS Provider</Label>
              <Input
                value={formData.provider}
                onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
                placeholder="e.g. Disclosure Scotland"
              />
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input
                value={formData.referenceNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                placeholder="Internal reference"
              />
            </div>
          </div>

          <div>
            <Label>Request Date</Label>
            <Input
              type="date"
              value={formData.requestDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, requestDate: e.target.value }))}
            />
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional information or context..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={generateLetter} className="bg-teal-600 hover:bg-teal-700">
            <Download className="h-4 w-4 mr-2" />
            Generate Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
