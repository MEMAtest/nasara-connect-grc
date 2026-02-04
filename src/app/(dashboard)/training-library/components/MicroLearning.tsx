"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  Brain,
  Target,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Trophy
} from "lucide-react";
import { MicroLesson } from "../types";

type LessonStage = "hook" | "content" | "practice" | "summary";

interface ScenarioOption {
  description: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface ScenarioExercise {
  scenarios: ScenarioOption[];
}

interface InteractiveExample {
  scenario: string;
  flag: string;
  action: string;
}

interface InteractiveContentData {
  redFlags?: string[];
  examples?: InteractiveExample[];
}

const stageOrder: LessonStage[] = ["hook", "content", "practice", "summary"];

const isScenarioExercise = (value: unknown): value is ScenarioExercise => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { scenarios?: unknown };
  return Array.isArray(candidate.scenarios);
};

interface MicroLearningProps {
  lesson: MicroLesson;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
}

export function MicroLearning({ lesson, onComplete, onProgress }: MicroLearningProps) {
  const [currentStage, setCurrentStage] = useState<LessonStage>("hook");
  const [startTime] = useState<Date>(new Date());
  const [stageProgress, setStageProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const stages = stageOrder;
  const currentStageIndex = stages.indexOf(currentStage);
  const overallProgress = ((currentStageIndex + (stageProgress / 100)) / stages.length) * 100;

  useEffect(() => {
    onProgress?.(overallProgress);
  }, [overallProgress, onProgress]);

  const startStage = () => {
    setIsPlaying(true);
    setStageProgress(0);

    const stageDuration = lesson.components![currentStage].duration * 60 * 1000; // Convert to milliseconds
    const interval = setInterval(() => {
      setStageProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + (100 / (stageDuration / 1000)); // Update every second
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const nextStage = () => {
    const nextIndex = currentStageIndex + 1;
    if (nextIndex < stages.length) {
      setCurrentStage(stages[nextIndex]);
      setStageProgress(0);
      setIsPlaying(false);
      setShowFeedback(false);
    } else {
      // Lesson complete
      const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000 / 60; // minutes
      setIsCompleted(true);
      onComplete?.(score, timeSpent);
    }
  };

  const previousStage = () => {
    const prevIndex = currentStageIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStage(stages[prevIndex]);
      setStageProgress(100);
      setIsPlaying(false);
      setShowFeedback(false);
    }
  };

  const handlePracticeAnswer = (questionId: string, answer: string) => {
    setPracticeAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkPracticeAnswers = () => {
    if (currentStage === 'practice' && lesson.components!.practice.type === 'scenario') {
      const exercise = lesson.components!.practice.exercise;
      if (!isScenarioExercise(exercise)) {
        return;
      }

      let correctAnswers = 0;
      let totalQuestions = 0;

      exercise.scenarios.forEach((scenario, index) => {
        totalQuestions++;
        const userAnswer = practiceAnswers[`scenario_${index}`];
        if (userAnswer === scenario.correct) {
          correctAnswers++;
        }
      });

      const practiceScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      setScore(practiceScore);
      setShowFeedback(true);
    }
  };

  const renderHook = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Target className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Let's Begin!</h3>
        <p className="text-slate-600">{lesson.components!.hook.content}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <Clock className="h-4 w-4" />
          This stage takes {lesson.components!.hook.duration} minutes
        </div>
      </div>

      <div className="flex justify-center">
        {!isPlaying ? (
          <Button onClick={startStage} className="bg-blue-600 hover:bg-blue-700">
            <Play className="mr-2 h-4 w-4" />
            Start Hook
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Pause className="h-4 w-4" />
              <span className="text-sm">Processing...</span>
            </div>
            <Progress value={stageProgress} className="w-48" />
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    const content = lesson.components!.content;
    const interactiveData = (content.data ?? {}) as InteractiveContentData;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Brain className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Core Learning</h3>
        </div>

        {content.type === 'interactive' && (
          <div className="space-y-4">
            {interactiveData.redFlags?.length ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h4 className="font-semibold text-emerald-800 mb-3">Key Red Flags to Identify:</h4>
                <ul className="space-y-2">
                  {interactiveData.redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2 text-emerald-700">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {interactiveData.examples?.length ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">Practical Examples:</h4>
                {interactiveData.examples.map((example, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-sm font-medium text-slate-600">Scenario:</span>
                        <p className="text-sm text-slate-800">{example.scenario}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Red Flag:</span>
                        <p className="text-sm text-red-600">{example.flag}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Action:</span>
                        <p className="text-sm text-emerald-600">{example.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-700 text-sm">
            <Clock className="h-4 w-4" />
            Content duration: {lesson.components!.content.duration} minutes
          </div>
        </div>

        <div className="flex justify-center">
          {!isPlaying ? (
            <Button onClick={startStage} className="bg-emerald-600 hover:bg-emerald-700">
              <Play className="mr-2 h-4 w-4" />
              Start Learning
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Brain className="h-4 w-4" />
                <span className="text-sm">Learning in progress...</span>
              </div>
              <Progress value={stageProgress} className="w-48" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPractice = () => {
    const practice = lesson.components!.practice;
    const scenarioExercise = isScenarioExercise(practice.exercise) ? practice.exercise : null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Target className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Practice Exercise</h3>
          <p className="text-slate-600">Apply what you've learned</p>
        </div>

        {practice.type === 'scenario' && scenarioExercise && (
          <div className="space-y-6">
            {scenarioExercise.scenarios.map((scenario, index) => (
              <Card key={index} className="border border-amber-200">
                <CardContent className="p-6">
                  <h4 className="font-medium text-slate-900 mb-3">Scenario {index + 1}</h4>
                  <p className="text-slate-700 mb-4">{scenario.description}</p>

                  <RadioGroup
                    value={practiceAnswers[`scenario_${index}`] || ""}
                    onValueChange={(value) => handlePracticeAnswer(`scenario_${index}`, value)}
                  >
                    {scenario.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${index}_${optIndex}`} />
                        <Label htmlFor={`${index}_${optIndex}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {showFeedback && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      practiceAnswers[`scenario_${index}`] === scenario.correct
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {practiceAnswers[`scenario_${index}`] === scenario.correct ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${
                            practiceAnswers[`scenario_${index}`] === scenario.correct
                              ? 'text-emerald-800'
                              : 'text-red-800'
                          }`}>
                            {practiceAnswers[`scenario_${index}`] === scenario.correct ? 'Correct!' : 'Incorrect'}
                          </p>
                          <p className={`text-sm ${
                            practiceAnswers[`scenario_${index}`] === scenario.correct
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }`}>
                            {scenario.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center">
              {!showFeedback ? (
                <Button
                  onClick={checkPracticeAnswers}
                  disabled={Object.keys(practiceAnswers).length === 0}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Check Answers
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <Trophy className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Score: {score.toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Lightbulb className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Key Takeaways</h3>
        <p className="text-slate-600">Remember these important points</p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <ul className="space-y-3">
          {lesson.components!.summary.keyTakeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-slate-700">{takeaway}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">Lesson Complete!</span>
          </div>
          {score > 0 && (
            <p className="text-sm text-emerald-600 mt-1">Final Score: {score.toFixed(0)}%</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStageContent = () => {
    switch (currentStage) {
      case 'hook':
        return renderHook();
      case 'content':
        return renderContent();
      case 'practice':
        return renderPractice();
      case 'summary':
        return renderSummary();
      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <Card className="border border-emerald-200 bg-emerald-50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-emerald-900 mb-2">Lesson Complete!</h3>
          <p className="text-emerald-700 mb-4">
            You've successfully completed "{lesson.title}"
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-emerald-600">
            <span>Score: {score.toFixed(0)}%</span>
            <span>•</span>
            <span>Duration: {lesson.duration} minutes</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              <CardDescription>
                Stage {currentStageIndex + 1} of {stages.length}: {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Stage Content */}
      <Card className="border border-slate-100">
        <CardContent className="p-8">
          {renderStageContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="border border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousStage}
              disabled={currentStageIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {stages.map((stage, index) => (
                <div
                  key={stage}
                  className={`w-3 h-3 rounded-full ${
                    index < currentStageIndex
                      ? 'bg-emerald-500'
                      : index === currentStageIndex
                      ? 'bg-teal-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStage}
              disabled={isPlaying || (currentStage === 'practice' && !showFeedback)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {currentStageIndex === stages.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
