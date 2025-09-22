"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  SkipForward,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Users,
  TrendingUp,
  BarChart3,
  MapPin,
  Shield,
  Search,
  FileText,
  Download,
  Star,
  Brain,
  Zap,
  Award,
  Trophy
} from "lucide-react";
import { getTrainingModule } from "../content";
import { AMLTrainingRenderer } from "./AMLTrainingRenderer";
import { KYCTrainingRenderer } from "./KYCTrainingRenderer";

interface ContentSection {
  title: string;
  content: string;
  visual?: {
    type: string;
    elements?: Record<string, unknown>[];
    steps?: Record<string, unknown>[];
    categories?: Record<string, unknown>[];
    patterns?: Record<string, unknown>[];
    data?: string;
  };
}

interface TrainingContentRendererProps {
  contentId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
}

export function TrainingContentRenderer({ contentId, onComplete, onProgress }: TrainingContentRendererProps) {
  // Get the training module from our content registry
  const trainingModule = getTrainingModule(contentId);

  // If no module found, show error state
  if (!trainingModule) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Training Module Not Found</h2>
            <p className="text-red-700 mb-6">The requested training module &ldquo;{contentId}&rdquo; could not be found.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Route to specialized renderers based on module ID
  switch (contentId) {
    case 'aml-fundamentals':
      return <AMLTrainingRenderer onComplete={onComplete} onProgress={onProgress} />;
    case 'kyc-fundamentals':
      return <KYCTrainingRenderer onComplete={onComplete} onProgress={onProgress} />;
    default:
      // For modules without specialized renderers, use generic renderer
      return <GenericTrainingRenderer module={trainingModule} onComplete={onComplete} onProgress={onProgress} />;
  }
}

// Generic renderer for modules without specialized components
function GenericTrainingRenderer({ module, onComplete, onProgress }: {
  module: Record<string, unknown>;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
}) {
  const [currentStage, setCurrentStage] = useState<'hook' | 'content' | 'practice' | 'summary'>('hook');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Convert module to legacy content format for compatibility
  const content = {
    title: module.title,
    description: module.description,
    estimatedDuration: module.duration,
    difficulty: module.difficulty,
    stages: {
      hook: {
        duration: 1,
        title: module.hook?.title || "Training Introduction",
        content: module.hook?.content || "Welcome to this training module.",
        visual: {
          type: "scenario_illustration",
          description: "Training scenario illustration"
        }
      },
      content: {
        duration: 5,
        sections: [
          {
            title: "What Are Money Laundering Red Flags?",
            content: `Red flags are indicators that suggest a transaction or customer behavior may be linked to money laundering or other financial crimes. Think of them as warning signals that require closer examination.`,
            visual: {
              type: "infographic",
              elements: [
                { icon: "alert-triangle", text: "Warning Signals", color: "red", description: "Indicators of potential criminal activity" },
                { icon: "search", text: "Require Investigation", color: "amber", description: "Need enhanced due diligence" },
                { icon: "shield", text: "Protect Institution", color: "green", description: "Safeguard against regulatory breach" }
              ]
            }
          },
          {
            title: "The Three Stages of Money Laundering",
            content: `Understanding how money laundering works helps identify red flags at each stage:`,
            visual: {
              type: "process_flow",
              steps: [
                {
                  number: 1,
                  title: "Placement",
                  description: "Introducing illicit funds into the financial system",
                  examples: ["Large cash deposits", "Structured transactions", "Use of money service businesses"],
                  redFlags: ["Frequent cash deposits just under reporting thresholds", "Reluctance to provide identification"],
                  color: "red"
                },
                {
                  number: 2,
                  title: "Layering",
                  description: "Creating complex layers of transactions to obscure the trail",
                  examples: ["Multiple transfers", "Complex corporate structures", "Cross-border movements"],
                  redFlags: ["Unusual transaction patterns", "Transactions with no clear business purpose"],
                  color: "amber"
                },
                {
                  number: 3,
                  title: "Integration",
                  description: "Making laundered money appear legitimate",
                  examples: ["Property purchases", "Business investments", "Luxury goods"],
                  redFlags: ["Transactions inconsistent with customer profile", "Source of wealth unclear"],
                  color: "green"
                }
              ]
            }
          },
          {
            title: "Common Red Flag Categories",
            content: `Red flags fall into several key categories that you should monitor:`,
            visual: {
              type: "category_grid",
              categories: [
                {
                  icon: "user",
                  title: "Customer Behavior",
                  description: "How customers act and respond during interactions",
                  examples: ["Nervousness or anxiety", "Avoidance of questions", "Unusual knowledge of AML procedures", "Reluctance to provide standard information"],
                  riskLevel: "high"
                },
                {
                  icon: "credit-card",
                  title: "Transaction Patterns",
                  description: "Unusual characteristics in transaction data",
                  examples: ["Structuring (amounts just under thresholds)", "Round number preferences", "Frequent just-below-threshold amounts", "Rapid fund movements"],
                  riskLevel: "high"
                },
                {
                  icon: "map-pin",
                  title: "Geographic Indicators",
                  description: "Location-based concerns and patterns",
                  examples: ["High-risk jurisdictions", "Unusual travel patterns", "PEP connections", "Sanctions list matches"],
                  riskLevel: "medium"
                },
                {
                  icon: "briefcase",
                  title: "Business Activity",
                  description: "Commercial and business-related red flags",
                  examples: ["Cash-intensive businesses", "Inconsistent business purpose", "Complex ownership structures", "Unusual employee payments"],
                  riskLevel: "medium"
                }
              ]
            }
          }
        ]
      },
      practice: {
        duration: 2,
        scenarios: [
          {
            id: "scenario_1",
            title: "The Cash Deposit Pattern",
            description: "John Smith, described as a taxi driver, deposits £9,800 in cash every Friday for 6 consecutive weeks. He's always in a hurry and becomes irritated when asked routine questions.",
            question: "What red flags do you identify, and what action should you take?",
            options: [
              { id: "a", text: "Normal for cash business - no action needed", isCorrect: false },
              { id: "b", text: "Potential structuring pattern - investigate and consider SAR", isCorrect: true },
              { id: "c", text: "Below threshold - process normally", isCorrect: false },
              { id: "d", text: "Refuse service due to customer behavior", isCorrect: false }
            ],
            feedback: {
              correct: "Excellent analysis! This shows classic structuring behavior - consistent amounts just below the £10,000 threshold combined with suspicious customer behavior. The pattern, timing, and defensive attitude all warrant investigation and likely SAR filing.",
              incorrect: "This pattern demonstrates structuring - making deposits just below reporting thresholds to avoid detection. The consistency, timing, and customer behavior are all red flags that require investigation."
            },
            learningPoints: [
              "Structuring often involves consistent amounts just below reporting thresholds",
              "Customer behavior (irritation, hurry) can be as important as transaction patterns",
              "Patterns over time are more significant than individual transactions"
            ]
          },
          {
            id: "scenario_2",
            title: "The International Wire Request",
            description: "A well-dressed businesswoman requests to wire £45,000 to Dubai for 'business investments'. When asked for supporting documentation, she becomes agitated and asks if the bank 'trusts its customers'.",
            question: "How should you handle this situation?",
            options: [
              { id: "a", text: "Complete transaction - amount is within legal limits", isCorrect: false },
              { id: "b", text: "Refuse transaction immediately due to suspicious behavior", isCorrect: false },
              { id: "c", text: "Request enhanced due diligence documentation before proceeding", isCorrect: true },
              { id: "d", text: "Process transaction but file SAR afterwards", isCorrect: false }
            ],
            feedback: {
              correct: "Correct approach! High-value international transfers require proper documentation regardless of customer attitude. Enhanced due diligence should be completed before processing, and the customer's reaction to reasonable requests is itself a red flag.",
              incorrect: "International transfers of significant amounts require enhanced due diligence documentation. The customer's defensive reaction to reasonable documentation requests is itself suspicious and warrants careful handling."
            }
          }
        ]
      },
      summary: {
        duration: 1,
        keyTakeaways: [
          {
            icon: "alert-triangle",
            title: "Trust Your Professional Judgment",
            description: "If something feels wrong, investigate further. Your experience and intuition are valuable detection tools."
          },
          {
            icon: "search",
            title: "Look for Patterns Over Time",
            description: "Individual transactions may appear normal, but patterns across multiple transactions often reveal suspicious activity."
          },
          {
            icon: "clock",
            title: "Act Within Required Timeframes",
            description: "Report suspicious activities promptly - usually within 24-48 hours of identification to meet regulatory requirements."
          },
          {
            icon: "file-text",
            title: "Document Everything Thoroughly",
            description: "Detailed documentation protects your institution and supports investigations while demonstrating compliance."
          }
        ],
        nextSteps: [
          "Continue to 'Transaction Pattern Analysis' lesson",
          "Take the comprehensive Red Flags Assessment",
          "Review your institution's SAR filing procedures",
          "Practice with advanced scenario simulations"
        ]
      }
    }
  };

  const getStageProgress = () => {
    const stages = ['hook', 'content', 'practice', 'summary'];
    const currentIndex = stages.indexOf(currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const nextStage = () => {
    const stages = ['hook', 'content', 'practice', 'summary'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      setCurrentStage(stages[currentIndex + 1] as string);
    }
  };

  const renderVisual = (visual: Record<string, unknown>) => {
    if (!visual) return null;

    switch (visual.type) {
      case 'infographic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {visual.elements?.map((element: Record<string, unknown>, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                element.color === 'red' ? 'border-red-200 bg-red-50' :
                element.color === 'amber' ? 'border-amber-200 bg-amber-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {element.icon === 'alert-triangle' && <AlertTriangle className={`h-6 w-6 ${
                    element.color === 'red' ? 'text-red-600' :
                    element.color === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {element.icon === 'search' && <Search className={`h-6 w-6 ${
                    element.color === 'red' ? 'text-red-600' :
                    element.color === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {element.icon === 'shield' && <Shield className={`h-6 w-6 ${
                    element.color === 'red' ? 'text-red-600' :
                    element.color === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  <h4 className="font-semibold">{element.text}</h4>
                </div>
                <p className="text-sm text-slate-600">{element.description}</p>
              </div>
            ))}
          </div>
        );

      case 'process_flow':
        return (
          <div className="space-y-6 my-8">
            {visual.steps?.map((step: Record<string, unknown>, index: number) => (
              <div key={index} className="relative">
                <div className={`border-l-4 ${
                  step.color === 'red' ? 'border-red-500' :
                  step.color === 'amber' ? 'border-amber-500' :
                  'border-green-500'
                } pl-6`}>
                  <div className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    step.color === 'red' ? 'bg-red-500' :
                    step.color === 'amber' ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}>
                    {step.number}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                    <p className="text-slate-600 mb-4">{step.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-emerald-800 mb-2">Common Examples:</h5>
                        <ul className="space-y-1">
                          {step.examples?.map((example: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-800 mb-2">Red Flags to Watch:</h5>
                        <ul className="space-y-1">
                          {step.redFlags?.map((flag: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'category_grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            {visual.categories?.map((category: Record<string, unknown>, index: number) => (
              <div key={index} className={`p-6 rounded-lg border-2 ${
                category.riskLevel === 'high' ? 'border-red-200 bg-red-50' :
                category.riskLevel === 'medium' ? 'border-amber-200 bg-amber-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {category.icon === 'user' && <Users className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {category.icon === 'credit-card' && <BarChart3 className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {category.icon === 'map-pin' && <MapPin className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  {category.icon === 'briefcase' && <FileText className={`h-8 w-8 ${
                    category.riskLevel === 'high' ? 'text-red-600' :
                    category.riskLevel === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />}
                  <div>
                    <h4 className="text-lg font-semibold">{category.title}</h4>
                    <Badge className={`mt-1 ${
                      category.riskLevel === 'high' ? 'bg-red-600' :
                      category.riskLevel === 'medium' ? 'bg-amber-600' :
                      'bg-green-600'
                    }`}>
                      {category.riskLevel} risk
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-700 mb-4">{category.description}</p>
                <div>
                  <h5 className="font-medium mb-2">Common Indicators:</h5>
                  <ul className="space-y-2">
                    {category.examples?.map((example: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          category.riskLevel === 'high' ? 'bg-red-500' :
                          category.riskLevel === 'medium' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );

      case 'scenario_illustration':
        return (
          <div className="my-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-blue-600" />
            </div>
            <p className="text-slate-600 italic">{visual.description}</p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderHookStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
          <Zap className="h-4 w-4" />
          Hook - Capture Attention (1 minute)
        </div>
      </div>

      <Card className="border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            {content.stages.hook.title}
          </h2>
          <div className="text-lg text-slate-700 leading-relaxed mb-6 text-center">
            {content.stages.hook.content}
          </div>
          {renderVisual(content.stages.hook.visual)}

          <div className="mt-8 p-4 bg-white/50 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">💭 Think About This:</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• What immediate red flags do you notice?</li>
              <li>• What questions would you ask this customer?</li>
              <li>• What&apos;s your gut instinct telling you?</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContentStage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
          <BookOpen className="h-4 w-4" />
          Core Content - Deep Learning (5 minutes)
        </div>
      </div>

      {content.stages.content.sections.map((section: Record<string, unknown>, index: number) => (
        <Card key={index} className="border border-slate-200">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">{section.title}</h3>
            <div className="text-slate-700 leading-relaxed mb-6">{section.content}</div>
            {renderVisual(section.visual)}
          </CardContent>
        </Card>
      ))}

      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Key Statistics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$2-5T</div>
              <div className="text-sm text-blue-700">Global ML cost annually</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">&lt;1%</div>
              <div className="text-sm text-blue-700">Detection rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6-18mo</div>
              <div className="text-sm text-blue-700">Avg investigation time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPracticeStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
          <Target className="h-4 w-4" />
          Practice - Apply Knowledge (2 minutes)
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
        Test Your Red Flag Detection Skills
      </h2>

      {content.stages.practice.scenarios.map((scenario: Record<string, unknown>, index: number) => (
        <Card key={scenario.id} className="border border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-600" />
              {scenario.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Scenario:</h4>
              <p className="text-slate-700">{scenario.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">{scenario.question}</h4>
              <div className="space-y-3">
                {(scenario.options as Record<string, unknown>[]).map((option: Record<string, unknown>) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswers[scenario.id] === option.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={scenario.id}
                      value={option.id}
                      checked={selectedAnswers[scenario.id] === option.id}
                      onChange={() => setSelectedAnswers(prev => ({ ...prev, [scenario.id]: option.id }))}
                      className="mt-1"
                    />
                    <span className="text-slate-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedAnswers[scenario.id] && (
              <div className={`p-4 rounded-lg border ${
                (scenario.options as Record<string, unknown>[]).find((opt: Record<string, unknown>) => opt.id === selectedAnswers[scenario.id as string])?.isCorrect
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {(scenario.options as Record<string, unknown>[]).find((opt: Record<string, unknown>) => opt.id === selectedAnswers[scenario.id as string])?.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {(scenario.options as Record<string, unknown>[]).find((opt: Record<string, unknown>) => opt.id === selectedAnswers[scenario.id as string])?.isCorrect
                      ? 'Correct!' : 'Not quite right'}
                  </span>
                </div>
                <p className="text-sm mb-3">
                  {(scenario.options as Record<string, unknown>[]).find((opt: Record<string, unknown>) => opt.id === selectedAnswers[scenario.id as string])?.isCorrect
                    ? scenario.feedback.correct : scenario.feedback.incorrect}
                </p>
                {scenario.learningPoints && (
                  <div>
                    <h5 className="font-medium mb-2">Key Learning Points:</h5>
                    <ul className="space-y-1">
                      {scenario.learningPoints.map((point: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSummaryStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
          <Award className="h-4 w-4" />
          Summary - Reinforce Learning (1 minute)
        </div>
      </div>

      <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lesson Complete!</h2>
          <p className="text-slate-600 mb-6">You&apos;ve mastered the fundamentals of money laundering red flag detection</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">8 min</div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">+150</div>
              <div className="text-sm text-slate-600">Points Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.stages.summary.keyTakeaways.map((takeaway: Record<string, unknown>, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                {takeaway.icon === 'alert-triangle' && <AlertTriangle className="h-6 w-6 text-amber-500 mt-1" />}
                {takeaway.icon === 'search' && <Search className="h-6 w-6 text-blue-500 mt-1" />}
                {takeaway.icon === 'clock' && <Clock className="h-6 w-6 text-emerald-500 mt-1" />}
                {takeaway.icon === 'file-text' && <FileText className="h-6 w-6 text-purple-500 mt-1" />}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{takeaway.title}</h4>
                  <p className="text-sm text-slate-600">{takeaway.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Continue your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content.stages.summary.nextSteps.map((step: string, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{step}</span>
                <Button variant="outline" size="sm" className="ml-auto">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'hook':
        return renderHookStage();
      case 'content':
        return renderContentStage();
      case 'practice':
        return renderPracticeStage();
      case 'summary':
        return renderSummaryStage();
      default:
        return renderHookStage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{content.title}</h1>
          <p className="text-slate-600 mt-1">{content.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {content.estimatedDuration} min
          </Badge>
          <Badge className={
            content.difficulty === 'beginner' ? 'bg-green-600' :
            content.difficulty === 'intermediate' ? 'bg-amber-600' :
            'bg-red-600'
          }>
            {content.difficulty}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Learning Progress</h3>
            <span className="text-sm text-slate-600">{Math.round(getStageProgress())}% Complete</span>
          </div>
          <Progress value={getStageProgress()} className="h-3" />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span className={currentStage === 'hook' ? 'font-medium text-slate-700' : ''}>Hook</span>
            <span className={currentStage === 'content' ? 'font-medium text-slate-700' : ''}>Content</span>
            <span className={currentStage === 'practice' ? 'font-medium text-slate-700' : ''}>Practice</span>
            <span className={currentStage === 'summary' ? 'font-medium text-slate-700' : ''}>Summary</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Content */}
      {renderCurrentStage()}

      {/* Navigation */}
      <div className="flex justify-center">
        <Button
          onClick={nextStage}
          disabled={currentStage === 'summary'}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {currentStage === 'summary' ? 'Complete' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}