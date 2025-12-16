"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  AlertCircle,
  Target,
  Users,
  FileText
} from "lucide-react";
import { BranchingScenario as BranchingScenarioType, DecisionPoint } from "../types";

type DecisionConsequence = DecisionPoint["options"][number]["consequence"];

interface BranchingScenarioProps {
  scenario: BranchingScenarioType;
  onComplete?: (score: number, pathTaken: string[], learningObjectivesMet: Record<string, boolean>) => void;
}

interface ScenarioState {
  currentDecisionId: string | null;
  pathTaken: string[];
  score: number;
  isComplete: boolean;
  consequences: Array<{
    decisionId: string;
    optionId: string;
    consequence: DecisionConsequence;
  }>;
}

export function BranchingScenario({ scenario, onComplete }: BranchingScenarioProps) {
  const [state, setState] = useState<ScenarioState>({
    currentDecisionId: scenario.decisionPoints[0]?.id || null,
    pathTaken: [],
    score: 0,
    isComplete: false,
    consequences: []
  });

  const [showConsequence, setShowConsequence] = useState(false);
  const [currentConsequence, setCurrentConsequence] = useState<DecisionConsequence | null>(null);

  const currentDecision = scenario.decisionPoints.find(dp => dp.id === state.currentDecisionId);
  const progress = (state.pathTaken.length / (scenario.scoring.optimalPath.length || 1)) * 100;

  const calculateFinalScore = useCallback((pathTaken: string[], consequences: ScenarioState["consequences"]) => {
    const isOptimalPath = JSON.stringify(pathTaken) === JSON.stringify(scenario.scoring.optimalPath);
    if (isOptimalPath) return 100;

    const isAcceptablePath = scenario.scoring.acceptablePaths.some(
      path => JSON.stringify(pathTaken) === JSON.stringify(path)
    );
    if (isAcceptablePath) return 75;

    // Calculate partial score based on compliance impact
    let totalScore = 0;
    let totalDecisions = 0;

    consequences.forEach(consequence => {
      totalDecisions++;
      switch (consequence.consequence.complianceImpact) {
        case 'compliant':
          totalScore += 100;
          break;
        case 'risky':
          totalScore += 50;
          break;
        case 'breach':
          totalScore += 0;
          break;
      }
    });

    return totalDecisions > 0 ? Math.round(totalScore / totalDecisions) : 0;
  }, [scenario.scoring]);

  const assessLearningObjectives = useCallback(() => {
    // This would be more sophisticated in a real implementation
    return scenario.scoring.learningObjectivesMet;
  }, [scenario.scoring.learningObjectivesMet]);

  const makeDecision = useCallback((optionId: string) => {
    const decision = scenario.decisionPoints.find(dp => dp.id === state.currentDecisionId);
    const option = decision?.options.find(opt => opt.id === optionId);

    if (!decision || !option) return;

    const newPathTaken = [...state.pathTaken, optionId];
    const newConsequence = {
      decisionId: decision.id,
      optionId: optionId,
      consequence: option.consequence
    };

    setCurrentConsequence(option.consequence);
    setShowConsequence(true);

    setState(prev => ({
      ...prev,
      pathTaken: newPathTaken,
      consequences: [...prev.consequences, newConsequence]
    }));
  }, [state.currentDecisionId, state.pathTaken, scenario.decisionPoints]);

  const continueAfterConsequence = useCallback(() => {
    const decision = scenario.decisionPoints.find(dp => dp.id === state.currentDecisionId);
    const lastChoice = state.pathTaken[state.pathTaken.length - 1];
    const option = decision?.options.find(opt => opt.id === lastChoice);

    if (option?.nextDecision) {
      setState(prev => ({
        ...prev,
        currentDecisionId: option.nextDecision!
      }));
    } else {
      // Scenario complete
      const finalScore = calculateFinalScore(state.pathTaken, state.consequences);
      const learningObjectivesMet = assessLearningObjectives();

      setState(prev => ({
        ...prev,
        isComplete: true,
        score: finalScore
      }));

      onComplete?.(finalScore, state.pathTaken, learningObjectivesMet);
    }

    setShowConsequence(false);
    setCurrentConsequence(null);
  }, [state.consequences, state.currentDecisionId, state.pathTaken, scenario.decisionPoints, onComplete, assessLearningObjectives, calculateFinalScore]);

  const restart = () => {
    setState({
      currentDecisionId: scenario.decisionPoints[0]?.id || null,
      pathTaken: [],
      score: 0,
      isComplete: false,
      consequences: []
    });
    setShowConsequence(false);
    setCurrentConsequence(null);
  };

  const getComplianceColor = (impact: string) => {
    switch (impact) {
      case 'compliant':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'risky':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'breach':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getComplianceIcon = (impact: string) => {
    switch (impact) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'risky':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'breach':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />;
    }
  };

  if (state.isComplete) {
    return (
      <div className="space-y-6">
        <Card className="border border-emerald-200 bg-emerald-50">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">Scenario Complete!</h3>
            <p className="text-emerald-700 mb-4">
              You've completed "{scenario.title}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{state.score}%</div>
                <div className="text-sm text-emerald-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{state.pathTaken.length}</div>
                <div className="text-sm text-emerald-600">Decisions Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {Object.values(scenario.scoring.learningObjectivesMet).filter(Boolean).length}
                </div>
                <div className="text-sm text-emerald-600">Objectives Met</div>
              </div>
            </div>
            <Button onClick={restart} variant="outline" className="mr-2">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>

        {/* Path Analysis */}
        <Card className="border border-slate-100">
          <CardHeader>
            <CardTitle>Decision Path Analysis</CardTitle>
            <CardDescription>Review the decisions you made and their consequences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.consequences.map((item, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getComplianceColor(item.consequence.complianceImpact)}`}>
                  <div className="flex items-start gap-3">
                    {getComplianceIcon(item.consequence.complianceImpact)}
                    <div className="flex-1">
                      <h4 className="font-medium">Decision {index + 1}</h4>
                      <p className="text-sm mt-1">{item.consequence.immediate}</p>
                      <p className="text-sm mt-2 font-medium">Learning Point:</p>
                      <p className="text-sm">{item.consequence.learningPoint}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConsequence && currentConsequence) {
    return (
      <div className="space-y-6">
        {/* Progress */}
        <Card className="border border-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Scenario Progress</h3>
              <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Consequence Display */}
        <Card className={`border ${getComplianceColor(currentConsequence.complianceImpact)}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getComplianceIcon(currentConsequence.complianceImpact)}
              <div>
                <CardTitle>Decision Consequence</CardTitle>
                <CardDescription>See the impact of your choice</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Immediate Impact:</h4>
              <p className="text-slate-700">{currentConsequence.immediate}</p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Long-term Consequence:</h4>
              <p className="text-slate-700">{currentConsequence.downstream}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Point:
              </h4>
              <p className="text-blue-800">{currentConsequence.learningPoint}</p>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={continueAfterConsequence} className="bg-teal-600 hover:bg-teal-700">
                Continue Scenario
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDecision) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Scenario Error</h3>
          <p className="text-red-700">Unable to load the current decision point.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Context */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle className="text-xl">{scenario.title}</CardTitle>
          <CardDescription>Interactive compliance scenario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Situation
              </h4>
              <p className="text-slate-700">{scenario.context.situation}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Your Role
              </h4>
              <p className="text-slate-700">{scenario.context.role}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objective
            </h4>
            <p className="text-slate-700">{scenario.context.objective}</p>
          </div>

          {scenario.context.constraints.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Constraints
              </h4>
              <ul className="space-y-1">
                {scenario.context.constraints.map((constraint, index) => (
                  <li key={index} className="text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="border border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Scenario Progress</h3>
            <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Decision */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Decision Point</CardTitle>
          <CardDescription>Choose your course of action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-slate-800 font-medium">{currentDecision.prompt}</p>
          </div>

          <div className="space-y-3">
            {currentDecision.options.map((option) => (
              <button
                key={option.id}
                onClick={() => makeDecision(option.id)}
                className="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 group-hover:text-teal-800">{option.text}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
                </div>
              </button>
            ))}
          </div>

          {state.pathTaken.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Decisions Made:</h4>
              <div className="flex flex-wrap gap-2">
                {state.pathTaken.map((decision, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {index + 1}. {decision}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
