'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Clock, Filter, Plus, Search, UserCheck, Users, FileText, Calendar as CalendarIcon, Award, BookOpen, Target, Eye, Edit, RefreshCw, Bell, Download } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { certificationFunctions } from '../data/core-functions'
import { CertificationFunction, Person, Role } from '../types'

// Mock data for certification holders
const mockCertificationHolders = [
  {
    id: 'p1',
    employee_id: 'EMP001',
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    department: 'Customer Service',
    reporting_manager: 'Sarah Johnson',
    start_date: new Date('2022-01-15'),
    roles: [
      {
        id: 'cf1',
        type: 'CF' as const,
        function_id: 'cf30',
        start_date: new Date('2022-01-15'),
        approval_status: 'approved' as const,
        function: certificationFunctions.find(f => f.id === 'cf30'),
        certification_status: {
          last_assessment: new Date('2024-01-15'),
          next_due: new Date('2025-01-15'),
          status: 'valid' as const,
          assessor: 'Michael Chen',
          score: 92,
          areas_for_development: ['Customer complaint resolution', 'Product knowledge updates']
        }
      }
    ],
    training_completion: {
      required_hours: 35,
      completed_hours: 42,
      completion_percentage: 120,
      last_updated: new Date('2024-11-15')
    },
    competence_assessment: {
      technical_knowledge: 'Pass',
      practical_application: 'Pass',
      behavioral_standards: 'Pass',
      overall_rating: 'Competent'
    }
  },
  {
    id: 'p2',
    employee_id: 'EMP002',
    name: 'Robert Smith',
    email: 'robert.smith@company.com',
    department: 'Operations',
    reporting_manager: 'Emma Thompson',
    start_date: new Date('2021-06-01'),
    roles: [
      {
        id: 'cf2',
        type: 'CF' as const,
        function_id: 'cf28',
        start_date: new Date('2021-06-01'),
        approval_status: 'approved' as const,
        function: certificationFunctions.find(f => f.id === 'cf28'),
        certification_status: {
          last_assessment: new Date('2024-06-01'),
          next_due: new Date('2025-06-01'),
          status: 'due_soon' as const,
          assessor: 'Michael Chen',
          score: 88,
          areas_for_development: ['Risk management frameworks', 'Regulatory change management']
        }
      }
    ],
    training_completion: {
      required_hours: 35,
      completed_hours: 31,
      completion_percentage: 89,
      last_updated: new Date('2024-10-20')
    },
    competence_assessment: {
      technical_knowledge: 'Pass',
      practical_application: 'Development Needed',
      behavioral_standards: 'Pass',
      overall_rating: 'Developing'
    }
  },
  {
    id: 'p3',
    employee_id: 'EMP003',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    department: 'Compliance',
    reporting_manager: 'Michael Chen',
    start_date: new Date('2023-03-01'),
    roles: [
      {
        id: 'cf3',
        type: 'CF' as const,
        function_id: 'cf29',
        start_date: new Date('2023-03-01'),
        approval_status: 'pending' as const,
        function: certificationFunctions.find(f => f.id === 'cf29'),
        certification_status: {
          last_assessment: new Date('2024-03-01'),
          next_due: new Date('2025-03-01'),
          status: 'pending_assessment' as const,
          assessor: 'Michael Chen',
          score: undefined,
          areas_for_development: []
        }
      }
    ],
    training_completion: {
      required_hours: 35,
      completed_hours: 18,
      completion_percentage: 51,
      last_updated: new Date('2024-09-15')
    },
    competence_assessment: {
      technical_knowledge: 'In Progress',
      practical_application: 'Not Assessed',
      behavioral_standards: 'Pass',
      overall_rating: 'Under Assessment'
    }
  },
  {
    id: 'p4',
    employee_id: 'EMP004',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    department: 'Customer Service',
    reporting_manager: 'Sarah Johnson',
    start_date: new Date('2020-09-15'),
    roles: [
      {
        id: 'cf4',
        type: 'CF' as const,
        function_id: 'cf30',
        start_date: new Date('2020-09-15'),
        approval_status: 'approved' as const,
        function: certificationFunctions.find(f => f.id === 'cf30'),
        certification_status: {
          last_assessment: new Date('2024-09-15'),
          next_due: new Date('2025-09-15'),
          status: 'overdue' as const,
          assessor: 'Michael Chen',
          score: 76,
          areas_for_development: ['Digital banking knowledge', 'Regulatory updates', 'Customer vulnerability awareness']
        }
      }
    ],
    training_completion: {
      required_hours: 35,
      completed_hours: 22,
      completion_percentage: 63,
      last_updated: new Date('2024-08-10')
    },
    competence_assessment: {
      technical_knowledge: 'Development Needed',
      practical_application: 'Pass',
      behavioral_standards: 'Pass',
      overall_rating: 'Requires Improvement'
    }
  }
];

export function CertificationsClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFunction, setSelectedFunction] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAssessmentStatus, setSelectedAssessmentStatus] = useState<string>('all')
  const [showCertifyDialog, setShowCertifyDialog] = useState(false)
  const [selectedHolder, setSelectedHolder] = useState<typeof mockCertificationHolders[0] | null>(null)

  // Filter certification holders
  const filteredHolders = useMemo(() => {
    return mockCertificationHolders.filter(holder => {
      const matchesSearch = holder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           holder.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFunction = selectedFunction === 'all' ||
                             holder.roles.some(role => role.function_id === selectedFunction)

      const matchesStatus = selectedStatus === 'all' ||
                           holder.roles.some(role => role.approval_status === selectedStatus)

      const matchesAssessmentStatus = selectedAssessmentStatus === 'all' ||
                                    holder.roles.some(role =>
                                      role.certification_status?.status === selectedAssessmentStatus
                                    )

      return matchesSearch && matchesFunction && matchesStatus && matchesAssessmentStatus
    })
  }, [searchTerm, selectedFunction, selectedStatus, selectedAssessmentStatus])

  // Calculate summary statistics
  const statistics = useMemo(() => {
    const totalCFs = mockCertificationHolders.length
    const validCertifications = mockCertificationHolders.filter(holder =>
      holder.roles.some(role => role.certification_status?.status === 'valid')
    ).length
    const dueSoon = mockCertificationHolders.filter(holder =>
      holder.roles.some(role => role.certification_status?.status === 'due_soon')
    ).length
    const overdue = mockCertificationHolders.filter(holder =>
      holder.roles.some(role => role.certification_status?.status === 'overdue')
    ).length
    const averageCompletionRate = Math.round(
      mockCertificationHolders.reduce((acc, holder) => acc + holder.training_completion.completion_percentage, 0) / totalCFs
    )

    return { totalCFs, validCertifications, dueSoon, overdue, averageCompletionRate }
  }, [])

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800 border-green-200'
      case 'due_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending_assessment': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCompetenceColor = (rating: string) => {
    switch (rating) {
      case 'Competent': return 'text-green-600'
      case 'Developing': return 'text-yellow-600'
      case 'Requires Improvement': return 'text-red-600'
      case 'Under Assessment': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatAssessmentStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Certification Functions</h1>
          <p className="text-gray-600 mt-1">Manage CF roles, assessments, and competence requirements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Assessment Report
          </Button>
          <Dialog open={showCertifyDialog} onOpenChange={setShowCertifyDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Certify Person
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Certify Person for Certification Function</DialogTitle>
                <DialogDescription>
                  Certify an individual for a specific Certification Function role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="person">Person</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">Alice Johnson</SelectItem>
                        <SelectItem value="p2">Robert Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cf">Certification Function</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CF" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificationFunctions.map(cf => (
                          <SelectItem key={cf.id} value={cf.id}>
                            {cf.cf_number} - {cf.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessor">Assessor</Label>
                    <Input placeholder="Enter assessor name" />
                  </div>
                  <div>
                    <Label htmlFor="assessment-date">Assessment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Select date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <Label htmlFor="assessment-notes">Assessment Notes</Label>
                  <Textarea
                    placeholder="Enter assessment findings and recommendations..."
                    className="h-24"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCertifyDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Certify Person</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total CFs</p>
                <p className="text-2xl font-bold">{statistics.totalCFs}</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valid Certifications</p>
                <p className="text-2xl font-bold text-green-600">{statistics.validCertifications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.dueSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statistics.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Training Completion</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.averageCompletionRate}%</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Functions</SelectItem>
                  {certificationFunctions.map(cf => (
                    <SelectItem key={cf.id} value={cf.id}>
                      {cf.cf_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAssessmentStatus} onValueChange={setSelectedAssessmentStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessments</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="due_soon">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending_assessment">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="holders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holders">CF Holders</TabsTrigger>
          <TabsTrigger value="functions">Available Functions</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="holders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredHolders.map((holder) => (
              <Card key={holder.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{holder.name}</CardTitle>
                      <CardDescription>{holder.employee_id} • {holder.department}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedHolder(holder)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Certification Function */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Certification Function:</p>
                    {holder.roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium text-sm">{role.function?.cf_number}</p>
                          <p className="text-xs text-gray-600">{role.function?.title}</p>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs border",
                            getAssessmentStatusColor(role.certification_status?.status || 'pending')
                          )}
                        >
                          {formatAssessmentStatus(role.certification_status?.status || 'pending')}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Training Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Training Progress</p>
                      <span className={cn(
                        "text-sm font-medium",
                        getCompletionColor(holder.training_completion.completion_percentage)
                      )}>
                        {holder.training_completion.completed_hours}/{holder.training_completion.required_hours} hrs
                      </span>
                    </div>
                    <Progress
                      value={Math.min(holder.training_completion.completion_percentage, 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {holder.training_completion.completion_percentage}% complete
                    </p>
                  </div>

                  {/* Competence Assessment */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Competence Rating:</p>
                    <div className="flex items-center gap-2">
                      <Target className={cn(
                        "h-4 w-4",
                        getCompetenceColor(holder.competence_assessment.overall_rating)
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        getCompetenceColor(holder.competence_assessment.overall_rating)
                      )}>
                        {holder.competence_assessment.overall_rating}
                      </span>
                    </div>
                  </div>

                  {/* Next Assessment Date */}
                  {holder.roles[0]?.certification_status?.next_due && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Next Assessment:</p>
                      <p className="text-sm font-medium">
                        {format(holder.roles[0].certification_status.next_due, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Assess
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHolders.length === 0 && (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No CF holders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedFunction !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No certification functions have been assigned yet.'}
              </p>
              <Button onClick={() => setShowCertifyDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Certify First Person
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {certificationFunctions.map((cf) => (
              <Card key={cf.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    {cf.cf_number} - {cf.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{cf.description}</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Applies To:</p>
                      <div className="flex flex-wrap gap-1">
                        {cf.applies_to.map((applicability, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {applicability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Annual Assessment:</p>
                      <Badge variant={cf.annual_assessment ? "default" : "secondary"}>
                        {cf.annual_assessment ? 'Required' : 'Not Required'}
                      </Badge>
                    </div>

                    {cf.competence_requirements && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Competence Requirements:</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          {cf.competence_requirements.technical_knowledge_test && (
                            <p>• Technical knowledge test required</p>
                          )}
                          {cf.competence_requirements.annual_cpd_hours && (
                            <p>• {cf.competence_requirements.annual_cpd_hours} CPD hours annually</p>
                          )}
                          {cf.competence_requirements.qualifications && (
                            <div>
                              <p>• Required qualifications:</p>
                              {cf.competence_requirements.qualifications.map((qual, index) => (
                                <p key={index} className="ml-4">- {qual}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Button size="sm" variant="outline" className="w-full">
                      View Holders ({mockCertificationHolders.filter(h => h.roles.some(r => r.function_id === cf.id)).length})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Schedule</CardTitle>
                <CardDescription>Upcoming and overdue assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCertificationHolders
                    .filter(holder => holder.roles[0]?.certification_status?.next_due)
                    .sort((a, b) => {
                      const dateA = a.roles[0]?.certification_status?.next_due || new Date()
                      const dateB = b.roles[0]?.certification_status?.next_due || new Date()
                      return dateA.getTime() - dateB.getTime()
                    })
                    .map((holder) => {
                      const certStatus = holder.roles[0]?.certification_status
                      if (!certStatus?.next_due) return null

                      const daysUntilDue = Math.ceil(
                        (certStatus.next_due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )

                      return (
                        <div key={holder.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium text-sm">{holder.name}</p>
                            <p className="text-xs text-gray-600">
                              {holder.roles[0]?.function?.cf_number} - {holder.roles[0]?.function?.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {format(certStatus.next_due, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={daysUntilDue < 0 ? "destructive" : daysUntilDue < 30 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {daysUntilDue < 0
                                ? `${Math.abs(daysUntilDue)} days overdue`
                                : `${daysUntilDue} days`
                              }
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Competence Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Competence Overview</CardTitle>
                <CardDescription>Current competence ratings distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Competent', 'Developing', 'Requires Improvement', 'Under Assessment'].map((rating) => {
                    const count = mockCertificationHolders.filter(
                      holder => holder.competence_assessment.overall_rating === rating
                    ).length
                    const percentage = Math.round((count / mockCertificationHolders.length) * 100)

                    return (
                      <div key={rating}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn("text-sm font-medium", getCompetenceColor(rating))}>
                            {rating}
                          </span>
                          <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Holder Details Dialog */}
      <Dialog open={!!selectedHolder} onOpenChange={() => setSelectedHolder(null)}>
        <DialogContent className="max-w-4xl">
          {selectedHolder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {selectedHolder.name} - CF Assessment Details
                </DialogTitle>
                <DialogDescription>
                  Detailed certification and competence information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="font-medium mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee ID:</span>
                        <span>{selectedHolder.employee_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span>{selectedHolder.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{format(selectedHolder.start_date, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Training Progress */}
                  <div>
                    <h4 className="font-medium mb-3">Training Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Required Hours:</span>
                        <span>{selectedHolder.training_completion.required_hours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed Hours:</span>
                        <span>{selectedHolder.training_completion.completed_hours}</span>
                      </div>
                      <Progress value={Math.min(selectedHolder.training_completion.completion_percentage, 100)} />
                      <p className="text-xs text-gray-500">
                        Last updated: {format(selectedHolder.training_completion.last_updated, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certification Status */}
                <div>
                  <h4 className="font-medium mb-3">Certification Status</h4>
                  {selectedHolder.roles.map((role) => (
                    <div key={role.id} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">{role.function?.cf_number} - {role.function?.title}</h5>
                        <Badge
                          className={cn(
                            "text-xs border",
                            getAssessmentStatusColor(role.certification_status?.status || 'pending')
                          )}
                        >
                          {formatAssessmentStatus(role.certification_status?.status || 'pending')}
                        </Badge>
                      </div>

                      {role.certification_status && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Last Assessment:</p>
                            <p>{format(role.certification_status.last_assessment, 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Next Due:</p>
                            <p>{format(role.certification_status.next_due, 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Assessor:</p>
                            <p>{role.certification_status.assessor}</p>
                          </div>
                          {role.certification_status.score && (
                            <div>
                              <p className="text-gray-600">Score:</p>
                              <p className="font-medium">{role.certification_status.score}%</p>
                            </div>
                          )}
                        </div>
                      )}

                      {role.certification_status?.areas_for_development.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Areas for Development:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {role.certification_status.areas_for_development.map((area, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Competence Assessment */}
                <div>
                  <h4 className="font-medium mb-3">Competence Assessment</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Technical Knowledge:</p>
                      <Badge variant="outline">{selectedHolder.competence_assessment.technical_knowledge}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Practical Application:</p>
                      <Badge variant="outline">{selectedHolder.competence_assessment.practical_application}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Behavioral Standards:</p>
                      <Badge variant="outline">{selectedHolder.competence_assessment.behavioral_standards}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Overall Rating:</p>
                      <Badge
                        variant="outline"
                        className={getCompetenceColor(selectedHolder.competence_assessment.overall_rating)}
                      >
                        {selectedHolder.competence_assessment.overall_rating}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}