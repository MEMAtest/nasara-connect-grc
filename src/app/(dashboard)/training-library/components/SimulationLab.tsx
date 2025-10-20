"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Trophy,
  Target,
  Gamepad2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag
} from "lucide-react";
import { Simulation } from "../types";

interface SimulationLabProps {
  simulation: Simulation;
  onComplete?: (score: number, feedback: string[]) => void;
}

interface Document {
  id: string;
  type: string;
  name: string;
  condition: 'genuine' | 'forged' | 'expired' | 'suspicious' | 'edited';
  issues?: string[];
}

interface DocumentReview {
  documentId: string;
  classification: 'accept' | 'reject' | 'request_more';
  issues: string[];
  confidence: number;
  notes: string;
}

export function SimulationLab({ simulation, onComplete }: SimulationLabProps) {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [reviews, setReviews] = useState<Record<string, DocumentReview>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Mock documents for KYC simulation
  const documents = useMemo<Document[]>(() => [
    {
      id: 'passport_001',
      type: 'passport',
      name: 'UK Passport - John Smith',
      condition: 'genuine'
    },
    {
      id: 'passport_002',
      type: 'passport',
      name: 'UK Passport - Maria Garcia',
      condition: 'forged',
      issues: ['Photo substitution', 'Altered expiry date']
    },
    {
      id: 'utility_001',
      type: 'utility_bill',
      name: 'Electricity Bill - ABC Energy',
      condition: 'edited',
      issues: ['Date modified with different ink']
    },
    {
      id: 'bank_001',
      type: 'bank_statement',
      name: 'Bank Statement - High Street Bank',
      condition: 'suspicious',
      issues: ['Unusual large cash deposits', 'Round number transactions']
    },
    {
      id: 'company_001',
      type: 'incorporation',
      name: 'Certificate of Incorporation',
      condition: 'genuine'
    }
  ], []);

  const currentDocument = documents[currentDocumentIndex];
  const progress = (Object.keys(reviews).length / documents.length) * 100;

  useEffect(() => {
    if (hasStarted && simulation.difficulty === 'advanced') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            completeSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, simulation.difficulty, completeSimulation]);

  const startSimulation = () => {
    setHasStarted(true);
    if (simulation.difficulty === 'advanced') {
      setTimeRemaining(5 * 60); // 5 minutes for advanced
    } else if (simulation.difficulty === 'intermediate') {
      setTimeRemaining(10 * 60); // 10 minutes for intermediate
    }
  };

  const submitDocumentReview = (review: Partial<DocumentReview>) => {
    if (!currentDocument) return;

    const fullReview: DocumentReview = {
      documentId: currentDocument.id,
      classification: review.classification || 'request_more',
      issues: review.issues || [],
      confidence: review.confidence || 50,
      notes: review.notes || '',
      ...review
    };

    setReviews(prev => ({
      ...prev,
      [currentDocument.id]: fullReview
    }));

    // Move to next document or complete
    if (currentDocumentIndex < documents.length - 1) {
      setCurrentDocumentIndex(prev => prev + 1);
    } else {
      completeSimulation();
    }
  };

  const calculateScore = useCallback(() => {
    let correctClassifications = 0;
    let issuesIdentified = 0;
    let totalIssues = 0;
    const feedbackMessages: string[] = [];

    documents.forEach(doc => {
      const review = reviews[doc.id];
      if (!review) return;

      totalIssues += doc.issues?.length || 0;

      // Check classification accuracy
      const correctClassification = getCorrectClassification(doc.condition);
      if (review.classification === correctClassification) {
        correctClassifications++;
        feedbackMessages.push(`✓ Correctly classified ${doc.name}`);
      } else {
        feedbackMessages.push(`✗ Misclassified ${doc.name} - should be ${correctClassification}`);
      }

      // Check issue identification
      if (doc.issues) {
        const identifiedIssues = doc.issues.filter(issue =>
          review.issues.some(reviewIssue =>
            reviewIssue.toLowerCase().includes(issue.toLowerCase())
          )
        );
        issuesIdentified += identifiedIssues.length;

        if (identifiedIssues.length === doc.issues.length) {
          feedbackMessages.push(`✓ Identified all issues in ${doc.name}`);
        } else {
          feedbackMessages.push(`⚠ Missed some issues in ${doc.name}: ${doc.issues.filter(issue =>
            !identifiedIssues.includes(issue)
          ).join(', ')}`);
        }
      }
    });

    const classificationScore = (correctClassifications / documents.length) * 60;
    const issueScore = totalIssues > 0 ? (issuesIdentified / totalIssues) * 40 : 0;
    const finalScore = Math.round(classificationScore + issueScore);

    return { finalScore, feedbackMessages };
  }, [documents, reviews]);

  const completeSimulation = useCallback(() => {
    const { finalScore, feedbackMessages } = calculateScore();
    setScore(finalScore);
    setFeedback(feedbackMessages);
    setIsComplete(true);
    onComplete?.(finalScore, feedbackMessages);
  }, [calculateScore, onComplete]);

  const getCorrectClassification = (condition: string): 'accept' | 'reject' | 'request_more' => {
    switch (condition) {
      case 'genuine':
        return 'accept';
      case 'forged':
      case 'expired':
        return 'reject';
      case 'suspicious':
      case 'edited':
        return 'request_more';
      default:
        return 'request_more';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderDocumentPreview = (doc: Document) => {
    // In a real implementation, this would show actual document images
    return (
      <div className="space-y-4">
        <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 mb-2">{doc.name}</h3>
          <Badge variant="outline" className="mb-4">
            {doc.type.replace('_', ' ').toUpperCase()}
          </Badge>
          <p className="text-sm text-slate-600">
            Document preview would be displayed here
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button size="sm" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Zoom In
            </Button>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Document metadata */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-600">Type:</span>
                <span className="ml-2 text-slate-800">{doc.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Name:</span>
                <span className="ml-2 text-slate-800">{doc.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!hasStarted) {
    return (
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-6 w-6 text-teal-600" />
            <div>
              <CardTitle>{simulation.title}</CardTitle>
              <CardDescription>{simulation.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <div className="font-medium text-slate-900">{simulation.estimatedDuration} minutes</div>
              <div className="text-sm text-slate-600">Estimated time</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Target className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <div className="font-medium text-slate-900">{simulation.scoring.passingScore}%</div>
              <div className="text-sm text-slate-600">Passing score</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <div className="font-medium text-slate-900">{documents.length}</div>
              <div className="text-sm text-slate-600">Documents to review</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review each document carefully for authenticity and compliance</li>
              <li>• Identify any issues or red flags</li>
              <li>• Classify each document as Accept, Reject, or Request More Information</li>
              <li>• Provide detailed notes for your decisions</li>
              {simulation.difficulty === 'advanced' && (
                <li className="font-medium">• Time limit: 5 minutes ⏰</li>
              )}
            </ul>
          </div>

          <div className="flex justify-center">
            <Button onClick={startSimulation} className="bg-teal-600 hover:bg-teal-700">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Start Simulation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <div className="space-y-6">
        <Card className={`border ${score >= simulation.scoring.passingScore ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <CardContent className="p-8 text-center">
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${score >= simulation.scoring.passingScore ? 'text-emerald-600' : 'text-amber-600'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${score >= simulation.scoring.passingScore ? 'text-emerald-900' : 'text-amber-900'}`}>
              Simulation Complete!
            </h3>
            <p className={`mb-4 ${score >= simulation.scoring.passingScore ? 'text-emerald-700' : 'text-amber-700'}`}>
              {score >= simulation.scoring.passingScore ? 'Congratulations! You passed the simulation.' : 'Good effort! Review the feedback and try again.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${score >= simulation.scoring.passingScore ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {score}%
                </div>
                <div className="text-sm text-slate-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${score >= simulation.scoring.passingScore ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Object.keys(reviews).length}
                </div>
                <div className="text-sm text-slate-600">Documents Reviewed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${score >= simulation.scoring.passingScore ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {simulation.scoring.passingScore}%
                </div>
                <div className="text-sm text-slate-600">Required Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardHeader>
            <CardTitle>Performance Feedback</CardTitle>
            <CardDescription>Detailed analysis of your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.map((message, index) => (
                <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${
                  message.startsWith('✓') ? 'bg-emerald-50 border border-emerald-200' :
                  message.startsWith('✗') ? 'bg-red-50 border border-red-200' :
                  'bg-amber-50 border border-amber-200'
                }`}>
                  {message.startsWith('✓') ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                  ) : message.startsWith('✗') ? (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  )}
                  <span className="text-sm">{message.substring(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress and timer */}
      <Card className="border border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">{simulation.title}</h3>
              <p className="text-sm text-slate-600">
                Document {currentDocumentIndex + 1} of {documents.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <Badge variant="outline" className={`${timeRemaining < 60 ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                  <Clock className="mr-1 h-3 w-3" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
              <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Main simulation interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document preview */}
        <Card className="border border-slate-100">
          <CardHeader>
            <CardTitle>Document Review</CardTitle>
            <CardDescription>Examine the document for authenticity and compliance</CardDescription>
          </CardHeader>
          <CardContent>
            {renderDocumentPreview(currentDocument)}
          </CardContent>
        </Card>

        {/* Review form */}
        <Card className="border border-slate-100">
          <CardHeader>
            <CardTitle>Assessment Form</CardTitle>
            <CardDescription>Record your findings and decision</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentReviewForm
              document={currentDocument}
              onSubmit={submitDocumentReview}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DocumentReviewFormProps {
  document: Document;
  onSubmit: (review: Partial<DocumentReview>) => void;
}

function DocumentReviewForm({ document, onSubmit }: DocumentReviewFormProps) {
  const [classification, setClassification] = useState<'accept' | 'reject' | 'request_more'>('request_more');
  const [issues, setIssues] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(70);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      classification,
      issues,
      confidence,
      notes
    });
  };

  const toggleIssue = (issue: string) => {
    setIssues(prev =>
      prev.includes(issue)
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const commonIssues = [
    'Photo substitution',
    'Altered dates',
    'Suspicious signatures',
    'Poor document quality',
    'Missing security features',
    'Inconsistent information',
    'Expired document',
    'Wrong document type'
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">{document.name}</p>
        <p className="text-xs text-slate-600 mt-1 capitalize">
          Document type: {document.type.replace(/_/g, ' ')}
        </p>
      </div>
      {/* Classification */}
      <div>
        <Label className="text-base font-medium mb-3 block">Decision</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={classification === 'accept' ? 'default' : 'outline'}
            onClick={() => setClassification('accept')}
            className={classification === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button
            variant={classification === 'reject' ? 'default' : 'outline'}
            onClick={() => setClassification('reject')}
            className={classification === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            variant={classification === 'request_more' ? 'default' : 'outline'}
            onClick={() => setClassification('request_more')}
            className={classification === 'request_more' ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            <Flag className="mr-2 h-4 w-4" />
            Request More Info
          </Button>
        </div>
      </div>

      {/* Issues checklist */}
      <div>
        <Label className="text-base font-medium mb-3 block">Potential Issues</Label>
        <div className="grid grid-cols-2 gap-2">
          {commonIssues.map(issue => (
            <label key={issue} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={issues.includes(issue)}
                onChange={() => toggleIssue(issue)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">{issue}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Confidence slider */}
      <div>
        <Label className="text-base font-medium mb-2 block">
          Confidence Level: {confidence}%
        </Label>
        <input
          type="range"
          min="0"
          max="100"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Notes */}
      <div>
        <Label className="text-base font-medium mb-2 block">Notes</Label>
        <Textarea
          placeholder="Document your reasoning and any additional observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={!notes.trim()}
      >
        Submit Review
      </Button>
    </div>
  );
}
