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
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertTriangle, CheckCircle, Clock, Filter, Plus, Search, UserCheck, Users,
  FileText, Calendar as CalendarIcon, Shield, Award, Eye, Edit, Download,
  Upload, Bell, AlertCircle, XCircle, CreditCard, GraduationCap, Briefcase,
  FileX, CheckSquare, User, Building2, ScrollText
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Mock data for F&P assessments
const mockAssessments = [
  {
    id: 'fp1',
    person: {
      id: 'p1',
      name: 'Sarah Johnson',
      employee_id: 'EMP001',
      email: 'sarah.johnson@company.com',
      department: 'Executive',
      proposed_role: 'SMF1 - Chief Executive'
    },
    assessment_date: new Date('2024-01-15'),
    next_due_date: new Date('2025-01-15'),
    status: 'Valid' as const,
    overall_determination: 'Fit and Proper' as const,
    honesty_integrity: {
      criminal_records_check: {
        status: 'complete' as const,
        date_completed: new Date('2024-01-10'),
        result: 'clear' as const,
        scope: 'full_enhanced' as const,
        provider: 'Disclosure & Barring Service',
        certificate_number: 'DBS123456789',
        documents: [],
        next_due: new Date('2027-01-10')
      },
      regulatory_references: [
        {
          id: 'rr1',
          referee_firm: 'Previous Bank Ltd',
          referee_contact: 'John Smith, HR Director',
          period_covered: {
            start_date: new Date('2018-01-01'),
            end_date: new Date('2020-01-15')
          },
          request_date: new Date('2023-12-01'),
          response_received: new Date('2023-12-15'),
          status: 'received' as const,
          template_used: 'fca_standard' as const,
          reference_details: {
            fitness_propriety_concerns: false,
            disciplinary_actions: false,
            performance_concerns: false,
            additional_comments: 'Excellent track record in senior management'
          }
        }
      ],
      credit_checks: {
        status: 'complete' as const,
        date_completed: new Date('2024-01-08'),
        result: 'clear' as const,
        ccjs_over_1000: false,
        iva_bankruptcy: false,
        defaults_over_3: false,
        score: 850,
        adverse_items: [],
        documents: [],
        next_due: new Date('2025-01-08')
      }
    },
    competence_capability: {
      qualifications: [
        {
          id: 'q1',
          type: 'MBA',
          title: 'Master of Business Administration',
          awarding_body: 'London Business School',
          date_achieved: new Date('2010-06-15'),
          certificate_number: 'LBS2010MBA789',
          verified: true
        },
        {
          id: 'q2',
          type: 'Professional',
          title: 'Chartered Financial Analyst (CFA)',
          awarding_body: 'CFA Institute',
          date_achieved: new Date('2012-08-20'),
          expiry_date: new Date('2025-08-20'),
          certificate_number: 'CFA123456',
          verified: true
        }
      ],
      experience: [
        {
          employer: 'Previous Bank Ltd',
          position: 'Deputy CEO',
          start_date: new Date('2018-01-01'),
          end_date: new Date('2020-01-15'),
          sector: 'financial_services' as const,
          relevance_score: 95,
          verified: true
        },
        {
          employer: 'Investment Firm Corp',
          position: 'Managing Director',
          start_date: new Date('2015-03-01'),
          end_date: new Date('2017-12-31'),
          sector: 'financial_services' as const,
          relevance_score: 90,
          verified: true
        }
      ],
      training_records: [
        {
          course_id: 'TR001',
          course_title: 'Senior Manager Responsibilities Training',
          completion_date: new Date('2024-01-05'),
          provider: 'Compliance Training Ltd',
          cpd_hours: 8
        }
      ]
    },
    financial_soundness: {
      personal_financial_questionnaire: {
        id: 'pfq1',
        title: 'Personal Financial Questionnaire',
        type: 'financial_assessment',
        file_path: '/documents/pfq_sarah_johnson.pdf',
        upload_date: new Date('2024-01-01'),
        uploaded_by: 'HR System',
        version: 1,
        status: 'final' as const,
        confidentiality_level: 'confidential' as const
      },
      related_party_transactions: [],
      outside_business_interests: [
        {
          company_name: 'Property Investment Ltd',
          nature_of_business: 'Real Estate Investment',
          role: 'Non-Executive Director',
          percentage_holding: 15,
          potential_conflicts: ['None identified'],
          approval_required: true,
          approved: true
        }
      ]
    },
    reviewer: 'Michael Chen',
    approved_by: 'Board of Directors'
  },
  {
    id: 'fp2',
    person: {
      id: 'p2',
      name: 'Michael Chen',
      employee_id: 'EMP002',
      email: 'michael.chen@company.com',
      department: 'Compliance',
      proposed_role: 'SMF16 - Compliance Oversight'
    },
    assessment_date: new Date('2024-03-01'),
    next_due_date: new Date('2025-03-01'),
    status: 'Under Review' as const,
    overall_determination: 'Conditional' as const,
    conditions: ['Complete advanced AML certification within 6 months'],
    honesty_integrity: {
      criminal_records_check: {
        status: 'complete' as const,
        date_completed: new Date('2024-02-25'),
        result: 'clear' as const,
        scope: 'spent_financial_crime' as const,
        provider: 'Disclosure Scotland',
        certificate_number: 'DS987654321',
        documents: [],
        next_due: new Date('2027-02-25')
      },
      regulatory_references: [
        {
          id: 'rr2',
          referee_firm: 'Regulatory Consulting Group',
          referee_contact: 'Jane Williams, Partner',
          period_covered: {
            start_date: new Date('2020-06-01'),
            end_date: new Date('2021-03-01')
          },
          request_date: new Date('2024-01-15'),
          response_received: new Date('2024-01-30'),
          status: 'received' as const,
          template_used: 'fca_standard' as const,
          reference_details: {
            fitness_propriety_concerns: false,
            disciplinary_actions: false,
            performance_concerns: false,
            additional_comments: 'Strong compliance background'
          }
        }
      ],
      credit_checks: {
        status: 'complete' as const,
        date_completed: new Date('2024-02-20'),
        result: 'issues_identified' as const,
        ccjs_over_1000: false,
        iva_bankruptcy: false,
        defaults_over_3: true,
        score: 680,
        adverse_items: [
          {
            type: 'default' as const,
            amount: 2500,
            date: new Date('2020-08-15'),
            status: 'satisfied' as const,
            details: 'Personal loan default - now resolved'
          }
        ],
        documents: [],
        next_due: new Date('2025-02-20')
      }
    },
    competence_capability: {
      qualifications: [
        {
          id: 'q3',
          type: 'Professional',
          title: 'International Compliance Association (ICA) Diploma',
          awarding_body: 'ICA',
          date_achieved: new Date('2019-11-20'),
          certificate_number: 'ICA2019789',
          verified: true
        }
      ],
      experience: [
        {
          employer: 'Regulatory Consulting Group',
          position: 'Senior Compliance Manager',
          start_date: new Date('2020-06-01'),
          end_date: new Date('2021-03-01'),
          sector: 'related_regulated' as const,
          relevance_score: 85,
          verified: true
        }
      ],
      training_records: [
        {
          course_id: 'TR002',
          course_title: 'FCA Handbook Updates 2024',
          completion_date: new Date('2024-02-15'),
          provider: 'Compliance Training Ltd',
          cpd_hours: 4
        }
      ]
    },
    financial_soundness: {
      personal_financial_questionnaire: {
        id: 'pfq2',
        title: 'Personal Financial Questionnaire',
        type: 'financial_assessment',
        file_path: '/documents/pfq_michael_chen.pdf',
        upload_date: new Date('2024-02-10'),
        uploaded_by: 'HR System',
        version: 1,
        status: 'final' as const,
        confidentiality_level: 'confidential' as const
      },
      related_party_transactions: [],
      outside_business_interests: []
    },
    reviewer: 'Emma Thompson',
    approved_by: 'Pending'
  },
  {
    id: 'fp3',
    person: {
      id: 'p3',
      name: 'Emma Thompson',
      employee_id: 'EMP003',
      email: 'emma.thompson@company.com',
      department: 'Risk',
      proposed_role: 'SMF17 - Money Laundering Reporting Officer'
    },
    assessment_date: new Date('2019-06-15'),
    next_due_date: new Date('2024-06-15'),
    status: 'Overdue' as const,
    overall_determination: 'Fit and Proper' as const,
    honesty_integrity: {
      criminal_records_check: {
        status: 'complete' as const,
        date_completed: new Date('2019-06-01'),
        result: 'clear' as const,
        scope: 'full_enhanced' as const,
        provider: 'Disclosure & Barring Service',
        certificate_number: 'DBS555666777',
        documents: [],
        next_due: new Date('2022-06-01') // Overdue
      },
      regulatory_references: [],
      credit_checks: {
        status: 'complete' as const,
        date_completed: new Date('2019-05-25'),
        result: 'clear' as const,
        ccjs_over_1000: false,
        iva_bankruptcy: false,
        defaults_over_3: false,
        score: 780,
        adverse_items: [],
        documents: [],
        next_due: new Date('2020-05-25') // Overdue
      }
    },
    competence_capability: {
      qualifications: [
        {
          id: 'q4',
          type: 'Professional',
          title: 'ACAMS Certified Anti-Money Laundering Specialist',
          awarding_body: 'ACAMS',
          date_achieved: new Date('2018-09-10'),
          expiry_date: new Date('2025-09-10'),
          certificate_number: 'ACAMS123789',
          verified: true
        }
      ],
      experience: [
        {
          employer: 'AML Solutions Ltd',
          position: 'Senior AML Manager',
          start_date: new Date('2016-04-01'),
          end_date: new Date('2019-06-15'),
          sector: 'financial_services' as const,
          relevance_score: 95,
          verified: true
        }
      ],
      training_records: [
        {
          course_id: 'TR003',
          course_title: 'Advanced Money Laundering Detection',
          completion_date: new Date('2019-05-20'),
          provider: 'AML Training Institute',
          cpd_hours: 12
        }
      ]
    },
    financial_soundness: {
      personal_financial_questionnaire: {
        id: 'pfq3',
        title: 'Personal Financial Questionnaire',
        type: 'financial_assessment',
        file_path: '/documents/pfq_emma_thompson.pdf',
        upload_date: new Date('2019-05-15'),
        uploaded_by: 'HR System',
        version: 1,
        status: 'final' as const,
        confidentiality_level: 'confidential' as const
      },
      related_party_transactions: [],
      outside_business_interests: []
    },
    reviewer: 'Sarah Johnson',
    approved_by: 'Board of Directors'
  }
];

export function FitnessProprietyClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDetermination, setSelectedDetermination] = useState<string>('all')
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<typeof mockAssessments[0] | null>(null)

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return mockAssessments.filter(assessment => {
      const matchesSearch = assessment.person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.person.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus
      const matchesDetermination = selectedDetermination === 'all' || assessment.overall_determination === selectedDetermination

      return matchesSearch && matchesStatus && matchesDetermination
    })
  }, [searchTerm, selectedStatus, selectedDetermination])

  // Calculate summary statistics
  const statistics = useMemo(() => {
    const total = mockAssessments.length
    const fitAndProper = mockAssessments.filter(a => a.overall_determination === 'Fit and Proper').length
    const conditional = mockAssessments.filter(a => a.overall_determination === 'Conditional').length
    const underReview = mockAssessments.filter(a => a.status === 'Under Review').length
    const overdue = mockAssessments.filter(a => a.status === 'Overdue').length

    return { total, fitAndProper, conditional, underReview, overdue }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid': return 'bg-green-100 text-green-800 border-green-200'
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Issues': return 'bg-red-100 text-red-800 border-red-200'
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDeterminationColor = (determination: string) => {
    switch (determination) {
      case 'Fit and Proper': return 'bg-green-100 text-green-800'
      case 'Not Fit and Proper': return 'bg-red-100 text-red-800'
      case 'Conditional': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCheckResultIcon = (result: string) => {
    switch (result) {
      case 'clear': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'issues_identified': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'pending_review': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fitness & Propriety Assessments</h1>
          <p className="text-gray-600 mt-1">Manage F&P assessments, checks, and determinations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={showNewAssessmentDialog} onOpenChange={setShowNewAssessmentDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New F&P Assessment</DialogTitle>
                <DialogDescription>
                  Initiate a new fitness and propriety assessment for an individual
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
                        <SelectItem value="p1">Sarah Johnson</SelectItem>
                        <SelectItem value="p2">Michael Chen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Proposed Role</Label>
                    <Input placeholder="Enter proposed role (e.g., SMF1)" />
                  </div>
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
                <div>
                  <Label htmlFor="reviewer">Reviewer</Label>
                  <Input placeholder="Enter reviewer name" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewAssessmentDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Create Assessment</Button>
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
                <p className="text-sm text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fit & Proper</p>
                <p className="text-2xl font-bold text-green-600">{statistics.fitAndProper}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conditional</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.conditional}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.underReview}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
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
              <Clock className="h-8 w-8 text-red-500" />
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Valid">Valid</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Issues">Issues</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDetermination} onValueChange={setSelectedDetermination}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Determinations</SelectItem>
                  <SelectItem value="Fit and Proper">Fit and Proper</SelectItem>
                  <SelectItem value="Not Fit and Proper">Not Fit and Proper</SelectItem>
                  <SelectItem value="Conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="checks">Background Checks</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Items</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assessment.person.name}</CardTitle>
                      <CardDescription>
                        {assessment.person.employee_id} • {assessment.person.proposed_role}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={cn("text-xs border", getStatusColor(assessment.status))}>
                        {assessment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Overall Determination:</p>
                      <Badge className={cn("text-xs", getDeterminationColor(assessment.overall_determination))}>
                        {assessment.overall_determination}
                      </Badge>
                    </div>

                    {assessment.conditions && assessment.conditions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Conditions:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {assessment.conditions.map((condition, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Key Checks Status:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          Criminal Records
                        </span>
                        <div className="flex items-center gap-1">
                          {getCheckResultIcon(assessment.honesty_integrity.criminal_records_check.result)}
                          <span className="capitalize text-xs">
                            {assessment.honesty_integrity.criminal_records_check.result.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3" />
                          Credit Check
                        </span>
                        <div className="flex items-center gap-1">
                          {getCheckResultIcon(assessment.honesty_integrity.credit_checks.result)}
                          <span className="capitalize text-xs">
                            {assessment.honesty_integrity.credit_checks.result.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          References
                        </span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs">
                            {assessment.honesty_integrity.regulatory_references.length} received
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assessment Date:</span>
                      <span>{format(assessment.assessment_date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Next Due:</span>
                      <span className={isOverdue(assessment.next_due_date) ? 'text-red-600 font-medium' : ''}>
                        {format(assessment.next_due_date, 'MMM dd, yyyy')}
                        {isOverdue(assessment.next_due_date) && ' (Overdue)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Reviewer:</span>
                      <span>{assessment.reviewer}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
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

          {filteredAssessments.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedDetermination !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No F&P assessments have been created yet.'}
              </p>
              <Button onClick={() => setShowNewAssessmentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Criminal Records Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Criminal Records Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium text-sm">{assessment.person.name}</p>
                        <p className="text-xs text-gray-600">
                          {assessment.honesty_integrity.criminal_records_check.scope.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(assessment.honesty_integrity.criminal_records_check.date_completed, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getCheckResultIcon(assessment.honesty_integrity.criminal_records_check.result)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Credit Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  Credit Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium text-sm">{assessment.person.name}</p>
                        <p className="text-xs text-gray-600">
                          Score: {assessment.honesty_integrity.credit_checks.score}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(assessment.honesty_integrity.credit_checks.date_completed, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getCheckResultIcon(assessment.honesty_integrity.credit_checks.result)}
                        {assessment.honesty_integrity.credit_checks.adverse_items.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {assessment.honesty_integrity.credit_checks.adverse_items.length} items
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regulatory References */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Regulatory References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium text-sm">{assessment.person.name}</p>
                        <p className="text-xs text-gray-600">
                          {assessment.honesty_integrity.regulatory_references.length} references
                        </p>
                        {assessment.honesty_integrity.regulatory_references.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Latest: {format(
                              assessment.honesty_integrity.regulatory_references[0]?.response_received || new Date(),
                              'MMM dd, yyyy'
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="space-y-4">
            {mockAssessments
              .filter(assessment =>
                isOverdue(assessment.next_due_date) ||
                isOverdue(assessment.honesty_integrity.criminal_records_check.next_due!) ||
                isOverdue(assessment.honesty_integrity.credit_checks.next_due!)
              )
              .map((assessment) => (
                <Card key={assessment.id} className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      {assessment.person.name} - Overdue Items
                    </CardTitle>
                    <CardDescription>{assessment.person.employee_id} • {assessment.person.proposed_role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {isOverdue(assessment.next_due_date) && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                          <div>
                            <p className="font-medium text-sm text-red-800">F&P Assessment Renewal</p>
                            <p className="text-xs text-red-600">
                              Due: {format(assessment.next_due_date, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Schedule Renewal
                          </Button>
                        </div>
                      )}

                      {isOverdue(assessment.honesty_integrity.criminal_records_check.next_due!) && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                          <div>
                            <p className="font-medium text-sm text-red-800">Criminal Records Check</p>
                            <p className="text-xs text-red-600">
                              Due: {format(assessment.honesty_integrity.criminal_records_check.next_due!, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Request New Check
                          </Button>
                        </div>
                      )}

                      {isOverdue(assessment.honesty_integrity.credit_checks.next_due!) && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                          <div>
                            <p className="font-medium text-sm text-red-800">Credit Check</p>
                            <p className="text-xs text-red-600">
                              Due: {format(assessment.honesty_integrity.credit_checks.next_due!, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Request New Check
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assessment Details Dialog */}
      <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          {selectedAssessment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  {selectedAssessment.person.name} - F&P Assessment Details
                </DialogTitle>
                <DialogDescription>
                  Comprehensive fitness and propriety assessment information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md">
                    <div>
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="ml-2">{selectedAssessment.person.employee_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2">{selectedAssessment.person.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Proposed Role:</span>
                      <span className="ml-2">{selectedAssessment.person.proposed_role}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Assessment Status:</span>
                      <Badge className={cn("ml-2 text-xs border", getStatusColor(selectedAssessment.status))}>
                        {selectedAssessment.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Honesty & Integrity Checks */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Honesty & Integrity
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Criminal Records */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Criminal Records Check</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCheckResultIcon(selectedAssessment.honesty_integrity.criminal_records_check.result)}
                          <span className="capitalize text-sm">
                            {selectedAssessment.honesty_integrity.criminal_records_check.result.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Scope: {selectedAssessment.honesty_integrity.criminal_records_check.scope.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-600">
                          Provider: {selectedAssessment.honesty_integrity.criminal_records_check.provider}
                        </p>
                        <p className="text-xs text-gray-600">
                          Completed: {format(selectedAssessment.honesty_integrity.criminal_records_check.date_completed, 'MMM dd, yyyy')}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Credit Check */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Credit Check</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCheckResultIcon(selectedAssessment.honesty_integrity.credit_checks.result)}
                          <span className="capitalize text-sm">
                            {selectedAssessment.honesty_integrity.credit_checks.result.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Score: {selectedAssessment.honesty_integrity.credit_checks.score}
                        </p>
                        <p className="text-xs text-gray-600">
                          Completed: {format(selectedAssessment.honesty_integrity.credit_checks.date_completed, 'MMM dd, yyyy')}
                        </p>
                        {selectedAssessment.honesty_integrity.credit_checks.adverse_items.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Adverse Items:</p>
                            {selectedAssessment.honesty_integrity.credit_checks.adverse_items.map((item, index) => (
                              <p key={index} className="text-xs text-red-600">
                                {item.type}: £{item.amount} ({item.status})
                              </p>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Regulatory References */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Regulatory References</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedAssessment.honesty_integrity.regulatory_references.map((ref, index) => (
                          <div key={index} className="text-xs">
                            <p className="font-medium">{ref.referee_firm}</p>
                            <p className="text-gray-600">{ref.referee_contact}</p>
                            <p className="text-gray-600">
                              Received: {format(ref.response_received!, 'MMM dd, yyyy')}
                            </p>
                            {ref.reference_details?.additional_comments && (
                              <p className="text-gray-600 italic">&ldquo;{ref.reference_details.additional_comments}&rdquo;</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Competence & Capability */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Competence & Capability
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Qualifications */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Qualifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedAssessment.competence_capability.qualifications.map((qual, index) => (
                          <div key={index} className="text-xs border-l-2 border-blue-200 pl-2">
                            <p className="font-medium">{qual.title}</p>
                            <p className="text-gray-600">{qual.awarding_body}</p>
                            <p className="text-gray-600">
                              Achieved: {format(qual.date_achieved, 'MMM dd, yyyy')}
                            </p>
                            {qual.expiry_date && (
                              <p className="text-gray-600">
                                Expires: {format(qual.expiry_date, 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Experience */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Relevant Experience</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedAssessment.competence_capability.experience.map((exp, index) => (
                          <div key={index} className="text-xs border-l-2 border-green-200 pl-2">
                            <p className="font-medium">{exp.position}</p>
                            <p className="text-gray-600">{exp.employer}</p>
                            <p className="text-gray-600">
                              {format(exp.start_date, 'MMM yyyy')} - {
                                exp.end_date ? format(exp.end_date, 'MMM yyyy') : 'Present'
                              }
                            </p>
                            <p className="text-gray-600">
                              Relevance Score: {exp.relevance_score}% • {exp.sector.replace('_', ' ')}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Financial Soundness */}
                {selectedAssessment.financial_soundness.outside_business_interests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Financial Soundness
                    </h4>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Outside Business Interests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAssessment.financial_soundness.outside_business_interests.map((interest, index) => (
                          <div key={index} className="text-sm border rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{interest.company_name}</p>
                              <Badge variant={interest.approved ? "default" : "secondary"}>
                                {interest.approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-xs">
                              Role: {interest.role} • Holding: {interest.percentage_holding}%
                            </p>
                            <p className="text-gray-600 text-xs">
                              Business: {interest.nature_of_business}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Overall Determination */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ScrollText className="h-4 w-4" />
                    Assessment Summary
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Determination:</span>
                      <Badge className={cn("text-sm", getDeterminationColor(selectedAssessment.overall_determination))}>
                        {selectedAssessment.overall_determination}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Assessment Date:</span>
                        <span className="ml-2">{format(selectedAssessment.assessment_date, 'MMM dd, yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Due:</span>
                        <span className="ml-2">{format(selectedAssessment.next_due_date, 'MMM dd, yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reviewer:</span>
                        <span className="ml-2">{selectedAssessment.reviewer}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Approved By:</span>
                        <span className="ml-2">{selectedAssessment.approved_by}</span>
                      </div>
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