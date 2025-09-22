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
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertTriangle, CheckCircle, Clock, Plus, Search, Users, FileText,
  Calendar as CalendarIcon, Shield, Award, Eye, Edit, Trash2, User,
  Building2, Mail, Phone, MapPin, UserPlus, Save, X
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { allSMFs, certificationFunctions } from '../data/core-functions'
import { Person, Role } from '../types'

// Enhanced person interface with more details
interface PersonRecord extends Person {
  title?: string
  phone?: string
  address?: string
  line_manager?: string
  hire_date: Date
  roles: (Role & {
    function_name?: string
    function_type?: 'SMF' | 'CF'
  })[]
  assessment_status: {
    fitness_propriety: 'current' | 'due' | 'overdue' | 'not_required'
    training_completion: number
    last_assessment?: Date
    next_assessment?: Date
  }
  documents: {
    cv: boolean
    references: boolean
    qualifications: boolean
    id_verification: boolean
  }
}

// Mock database with local state management
const initialPeople: PersonRecord[] = [
  {
    id: 'p1',
    employee_id: 'EMP001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    title: 'Chief Executive Officer',
    department: 'Executive',
    phone: '+44 20 7123 4567',
    address: '123 Financial District, London EC2M 7PP',
    reporting_manager: 'Board of Directors',
    line_manager: 'Board Chair',
    start_date: new Date('2020-01-15'),
    hire_date: new Date('2020-01-15'),
    roles: [
      {
        id: 'r1',
        type: 'SMF',
        function_id: 'smf1',
        function_name: 'SMF1 - Chief Executive',
        function_type: 'SMF',
        start_date: new Date('2020-01-15'),
        approval_status: 'approved'
      }
    ],
    assessment_status: {
      fitness_propriety: 'current',
      training_completion: 95,
      last_assessment: new Date('2024-01-15'),
      next_assessment: new Date('2025-01-15')
    },
    documents: {
      cv: true,
      references: true,
      qualifications: true,
      id_verification: true
    }
  },
  {
    id: 'p2',
    employee_id: 'EMP002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    title: 'Compliance Director',
    department: 'Compliance',
    phone: '+44 20 7123 4568',
    address: '124 Financial District, London EC2M 7PP',
    reporting_manager: 'Sarah Johnson',
    line_manager: 'Sarah Johnson',
    start_date: new Date('2021-03-01'),
    hire_date: new Date('2021-03-01'),
    roles: [
      {
        id: 'r2',
        type: 'SMF',
        function_id: 'smf16',
        function_name: 'SMF16 - Compliance Oversight',
        function_type: 'SMF',
        start_date: new Date('2021-03-01'),
        approval_status: 'approved'
      }
    ],
    assessment_status: {
      fitness_propriety: 'current',
      training_completion: 88,
      last_assessment: new Date('2024-03-01'),
      next_assessment: new Date('2025-03-01')
    },
    documents: {
      cv: true,
      references: true,
      qualifications: true,
      id_verification: true
    }
  }
]

const departments = ['Executive', 'Compliance', 'Risk Management', 'Operations', 'Finance', 'Legal', 'HR', 'Technology', 'Customer Service']

const PeopleManagementPage = () => {
  const [people, setPeople] = useState<PersonRecord[]>(initialPeople)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false)
  const [showEditPersonDialog, setShowEditPersonDialog] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null)

  // Form state for new/edit person
  const [formData, setFormData] = useState<Partial<PersonRecord>>({
    name: '',
    email: '',
    title: '',
    department: '',
    phone: '',
    address: '',
    line_manager: '',
    roles: [],
    documents: {
      cv: false,
      references: false,
      qualifications: false,
      id_verification: false
    }
  })

  // Filter people
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           person.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           person.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = selectedDepartment === 'all' || person.department === selectedDepartment
      const matchesStatus = selectedStatus === 'all' || person.assessment_status.fitness_propriety === selectedStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [people, searchTerm, selectedDepartment, selectedStatus])

  // Generate next employee ID
  const generateEmployeeId = () => {
    const maxId = Math.max(...people.map(p => parseInt(p.employee_id.replace('EMP', ''))), 0)
    return `EMP${String(maxId + 1).padStart(3, '0')}`
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedPerson) {
      // Edit existing person
      setPeople(prev => prev.map(p =>
        p.id === selectedPerson.id
          ? {
              ...p,
              ...formData,
              assessment_status: p.assessment_status // Preserve assessment status
            } as PersonRecord
          : p
      ))
      setShowEditPersonDialog(false)
    } else {
      // Add new person
      const newPerson: PersonRecord = {
        id: `p${Date.now()}`,
        employee_id: generateEmployeeId(),
        name: formData.name || '',
        email: formData.email || '',
        title: formData.title || '',
        department: formData.department || '',
        phone: formData.phone || '',
        address: formData.address || '',
        reporting_manager: formData.line_manager || '',
        line_manager: formData.line_manager || '',
        start_date: new Date(),
        hire_date: new Date(),
        end_date: undefined,
        roles: [],
        assessment_status: {
          fitness_propriety: 'not_required',
          training_completion: 0
        },
        documents: formData.documents || {
          cv: false,
          references: false,
          qualifications: false,
          id_verification: false
        }
      }

      setPeople(prev => [...prev, newPerson])
      setShowAddPersonDialog(false)
    }

    // Reset form
    setFormData({
      name: '',
      email: '',
      title: '',
      department: '',
      phone: '',
      address: '',
      line_manager: '',
      roles: [],
      documents: {
        cv: false,
        references: false,
        qualifications: false,
        id_verification: false
      }
    })
    setSelectedPerson(null)
  }

  const handleEdit = (person: PersonRecord) => {
    setSelectedPerson(person)
    setFormData({
      name: person.name,
      email: person.email,
      title: person.title,
      department: person.department,
      phone: person.phone,
      address: person.address,
      line_manager: person.line_manager,
      documents: person.documents
    })
    setShowEditPersonDialog(true)
  }

  const handleDelete = (personId: string) => {
    if (window.confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      setPeople(prev => prev.filter(p => p.id !== personId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800'
      case 'due': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'not_required': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const PersonForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter job title"
          />
        </div>
        <div>
          <Label htmlFor="department">Department *</Label>
          <Select
            value={formData.department || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+44 20 7123 4567"
          />
        </div>
        <div>
          <Label htmlFor="line_manager">Line Manager</Label>
          <Select
            value={formData.line_manager || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, line_manager: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select line manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Board of Directors">Board of Directors</SelectItem>
              <SelectItem value="Board Chair">Board Chair</SelectItem>
              {people.map(person => (
                <SelectItem key={person.id} value={person.name}>
                  {person.name} ({person.title})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter full address"
          rows={2}
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Document Checklist</Label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[
            { key: 'cv', label: 'CV/Resume' },
            { key: 'references', label: 'References' },
            { key: 'qualifications', label: 'Qualifications' },
            { key: 'id_verification', label: 'ID Verification' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={formData.documents?.[key as keyof typeof formData.documents] || false}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    documents: {
                      ...prev.documents,
                      [key]: checked
                    }
                  }))
                }
              />
              <Label htmlFor={key} className="text-sm">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowAddPersonDialog(false)
            setShowEditPersonDialog(false)
            setSelectedPerson(null)
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? 'Update Person' : 'Add Person'}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">People Management</h1>
          <p className="text-gray-600 mt-1">Manage personnel records and SM&CR role assignments</p>
        </div>
        <Button onClick={() => setShowAddPersonDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total People</p>
                <p className="text-2xl font-bold">{people.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SM&CR Roles</p>
                <p className="text-2xl font-bold">
                  {people.reduce((acc, person) => acc + person.roles.length, 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current F&P</p>
                <p className="text-2xl font-bold text-green-600">
                  {people.filter(p => p.assessment_status.fitness_propriety === 'current').length}
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
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {people.filter(p => p.assessment_status.fitness_propriety === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
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
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="not_required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPeople.map((person) => (
          <Card key={person.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <CardDescription>{person.employee_id}</CardDescription>
                  </div>
                </div>
                <Badge className={cn("text-xs", getStatusColor(person.assessment_status.fitness_propriety))}>
                  F&P {person.assessment_status.fitness_propriety}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{person.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span>{person.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{person.email}</span>
                </div>
                {person.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{person.phone}</span>
                  </div>
                )}
              </div>

              {person.roles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">SM&CR Roles:</p>
                  <div className="flex flex-wrap gap-1">
                    {person.roles.map((role) => (
                      <Badge key={role.id} variant="outline" className="text-xs">
                        {role.function_name || `${role.type} Role`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {person.assessment_status.training_completion > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Training Progress</span>
                    <span>{person.assessment_status.training_completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${person.assessment_status.training_completion}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEdit(person)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDelete(person.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPeople.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No people found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first person.'}
          </p>
          <Button onClick={() => setShowAddPersonDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Person
          </Button>
        </div>
      )}

      {/* Add Person Dialog */}
      <Dialog open={showAddPersonDialog} onOpenChange={setShowAddPersonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
            <DialogDescription>
              Add a new person to the SM&CR management system
            </DialogDescription>
          </DialogHeader>
          <PersonForm />
        </DialogContent>
      </Dialog>

      {/* Edit Person Dialog */}
      <Dialog open={showEditPersonDialog} onOpenChange={setShowEditPersonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Person</DialogTitle>
            <DialogDescription>
              Update person information and details
            </DialogDescription>
          </DialogHeader>
          <PersonForm isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PeopleManagementPage