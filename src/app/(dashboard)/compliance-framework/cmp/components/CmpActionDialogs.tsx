"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { CmpControlDetail, CmpTestPlanStep } from "@/data/cmp/types";

const logTestSchema = z.object({
  stepId: z.string().min(1, "Select a step"),
  tester: z.string().min(2, "Tester is required"),
  reviewer: z.string().min(2, "Reviewer is required"),
  testedAt: z.string().min(1, "Test date required"),
  result: z.enum(["pass", "partial", "fail"]),
  sampleSize: z.number().min(1),
  evidencePath: z.string().optional(),
  comments: z.string().optional(),
});

type LogTestValues = z.infer<typeof logTestSchema>;

const findingSchema = z.object({
  title: z.string().min(3),
  severity: z.enum(["critical", "high", "medium", "low"]),
  dueDate: z.string().min(1),
  owner: z.string().min(2),
  description: z.string().min(5),
  rootCause: z.string().min(3),
  businessImpact: z.string().min(3),
  interimControls: z.string().optional(),
  relatedTestId: z.string().optional(),
});

type FindingValues = z.infer<typeof findingSchema>;

interface BaseDialogProps {
  organizationId: string;
  control: CmpControlDetail | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

const dateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function LogTestDialog({ organizationId, control, open, onClose, onSuccess }: BaseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValues: LogTestValues = {
    stepId: control?.testPlan[0]?.id ?? "",
    tester: "",
    reviewer: "",
    testedAt: dateTimeLocal(new Date()),
    result: "pass",
    sampleSize: 5,
    evidencePath: "",
    comments: "",
  };
  const form = useForm<LogTestValues>({ resolver: zodResolver(logTestSchema), defaultValues });

  useEffect(() => {
    if (control) {
      form.reset({
        ...defaultValues,
        stepId: control.testPlan[0]?.id ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [control?.id, open]);

  const steps: CmpTestPlanStep[] = control?.testPlan ?? [];

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!control) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/cmp/controls/${control.id}/tests`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          testedAt: new Date(values.testedAt).toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Unable to log test");
      toast({ title: "Test recorded", description: `${control.id} updated`, variant: "default" });
      await onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Could not log test", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log CMP Test</DialogTitle>
          <DialogDescription>Capture execution details for {control?.id}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="stepId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test step</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!steps.length}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select step" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {steps.map((step) => (
                        <SelectItem key={step.id} value={step.id}>
                          {step.stepNumber}. {step.objective}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tester</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reviewer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reviewer</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="testedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tested at</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sampleSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="evidencePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence link</FormLabel>
                  <FormControl>
                    <Input placeholder="SharePoint / URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Observations or remediation notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !control}>
                {isSubmitting ? "Saving..." : "Log test"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function RaiseFindingDialog({ organizationId, control, open, onClose, onSuccess }: BaseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FindingValues>({
    resolver: zodResolver(findingSchema),
    defaultValues: {
      title: "",
      severity: "high",
      dueDate: new Date().toISOString().slice(0, 10),
      owner: "",
      description: "",
      rootCause: "",
      businessImpact: "",
      interimControls: "",
      relatedTestId: "",
    },
  });

  useEffect(() => {
    if (control) {
      form.reset({
        title: "",
        severity: "high",
        dueDate: new Date().toISOString().slice(0, 10),
        owner: control.owner,
        description: "",
        rootCause: "",
        businessImpact: "",
        interimControls: "",
        relatedTestId: control.executions[0]?.id ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [control?.id, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!control) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/cmp/controls/${control.id}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Unable to raise finding");
      toast({ title: "Finding created", description: `${control.id} assigned`, variant: "default" });
      await onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Could not raise finding", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  });

  const hasExecutions = (control?.executions.length ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Raise CMP Finding</DialogTitle>
          <DialogDescription>Document remedial actions for {control?.id}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Finding summary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action owner</FormLabel>
                    <FormControl>
                      <Input placeholder="Owner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relatedTestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related test</FormLabel>
                    <Select disabled={!hasExecutions} value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {control?.executions.map((execution) => (
                          <SelectItem key={execution.id} value={execution.id}>
                            {execution.id} · {execution.result}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Finding details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rootCause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Root cause</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Process/control weakness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessImpact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business impact</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Customer/regulatory outcome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interimControls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interim controls</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Short-term mitigation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !control}>
                {isSubmitting ? "Saving..." : "Raise finding"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
