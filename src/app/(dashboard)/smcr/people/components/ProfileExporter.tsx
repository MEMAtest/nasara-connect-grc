"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import {
  PersonRecord,
  DocumentMetadata,
  RoleAssignment,
  FitnessAssessmentRecord,
  Firm,
} from "../../context/SmcrDataContext";

interface ProfileExporterProps {
  person: PersonRecord;
  firm: Firm | undefined;
  roles: RoleAssignment[];
  documents: DocumentMetadata[];
  assessments: FitnessAssessmentRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const documentCategoryLabels: Record<string, string> = {
  cv: "CV / Resume",
  dbs: "DBS / Background Check",
  reference: "References",
  qualification: "Qualifications",
  id: "ID Verification",
  other: "Other Documents",
};

// HTML escape function to prevent XSS attacks
function escapeHtml(unsafe: string | undefined | null): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ProfileExporter({
  person,
  firm,
  roles,
  documents,
  assessments,
  open,
  onOpenChange,
}: ProfileExporterProps) {
  const generateProfile = () => {
    const trainingCompleted = person.trainingPlan.filter((t) => t.status === "completed").length;
    const trainingTotal = person.trainingPlan.length;
    const trainingPercent = trainingTotal > 0 ? Math.round((trainingCompleted / trainingTotal) * 100) : 0;

    const sortedAssessments = [...assessments].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const documentsByCategory = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    }, {} as Record<string, DocumentMetadata[]>);

    const statusColors = {
      current: "#059669",
      due: "#d97706",
      overdue: "#dc2626",
      not_required: "#64748b",
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SM&CR Profile - ${person.name}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      line-height: 1.6;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 3px solid #14b8a6;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #14b8a6;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #0f172a;
    }
    .header-right {
      text-align: right;
    }
    .header-right .firm-name {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .header-right .date {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .profile-hero {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .avatar-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }
    .profile-details {
      flex: 1;
    }
    .profile-details h1 {
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
    }
    .profile-details .title {
      font-size: 16px;
      color: #475569;
      margin-bottom: 12px;
    }
    .profile-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
      color: #64748b;
    }
    .profile-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: ${statusColors[person.assessment.status] || statusColors.not_required}15;
      color: ${statusColors[person.assessment.status] || statusColors.not_required};
      border: 1px solid ${statusColors[person.assessment.status] || statusColors.not_required}30;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .section-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .section-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    .icon-teal { background: #14b8a620; color: #0d9488; }
    .icon-amber { background: #f59e0b20; color: #d97706; }
    .icon-blue { background: #3b82f620; color: #2563eb; }
    .icon-purple { background: #8b5cf620; color: #7c3aed; }
    .icon-green { background: #22c55e20; color: #16a34a; }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .info-card {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-card .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .info-card .value {
      font-size: 14px;
      font-weight: 500;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 10px 12px;
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
    .badge-teal { background: #14b8a620; color: #0d9488; }
    .badge-amber { background: #f59e0b20; color: #d97706; }
    .badge-green { background: #22c55e20; color: #16a34a; }
    .badge-red { background: #ef444420; color: #dc2626; }
    .badge-slate { background: #64748b20; color: #475569; }
    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #14b8a6, #0d9488);
      border-radius: 4px;
    }
    .checklist {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .checklist-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    .checklist-icon.complete { background: #22c55e20; color: #16a34a; }
    .checklist-icon.missing { background: #ef444420; color: #dc2626; }
    .checklist-text {
      font-size: 12px;
    }
    .checklist-text .category { font-weight: 600; color: #0f172a; }
    .checklist-text .count { color: #64748b; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .footer-logo {
      font-weight: 600;
      color: #14b8a6;
    }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Nasara<span>Connect</span></div>
    <div class="header-right">
      ${firm ? `<div class="firm-name">${escapeHtml(firm.name)}</div>` : ""}
      <div class="date">Generated ${format(new Date(), "PPP 'at' HH:mm")}</div>
    </div>
  </div>

  <div class="profile-hero">
    <div class="avatar-placeholder">${escapeHtml(person.name.split(" ").map((n) => n[0]).join("").substring(0, 2))}</div>
    <div class="profile-details">
      <h1>${escapeHtml(person.name)}</h1>
      <div class="title">${escapeHtml(person.title) || "Role not specified"} · ${escapeHtml(person.department)}</div>
      <div class="profile-meta">
        <span>📧 ${escapeHtml(person.email)}</span>
        ${person.phone ? `<span>📞 ${escapeHtml(person.phone)}</span>` : ""}
        <span>🆔 ${escapeHtml(person.employeeId)}</span>
        <span class="status-badge">F&amp;P: ${escapeHtml(person.assessment.status.replace("_", " "))}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon icon-teal">📋</div>
      <h2>Employment Details</h2>
    </div>
    <div class="grid-2">
      <div class="info-card">
        <div class="label">Line Manager</div>
        <div class="value">${escapeHtml(person.lineManager) || "Not specified"}</div>
      </div>
      <div class="info-card">
        <div class="label">Department</div>
        <div class="value">${escapeHtml(person.department)}</div>
      </div>
      <div class="info-card">
        <div class="label">Role Start Date</div>
        <div class="value">${person.startDate ? format(new Date(person.startDate), "PPP") : "Not recorded"}</div>
      </div>
      <div class="info-card">
        <div class="label">Employment Start Date</div>
        <div class="value">${person.hireDate ? format(new Date(person.hireDate), "PPP") : "Not recorded"}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon icon-amber">🛡️</div>
      <h2>SM&CR Roles (${roles.length})</h2>
    </div>
    ${roles.length === 0
      ? `<p style="color: #64748b; font-size: 13px;">No SMF or CF roles currently assigned.</p>`
      : `<table>
        <thead>
          <tr>
            <th>Function</th>
            <th>Type</th>
            <th>Entity</th>
            <th>Start Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${roles.map((role) => `
          <tr>
            <td><strong>${escapeHtml(role.functionLabel)}</strong></td>
            <td><span class="badge badge-teal">${escapeHtml(role.functionType)}</span></td>
            <td>${escapeHtml(role.entity) || "—"}</td>
            <td>${role.startDate ? format(new Date(role.startDate), "PP") : "—"}</td>
            <td><span class="badge ${role.approvalStatus === "approved" ? "badge-green" : role.approvalStatus === "rejected" ? "badge-red" : "badge-amber"}">${escapeHtml(role.approvalStatus)}</span></td>
          </tr>
          `).join("")}
        </tbody>
      </table>`
    }
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon icon-blue">🎓</div>
      <h2>Training Progress</h2>
    </div>
    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="info-card">
        <div class="label">Completion Rate</div>
        <div class="value">${trainingPercent}% (${trainingCompleted}/${trainingTotal} modules)</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${trainingPercent}%"></div>
        </div>
      </div>
      <div class="info-card">
        <div class="label">Assessment Status</div>
        <div class="value">
          Last: ${person.assessment.lastAssessment ? format(new Date(person.assessment.lastAssessment), "PP") : "Never"}<br>
          Next: ${person.assessment.nextAssessment ? format(new Date(person.assessment.nextAssessment), "PP") : "Not scheduled"}
        </div>
      </div>
    </div>
    ${person.trainingPlan.length > 0
      ? `<table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Role Context</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${person.trainingPlan.map((item) => `
          <tr>
            <td>${escapeHtml(item.title)}${item.required ? ' <span class="badge badge-red">Required</span>' : ""}</td>
            <td>${escapeHtml(item.roleContext)}</td>
            <td>${item.dueDate ? format(new Date(item.dueDate), "PP") : "—"}</td>
            <td><span class="badge ${item.status === "completed" ? "badge-green" : item.status === "in_progress" ? "badge-amber" : "badge-slate"}">${escapeHtml(item.status.replace("_", " "))}</span></td>
          </tr>
          `).join("")}
        </tbody>
      </table>`
      : `<p style="color: #64748b; font-size: 13px;">No training modules assigned.</p>`
    }
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon icon-purple">✅</div>
      <h2>Fitness & Propriety Assessments (${sortedAssessments.length})</h2>
    </div>
    ${sortedAssessments.length === 0
      ? `<p style="color: #64748b; font-size: 13px;">No F&P assessments on record.</p>`
      : `<table>
        <thead>
          <tr>
            <th>Assessment Date</th>
            <th>Status</th>
            <th>Determination</th>
            <th>Reviewer</th>
          </tr>
        </thead>
        <tbody>
          ${sortedAssessments.slice(0, 5).map((assessment) => `
          <tr>
            <td>${assessment.assessmentDate ? format(new Date(assessment.assessmentDate), "PPP") : "—"}</td>
            <td><span class="badge ${assessment.status === "completed" ? "badge-green" : assessment.status === "in_review" ? "badge-amber" : "badge-slate"}">${escapeHtml(assessment.status)}</span></td>
            <td>${escapeHtml(assessment.overallDetermination) || "Pending"}</td>
            <td>${escapeHtml(assessment.reviewer) || "—"}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>`
    }
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon icon-green">📁</div>
      <h2>Document Checklist</h2>
    </div>
    <div class="checklist">
      ${["cv", "dbs", "reference", "qualification", "id", "other"].map((category) => {
        const docs = documentsByCategory[category] || [];
        const hasDoc = docs.length > 0;
        return `
        <div class="checklist-item">
          <div class="checklist-icon ${hasDoc ? "complete" : "missing"}">${hasDoc ? "✓" : "✗"}</div>
          <div class="checklist-text">
            <div class="category">${documentCategoryLabels[category]}</div>
            <div class="count">${hasDoc ? `${docs.length} file(s)` : "Missing"}</div>
          </div>
        </div>
        `;
      }).join("")}
    </div>
  </div>

  ${documents.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-icon icon-teal">📄</div>
      <h2>Uploaded Documents (${documents.length})</h2>
    </div>
    <table>
      <thead>
        <tr>
          <th>Document Name</th>
          <th>Category</th>
          <th>Uploaded</th>
        </tr>
      </thead>
      <tbody>
        ${documents.map((doc) => `
        <tr>
          <td>${escapeHtml(doc.name)}</td>
          <td><span class="badge badge-slate">${escapeHtml(documentCategoryLabels[doc.category])}</span></td>
          <td>${doc.uploadedAt ? format(new Date(doc.uploadedAt), "PP") : "—"}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
  ` : ""}

  <div class="footer">
    <div class="footer-logo">NasaraConnect</div>
    <div>SM&amp;CR Profile • ${escapeHtml(person.employeeId)} • Page 1 of 1</div>
    <div>Confidential</div>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=960,height=800");
    if (!printWindow) {
      window.alert("Unable to open export window. Please allow pop-ups for this site.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Close window after printing to prevent memory leak
    printWindow.onafterprint = () => printWindow.close();
    printWindow.print();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Export Profile
          </DialogTitle>
          <DialogDescription>
            Generate a branded PDF profile for {person.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-lg font-semibold">
                {person.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
              </div>
              <div>
                <div className="font-medium text-slate-900">{person.name}</div>
                <div className="text-sm text-slate-500">{person.employeeId}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700">Profile includes:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span>Employment Details</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span>SM&CR Roles ({roles.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span>Training Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span>F&P Assessments ({assessments.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span>Document Checklist</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span>Uploaded Files ({documents.length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={generateProfile} className="bg-teal-600 hover:bg-teal-700">
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
