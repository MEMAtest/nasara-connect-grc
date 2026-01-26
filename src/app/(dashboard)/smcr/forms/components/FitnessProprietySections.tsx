"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, BadgeAlert, Scale, AlertTriangle, Banknote, ChevronRight } from "lucide-react";
import type { SectionProps } from '../types/form-types';
import { SectionInfo } from './SectionInfo';

export function FitnessProprietySections({
  formData,
  updateField,
  onNext,
  onBack,
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-600" />
          Sections 7-11: Fitness & Propriety
        </CardTitle>
        <CardDescription>
          Disclosure questions about the candidate's background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Important disclosure rules" variant="warning">
          <p><strong>Answer YES</strong> to any question that applies, even if you think it's minor or historical.</p>
          <p><strong>Answering YES does NOT automatically disqualify</strong> - the FCA considers each case individually.</p>
          <p><strong>Failure to disclose</strong> is itself a fitness & propriety concern and may result in rejection or later enforcement.</p>
          <p className="mt-1 font-medium">When in doubt, DISCLOSE.</p>
        </SectionInfo>

        <Accordion type="single" collapsible defaultValue="criminal" className="space-y-2">
          {/* Criminal Matters */}
          <AccordionItem value="criminal" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 text-slate-600" />
                <span>Section 7: Criminal Matters</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <p className="text-xs text-slate-600">Include spent convictions, cautions, bind-overs, and motoring offences (except parking).</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasCriminalConviction"
                    checked={formData.hasCriminalConviction}
                    onCheckedChange={(checked) => updateField("hasCriminalConviction", Boolean(checked))}
                  />
                  <Label htmlFor="hasCriminalConviction" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever been convicted of any criminal offence (including spent convictions)?
                  </Label>
                </div>
                {formData.hasCriminalConviction && (
                  <Textarea
                    value={formData.criminalDetails}
                    onChange={(e) => updateField("criminalDetails", e.target.value)}
                    placeholder="Provide details: Date, offence, court, sentence, and any rehabilitation"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasPendingProsecution"
                    checked={formData.hasPendingProsecution}
                    onCheckedChange={(checked) => updateField("hasPendingProsecution", Boolean(checked))}
                  />
                  <Label htmlFor="hasPendingProsecution" className="font-normal cursor-pointer text-sm">
                    Is the candidate currently subject to any criminal investigation or pending prosecution?
                  </Label>
                </div>
                {formData.hasPendingProsecution && (
                  <Textarea
                    value={formData.pendingProsecutionDetails}
                    onChange={(e) => updateField("pendingProsecutionDetails", e.target.value)}
                    placeholder="Provide details of the investigation/prosecution"
                    rows={3}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Civil Proceedings */}
          <AccordionItem value="civil" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-slate-600" />
                <span>Section 8: Civil Proceedings</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <p className="text-xs text-slate-600">Include any civil proceedings related to financial matters, fraud, or misrepresentation.</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasCivilProceedings"
                    checked={formData.hasCivilProceedings}
                    onCheckedChange={(checked) => updateField("hasCivilProceedings", Boolean(checked))}
                  />
                  <Label htmlFor="hasCivilProceedings" className="font-normal cursor-pointer text-sm">
                    Has the candidate been the subject of any adverse finding or settlement in civil proceedings (particularly related to financial services, fraud, or misrepresentation)?
                  </Label>
                </div>
                {formData.hasCivilProceedings && (
                  <Textarea
                    value={formData.civilDetails}
                    onChange={(e) => updateField("civilDetails", e.target.value)}
                    placeholder="Provide details including dates, parties involved, and outcome"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasJudgmentAgainst"
                    checked={formData.hasJudgmentAgainst}
                    onCheckedChange={(checked) => updateField("hasJudgmentAgainst", Boolean(checked))}
                  />
                  <Label htmlFor="hasJudgmentAgainst" className="font-normal cursor-pointer text-sm">
                    Has any court judgment been entered against the candidate?
                  </Label>
                </div>
                {formData.hasJudgmentAgainst && (
                  <Textarea
                    value={formData.judgmentDetails}
                    onChange={(e) => updateField("judgmentDetails", e.target.value)}
                    placeholder="Provide details of the judgment"
                    rows={3}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Regulatory Matters */}
          <AccordionItem value="regulatory" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-600" />
                <span>Section 9: Regulatory Matters</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <p className="text-xs text-slate-600">Include any interaction with financial regulators worldwide (FCA, PRA, SEC, etc.).</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasRegulatoryAction"
                    checked={formData.hasRegulatoryAction}
                    onCheckedChange={(checked) => updateField("hasRegulatoryAction", Boolean(checked))}
                  />
                  <Label htmlFor="hasRegulatoryAction" className="font-normal cursor-pointer text-sm">
                    Has the candidate been the subject of any investigation or disciplinary action by any regulator or professional body?
                  </Label>
                </div>
                {formData.hasRegulatoryAction && (
                  <Textarea
                    value={formData.regulatoryActionDetails}
                    onChange={(e) => updateField("regulatoryActionDetails", e.target.value)}
                    placeholder="Provide details including regulator name, dates, and outcome"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasRefusedAuthorisation"
                    checked={formData.hasRefusedAuthorisation}
                    onCheckedChange={(checked) => updateField("hasRefusedAuthorisation", Boolean(checked))}
                  />
                  <Label htmlFor="hasRefusedAuthorisation" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever been refused authorisation, registration, or approval by any regulator?
                  </Label>
                </div>
                {formData.hasRefusedAuthorisation && (
                  <Textarea
                    value={formData.refusedAuthorisationDetails}
                    onChange={(e) => updateField("refusedAuthorisationDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasSuspendedLicense"
                    checked={formData.hasSuspendedLicense}
                    onCheckedChange={(checked) => updateField("hasSuspendedLicense", Boolean(checked))}
                  />
                  <Label htmlFor="hasSuspendedLicense" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever had a licence, membership, or registration suspended or revoked?
                  </Label>
                </div>
                {formData.hasSuspendedLicense && (
                  <Textarea
                    value={formData.suspendedLicenseDetails}
                    onChange={(e) => updateField("suspendedLicenseDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Employment & Disciplinary */}
          <AccordionItem value="employment" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-600" />
                <span>Section 10: Employment & Disciplinary</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasDisciplinaryAction"
                    checked={formData.hasDisciplinaryAction}
                    onCheckedChange={(checked) => updateField("hasDisciplinaryAction", Boolean(checked))}
                  />
                  <Label htmlFor="hasDisciplinaryAction" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever been subject to disciplinary action by an employer?
                  </Label>
                </div>
                {formData.hasDisciplinaryAction && (
                  <Textarea
                    value={formData.disciplinaryDetails}
                    onChange={(e) => updateField("disciplinaryDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasDismissed"
                    checked={formData.hasDismissed}
                    onCheckedChange={(checked) => updateField("hasDismissed", Boolean(checked))}
                  />
                  <Label htmlFor="hasDismissed" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever been dismissed or asked to resign from employment?
                  </Label>
                </div>
                {formData.hasDismissed && (
                  <Textarea
                    value={formData.dismissedDetails}
                    onChange={(e) => updateField("dismissedDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasResignedInvestigation"
                    checked={formData.hasResignedInvestigation}
                    onCheckedChange={(checked) => updateField("hasResignedInvestigation", Boolean(checked))}
                  />
                  <Label htmlFor="hasResignedInvestigation" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever resigned while under investigation or facing disciplinary action?
                  </Label>
                </div>
                {formData.hasResignedInvestigation && (
                  <Textarea
                    value={formData.resignedInvestigationDetails}
                    onChange={(e) => updateField("resignedInvestigationDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financial Soundness */}
          <AccordionItem value="financial" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-slate-600" />
                <span>Section 11: Financial Soundness</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasBankruptcy"
                    checked={formData.hasBankruptcy}
                    onCheckedChange={(checked) => updateField("hasBankruptcy", Boolean(checked))}
                  />
                  <Label htmlFor="hasBankruptcy" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever been declared bankrupt or had assets sequestrated?
                  </Label>
                </div>
                {formData.hasBankruptcy && (
                  <Textarea
                    value={formData.bankruptcyDetails}
                    onChange={(e) => updateField("bankruptcyDetails", e.target.value)}
                    placeholder="Provide details including date and discharge date"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasIVA"
                    checked={formData.hasIVA}
                    onCheckedChange={(checked) => updateField("hasIVA", Boolean(checked))}
                  />
                  <Label htmlFor="hasIVA" className="font-normal cursor-pointer text-sm">
                    Has the candidate ever entered into an Individual Voluntary Arrangement (IVA) or similar?
                  </Label>
                </div>
                {formData.hasIVA && (
                  <Textarea
                    value={formData.ivaDetails}
                    onChange={(e) => updateField("ivaDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasCCJ"
                    checked={formData.hasCCJ}
                    onCheckedChange={(checked) => updateField("hasCCJ", Boolean(checked))}
                  />
                  <Label htmlFor="hasCCJ" className="font-normal cursor-pointer text-sm">
                    Does the candidate have any outstanding County Court Judgments (CCJs)?
                  </Label>
                </div>
                {formData.hasCCJ && (
                  <Textarea
                    value={formData.ccjDetails}
                    onChange={(e) => updateField("ccjDetails", e.target.value)}
                    placeholder="Provide details"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasCompanyInsolvency"
                    checked={formData.hasCompanyInsolvency}
                    onCheckedChange={(checked) => updateField("hasCompanyInsolvency", Boolean(checked))}
                  />
                  <Label htmlFor="hasCompanyInsolvency" className="font-normal cursor-pointer text-sm">
                    Has the candidate been a director of a company that went into insolvency, liquidation, or administration while they were a director or within 12 months of them leaving?
                  </Label>
                </div>
                {formData.hasCompanyInsolvency && (
                  <Textarea
                    value={formData.companyInsolvencyDetails}
                    onChange={(e) => updateField("companyInsolvencyDetails", e.target.value)}
                    placeholder="Provide company name, your role, and circumstances"
                    rows={3}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Statement of Responsibilities <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
