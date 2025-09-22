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
import { AlertTriangle, CheckCircle, Clock, Filter, Plus, Search, UserCheck, Users, FileText, Calendar as CalendarIcon, Crown, Shield, Award, Eye, Edit, Trash2, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { allSMFs, prescribedResponsibilities } from '../data/core-functions'
import { SeniorManagementFunction, Person, Role, Alert } from '../types'

// Mock data for SMF holders
const mockSMFHolders: (Person & { roles: (Role & { function?: SeniorManagementFunction })[], alerts: Alert[] })[] = [
  {
    id: 'p1',
    employee_id: 'EMP001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Executive',
    reporting_manager: 'Board of Directors',
    start_date: new Date('2020-01-15'),
    roles: [
      {
        id: 'r1',
        type: 'SMF',
        function_id: 'smf1',
        start_date: new Date('2020-01-15'),
        approval_status: 'approved',
        function: allSMFs.find(f => f.id === 'smf1')
      }
    ],
    alerts: [
      {
        id: 'a1',
        type: 'assessment_due',
        priority: 'medium',
        title: 'Annual F&P Assessment Due',
        description: 'Annual fitness and propriety assessment due within 30 days',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        action_required: 'Schedule assessment',
        created_date: new Date()
      }
    ]
  },
  {
    id: 'p2',
    employee_id: 'EMP002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'Compliance',
    reporting_manager: 'Sarah Johnson',
    start_date: new Date('2021-03-01'),
    roles: [
      {
        id: 'r2',
        type: 'SMF',
        function_id: 'smf16',
        start_date: new Date('2021-03-01'),
        approval_status: 'approved',
        function: allSMFs.find(f => f.id === 'smf16')
      }
    ],
    alerts: []
  },
  {
    id: 'p3',
    employee_id: 'EMP003',
    name: 'Emma Thompson',
    email: 'emma.thompson@company.com',
    department: 'Risk',
    reporting_manager: 'Sarah Johnson',
    start_date: new Date('2019-06-15'),
    roles: [
      {
        id: 'r3',
        type: 'SMF',
        function_id: 'smf17',
        start_date: new Date('2019-06-15'),
        approval_status: 'approved',
        function: allSMFs.find(f => f.id === 'smf17')
      }
    ],
    alerts: [
      {
        id: 'a2',
        type: 'overdue',
        priority: 'high',
        title: 'Training Overdue',
        description: 'AML refresher training is 15 days overdue',
        action_required: 'Complete training immediately',
        created_date: new Date()
      }
    ]
  },
  {
    id: 'p4',
    employee_id: 'EMP004',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    department: 'Executive',
    reporting_manager: 'Sarah Johnson',
    start_date: new Date('2022-09-01'),
    roles: [
      {
        id: 'r4',
        type: 'SMF',
        function_id: 'smf3',
        start_date: new Date('2022-09-01'),
        approval_status: 'pending',
        function: allSMFs.find(f => f.id === 'smf3')
      }
    ],
    alerts: [
      {
        id: 'a3',
        type: 'regulatory_change',
        priority: 'critical',
        title: 'FCA Approval Required',
        description: 'Form A submission required for SMF3 appointment',
        action_required: 'Submit Form A to FCA',
        created_date: new Date()
      }
    ]
  }
];

const SMFManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const [selectedSMF, setSelectedSMF] = useState<SeniorManagementFunction | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [smfHolders, setSMFHolders] = useState(mockSMFHolders)

  // Form state for SMF assignment
  const [assignmentForm, setAssignmentForm] = useState({
    personId: '',
    smfId: '',
    startDate: new Date(),
    responsibilities: ''
  })

  // Handle SMF assignment
  const handleAssignSMF = (e: React.FormEvent) => {
    e.preventDefault()

    if (!assignmentForm.personId || !assignmentForm.smfId) {
      alert('Please select both a person and SMF function')
      return
    }

    // Find the selected SMF function
    const smfFunction = allSMFs.find(f => f.id === assignmentForm.smfId)
    if (!smfFunction) return

    // Generate new role
    const newRole: Role & { function?: SeniorManagementFunction } = {
      id: `r${Date.now()}`,
      type: 'SMF',
      function_id: assignmentForm.smfId,
      start_date: assignmentForm.startDate,
      approval_status: 'pending',
      statement_of_responsibilities: {
        id: `sor${Date.now()}`,
        title: `Statement of Responsibilities - ${smfFunction.smf_number}`,
        type: 'statement_of_responsibilities',
        file_path: '',
        upload_date: new Date(),
        uploaded_by: 'System',
        version: 1,
        status: 'draft',
        confidentiality_level: 'internal'
      },
      function: smfFunction
    }

    // Add the new assignment
    const newHolder = {
      id: assignmentForm.personId,
      employee_id: `EMP${String(smfHolders.length + 1).padStart(3, '0')}`,
      name: assignmentForm.personId === 'new' ? 'New Person' : `Person ${smfHolders.length + 1}`,
      email: `person${smfHolders.length + 1}@company.com`,
      department: 'To be assigned',
      reporting_manager: 'To be assigned',
      start_date: assignmentForm.startDate,
      roles: [newRole],
      alerts: [{
        id: `a${Date.now()}`,
        type: 'regulatory_change' as const,
        priority: 'high' as const,
        title: 'SMF Assignment Pending',
        description: `${smfFunction.smf_number} assignment requires FCA approval`,
        action_required: 'Submit Form A to FCA',
        created_date: new Date()
      }]
    }

    setSMFHolders(prev => [...prev, newHolder])
    setShowAssignDialog(false)

    // Reset form
    setAssignmentForm({
      personId: '',
      smfId: '',
      startDate: new Date(),
      responsibilities: ''
    })

    alert('SMF assignment created successfully! Form A submission to FCA is now required.')
  }

  // Filter SMF holders
  const filteredHolders = useMemo(() => {
    return smfHolders.filter(holder => {
      const matchesSearch = holder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           holder.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === 'all' ||
                             holder.roles.some(role =>
                               role.function?.category === selectedCategory
                             )

      const matchesStatus = selectedStatus === 'all' ||
                           holder.roles.some(role => role.approval_status === selectedStatus)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, selectedCategory, selectedStatus])

  // Calculate summary statistics
  const statistics = useMemo(() => {
    const totalSMFs = smfHolders.reduce((acc, holder) => acc + holder.roles.length, 0)
    const activeSMFs = smfHolders.filter(holder =>
      holder.roles.some(role => role.approval_status === 'approved')
    ).length
    const pendingApprovals = smfHolders.filter(holder =>
      holder.roles.some(role => role.approval_status === 'pending')
    ).length
    const totalAlerts = smfHolders.reduce((acc, holder) => acc + holder.alerts.length, 0)

    return { totalSMFs, activeSMFs, pendingApprovals, totalAlerts }
  }, [smfHolders])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'universal': return <Users className="h-4 w-4" />
      case 'payment_specific': return <Shield className="h-4 w-4" />
      case 'investment_specific': return <Award className="h-4 w-4" />
      case 'insurance_specific': return <Crown className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Senior Management Functions</h1>
          <p className="text-gray-600 mt-1">Manage SMF appointments, responsibilities, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Assign SMF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Senior Management Function</DialogTitle>
                <DialogDescription>
                  Assign a Senior Management Function to an individual
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAssignSMF} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="person">Person</Label>
                    <Select
                      value={assignmentForm.personId}
                      onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, personId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah_johnson">Sarah Johnson (EMP001)</SelectItem>
                        <SelectItem value="michael_chen">Michael Chen (EMP002)</SelectItem>
                        <SelectItem value="emma_thompson">Emma Thompson (EMP003)</SelectItem>
                        <SelectItem value="james_wilson">James Wilson (EMP004)</SelectItem>
                        <SelectItem value="new">+ Add New Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="smf">SMF Function</Label>
                    <Select
                      value={assignmentForm.smfId}
                      onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, smfId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select SMF" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSMFs.map(smf => (
                          <SelectItem key={smf.id} value={smf.id}>
                            {smf.smf_number} - {smf.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {assignmentForm.startDate ? format(assignmentForm.startDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={assignmentForm.startDate}
                        onSelect={(date) => date && setAssignmentForm(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="responsibilities">Key Responsibilities</Label>
                  <Textarea
                    value={assignmentForm.responsibilities}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, responsibilities: e.target.value }))}
                    placeholder="Enter key responsibilities and prescribed responsibilities..."
                    className="h-24"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Assign SMF</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total SMFs</p>
                <p className="text-2xl font-bold">{statistics.totalSMFs}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active SMFs</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeSMFs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{statistics.totalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="universal">Universal SMFs</SelectItem>
                  <SelectItem value="payment_specific">Payment Specific</SelectItem>
                  <SelectItem value="investment_specific">Investment Specific</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="holders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holders">SMF Holders</TabsTrigger>
          <TabsTrigger value="functions">Available Functions</TabsTrigger>
          <TabsTrigger value="responsibilities">Prescribed Responsibilities</TabsTrigger>
        </TabsList>

        <TabsContent value="holders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHolders.map((holder) => (
              <Card key={holder.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{holder.name}</CardTitle>
                      <CardDescription>{holder.employee_id}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {holder.alerts.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />
                          {holder.alerts.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current SMF Roles:</p>
                    <div className="space-y-2">
                      {holder.roles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(role.function?.category || '')}
                            <div>
                              <p className="font-medium text-sm">{role.function?.smf_number}</p>
                              <p className="text-xs text-gray-600">{role.function?.title}</p>
                            </div>
                          </div>
                          <Badge className={cn("text-xs", getStatusColor(role.approval_status))}>
                            {role.approval_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {holder.alerts.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Active Alerts:</p>
                      <div className="space-y-1">
                        {holder.alerts.slice(0, 2).map((alert) => (
                          <div
                            key={alert.id}
                            className={cn(
                              "p-2 rounded-md border text-xs",
                              getPriorityColor(alert.priority)
                            )}
                          >
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-xs opacity-75">{alert.action_required}</p>
                          </div>
                        ))}
                        {holder.alerts.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{holder.alerts.length - 2} more alerts
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
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
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SMF holders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No SMF holders have been assigned yet.'}
              </p>
              <Button onClick={() => setShowAssignDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign First SMF
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {allSMFs.map((smf) => (
              <Card key={smf.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(smf.category)}
                        {smf.smf_number} - {smf.title}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {smf.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSMF(smf)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{smf.description}</p>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Required For:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {smf.required_for.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Prescribed Responsibilities: {smf.prescribed_responsibilities.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responsibilities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {prescribedResponsibilities.map((pr) => (
              <Card key={pr.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pr.pr_number}</CardTitle>
                  <CardDescription className="text-sm">{pr.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Typical Holder:</p>
                    <Badge variant="outline">{pr.typical_holder}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Evidence Required:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pr.evidence_required.map((evidence, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pr.monitoring && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Monitoring:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pr.monitoring.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* SMF Details Dialog */}
      <Dialog open={!!selectedSMF} onOpenChange={() => setSelectedSMF(null)}>
        <DialogContent className="max-w-3xl">
          {selectedSMF && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedSMF.category)}
                  {selectedSMF.smf_number} - {selectedSMF.title}
                </DialogTitle>
                <DialogDescription>
                  Detailed information about this Senior Management Function
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedSMF.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Category & Requirements</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Category:</p>
                      <Badge variant="outline">{selectedSMF.category.replace('_', ' ')}</Badge>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Universal Function:</p>
                      <Badge variant={selectedSMF.is_universal ? "default" : "secondary"}>
                        {selectedSMF.is_universal ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required For</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSMF.required_for.map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Prescribed Responsibilities</h4>
                  <div className="space-y-2">
                    {selectedSMF.prescribed_responsibilities.map((prId) => {
                      const pr = prescribedResponsibilities.find(p => parseInt(p.pr_number.replace('PR', '')) === prId);
                      return pr ? (
                        <div key={prId} className="p-3 bg-gray-50 rounded-md">
                          <p className="font-medium text-sm">{pr.pr_number}</p>
                          <p className="text-sm text-gray-600">{pr.description}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {selectedSMF.unique_requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Unique Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedSMF.unique_requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SMFManagementPage