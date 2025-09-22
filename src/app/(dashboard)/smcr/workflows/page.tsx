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
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle, CheckCircle, Clock, Plus, Search, Settings,
  Calendar as CalendarIcon, Play, Pause, RotateCcw, User, FileText,
  ArrowRight, Save, X, Users
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Workflow, WorkflowStep } from '../types'

// Workflow templates
const workflowTemplates = [
  {
    id: 'smf-onboarding',
    name: 'SMF Onboarding',
    description: 'Complete onboarding process for Senior Management Function appointments',
    estimatedDays: 90,
    steps: [
      'Initial appointment proposal',
      'Fitness & Propriety assessment',
      'Criminal records check',
      'Regulatory references',
      'Statement of Responsibilities',
      'Form A submission to FCA',
      'FCA approval received',
      'Role commencement'
    ]
  },
  {
    id: 'cf-certification',
    name: 'CF Certification',
    description: 'Annual certification process for Certification Functions',
    estimatedDays: 30,
    steps: [
      'Competence assessment',
      'Training completion review',
      'Performance evaluation',
      'Manager certification',
      'HR approval',
      'Certificate issuance'
    ]
  },
  {
    id: 'fp-annual-review',
    name: 'F&P Annual Review',
    description: 'Annual fitness and propriety review process',
    estimatedDays: 45,
    steps: [
      'Review trigger',
      'Document collection',
      'Background checks update',
      'Assessment review',
      'Senior manager approval',
      'Record update'
    ]
  }
]

// Mock active workflows
const initialWorkflows: Workflow[] = [
  {
    id: 'w1',
    type: 'onboarding',
    trigger_event: 'New SMF1 appointment',
    person_id: 'p1',
    started_date: new Date('2024-11-01'),
    target_completion: new Date('2024-12-15'),
    status: 'active',
    current_step: 3,
    steps: [
      {
        id: 'step1',
        step_number: 1,
        title: 'Initial appointment proposal',
        description: 'Document the appointment proposal and business case',
        assigned_to: 'HR Team',
        due_date: new Date('2024-11-05'),
        status: 'complete',
        completion_date: new Date('2024-11-03'),
        notes: 'Completed with board approval'
      },
      {
        id: 'step2',
        step_number: 2,
        title: 'Fitness & Propriety assessment',
        description: 'Complete comprehensive F&P assessment',
        assigned_to: 'Compliance Team',
        due_date: new Date('2024-11-15'),
        status: 'complete',
        completion_date: new Date('2024-11-12'),
        notes: 'All checks completed successfully'
      },
      {
        id: 'step3',
        step_number: 3,
        title: 'Criminal records check',
        description: 'Obtain enhanced criminal records check',
        assigned_to: 'HR Team',
        due_date: new Date('2024-11-20'),
        status: 'in_progress',
        notes: 'DBS application submitted, awaiting results'
      },
      {
        id: 'step4',
        step_number: 4,
        title: 'Regulatory references',
        description: 'Collect and review regulatory references',
        assigned_to: 'Compliance Team',
        due_date: new Date('2024-11-25'),
        status: 'pending'
      },
      {
        id: 'step5',
        step_number: 5,
        title: 'Statement of Responsibilities',
        description: 'Draft and finalize Statement of Responsibilities',
        assigned_to: 'Legal Team',
        due_date: new Date('2024-11-30'),
        status: 'pending'
      },
      {
        id: 'step6',
        step_number: 6,
        title: 'Form A submission to FCA',
        description: 'Submit Form A application to FCA',
        assigned_to: 'Compliance Team',
        due_date: new Date('2024-12-05'),
        status: 'pending'
      }
    ]
  },
  {
    id: 'w2',
    type: 'annual_review',
    trigger_event: 'Annual F&P review due',
    person_id: 'p2',
    started_date: new Date('2024-11-10'),
    target_completion: new Date('2024-12-25'),
    status: 'active',
    current_step: 2,
    steps: [
      {
        id: 'step1',
        step_number: 1,
        title: 'Review trigger',
        description: 'Annual review initiated automatically',
        assigned_to: 'System',
        due_date: new Date('2024-11-10'),
        status: 'complete',
        completion_date: new Date('2024-11-10')
      },
      {
        id: 'step2',
        step_number: 2,
        title: 'Document collection',
        description: 'Collect updated documents and certificates',
        assigned_to: 'HR Team',
        due_date: new Date('2024-11-20'),
        status: 'in_progress',
        notes: 'Awaiting updated qualifications from employee'
      },
      {
        id: 'step3',
        step_number: 3,
        title: 'Background checks update',
        description: 'Update criminal records and credit checks if required',
        assigned_to: 'HR Team',
        due_date: new Date('2024-11-30'),
        status: 'pending'
      }
    ]
  }
]

const WorkflowManagementPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  // Form state for new workflow
  const [workflowForm, setWorkflowForm] = useState({
    templateId: '',
    personId: '',
    triggerEvent: '',
    targetCompletion: new Date()
  })

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.trigger_event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.person_id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || workflow.status === selectedStatus
      const matchesType = selectedType === 'all' || workflow.type === selectedType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [workflows, searchTerm, selectedStatus, selectedType])

  // Handle workflow creation
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault()

    if (!workflowForm.templateId || !workflowForm.personId) {
      alert('Please select both template and person')
      return
    }

    const template = workflowTemplates.find(t => t.id === workflowForm.templateId)
    if (!template) return

    const newWorkflow: Workflow = {
      id: `w${Date.now()}`,
      type: workflowForm.templateId.includes('onboarding') ? 'onboarding' :
            workflowForm.templateId.includes('certification') ? 'role_change' : 'annual_review',
      trigger_event: workflowForm.triggerEvent || template.description,
      person_id: workflowForm.personId,
      started_date: new Date(),
      target_completion: workflowForm.targetCompletion,
      status: 'active',
      current_step: 1,
      steps: template.steps.map((stepTitle, index) => ({
        id: `step${index + 1}`,
        step_number: index + 1,
        title: stepTitle,
        description: `Complete ${stepTitle.toLowerCase()}`,
        due_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000), // Weekly intervals
        status: index === 0 ? 'in_progress' : 'pending',
        assigned_to: index % 2 === 0 ? 'Compliance Team' : 'HR Team'
      }))
    }

    setWorkflows(prev => [...prev, newWorkflow])
    setShowCreateDialog(false)

    // Reset form
    setWorkflowForm({
      templateId: '',
      personId: '',
      triggerEvent: '',
      targetCompletion: new Date()
    })

    alert('Workflow created successfully!')
  }

  // Handle step completion
  const handleStepCompletion = (workflowId: string, stepId: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const updatedSteps = workflow.steps.map(step => {
          if (step.id === stepId && step.status !== 'complete') {
            return {
              ...step,
              status: 'complete' as const,
              completion_date: new Date()
            }
          }
          return step
        })

        // Move to next step
        const currentStepIndex = updatedSteps.findIndex(s => s.id === stepId)
        if (currentStepIndex < updatedSteps.length - 1) {
          updatedSteps[currentStepIndex + 1].status = 'in_progress'
        }

        // Check if workflow is complete
        const allComplete = updatedSteps.every(step => step.status === 'complete')

        return {
          ...workflow,
          steps: updatedSteps,
          current_step: allComplete ? workflow.steps.length : Math.min(workflow.current_step + 1, workflow.steps.length),
          status: allComplete ? 'complete' as const : workflow.status
        }
      }
      return workflow
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'complete': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateProgress = (workflow: Workflow) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'complete').length
    return Math.round((completedSteps / workflow.steps.length) * 100)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600 mt-1">Automate and track SM&CR processes and assessments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold">
                  {workflows.filter(w => w.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {workflows.filter(w => w.status === 'complete').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Steps</p>
                <p className="text-2xl font-bold text-red-600">
                  {workflows.reduce((acc, w) =>
                    acc + w.steps.filter(s =>
                      s.status !== 'complete' &&
                      s.due_date &&
                      new Date() > s.due_date
                    ).length, 0
                  )}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(workflows.reduce((acc, w) => acc + calculateProgress(w), 0) / (workflows.length || 1))}%
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="annual_review">Annual Review</SelectItem>
                  <SelectItem value="role_change">Role Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.trigger_event}</CardTitle>
                  <CardDescription>Person ID: {workflow.person_id}</CardDescription>
                </div>
                <Badge className={cn("text-xs", getStatusColor(workflow.status))}>
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{calculateProgress(workflow)}%</span>
                </div>
                <Progress value={calculateProgress(workflow)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Step {workflow.current_step} of {workflow.steps.length}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>Started: {format(workflow.started_date, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Target: {format(workflow.target_completion, 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Current Step */}
              {workflow.status === 'active' && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="font-medium text-sm text-blue-900">Current Step</p>
                  <p className="text-sm text-blue-700">
                    {workflow.steps[workflow.current_step - 1]?.title}
                  </p>
                  {workflow.steps[workflow.current_step - 1]?.assigned_to && (
                    <p className="text-xs text-blue-600 mt-1">
                      Assigned to: {workflow.steps[workflow.current_step - 1].assigned_to}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  View Details
                </Button>
                {workflow.status === 'active' && workflow.steps[workflow.current_step - 1]?.status === 'in_progress' && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStepCompletion(workflow.id, workflow.steps[workflow.current_step - 1].id)}
                  >
                    Complete Step
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Start a new automated workflow process
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkflow} className="space-y-4">
            <div>
              <Label htmlFor="template">Workflow Template</Label>
              <Select
                value={workflowForm.templateId}
                onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, templateId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow template" />
                </SelectTrigger>
                <SelectContent>
                  {workflowTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="person">Person</Label>
              <Select
                value={workflowForm.personId}
                onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, personId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Sarah Johnson (EMP001)</SelectItem>
                  <SelectItem value="p2">Michael Chen (EMP002)</SelectItem>
                  <SelectItem value="p3">Emma Thompson (EMP003)</SelectItem>
                  <SelectItem value="p4">James Wilson (EMP004)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trigger">Trigger Event (Optional)</Label>
              <Input
                value={workflowForm.triggerEvent}
                onChange={(e) => setWorkflowForm(prev => ({ ...prev, triggerEvent: e.target.value }))}
                placeholder="Enter trigger event description"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Workflow Details Dialog */}
      <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedWorkflow && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWorkflow.trigger_event}</DialogTitle>
                <DialogDescription>
                  Workflow for {selectedWorkflow.person_id} • {selectedWorkflow.type}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className={cn("ml-2 text-xs", getStatusColor(selectedWorkflow.status))}>
                      {selectedWorkflow.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <span className="ml-2">{format(selectedWorkflow.started_date, 'MMM dd, yyyy')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Target:</span>
                    <span className="ml-2">{format(selectedWorkflow.target_completion, 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Workflow Steps</h4>
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <div className="flex-shrink-0 mt-1">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            step.status === 'complete' ? 'bg-green-500 text-white' :
                            step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                            'bg-gray-300 text-gray-600'
                          )}>
                            {step.status === 'complete' ? '✓' : index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-sm">{step.title}</h5>
                            <Badge className={cn("text-xs border", getStepStatusColor(step.status))}>
                              {step.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {step.assigned_to && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {step.assigned_to}
                              </span>
                            )}
                            {step.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {format(step.due_date, 'MMM dd')}
                              </span>
                            )}
                            {step.completion_date && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completed: {format(step.completion_date, 'MMM dd')}
                              </span>
                            )}
                          </div>
                          {step.notes && (
                            <p className="text-xs text-blue-600 mt-2 italic">{step.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-600 mb-4">
            Create your first automated workflow to streamline SM&CR processes.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Workflow
          </Button>
        </div>
      )}
    </div>
  )
}

export default WorkflowManagementPage