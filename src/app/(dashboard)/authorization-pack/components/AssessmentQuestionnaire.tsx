"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  Clock
} from "lucide-react";
import { getQuestionsBySection } from "../lib/questionBank";

interface StoredResponse {
  question_id: string;
  section: string;
  value: string | string[];
  score: number;
  notes?: string;
}

interface QuestionnaireResponse {
  questionId: string;
  value: string | string[];
  score: number;
  notes?: string;
}

interface AssessmentProgress {
  id: string;
  progress: number;
}

interface AssessmentQuestionnaireProps {
  sectionId: string;
  assessmentId?: string;
  onComplete?: (responses: QuestionnaireResponse[]) => void;
  onProgress?: (progress: number) => void;
}


export function AssessmentQuestionnaire({
  sectionId,
  assessmentId,
  onComplete,
  onProgress
}: AssessmentQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, QuestionnaireResponse>>(new Map());
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const questions = getQuestionsBySection(sectionId);
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Load existing responses when component mounts
  useEffect(() => {
    const loadExistingResponses = async () => {
      if (!assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assessments/${assessmentId}/responses?section=${sectionId}`);
        if (response.ok) {
          const existingResponses = await response.json();
          const responseMap = new Map<string, QuestionnaireResponse>();
          const notesMap = new Map<string, string>();

          (existingResponses as StoredResponse[]).forEach((resp: StoredResponse) => {
            responseMap.set(resp.question_id, {
              questionId: resp.question_id,
              value: resp.value,
              score: resp.score,
              notes: resp.notes
            });
            if (resp.notes) {
              notesMap.set(resp.question_id, resp.notes);
            }
          });

          setResponses(responseMap);
          setNotes(notesMap);

          // Navigate to first unanswered question, or stay at beginning if viewing completed section
          const firstUnansweredIndex = questions.findIndex(q => !responseMap.has(q.id));
          if (firstUnansweredIndex !== -1) {
            setCurrentQuestionIndex(firstUnansweredIndex);
          } else if (responseMap.size === questions.length) {
            // All questions answered - this will trigger the completion view
            setCurrentQuestionIndex(0);
          }
        }
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('questionnaire-responses-load-failed', error, { assessmentId, sectionId });
        } else {
          console.error('Error loading existing responses:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingResponses();
  }, [assessmentId, sectionId, questions]);

  const handleResponse = useCallback(async (questionId: string, value: string | string[], score: number) => {
    const newResponses = new Map(responses);
    newResponses.set(questionId, {
      questionId,
      value,
      score,
      notes: notes.get(questionId)
    });
    setResponses(newResponses);
    onProgress?.(progress);

    // Save to database if assessmentId is available
    if (assessmentId) {
      try {
        await fetch(`/api/assessments/${assessmentId}/responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId,
            section: sectionId,
            value,
            score,
            notes: notes.get(questionId)
          }),
        });
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('questionnaire-response-save-failed', error, { assessmentId, sectionId, questionId });
        } else {
          console.error('Error saving response:', error);
        }
      }
    }
  }, [responses, notes, progress, onProgress, assessmentId, sectionId]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Assessment complete
      onComplete?.(Array.from(responses.values()));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNotesChange = (questionId: string, noteText: string) => {
    const newNotes = new Map(notes);
    newNotes.set(questionId, noteText);
    setNotes(newNotes);

    // Update response with notes
    const response = responses.get(questionId);
    if (response) {
      const newResponses = new Map(responses);
      newResponses.set(questionId, { ...response, notes: noteText });
      setResponses(newResponses);
    }
  };

  const isAnswered = responses.has(currentQuestion?.id || "");
  const canProceed = !currentQuestion?.required || isAnswered;

  if (isLoading) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading questionnaire...</p>
        </CardContent>
      </Card>
    );
  }

  // Check if all questions in this section have been answered
  const allQuestionsAnswered = questions.length > 0 && questions.every(q => responses.has(q.id));

  if (!currentQuestion && questions.length === 0) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Questions Available</h3>
          <p className="text-slate-600">No questions found for this section.</p>
        </CardContent>
      </Card>
    );
  }

  if (allQuestionsAnswered) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Section Complete</h3>
          <p className="text-slate-600">All {questions.length} questions in this section have been answered.</p>
          <div className="mt-4 flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Back to Assessment
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={async () => {
              // Check if all sections are complete for 100% flow
              try {
                const assessmentResponse = await fetch(`/api/assessments?organizationId=default-org`);
                if (assessmentResponse.ok) {
                  const assessments = await assessmentResponse.json();
                  const currentAssessmentData = assessments.find((a: { id: string; progress: number }) => a.id === assessmentId);

                  if (currentAssessmentData?.progress === 100) {
                    // All sections complete - go to FCA readiness score/report
                    window.location.href = `/authorization-pack/report?assessmentId=${assessmentId}`;
                    return;
                  }
                }
              } catch (error) {
                // Log error for production monitoring - replace with proper logging service
                if (process.env.NODE_ENV === 'production') {
                  // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
                  // logError('assessment-completion-check-failed', error, { assessmentId });
                } else {
                  console.error('Error checking assessment completion:', error);
                }
              }

              // Navigate to next incomplete section or back to overview
              const sections = ['business-model', 'governance', 'risk-management', 'financial-resources', 'systems-controls'];
              const currentIndex = sections.indexOf(sectionId);
              const nextSection = sections[currentIndex + 1];
              if (nextSection) {
                window.location.href = `/authorization-pack/questionnaire?assessmentId=${assessmentId}&section=${nextSection}`;
              } else {
                window.location.href = '/authorization-pack';
              }
            }}>
              Next Section →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Section Error</h3>
          <p className="text-slate-600">Unable to load questions for this section.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50">
                <Target className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Assessment Progress</h3>
                <p className="text-sm text-slate-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-relaxed">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {currentQuestion.description}
              </CardDescription>
              {currentQuestion.regulatoryContext && (
                <div className="mt-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">
                    {currentQuestion.regulatoryContext}
                  </span>
                </div>
              )}
            </div>
            {currentQuestion.required && (
              <Badge variant="destructive" className="shrink-0">
                Required
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Input */}
          {currentQuestion.type === "single-choice" && currentQuestion.options && (
            <RadioGroup
              value={responses.get(currentQuestion.id)?.value as string || ""}
              onValueChange={(value) => {
                const option = currentQuestion.options?.find(opt => opt.value === value);
                if (option) {
                  handleResponse(currentQuestion.id, value, option.score);
                }
              }}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.score} pts
                  </Badge>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "scale" && currentQuestion.options && (
            <div className="space-y-4">
              <RadioGroup
                value={responses.get(currentQuestion.id)?.value as string || ""}
                onValueChange={(value) => {
                  const option = currentQuestion.options?.find(opt => opt.value === value);
                  if (option) {
                    handleResponse(currentQuestion.id, value, option.score);
                  }
                }}
                className="flex space-x-6"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="text-xs text-center cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {currentQuestion.type === "text" && (
            <div className="space-y-2">
              <Textarea
                placeholder="Provide a detailed response..."
                value={responses.get(currentQuestion.id)?.value as string || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // For text questions, score based on length and quality
                  const score = value.length > 100 ? 3 : value.length > 50 ? 2 : value.length > 0 ? 1 : 0;
                  handleResponse(currentQuestion.id, value, score);
                }}
                className="min-h-[100px]"
              />
            </div>
          )}

          {/* Notes Section */}
          <div className="border-t border-slate-100 pt-4">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Additional Notes (Optional)
            </Label>
            <Textarea
              placeholder="Add any relevant context or implementation details..."
              value={notes.get(currentQuestion.id) || ""}
              onChange={(e) => handleNotesChange(currentQuestion.id, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="border border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              {isAnswered ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : currentQuestion.required ? (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
              {isAnswered ? "Answered" : currentQuestion.required ? "Required" : "Optional"}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {currentQuestionIndex === questions.length - 1 ? "Complete Section" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}