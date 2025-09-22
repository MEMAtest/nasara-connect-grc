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
import {
  AlertTriangle, CheckCircle, Clock, Plus, Search, Target,
  Calendar as CalendarIcon, Eye, Edit, User, FileText,
  AlertCircle, XCircle, Save, X
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { allConductRules, individualConductRules, seniorManagerConductRules } from '../data/core-functions'
import { ConductBreach } from '../types'

// Mock conduct breaches
const initialBreaches: ConductBreach[] = [
  {
    id: 'cb1',
    person_id: 'EMP003',
    rule_id: 'rule2',
    date_identified: new Date('2024-10-15'),
    description: 'Failed to follow established risk management procedures during client onboarding',
    severity: 'serious',
    status: 'investigating',
    investigation: {
      investigator: 'Michael Chen',
      findings: 'Employee bypassed standard KYC procedures for high-value client',
      evidence: [],
      recommendations: ['Additional training on KYC procedures', 'Enhanced supervision for 6 months']
    },
    actions_taken: {
      disciplinary_action: 'Formal written warning',
      training_required: true,
      fca_notification: false
    }
  },
  {
    id: 'cb2',
    person_id: 'EMP005',
    rule_id: 'rule1',
    date_identified: new Date('2024-11-01'),
    description: 'Misrepresented product features to customer during sales process',
    severity: 'serious',
    status: 'open',
    investigation: {
      investigator: 'Sarah Johnson',
      findings: 'Investigation ongoing',
      evidence: [],
      recommendations: []
    },
    actions_taken: {}
  },
  {
    id: 'cb3',
    person_id: 'EMP002',
    rule_id: 'sc1',
    date_identified: new Date('2024-09-20'),
    description: 'Inadequate oversight of team compliance activities',
    severity: 'minor',
    status: 'resolved',
    investigation: {
      investigator: 'Emma Thompson',
      findings: 'Manager acknowledged gaps in oversight procedures',
      evidence: [],
      recommendations: ['Implement weekly compliance check-ins', 'Update management reporting']
    },
    actions_taken: {
      disciplinary_action: 'Informal coaching',
      training_required: true,
      fca_notification: false
    },
    resolution_date: new Date('2024-10-05'),
    lessons_learned: 'Importance of regular oversight and documentation in management roles'
  }
]

const ConductRulesPage = () => {
  const [breaches, setBreaches] = useState<ConductBreach[]>(initialBreaches)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedBreach, setSelectedBreach] = useState<ConductBreach | null>(null)

  // Form state for new breach report
  const [breachForm, setBreachForm] = useState({
    personId: '',
    ruleId: '',
    description: '',
    severity: 'minor' as 'minor' | 'serious' | 'severe',
    dateIdentified: new Date()
  })

  // Filter breaches
  const filteredBreaches = useMemo(() => {
    return breaches.filter(breach => {
      const matchesSearch = breach.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           breach.person_id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSeverity = selectedSeverity === 'all' || breach.severity === selectedSeverity
      const matchesStatus = selectedStatus === 'all' || breach.status === selectedStatus

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [breaches, searchTerm, selectedSeverity, selectedStatus])

  // Handle breach reporting
  const handleReportBreach = (e: React.FormEvent) => {
    e.preventDefault()

    if (!breachForm.personId || !breachForm.ruleId || !breachForm.description) {
      alert('Please fill in all required fields')
      return
    }

    const newBreach: ConductBreach = {
      id: `cb${Date.now()}`,
      person_id: breachForm.personId,
      rule_id: breachForm.ruleId,
      date_identified: breachForm.dateIdentified,
      description: breachForm.description,
      severity: breachForm.severity,
      status: 'open',
      investigation: {
        investigator: 'TBD',
        findings: 'Investigation pending',
        evidence: [],
        recommendations: []
      },
      actions_taken: {}
    }

    setBreaches(prev => [...prev, newBreach])
    setShowReportDialog(false)

    // Reset form
    setBreachForm({
      personId: '',
      ruleId: '',
      description: '',
      severity: 'minor',
      dateIdentified: new Date()
    })

    alert('Conduct breach reported successfully!')
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = breaches.length
    const open = breaches.filter(b => b.status === 'open').length
    const investigating = breaches.filter(b => b.status === 'investigating').length
    const resolved = breaches.filter(b => b.status === 'resolved').length
    const thisQuarter = breaches.filter(b =>
      b.date_identified >= new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)
    ).length

    return { total, open, investigating, resolved, thisQuarter }
  }, [breaches])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-blue-100 text-blue-800'
      case 'serious': return 'bg-orange-100 text-orange-800'
      case 'severe': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'escalated': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />
      case 'investigating': return <Search className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'escalated': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Conduct Rules & Breaches</h1>
          <p className="text-gray-600 mt-1">Monitor conduct compliance and manage breaches</p>
        </div>
        <Button onClick={() => setShowReportDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Report Breach
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Breaches</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">{statistics.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.investigating}</p>
              </div>
              <Search className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{statistics.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Quarter</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.thisQuarter}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search breaches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="breaches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breaches">Active Breaches</TabsTrigger>
          <TabsTrigger value="rules">Conduct Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="breaches" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBreaches.map((breach) => {
              const rule = allConductRules.find(r => r.id === breach.rule_id)

              return (
                <Card key={breach.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(breach.status)}
                          Breach #{breach.id.replace('cb', '')}
                        </CardTitle>
                        <CardDescription>
                          {breach.person_id} • {rule?.rule_number} - {rule?.text?.substring(0, 50)}...
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={cn("text-xs", getSeverityColor(breach.severity))}>
                          {breach.severity}
                        </Badge>
                        <Badge className={cn("text-xs", getStatusColor(breach.status))}>
                          {breach.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                      <p className="text-sm text-gray-600">{breach.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date Identified:</span>
                        <p className="font-medium">{format(breach.date_identified, 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Investigator:</span>
                        <p className="font-medium">{breach.investigation.investigator}</p>
                      </div>
                    </div>

                    {breach.investigation.findings && breach.investigation.findings !== 'Investigation pending' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Findings:</p>
                        <p className="text-sm text-gray-600">{breach.investigation.findings}</p>
                      </div>
                    )}

                    {breach.actions_taken.disciplinary_action && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Actions Taken:</p>
                        <p className="text-sm text-gray-600">{breach.actions_taken.disciplinary_action}</p>
                        {breach.actions_taken.training_required && (
                          <Badge variant="outline" className="text-xs mt-1">Training Required</Badge>
                        )}
                      </div>
                    )}

                    {breach.resolution_date && (
                      <div className="p-2 bg-green-50 rounded-md border border-green-200">
                        <p className="text-sm font-medium text-green-800">
                          Resolved: {format(breach.resolution_date, 'MMM dd, yyyy')}
                        </p>
                        {breach.lessons_learned && (
                          <p className="text-xs text-green-700 mt-1">{breach.lessons_learned}</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedBreach(breach)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredBreaches.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No breaches found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSeverity !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'No conduct rule breaches have been reported.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Individual Conduct Rules</CardTitle>
                <CardDescription>Apply to all staff in SM&CR roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {individualConductRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{rule.rule_number}</h4>
                        <Badge variant="outline" className="text-xs">Individual</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{rule.text}</p>

                      {rule.breach_examples && rule.breach_examples.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Common Breach Examples:</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {rule.breach_examples.slice(0, 3).map((example, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Senior Manager Conduct Rules</CardTitle>
                <CardDescription>Additional rules for Senior Managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seniorManagerConductRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{rule.rule_number}</h4>
                        <Badge variant="outline" className="text-xs">Senior Manager</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{rule.text}</p>

                      {rule.evidence_requirements && rule.evidence_requirements.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Evidence Required:</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {rule.evidence_requirements.slice(0, 3).map((evidence, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Breach Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Conduct Breach</DialogTitle>
            <DialogDescription>
              Report a potential breach of conduct rules
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportBreach} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="person">Person</Label>
                <Select
                  value={breachForm.personId}
                  onValueChange={(value) => setBreachForm(prev => ({ ...prev, personId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP001">Sarah Johnson (EMP001)</SelectItem>
                    <SelectItem value="EMP002">Michael Chen (EMP002)</SelectItem>
                    <SelectItem value="EMP003">Emma Thompson (EMP003)</SelectItem>
                    <SelectItem value="EMP004">James Wilson (EMP004)</SelectItem>
                    <SelectItem value="EMP005">Anonymous Employee (EMP005)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rule">Conduct Rule</Label>
                <Select
                  value={breachForm.ruleId}
                  onValueChange={(value) => setBreachForm(prev => ({ ...prev, ruleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {allConductRules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.rule_number} - {rule.text.substring(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={breachForm.severity}
                onValueChange={(value: 'minor' | 'serious' | 'severe') => setBreachForm(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={breachForm.description}
                onChange={(e) => setBreachForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the conduct breach in detail..."
                className="h-24"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowReportDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Report Breach
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConductRulesPage