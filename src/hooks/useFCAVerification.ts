"use client";

import { useState, useCallback, useRef } from "react";
import type { ControlFunctionEntry } from "@/components/fca-register/FCALookup";

export interface FCAVerificationResult {
  status: string;
  lastChecked: string;
  name: string;
  irn: string;
  controlFunctions: ControlFunctionEntry[];
  hasEnforcementHistory: boolean;
}

export function useFCAVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<FCAVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const verifyIndividual = useCallback(async (irn: string) => {
    if (!irn.trim()) {
      setError("IRN is required");
      return null;
    }

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const encodedIrn = encodeURIComponent(irn.trim());
      const [indRes, cfRes] = await Promise.allSettled([
        fetch(`/api/fca-register/individual/${encodedIrn}`, {
          signal: abortController.signal,
        }),
        fetch(`/api/fca-register/individual/${encodedIrn}/control-functions`, {
          signal: abortController.signal,
        }),
      ]);

      // Bail out if aborted or superseded by a newer request
      if (abortController.signal.aborted || abortControllerRef.current !== abortController) return null;

      if (indRes.status !== "fulfilled" || !indRes.value.ok) {
        const data = indRes.status === "fulfilled" ? await indRes.value.json() : null;
        throw new Error(data?.error || "Individual not found on FCA Register");
      }

      const indData = await indRes.value.json();
      const individual = indData.individual;

      let controlFunctions: ControlFunctionEntry[] = [];
      if (cfRes.status === "fulfilled" && cfRes.value.ok) {
        const cfData = await cfRes.value.json();
        controlFunctions = cfData.controlFunctions || [];
      }

      const verificationResult: FCAVerificationResult = {
        status: individual.status,
        lastChecked: new Date().toISOString(),
        name: individual.name,
        irn: individual.irn,
        controlFunctions,
        hasEnforcementHistory: false,
      };

      // Only update state if not aborted and still the active request
      if (!abortController.signal.aborted && abortControllerRef.current === abortController) {
        setResult(verificationResult);
      }
      return verificationResult;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return null;
      }
      const message = err instanceof Error ? err.message : "Verification failed";
      if (!abortController.signal.aborted && abortControllerRef.current === abortController) {
        setError(message);
      }
      return null;
    } finally {
      if (!abortController.signal.aborted && abortControllerRef.current === abortController) {
        setIsVerifying(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setResult(null);
    setError(null);
    setIsVerifying(false);
  }, []);

  return { isVerifying, result, error, verifyIndividual, reset };
}
