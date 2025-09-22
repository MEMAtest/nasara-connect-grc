"use client";

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
import { AlertTriangle, CheckCircle, Clock, Plus, Search, UserCheck, Users, FileText, Calendar as CalendarIcon, Crown, Shield, Award, Eye, Edit, Bell } from 'lucide-react'
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
  }
];

export function SMFsClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
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
    alert('SMF assignment created successfully!')
    setShowAssignDialog(false)
  }

  // Filter SMF holders
  const filteredHolders = useMemo(() => {
    return smfHolders.filter(holder => {
      const matchesSearch = holder.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [searchTerm])

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
                    placeholder="Enter key responsibilities..."
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="holders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holders">SMF Holders</TabsTrigger>
          <TabsTrigger value="functions">Available Functions</TabsTrigger>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}