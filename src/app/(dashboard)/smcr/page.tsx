"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Award,
  Bell,
  UserCheck,
  Settings,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  Target,
  ArrowRight,
  Crown,
  ClipboardCheck
} from 'lucide-react';
import { SMCRDashboard, PerformanceMetric, Alert, Warning } from './types';

// Mock data for demonstration - in real implementation this would come from API
const mockDashboardData: SMCRDashboard = {
  summary: {
    total_smfs: 12,
    total_certified: 45,
    upcoming_assessments: [
      {
        id: '1',
        type: 'assessment_due',
        priority: 'high',
        title: 'F&P Assessment Due',
        description: 'John Smith (SMF1) - Annual F&P assessment due in 5 days',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        person_id: 'person_1',
        action_required: 'Complete F&P assessment',
        created_date: new Date()
      }
    ],
    overdue_items: [
      {
        id: '2',
        type: 'overdue',
        priority: 'critical',
        title: 'Overdue Criminal Record Check',
        description: 'Sarah Johnson (CF30) - Criminal record check overdue by 15 days',
        person_id: 'person_2',
        action_required: 'Complete criminal record check immediately',
        created_date: new Date(),
        days_overdue: 15,
        escalation_level: 2
      }
    ]
  },
  widgets: {
    fitness_proper_status: {
      green: 35,  // All checks complete
      amber: 18,  // Pending items
      red: 4      // Issues identified
    },
    conduct_breaches: {
      current_quarter: 3,
      trend: 'decreasing',
      by_rule: new Map([
        ['Rule1', 1],
        ['Rule2', 2],
        ['SC1', 0]
      ])
    },
    training_compliance: {
      completion_rate: 92,
      overdue_persons: [],
      upcoming_deadlines: []
    },
    regulatory_changes: {
      impacting_smcr: [],
      required_actions: []
    }
  }
};

const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    metric_name: 'F&P Assessments Current',
    current_value: 95,
    threshold: 100,
    rag_status: 'amber',
    trend: 'improving',
    last_updated: new Date()
  },
  {
    metric_name: 'Training Completion Rate',
    current_value: 92,
    threshold: 95,
    rag_status: 'amber',
    trend: 'stable',
    last_updated: new Date()
  },
  {
    metric_name: 'Conduct Breaches (YTD)',
    current_value: 8,
    threshold: 5,
    rag_status: 'red',
    trend: 'declining',
    last_updated: new Date()
  },
  {
    metric_name: 'Regulatory Notifications Timely',
    current_value: 100,
    threshold: 100,
    rag_status: 'green',
    trend: 'stable',
    last_updated: new Date()
  }
];

export default function SMCRDashboard() {
  const [dashboardData, setDashboardData] = useState<SMCRDashboard>(mockDashboardData);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>(mockPerformanceMetrics);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter');

  const getRagColor = (status: 'red' | 'amber' | 'green') => {
    switch (status) {
      case 'red': return 'bg-red-500 text-white';
      case 'amber': return 'bg-amber-500 text-white';
      case 'green': return 'bg-green-500 text-white';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SM&CR Management</h1>
          <p className="text-slate-600 mt-1">
            Senior Managers & Certification Regime compliance dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link href="/smcr/people">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Alerts */}
      {(dashboardData.summary.overdue_items.length > 0 ||
        dashboardData.summary.upcoming_assessments.filter(a => a.priority === 'critical').length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Critical Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.summary.overdue_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">{item.title}</p>
                    <p className="text-sm text-red-700">{item.description}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Overdue by {item.days_overdue} days
                    </p>
                  </div>
                  <Button size="sm" variant="destructive">
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Senior Managers</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData.summary.total_smfs}</p>
                <p className="text-xs text-slate-500 mt-1">Active SMF appointments</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Certified Persons</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData.summary.total_certified}</p>
                <p className="text-xs text-slate-500 mt-1">Active CF roles</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming Assessments</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData.summary.upcoming_assessments.length}</p>
                <p className="text-xs text-slate-500 mt-1">Next 30 days</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <Calendar className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue Items</p>
                <p className="text-3xl font-bold text-red-600">{dashboardData.summary.overdue_items.length}</p>
                <p className="text-xs text-slate-500 mt-1">Require immediate action</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SM&CR Module Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            SM&CR Management Modules
          </CardTitle>
          <CardDescription>Access all SM&CR compliance and management functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Link href="/smcr/smfs" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Senior Management Functions</h3>
                  <p className="text-xs text-gray-600 mb-3">Manage SMF appointments, responsibilities, and oversight</p>
                  <Badge variant="outline" className="text-xs">
                    {dashboardData.summary.total_smfs} Active SMFs
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/smcr/certifications" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-8 w-8 text-green-500" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Certification Functions</h3>
                  <p className="text-xs text-gray-600 mb-3">Track CF roles, assessments, and competence</p>
                  <Badge variant="outline" className="text-xs">
                    {dashboardData.summary.total_certified} Certified
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/smcr/fitness-propriety" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <UserCheck className="h-8 w-8 text-purple-500" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Fitness & Propriety</h3>
                  <p className="text-xs text-gray-600 mb-3">Manage F&P assessments, checks, and determinations</p>
                  <Badge variant="outline" className="text-xs">
                    {dashboardData.widgets.fitness_proper_status.green +
                     dashboardData.widgets.fitness_proper_status.amber +
                     dashboardData.widgets.fitness_proper_status.red} Assessments
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/smcr/conduct-rules" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ClipboardCheck className="h-8 w-8 text-orange-500" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Conduct Rules & Breaches</h3>
                  <p className="text-xs text-gray-600 mb-3">Monitor conduct rules compliance and manage breaches</p>
                  <Badge variant="outline" className="text-xs">
                    {dashboardData.widgets.conduct_breaches.current_quarter} This Quarter
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/smcr/people" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 text-purple-500" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">People Management</h3>
                  <p className="text-xs text-gray-600 mb-3">Add and manage personnel records and profiles</p>
                  <Badge variant="outline" className="text-xs">
                    Staff Directory
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/smcr/workflows" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Settings className="h-8 w-8 text-indigo-500" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Workflow Management</h3>
                  <p className="text-xs text-gray-600 mb-3">Automate processes and track assessments</p>
                  <Badge variant="outline" className="text-xs">
                    Process Automation
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Status and Metrics */}
        <div className="xl:col-span-2 space-y-6">
          {/* Fitness & Propriety Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Fitness & Propriety Status
              </CardTitle>
              <CardDescription>Current F&P assessment status across all SM&CR roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.widgets.fitness_proper_status.green}
                  </div>
                  <div className="text-sm text-slate-600">Current</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(dashboardData.widgets.fitness_proper_status.green /
                          (dashboardData.widgets.fitness_proper_status.green +
                           dashboardData.widgets.fitness_proper_status.amber +
                           dashboardData.widgets.fitness_proper_status.red)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {dashboardData.widgets.fitness_proper_status.amber}
                  </div>
                  <div className="text-sm text-slate-600">Pending</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${(dashboardData.widgets.fitness_proper_status.amber /
                          (dashboardData.widgets.fitness_proper_status.green +
                           dashboardData.widgets.fitness_proper_status.amber +
                           dashboardData.widgets.fitness_proper_status.red)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData.widgets.fitness_proper_status.red}
                  </div>
                  <div className="text-sm text-slate-600">Issues</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(dashboardData.widgets.fitness_proper_status.red /
                          (dashboardData.widgets.fitness_proper_status.green +
                           dashboardData.widgets.fitness_proper_status.amber +
                           dashboardData.widgets.fitness_proper_status.red)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Detailed F&P Status
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Key Performance Metrics
              </CardTitle>
              <CardDescription>SM&CR compliance performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{metric.metric_name}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.trend)}
                          <Badge className={getRagColor(metric.rag_status)}>
                            {metric.rag_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {typeof metric.current_value === 'number' ?
                            (metric.current_value % 1 === 0 ? metric.current_value : `${metric.current_value}%`) :
                            metric.current_value
                          }
                        </span>
                        <span className="text-sm text-slate-500">
                          Target: {typeof metric.threshold === 'number' ?
                            (metric.threshold % 1 === 0 ? metric.threshold : `${metric.threshold}%`) :
                            metric.threshold
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Alerts and Actions */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.summary.upcoming_assessments.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded border ${getPriorityColor(alert.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                        {alert.due_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            Due: {alert.due_date.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {alert.priority}
                      </Badge>
                    </div>
                  </div>
                ))}

                {dashboardData.summary.upcoming_assessments.length === 0 && (
                  <div className="text-center py-6 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No urgent alerts</p>
                    <p className="text-sm">All assessments are up to date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/smcr/people">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    View All SM&CR Persons
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Board Report
                </Button>
                <Link href="/smcr/fitness-propriety">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule F&P Assessment
                  </Button>
                </Link>
                <Link href="/smcr/conduct-rules">
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Review Conduct Breaches
                  </Button>
                </Link>
                <Link href="/smcr/workflows">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Workflows
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Conduct Breaches Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Conduct Breaches
              </CardTitle>
              <CardDescription>Current quarter summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-slate-900">
                  {dashboardData.widgets.conduct_breaches.current_quarter}
                </div>
                <div className="text-sm text-slate-600">Total breaches</div>
                <div className="flex items-center justify-center mt-2">
                  {dashboardData.widgets.conduct_breaches.trend === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  ) : dashboardData.widgets.conduct_breaches.trend === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  ) : (
                    <BarChart3 className="h-4 w-4 text-blue-600 mr-1" />
                  )}
                  <span className="text-sm text-slate-600 capitalize">
                    {dashboardData.widgets.conduct_breaches.trend}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                View Breach Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Training Compliance
          </CardTitle>
          <CardDescription>SM&CR-specific training completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {dashboardData.widgets.training_compliance.completion_rate}%
              </div>
              <div className="text-sm text-slate-600 mb-3">Overall Completion</div>
              <Progress value={dashboardData.widgets.training_compliance.completion_rate} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {dashboardData.widgets.training_compliance.overdue_persons.length}
              </div>
              <div className="text-sm text-slate-600">Overdue Persons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {dashboardData.widgets.training_compliance.upcoming_deadlines.length}
              </div>
              <div className="text-sm text-slate-600">Upcoming Deadlines</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}