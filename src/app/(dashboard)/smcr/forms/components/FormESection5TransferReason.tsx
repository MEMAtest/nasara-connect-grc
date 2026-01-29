"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, ChevronRight } from "lucide-react";
import type { FormESectionProps } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { transferReasons } from '../utils/form-constants';

export function FormESection5TransferReason({
  formData,
  updateField,
  onNext,
  onBack,
}: FormESectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-teal-600" />
          Section 5: Reason for Transfer
        </CardTitle>
        <CardDescription>
          Explain why the individual is changing controlled functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="transferReason">Primary Reason for Transfer *</Label>
          <Select
            value={formData.transferReason}
            onValueChange={(value) => updateField("transferReason", value)}
          >
            <SelectTrigger id="transferReason">
              <SelectValue placeholder="Select the main reason" />
            </SelectTrigger>
            <SelectContent>
              {transferReasons.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="transferDetails">Additional Details *</Label>
          <Textarea
            id="transferDetails"
            value={formData.transferDetails}
            onChange={(e) => updateField("transferDetails", e.target.value)}
            placeholder="Provide context for this transfer. Why is this change being made? How does it fit with the firm's succession planning or organizational structure?"
            rows={4}
          />
          <FieldHelp>
            The FCA may want to understand the business rationale for this change
          </FieldHelp>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Responsibilities <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
