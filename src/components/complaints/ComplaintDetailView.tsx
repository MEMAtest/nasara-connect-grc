"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  History,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComplaintTimeline } from "./ComplaintTimeline";
import { DeadlineTracker } from "./DeadlineTracker";
import { QuickActions } from "./QuickActions";
import { LetterTemplateSelector } from "./LetterTemplateSelector";
import { ComplaintInsights } from "./ComplaintInsights";
import {
  ComplaintRecord,
  ComplaintActivity,
  ComplaintLetter,
  ComplaintStatus,
  ComplaintPriority,
} from "@/lib/database";

interface ComplaintDetailViewProps {
  complaintId: string;
}

interface ComplaintWithDetails extends ComplaintRecord {
  activities?: ComplaintActivity[];
  letters?: ComplaintLetter[];
}

const STATUS_COLORS: Record<ComplaintStatus, { bg: string; text: string; label: string }> = {
  "open": { bg: "bg-blue-100", text: "text-blue-700", label: "Open" },
  "investigating": { bg: "bg-amber-100", text: "text-amber-700", label: "Investigating" },
  "resolved": { bg: "bg-emerald-100", text: "text-emerald-700", label: "Resolved" },
  "closed": { bg: "bg-slate-100", text: "text-slate-700", label: "Closed" },
  "escalated": { bg: "bg-purple-100", text: "text-purple-700", label: "Escalated" },
  "referred_to_fos": { bg: "bg-rose-100", text: "text-rose-700", label: "Referred to FOS" },
};

const PRIORITY_COLORS: Record<ComplaintPriority, { color: string; label: string }> = {
  "low": { color: "bg-slate-500", label: "Low" },
  "medium": { color: "bg-amber-500", label: "Medium" },
  "high": { color: "bg-orange-500", label: "High" },
  "urgent": { color: "bg-red-500", label: "Urgent" },
};

export function ComplaintDetailView({ complaintId }: ComplaintDetailViewProps) {
  const router = useRouter();
  const [complaint, setComplaint] = useState<ComplaintWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLetterSelectorOpen, setIsLetterSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchComplaint = useCallback(async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch complaint");
      }
      const data = await response.json();
      setComplaint(data.complaint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load complaint");
    } finally {
      setIsLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const handleUpdate = () => {
    fetchComplaint();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <p className="text-lg font-medium text-slate-900">Failed to load complaint</p>
        <p className="text-sm text-slate-500">{error || "Complaint not found"}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/registers/complaints")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Register
        </Button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[complaint.status] || STATUS_COLORS["open"];
  const priorityColor = PRIORITY_COLORS[complaint.priority] || PRIORITY_COLORS["medium"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Back button and reference */}
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/registers/complaints")}
              className="gap-1 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Register
            </Button>
            <div className="text-right">
              <p className="text-xs text-slate-400">Reference</p>
              <p className="font-mono text-sm font-medium text-slate-900">
                {complaint.complaint_reference}
              </p>
            </div>
          </div>

          {/* Main header info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {complaint.complainant_name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {complaint.complaint_type} - {complaint.product_type || "General"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn(statusColor.bg, statusColor.text, "font-medium")}>
                {statusColor.label}
              </Badge>
              <div className="flex items-center gap-1.5">
                <div className={cn("h-2 w-2 rounded-full", priorityColor.color)} />
                <span className="text-sm text-slate-600">{priorityColor.label}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>
                Received:{" "}
                {new Date(complaint.received_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {complaint.assigned_to && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <User className="h-4 w-4" />
                <span>Assigned: {complaint.assigned_to}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-4 w-4" />
              <span>
                {getDaysElapsed(complaint.received_date)} days elapsed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column - Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="letters"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Letters
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Complainant Details */}
                  <div className="rounded-xl border bg-white p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <User className="h-4 w-4" />
                      Complainant Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">Name</p>
                        <p className="text-sm font-medium text-slate-900">
                          {complaint.complainant_name}
                        </p>
                      </div>
                      {complaint.complainant_email && (
                        <div>
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Mail className="h-3.5 w-3.5" />
                            {complaint.complainant_email}
                          </p>
                        </div>
                      )}
                      {complaint.complainant_phone && (
                        <div>
                          <p className="text-xs text-slate-400">Phone</p>
                          <p className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Phone className="h-3.5 w-3.5" />
                            {complaint.complainant_phone}
                          </p>
                        </div>
                      )}
                      {complaint.complainant_address && (
                        <div>
                          <p className="text-xs text-slate-400">Address</p>
                          <p className="flex items-start gap-1.5 text-sm text-slate-700">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span className="whitespace-pre-line">
                              {complaint.complainant_address}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="rounded-xl border bg-white p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="h-4 w-4" />
                      Complaint Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">Type</p>
                        <p className="text-sm font-medium text-slate-900">
                          {complaint.complaint_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Product/Service</p>
                        <p className="text-sm text-slate-700">
                          {complaint.product_type || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Contact Method</p>
                        <p className="text-sm text-slate-700">
                          {complaint.contact_method || "Not specified"}
                        </p>
                      </div>
                      {complaint.policy_reference && (
                        <div>
                          <p className="text-xs text-slate-400">Policy Reference</p>
                          <p className="text-sm text-slate-700">
                            {complaint.policy_reference}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="rounded-xl border bg-white p-4 md:col-span-2">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <MessageSquare className="h-4 w-4" />
                      Complaint Description
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {complaint.description || "No description provided."}
                    </p>
                  </div>

                  {/* Resolution (if resolved) */}
                  {complaint.resolution && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:col-span-2">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                        <History className="h-4 w-4" />
                        Resolution
                      </h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-800">
                        {complaint.resolution}
                      </p>
                      {complaint.final_response_date && (
                        <p className="mt-2 text-xs text-emerald-600">
                          Final response sent:{" "}
                          {new Date(complaint.final_response_date).toLocaleDateString("en-GB")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-6">
                <ComplaintTimeline
                  activities={complaint.activities || []}
                  onViewLetter={() => {
                    // Switch to Letters tab to view the letter
                    setActiveTab("letters");
                  }}
                />
              </TabsContent>

              {/* Letters Tab */}
              <TabsContent value="letters" className="mt-6">
                <div className="rounded-xl border bg-white">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="h-4 w-4" />
                      Generated Letters
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => setIsLetterSelectorOpen(true)}
                    >
                      Generate New Letter
                    </Button>
                  </div>

                  {complaint.letters && complaint.letters.length > 0 ? (
                    <div className="divide-y">
                      {complaint.letters.map((letter) => (
                        <div
                          key={letter.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                              <FileText className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {formatLetterType(letter.template_type)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {letter.letter_reference} •{" "}
                                {new Date(letter.created_at).toLocaleDateString("en-GB")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                letter.status === "sent"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              )}
                            >
                              {letter.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="mb-2 h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No letters generated</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Click &quot;Generate New Letter&quot; to create a letter from template
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-6">
                <div className="rounded-xl border bg-white">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="h-4 w-4" />
                      Supporting Documents
                    </h3>
                    <Button size="sm" variant="outline">
                      Upload Document
                    </Button>
                  </div>

                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No documents uploaded</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Upload supporting documents for this complaint
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-4">
            <QuickActions
              complaint={complaint}
              onGenerateLetter={() => setIsLetterSelectorOpen(true)}
              onUpdate={handleUpdate}
            />

            <DeadlineTracker
              receivedDate={complaint.received_date}
              resolutionDeadline={complaint.resolution_deadline}
              resolvedDate={complaint.resolved_date}
              fourWeekLetterSent={complaint.four_week_letter_sent || false}
              eightWeekLetterSent={complaint.eight_week_letter_sent || false}
              finalResponseSent={complaint.final_response_sent || false}
            />

            <ComplaintInsights
              complaintType={complaint.complaint_type}
              daysElapsed={getDaysElapsed(complaint.received_date)}
              fourWeekLetterSent={complaint.four_week_letter_sent || false}
              eightWeekLetterSent={complaint.eight_week_letter_sent || false}
              status={complaint.status}
            />
          </div>
        </div>
      </div>

      {/* Letter Template Selector Dialog */}
      <LetterTemplateSelector
        complaint={complaint}
        open={isLetterSelectorOpen}
        onOpenChange={setIsLetterSelectorOpen}
        onLetterGenerated={handleUpdate}
      />
    </div>
  );
}

function getDaysElapsed(receivedDate: Date | string): number {
  const received = new Date(receivedDate);
  const now = new Date();
  return Math.floor((now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
}

function formatLetterType(type: string): string {
  const types: Record<string, string> = {
    acknowledgement: "Acknowledgement Letter",
    forward_third_party: "Forward to Third Party",
    four_week_holding: "Four Week Holding Letter",
    eight_week_holding: "Eight Week Holding Letter",
    complaint_upheld: "Complaint Upheld",
    complaint_rejected: "Complaint Rejected",
    general_contact: "General Contact Letter",
  };
  return types[type] || type;
}
