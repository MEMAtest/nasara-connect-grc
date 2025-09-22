"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Award,
  BookOpen,
  AlertCircle,
  Download,
  Calendar,
  Filter,
  Eye,
  ThumbsUp,
  MessageSquare
} from "lucide-react";

export function TrainingAnalyticsClient() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedPersona, setSelectedPersona] = useState("all");

  // Mock analytics data - in real implementation, this would come from APIs
  const analyticsData = {
    overview: {
      totalLearners: 247,
      activeThisMonth: 189,
      completionRate: 73,
      averageScore: 82,
      totalHoursLearned: 1247,
      contentPieces: 45
    },
    popularContent: [
      {
        title: "FCA Authorization Essentials",
        type: "Pathway",
        completions: 156,
        avgScore: 89,
        avgTime: "12 min",
        satisfaction: 4.6
      },
      {
        title: "PEP Customer Onboarding",
        type: "Scenario",
        completions: 134,
        avgScore: 76,
        avgTime: "8 min",
        satisfaction: 4.4
      },
      {
        title: "SMCR Responsibilities",
        type: "Micro-lesson",
        completions: 128,
        avgScore: 84,
        avgTime: "5 min",
        satisfaction: 4.5
      },
      {
        title: "Risk Assessment Fundamentals",
        type: "Pathway",
        completions: 98,
        avgScore: 81,
        avgTime: "15 min",
        satisfaction: 4.2
      }
    ],
    learnerProgress: [
      {
        persona: "Compliance Officers",
        enrolled: 45,
        active: 42,
        completed: 38,
        avgProgress: 85
      },
      {
        persona: "Risk Analysts",
        enrolled: 32,
        active: 28,
        completed: 22,
        avgProgress: 72
      },
      {
        persona: "Operations Managers",
        enrolled: 38,
        active: 35,
        completed: 29,
        avgProgress: 78
      },
      {
        persona: "Customer Advisors",
        enrolled: 67,
        active: 58,
        completed: 41,
        avgProgress: 65
      }
    ],
    contentPerformance: [
      {
        content: "Anti-Money Laundering Basics",
        views: 245,
        completions: 198,
        avgScore: 87,
        dropoffRate: 19,
        feedback: 4.5
      },
      {
        content: "Consumer Duty Implementation",
        views: 189,
        completions: 142,
        avgScore: 82,
        dropoffRate: 25,
        feedback: 4.3
      },
      {
        content: "Operational Resilience Framework",
        views: 167,
        completions: 119,
        avgScore: 79,
        dropoffRate: 29,
        feedback: 4.1
      }
    ]
  };

  const getPersonaColor = (persona: string) => {
    const colors = {
      "Compliance Officers": "bg-blue-100 text-blue-800",
      "Risk Analysts": "bg-purple-100 text-purple-800",
      "Operations Managers": "bg-emerald-100 text-emerald-800",
      "Customer Advisors": "bg-amber-100 text-amber-800"
    };
    return colors[persona as keyof typeof colors] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Training Analytics</h1>
          <p className="text-slate-600 mt-2">Monitor learning performance and content effectiveness</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Learners</p>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.totalLearners}</p>
                <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.completionRate}%</p>
                <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% from last month
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Average Score</p>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.averageScore}%</p>
                <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2% from last month
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Learning Hours</p>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.totalHoursLearned}</p>
                <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="learners">Learner Progress</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Content */}
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Content</CardTitle>
                <CardDescription>Top performing training materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.popularContent.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{content.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <Badge variant="secondary" className="text-xs">{content.type}</Badge>
                          <span>{content.completions} completions</span>
                          <span>{content.avgScore}% avg score</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-amber-600">
                          <ThumbsUp className="h-3 w-3" />
                          {content.satisfaction}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{content.avgTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress by Persona */}
            <Card>
              <CardHeader>
                <CardTitle>Progress by Persona</CardTitle>
                <CardDescription>How different roles are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.learnerProgress.map((persona, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getPersonaColor(persona.persona)}>{persona.persona}</Badge>
                        <span className="text-sm font-medium text-slate-900">{persona.avgProgress}%</span>
                      </div>
                      <Progress value={persona.avgProgress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{persona.completed}/{persona.enrolled} completed</span>
                        <span>{persona.active} active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Performance Analysis</CardTitle>
                  <CardDescription>Detailed metrics for each piece of content</CardDescription>
                </div>
                <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Personas</SelectItem>
                    <SelectItem value="compliance">Compliance Officers</SelectItem>
                    <SelectItem value="risk">Risk Analysts</SelectItem>
                    <SelectItem value="operations">Operations Managers</SelectItem>
                    <SelectItem value="advisors">Customer Advisors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.contentPerformance.map((content, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-slate-900">{content.content}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">{content.views}</div>
                        <div className="text-xs text-slate-600">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-600">{content.completions}</div>
                        <div className="text-xs text-slate-600">Completions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{content.avgScore}%</div>
                        <div className="text-xs text-slate-600">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">{content.dropoffRate}%</div>
                        <div className="text-xs text-slate-600">Drop-off</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-amber-600 flex items-center justify-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {content.feedback}
                        </div>
                        <div className="text-xs text-slate-600">Satisfaction</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Completion Rate</span>
                        <span className="font-medium">{Math.round((content.completions / content.views) * 100)}%</span>
                      </div>
                      <Progress value={(content.completions / content.views) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learners" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learner Engagement Trends</CardTitle>
                <CardDescription>Weekly active learners over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Engagement chart would be rendered here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Path Completion</CardTitle>
                <CardDescription>Progress through structured learning paths</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">FCA Authorization Path</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-24 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Risk Management Path</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-24 h-2" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Compliance Fundamentals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={68} className="w-24 h-2" />
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Financial Crime Prevention</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-24 h-2" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>At-Risk Learners</CardTitle>
              <CardDescription>Learners who may need additional support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">Behind Schedule</h4>
                      <p className="text-sm text-red-700">23 learners are behind their expected progress</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <h4 className="font-medium text-amber-900">Low Engagement</h4>
                      <p className="text-sm text-amber-700">15 learners haven't accessed content in 14+ days</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Struggling with Assessments</h4>
                      <p className="text-sm text-yellow-700">8 learners consistently scoring below 70%</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">89</div>
                <p className="text-sm text-slate-600">Average daily active learners</p>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    +15% from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">12m 34s</div>
                <p className="text-sm text-slate-600">Average session length</p>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    +8% from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">1,247</div>
                <p className="text-sm text-slate-600">Total interactions this week</p>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    +22% from last week
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}