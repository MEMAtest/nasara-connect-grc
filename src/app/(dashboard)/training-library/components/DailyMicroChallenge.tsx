"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Clock,
  Target,
  Trophy,
  CheckCircle2,
  XCircle,
  Brain,
  Star,
  Flame
} from "lucide-react";
import { MicroChallenge } from "../types";

interface DailyMicroChallengeProps {
  challenge: MicroChallenge;
  onComplete?: (success: boolean, timeSpent: number, points: number) => void;
}

export function DailyMicroChallenge({ challenge, onComplete }: DailyMicroChallengeProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimit);
  const [isComplete, setIsComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hasStarted && !isComplete && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeChallenge(false); // Time's up
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isComplete, timeRemaining, completeChallenge]);

  const startChallenge = () => {
    setHasStarted(true);
    setTimeRemaining(challenge.timeLimit);
    setTimeSpent(0);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const correct = checkAnswer();
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      completeChallenge(correct);
    }, 3000); // Show feedback for 3 seconds
  };

  const checkAnswer = (): boolean => {
    if (challenge.type === 'quick_decision' && challenge.content.correct !== undefined) {
      const correctIndex = challenge.content.correct;
      const correctOption = challenge.content.options[correctIndex];
      return selectedAnswer === correctOption;
    }

    if (challenge.type === 'regulation_match') {
      return selectedAnswer === challenge.content.correct;
    }

    // For spot_the_breach, check if answer contains key issues
    if (challenge.type === 'spot_the_breach') {
      // This would check against known issues in a real implementation
      return selectedAnswer.toLowerCase().includes('risk') ||
             selectedAnswer.toLowerCase().includes('misleading') ||
             selectedAnswer.toLowerCase().includes('warning');
    }

    return false;
  };

  const completeChallenge = useCallback((success: boolean) => {
    setIsComplete(true);
    const pointsEarned = success ? challenge.points : 0;
    onComplete?.(success, timeSpent, pointsEarned);
  }, [challenge.points, onComplete, timeSpent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isComplete) {
    return (
      <Card className={`border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6 text-center">
          {isCorrect ? (
            <Trophy className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          )}

          <h3 className={`text-lg font-semibold mb-2 ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
            {isCorrect ? 'Excellent Work!' : 'Good Try!'}
          </h3>

          <p className={`mb-4 ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
            {isCorrect
              ? `You earned ${challenge.points} points!`
              : 'Better luck next time. Review the explanation below.'
            }
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                {isCorrect ? challenge.points : 0}
              </div>
              <div className="text-sm text-slate-600">Points Earned</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-slate-600">Time Taken</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Explanation:
            </h4>
            <p className="text-blue-800 text-sm">{challenge.explanation}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showFeedback) {
    return (
      <Card className={`border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6 text-center">
          {isCorrect ? (
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          )}

          <h3 className={`text-xl font-semibold mb-2 ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h3>

          <p className={`text-lg ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
            {isCorrect
              ? `Great job! +${challenge.points} points`
              : 'Review the explanation coming up...'
            }
          </p>

          <div className="mt-4">
            <Progress value={100} className="h-2" />
            <p className="text-sm text-slate-600 mt-2">Completing challenge...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-amber-500" />
            <div>
              <CardTitle className="flex items-center gap-2">
                Daily Risk Spotter
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </CardTitle>
              <CardDescription>Quick compliance challenge</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{challenge.title}</h3>
            <p className="text-slate-600">{challenge.regulatoryArea}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <Clock className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-900">{challenge.timeLimit}s</div>
              <div className="text-xs text-slate-600">Time Limit</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <Target className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-900">{challenge.points}</div>
              <div className="text-xs text-slate-600">Points</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <Star className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-900">{challenge.difficulty}</div>
              <div className="text-xs text-slate-600">Difficulty</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Challenge Type: {challenge.type.replace('_', ' ').toUpperCase()}
            </h4>
            <p className="text-sm text-amber-800">
              {challenge.type === 'spot_the_breach' && 'Identify compliance issues in the content'}
              {challenge.type === 'quick_decision' && 'Make the correct compliance decision'}
              {challenge.type === 'regulation_match' && 'Match the scenario to the correct regulation'}
            </p>
          </div>

          <Button
            onClick={startChallenge}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <Zap className="mr-2 h-4 w-4" />
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderChallengeContent = () => {
    switch (challenge.type) {
      case 'spot_the_breach':
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Review this content:</h4>
              {challenge.content.image && (
                <div className="bg-white border rounded p-3 mb-3">
                  <p className="text-sm text-slate-600 mb-2">Social Media Post:</p>
                  <p className="font-medium">{challenge.content.text}</p>
                </div>
              )}
              <p className="text-sm text-slate-600">{challenge.content.context}</p>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">What compliance issues do you spot?</Label>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_issues" id="no_issues" />
                    <Label htmlFor="no_issues">No issues - content is compliant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="missing_risk_warnings" id="missing_risk" />
                    <Label htmlFor="missing_risk">Missing risk warnings and misleading claims</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minor_issues" id="minor" />
                    <Label htmlFor="minor">Minor formatting issues only</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'quick_decision':
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Scenario:</h4>
              <p className="text-slate-700">{challenge.content.scenario}</p>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">What should you do?</Label>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-2">
                  {challenge.content.options?.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option_${index}`} />
                      <Label htmlFor={`option_${index}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-slate-600">
            Challenge type not supported yet.
          </div>
        );
    }
  };

  return (
    <Card className="border border-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <CardDescription>{challenge.regulatoryArea}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              timeRemaining < 10 ? 'text-red-600 border-red-200 bg-red-50' :
              'text-amber-600 border-amber-200 bg-amber-50'
            }>
              <Clock className="mr-1 h-3 w-3" />
              {formatTime(timeRemaining)}
            </Badge>
            <Badge className="bg-amber-600">
              {challenge.points} pts
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderChallengeContent()}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-slate-500">
            Answer quickly for maximum points!
          </div>

          <Button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
