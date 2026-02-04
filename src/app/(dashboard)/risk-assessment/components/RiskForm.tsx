"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { riskFormSchema, RiskFormValues } from "../lib/riskValidation";
import {
  IMPACT_LABELS,
  LIKELIHOOD_LABELS,
  RISK_CATEGORIES,
  RISK_REVIEW_FREQUENCIES,
  RISK_VELOCITY,
} from "../lib/riskConstants";

interface RiskFormProps {
  defaultValues?: Partial<RiskFormValues>;
  onSubmit: (values: RiskFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit";
}

type AISuggestions = {
  drivers?: string;
  impacts?: string;
  similar?: string;
  controls?: string;
};

const REGULATORY_CATEGORIES = [
  "FCA Handbook",
  "Prudential",
  "Consumer Duty",
  "Financial Crime",
  "Operational Resilience",
  "SMCR",
  "Data Protection",
];

export function RiskForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  mode = "create",
}: RiskFormProps) {
  const baseValues: RiskFormValues = useMemo(
    () => ({
      title: "",
      description: "",
      category: "operational",
      subCategory: "",
      likelihood: 3,
      impact: 3,
      residualLikelihood: 3,
      residualImpact: 3,
      velocity: "medium",
      businessUnit: "",
      process: "",
      riskOwner: "",
      regulatoryCategory: [],
      reportableToFCA: false,
      consumerDutyRelevant: false,
      keyRiskIndicators: [],
      reviewFrequency: "quarterly",
    }),
    [],
  );

  const form = useForm<RiskFormValues>({
    resolver: zodResolver(riskFormSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      ...baseValues,
      ...defaultValues,
    },
  });

  useEffect(() => {
    form.reset({
      ...baseValues,
      ...defaultValues,
    });
  }, [baseValues, defaultValues, form]);

  const {
    fields: kriFields,
    append: appendKri,
    remove: removeKri,
  } = useFieldArray({
    control: form.control,
    name: "keyRiskIndicators",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);

  const handleAISuggestions = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const response = await fetch("/api/ai/risk-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.watch("title"),
          description: form.watch("description"),
          category: form.watch("category"),
        }),
      });
      if (!response.ok) {
        throw new Error("AI service unavailable");
      }
      const payload = (await response.json()) as AISuggestions;
      setAiSuggestions(payload);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Unable to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    if (mode === "create") {
      form.reset(baseValues);
      setAiSuggestions(null);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">
              {mode === "edit" ? "Update Risk" : "Risk Identification"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Clear, specific risk title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Detailed description including cause, event, and effect"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Outline how this risk manifests and potential customer, regulatory, or financial impacts.
                  </FormDescription>
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAISuggestions}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4 text-teal-600" />
                      )}
                      AI Risk Analysis
                    </Button>
                  </div>
                  {aiError ? <p className="pt-2 text-xs text-rose-500">{aiError}</p> : null}
                  {aiSuggestions ? (
                    <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/80 p-4 text-sm text-teal-800">
                      <p className="font-semibold uppercase tracking-[0.25em] text-teal-500">AI Suggestions</p>
                      <ul className="mt-2 space-y-1">
                        {aiSuggestions.drivers ? <li>Drivers: {aiSuggestions.drivers}</li> : null}
                        {aiSuggestions.impacts ? <li>Impacts: {aiSuggestions.impacts}</li> : null}
                        {aiSuggestions.similar ? <li>Related risks: {aiSuggestions.similar}</li> : null}
                        {aiSuggestions.controls ? <li>Suggested controls: {aiSuggestions.controls}</li> : null}
                      </ul>
                    </div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Category*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RISK_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-category</FormLabel>
                    <FormControl>
                      <Input placeholder="Operational process, product, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Owner*</FormLabel>
                    <FormControl>
                      <Input placeholder="Owner name or team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="likelihood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Likelihood (1-5)*</FormLabel>
                    <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LIKELIHOOD_LABELS.map((label, index) => (
                          <SelectItem key={label} value={(index + 1).toString()}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact (1-5)*</FormLabel>
                    <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IMPACT_LABELS.map((label, index) => (
                          <SelectItem key={label} value={(index + 1).toString()}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="residualLikelihood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residual Likelihood</FormLabel>
                    <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LIKELIHOOD_LABELS.map((label, index) => (
                          <SelectItem key={label} value={(index + 1).toString()}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residualImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residual Impact</FormLabel>
                    <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IMPACT_LABELS.map((label, index) => (
                          <SelectItem key={label} value={(index + 1).toString()}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="velocity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Velocity*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RISK_VELOCITY.map((velocity) => (
                          <SelectItem key={velocity} value={velocity}>
                            {velocity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Business Context</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="businessUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Retail Banking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process</FormLabel>
                  <FormControl>
                    <Input placeholder="Process, product, or service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reviewFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Frequency*</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RISK_REVIEW_FREQUENCIES.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Regulatory Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {REGULATORY_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={form.watch("regulatoryCategory")?.includes(category) ?? false}
                    onChange={(event) => {
                      const current = form.getValues("regulatoryCategory") ?? [];
                      const next = event.target.checked
                        ? [...current, category]
                        : current.filter((item) => item !== category);
                      form.setValue("regulatoryCategory", next, { shouldDirty: true });
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{category}</span>
                </label>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="reportableToFCA"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <FormLabel className="text-sm font-semibold">Reportable to FCA</FormLabel>
                      <FormDescription>Flag if risk or incidents need regulatory notification.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consumerDutyRelevant"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <FormLabel className="text-sm font-semibold">Consumer Duty</FormLabel>
                      <FormDescription>Identify if this risk impacts customer outcomes.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Key Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm text-slate-500">
                Track leading and lagging indicators with thresholds for automated monitoring.
              </p>
            </div>

            <div className="space-y-4">
              {kriFields.map((field, index) => (
                <div key={field.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-teal-200 text-teal-600">
                      Indicator #{index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500"
                      onClick={() => removeKri(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`keyRiskIndicators.${index}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Complaints volume" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`keyRiskIndicators.${index}.metric` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metric</FormLabel>
                          <FormControl>
                            <Input placeholder="Metric description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    {(["green", "amber", "red"] as const).map((key) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`keyRiskIndicators.${index}.threshold.${key}` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">{key} threshold</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormField
                      control={form.control}
                      name={`keyRiskIndicators.${index}.currentValue` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current value</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendKri({
                  name: "",
                  metric: "",
                  threshold: { green: 0, amber: 0, red: 0 },
                  currentValue: 0,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Indicator
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting || form.formState.isSubmitting}>
            {(isSubmitting || form.formState.isSubmitting) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {submitLabel ?? (mode === "edit" ? "Update Risk" : "Save Risk")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
