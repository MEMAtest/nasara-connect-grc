"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Shield,
  Users,
  Building,
  CreditCard,
  FileText,
  Lightbulb,
  ArrowRight
} from "lucide-react";

interface Gap {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "identified" | "in-progress" | "resolved";
  impact: string;
  recommendation: string;
  estimatedEffort: string;
  deadline?: Date;
}

interface GapAnalysisProps {
  assessmentId?: string;
}

export function GapAnalysis({ assessmentId }: GapAnalysisProps) {
  const [gaps, setGaps] = useState<Gap[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load gap analysis from API
  useEffect(() => {
    const loadGaps = async () => {
      if (!assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assessments/${assessmentId}/gaps`);
        if (response.ok) {
          const gapsData = await response.json();
          setGaps(gapsData.map((gap: Gap & { deadline?: string }) => ({
            ...gap,
            deadline: gap.deadline ? new Date(gap.deadline) : undefined
          })));
        }
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('gaps-load-failed', error, { assessmentId });
        } else {
          console.error('Error loading gaps:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadGaps();
  }, [assessmentId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-amber-500 text-white";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "in-progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "identified": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return CheckCircle2;
      case "in-progress": return Clock;
      case "identified": return AlertTriangle;
      default: return AlertCircle;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "business-model": return Building;
      case "governance": return Users;
      case "risk-management": return Shield;
      case "financial-resources": return CreditCard;
      case "systems-controls": return FileText;
      default: return Target;
    }
  };

  const filteredGaps = selectedCategory === "all"
    ? gaps
    : gaps.filter(gap => gap.category === selectedCategory);

  const stats = {
    total: gaps.length,
    critical: gaps.filter(g => g.severity === "critical").length,
    high: gaps.filter(g => g.severity === "high").length,
    resolved: gaps.filter(g => g.status === "resolved").length,
    inProgress: gaps.filter(g => g.status === "in-progress").length
  };

  const completionRate = Math.round((stats.resolved / stats.total) * 100);

  const handleStatusChange = async (gapId: string, newStatus: "identified" | "in-progress" | "resolved") => {
    if (!assessmentId) return;

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/gaps`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gapId,
          status: newStatus
        }),
      });

      if (response.ok) {
        setGaps(prev => prev.map(gap =>
          gap.id === gapId ? { ...gap, status: newStatus } : gap
        ));
      }
    } catch (error) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('gap-status-update-failed', error, { gapId, newStatus, assessmentId });
      } else {
        console.error('Error updating gap status:', error);
      }
      // TODO: Show error notification to user
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading gap analysis...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gap Analysis Overview */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Readiness Gap Analysis
          </CardTitle>
          <CardDescription>
            Identify and address gaps before FCA submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-slate-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-sm text-slate-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-slate-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
              <div className="text-sm text-slate-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card className="border border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Critical Priority Actions
          </CardTitle>
          <CardDescription className="text-red-700">
            These gaps must be addressed before submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gaps.filter(gap => gap.severity === "critical" && gap.status !== "resolved").map((gap) => (
              <div key={gap.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">{gap.title}</h4>
                  <p className="text-sm text-red-700">{gap.recommendation}</p>
                  {gap.deadline && (
                    <p className="text-xs text-red-600 mt-1">
                      Deadline: {gap.deadline.toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white text-xs">
                    {gap.estimatedEffort}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => handleStatusChange(gap.id, "in-progress")}
                  >
                    Start Work
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Gap Analysis */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Gaps</TabsTrigger>
          <TabsTrigger value="business-model">Business</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="risk-management">Risk</TabsTrigger>
          <TabsTrigger value="financial-resources">Financial</TabsTrigger>
          <TabsTrigger value="systems-controls">Systems</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredGaps.map((gap) => {
            const StatusIcon = getStatusIcon(gap.status);
            const CategoryIcon = getCategoryIcon(gap.category);

            return (
              <Card key={gap.id} className="border border-slate-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <CategoryIcon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{gap.title}</h3>
                          <Badge className={getSeverityColor(gap.severity)}>
                            {gap.severity}
                          </Badge>
                          <Badge className={`border ${getStatusColor(gap.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {gap.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{gap.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Impact
                        </h4>
                        <p className="text-sm text-slate-600">{gap.impact}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1 flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Estimated Effort
                        </h4>
                        <p className="text-sm text-slate-600">{gap.estimatedEffort}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-1 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Recommendation
                      </h4>
                      <p className="text-sm text-slate-600">{gap.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {gap.deadline && (
                        <>
                          <Clock className="h-4 w-4" />
                          Deadline: {gap.deadline.toLocaleDateString()}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {gap.status === "identified" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(gap.id, "in-progress")}
                        >
                          Start Work
                        </Button>
                      )}
                      {gap.status === "in-progress" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleStatusChange(gap.id, "resolved")}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {gap.status === "resolved" && (
                        <Badge className="bg-emerald-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Action Plan Summary */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Remediation Action Plan
          </CardTitle>
          <CardDescription>
            Recommended sequence for addressing identified gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Address Critical Gaps</h4>
                <p className="text-sm text-red-700">Consumer Duty implementation must be completed first</p>
              </div>
              <ArrowRight className="h-5 w-5 text-red-500" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">High Priority Items</h4>
                <p className="text-sm text-orange-700">Risk framework and capital adequacy improvements</p>
              </div>
              <ArrowRight className="h-5 w-5 text-orange-500" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">3</div>
              <div className="flex-1">
                <h4 className="font-medium text-amber-900">Medium & Low Priority</h4>
                <p className="text-sm text-amber-700">IT governance and outsourcing agreement updates</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}