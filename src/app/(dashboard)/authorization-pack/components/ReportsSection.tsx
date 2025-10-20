"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Printer
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  type: "assessment" | "compliance" | "gap-analysis" | "executive" | "technical";
  category: string;
  lastGenerated?: Date;
  status: "available" | "generating" | "scheduled";
  format: string[];
  size?: string;
}

interface ReportsSectionProps {
  assessmentId?: string;
}

export function ReportsSection({ assessmentId }: ReportsSectionProps) {
  const [reports, setReports] = useState<Report[]>([]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load reports from API
  useEffect(() => {
    const loadReports = async () => {
      if (!assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assessments/${assessmentId}/reports`);
        if (response.ok) {
          const reportsData = await response.json();
          const transformedReports: Report[] = reportsData.map((report: {
            id: string;
            name: string;
            description: string;
            category: string;
            generated_at?: string;
            status: string;
            format: string;
            file_path?: string;
          }) => ({
            id: report.id,
            title: report.name,
            description: report.description,
            type: mapCategoryToType(report.category),
            category: report.category,
            lastGenerated: report.generated_at ? new Date(report.generated_at) : undefined,
            status: mapStatus(report.status),
            format: [capitalizeFirst(report.format)],
            size: undefined // Would be calculated from file_path in real implementation
          }));
          setReports(transformedReports);
        }
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('reports-load-failed', error, { assessmentId });
        } else {
          console.error('Error loading reports:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [assessmentId]);

  const mapCategoryToType = (category: string): "assessment" | "compliance" | "gap-analysis" | "executive" | "technical" => {
    switch (category) {
      case "assessment": return "assessment";
      case "compliance": return "compliance";
      case "gap-analysis": return "gap-analysis";
      case "executive": return "executive";
      case "technical": return "technical";
      default: return "assessment";
    }
  };

  const mapStatus = (dbStatus: string): "available" | "generating" | "scheduled" => {
    switch (dbStatus) {
      case "completed": return "available";
      case "generating": return "generating";
      case "pending":
      case "failed":
      default: return "scheduled";
    }
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assessment": return Target;
      case "compliance": return Shield;
      case "gap-analysis": return AlertTriangle;
      case "executive": return TrendingUp;
      case "technical": return BarChart3;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "assessment": return "bg-teal-50 text-teal-600 border-teal-200";
      case "compliance": return "bg-blue-50 text-blue-600 border-blue-200";
      case "gap-analysis": return "bg-amber-50 text-amber-600 border-amber-200";
      case "executive": return "bg-purple-50 text-purple-600 border-purple-200";
      case "technical": return "bg-slate-50 text-slate-600 border-slate-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-emerald-500 text-white";
      case "generating": return "bg-blue-500 text-white";
      case "scheduled": return "bg-amber-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return CheckCircle2;
      case "generating": return Clock;
      case "scheduled": return Calendar;
      default: return FileText;
    }
  };

  const reportsByType = {
    assessment: reports.filter(r => r.type === "assessment"),
    compliance: reports.filter(r => r.type === "compliance"),
    "gap-analysis": reports.filter(r => r.type === "gap-analysis"),
    executive: reports.filter(r => r.type === "executive"),
    technical: reports.filter(r => r.type === "technical")
  };

  const handleDownload = (report: Report, format: string) => {
    // Simulate download - replace with actual download implementation
    // In production, this would trigger actual file download
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Downloading ${report.title} as ${format}`);
    }
    // TODO: Implement actual file download logic
  };

  const handlePreview = (report: Report) => {
    setSelectedReport(report);
    setPreviewDialog(true);
  };

  const handleGenerate = async (reportId: string) => {
    if (!assessmentId) return;

    try {
      // Update local state to show generating
      setReports(prev => prev.map(report =>
        report.id === reportId ? { ...report, status: "generating" as const } : report
      ));

      const response = await fetch(`/api/assessments/${assessmentId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });

      if (response.ok) {
        // Report generation started successfully
        // In production, this would be logged to monitoring service
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Report generation started: ${reportId}`);
        }
        // TODO: Show success notification to user
      }
    } catch (error) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('report-generation-failed', error, { reportId, assessmentId });
      } else {
        console.error('Error generating report:', error);
      }
      // TODO: Show error notification to user
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reports...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reports Overview */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Assessment Reports & Analytics
          </CardTitle>
          <CardDescription>
            Generate comprehensive reports for submission, review, and stakeholder communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {reports.filter(r => r.status === "available").length}
              </div>
              <div className="text-sm text-slate-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === "generating").length}
              </div>
              <div className="text-sm text-slate-600">Generating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {reports.filter(r => r.status === "scheduled").length}
              </div>
              <div className="text-sm text-slate-600">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {reports.filter(r => r.lastGenerated && r.lastGenerated > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-slate-600">Updated Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Reports */}
      <Card className="border border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-800">
            <Target className="h-5 w-5" />
            Key Reports for FCA Submission
          </CardTitle>
          <CardDescription className="text-teal-700">
            Essential reports required for your authorization application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {reports.filter(r => ["fca-readiness-summary", "gap-analysis-report", "compliance-checklist"].includes(r.id)).map((report) => {
              const StatusIcon = getStatusIcon(report.status);
              const TypeIcon = getTypeIcon(report.type);

              return (
                <div key={report.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <TypeIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-teal-900">{report.title}</h4>
                      <p className="text-sm text-teal-700">{report.description}</p>
                      {report.lastGenerated && (
                        <p className="text-xs text-teal-600">
                          Updated: {report.lastGenerated.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(report.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {report.status}
                    </Badge>
                    {report.status === "available" && (
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleDownload(report, "PDF")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Reports by Category */}
      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {Object.entries(reportsByType).map(([type, typeReports]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid gap-4">
              {typeReports.map((report) => {
                const StatusIcon = getStatusIcon(report.status);
                const TypeIcon = getTypeIcon(report.type);

                return (
                  <Card key={report.id} className="border border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-slate-50">
                            <TypeIcon className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900">{report.title}</h3>
                              <Badge className={`border ${getTypeColor(report.type)}`}>
                                {report.category}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-3">{report.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              {report.lastGenerated && (
                                <span>Last updated: {report.lastGenerated.toLocaleDateString()}</span>
                              )}
                              {report.size && (
                                <span>Size: {report.size}</span>
                              )}
                              <span>Formats: {report.format.join(", ")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.status === "available" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreview(report)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <div className="flex items-center">
                                {report.format.map((format) => (
                                  <Button
                                    key={format}
                                    size="sm"
                                    className="bg-teal-600 hover:bg-teal-700 ml-1"
                                    onClick={() => handleDownload(report, format)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    {format}
                                  </Button>
                                ))}
                              </div>
                            </>
                          ) : report.status === "scheduled" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerate(report.id)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Generate Now
                            </Button>
                          ) : (
                            <Badge className="bg-blue-500 text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              Generating...
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Report Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview: {selectedReport?.title}</DialogTitle>
            <DialogDescription>
              Preview of {selectedReport?.title} - Generated {selectedReport?.lastGenerated?.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedReport && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedReport.title}</h2>
                  <p className="text-slate-600">{selectedReport.description}</p>
                  <p className="text-sm text-slate-500">Generated on {selectedReport.lastGenerated?.toLocaleDateString()}</p>
                </div>

                <div className="border-t border-b border-slate-200 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">Report Type</h3>
                      <p className="text-slate-600 capitalize">{selectedReport.type.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Category</h3>
                      <p className="text-slate-600">{selectedReport.category}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <p className="text-center text-slate-600 mb-4">
                    📊 Report content would be displayed here
                  </p>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                    <div className="h-8 bg-slate-300 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  {selectedReport.format.map((format) => (
                    <Button
                      key={format}
                      onClick={() => handleDownload(selectedReport, format)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download {format}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
