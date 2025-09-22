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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowLeft,
  Settings,
  FileText,
  PlayCircle,
  Clock,
  Target,
  Users,
  BookOpen,
  Zap,
  Brain
} from "lucide-react";

interface ContentEditorProps {
  contentType?: 'micro-lesson' | 'branching-scenario' | 'simulation' | 'assessment' | 'pathway';
  contentId?: string;
}

export default function ContentEditorPage() {
  const [contentType, setContentType] = useState<string>("micro-lesson");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    regulatoryArea: "",
    difficulty: "beginner",
    estimatedDuration: 5,
    targetPersonas: [] as string[],
    learningObjectives: [] as string[],
    prerequisites: [] as string[],
    content: {
      hook: "",
      mainContent: "",
      practiceScenario: "",
      keyTakeaways: [] as string[]
    },
    assessment: {
      questions: [] as any[]
    }
  });

  const [currentSection, setCurrentSection] = useState("basic-info");
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (section: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: value
      }
    }));
  };

  const addLearningObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, ""]
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const addKeyTakeaway = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        keyTakeaways: [...prev.content.keyTakeaways, ""]
      }
    }));
  };

  const updateKeyTakeaway = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        keyTakeaways: prev.content.keyTakeaways.map((takeaway, i) => i === index ? value : takeaway)
      }
    }));
  };

  const ContentPreview = () => (
    <Card className="border border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-blue-600" />
          Content Preview
        </CardTitle>
        <CardDescription>See how your content will appear to learners</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{formData.title || "Untitled Content"}</h3>
          <p className="text-slate-600">{formData.description}</p>

          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-blue-600">{formData.estimatedDuration} min</Badge>
            <Badge variant="outline">{formData.difficulty}</Badge>
            <Badge variant="secondary">{formData.regulatoryArea}</Badge>
          </div>
        </div>

        {formData.content.hook && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Hook (30 seconds)
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-slate-700">{formData.content.hook}</p>
            </div>
          </div>
        )}

        {formData.content.mainContent && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Main Content (3-4 minutes)
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap">{formData.content.mainContent}</p>
            </div>
          </div>
        )}

        {formData.content.practiceScenario && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              Practice Scenario (1-2 minutes)
            </h4>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-slate-700">{formData.content.practiceScenario}</p>
            </div>
          </div>
        )}

        {formData.content.keyTakeaways.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Key Takeaways
            </h4>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <ul className="space-y-2">
                {formData.content.keyTakeaways.filter(Boolean).map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700">
                    <span className="text-purple-500 mt-1">•</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Content Editor</h1>
            <p className="text-slate-600 mt-1">Create and edit training content</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
            <Label htmlFor="preview-mode" className="text-sm">Preview</Label>
          </div>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Test Content
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Editor Panel */}
        <div className={previewMode ? "col-span-6" : "col-span-12"}>
          <Tabs value={currentSection} onValueChange={setCurrentSection} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Define the core properties of your training content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter a clear, descriptive title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what learners will achieve"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="regulatory-area">Regulatory Area</Label>
                      <Select value={formData.regulatoryArea} onValueChange={(value) => handleInputChange('regulatoryArea', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
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
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Learning Objectives</Label>
                      <Button variant="outline" size="sm" onClick={addLearningObjective}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Objective
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={objective}
                            onChange={(e) => updateLearningObjective(index, e.target.value)}
                            placeholder={`Learning objective ${index + 1}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
                              handleInputChange('learningObjectives', newObjectives);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Personas */}
                  <div>
                    <Label className="mb-3 block">Target Personas</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'founder_smf', label: 'Founder/SMF' },
                        { id: 'compliance_officer', label: 'Compliance Officer' },
                        { id: 'risk_analyst', label: 'Risk Analyst' },
                        { id: 'operations_manager', label: 'Operations Manager' },
                        { id: 'customer_advisor', label: 'Customer Advisor' },
                        { id: 'board_member', label: 'Board Member' },
                        { id: 'new_joiner', label: 'New Joiner' }
                      ].map(persona => (
                        <div key={persona.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={persona.id}
                            checked={formData.targetPersonas.includes(persona.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleInputChange('targetPersonas', [...formData.targetPersonas, persona.id]);
                              } else {
                                handleInputChange('targetPersonas', formData.targetPersonas.filter(p => p !== persona.id));
                              }
                            }}
                          />
                          <Label htmlFor={persona.id} className="text-sm">{persona.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Development</CardTitle>
                  <CardDescription>Build your micro-learning content using the 4-stage architecture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hook Section */}
                  <div>
                    <Label htmlFor="hook" className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Hook (30 seconds) - Capture attention
                    </Label>
                    <Textarea
                      id="hook"
                      value={formData.content.hook}
                      onChange={(e) => handleContentChange('hook', e.target.value)}
                      placeholder="Start with a compelling question, scenario, or statistic that hooks the learner..."
                      rows={3}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Engage learners immediately with something relevant to their role
                    </p>
                  </div>

                  {/* Main Content */}
                  <div>
                    <Label htmlFor="main-content" className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Main Content (3-4 minutes) - Core learning
                    </Label>
                    <Textarea
                      id="main-content"
                      value={formData.content.mainContent}
                      onChange={(e) => handleContentChange('mainContent', e.target.value)}
                      placeholder="Deliver the core learning content. Use examples, case studies, and clear explanations..."
                      rows={8}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Focus on one key concept. Use stories and examples from financial services
                    </p>
                  </div>

                  {/* Practice Scenario */}
                  <div>
                    <Label htmlFor="practice" className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-emerald-500" />
                      Practice Scenario (1-2 minutes) - Apply knowledge
                    </Label>
                    <Textarea
                      id="practice"
                      value={formData.content.practiceScenario}
                      onChange={(e) => handleContentChange('practiceScenario', e.target.value)}
                      placeholder="Present a realistic scenario where learners can apply what they've learned..."
                      rows={4}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Give learners a chance to practice in a safe environment
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        Key Takeaways - Reinforce learning
                      </Label>
                      <Button variant="outline" size="sm" onClick={addKeyTakeaway}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Takeaway
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.content.keyTakeaways.map((takeaway, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={takeaway}
                            onChange={(e) => updateKeyTakeaway(index, e.target.value)}
                            placeholder={`Key takeaway ${index + 1}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTakeaways = formData.content.keyTakeaways.filter((_, i) => i !== index);
                              handleContentChange('keyTakeaways', newTakeaways);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      3-5 bullet points that learners should remember
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment & Knowledge Check</CardTitle>
                  <CardDescription>Create questions to validate learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Assessment Builder</h3>
                    <p className="text-slate-600 mb-4">Add knowledge check questions to validate learning outcomes</p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Settings</CardTitle>
                  <CardDescription>Configure advanced options and metadata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900">Publishing Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="published" className="text-sm">Published</Label>
                          <Switch id="published" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="featured" className="text-sm">Featured Content</Label>
                          <Switch id="featured" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="mandatory" className="text-sm">Mandatory Training</Label>
                          <Switch id="mandatory" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900">Access Control</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="visibility" className="text-sm">Visibility</Label>
                          <Select defaultValue="all-learners">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-learners">All Learners</SelectItem>
                              <SelectItem value="specific-personas">Specific Personas</SelectItem>
                              <SelectItem value="admin-only">Admin Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="completion-tracking" className="text-sm">Completion Tracking</Label>
                          <Select defaultValue="enabled">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enabled">Enabled</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {previewMode && (
          <div className="col-span-6">
            <ContentPreview />
          </div>
        )}
      </div>
    </div>
  );
}