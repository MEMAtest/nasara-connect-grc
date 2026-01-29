"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, ChevronRight } from "lucide-react";
import type { FormDSectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { changeCategories, fitnessCategories } from '../utils/form-constants';

export function FormDSection3ChangeDetails({
  formData,
  updateField,
  onNext,
  onBack,
}: FormDSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-teal-600" />
          Section 3: Change Details
        </CardTitle>
        <CardDescription>
          Specify what information is being amended
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="changeCategory">Type of Change *</Label>
          <Select
            value={formData.changeCategory}
            onValueChange={(value) => updateField("changeCategory", value)}
          >
            <SelectTrigger id="changeCategory">
              <SelectValue placeholder="Select the type of change" />
            </SelectTrigger>
            <SelectContent>
              {changeCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Name Change Section */}
        {formData.changeCategory === "name" && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Name Change</h3>
            <SectionInfo title="Documentation" variant="info">
              <p>You may be asked to provide supporting documentation such as a marriage certificate, deed poll, or court order.</p>
            </SectionInfo>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="previousForenames">Previous Forename(s)</Label>
                <Input
                  id="previousForenames"
                  value={formData.previousForenames}
                  onChange={(e) => updateField("previousForenames", e.target.value)}
                  placeholder="Previous first/middle names"
                />
              </div>
              <div>
                <Label htmlFor="previousSurname">Previous Surname</Label>
                <Input
                  id="previousSurname"
                  value={formData.previousSurname}
                  onChange={(e) => updateField("previousSurname", e.target.value)}
                  placeholder="Previous family name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newForenames">New Forename(s) *</Label>
                <Input
                  id="newForenames"
                  value={formData.newForenames}
                  onChange={(e) => updateField("newForenames", e.target.value)}
                  placeholder="New first/middle names"
                />
              </div>
              <div>
                <Label htmlFor="newSurname">New Surname *</Label>
                <Input
                  id="newSurname"
                  value={formData.newSurname}
                  onChange={(e) => updateField("newSurname", e.target.value)}
                  placeholder="New family name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reasonForNameChange">Reason for Change *</Label>
                <Select
                  value={formData.reasonForNameChange}
                  onValueChange={(value) => updateField("reasonForNameChange", value)}
                >
                  <SelectTrigger id="reasonForNameChange">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marriage">Marriage</SelectItem>
                    <SelectItem value="divorce">Divorce</SelectItem>
                    <SelectItem value="deed-poll">Deed Poll</SelectItem>
                    <SelectItem value="court-order">Court Order</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nameChangeDate">Date of Change *</Label>
                <Input
                  id="nameChangeDate"
                  type="date"
                  value={formData.nameChangeDate}
                  onChange={(e) => updateField("nameChangeDate", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Details Section */}
        {formData.changeCategory === "contact" && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Contact Details Change</h3>
            <FieldHelp>Complete only the fields that are changing</FieldHelp>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-slate-600 mb-2">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="previousAddress">Previous Address</Label>
                    <Textarea
                      id="previousAddress"
                      value={formData.previousAddress}
                      onChange={(e) => updateField("previousAddress", e.target.value)}
                      placeholder="Previous address"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newAddress">New Address</Label>
                    <Textarea
                      id="newAddress"
                      value={formData.newAddress}
                      onChange={(e) => updateField("newAddress", e.target.value)}
                      placeholder="New address"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-slate-600 mb-2">Email</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="previousEmail">Previous Email</Label>
                    <Input
                      id="previousEmail"
                      type="email"
                      value={formData.previousEmail}
                      onChange={(e) => updateField("previousEmail", e.target.value)}
                      placeholder="previous@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={formData.newEmail}
                      onChange={(e) => updateField("newEmail", e.target.value)}
                      placeholder="new@email.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-slate-600 mb-2">Phone</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="previousPhone">Previous Phone</Label>
                    <Input
                      id="previousPhone"
                      value={formData.previousPhone}
                      onChange={(e) => updateField("previousPhone", e.target.value)}
                      placeholder="+44..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPhone">New Phone</Label>
                    <Input
                      id="newPhone"
                      value={formData.newPhone}
                      onChange={(e) => updateField("newPhone", e.target.value)}
                      placeholder="+44..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* National Insurance Section */}
        {formData.changeCategory === "ni" && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">National Insurance Number Correction</h3>
            <SectionInfo title="Note" variant="warning">
              <p>This is for correcting errors in the NI number previously provided. If this is a new NI number, explain why in the reason field.</p>
            </SectionInfo>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="previousNI">Previous NI Number</Label>
                <Input
                  id="previousNI"
                  value={formData.previousNI}
                  onChange={(e) => updateField("previousNI", e.target.value)}
                  placeholder="AB 12 34 56 C"
                />
              </div>
              <div>
                <Label htmlFor="correctedNI">Correct NI Number *</Label>
                <Input
                  id="correctedNI"
                  value={formData.correctedNI}
                  onChange={(e) => updateField("correctedNI", e.target.value)}
                  placeholder="AB 12 34 56 C"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="niCorrectionReason">Reason for Correction *</Label>
              <Textarea
                id="niCorrectionReason"
                value={formData.niCorrectionReason}
                onChange={(e) => updateField("niCorrectionReason", e.target.value)}
                placeholder="Explain why the NI number is being corrected..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Fitness & Propriety Section */}
        {formData.changeCategory === "fitness" && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Fitness & Propriety Update</h3>
            <SectionInfo title="Disclosure requirement" variant="warning">
              <p><strong>You must notify the FCA</strong> of any matter that may affect the individual's fitness and propriety, including matters that arise after approval.</p>
            </SectionInfo>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fitnessCategory">Category *</Label>
                <Select
                  value={formData.fitnessCategory}
                  onValueChange={(value) => updateField("fitnessCategory", value)}
                >
                  <SelectTrigger id="fitnessCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {fitnessCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfOccurrence">Date of Occurrence *</Label>
                <Input
                  id="dateOfOccurrence"
                  type="date"
                  value={formData.dateOfOccurrence}
                  onChange={(e) => updateField("dateOfOccurrence", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fitnessDetails">Full Details *</Label>
              <Textarea
                id="fitnessDetails"
                value={formData.fitnessDetails}
                onChange={(e) => updateField("fitnessDetails", e.target.value)}
                placeholder="Provide full details of the matter, including dates, outcomes, and any mitigating factors..."
                rows={5}
              />
              <FieldHelp>Include all relevant information the FCA would need to assess the matter</FieldHelp>
            </div>
          </div>
        )}

        {/* Other Changes Section */}
        {formData.changeCategory === "other" && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Other Changes</h3>

            <div>
              <Label htmlFor="otherChangeDescription">Brief Description *</Label>
              <Input
                id="otherChangeDescription"
                value={formData.otherChangeDescription}
                onChange={(e) => updateField("otherChangeDescription", e.target.value)}
                placeholder="What is being changed?"
              />
            </div>

            <div>
              <Label htmlFor="otherChangeDetails">Full Details *</Label>
              <Textarea
                id="otherChangeDetails"
                value={formData.otherChangeDetails}
                onChange={(e) => updateField("otherChangeDetails", e.target.value)}
                placeholder="Provide full details of the change, including what the previous information was and what it should be changed to..."
                rows={4}
              />
            </div>
          </div>
        )}

        {!formData.changeCategory && (
          <SectionInfo title="Select a change type" variant="info">
            <p>Please select the type of change from the dropdown above to continue.</p>
          </SectionInfo>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={!formData.changeCategory}>
            Next: Declaration <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
