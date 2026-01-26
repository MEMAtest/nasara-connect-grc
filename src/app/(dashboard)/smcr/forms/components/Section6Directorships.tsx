"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, ChevronRight } from "lucide-react";
import type { FormAState, DirectorshipEntry } from '../types/form-types';
import { FieldHelp } from './FieldHelp';
import { SectionInfo } from './SectionInfo';

interface Section6Props {
  formData: FormAState;
  updateDirectorship: <K extends keyof DirectorshipEntry>(id: string, field: K, value: DirectorshipEntry[K]) => void;
  addDirectorship: () => void;
  removeDirectorship: (id: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function Section6Directorships({
  formData,
  updateDirectorship,
  addDirectorship,
  removeDirectorship,
  onNext,
  onBack,
}: Section6Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-teal-600" />
          Section 6: Directorships (Past 10 Years)
        </CardTitle>
        <CardDescription>
          All directorships held in the past 10 years, including current
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionInfo title="What to include" variant="info">
          <p>List ALL directorships including:</p>
          <p>• Executive and non-executive positions</p>
          <p>• Dormant companies and holding companies</p>
          <p>• Charitable organisations where you are a trustee/director</p>
        </SectionInfo>

        {formData.directorships.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Building className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>No directorships added yet</p>
            <p className="text-xs">If the candidate has no directorships, proceed to the next section</p>
          </div>
        ) : (
          formData.directorships.map((dir, index) => (
            <div key={dir.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Directorship {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDirectorship(dir.id)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`companyName-${dir.id}`}>Company Name *</Label>
                  <Input
                    id={`companyName-${dir.id}`}
                    value={dir.companyName}
                    onChange={(e) => updateDirectorship(dir.id, "companyName", e.target.value)}
                    aria-required="true"
                  />
                </div>
                <div>
                  <Label htmlFor={`position-${dir.id}`}>Position *</Label>
                  <Input
                    id={`position-${dir.id}`}
                    value={dir.position}
                    onChange={(e) => updateDirectorship(dir.id, "position", e.target.value)}
                    placeholder="e.g., Director, NED, Chairman"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`natureOfBusiness-${dir.id}`}>Nature of Business</Label>
                <Input
                  id={`natureOfBusiness-${dir.id}`}
                  value={dir.natureOfBusiness}
                  onChange={(e) => updateDirectorship(dir.id, "natureOfBusiness", e.target.value)}
                  placeholder="e.g., Financial services, Property holding"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`appointedDate-${dir.id}`}>Date Appointed</Label>
                  <Input
                    id={`appointedDate-${dir.id}`}
                    type="date"
                    value={dir.appointedDate}
                    onChange={(e) => updateDirectorship(dir.id, "appointedDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`resignedDate-${dir.id}`}>Date Resigned</Label>
                  <Input
                    id={`resignedDate-${dir.id}`}
                    type="date"
                    value={dir.resignedDate}
                    onChange={(e) => updateDirectorship(dir.id, "resignedDate", e.target.value)}
                    aria-describedby={`resignedDate-help-${dir.id}`}
                  />
                  <FieldHelp><span id={`resignedDate-help-${dir.id}`}>Leave blank if still active</span></FieldHelp>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id={`active-${dir.id}`}
                  checked={dir.isActive}
                  onCheckedChange={(checked) => updateDirectorship(dir.id, "isActive", Boolean(checked))}
                />
                <Label htmlFor={`active-${dir.id}`} className="font-normal cursor-pointer">
                  Currently active directorship
                </Label>
              </div>
            </div>
          ))
        )}

        <Button variant="outline" onClick={addDirectorship} className="w-full">
          + Add Directorship
        </Button>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Fitness & Propriety <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
