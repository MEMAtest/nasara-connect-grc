"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  FileCheck2,
  Calendar,
  Building2,
  Target,
  MoreHorizontal,
  Play,
  Eye,
  Trash2,
  Copy
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Assessment {
  id: string;
  name: string;
  description: string;
  businessType: string;
  targetPermissions: string[];
  createdAt: Date;
  lastModified: Date;
  progress: number;
  status: "draft" | "in-progress" | "completed" | "submitted";
  completedSections: string[];
  totalSections: number;
}

interface AssessmentManagerProps {
  onSelectAssessment: (assessment: Assessment) => void;
  currentAssessment?: Assessment;
}

export function AssessmentManager({ onSelectAssessment, currentAssessment }: AssessmentManagerProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load assessments from API
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assessments?organizationId=default-org');
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('assessments-fetch-failed', error);
      } else {
        console.error('Error fetching assessments:', error);
      }
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssessment = async (formData: {
    name: string;
    description: string;
    businessType: string;
    permissions: string[];
  }) => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          businessType: formData.businessType,
          permissions: formData.permissions,
          organizationId: 'default-org'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      const newAssessment = await response.json();

      // Refresh assessments list
      await fetchAssessments();

      setIsCreateDialogOpen(false);
      onSelectAssessment({
        ...newAssessment,
        progress: 0,
        completedSections: [],
        totalSections: 5
      });
    } catch (error) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('assessment-creation-failed', error, formData);
      } else {
        console.error('Error creating assessment:', error);
      }
      // TODO: Show error message to user
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500 text-white";
      case "in-progress": return "bg-blue-500 text-white";
      case "submitted": return "bg-purple-500 text-white";
      case "draft": return "bg-slate-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case "payment-services": return "Payment Services";
      case "e-money": return "E-Money Institution";
      case "investment-services": return "Investment Services";
      case "deposit-taking": return "Bank/Building Society";
      default: return "Other Financial Services";
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
            <div className="space-y-3">
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your Assessments</h2>
          <p className="text-sm text-slate-500">
            Manage your FCA authorization assessments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Start a new FCA authorization readiness assessment for your business
              </DialogDescription>
            </DialogHeader>
            <CreateAssessmentForm onSubmit={handleCreateAssessment} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <Card className="border border-dashed border-slate-200">
          <CardContent className="p-12 text-center">
            <FileCheck2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No assessments yet</h3>
            <p className="text-slate-500 mb-6">
              Create your first FCA authorization assessment to get started
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Card
              key={assessment.id}
              className={`border transition-all hover:border-slate-300 ${
                currentAssessment?.id === assessment.id
                  ? "border-teal-200 bg-teal-50"
                  : "border-slate-100"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-teal-50">
                        <FileCheck2 className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{assessment.name}</h3>
                        <p className="text-sm text-slate-500">{assessment.description}</p>
                      </div>
                    </div>

                    <div className="ml-11 space-y-3">
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{getBusinessTypeLabel(assessment.businessType)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Modified {new Date(assessment.lastModified).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{(assessment.completedSections || []).length}/{assessment.totalSections} sections</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Progress</span>
                          <span className="text-sm font-medium text-slate-900">{assessment.progress}%</span>
                        </div>
                        <Progress value={assessment.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status.replace("-", " ")}
                        </Badge>
                        {(assessment.targetPermissions || []).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectAssessment(assessment)}
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Continue
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateAssessmentForm({ onSubmit }: {
  onSubmit: (data: {
    name: string;
    description: string;
    businessType: string;
    permissions: string[];
  }) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    businessType: "",
    permissions: [] as string[]
  });

  const businessTypes = [
    { value: "payment-services", label: "Payment Services" },
    { value: "e-money", label: "Electronic Money Institution" },
    { value: "investment-services", label: "Investment Services" },
    { value: "deposit-taking", label: "Bank/Building Society" },
    { value: "insurance", label: "Insurance" },
    { value: "other", label: "Other Financial Services" }
  ];

  const permissionsByType = {
    "payment-services": ["payment-initiation", "account-information", "money-remittance"],
    "e-money": ["e-money-issuance", "payment-services"],
    "investment-services": ["investment-advice", "portfolio-management", "execution-only"],
    "deposit-taking": ["deposit-taking", "lending"],
    "insurance": ["general-insurance", "life-insurance"],
    "other": ["consumer-credit", "debt-management", "financial-planning"]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.businessType) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Assessment Name</Label>
          <Input
            id="name"
            placeholder="e.g., FinTech Payment Services Authorization"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of your authorization requirements..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="businessType">Business Type</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => setFormData({
              ...formData,
              businessType: value,
              permissions: [] // Reset permissions when business type changes
            })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.businessType && (
          <div>
            <Label>Target Permissions</Label>
            <div className="mt-2 space-y-2">
              {permissionsByType[formData.businessType as keyof typeof permissionsByType]?.map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          permissions: [...formData.permissions, permission]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          permissions: formData.permissions.filter(p => p !== permission)
                        });
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 capitalize">
                    {permission.replace("-", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700"
          disabled={!formData.name || !formData.businessType}
        >
          Create Assessment
        </Button>
      </div>
    </form>
  );
}