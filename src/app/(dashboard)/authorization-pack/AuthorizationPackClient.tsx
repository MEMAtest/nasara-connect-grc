"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoringEngine, mockSectionScores } from "./components/ScoringEngine";
import { ConfidenceCalculator, mockHardGates, mockSoftFactors } from "./components/ConfidenceCalculator";
import { AssessmentManager } from "./components/AssessmentManager";
import { EvidenceManager } from "./components/EvidenceManager";
import { GapAnalysis } from "./components/GapAnalysis";
import { ReportsSection } from "./components/ReportsSection";
import {
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Shield,
  Users,
  TrendingUp
} from "lucide-react";

type ApiAssessmentResponse = {
  question_id: string;
  section: string;
  value: string | string[];
  score: number;
  notes?: string;
};

interface AssessmentSectionSummary {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  questionsTotal: number;
  questionsCompleted: number;
}

interface Assessment {
  id: string;
  name: string;
  description: string;
  businessType: string;
  targetPermissions: string[];
  createdAt: Date;
  lastModified: Date;
  progress: number;
  status: "draft" | "in-progress" | "completed" | "submitted";
  completedSections: string[];
  totalSections: number;
}

export function AuthorizationPackClient() {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [assessmentSections, setAssessmentSections] = useState<AssessmentSectionSummary[]>([]);

  // Get real assessment progress instead of hardcoded values
  const overallProgress = currentAssessment?.progress || 0;

  // Load real section data when assessment is selected
  const loadAssessmentSections = async (assessmentId: string) => {
    try {
      // Get all responses for this assessment
      const responsesResponse = await fetch(`/api/assessments/${assessmentId}/responses`);
      const responses: ApiAssessmentResponse[] = responsesResponse.ok ? await responsesResponse.json() : [];

      // Calculate section progress based on actual responses
      const sectionDefinitions = [
        { id: "business-model", title: "Business Model & Strategy", description: "Define your business activities and target market", totalQuestions: 5 },
        { id: "governance", title: "Governance & Management", description: "Senior management and organizational structure", totalQuestions: 5 },
        { id: "risk-management", title: "Risk Management Framework", description: "Risk appetite, controls, and mitigation strategies", totalQuestions: 5 },
        { id: "financial-resources", title: "Financial Resources", description: "Capital adequacy and financial projections", totalQuestions: 4 },
        { id: "systems-controls", title: "Systems & Controls", description: "IT systems, data protection, and operational controls", totalQuestions: 6 }
      ];

      const sectionsWithProgress: AssessmentSectionSummary[] = sectionDefinitions.map((section) => {
        const sectionResponses = responses.filter((response) => response.section === section.id);
        const questionsCompleted = sectionResponses.length;
        const progress = (questionsCompleted / section.totalQuestions) * 100;

        let status: "not-started" | "in-progress" | "completed";
        if (questionsCompleted === 0) {
          status = "not-started";
        } else if (questionsCompleted === section.totalQuestions) {
          status = "completed";
        } else {
          status = "in-progress";
        }

        return {
          id: section.id,
          title: section.title,
          description: section.description,
          progress: Math.round(progress),
          status,
          questionsTotal: section.totalQuestions,
          questionsCompleted
        };
      });

      setAssessmentSections(sectionsWithProgress);
    } catch (error) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('assessment-sections-load-failed', error, { assessmentId });
      } else {
        console.error('Error loading assessment sections:', error);
      }
      setAssessmentSections([]);
    }
  };

  const [evidenceStats, setEvidenceStats] = useState({ approved: 0, total: 0 });
  const [gapStats, setGapStats] = useState({ resolved: 0, total: 0 });

  // Load dynamic metrics
  useEffect(() => {
    const loadMetrics = async () => {
      if (!currentAssessment?.id) return;

      try {
        // Load evidence stats
        const evidenceResponse = await fetch(`/api/assessments/${currentAssessment.id}/evidence`);
        if (evidenceResponse.ok) {
          const evidence = await evidenceResponse.json();
          const approved = evidence.filter((doc: { status: string }) => doc.status === 'approved').length;
          setEvidenceStats({ approved, total: evidence.length });
        }

        // Load gap stats
        const gapsResponse = await fetch(`/api/assessments/${currentAssessment.id}/gaps`);
        if (gapsResponse.ok) {
          const gaps = await gapsResponse.json();
          const resolved = gaps.filter((gap: { status: string }) => gap.status === 'resolved').length;
          setGapStats({ resolved, total: gaps.length });
        }
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('authorization-pack-metrics-load-failed', error, { assessmentId: currentAssessment?.id });
        } else {
          console.error('Error loading metrics:', error);
        }
      }
    };

    loadMetrics();
  }, [currentAssessment?.id]);

  const keyMetrics = [
    {
      title: "FCA Readiness Score",
      value: `${overallProgress}%`,
      icon: Target,
      color: "teal" as const,
      description: "Overall authorization readiness"
    },
    {
      title: "Evidence Documents",
      value: `${evidenceStats.approved}/${evidenceStats.total}`,
      icon: FileText,
      color: "blue" as const,
      description: "Required documents uploaded"
    },
    {
      title: "Gap Resolution",
      value: `${gapStats.resolved}/${gapStats.total}`,
      icon: Shield,
      color: "indigo" as const,
      description: "Identified gaps resolved"
    },
    {
      title: "Section Progress",
      value: `${assessmentSections.filter(s => s.status === 'completed').length}/${assessmentSections.length}`,
      icon: Users,
      color: "amber" as const,
      description: "Assessment sections completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "in-progress": return "bg-amber-500";
      case "not-started": return "bg-slate-400";
      default: return "bg-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle2;
      case "in-progress": return Clock;
      case "not-started": return AlertCircle;
      default: return AlertCircle;
    }
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    loadAssessmentSections(assessment.id);
  };

  const handleBackToAssessments = () => {
    setCurrentAssessment(null);
    setAssessmentSections([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">FCA Authorization</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {currentAssessment ? currentAssessment.name : "Authorization Ready Pack"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            {currentAssessment
              ? currentAssessment.description
              : "Navigate your FCA authorization journey with guided questionnaires, evidence management, and readiness scoring."
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentAssessment && (
            <Button variant="outline" onClick={handleBackToAssessments}>
              ← Back to Assessments
            </Button>
          )}
          {currentAssessment && (
            <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
              <TrendingUp className="mr-1 h-3 w-3" />
              {currentAssessment.progress}% Ready
            </Badge>
          )}
          {currentAssessment && (
            <Button className="bg-teal-600 hover:bg-teal-700" asChild>
              <Link href={`/authorization-pack/questionnaire?assessmentId=${currentAssessment.id}`}>
                Continue Assessment
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Assessment Manager or Assessment Details */}
      {!currentAssessment ? (
        <AssessmentManager
          onSelectAssessment={handleSelectAssessment}
          currentAssessment={currentAssessment || undefined}
        />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.title} className="border border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                        <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-${metric.color}-50`}>
                        <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

      {/* Progress Overview */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Overall Progress</CardTitle>
              <CardDescription>Track your authorization readiness across all areas</CardDescription>
            </div>
            <Badge className="bg-teal-600 hover:bg-teal-700">
              {overallProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid gap-4">
            {assessmentSections.map((section) => {
              const StatusIcon = getStatusIcon(section.status);
              return (
                <Card key={section.id} className="border border-slate-100 hover:border-slate-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${getStatusColor(section.status)}`}>
                            <StatusIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{section.title}</h3>
                            <p className="text-sm text-slate-500">{section.description}</p>
                          </div>
                        </div>
                        <div className="ml-11">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">
                              {section.questionsCompleted} of {section.questionsTotal} questions completed
                            </span>
                            <span className="text-sm font-medium text-slate-900">
                              {section.progress}%
                            </span>
                          </div>
                          <Progress value={section.progress} className="h-2" />
                        </div>
                      </div>
                      <Button
                        variant={section.status === "completed" ? "outline" : "default"}
                        className={section.status !== "completed" ? "bg-teal-600 hover:bg-teal-700" : ""}
                        asChild
                      >
                        <Link href={`/authorization-pack/questionnaire?assessmentId=${currentAssessment.id}&section=${section.id}`}>
                          {section.status === "completed" ? "Review" : "Continue"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Scoring Engine */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Real-time Scoring</h3>
            <ScoringEngine sections={mockSectionScores} lastUpdated={new Date()} />
          </div>

          {/* Confidence Calculator */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Submission Confidence</h3>
            <ConfidenceCalculator
              hardGates={mockHardGates}
              softFactors={mockSoftFactors}
              lastUpdated={new Date()}
            />
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-6">
          <EvidenceManager assessmentId={currentAssessment.id} />
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <GapAnalysis assessmentId={currentAssessment.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsSection assessmentId={currentAssessment.id} />
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}