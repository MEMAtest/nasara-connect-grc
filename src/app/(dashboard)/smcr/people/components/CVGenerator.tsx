"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Download, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { PersonRecord } from "../../context/SmcrDataContext";

interface EmploymentEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface QualificationEntry {
  id: string;
  name: string;
  institution: string;
  year: string;
}

interface CVFormData {
  summary: string;
  employmentHistory: EmploymentEntry[];
  qualifications: QualificationEntry[];
  achievements: string;
  memberships: string;
}

const initialFormData: CVFormData = {
  summary: "",
  employmentHistory: [],
  qualifications: [],
  achievements: "",
  memberships: "",
};

interface CVGeneratorProps {
  person: PersonRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CVGenerator({ person, open, onOpenChange }: CVGeneratorProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CVFormData>(initialFormData);

  const addEmployment = () => {
    setFormData((prev) => ({
      ...prev,
      employmentHistory: [
        ...prev.employmentHistory,
        {
          id: crypto.randomUUID(),
          company: "",
          title: "",
          startDate: "",
          endDate: "",
          responsibilities: "",
        },
      ],
    }));
  };

  const updateEmployment = (id: string, updates: Partial<EmploymentEntry>) => {
    setFormData((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  };

  const removeEmployment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.filter((entry) => entry.id !== id),
    }));
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          id: crypto.randomUUID(),
          name: "",
          institution: "",
          year: "",
        },
      ],
    }));
  };

  const updateQualification = (id: string, updates: Partial<QualificationEntry>) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  };

  const removeQualification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((entry) => entry.id !== id),
    }));
  };

  const generateCV = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CV - ${person.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; line-height: 1.6; }
    .header { border-bottom: 3px solid #14b8a6; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 32px; color: #0f172a; }
    .header p { margin: 5px 0; color: #64748b; }
    .contact { display: flex; gap: 20px; margin-top: 10px; font-size: 14px; }
    h2 { color: #14b8a6; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; }
    .employment-entry { margin-bottom: 20px; }
    .employment-entry h3 { margin: 0; font-size: 16px; color: #0f172a; }
    .employment-entry .meta { color: #64748b; font-size: 14px; margin: 5px 0; }
    .employment-entry p { margin: 10px 0; font-size: 14px; }
    .qualification { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .qualification:last-child { border-bottom: none; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${person.name}</h1>
    <p>${person.title || "Professional"}</p>
    <div class="contact">
      <span>${person.email}</span>
      ${person.phone ? `<span>${person.phone}</span>` : ""}
    </div>
  </div>

  ${formData.summary ? `
  <h2>Professional Summary</h2>
  <p>${formData.summary}</p>
  ` : ""}

  ${formData.employmentHistory.length > 0 ? `
  <h2>Employment History</h2>
  ${formData.employmentHistory.map((entry) => `
  <div class="employment-entry">
    <h3>${entry.title}</h3>
    <div class="meta">${entry.company} | ${entry.startDate} - ${entry.endDate || "Present"}</div>
    ${entry.responsibilities ? `<p>${entry.responsibilities}</p>` : ""}
  </div>
  `).join("")}
  ` : ""}

  ${formData.qualifications.length > 0 ? `
  <h2>Qualifications & Education</h2>
  ${formData.qualifications.map((qual) => `
  <div class="qualification">
    <div>
      <strong>${qual.name}</strong><br>
      <span style="color: #64748b; font-size: 14px;">${qual.institution}</span>
    </div>
    <span style="color: #64748b;">${qual.year}</span>
  </div>
  `).join("")}
  ` : ""}

  ${formData.achievements ? `
  <h2>Key Achievements</h2>
  <p>${formData.achievements}</p>
  ` : ""}

  ${formData.memberships ? `
  <h2>Professional Memberships</h2>
  <p>${formData.memberships}</p>
  ` : ""}

  <div class="footer">
    Generated via Nasara Connect on ${format(new Date(), "PPP")}
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

  const resetAndClose = () => {
    setStep(1);
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            CV Generator
          </DialogTitle>
          <DialogDescription>
            Create a professional CV for {person.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step > s
                    ? "bg-teal-500 text-white"
                    : step === s
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`h-0.5 w-12 ${step > s ? "bg-teal-500" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Professional Summary</h3>
              <Textarea
                placeholder="Brief summary of your professional background, skills, and career objectives..."
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                rows={4}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Employment History</h3>
                <Button variant="outline" size="sm" onClick={addEmployment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Position
                </Button>
              </div>

              {formData.employmentHistory.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No employment history added yet. Click "Add Position" to begin.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.employmentHistory.map((entry, index) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Position {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEmployment(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-slate-400" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Job Title</Label>
                            <Input
                              value={entry.title}
                              onChange={(e) => updateEmployment(entry.id, { title: e.target.value })}
                              placeholder="e.g. Senior Compliance Officer"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={entry.company}
                              onChange={(e) => updateEmployment(entry.id, { company: e.target.value })}
                              placeholder="e.g. ABC Financial Ltd"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              value={entry.startDate}
                              onChange={(e) => updateEmployment(entry.id, { startDate: e.target.value })}
                              placeholder="e.g. Jan 2020"
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              value={entry.endDate}
                              onChange={(e) => updateEmployment(entry.id, { endDate: e.target.value })}
                              placeholder="e.g. Present"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Key Responsibilities</Label>
                          <Textarea
                            value={entry.responsibilities}
                            onChange={(e) => updateEmployment(entry.id, { responsibilities: e.target.value })}
                            placeholder="Describe key responsibilities and achievements..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Qualifications & Education</h3>
                <Button variant="outline" size="sm" onClick={addQualification}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Qualification
                </Button>
              </div>

              {formData.qualifications.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No qualifications added yet. Click "Add Qualification" to begin.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.qualifications.map((qual) => (
                    <div key={qual.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <Input
                          value={qual.name}
                          onChange={(e) => updateQualification(qual.id, { name: e.target.value })}
                          placeholder="Qualification name"
                        />
                        <Input
                          value={qual.institution}
                          onChange={(e) => updateQualification(qual.id, { institution: e.target.value })}
                          placeholder="Institution"
                        />
                        <Input
                          value={qual.year}
                          onChange={(e) => updateQualification(qual.id, { year: e.target.value })}
                          placeholder="Year"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQualification(qual.id)}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Additional Information</h3>

              <div>
                <Label>Key Achievements</Label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, achievements: e.target.value }))}
                  placeholder="Notable achievements, awards, or recognitions..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Professional Memberships</Label>
                <Textarea
                  value={formData.memberships}
                  onChange={(e) => setFormData((prev) => ({ ...prev, memberships: e.target.value }))}
                  placeholder="Professional bodies, associations, or memberships..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={generateCV} className="bg-teal-600 hover:bg-teal-700">
              <Download className="h-4 w-4 mr-2" />
              Generate CV
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
