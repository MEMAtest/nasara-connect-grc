'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Globe,
  TrendingUp,
  Clock,
  Target,
  Building,
  CreditCard,
  MapPin
} from 'lucide-react';
import { kycFundamentalsModule } from '../content/kyc-fundamentals';

interface KYCTrainingRendererProps {
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
  deepLink?: { stage?: string; section?: string };
  onDeepLinkChange?: (deepLink: { stage?: string; section?: string }) => void;
}

export function KYCTrainingRenderer({ onComplete, onProgress, deepLink, onDeepLinkChange }: KYCTrainingRendererProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  const kycModule = kycFundamentalsModule;

  const sections = useMemo(
    () => ([
      { id: 'hook', title: 'The Crisis' },
      { id: 'pillars', title: 'CDD Pillars' },
      { id: 'risk', title: 'Risk Assessment' },
      { id: 'monitoring', title: 'Ongoing Monitoring' },
      ...kycModule.practiceScenarios.map((_, index) => ({
        id: `scenario-${index}`,
        title: `Scenario ${index + 1}`,
      })),
      { id: 'summary', title: 'Summary' },
    ]),
    [kycModule.practiceScenarios],
  );

  const getInitialSectionIndex = () => {
    const stage = deepLink?.stage;
    const section = deepLink?.section;

    if (stage === 'hook') return 0;
    if (stage === 'summary') return sections.length - 1;
    if (stage === 'practice') return Math.max(0, sections.findIndex((item) => item.id.startsWith('scenario-')));

    if (section) {
      const byId = sections.findIndex((item) => item.id === section);
      if (byId !== -1) return byId;
      const parsed = Number(section);
      if (Number.isFinite(parsed)) return Math.max(0, Math.min(parsed, sections.length - 1));
    }

    return 0;
  };

  const [currentSection, setCurrentSection] = useState(getInitialSectionIndex);
  const totalSections = sections.length;
  const progress = (completedSections.size / totalSections) * 100;
  const activeSectionId = sections[currentSection]?.id ?? String(currentSection);

  const calculateScenarioScore = () => {
    const totalScenarios = kycModule.practiceScenarios.length;
    if (!totalScenarios) return 100;
    const correctCount = kycModule.practiceScenarios.reduce((count, scenario) => {
      return selectedAnswers[scenario.id] === scenario.correctAnswer ? count + 1 : count;
    }, 0);
    return Math.round((correctCount / totalScenarios) * 100);
  };

  const handleSectionComplete = (sectionIndex: number) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionIndex);
    setCompletedSections(newCompleted);
    onProgress?.(((newCompleted.size) / totalSections) * 100);

    if (newCompleted.size === totalSections) {
      onComplete?.(calculateScenarioScore(), kycModule.duration);
    }
  };

  const handleScenarioAnswer = (scenarioId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [scenarioId]: answerIndex }));
    setShowResults(prev => ({ ...prev, [scenarioId]: true }));
  };

  const renderHookSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="destructive" className="mb-4">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Critical Alert
        </Badge>
        <h2 className="text-3xl font-bold text-red-600 mb-4">{kycModule.hook.title}</h2>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">£2.3B</div>
              <div className="text-sm text-muted-foreground">Annual UK Identity Fraud Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">+75%</div>
              <div className="text-sm text-muted-foreground">Synthetic ID Fraud Growth</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Tech-Enabled</div>
              <div className="text-sm text-muted-foreground">New Criminal Methods</div>
            </div>
          </div>

          <div className="prose max-w-none">
            {kycModule.hook.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Critical Question:</h4>
            <p className="text-yellow-700">{kycModule.hook.keyQuestion}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCDDPillars = () => {
    const lesson = kycModule.lessons[0];
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{lesson.title}</h2>
          <p className="text-lg text-muted-foreground">{lesson.content.learningPoint}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-600">Pillar 1: Identification</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Legal identity verification
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Residential address confirmation
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Date and place of birth
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Legal status documentation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-600">Pillar 2: Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Document authentication
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Biometric verification
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Electronic database checks
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Face-to-face verification
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-purple-600">Pillar 3: Understanding</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Purpose of relationship
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Expected transaction patterns
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Source of funds and wealth
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Business model analysis
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Key Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {lesson.content.keyConcepts.map((concept, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">{concept.term}</h4>
                  <p className="text-sm text-gray-600">{concept.definition}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRiskAssessment = () => {
    const lesson = kycModule.lessons[1];
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{lesson.title}</h2>
          <p className="text-lg text-muted-foreground">{lesson.content.learningPoint}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center pb-4">
              <Globe className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-red-600">Geographic Risk</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1">
                <li>• FATF high-risk jurisdictions</li>
                <li>• Sanctions countries</li>
                <li>• Tax havens</li>
                <li>• Political instability</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center pb-4">
              <Building className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-orange-600">Customer Type</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1">
                <li>• Cash-intensive businesses</li>
                <li>• PEPs and associates</li>
                <li>• Shell companies</li>
                <li>• Complex structures</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="text-center pb-4">
              <CreditCard className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-yellow-600">Product Risk</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1">
                <li>• Private banking</li>
                <li>• International transfers</li>
                <li>• Anonymous products</li>
                <li>• High-value transactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="text-center pb-4">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-blue-600">Delivery Channel</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1">
                <li>• Non-face-to-face</li>
                <li>• Digital-only</li>
                <li>• Third-party introducers</li>
                <li>• Remote onboarding</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600">
              <TrendingUp className="w-5 h-5 mr-2" />
              Dynamic Risk Scoring Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Risk Level</th>
                    <th className="text-left p-2">Characteristics</th>
                    <th className="text-left p-2">Review Frequency</th>
                    <th className="text-left p-2">Due Diligence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-red-50">
                    <td className="p-2">
                      <Badge variant="destructive">High Risk</Badge>
                    </td>
                    <td className="p-2">PEPs, high-risk jurisdictions, complex structures</td>
                    <td className="p-2">At least annually</td>
                    <td className="p-2">Enhanced Due Diligence (EDD)</td>
                  </tr>
                  <tr className="border-b bg-yellow-50">
                    <td className="p-2">
                      <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Medium Risk</Badge>
                    </td>
                    <td className="p-2">Standard corporates, regulated professionals</td>
                    <td className="p-2">Every 2-3 years</td>
                    <td className="p-2">Standard Due Diligence (SDD)</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="p-2">
                      <Badge variant="secondary" className="bg-green-200 text-green-800">Low Risk</Badge>
                    </td>
                    <td className="p-2">Regulated institutions, government entities</td>
                    <td className="p-2">Every 3-5 years</td>
                    <td className="p-2">Simplified Due Diligence (SDD)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOngoingMonitoring = () => {
    const lesson = kycModule.lessons[2];
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{lesson.title}</h2>
          <p className="text-lg text-muted-foreground">{lesson.content.learningPoint}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Eye className="w-5 h-5 mr-2" />
                Transaction Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-3">Automated Detection Systems:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Unusual transaction patterns
                </li>
                <li className="flex items-start">
                  <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Rapid fund movements (layering)
                </li>
                <li className="flex items-start">
                  <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  High-risk jurisdiction transactions
                </li>
                <li className="flex items-start">
                  <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Structuring patterns
                </li>
                <li className="flex items-start">
                  <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Round-number transactions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Clock className="w-5 h-5 mr-2" />
                Periodic Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-3">Review Requirements:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-semibold text-red-600">High Risk</div>
                  <div className="text-sm">At least annually</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-semibold text-yellow-600">Medium Risk</div>
                  <div className="text-sm">Every 2-3 years</div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-semibold text-green-600">Low Risk</div>
                  <div className="text-sm">Every 3-5 years</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Common Red Flags in Ongoing Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Immediate Alert Patterns:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Large cash deposits → immediate wire transfers
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Multiple similar accounts/names
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Round-number transactions
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Activity below reporting thresholds
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-orange-600">Behavior Indicators:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    Sudden activity increase
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    Reluctance to provide information
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    Frequent limit increase requests
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    Inconsistent activity patterns
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderScenario = (scenario: typeof kycModule.practiceScenarios[0], index: number) => {
    const isAnswered = showResults[scenario.id];
    const selectedAnswer = selectedAnswers[scenario.id];
    const isCorrect = selectedAnswer === scenario.correctAnswer;

    return (
      <Card key={scenario.id} className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Scenario {index + 1}: {scenario.title}
          </CardTitle>
          <p className="text-muted-foreground">{scenario.context}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
            <h4 className="font-semibold mb-3">Situation:</h4>
            <div className="prose max-w-none">
              {scenario.situation.split('\n\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-2 text-sm">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">{scenario.challenge}</h4>
            <div className="space-y-2">
              {scenario.options.map((option, optionIndex) => (
                <Button
                  key={optionIndex}
                  variant={isAnswered ?
                    (optionIndex === scenario.correctAnswer ? "default" :
                     optionIndex === selectedAnswer ? "destructive" : "outline") :
                    "outline"}
                  className={`w-full text-left justify-start h-auto p-4 ${
                    isAnswered && optionIndex === scenario.correctAnswer ? 'border-green-500 bg-green-50' :
                    isAnswered && optionIndex === selectedAnswer && !isCorrect ? 'border-red-500 bg-red-50' : ''
                  }`}
                  onClick={() => !isAnswered && handleScenarioAnswer(scenario.id, optionIndex)}
                  disabled={isAnswered}
                >
                  <div className="flex items-start">
                    <span className="mr-3 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                    <span>{option}</span>
                    {isAnswered && optionIndex === scenario.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {isAnswered && optionIndex === selectedAnswer && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {isAnswered && (
            <div className={`p-4 border rounded-lg ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h4>
              <p className="text-sm mb-3">{scenario.explanation}</p>
              <div>
                <h5 className="font-semibold mb-2">Key Learning Points:</h5>
                <ul className="text-sm space-y-1">
                  {scenario.learningPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Summary & Key Takeaways</h2>
        <p className="text-lg text-muted-foreground">Consolidate your learning and plan next steps</p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {kycModule.summary.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {kycModule.summary.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {kycModule.summary.quickReference.map((ref, index) => (
                <li key={index} className="flex items-start">
                  <Shield className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{ref}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hook':
        return renderHookSection();
      case 'pillars':
        return renderCDDPillars();
      case 'risk':
        return renderRiskAssessment();
      case 'monitoring':
        return renderOngoingMonitoring();
      case 'summary':
        return renderSummary();
      default: {
        if (!sectionId.startsWith('scenario-')) return null;
        const scenarioIndex = Number(sectionId.replace('scenario-', ''));
        if (!Number.isFinite(scenarioIndex)) return null;
        const scenario = kycModule.practiceScenarios[scenarioIndex];
        if (!scenario) return null;
        return renderScenario(scenario, scenarioIndex);
      }
    }
  };

  useEffect(() => {
    const stage = deepLink?.stage;
    if (stage === 'hook' && currentSection !== 0) {
      setCurrentSection(0);
      return;
    }
    if (stage === 'summary' && currentSection !== sections.length - 1) {
      setCurrentSection(sections.length - 1);
      return;
    }
    if (stage === 'practice') {
      const firstScenarioIndex = sections.findIndex((item) => item.id.startsWith('scenario-'));
      if (firstScenarioIndex !== -1 && currentSection !== firstScenarioIndex) {
        setCurrentSection(firstScenarioIndex);
        return;
      }
    }

    const section = deepLink?.section;
    if (!section) return;
    const byId = sections.findIndex((item) => item.id === section);
    if (byId !== -1 && byId !== currentSection) {
      setCurrentSection(byId);
      return;
    }
    const parsed = Number(section);
    if (!Number.isFinite(parsed)) return;
    const nextIndex = Math.max(0, Math.min(parsed, sections.length - 1));
    if (nextIndex === currentSection) return;
    setCurrentSection(nextIndex);
  }, [currentSection, deepLink?.section, deepLink?.stage, sections]);

  const syncDeepLink = (index: number) => {
    if (!onDeepLinkChange) return;
    const nextSectionId = sections[index]?.id ?? String(index);
    onDeepLinkChange({ stage: "content", section: nextSectionId });
  };

  const handleSectionChange = (index: number) => {
    setCurrentSection(index);
    syncDeepLink(index);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href="/training-library" className="hover:text-red-600 transition-colors">
          Training Library
        </a>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-[200px]" title={kycModule.title}>
          {kycModule.title}
        </span>
        <span>/</span>
        <span className="text-red-600 font-medium">
          {currentSection === 0 ? "Hook" :
           currentSection === sections.length - 1 ? "Summary" :
           sections[currentSection]?.id.startsWith('scenario-') ? "Practice" : "Content"}
        </span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{kycModule.title}</h1>
            <p className="text-muted-foreground mt-2">{kycModule.description}</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            {kycModule.duration} min
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {kycModule.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>

        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Progress: {Math.round(progress)}% ({completedSections.size}/{totalSections} sections)
        </p>
      </div>

      <Tabs value={sections[currentSection]?.id} onValueChange={(value) => {
        const sectionIndex = sections.findIndex(s => s.id === value);
        if (sectionIndex !== -1) handleSectionChange(sectionIndex);
      }}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
          {sections.map((section, index) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className={`text-xs ${completedSections.has(index) ? 'bg-green-100 text-green-800' : ''}`}
            >
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeSectionId} className="mt-6" key={activeSectionId}>
          {renderSection(activeSectionId)}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => handleSectionChange(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                handleSectionComplete(currentSection);
                if (currentSection < sections.length - 1) {
                  handleSectionChange(currentSection + 1);
                }
              }}
            >
              {currentSection === sections.length - 1 ? 'Complete Training' : 'Next Section'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
