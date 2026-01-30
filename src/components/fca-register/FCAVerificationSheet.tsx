"use client";

import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
import { useFCAVerification, type FCAVerificationResult } from "@/hooks/useFCAVerification";

interface FCAVerificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  irn: string;
  onVerified?: (result: FCAVerificationResult) => void;
}

export function FCAVerificationSheet({
  open,
  onOpenChange,
  personName,
  irn,
  onVerified,
}: FCAVerificationSheetProps) {
  const { isVerifying, result, error, verifyIndividual, reset } = useFCAVerification();

  useEffect(() => {
    if (open && irn) {
      reset();
      verifyIndividual(irn);
    }
    return () => {
      // Abort in-flight requests when sheet closes or IRN changes
      reset();
    };
  }, [open, irn, verifyIndividual, reset]);

  const handleSaveVerification = () => {
    if (result) {
      onVerified?.(result);
      onOpenChange(false);
    }
  };

  const isActive = result?.status === "Active" || result?.status === "Authorised";
  const isBanned = result?.status === "Banned";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            FCA Register Verification
          </SheetTitle>
          <SheetDescription>
            Verifying {personName} (IRN: {irn}) against the FCA Register
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isVerifying && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              <p className="text-sm text-slate-600">Looking up individual on FCA Register...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-800">Verification Failed</p>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => verifyIndividual(irn)}
              >
                Retry
              </Button>
            </div>
          )}

          {result && (
            <>
              {/* Status banner */}
              <div
                className={`rounded-lg border p-4 ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50"
                    : isBanned
                    ? "border-rose-200 bg-rose-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isActive ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : isBanned ? (
                    <XCircle className="h-5 w-5 text-rose-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? "text-emerald-800" : isBanned ? "text-rose-800" : "text-amber-800"}`}>
                      {result.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : isBanned
                            ? "bg-rose-100 text-rose-700 border-rose-300"
                            : "bg-amber-100 text-amber-700 border-amber-300"
                        }
                      >
                        {result.status}
                      </Badge>
                      <span className="text-xs text-slate-500">IRN: {result.irn}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Functions */}
              {result.controlFunctions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Active Roles ({result.controlFunctions.length})
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.controlFunctions.map((cf) => (
                      <div
                        key={`${cf.function}-${cf.frn}-${cf.effectiveFrom}`}
                        className="rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-800">{cf.function}</p>
                            <p className="text-xs text-slate-500">{cf.firmName}</p>
                            <p className="text-xs text-slate-400">FRN: {cf.frn}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              cf.status === "Active" || cf.status === "Current"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }
                          >
                            {cf.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          From: {cf.effectiveFrom}
                          {cf.effectiveTo && ` — To: ${cf.effectiveTo}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.controlFunctions.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No active control functions found for this individual.
                </div>
              )}

              {/* Enforcement */}
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  {result.hasEnforcementHistory ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      <p className="text-sm font-medium text-rose-700">Enforcement history found</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <p className="text-sm font-medium text-emerald-700">No enforcement actions on record</p>
                    </>
                  )}
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={handleSaveVerification} disabled={isVerifying}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Verification
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
