/**
 * Wizard State Management Hook
 * Handles wizard state, answer updates, and rule evaluation
 */

import { useState, useEffect, useCallback } from 'react';
import { evaluateRules, getVisibleQuestionCodes, calculateProgress } from '@/lib/policies/rules-engine';
import type {
  Question,
  Rule,
  FirmAttributes,
  RulesEngineResult,
  JsonValue,
} from '@/lib/policies/types';

export interface WizardState {
  answers: Record<string, JsonValue>;
  visibleQuestionCodes: string[];
  rulesResult: RulesEngineResult;
  progress: number;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  error: string | null;
}

export interface UseWizardStateOptions {
  policyId: string;
  runId?: string;
  firmId: string;
  questions: Question[];
  rules: Rule[];
  firmAttributes?: FirmAttributes;
  onSave?: (answers: Record<string, JsonValue>, rulesResult: RulesEngineResult) => Promise<void>;
  autoSaveInterval?: number; // milliseconds, default 30000 (30 seconds)
}

export function useWizardState({
  policyId,
  runId,
  firmId,
  questions,
  rules,
  firmAttributes,
  onSave,
  autoSaveInterval = 30000,
}: UseWizardStateOptions) {
  const [answers, setAnswers] = useState<Record<string, JsonValue>>({});
  const [visibleQuestionCodes, setVisibleQuestionCodes] = useState<string[]>([]);
  const [rulesResult, setRulesResult] = useState<RulesEngineResult>({
    included_clauses: [],
    excluded_clauses: [],
    suggested_clauses: [],
    variables: {},
    rules_fired: [],
  });
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize wizard state
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setError(null);

        let combinedAnswers: Record<string, JsonValue> = {};

        // Load firm defaults
        const defaultsResponse = await fetch(`/api/firms/${firmId}/defaults`);
        if (defaultsResponse.ok) {
          const { defaults } = await defaultsResponse.json();
          if (defaults && typeof defaults === 'object') {
            combinedAnswers = { ...defaults };
          }
        }

        // If runId exists, load existing answers
        if (runId) {
          const runResponse = await fetch(`/api/runs/${runId}`);
          if (runResponse.ok) {
            const run = await runResponse.json();
            combinedAnswers = {
              ...combinedAnswers,
              ...(run.answers || {}),
            };
            setLastSavedAt(run.last_saved_at || null);
          }
        }

        setAnswers(combinedAnswers);
      } catch (err) {
        console.error('Error initializing wizard:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize wizard');
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [firmId, runId]);

  // Re-evaluate rules and visibility whenever answers change
  useEffect(() => {
    // Calculate visible questions
    const visible = getVisibleQuestionCodes(questions, answers);
    setVisibleQuestionCodes(visible);

    // Evaluate rules
    const result = evaluateRules(rules, {
      policy_id: policyId,
      answers,
      firm_attributes: firmAttributes,
    });
    setRulesResult(result);

    // Calculate progress
    const prog = calculateProgress(questions, answers, visible);
    setProgress(prog);

    // Mark as having unsaved changes (except during initial load)
    if (!isLoading) {
      setHasUnsavedChanges(true);
    }
  }, [answers, questions, rules, policyId, firmAttributes, isLoading]);

  // Auto-save
  useEffect(() => {
    if (!hasUnsavedChanges || !onSave || isLoading) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        await onSave(answers, rulesResult);
        setLastSavedAt(new Date().toISOString());
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Auto-save failed:', err);
        // Don't set error for auto-save failures
      } finally {
        setIsSaving(false);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, answers, rulesResult, onSave, autoSaveInterval, isLoading]);

  // Update answer
  const updateAnswer = useCallback((questionCode: string, value: JsonValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionCode]: value,
    }));
  }, []);

  // Clear answer
  const clearAnswer = useCallback((questionCode: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionCode];
      return newAnswers;
    });
  }, []);

  // Manual save
  const save = useCallback(async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      setError(null);
      await onSave(answers, rulesResult);
      setLastSavedAt(new Date().toISOString());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [answers, rulesResult, onSave]);

  // Reset wizard
  const reset = useCallback(() => {
    setAnswers({});
    setError(null);
    setHasUnsavedChanges(false);
  }, []);

  const state: WizardState = {
    answers,
    visibleQuestionCodes,
    rulesResult,
    progress,
    isLoading,
    isSaving,
    lastSavedAt,
    error,
  };

  return {
    state,
    updateAnswer,
    clearAnswer,
    save,
    reset,
    hasUnsavedChanges,
  };
}
