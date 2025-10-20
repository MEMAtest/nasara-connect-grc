"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Users,
  BookOpen,
  Target,
  Clock,
  Award,
  Download,
  Upload
} from "lucide-react";
import { getTrainingContent } from "../lib/trainingContent";

export function TrainingAdminClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);

  const trainingData = getTrainingContent();
  const filteredPathways = trainingData.pathways.filter(pathway => {
    const matchesSearch = pathway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pathway.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPersona = selectedPersona === "all" ||
                          pathway.targetPersonas.includes(selectedPersona);
    return matchesSearch && matchesPersona;
  });

  const ContentCreationModal = () => (
    <Card className="border border-slate-200">
      <CardHeader>
        <CardTitle>Create New Training Content</CardTitle>
        <CardDescription>Build interactive learning experiences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="content-type">Content Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="micro-lesson">Micro Lesson</SelectItem>
                <SelectItem value="branching-scenario">Branching Scenario</SelectItem>
                <SelectItem value="simulation">Simulation Lab</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="pathway">Learning Pathway</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Enter content title" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Enter content description" rows={3} />
        </div>

        <div>
          <Label htmlFor="regulatory-area">Regulatory Area</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select regulatory area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fca-authorization">FCA Authorization</SelectItem>
              <SelectItem value="smcr">SM&CR</SelectItem>
              <SelectItem value="financial-crime">Financial Crime Prevention</SelectItem>
              <SelectItem value="conduct-risk">Conduct Risk Management</SelectItem>
              <SelectItem value="operational-resilience">Operational Resilience</SelectItem>
              <SelectItem value="consumer-duty">Consumer Duty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="target-personas">Target Personas</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.keys(trainingData.personas).map(persona => (
              <label key={persona} className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm capitalize">{persona.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">Create Content</Button>
          <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Training Content Management</h1>
          <p className="text-slate-600 mt-2">Create, edit, and manage training content and pathways</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{trainingData.pathways.length}</div>
                <div className="text-sm text-slate-600">Learning Pathways</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {trainingData.pathways.reduce((acc, p) => acc + p.modules.length, 0)}
                </div>
                <div className="text-sm text-slate-600">Training Modules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{Object.keys(trainingData.personas).length}</div>
                <div className="text-sm text-slate-600">Learner Personas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">1</div>
                <div className="text-sm text-slate-600">Branching Scenarios</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isCreating && <ContentCreationModal />}

      <Tabs defaultValue="pathways" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pathways">Learning Pathways</TabsTrigger>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pathways" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search pathways..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Personas</SelectItem>
                    {Object.keys(trainingData.personas).map(persona => (
                      <SelectItem key={persona} value={persona}>
                        {trainingData.personas[persona as keyof typeof trainingData.personas].title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pathways List */}
          <div className="space-y-4">
            {filteredPathways.map((pathway) => (
              <Card key={pathway.id} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900">{pathway.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {pathway.estimatedDuration} total
                        </Badge>
                        <Badge className={
                          pathway.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          pathway.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {pathway.difficulty}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-4">{pathway.description}</p>

                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {pathway.modules.length} modules
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {pathway.targetPersonas.length} personas
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Updated 2 days ago
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {pathway.targetPersonas.map(persona => (
                          <Badge key={persona} variant="secondary" className="text-xs">
                            {trainingData.personas[persona as keyof typeof trainingData.personas]?.title || persona}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Modules</CardTitle>
              <CardDescription>Individual learning units and micro-lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.pathways.map(pathway =>
                  pathway.modules.map(module => (
                    <div key={module.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{module.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>Duration: {module.estimatedDuration}</span>
                            <span>Type: {module.type}</span>
                            <span>Pathway: {pathway.title}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branching Scenarios</CardTitle>
              <CardDescription>Interactive decision-making scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.branchingScenarios.map(scenario => (
                  <div key={scenario.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{scenario.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{scenario.context.situation}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>{scenario.decisionPoints.length} decision points</span>
                          <span>Difficulty: {scenario.difficulty}</span>
                          <span>Role: {scenario.context.role}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessments & Challenges</CardTitle>
              <CardDescription>Knowledge checks and micro-challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Assessments Created</h3>
                <p className="text-slate-600 mb-4">Create your first assessment to test learner knowledge</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>Performance metrics and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-4">Most Popular Content</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">FCA Authorization Essentials</span>
                      <Badge variant="secondary">89% completion</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">PEP Customer Onboarding</span>
                      <Badge variant="secondary">76% completion</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">SM&CR Responsibilities</span>
                      <Badge variant="secondary">64% completion</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-4">Content Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Average Completion Rate</span>
                      <span className="text-sm font-medium">73%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Average Score</span>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Learner Satisfaction</span>
                      <span className="text-sm font-medium">4.6/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
