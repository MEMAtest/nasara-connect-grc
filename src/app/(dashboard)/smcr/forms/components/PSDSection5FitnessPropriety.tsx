"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, ChevronRight, AlertTriangle } from "lucide-react";
import type { PSDFormSectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

export function PSDSection5FitnessPropriety({
  formData,
  updateField,
  onNext,
  onBack,
}: PSDFormSectionProps) {
  // Check if any Part A questions are Yes
  const hasPartADisclosures = formData.hasCriminalConviction ||
    formData.hasPendingInvestigation ||
    formData.hasCurrentCriminalProceedings ||
    formData.hasPastCriminalProceedings ||
    formData.hasOrganisationInsolvency;

  // Check if any Part B questions are Yes
  const hasPartBDisclosures = formData.hasCivilInvestigations ||
    formData.hasCivilDecisionsAgainst ||
    formData.hasCivilEnforcement ||
    formData.hasSupervisoryInvolvement ||
    formData.hasBankruptcyFiled ||
    formData.hasBeenBankrupt ||
    formData.hasBankruptcyRestrictions ||
    formData.hasCreditorArrangements ||
    formData.hasAssetsSequestrated ||
    formData.hasBankruptcyProceedings ||
    formData.hasCurrentBankruptcyProceedings ||
    formData.hasOutstandingFinancialObligations;

  // Check if any Part C questions are Yes
  const hasPartCDisclosures = formData.hasBeenDismissed ||
    formData.hasBeenAskedToResign ||
    formData.hasBeenSuspended ||
    formData.hasBeenDisqualifiedDirector ||
    formData.hasDisciplinaryProceedings ||
    formData.hasDisciplinaryInvestigation ||
    formData.hasNotifiedDisciplinary ||
    formData.hasMalpracticeAllegations;

  // Check if any Part D questions are Yes
  const hasPartDDisclosures = formData.hasRefusedAuthorisation ||
    formData.hasBeenExcluded ||
    formData.hasPreviousReputationAssessment;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Section 5: Fitness and Propriety
        </CardTitle>
        <CardDescription>
          Disclosures relating to criminal, civil, business, and regulatory matters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Disclosure Requirements" variant="warning">
          <p>Give the <strong>widest possible interpretation</strong> to all questions. The FCA treats non-disclosure very seriously.</p>
          <p className="mt-1"><strong>If in doubt, disclose.</strong> It is better to disclose something that turns out to be irrelevant than to fail to disclose something material.</p>
          <p className="mt-1">Include matters both in the UK and overseas. Any "Yes" answers require full details in Section 6.</p>
          <p className="mt-1 text-xs">A standard DBS (Disclosure and Barring Service) check should be carried out for individuals not currently approved as an SMF manager. Evidence should be available on request.</p>
        </SectionInfo>

        {/* Part A - Criminal Proceedings */}
        <div className="border rounded-lg p-4 space-y-4" role="group" aria-label="Part A – Criminal Proceedings">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Part A – Criminal Proceedings
          </h3>
          <p className="text-xs text-slate-600">
            Include spent convictions and cautions (other than protected convictions). Include all matters in the UK or overseas.
          </p>

          <div className="space-y-3">
            <QuestionCheckbox
              id="hasCriminalConviction"
              checked={formData.hasCriminalConviction}
              onChange={(checked) => updateField("hasCriminalConviction", checked)}
              question="5.1(i) Has the PSD Individual ever been convicted of any criminal offence?"
              helpText="Include any conviction with absolute/conditional discharge. Include driving bans or uninsured driving only."
            />

            <QuestionCheckbox
              id="hasPendingInvestigation"
              checked={formData.hasPendingInvestigation}
              onChange={(checked) => updateField("hasPendingInvestigation", checked)}
              question="5.1(ii) Is the PSD Individual currently the subject of any pending criminal investigation?"
              helpText="Include all matters even where the individual was not the direct subject."
            />

            <QuestionCheckbox
              id="hasCurrentCriminalProceedings"
              checked={formData.hasCurrentCriminalProceedings}
              onChange={(checked) => updateField("hasCurrentCriminalProceedings", checked)}
              question="5.2(i) Is the PSD Individual currently the subject of any proceedings relating to any criminal offence?"
            />

            <QuestionCheckbox
              id="hasPastCriminalProceedings"
              checked={formData.hasPastCriminalProceedings}
              onChange={(checked) => updateField("hasPastCriminalProceedings", checked)}
              question="5.2(ii) Has the PSD Individual ever been the subject of any proceedings or investigations relating to any criminal offence?"
            />

            <div className="border-t pt-3">
              <Label className="text-xs font-medium text-slate-600 block mb-2">
                5.2(iii) For an individual not currently approved as an SMF manager, has a criminal record check been carried out within the last 6 months?
              </Label>
              <RadioGroup
                value={formData.hasCriminalRecordCheck === true ? "yes" : formData.hasCriminalRecordCheck === false ? "no" : "na"}
                onValueChange={(value) => updateField("hasCriminalRecordCheck", value === "yes" ? true : value === "no" ? false : false)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="crc-no" />
                  <Label htmlFor="crc-no" className="font-normal text-sm">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="crc-yes" />
                  <Label htmlFor="crc-yes" className="font-normal text-sm">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="na" id="crc-na" />
                  <Label htmlFor="crc-na" className="font-normal text-sm">N/A</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-slate-500 mt-1">A standard DBS check must be carried out. Evidence should be available upon request.</p>
            </div>

            <QuestionCheckbox
              id="hasOrganisationInsolvency"
              checked={formData.hasOrganisationInsolvency}
              onChange={(checked) => updateField("hasOrganisationInsolvency", checked)}
              question="5.3 Has any organisation at which the PSD Individual holds/held a position of responsibility ever been involved as a debtor in insolvency or comparable proceedings?"
            />
          </div>

          {hasPartADisclosures && (
            <div className="bg-amber-50 p-3 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="partADetailsProvided"
                  checked={formData.partADetailsProvided}
                  onCheckedChange={(checked) => updateField("partADetailsProvided", Boolean(checked))}
                />
                <Label htmlFor="partADetailsProvided" className="font-normal cursor-pointer text-sm text-amber-800">
                  5.4 I confirm full details have been provided in Section 6, including reason(s), date(s), duration, and supporting documents *
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Part B - Civil and Administrative Proceedings */}
        <div className="border rounded-lg p-4 space-y-4" role="group" aria-label="Part B – Civil and Administrative Proceedings">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Part B – Civil and Administrative Proceedings
          </h3>
          <p className="text-xs text-slate-600">Include matters in the UK or overseas.</p>

          <div className="space-y-3">
            <QuestionCheckbox
              id="hasCivilInvestigations"
              checked={formData.hasCivilInvestigations}
              onChange={(checked) => updateField("hasCivilInvestigations", checked)}
              question="5.5(i) Has the PSD Individual ever been the subject of any civil or administrative investigations or proceedings?"
            />

            <QuestionCheckbox
              id="hasCivilDecisionsAgainst"
              checked={formData.hasCivilDecisionsAgainst}
              onChange={(checked) => updateField("hasCivilDecisionsAgainst", checked)}
              question="5.5(ii) Has the PSD Individual been subject to civil or administrative decisions that were found against them?"
              helpText="Include injunctions and employment tribunal proceedings."
            />

            <QuestionCheckbox
              id="hasCivilEnforcement"
              checked={formData.hasCivilEnforcement}
              onChange={(checked) => updateField("hasCivilEnforcement", checked)}
              question="5.5(iii) Has the PSD Individual been the subject of any civil or administrative enforcement proceedings, sanctions or other enforcement decisions?"
              helpText="Include all CCJs whether satisfied or not."
            />

            <QuestionCheckbox
              id="hasSupervisoryInvolvement"
              checked={formData.hasSupervisoryInvolvement}
              onChange={(checked) => updateField("hasSupervisoryInvolvement", checked)}
              question="5.5(iv) Has the PSD Individual been directly or indirectly involved in any investigation, enforcement proceedings or sanctions by a supervisory authority?"
            />

            <div className="flex items-start gap-3">
              <Checkbox
                id="civilCertificateAttached"
                checked={formData.civilCertificateAttached}
                onCheckedChange={(checked) => updateField("civilCertificateAttached", Boolean(checked))}
              />
              <Label htmlFor="civilCertificateAttached" className="font-normal cursor-pointer text-sm">
                5.6 Official certificate or equivalent document attached (where obtainable)
              </Label>
            </div>

            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium text-slate-600 mb-2">5.7 Has the PSD Individual ever:</p>

              <QuestionCheckbox
                id="hasBankruptcyFiled"
                checked={formData.hasBankruptcyFiled}
                onChange={(checked) => updateField("hasBankruptcyFiled", checked)}
                question="(i) Filed for bankruptcy or had a bankruptcy petition served?"
              />

              <QuestionCheckbox
                id="hasBeenBankrupt"
                checked={formData.hasBeenBankrupt}
                onChange={(checked) => updateField("hasBeenBankrupt", checked)}
                question="(ii) Been adjudged bankrupt?"
              />

              <QuestionCheckbox
                id="hasBankruptcyRestrictions"
                checked={formData.hasBankruptcyRestrictions}
                onChange={(checked) => updateField("hasBankruptcyRestrictions", checked)}
                question="(iii) Been subject to a bankruptcy restrictions order or undertaking?"
              />

              <QuestionCheckbox
                id="hasCreditorArrangements"
                checked={formData.hasCreditorArrangements}
                onChange={(checked) => updateField("hasCreditorArrangements", checked)}
                question="(iv) Made any arrangements with creditors (deed of arrangement, IVA, trust deed)?"
              />

              <QuestionCheckbox
                id="hasAssetsSequestrated"
                checked={formData.hasAssetsSequestrated}
                onChange={(checked) => updateField("hasAssetsSequestrated", checked)}
                question="(v) Had assets sequestrated?"
              />

              <QuestionCheckbox
                id="hasBankruptcyProceedings"
                checked={formData.hasBankruptcyProceedings}
                onChange={(checked) => updateField("hasBankruptcyProceedings", checked)}
                question="(vi) Been involved in any proceeding relating to the above even if no order resulted?"
              />
            </div>

            <QuestionCheckbox
              id="hasCurrentBankruptcyProceedings"
              checked={formData.hasCurrentBankruptcyProceedings}
              onChange={(checked) => updateField("hasCurrentBankruptcyProceedings", checked)}
              question="5.8 Is the PSD Individual currently involved in any proceedings in relation to 5.7(i)-(vi)?"
            />

            <QuestionCheckbox
              id="hasOutstandingFinancialObligations"
              checked={formData.hasOutstandingFinancialObligations}
              onChange={(checked) => updateField("hasOutstandingFinancialObligations", checked)}
              question="5.9 Does the PSD Individual have any outstanding financial obligations connected with regulated activities?"
            />
          </div>

          {hasPartBDisclosures && (
            <div className="bg-amber-50 p-3 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="partBDetailsProvided"
                  checked={formData.partBDetailsProvided}
                  onCheckedChange={(checked) => updateField("partBDetailsProvided", Boolean(checked))}
                />
                <Label htmlFor="partBDetailsProvided" className="font-normal cursor-pointer text-sm text-amber-800">
                  5.10 I confirm full details have been provided in Section 6 with supporting documents *
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Part C - Business and Employment Matters */}
        <div className="border rounded-lg p-4 space-y-4" role="group" aria-label="Part C – Business and Employment Matters">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Part C – Business and Employment Matters
          </h3>
          <p className="text-xs text-slate-600">Include matters in the UK or overseas. Not limited to roles in Section 4.</p>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">5.11 Has the PSD Individual ever been:</p>

            <QuestionCheckbox
              id="hasBeenDismissed"
              checked={formData.hasBeenDismissed}
              onChange={(checked) => updateField("hasBeenDismissed", checked)}
              question="(i) Dismissed"
            />

            <QuestionCheckbox
              id="hasBeenAskedToResign"
              checked={formData.hasBeenAskedToResign}
              onChange={(checked) => updateField("hasBeenAskedToResign", checked)}
              question="(ii) Asked to resign"
            />

            <QuestionCheckbox
              id="hasBeenSuspended"
              checked={formData.hasBeenSuspended}
              onChange={(checked) => updateField("hasBeenSuspended", checked)}
              question="(iii) Suspended"
              helpText="From any profession, vocation, office, employment, position of trust, fiduciary appointment or similar, whether or not remunerated."
            />

            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium text-slate-600 mb-2">5.12 Has the PSD Individual ever been:</p>

              <QuestionCheckbox
                id="hasBeenDisqualifiedDirector"
                checked={formData.hasBeenDisqualifiedDirector}
                onChange={(checked) => updateField("hasBeenDisqualifiedDirector", checked)}
                question="(i) Disqualified from acting as a director or similar position?"
              />

              <QuestionCheckbox
                id="hasDisciplinaryProceedings"
                checked={formData.hasDisciplinaryProceedings}
                onChange={(checked) => updateField("hasDisciplinaryProceedings", checked)}
                question="(ii) The subject of any proceedings of a disciplinary nature (whether or not resulting in any finding)?"
              />

              <QuestionCheckbox
                id="hasDisciplinaryInvestigation"
                checked={formData.hasDisciplinaryInvestigation}
                onChange={(checked) => updateField("hasDisciplinaryInvestigation", checked)}
                question="(iii) The subject of any investigation which might lead to/have led to disciplinary proceedings?"
              />

              <QuestionCheckbox
                id="hasNotifiedDisciplinary"
                checked={formData.hasNotifiedDisciplinary}
                onChange={(checked) => updateField("hasNotifiedDisciplinary", checked)}
                question="(iv) Notified of any potential proceedings of a disciplinary nature?"
              />

              <QuestionCheckbox
                id="hasMalpracticeAllegations"
                checked={formData.hasMalpracticeAllegations}
                onChange={(checked) => updateField("hasMalpracticeAllegations", checked)}
                question="(v) The subject of any allegations of malpractice or misconduct in connection with any business activities?"
              />
            </div>
          </div>

          {hasPartCDisclosures && (
            <div className="bg-amber-50 p-3 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="partCDetailsProvided"
                  checked={formData.partCDetailsProvided}
                  onCheckedChange={(checked) => updateField("partCDetailsProvided", Boolean(checked))}
                />
                <Label htmlFor="partCDetailsProvided" className="font-normal cursor-pointer text-sm text-amber-800">
                  5.13 I confirm full details have been provided in Section 6 with supporting documents *
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Part D - Regulatory Matters */}
        <div className="border rounded-lg p-4 space-y-4" role="group" aria-label="Part D – Regulatory Matters">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Part D – Regulatory Matters
          </h3>
          <p className="text-xs text-slate-600">Include matters in the UK or overseas.</p>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">5.14 Has the PSD Individual ever:</p>

            <QuestionCheckbox
              id="hasRefusedAuthorisation"
              checked={formData.hasRefusedAuthorisation}
              onChange={(checked) => updateField("hasRefusedAuthorisation", checked)}
              question="(i) Been refused, had revoked, or terminated, any authorisation, registration, membership or licence to carry out a trade, business or a profession?"
            />

            <QuestionCheckbox
              id="hasBeenExcluded"
              checked={formData.hasBeenExcluded}
              onChange={(checked) => updateField("hasBeenExcluded", checked)}
              question="(ii) Been excluded by a competent authority or public sector entity in financial services or by a professional body (including disbarment, dismissal, expulsion)?"
            />

            <div className="border-t pt-3 mt-3">
              <Label className="text-xs font-medium text-slate-600 block mb-2">
                5.15 Has an assessment of reputation of the PSD individual already been conducted by another competent authority?
              </Label>
              <RadioGroup
                value={formData.hasPreviousReputationAssessment ? "yes" : "no"}
                onValueChange={(value) => updateField("hasPreviousReputationAssessment", value === "yes")}
                className="flex gap-4 mb-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="prev-assess-no" />
                  <Label htmlFor="prev-assess-no" className="font-normal text-sm">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="prev-assess-yes" />
                  <Label htmlFor="prev-assess-yes" className="font-normal text-sm">Yes</Label>
                </div>
              </RadioGroup>

              {formData.hasPreviousReputationAssessment && (
                <div>
                  <Label htmlFor="previousAssessmentDetails">Provide details (authority name, date, outcome)</Label>
                  <Textarea
                    id="previousAssessmentDetails"
                    value={formData.previousAssessmentDetails}
                    onChange={(e) => updateField("previousAssessmentDetails", e.target.value)}
                    placeholder="Name of authority, date of assessment, and evidence of outcome..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {hasPartDDisclosures && (
            <div className="bg-amber-50 p-3 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="partDDetailsProvided"
                  checked={formData.partDDetailsProvided}
                  onCheckedChange={(checked) => updateField("partDDetailsProvided", Boolean(checked))}
                />
                <Label htmlFor="partDDetailsProvided" className="font-normal cursor-pointer text-sm text-amber-800">
                  5.16 I confirm full details have been provided in Section 6 with supporting documents *
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Supplementary Info <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for yes/no question radio buttons
function QuestionCheckbox({
  id,
  checked,
  onChange,
  question,
  helpText,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  question: string;
  helpText?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2" role="group" aria-labelledby={`${id}-label`}>
      <RadioGroup
        value={checked ? "yes" : "no"}
        onValueChange={(v) => onChange(v === "yes")}
        className="flex gap-3 items-center min-w-[80px]"
      >
        <div className="flex items-center gap-1">
          <RadioGroupItem value="no" id={`${id}-no`} />
          <Label htmlFor={`${id}-no`} className="text-xs font-normal">No</Label>
        </div>
        <div className="flex items-center gap-1">
          <RadioGroupItem value="yes" id={`${id}-yes`} />
          <Label htmlFor={`${id}-yes`} className="text-xs font-normal">Yes</Label>
        </div>
      </RadioGroup>
      <div className="flex-1">
        <Label id={`${id}-label`} className="font-normal text-sm">{question}</Label>
        {helpText && <p id={`${id}-help`} className="text-xs text-slate-500 mt-0.5">{helpText}</p>}
      </div>
    </div>
  );
}
