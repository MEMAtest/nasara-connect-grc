import { format } from "date-fns";
import type { FormAState, FormCState } from '../types/form-types';
import { prescribedResponsibilitiesList, reasonCategories, controlledFunctions } from './form-constants';

// HTML escape function to prevent XSS
export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Sanitize filename for export
export const sanitizeFilename = (name: string): string => {
  if (!name) return 'Application';
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-')                   // Replace spaces with dashes
    .substring(0, 50)                       // Limit length
    .trim() || 'Application';
};

export const generateFormHTML = (data: FormAState): string => {
  // Escape all user-provided data to prevent XSS
  const e = escapeHtml;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FCA Form A - ${e(data.forenames)} ${e(data.surname)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; font-size: 11px; line-height: 1.4; color: #333; }
    h1 { font-size: 18px; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
    h2 { font-size: 13px; background: #f0f0f0; padding: 8px 12px; margin: 25px 0 15px; border-left: 4px solid #0055b8; }
    h3 { font-size: 11px; margin: 15px 0 10px; color: #0055b8; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 20px; }
    .field { margin: 8px 0; display: flex; align-items: flex-start; }
    .field label { width: 200px; font-weight: bold; flex-shrink: 0; padding-top: 2px; }
    .field .value { flex: 1; border-bottom: 1px solid #ccc; min-height: 18px; padding: 2px 4px; background: #fafafa; }
    .field .value.multi { min-height: 60px; white-space: pre-wrap; }
    .checkbox-field { margin: 6px 0; display: flex; align-items: center; gap: 8px; }
    .checkbox { width: 14px; height: 14px; border: 1px solid #333; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
    .checkbox.checked { background: #0055b8; color: white; }
    .section-box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; background: #fafafa; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 15px 0; }
    .info { background: #e7f3ff; border: 1px solid #0055b8; padding: 12px; margin: 15px 0; }
    .employment-entry, .directorship-entry { border: 1px solid #ddd; padding: 12px; margin: 10px 0; background: white; }
    .signature-box { border: 2px solid #333; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; text-align: center; }
    .page-break { page-break-before: always; }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>FCA FORM A</h1>
  <p class="subtitle">Application to perform Senior Management Functions / Controlled Functions</p>
  <p class="subtitle">Financial Conduct Authority | Prudential Regulation Authority</p>

  <div class="info">
    <strong>Application Reference:</strong> ${e(data.firmFRN)}-${format(new Date(), "yyyyMMdd")}<br>
    <strong>Generated:</strong> ${format(new Date(), "PPP 'at' p")}
  </div>

  <h2>Section 1: Firm Details</h2>
  <div class="field"><label>Firm Name:</label><span class="value">${e(data.firmName)}</span></div>
  <div class="field"><label>FRN:</label><span class="value">${e(data.firmFRN)}</span></div>
  <div class="field"><label>Firm Address:</label><span class="value">${e(data.firmAddress)}</span></div>
  <h3>Submitter Details</h3>
  <div class="field"><label>Submitter Name:</label><span class="value">${e(data.submitterName)}</span></div>
  <div class="field"><label>Position:</label><span class="value">${e(data.submitterPosition)}</span></div>
  <div class="field"><label>Email:</label><span class="value">${e(data.submitterEmail)}</span></div>
  <div class="field"><label>Phone:</label><span class="value">${e(data.submitterPhone)}</span></div>

  <h2>Section 2: Candidate Personal Details</h2>
  <div class="field"><label>Title:</label><span class="value">${e(data.title)}</span></div>
  <div class="field"><label>Surname:</label><span class="value">${e(data.surname)}</span></div>
  <div class="field"><label>Forename(s):</label><span class="value">${e(data.forenames)}</span></div>
  <div class="field"><label>Previous Names:</label><span class="value">${e(data.previousNames) || "None"}</span></div>
  <div class="field"><label>Date of Birth:</label><span class="value">${e(data.dateOfBirth)}</span></div>
  <div class="field"><label>Town of Birth:</label><span class="value">${e(data.townOfBirth)}</span></div>
  <div class="field"><label>Country of Birth:</label><span class="value">${e(data.countryOfBirth)}</span></div>
  <div class="field"><label>Nationality:</label><span class="value">${e(data.nationality)}</span></div>
  <div class="field"><label>National Insurance No:</label><span class="value">${e(data.nationalInsurance)}</span></div>
  <div class="checkbox-field"><span class="checkbox ${data.hasRightToWork ? "checked" : ""}">${data.hasRightToWork ? "✓" : ""}</span> Confirmed right to work in UK</div>
  ${data.rightToWorkDetails ? `<div class="field"><label>Right to Work Details:</label><span class="value">${e(data.rightToWorkDetails)}</span></div>` : ""}

  <h2>Section 3: Contact Details</h2>
  <div class="field"><label>Home Address:</label><span class="value">${e(data.homeAddress)}</span></div>
  <div class="field"><label>Postcode:</label><span class="value">${e(data.homePostcode)}</span></div>
  <div class="field"><label>Country:</label><span class="value">${e(data.homeCountry)}</span></div>
  ${data.correspondenceAddress ? `<div class="field"><label>Correspondence Address:</label><span class="value">${e(data.correspondenceAddress)}</span></div>` : ""}
  <div class="field"><label>Personal Email:</label><span class="value">${e(data.personalEmail)}</span></div>
  <div class="field"><label>Personal Phone:</label><span class="value">${e(data.personalPhone)}</span></div>
  <div class="field"><label>Work Email:</label><span class="value">${e(data.workEmail)}</span></div>
  <div class="field"><label>Work Phone:</label><span class="value">${e(data.workPhone)}</span></div>

  <h2>Section 4: Function Applied For</h2>
  <div class="field"><label>Controlled Function:</label><span class="value">${e(data.functionApplied)}</span></div>
  <div class="field"><label>Proposed Start Date:</label><span class="value">${e(data.effectiveDate)}</span></div>
  <div class="field"><label>Job Title:</label><span class="value">${e(data.jobTitle)}</span></div>
  <div class="field"><label>Arrangement Type:</label><span class="value">${e(data.arrangementType)}</span></div>
  <div class="field"><label>Time Commitment:</label><span class="value">${e(data.timeCommitment)}</span></div>
  <div class="field"><label>Hours per Week:</label><span class="value">${e(data.hoursPerWeek)}</span></div>
  <div class="field"><label>Reports To:</label><span class="value">${e(data.reportingTo)}</span></div>
  <div class="field"><label>Direct Reports:</label><span class="value">${e(data.directReports)}</span></div>

  <div class="page-break"></div>
  <h2>Section 5: Employment History (10 Years)</h2>
  ${data.employmentHistory.map((emp, i) => `
    <div class="employment-entry">
      <h3>Employment ${i + 1}</h3>
      <div class="field"><label>Employer:</label><span class="value">${e(emp.employer)}</span></div>
      <div class="field"><label>Job Title:</label><span class="value">${e(emp.jobTitle)}</span></div>
      <div class="field"><label>Start Date:</label><span class="value">${e(emp.startDate)}</span></div>
      <div class="field"><label>End Date:</label><span class="value">${e(emp.endDate) || "Present"}</span></div>
      <div class="field"><label>Reason for Leaving:</label><span class="value">${e(emp.reasonForLeaving)}</span></div>
      <div class="checkbox-field"><span class="checkbox ${emp.isRegulated ? "checked" : ""}">${emp.isRegulated ? "✓" : ""}</span> FCA/PRA regulated firm</div>
      ${emp.isRegulated && emp.regulatorName ? `<div class="field"><label>Regulator:</label><span class="value">${e(emp.regulatorName)}</span></div>` : ""}
    </div>
  `).join("")}

  ${data.directorships.length > 0 ? `
    <h2>Section 6: Directorships</h2>
    ${data.directorships.map((dir, i) => `
      <div class="directorship-entry">
        <h3>Directorship ${i + 1}</h3>
        <div class="field"><label>Company Name:</label><span class="value">${e(dir.companyName)}</span></div>
        <div class="field"><label>Position:</label><span class="value">${e(dir.position)}</span></div>
        <div class="field"><label>Nature of Business:</label><span class="value">${e(dir.natureOfBusiness)}</span></div>
        <div class="field"><label>Appointed:</label><span class="value">${e(dir.appointedDate)}</span></div>
        <div class="field"><label>Resigned:</label><span class="value">${e(dir.resignedDate) || "Current"}</span></div>
        <div class="checkbox-field"><span class="checkbox ${dir.isActive ? "checked" : ""}">${dir.isActive ? "✓" : ""}</span> Currently active</div>
      </div>
    `).join("")}
  ` : ""}

  <div class="page-break"></div>
  <h2>Section 7-11: Fitness & Propriety</h2>

  <h3>Criminal Matters</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasCriminalConviction ? "checked" : ""}">${data.hasCriminalConviction ? "✓" : ""}</span> Criminal conviction (including spent)</div>
  ${data.hasCriminalConviction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.criminalDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasPendingProsecution ? "checked" : ""}">${data.hasPendingProsecution ? "✓" : ""}</span> Pending prosecution or investigation</div>
  ${data.hasPendingProsecution ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.pendingProsecutionDetails)}</span></div>` : ""}

  <h3>Civil Proceedings</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasCivilProceedings ? "checked" : ""}">${data.hasCivilProceedings ? "✓" : ""}</span> Adverse findings in civil proceedings</div>
  ${data.hasCivilProceedings ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.civilDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasJudgmentAgainst ? "checked" : ""}">${data.hasJudgmentAgainst ? "✓" : ""}</span> Court judgment against you</div>
  ${data.hasJudgmentAgainst ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.judgmentDetails)}</span></div>` : ""}

  <h3>Regulatory Matters</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasRegulatoryAction ? "checked" : ""}">${data.hasRegulatoryAction ? "✓" : ""}</span> Regulatory action or investigation</div>
  ${data.hasRegulatoryAction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.regulatoryActionDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasRefusedAuthorisation ? "checked" : ""}">${data.hasRefusedAuthorisation ? "✓" : ""}</span> Refused authorisation or registration</div>
  ${data.hasRefusedAuthorisation ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.refusedAuthorisationDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasSuspendedLicense ? "checked" : ""}">${data.hasSuspendedLicense ? "✓" : ""}</span> Suspended license or membership</div>
  ${data.hasSuspendedLicense ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.suspendedLicenseDetails)}</span></div>` : ""}

  <h3>Employment & Disciplinary</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasDisciplinaryAction ? "checked" : ""}">${data.hasDisciplinaryAction ? "✓" : ""}</span> Subject to disciplinary action</div>
  ${data.hasDisciplinaryAction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.disciplinaryDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasDismissed ? "checked" : ""}">${data.hasDismissed ? "✓" : ""}</span> Dismissed from employment</div>
  ${data.hasDismissed ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.dismissedDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasResignedInvestigation ? "checked" : ""}">${data.hasResignedInvestigation ? "✓" : ""}</span> Resigned during investigation</div>
  ${data.hasResignedInvestigation ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.resignedInvestigationDetails)}</span></div>` : ""}

  <h3>Financial Soundness</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasBankruptcy ? "checked" : ""}">${data.hasBankruptcy ? "✓" : ""}</span> Bankruptcy or sequestration</div>
  ${data.hasBankruptcy ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.bankruptcyDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasIVA ? "checked" : ""}">${data.hasIVA ? "✓" : ""}</span> Individual Voluntary Arrangement (IVA)</div>
  ${data.hasIVA ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.ivaDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasCCJ ? "checked" : ""}">${data.hasCCJ ? "✓" : ""}</span> County Court Judgment (CCJ)</div>
  ${data.hasCCJ ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.ccjDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasCompanyInsolvency ? "checked" : ""}">${data.hasCompanyInsolvency ? "✓" : ""}</span> Director of insolvent company</div>
  ${data.hasCompanyInsolvency ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.companyInsolvencyDetails)}</span></div>` : ""}

  <div class="page-break"></div>
  <h2>Section 12: Statement of Responsibilities</h2>
  <div class="field"><label>Key Responsibilities:</label><span class="value multi">${e(data.sorResponsibilities)}</span></div>
  <h3>Prescribed Responsibilities</h3>
  ${prescribedResponsibilitiesList.map((pr) => `
    <div class="checkbox-field"><span class="checkbox ${data.prescribedResponsibilities.includes(pr.id) ? "checked" : ""}">${data.prescribedResponsibilities.includes(pr.id) ? "✓" : ""}</span> ${e(pr.label)}</div>
  `).join("")}
  ${data.additionalResponsibilities ? `<div class="field"><label>Additional Responsibilities:</label><span class="value multi">${e(data.additionalResponsibilities)}</span></div>` : ""}

  <h2>Section 13: Competency</h2>
  <div class="field"><label>Relevant Experience:</label><span class="value multi">${e(data.relevantExperience)}</span></div>
  <div class="field"><label>Qualifications:</label><span class="value multi">${e(data.qualifications)}</span></div>
  <div class="field"><label>Training Planned:</label><span class="value multi">${e(data.trainingPlanned)}</span></div>

  <h2>Section 14: Declarations</h2>
  <div class="warning">
    <strong>Important Declaration</strong><br>
    By signing below, the candidate and firm confirm that all information provided is accurate and complete.
    Providing false or misleading information is a criminal offence.
  </div>

  <div class="signature-box">
    <h3>Candidate Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.candidateDeclaration ? "checked" : ""}">${data.candidateDeclaration ? "✓" : ""}</span> I confirm the information provided is accurate and complete</div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.candidateSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.candidateSignatureDate)}</span></div>
  </div>

  <div class="signature-box">
    <h3>Firm Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.firmDeclaration ? "checked" : ""}">${data.firmDeclaration ? "✓" : ""}</span> The firm confirms it has assessed the candidate's fitness and propriety</div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.firmSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.firmSignatureDate)}</span></div>
  </div>

  <div class="footer">
    <p>This form was generated by Nasara Connect on ${format(new Date(), "PPP")}.</p>
    <p><strong>Official submission must be made via FCA Connect:</strong> https://connect.fca.org.uk</p>
    <p>Reference: FCA Handbook SUP 10C | SM&CR Regime</p>
  </div>
</body>
</html>`;
};

// Helper to get reason label
const getReasonLabel = (value: string): string => {
  const reason = reasonCategories.find(r => r.value === value);
  return reason?.label || value;
};

// Helper to get function label
const getFunctionLabel = (value: string): string => {
  const func = controlledFunctions.find(f => f.value === value);
  return func?.label || value;
};

export const generateFormCHTML = (data: FormCState): string => {
  const e = escapeHtml;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FCA Form C - ${e(data.forenames)} ${e(data.surname)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; font-size: 11px; line-height: 1.4; color: #333; }
    h1 { font-size: 18px; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
    h2 { font-size: 13px; background: #f0f0f0; padding: 8px 12px; margin: 25px 0 15px; border-left: 4px solid #0055b8; }
    h3 { font-size: 11px; margin: 15px 0 10px; color: #0055b8; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 20px; }
    .field { margin: 8px 0; display: flex; align-items: flex-start; }
    .field label { width: 200px; font-weight: bold; flex-shrink: 0; padding-top: 2px; }
    .field .value { flex: 1; border-bottom: 1px solid #ccc; min-height: 18px; padding: 2px 4px; background: #fafafa; }
    .field .value.multi { min-height: 60px; white-space: pre-wrap; }
    .checkbox-field { margin: 6px 0; display: flex; align-items: center; gap: 8px; }
    .checkbox { width: 14px; height: 14px; border: 1px solid #333; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
    .checkbox.checked { background: #0055b8; color: white; }
    .section-box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; background: #fafafa; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 15px 0; }
    .info { background: #e7f3ff; border: 1px solid #0055b8; padding: 12px; margin: 15px 0; }
    .disclosure-box { border: 1px solid #ddd; padding: 12px; margin: 10px 0; background: white; }
    .signature-box { border: 2px solid #333; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; text-align: center; }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>FCA FORM C</h1>
  <p class="subtitle">Notice of Ceasing to Perform Controlled Functions</p>
  <p class="subtitle">Financial Conduct Authority | Prudential Regulation Authority</p>

  <div class="warning">
    <strong>Submission Deadline:</strong> This form must be submitted within 7 business days of the individual ceasing to perform the controlled function.
  </div>

  <div class="info">
    <strong>Notice Reference:</strong> ${e(data.firmFRN)}-C-${format(new Date(), "yyyyMMdd")}<br>
    <strong>Generated:</strong> ${format(new Date(), "PPP 'at' p")}
  </div>

  <h2>Section 1: Firm Details</h2>
  <div class="field"><label>Firm Name:</label><span class="value">${e(data.firmName)}</span></div>
  <div class="field"><label>FRN:</label><span class="value">${e(data.firmFRN)}</span></div>
  <div class="field"><label>Firm Address:</label><span class="value">${e(data.firmAddress)}</span></div>
  <h3>Submitter Details</h3>
  <div class="field"><label>Submitter Name:</label><span class="value">${e(data.submitterName)}</span></div>
  <div class="field"><label>Position:</label><span class="value">${e(data.submitterPosition)}</span></div>
  <div class="field"><label>Email:</label><span class="value">${e(data.submitterEmail)}</span></div>
  <div class="field"><label>Phone:</label><span class="value">${e(data.submitterPhone)}</span></div>

  <h2>Section 2: Individual Details</h2>
  <div class="field"><label>Title:</label><span class="value">${e(data.title)}</span></div>
  <div class="field"><label>Forename(s):</label><span class="value">${e(data.forenames)}</span></div>
  <div class="field"><label>Surname:</label><span class="value">${e(data.surname)}</span></div>
  <div class="field"><label>Individual Reference Number:</label><span class="value">${e(data.individualReferenceNumber)}</span></div>
  <div class="field"><label>Date of Birth:</label><span class="value">${e(data.dateOfBirth)}</span></div>
  <div class="field"><label>National Insurance No:</label><span class="value">${e(data.nationalInsurance)}</span></div>

  <h3>Function Being Ceased</h3>
  <div class="field"><label>Controlled Function:</label><span class="value">${e(getFunctionLabel(data.functionCeasing))}</span></div>
  <div class="field"><label>Date Originally Approved:</label><span class="value">${e(data.dateApproved)}</span></div>

  <h2>Section 3: Cessation Details</h2>
  <div class="field"><label>Date of Cessation:</label><span class="value">${e(data.effectiveDate)}</span></div>
  <div class="field"><label>Reason for Leaving:</label><span class="value">${e(getReasonLabel(data.reasonCategory))}</span></div>
  ${data.reasonDetails ? `<div class="field"><label>Additional Details:</label><span class="value multi">${e(data.reasonDetails)}</span></div>` : ""}

  ${data.isRelocating ? `
  <h3>New Employment</h3>
  <div class="checkbox-field"><span class="checkbox checked">✓</span> Moving to another regulated firm</div>
  <div class="field"><label>New Employer:</label><span class="value">${e(data.newEmployerName)}</span></div>
  ${data.newEmployerFRN ? `<div class="field"><label>New Employer FRN:</label><span class="value">${e(data.newEmployerFRN)}</span></div>` : ""}
  ` : ""}

  <h2>Section 4: Circumstances</h2>
  <p style="font-size: 10px; color: #666; margin-bottom: 15px;">The following disclosures relate to any fitness and propriety concerns:</p>

  <div class="disclosure-box">
    <div class="checkbox-field"><span class="checkbox ${data.hasPerformanceIssues ? "checked" : ""}">${data.hasPerformanceIssues ? "✓" : ""}</span> Performance concerns</div>
    ${data.hasPerformanceIssues ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.performanceDetails)}</span></div>` : ""}
  </div>

  <div class="disclosure-box">
    <div class="checkbox-field"><span class="checkbox ${data.hasConductIssues ? "checked" : ""}">${data.hasConductIssues ? "✓" : ""}</span> Conduct or behaviour concerns</div>
    ${data.hasConductIssues ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.conductDetails)}</span></div>` : ""}
  </div>

  <div class="disclosure-box">
    <div class="checkbox-field"><span class="checkbox ${data.hasInvestigation ? "checked" : ""}">${data.hasInvestigation ? "✓" : ""}</span> Subject to investigation</div>
    ${data.hasInvestigation ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.investigationDetails)}</span></div>` : ""}
  </div>

  <div class="disclosure-box">
    <div class="checkbox-field"><span class="checkbox ${data.hasDisciplinaryAction ? "checked" : ""}">${data.hasDisciplinaryAction ? "✓" : ""}</span> Disciplinary action taken</div>
    ${data.hasDisciplinaryAction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.disciplinaryDetails)}</span></div>` : ""}
  </div>

  <div class="disclosure-box">
    <div class="checkbox-field"><span class="checkbox ${data.hasRegulatoryBreach ? "checked" : ""}">${data.hasRegulatoryBreach ? "✓" : ""}</span> Regulatory breach involvement</div>
    ${data.hasRegulatoryBreach ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.regulatoryBreachDetails)}</span></div>` : ""}
  </div>

  <h2>Section 5: Handover Arrangements</h2>
  <div class="checkbox-field"><span class="checkbox ${data.hasHandoverPlan ? "checked" : ""}">${data.hasHandoverPlan ? "✓" : ""}</span> Formal handover completed</div>
  ${data.hasHandoverPlan && data.handoverDetails ? `<div class="field"><label>Handover Details:</label><span class="value multi">${e(data.handoverDetails)}</span></div>` : ""}

  <div class="field"><label>Interim Arrangements:</label><span class="value multi">${e(data.interimArrangements)}</span></div>

  ${data.replacementName ? `
  <h3>Replacement</h3>
  <div class="field"><label>Replacement Name:</label><span class="value">${e(data.replacementName)}</span></div>
  <div class="checkbox-field"><span class="checkbox ${data.replacementApplicationSubmitted ? "checked" : ""}">${data.replacementApplicationSubmitted ? "✓" : ""}</span> Form A application submitted for replacement</div>
  ` : ""}

  <h2>Section 6: Declaration</h2>
  <div class="warning">
    <strong>Important Declaration</strong><br>
    Providing false or misleading information to the FCA is a criminal offence under Section 398 of the Financial Services and Markets Act 2000.
  </div>

  <div class="signature-box">
    <h3>Firm Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.firmDeclaration ? "checked" : ""}">${data.firmDeclaration ? "✓" : ""}</span> The firm confirms the information provided is accurate and complete</div>
    <div class="field"><label>Declarant Name:</label><span class="value">${e(data.declarantName)}</span></div>
    <div class="field"><label>Position:</label><span class="value">${e(data.declarantPosition)}</span></div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.declarantSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.declarantDate)}</span></div>
  </div>

  <div class="footer">
    <p>This form was generated by Nasara Connect on ${format(new Date(), "PPP")}.</p>
    <p><strong>Deadline: Submit within 7 business days via FCA Connect:</strong> https://connect.fca.org.uk</p>
    <p>Reference: FCA Handbook SUP 10C | SM&CR Regime</p>
  </div>
</body>
</html>`;
};
