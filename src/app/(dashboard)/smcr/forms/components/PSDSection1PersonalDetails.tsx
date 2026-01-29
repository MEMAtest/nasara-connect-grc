"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { PSDFormSectionProps, PSDAddressEntry } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';
import { createEmptyPSDAddress } from '../utils/form-constants';

interface PSDSection1Props extends PSDFormSectionProps {
  addPreviousAddress: () => void;
  updatePreviousAddress: <K extends keyof PSDAddressEntry>(id: string, field: K, value: PSDAddressEntry[K]) => void;
  removePreviousAddress: (id: string) => void;
}

export function PSDSection1PersonalDetails({
  formData,
  updateField,
  validationErrors,
  validateField,
  onNext,
  addPreviousAddress,
  updatePreviousAddress,
  removePreviousAddress,
}: PSDSection1Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Section 1: Personal Identification Details
        </CardTitle>
        <CardDescription>
          Personal details of the PSD Individual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="Important" variant="warning">
          <p>If the individual has more than one previous name, passport number or nationality, or is known by any other names, provide details in Section 6 (Supplementary Information).</p>
        </SectionInfo>

        {/* 1.1 FCA Reference */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">FCA/Previous Regulator Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fcaIRN">1.1a FCA Individual Reference Number (IRN)</Label>
              <Input
                id="fcaIRN"
                value={formData.fcaIRN}
                onChange={(e) => updateField("fcaIRN", e.target.value)}
                placeholder="If already registered with FCA"
              />
              <FieldHelp>Leave blank if not previously registered</FieldHelp>
            </div>
            <div>
              <Label htmlFor="previousRegulatoryBody">1.1b Previous Regulatory Body</Label>
              <Input
                id="previousRegulatoryBody"
                value={formData.previousRegulatoryBody}
                onChange={(e) => updateField("previousRegulatoryBody", e.target.value)}
                placeholder="Name of previous regulator"
              />
            </div>
            <div>
              <Label htmlFor="previousReferenceNumber">1.1c Previous Reference Number</Label>
              <Input
                id="previousReferenceNumber"
                value={formData.previousReferenceNumber}
                onChange={(e) => updateField("previousReferenceNumber", e.target.value)}
                placeholder="If applicable"
              />
            </div>
          </div>
        </div>

        {/* 1.2-1.6 Name Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="title">1.2 Title *</Label>
            <Select value={formData.title} onValueChange={(value) => updateField("title", value)}>
              <SelectTrigger id="title">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
                <SelectItem value="Prof">Prof</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="surname">1.3 Surname *</Label>
            <Input
              id="surname"
              value={formData.surname}
              onChange={(e) => updateField("surname", e.target.value)}
              placeholder="Family name"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="forenames">1.4 ALL Forenames *</Label>
            <Input
              id="forenames"
              value={formData.forenames}
              onChange={(e) => updateField("forenames", e.target.value)}
              placeholder="All first and middle names"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nameKnownBy">1.5 Name Commonly Known By</Label>
            <Input
              id="nameKnownBy"
              value={formData.nameKnownBy}
              onChange={(e) => updateField("nameKnownBy", e.target.value)}
              placeholder="If different from legal name"
            />
            <FieldHelp>E.g., shortened version or middle name used</FieldHelp>
          </div>
          <div>
            <Label htmlFor="previousNames">1.6 Previous Name(s)</Label>
            <Input
              id="previousNames"
              value={formData.previousNames}
              onChange={(e) => updateField("previousNames", e.target.value)}
              placeholder="E.g., maiden name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dateOfNameChange">1.7 Date of Name Change</Label>
            <Input
              id="dateOfNameChange"
              type="date"
              value={formData.dateOfNameChange}
              onChange={(e) => updateField("dateOfNameChange", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gender">1.8 Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">1.9 Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        {/* 1.10-1.13 Birth and Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="placeOfBirth">1.10 Place of Birth *</Label>
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={(e) => updateField("placeOfBirth", e.target.value)}
              placeholder="Town/City and Country"
            />
          </div>
          <div>
            <Label htmlFor="nationality">1.13 Nationality *</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => updateField("nationality", e.target.value)}
              placeholder="E.g., British"
            />
            <FieldHelp>If multiple nationalities, provide details in Section 6</FieldHelp>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationalInsurance">1.11 National Insurance Number</Label>
            <Input
              id="nationalInsurance"
              value={formData.nationalInsurance}
              onChange={(e) => updateField("nationalInsurance", e.target.value)}
              onBlur={(e) => validateField("nationalInsurance", e.target.value, "ni")}
              placeholder="AB 12 34 56 C"
            />
            {validationErrors.nationalInsurance && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.nationalInsurance}</p>
            )}
          </div>
          <div>
            <Label htmlFor="passportNumber">1.12 Passport Number</Label>
            <Input
              id="passportNumber"
              value={formData.passportNumber}
              onChange={(e) => updateField("passportNumber", e.target.value)}
              placeholder="If available"
            />
            <FieldHelp>Copy not required but should be available upon request</FieldHelp>
          </div>
        </div>

        {/* 1.14 Current Address */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">1.14 Current Private Address *</h3>
          <div>
            <Label htmlFor="currentAddress">Address</Label>
            <Textarea
              id="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => updateField("currentAddress", e.target.value)}
              placeholder="Full address"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentPostcode">Postcode *</Label>
              <Input
                id="currentPostcode"
                value={formData.currentPostcode}
                onChange={(e) => updateField("currentPostcode", e.target.value)}
                placeholder="E.g., SW1A 1AA"
              />
            </div>
            <div>
              <Label htmlFor="currentAddressFromDate">Resident From (mm/yyyy) *</Label>
              <Input
                id="currentAddressFromDate"
                type="month"
                value={formData.currentAddressFromDate}
                onChange={(e) => updateField("currentAddressFromDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 1.15 Previous Addresses */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">1.15 Previous Addresses (3-year history)</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPreviousAddress}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Address
            </Button>
          </div>
          <FieldHelp>If address changed in the last 3 years, provide previous addresses</FieldHelp>

          {formData.previousAddresses.map((addr, index) => (
            <div key={addr.id} className="border rounded p-3 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Previous Address {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePreviousAddress(addr.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={addr.address}
                  onChange={(e) => updatePreviousAddress(addr.id, "address", e.target.value)}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Postcode</Label>
                  <Input
                    value={addr.postcode}
                    onChange={(e) => updatePreviousAddress(addr.id, "postcode", e.target.value)}
                    placeholder="Postcode"
                  />
                </div>
                <div>
                  <Label>From (mm/yyyy)</Label>
                  <Input
                    type="month"
                    value={addr.fromDate}
                    onChange={(e) => updatePreviousAddress(addr.id, "fromDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>To (mm/yyyy)</Label>
                  <Input
                    type="month"
                    value={addr.toDate}
                    onChange={(e) => updatePreviousAddress(addr.id, "toDate", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {formData.previousAddresses.length === 0 && (
            <p className="text-xs text-slate-500 italic">No previous addresses added. Add if address changed in last 3 years.</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext}>
            Next: Firm Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
