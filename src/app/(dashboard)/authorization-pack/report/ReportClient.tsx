"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Award,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  name: string;
  description: string;
  business_type: string;
  target_permissions: string[];
  created_at: string;
  last_modified: string;
  status: string;
  organization_id: string;
  progress: number;
  completed_sections: string[];
  total_sections: number;
}

interface SectionScore {
  section: string;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAnswered: number;
  totalQuestions: number;
  status: "completed" | "in-progress" | "not-started";
}

export function ReportClient() {
  const searchParams = useSearchParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [sectionScores, setSectionScores] = useState<SectionScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const assessmentId = searchParams.get('assessmentId');

  const loadAssessmentData = useCallback(async () => {
    if (!assessmentId) return;

    try {
      // Load assessment details
      const assessmentResponse = await fetch(`/api/assessments?organizationId=default-org`);
      if (assessmentResponse.ok) {
        const assessments = await assessmentResponse.json();
        const currentAssessment = assessments.find((a: Assessment) => a.id === assessmentId);
        setAssessment(currentAssessment);
      }

      // Load detailed section scores
      const responsesResponse = await fetch(`/api/assessments/${assessmentId}/responses`);
      if (responsesResponse.ok) {
        const responses = await responsesResponse.json();

        const sectionDefinitions = [
          { id: "business-model", title: "Business Model & Strategy", totalQuestions: 5 },
          { id: "governance", title: "Governance & Management", totalQuestions: 5 },
          { id: "risk-management", title: "Risk Management Framework", totalQuestions: 5 },
          { id: "financial-resources", title: "Financial Resources", totalQuestions: 4 },
          { id: "systems-controls", title: "Systems & Controls", totalQuestions: 6 }
        ];

        const scores = sectionDefinitions.map(section => {
          const sectionResponses = responses.filter((r: { section: string }) => r.section === section.id);
          const totalScore = sectionResponses.reduce((sum: number, r: { score: number }) => sum + r.score, 0);
          const maxScore = section.totalQuestions * 3; // Assuming max 3 points per question
          const percentage = (totalScore / maxScore) * 100;

          let status: "completed" | "in-progress" | "not-started";
          if (sectionResponses.length === 0) {
            status = "not-started";
          } else if (sectionResponses.length === section.totalQuestions) {
            status = "completed";
          } else {
            status = "in-progress";
          }

          return {
            section: section.id,
            title: section.title,
            score: totalScore,
            maxScore,
            percentage: Math.round(percentage),
            questionsAnswered: sectionResponses.length,
            totalQuestions: section.totalQuestions,
            status
          };
        });

        setSectionScores(scores);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error loading assessment data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessmentId) {
      loadAssessmentData();
    }
  }, [assessmentId, loadAssessmentData]);

  const overallScore = sectionScores.length > 0
    ? Math.round(sectionScores.reduce((sum, s) => sum + s.percentage, 0) / sectionScores.length)
    : 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (percentage >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { level: "Excellent", description: "Ready for FCA submission", color: "emerald" };
    if (score >= 70) return { level: "Good", description: "Minor improvements needed", color: "teal" };
    if (score >= 55) return { level: "Fair", description: "Moderate improvements required", color: "amber" };
    return { level: "Needs Work", description: "Significant improvements required", color: "rose" };
  };

  const readiness = getReadinessLevel(overallScore);

  const handleDownloadPDF = () => {
    setShowReportModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="space-y-6">
        <Card className="border border-slate-100">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Assessment Not Found</h3>
            <p className="text-slate-600">Unable to load assessment data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/authorization-pack">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">FCA Assessment Report</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{assessment.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Generated on {new Date().toLocaleDateString()} • {assessment.progress}% Complete
          </p>
        </div>
        <Button onClick={handleDownloadPDF} className="bg-teal-600 hover:bg-teal-700">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Overall Readiness Score */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            FCA Authorization Readiness Score
          </CardTitle>
          <CardDescription>
            Overall assessment of your readiness for FCA authorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-bold text-slate-900">{overallScore}%</div>
              <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium border bg-${readiness.color}-50 text-${readiness.color}-600 border-${readiness.color}-200`}>
                {readiness.level}
              </div>
              <p className="text-sm text-slate-600 mt-1">{readiness.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {sectionScores.filter(s => s.status === "completed").length} / {sectionScores.length} sections complete
              </div>
              <Progress value={overallScore} className="w-48 h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Breakdown */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            Section Breakdown
          </CardTitle>
          <CardDescription>
            Detailed scores across all assessment areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectionScores.map((section) => (
              <div key={section.section} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{section.title}</h3>
                  <p className="text-sm text-slate-500">
                    {section.questionsAnswered} of {section.totalQuestions} questions answered
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">{section.percentage}%</div>
                    <div className="text-xs text-slate-500">{section.score}/{section.maxScore} points</div>
                  </div>
                  <div className={`w-24 h-2 rounded-full bg-slate-100 overflow-hidden`}>
                    <div
                      className={`h-full transition-all duration-500 ${
                        section.percentage >= 80 ? 'bg-emerald-500' :
                        section.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${section.percentage}%` }}
                    />
                  </div>
                  <Badge className={`${getScoreColor(section.percentage)} text-xs`}>
                    {section.status === "completed" ? "Complete" :
                     section.status === "in-progress" ? "In Progress" : "Not Started"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>FCA Authorization Readiness Report</DialogTitle>
            <DialogDescription>
              Comprehensive assessment report for {assessment.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">FCA Authorization Readiness Report</h2>
              <p className="text-slate-600">{assessment.name}</p>
              <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <div className="border-t border-b border-slate-200 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Overall Score</h3>
                  <p className="text-3xl font-bold text-teal-600">{overallScore}%</p>
                  <p className="text-sm text-slate-600">{readiness.level} - {readiness.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Business Type</h3>
                  <p className="text-slate-600 capitalize">{assessment.business_type.replace('-', ' ')}</p>
                  <h3 className="font-semibold text-slate-900 mt-2">Target Permissions</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assessment.target_permissions.map(perm => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Section Assessment</h3>
              <div className="space-y-3">
                {sectionScores.map((section) => (
                  <div key={section.section} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="font-medium">{section.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">{section.questionsAnswered}/{section.totalQuestions}</span>
                      <span className="font-semibold">{section.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Button onClick={() => window.print()} className="bg-teal-600 hover:bg-teal-700">
                <FileText className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
