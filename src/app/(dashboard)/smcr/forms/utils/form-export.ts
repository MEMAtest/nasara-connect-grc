import { format } from "date-fns";
import type { FormAState, FormCState, FormDState, FormEState, PSDIndividualFormState } from '../types/form-types';
import { prescribedResponsibilitiesList, reasonCategories, controlledFunctions, changeCategories, fitnessCategories, transferReasons, psdPositionTypes, psdNatureOfEmployment, psdReasonsForLeaving } from './form-constants';

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

// Helper to get change category label
const getChangeCategoryLabel = (value: string): string => {
  const category = changeCategories.find(c => c.value === value);
  return category?.label || value;
};

// Helper to get fitness category label
const getFitnessCategoryLabel = (value: string): string => {
  const category = fitnessCategories.find(c => c.value === value);
  return category?.label || value;
};

// Helper to get transfer reason label
const getTransferReasonLabel = (value: string): string => {
  const reason = transferReasons.find(r => r.value === value);
  return reason?.label || value;
};

export const generateFormDHTML = (data: FormDState): string => {
  const e = escapeHtml;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FCA Form D - ${e(data.forenames)} ${e(data.surname)}</title>
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
    .change-box { border: 1px solid #ddd; padding: 12px; margin: 10px 0; background: white; }
    .signature-box { border: 2px solid #333; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; text-align: center; }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>FCA FORM D</h1>
  <p class="subtitle">Amendment to Details of Approved Person</p>
  <p class="subtitle">Financial Conduct Authority | Prudential Regulation Authority</p>

  <div class="info">
    <strong>Amendment Reference:</strong> ${e(data.firmFRN)}-D-${format(new Date(), "yyyyMMdd")}<br>
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
  <div class="field"><label>Current Function:</label><span class="value">${e(getFunctionLabel(data.currentFunction))}</span></div>

  <h2>Section 3: Change Details</h2>
  <div class="field"><label>Type of Change:</label><span class="value">${e(getChangeCategoryLabel(data.changeCategory))}</span></div>

  ${data.changeCategory === "name" ? `
  <div class="change-box">
    <h3>Name Change</h3>
    <div class="field"><label>Previous Forename(s):</label><span class="value">${e(data.previousForenames)}</span></div>
    <div class="field"><label>Previous Surname:</label><span class="value">${e(data.previousSurname)}</span></div>
    <div class="field"><label>New Forename(s):</label><span class="value">${e(data.newForenames)}</span></div>
    <div class="field"><label>New Surname:</label><span class="value">${e(data.newSurname)}</span></div>
    <div class="field"><label>Reason for Change:</label><span class="value">${e(data.reasonForNameChange)}</span></div>
    <div class="field"><label>Date of Change:</label><span class="value">${e(data.nameChangeDate)}</span></div>
  </div>
  ` : ""}

  ${data.changeCategory === "contact" ? `
  <div class="change-box">
    <h3>Contact Details Change</h3>
    ${data.previousAddress || data.newAddress ? `
    <h4 style="font-size: 10px; color: #666; margin: 10px 0 5px;">Address</h4>
    <div class="field"><label>Previous Address:</label><span class="value multi">${e(data.previousAddress)}</span></div>
    <div class="field"><label>New Address:</label><span class="value multi">${e(data.newAddress)}</span></div>
    ` : ""}
    ${data.previousEmail || data.newEmail ? `
    <h4 style="font-size: 10px; color: #666; margin: 10px 0 5px;">Email</h4>
    <div class="field"><label>Previous Email:</label><span class="value">${e(data.previousEmail)}</span></div>
    <div class="field"><label>New Email:</label><span class="value">${e(data.newEmail)}</span></div>
    ` : ""}
    ${data.previousPhone || data.newPhone ? `
    <h4 style="font-size: 10px; color: #666; margin: 10px 0 5px;">Phone</h4>
    <div class="field"><label>Previous Phone:</label><span class="value">${e(data.previousPhone)}</span></div>
    <div class="field"><label>New Phone:</label><span class="value">${e(data.newPhone)}</span></div>
    ` : ""}
  </div>
  ` : ""}

  ${data.changeCategory === "ni" ? `
  <div class="change-box">
    <h3>National Insurance Number Correction</h3>
    <div class="field"><label>Previous NI Number:</label><span class="value">${e(data.previousNI)}</span></div>
    <div class="field"><label>Correct NI Number:</label><span class="value">${e(data.correctedNI)}</span></div>
    <div class="field"><label>Reason for Correction:</label><span class="value multi">${e(data.niCorrectionReason)}</span></div>
  </div>
  ` : ""}

  ${data.changeCategory === "fitness" ? `
  <div class="change-box">
    <h3>Fitness & Propriety Update</h3>
    <div class="warning">
      <strong>Important:</strong> This section contains fitness and propriety disclosures.
    </div>
    <div class="field"><label>Category:</label><span class="value">${e(getFitnessCategoryLabel(data.fitnessCategory))}</span></div>
    <div class="field"><label>Date of Occurrence:</label><span class="value">${e(data.dateOfOccurrence)}</span></div>
    <div class="field"><label>Full Details:</label><span class="value multi">${e(data.fitnessDetails)}</span></div>
  </div>
  ` : ""}

  ${data.changeCategory === "other" ? `
  <div class="change-box">
    <h3>Other Change</h3>
    <div class="field"><label>Description:</label><span class="value">${e(data.otherChangeDescription)}</span></div>
    <div class="field"><label>Full Details:</label><span class="value multi">${e(data.otherChangeDetails)}</span></div>
  </div>
  ` : ""}

  <h2>Section 4: Declaration</h2>
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
    <p><strong>Official submission must be made via FCA Connect:</strong> https://connect.fca.org.uk</p>
    <p>Reference: FCA Handbook SUP 10C | SM&CR Regime</p>
  </div>
</body>
</html>`;
};

// Helper to get PSD position type label
const getPSDPositionLabel = (value: string): string => {
  const pos = psdPositionTypes.find(p => p.value === value);
  return pos?.label || value;
};

// Helper to get PSD nature of employment label
const getPSDNatureOfEmploymentLabel = (value: string): string => {
  const nature = psdNatureOfEmployment.find(n => n.value === value);
  return nature?.label || value;
};

// Helper to get PSD reason for leaving label
const getPSDReasonForLeavingLabel = (value: string): string => {
  const reason = psdReasonsForLeaving.find(r => r.value === value);
  return reason?.label || value;
};

export const generatePSDIndividualHTML = (data: PSDIndividualFormState): string => {
  const e = escapeHtml;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PSD Individual Form - ${e(data.forenames)} ${e(data.surname)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; font-size: 11px; line-height: 1.4; color: #333; }
    h1 { font-size: 18px; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
    h2 { font-size: 13px; background: #f0f0f0; padding: 8px 12px; margin: 25px 0 15px; border-left: 4px solid #0055b8; }
    h3 { font-size: 11px; margin: 15px 0 10px; color: #0055b8; }
    h4 { font-size: 10px; margin: 10px 0 8px; color: #444; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 20px; }
    .field { margin: 8px 0; display: flex; align-items: flex-start; }
    .field label { width: 220px; font-weight: bold; flex-shrink: 0; padding-top: 2px; }
    .field .value { flex: 1; border-bottom: 1px solid #ccc; min-height: 18px; padding: 2px 4px; background: #fafafa; }
    .field .value.multi { min-height: 60px; white-space: pre-wrap; }
    .checkbox-field { margin: 6px 0; display: flex; align-items: center; gap: 8px; }
    .checkbox { width: 14px; height: 14px; border: 1px solid #333; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
    .checkbox.checked { background: #0055b8; color: white; }
    .section-box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; background: #fafafa; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 15px 0; }
    .info { background: #e7f3ff; border: 1px solid #0055b8; padding: 12px; margin: 15px 0; }
    .employment-entry { border: 1px solid #ddd; padding: 12px; margin: 10px 0; background: white; }
    .qualification-entry { border: 1px solid #ddd; padding: 10px; margin: 8px 0; background: white; }
    .address-entry { border: 1px solid #eee; padding: 8px; margin: 6px 0; background: #fafafa; }
    .signature-box { border: 2px solid #333; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; text-align: center; }
    .page-break { page-break-before: always; }
    .fitness-question { margin: 4px 0; padding-left: 20px; }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>PSD INDIVIDUAL FORM</h1>
  <p class="subtitle">Application Form for an individual responsible for the management of a Payment Institution</p>
  <p class="subtitle">Payment Services Regulations 2017</p>

  <div class="info">
    <strong>Application Reference:</strong> ${e(data.firmFRN)}-PSD-${format(new Date(), "yyyyMMdd")}<br>
    <strong>Generated:</strong> ${format(new Date(), "PPP 'at' p")}
  </div>

  <div class="warning">
    <strong>Important:</strong> Providing false or misleading information is a criminal offence under the Payment Services Regulations 2017.
  </div>

  <h2>Section 1: Personal Identification Details</h2>
  ${data.fcaIRN ? `<div class="field"><label>1.1a FCA Individual Reference No:</label><span class="value">${e(data.fcaIRN)}</span></div>` : ""}
  ${data.previousRegulatoryBody ? `
    <div class="field"><label>1.1b Previous Regulatory Body:</label><span class="value">${e(data.previousRegulatoryBody)}</span></div>
    <div class="field"><label>1.1c Previous Reference No:</label><span class="value">${e(data.previousReferenceNumber)}</span></div>
  ` : ""}
  <div class="field"><label>1.2 Title:</label><span class="value">${e(data.title)}</span></div>
  <div class="field"><label>1.3 Surname:</label><span class="value">${e(data.surname)}</span></div>
  <div class="field"><label>1.4 Full First Name(s):</label><span class="value">${e(data.forenames)}</span></div>
  ${data.nameKnownBy ? `<div class="field"><label>1.5 Name Usually Known By:</label><span class="value">${e(data.nameKnownBy)}</span></div>` : ""}
  ${data.previousNames ? `
    <div class="field"><label>1.6 Previous Names:</label><span class="value">${e(data.previousNames)}</span></div>
    <div class="field"><label>1.7 Date of Name Change:</label><span class="value">${e(data.dateOfNameChange)}</span></div>
  ` : ""}
  <div class="field"><label>1.8 Gender:</label><span class="value">${e(data.gender)}</span></div>
  <div class="field"><label>1.9 Date of Birth:</label><span class="value">${e(data.dateOfBirth)}</span></div>
  <div class="field"><label>1.10 Place/Country of Birth:</label><span class="value">${e(data.placeOfBirth)}</span></div>
  <div class="field"><label>1.11 National Insurance No:</label><span class="value">${e(data.nationalInsurance)}</span></div>
  ${data.passportNumber ? `<div class="field"><label>1.12 Passport Number:</label><span class="value">${e(data.passportNumber)}</span></div>` : ""}
  <div class="field"><label>1.13 Nationality:</label><span class="value">${e(data.nationality)}</span></div>

  <h3>1.14-1.15 Address History (3 Years)</h3>
  <div class="address-entry">
    <strong>Current Address:</strong><br>
    <div class="field"><label>Address:</label><span class="value">${e(data.currentAddress)}</span></div>
    <div class="field"><label>Postcode:</label><span class="value">${e(data.currentPostcode)}</span></div>
    <div class="field"><label>From:</label><span class="value">${e(data.currentAddressFromDate)}</span></div>
  </div>
  ${data.previousAddresses.map((addr, i) => `
    <div class="address-entry">
      <strong>Previous Address ${i + 1}:</strong><br>
      <div class="field"><label>Address:</label><span class="value">${e(addr.address)}</span></div>
      <div class="field"><label>Postcode:</label><span class="value">${e(addr.postcode)}</span></div>
      <div class="field"><label>Period:</label><span class="value">${e(addr.fromDate)} to ${e(addr.toDate)}</span></div>
    </div>
  `).join("")}

  <h2>Section 2: Firm Identification Details</h2>
  <div class="field"><label>2.1 Firm Name:</label><span class="value">${e(data.firmName)}</span></div>
  <div class="field"><label>2.2 FRN:</label><span class="value">${e(data.firmFRN)}</span></div>
  <h3>2.3 Contact for this Application</h3>
  <div class="field"><label>Name:</label><span class="value">${e(data.contactName)}</span></div>
  <div class="field"><label>Position:</label><span class="value">${e(data.contactPosition)}</span></div>
  <div class="field"><label>Telephone:</label><span class="value">${e(data.contactPhone)}</span></div>
  ${data.contactFax ? `<div class="field"><label>Fax:</label><span class="value">${e(data.contactFax)}</span></div>` : ""}
  <div class="field"><label>Email:</label><span class="value">${e(data.contactEmail)}</span></div>

  <h2>Section 3: Arrangements</h2>
  <div class="field"><label>3.1 Position Applied For:</label><span class="value">${e(getPSDPositionLabel(data.positionType))}</span></div>
  ${data.positionType === "other" ? `<div class="field"><label>Details:</label><span class="value">${e(data.positionOtherDetails)}</span></div>` : ""}

  <h3>3.2 Attached Documents</h3>
  ${data.attachedDocuments.length > 0 ? `
    <ul style="margin: 5px 0 0 20px;">
      ${data.attachedDocuments.map(doc => `<li>${e(doc === "letter" ? "Letter of appointment" : doc === "contract" ? "Contract of employment" : "Offer letter")}</li>`).join("")}
    </ul>
  ` : "<p style='font-style: italic;'>No documents attached</p>"}

  <div class="field"><label>3.3 Planned Start Date:</label><span class="value">${e(data.plannedStartDate)}</span></div>
  ${data.hasExpectedEndDate ? `<div class="field"><label>3.4 Expected End Date:</label><span class="value">${e(data.expectedEndDate)}</span></div>` : ""}
  <div class="field"><label>3.5 Key Duties & Responsibilities:</label><span class="value multi">${e(data.keyDutiesResponsibilities)}</span></div>

  <div class="page-break"></div>
  <h2>Section 4: Employment History & Qualifications</h2>
  <div class="warning">
    <strong>Important:</strong> A full 10-year employment history must be provided. ALL gaps must be accounted for.
  </div>

  <h3>4.1 Employment History</h3>
  ${data.employmentHistory.map((emp, i) => `
    <div class="employment-entry">
      <h4>Employment ${i + 1} ${i === 0 ? "(Current/Most Recent)" : ""}</h4>
      <div class="field"><label>Period:</label><span class="value">${e(emp.fromDate)} to ${emp.toDate || "Present"}</span></div>
      <div class="field"><label>Nature of Employment:</label><span class="value">${e(getPSDNatureOfEmploymentLabel(emp.natureOfEmployment))}</span></div>
      ${(emp.natureOfEmployment === "unemployed" || emp.natureOfEmployment === "education") ? `
        <div class="field"><label>Details:</label><span class="value">${e(emp.employmentDetails)}</span></div>
      ` : `
        <div class="field"><label>Employer Name:</label><span class="value">${e(emp.employerName)}</span></div>
        ${emp.previousEmployerNames ? `<div class="field"><label>Previous Names:</label><span class="value">${e(emp.previousEmployerNames)}</span></div>` : ""}
        <div class="field"><label>Employer Address:</label><span class="value">${e(emp.employerAddress)}</span></div>
        <div class="field"><label>Nature of Business:</label><span class="value">${e(emp.natureOfBusiness)}</span></div>
        <div class="field"><label>Position Held:</label><span class="value">${e(emp.positionHeld)}</span></div>
        <div class="checkbox-field"><span class="checkbox ${emp.isRegulated ? "checked" : ""}">${emp.isRegulated ? "✓" : ""}</span> Regulated by a regulatory body</div>
        ${emp.isRegulated ? `<div class="field"><label>Regulator:</label><span class="value">${e(emp.regulatorName)}</span></div>` : ""}
        <div class="field"><label>Responsibilities:</label><span class="value multi">${e(emp.responsibilities)}</span></div>
      `}
      ${i > 0 && emp.reasonForLeaving ? `<div class="field"><label>Reason for Leaving:</label><span class="value">${e(getPSDReasonForLeavingLabel(emp.reasonForLeaving))}</span></div>` : ""}
    </div>
  `).join("")}

  ${data.qualifications.length > 0 ? `
    <h3>4.2 Qualifications</h3>
    ${data.qualifications.map((qual, i) => `
      <div class="qualification-entry">
        <strong>Qualification ${i + 1}</strong><br>
        <div class="field"><label>Period:</label><span class="value">${e(qual.fromDate)} to ${e(qual.toDate)}</span></div>
        <div class="field"><label>Qualification:</label><span class="value">${e(qual.qualification)}</span></div>
        <div class="field"><label>Issuing Organisation:</label><span class="value">${e(qual.issuingOrganisation)}</span></div>
      </div>
    `).join("")}
  ` : ""}

  <div class="checkbox-field"><span class="checkbox ${data.cvAvailable ? "checked" : ""}">${data.cvAvailable ? "✓" : ""}</span> 4.3 CV available upon request</div>
  <div class="checkbox-field"><span class="checkbox ${data.suitabilityAssessmentAttached ? "checked" : ""}">${data.suitabilityAssessmentAttached ? "✓" : ""}</span> 4.4 Suitability assessment attached</div>

  <div class="page-break"></div>
  <h2>Section 5: Fitness and Propriety</h2>

  <h3>Part A: Criminal Proceedings</h3>
  <div class="section-box">
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCriminalConviction ? "checked" : ""}">${data.hasCriminalConviction ? "✓" : ""}</span> 5.1(i) Criminal conviction (including spent)</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasPendingInvestigation ? "checked" : ""}">${data.hasPendingInvestigation ? "✓" : ""}</span> 5.1(ii) Investigation or proceedings pending</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCurrentCriminalProceedings ? "checked" : ""}">${data.hasCurrentCriminalProceedings ? "✓" : ""}</span> 5.2(i) Currently party to criminal proceedings</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasPastCriminalProceedings ? "checked" : ""}">${data.hasPastCriminalProceedings ? "✓" : ""}</span> 5.2(ii) Previously party to criminal proceedings</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCriminalRecordCheck ? "checked" : ""}">${data.hasCriminalRecordCheck ? "✓" : ""}</span> 5.2(iii) Criminal record check shows unspent convictions</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasOrganisationInsolvency ? "checked" : ""}">${data.hasOrganisationInsolvency ? "✓" : ""}</span> 5.3 Managing director/partner of organisation subject to offence</div>
    </div>
    <div class="checkbox-field"><span class="checkbox ${data.partADetailsProvided ? "checked" : ""}">${data.partADetailsProvided ? "✓" : ""}</span> 5.4 Details provided in Section 6</div>
  </div>

  <h3>Part B: Civil and Administrative Proceedings</h3>
  <div class="section-box">
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCivilInvestigations ? "checked" : ""}">${data.hasCivilInvestigations ? "✓" : ""}</span> 5.5(i) Subject to civil/administrative investigation or enforcement</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCivilDecisionsAgainst ? "checked" : ""}">${data.hasCivilDecisionsAgainst ? "✓" : ""}</span> 5.5(ii) Adverse decisions in civil/administrative proceedings</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCivilEnforcement ? "checked" : ""}">${data.hasCivilEnforcement ? "✓" : ""}</span> 5.5(iii) Subject to enforcement action by government body</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasSupervisoryInvolvement ? "checked" : ""}">${data.hasSupervisoryInvolvement ? "✓" : ""}</span> 5.5(iv) Involved with supervisory/regulatory authority</div>
    </div>
    <div class="checkbox-field"><span class="checkbox ${data.civilCertificateAttached ? "checked" : ""}">${data.civilCertificateAttached ? "✓" : ""}</span> 5.6 DBS certificate of subject access request attached</div>

    <h4>Financial Matters (5.7-5.9)</h4>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBankruptcyFiled ? "checked" : ""}">${data.hasBankruptcyFiled ? "✓" : ""}</span> 5.7(i) Filed for own bankruptcy or had petition served</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBeenBankrupt ? "checked" : ""}">${data.hasBeenBankrupt ? "✓" : ""}</span> 5.7(ii) Been adjudged bankrupt</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBankruptcyRestrictions ? "checked" : ""}">${data.hasBankruptcyRestrictions ? "✓" : ""}</span> 5.7(iii) Subject to bankruptcy restrictions order</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCreditorArrangements ? "checked" : ""}">${data.hasCreditorArrangements ? "✓" : ""}</span> 5.7(iv) Made arrangements with creditors (IVA etc)</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasAssetsSequestrated ? "checked" : ""}">${data.hasAssetsSequestrated ? "✓" : ""}</span> 5.7(v) Had assets sequestrated</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBankruptcyProceedings ? "checked" : ""}">${data.hasBankruptcyProceedings ? "✓" : ""}</span> 5.7(vi) Subject to similar proceedings outside UK</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasCurrentBankruptcyProceedings ? "checked" : ""}">${data.hasCurrentBankruptcyProceedings ? "✓" : ""}</span> 5.8 Current bankruptcy or insolvency proceedings</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasOutstandingFinancialObligations ? "checked" : ""}">${data.hasOutstandingFinancialObligations ? "✓" : ""}</span> 5.9 Outstanding financial obligations from financial services</div>
    </div>
    <div class="checkbox-field"><span class="checkbox ${data.partBDetailsProvided ? "checked" : ""}">${data.partBDetailsProvided ? "✓" : ""}</span> 5.10 Details provided in Section 6</div>
  </div>

  <h3>Part C: Business and Employment Matters</h3>
  <div class="section-box">
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBeenDismissed ? "checked" : ""}">${data.hasBeenDismissed ? "✓" : ""}</span> 5.11(i) Dismissed from employment</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBeenAskedToResign ? "checked" : ""}">${data.hasBeenAskedToResign ? "✓" : ""}</span> 5.11(ii) Asked to resign from employment</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBeenSuspended ? "checked" : ""}">${data.hasBeenSuspended ? "✓" : ""}</span> 5.11(iii) Suspended or restricted from employment</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBeenDisqualifiedDirector ? "checked" : ""}">${data.hasBeenDisqualifiedDirector ? "✓" : ""}</span> 5.12(i) Disqualified from being a director</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasDisciplinaryProceedings ? "checked" : ""}">${data.hasDisciplinaryProceedings ? "✓" : ""}</span> 5.12(ii) Subject to disciplinary proceedings by professional body</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasDisciplinaryInvestigation ? "checked" : ""}">${data.hasDisciplinaryInvestigation ? "✓" : ""}</span> 5.12(iii) Under investigation by professional body</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasNotifiedDisciplinary ? "checked" : ""}">${data.hasNotifiedDisciplinary ? "✓" : ""}</span> 5.12(iv) Notified by professional body of potential proceedings</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasMalpracticeAllegations ? "checked" : ""}">${data.hasMalpracticeAllegations ? "✓" : ""}</span> 5.12(v) Subject to malpractice, negligence allegations</div>
    </div>
    <div class="checkbox-field"><span class="checkbox ${data.partCDetailsProvided ? "checked" : ""}">${data.partCDetailsProvided ? "✓" : ""}</span> 5.13 Details provided in Section 6</div>
  </div>

  <h3>Part D: Regulatory Matters</h3>
  <div class="section-box">
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasRefusedAuthorisation ? "checked" : ""}">${data.hasRefusedAuthorisation ? "✓" : ""}</span> 5.14(i) Refused authorisation or registration by regulatory body</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasBeenExcluded ? "checked" : ""}">${data.hasBeenExcluded ? "✓" : ""}</span> 5.14(ii) Excluded from operating in financial services</div>
    </div>
    <div class="fitness-question">
      <div class="checkbox-field"><span class="checkbox ${data.hasPreviousReputationAssessment ? "checked" : ""}">${data.hasPreviousReputationAssessment ? "✓" : ""}</span> 5.15 Previously assessed for reputation by EEA state regulator</div>
    </div>
    ${data.hasPreviousReputationAssessment ? `<div class="field"><label>Assessment Details:</label><span class="value multi">${e(data.previousAssessmentDetails)}</span></div>` : ""}
    <div class="checkbox-field"><span class="checkbox ${data.partDDetailsProvided ? "checked" : ""}">${data.partDDetailsProvided ? "✓" : ""}</span> 5.16 Details provided in Section 6</div>
  </div>

  ${data.supplementaryInfo ? `
    <div class="page-break"></div>
    <h2>Section 6: Supplementary Information</h2>
    <div class="field"><label>Additional Details:</label><span class="value multi">${e(data.supplementaryInfo)}</span></div>
    ${data.additionalSheets > 0 ? `<div class="field"><label>Additional Sheets:</label><span class="value">${data.additionalSheets}</span></div>` : ""}
  ` : ""}

  <div class="page-break"></div>
  <h2>Section 7: Declarations</h2>

  <div class="warning">
    <strong>Legal Notice:</strong> Knowingly or recklessly giving the FCA information which is false or misleading in a material particular is a criminal offence under the Payment Services Regulations 2017 and may lead to disciplinary sanctions or other enforcement action.
  </div>

  <div class="signature-box">
    <h3>Declaration of Individual</h3>
    <p style="font-size: 10px; margin-bottom: 15px;">By signing below, I authorise the FCA to make enquiries and seek further information as it thinks appropriate, understand I may be selected for a PNC check, and confirm the information in this Form is accurate and complete to the best of my knowledge and belief.</p>
    <div class="field"><label>Individual's Full Name:</label><span class="value">${e(data.individualFullName)}</span></div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.individualSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.individualSignatureDate)}</span></div>
  </div>

  <div class="signature-box">
    <h3>Declaration of Applicant Firm / Payment Institution</h3>
    <p style="font-size: 10px; margin-bottom: 15px;">The firm declares that on the basis of due and diligent enquiry, the individual is believed to be fit and proper and competent to fulfil the duties required. The signatory has authority to make this application on behalf of the applicant firm.</p>
    <div class="field"><label>Name of Applicant Firm:</label><span class="value">${e(data.firmNameDeclaration)}</span></div>
    <div class="field"><label>Name of Person Signing:</label><span class="value">${e(data.firmSignatoryName)}</span></div>
    <div class="field"><label>Job Title:</label><span class="value">${e(data.firmSignatoryJobTitle)}</span></div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.firmSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.firmSignatureDate)}</span></div>
  </div>

  <div class="footer">
    <p>This form was generated by Nasara Connect on ${format(new Date(), "PPP")}.</p>
    <p><strong>Official submission must be made via FCA Connect:</strong> https://connect.fca.org.uk</p>
    <p>Reference: Payment Services Regulations 2017</p>
  </div>
</body>
</html>`;
};

export const generateFormEHTML = (data: FormEState): string => {
  const e = escapeHtml;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FCA Form E - ${e(data.forenames)} ${e(data.surname)}</title>
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
    .function-list { background: #f8f8f8; padding: 10px; margin: 10px 0; border-left: 3px solid #0055b8; }
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
  <h1>FCA FORM E</h1>
  <p class="subtitle">Internal Transfer of Approved Person</p>
  <p class="subtitle">Financial Conduct Authority | Prudential Regulation Authority</p>

  <div class="warning">
    <strong>Important:</strong> The individual must not perform any new SMF function until FCA approval is granted. SMF applications take up to 3 months.
  </div>

  <div class="info">
    <strong>Transfer Reference:</strong> ${e(data.firmFRN)}-E-${format(new Date(), "yyyyMMdd")}<br>
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

  <h2>Section 3: Current Functions Being Ceased</h2>
  <div class="function-list">
    <strong>Functions being ceased:</strong>
    <ul style="margin: 5px 0 0 20px;">
      ${data.currentFunctions.map(funcValue => {
        const func = controlledFunctions.find(f => f.value === funcValue);
        return `<li>${e(func?.label || funcValue)}</li>`;
      }).join("")}
    </ul>
  </div>
  <div class="field"><label>Date of Cessation:</label><span class="value">${e(data.ceasingDate)}</span></div>

  <h2>Section 4: New Functions Applied For</h2>
  <div class="function-list">
    <strong>New functions:</strong>
    <ul style="margin: 5px 0 0 20px;">
      ${data.newFunctions.map(funcValue => {
        const func = controlledFunctions.find(f => f.value === funcValue);
        return `<li>${e(func?.label || funcValue)}</li>`;
      }).join("")}
    </ul>
  </div>
  <div class="field"><label>Proposed Start Date:</label><span class="value">${e(data.newFunctionStartDate)}</span></div>
  <div class="field"><label>New Job Title:</label><span class="value">${e(data.newJobTitle)}</span></div>
  <div class="field"><label>Reports To:</label><span class="value">${e(data.newReportingTo)}</span></div>
  <div class="field"><label>Direct Reports:</label><span class="value">${e(data.newDirectReports)}</span></div>
  <div class="field"><label>Time Commitment:</label><span class="value">${e(data.timeCommitment)}</span></div>
  <div class="field"><label>Hours per Week:</label><span class="value">${e(data.hoursPerWeek)}</span></div>

  <h2>Section 5: Reason for Transfer</h2>
  <div class="field"><label>Primary Reason:</label><span class="value">${e(getTransferReasonLabel(data.transferReason))}</span></div>
  <div class="field"><label>Additional Details:</label><span class="value multi">${e(data.transferDetails)}</span></div>

  <div class="page-break"></div>
  <h2>Section 6: Statement of Responsibilities</h2>
  <div class="field"><label>Key Responsibilities:</label><span class="value multi">${e(data.newResponsibilities)}</span></div>
  ${data.prescribedResponsibilities.length > 0 ? `
  <h3>Prescribed Responsibilities</h3>
  ${prescribedResponsibilitiesList.map((pr) => `
    <div class="checkbox-field"><span class="checkbox ${data.prescribedResponsibilities.includes(pr.id) ? "checked" : ""}">${data.prescribedResponsibilities.includes(pr.id) ? "✓" : ""}</span> ${e(pr.label)}</div>
  `).join("")}
  ` : ""}
  ${data.additionalResponsibilities ? `<div class="field"><label>Additional Responsibilities:</label><span class="value multi">${e(data.additionalResponsibilities)}</span></div>` : ""}

  <h2>Section 7: Competency</h2>
  <div class="field"><label>Relevant Experience:</label><span class="value multi">${e(data.relevantExperience)}</span></div>
  <div class="field"><label>Training & Development:</label><span class="value multi">${e(data.additionalTraining)}</span></div>

  <h2>Section 8: Fitness & Propriety</h2>
  <div class="checkbox-field"><span class="checkbox ${data.hasNewFitnessMatters ? "checked" : ""}">${data.hasNewFitnessMatters ? "✓" : ""}</span> New fitness and propriety matters to disclose</div>
  ${data.hasNewFitnessMatters ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.fitnessMattersDetails)}</span></div>` : ""}

  <h2>Section 9: Declarations</h2>
  <div class="warning">
    <strong>Important Declaration</strong><br>
    Providing false or misleading information to the FCA is a criminal offence under Section 398 of the Financial Services and Markets Act 2000.
  </div>

  <div class="signature-box">
    <h3>Candidate Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.candidateDeclaration ? "checked" : ""}">${data.candidateDeclaration ? "✓" : ""}</span> I confirm the information provided is accurate and complete</div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.candidateSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.candidateSignatureDate)}</span></div>
  </div>

  <div class="signature-box">
    <h3>Firm Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.firmDeclaration ? "checked" : ""}">${data.firmDeclaration ? "✓" : ""}</span> The firm confirms it has assessed the candidate's fitness, propriety, and competence</div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.firmSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.firmSignatureDate)}</span></div>
  </div>

  <div class="footer">
    <p>This form was generated by Nasara Connect on ${format(new Date(), "PPP")}.</p>
    <p><strong>Processing time: Up to 3 months. Official submission via FCA Connect:</strong> https://connect.fca.org.uk</p>
    <p>Reference: FCA Handbook SUP 10C | SM&CR Regime</p>
  </div>
</body>
</html>`;
};
