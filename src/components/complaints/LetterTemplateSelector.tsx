"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  MessageSquare,
  Download,
  Eye,
  Loader2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LetterTemplateType, ComplaintRecord } from "@/lib/database";

// Helper to escape HTML entities for safe rendering
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

interface LetterTemplateSelectorProps {
  complaint: ComplaintRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLetterGenerated?: () => void;
}

interface TemplateOption {
  id: LetterTemplateType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
  includesFOS: boolean;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "acknowledgement",
    name: "Acknowledgement Letter",
    description: "Confirms receipt and explains FCA timelines",
    icon: Mail,
    color: "text-blue-600 bg-blue-50",
    category: "Initial Response",
    includesFOS: true,
  },
  {
    id: "forward_third_party",
    name: "Forward to Third Party",
    description: "Redirects complaint to the correct firm",
    icon: ArrowRight,
    color: "text-amber-600 bg-amber-50",
    category: "Redirect",
    includesFOS: true,
  },
  {
    id: "four_week_holding",
    name: "Four Week Holding Letter",
    description: "Progress update - still investigating",
    icon: Clock,
    color: "text-orange-600 bg-orange-50",
    category: "Holding",
    includesFOS: false,
  },
  {
    id: "eight_week_holding",
    name: "Eight Week Holding Letter",
    description: "Extended timeline with FOS rights notice",
    icon: Clock,
    color: "text-red-600 bg-red-50",
    category: "Holding",
    includesFOS: true,
  },
  {
    id: "complaint_upheld",
    name: "Complaint Upheld",
    description: "Apology, explanation, and remedial actions",
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50",
    category: "Final Response",
    includesFOS: true,
  },
  {
    id: "complaint_rejected",
    name: "Complaint Rejected",
    description: "Explanation with FOS escalation rights",
    icon: XCircle,
    color: "text-rose-600 bg-rose-50",
    category: "Final Response",
    includesFOS: true,
  },
  {
    id: "general_contact",
    name: "General Contact Letter",
    description: "Flexible template for updates",
    icon: MessageSquare,
    color: "text-slate-600 bg-slate-50",
    category: "Other",
    includesFOS: false,
  },
];

export function LetterTemplateSelector({
  complaint,
  open,
  onOpenChange,
  onLetterGenerated,
}: LetterTemplateSelectorProps) {
  const [step, setStep] = useState<"select" | "configure" | "preview">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplateType | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("select");
      setSelectedTemplate(null);
      setContactName("");
      setContactTitle("");
      setCustomVariables({});
      setPreview(null);
      setError(null);
    }
  }, [open]);

  const selectedOption = TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate);

  const handleSelectTemplate = (templateId: LetterTemplateType) => {
    setSelectedTemplate(templateId);
    setStep("configure");
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/complaints/${complaint.id}/generate-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: selectedTemplate,
          contact_name: contactName,
          contact_title: contactTitle,
          custom_variables: customVariables,
          preview_only: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate preview");
      }

      const data = await response.json();
      setPreview(data.preview);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/complaints/${complaint.id}/generate-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: selectedTemplate,
          contact_name: contactName,
          contact_title: contactTitle,
          custom_variables: customVariables,
          generated_by: "User", // In production, use actual user name
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate letter");
      }

      // Get the blob and download it
      const blob = await response.blob();
      const filename =
        response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ||
        `letter-${complaint.complaint_reference}.docx`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close dialog and notify parent
      onOpenChange(false);
      onLetterGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate letter");
    } finally {
      setIsLoading(false);
    }
  };

  const renderExtraFields = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate) {
      case "forward_third_party":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="third_party_name">Third Party Firm Name</Label>
              <Input
                id="third_party_name"
                value={customVariables.third_party_name || ""}
                onChange={(e) =>
                  setCustomVariables({ ...customVariables, third_party_name: e.target.value })
                }
                placeholder="Enter the firm name to redirect to"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="third_party_address">Third Party Address</Label>
              <Textarea
                id="third_party_address"
                value={customVariables.third_party_address || ""}
                onChange={(e) =>
                  setCustomVariables({ ...customVariables, third_party_address: e.target.value })
                }
                placeholder="Enter the firm's address"
                rows={2}
              />
            </div>
          </>
        );

      case "complaint_upheld":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="investigation_findings">Investigation Findings</Label>
              <Textarea
                id="investigation_findings"
                value={customVariables.investigation_findings || ""}
                onChange={(e) =>
                  setCustomVariables({
                    ...customVariables,
                    investigation_findings: e.target.value,
                  })
                }
                placeholder="Summarize the key findings from your investigation"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remedial_action">Remedial Action</Label>
              <Textarea
                id="remedial_action"
                value={customVariables.remedial_action || ""}
                onChange={(e) =>
                  setCustomVariables({ ...customVariables, remedial_action: e.target.value })
                }
                placeholder="Describe the remedial actions being taken"
                rows={3}
              />
            </div>
          </>
        );

      case "complaint_rejected":
        return (
          <div className="space-y-2">
            <Label htmlFor="investigation_findings">Explanation for Rejection</Label>
            <Textarea
              id="investigation_findings"
              value={customVariables.investigation_findings || ""}
              onChange={(e) =>
                setCustomVariables({
                  ...customVariables,
                  investigation_findings: e.target.value,
                })
              }
              placeholder="Explain why the complaint could not be upheld"
              rows={4}
            />
          </div>
        );

      case "general_contact":
        return (
          <div className="space-y-2">
            <Label htmlFor="message_content">Message Content</Label>
            <Textarea
              id="message_content"
              value={customVariables.message_content || ""}
              onChange={(e) =>
                setCustomVariables({ ...customVariables, message_content: e.target.value })
              }
              placeholder="Enter the message content for this letter"
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Letter
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Select a letter template to generate"}
            {step === "configure" && `Configure ${selectedOption?.name}`}
            {step === "preview" && "Review the letter before downloading"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {["select", "configure", "preview"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  step === s
                    ? "bg-blue-600 text-white"
                    : ["select", "configure", "preview"].indexOf(step) > i
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="mx-2 h-0.5 w-8 bg-slate-200" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Select template */}
        {step === "select" && (
          <ScrollArea className="max-h-[400px]">
            <div className="grid gap-2 pr-4">
              {TEMPLATE_OPTIONS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-md",
                    "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      template.color
                    )}
                  >
                    <template.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{template.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {template.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{template.description}</p>
                    {template.includesFOS && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Info className="h-3 w-3" />
                        Includes FOS information
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Step 2: Configure template */}
        {step === "configure" && selectedOption && (
          <div className="space-y-4">
            {/* Selected template info */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3",
                selectedOption.color.replace("text-", "border-").replace("-600", "-200")
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  selectedOption.color
                )}
              >
                <selectedOption.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedOption.name}</p>
                <p className="text-xs text-slate-500">{selectedOption.description}</p>
              </div>
            </div>

            {/* Configuration form */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Your Name *</Label>
                  <Input
                    id="contact_name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_title">Your Title *</Label>
                  <Input
                    id="contact_title"
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="e.g., Complaints Manager"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complainant_salutation">Salutation</Label>
                <Input
                  id="complainant_salutation"
                  value={customVariables.complainant_salutation || ""}
                  onChange={(e) =>
                    setCustomVariables({
                      ...customVariables,
                      complainant_salutation: e.target.value,
                    })
                  }
                  placeholder="Mr/Mrs/Ms/Dr"
                />
              </div>

              {renderExtraFields()}
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button
                onClick={handlePreview}
                disabled={!contactName || !contactTitle || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Letter
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && preview && (
          <div className="space-y-4">
            {/* Preview content */}
            <ScrollArea className="h-[350px] rounded-lg border bg-slate-50 p-4">
              <pre
                className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: escapeHtml(preview) }}
              />
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("configure")}>
                Back
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download DOCX
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
