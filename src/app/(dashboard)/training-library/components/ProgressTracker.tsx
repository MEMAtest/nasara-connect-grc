"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Star,
  Trophy,
  Flame,
  Brain,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface LearningRecord {
  id: string;
  date: string;
  activity: string;
  type: 'lesson' | 'pathway' | 'challenge' | 'simulation' | 'assessment';
  duration: number;
  score?: number;
  status: 'completed' | 'in_progress' | 'failed';
  points: number;
}

interface CompetencyArea {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  assessments: number;
  lastAssessed: string;
  trend: 'up' | 'down' | 'stable';
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'overdue';
  activities: string[];
}

export function ProgressTracker() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const learningRecords: LearningRecord[] = [
    {
      id: '1',
      date: '2024-01-22',
      activity: 'Consumer Duty Implementation',
      type: 'lesson',
      duration: 8,
      score: 92,
      status: 'completed',
      points: 150
    },
    {
      id: '2',
      date: '2024-01-22',
      activity: 'Daily Risk Spotter',
      type: 'challenge',
      duration: 2,
      score: 85,
      status: 'completed',
      points: 100
    },
    {
      id: '3',
      date: '2024-01-21',
      activity: 'PEP Customer Onboarding Scenario',
      type: 'simulation',
      duration: 15,
      score: 88,
      status: 'completed',
      points: 300
    },
    {
      id: '4',
      date: '2024-01-21',
      activity: 'FCA Authorization Pathway',
      type: 'pathway',
      duration: 45,
      status: 'in_progress',
      points: 200
    },
    {
      id: '5',
      date: '2024-01-20',
      activity: 'Risk Assessment Fundamentals',
      type: 'assessment',
      duration: 12,
      score: 76,
      status: 'completed',
      points: 250
    }
  ];

  const competencyAreas: CompetencyArea[] = [
    {
      id: '1',
      name: 'FCA Authorization',
      category: 'Regulatory Compliance',
      currentLevel: 4,
      targetLevel: 5,
      assessments: 8,
      lastAssessed: '2024-01-20',
      trend: 'up'
    },
    {
      id: '2',
      name: 'Consumer Duty',
      category: 'Customer Protection',
      currentLevel: 3,
      targetLevel: 4,
      assessments: 5,
      lastAssessed: '2024-01-22',
      trend: 'up'
    },
    {
      id: '3',
      name: 'Risk Management',
      category: 'Risk & Controls',
      currentLevel: 3,
      targetLevel: 5,
      assessments: 6,
      lastAssessed: '2024-01-19',
      trend: 'stable'
    },
    {
      id: '4',
      name: 'Financial Crime Prevention',
      category: 'AML & Sanctions',
      currentLevel: 4,
      targetLevel: 4,
      assessments: 12,
      lastAssessed: '2024-01-18',
      trend: 'stable'
    },
    {
      id: '5',
      name: 'Operational Resilience',
      category: 'Operations',
      currentLevel: 2,
      targetLevel: 4,
      assessments: 3,
      lastAssessed: '2024-01-15',
      trend: 'down'
    }
  ];

  const learningGoals: LearningGoal[] = [
    {
      id: '1',
      title: 'Complete FCA Authorization Mastery',
      description: 'Master all aspects of FCA authorization process',
      targetDate: '2024-02-15',
      progress: 75,
      status: 'on_track',
      activities: ['Authorization Pathway', 'Case Studies', 'Assessment']
    },
    {
      id: '2',
      title: 'Consumer Duty Expert Certification',
      description: 'Achieve expert-level competency in Consumer Duty',
      targetDate: '2024-01-30',
      progress: 60,
      status: 'at_risk',
      activities: ['Implementation Guide', 'Practical Scenarios', 'Certification Exam']
    },
    {
      id: '3',
      title: 'Risk Assessment Specialist',
      description: 'Develop advanced risk assessment skills',
      targetDate: '2024-03-01',
      progress: 35,
      status: 'on_track',
      activities: ['Risk Fundamentals', 'Advanced Techniques', 'Real-world Application']
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'pathway':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'challenge':
        return <Flame className="h-4 w-4 text-orange-600" />;
      case 'simulation':
        return <Brain className="h-4 w-4 text-emerald-600" />;
      case 'assessment':
        return <FileText className="h-4 w-4 text-amber-600" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-emerald-600" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-slate-600" />;
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'at_risk':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const totalHours = learningRecords.reduce((sum, record) => sum + record.duration, 0);
  const averageScore = learningRecords
    .filter(r => r.score)
    .reduce((sum, record, _, arr) => sum + (record.score || 0) / arr.length, 0);
  const completedActivities = learningRecords.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Learning Progress & Analytics</h2>
          <p className="text-slate-600 mt-1">Track your learning journey and competency development</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View Certificate
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Learning Hours</p>
                <p className="text-2xl font-bold text-slate-900">{totalHours}h</p>
                <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% this month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Average Score</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(averageScore)}%</p>
                <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% this month
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
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{completedActivities}</p>
                <p className="text-sm text-slate-600">Activities</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Competency Level</p>
                <p className="text-2xl font-bold text-slate-900">3.2</p>
                <p className="text-sm text-slate-600">Average across areas</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          <TabsTrigger value="history">Activity History</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Learning Activity</CardTitle>
                <CardDescription>Your latest learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningRecords.slice(0, 5).map(record => (
                    <div key={record.id} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                      <div className="flex-shrink-0">
                        {getActivityIcon(record.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{record.activity}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                          <span>{record.date}</span>
                          <span>{record.duration} min</span>
                          {record.score && <span>{record.score}% score</span>}
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Calendar</CardTitle>
                <CardDescription>Track your learning consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>Learning activity completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span>Partial completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                    <span>No activity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Summary</CardTitle>
              <CardDescription>Overview of your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-4">Weekly Goals</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Learning Time</span>
                        <span className="text-sm font-medium">65/80 min</span>
                      </div>
                      <Progress value={81} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Assessments</span>
                        <span className="text-sm font-medium">2/3 completed</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-4">Monthly Targets</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Pathways</span>
                        <span className="text-sm font-medium">2/3 completed</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Certifications</span>
                        <span className="text-sm font-medium">1/2 achieved</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Streak</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        7 days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Rank</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-amber-500" />
                        #3
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competency Assessment</CardTitle>
              <CardDescription>Track your skill development across key areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competencyAreas.map(area => (
                  <div key={area.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{area.name}</h3>
                          {getTrendIcon(area.trend)}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{area.category}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{area.assessments} assessments</span>
                          <span>Last assessed: {area.lastAssessed}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 mb-1">Current Level</div>
                        <div className="text-2xl font-bold text-slate-900">{area.currentLevel}</div>
                        <div className="text-xs text-slate-500">Target: {area.targetLevel}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Competency Progress</span>
                        <span className="font-medium">{area.currentLevel}/{area.targetLevel}</span>
                      </div>
                      <Progress value={(area.currentLevel / area.targetLevel) * 100} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Take Assessment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
              <CardDescription>Track progress towards your learning objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningGoals.map(goal => (
                  <div key={goal.id} className={`border rounded-lg p-4 ${getGoalStatusColor(goal.status)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">{goal.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>Target: {goal.targetDate}</span>
                          <Badge variant="outline" className={getGoalStatusColor(goal.status)}>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 mb-1">Progress</div>
                        <div className="text-2xl font-bold text-slate-900">{goal.progress}%</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Required Activities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {goal.activities.map((activity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Learning Activity History</CardTitle>
                  <CardDescription>Complete record of your learning activities</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningRecords.map(record => (
                  <div key={record.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{record.activity}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span>{record.date}</span>
                        <span>{record.duration} minutes</span>
                        <span className="capitalize">{record.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {record.score && (
                        <div className="text-lg font-semibold text-slate-900">{record.score}%</div>
                      )}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-600">+{record.points}</div>
                      <div className="text-xs text-slate-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificates & Achievements</CardTitle>
              <CardDescription>Your earned certificates and professional achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-6 text-center">
                  <Award className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-emerald-900 mb-2">FCA Authorization Specialist</h3>
                  <p className="text-sm text-emerald-700 mb-4">Earned: January 18, 2024</p>
                  <Button variant="outline" size="sm" className="border-emerald-200">
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </Button>
                </div>

                <div className="border border-blue-200 bg-blue-50 rounded-lg p-6 text-center">
                  <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-blue-900 mb-2">Compliance Champion</h3>
                  <p className="text-sm text-blue-700 mb-4">Earned: January 15, 2024</p>
                  <Button variant="outline" size="sm" className="border-blue-200">
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </Button>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-lg p-6 text-center opacity-60">
                  <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-600 mb-2">Consumer Duty Expert</h3>
                  <p className="text-sm text-slate-500 mb-4">Complete pathway to unlock</p>
                  <Button variant="outline" size="sm" disabled>
                    In Progress
                  </Button>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-lg p-6 text-center opacity-60">
                  <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-600 mb-2">Risk Assessment Master</h3>
                  <p className="text-sm text-slate-500 mb-4">Complete pathway to unlock</p>
                  <Button variant="outline" size="sm" disabled>
                    Not Started
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
